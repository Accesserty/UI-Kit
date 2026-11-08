// Keep local development, both CI providers and isolated fixtures in step.
// The kit and its SSR fixtures are two independent pnpm projects, each with its
// own pnpm-workspace.yaml (packages: ['.']) and pnpm-lock.yaml.
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const text = async path => readFile(new URL(path, root), 'utf8');
const json = async path => JSON.parse(await text(path));
const version = (await text('.nvmrc')).trim();
assert.match(version, /^\d+\.\d+\.\d+$/, 'pin a complete Node version');
assert.equal((await text('.node-version')).trim(), version);
assert.equal(process.versions.node, version, 'run checks with nvm use first');

const projects = ['', 'test/ssr/'];
const packages = await Promise.all(projects.map(dir => json(`${dir}package.json`)));
const pnpmVersion = packages[0].packageManager?.match(/^pnpm@(\d+\.\d+\.\d+)$/)?.[1];
assert.ok(pnpmVersion, 'pin a complete pnpm version in packageManager');
const userAgent = process.env.npm_config_user_agent;
assert.equal(userAgent?.match(/^pnpm\/([^\s]+)/)?.[1], pnpmVersion, `run checks through pnpm ${pnpmVersion} (got ${userAgent || 'no package manager'})`);

// Top-level keys of a pnpm-workspace.yaml, each with its raw block. The files
// use plain block YAML only, so no YAML library is needed.
function topLevel(source) {
  const keys = new Map();
  let current;
  for (const line of source.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const key = line.match(/^([A-Za-z][\w-]*):(.*)$/);
    if (key) { current = key[1]; assert.equal(keys.has(current), false, `${current} is set twice`); keys.set(current, [key[2].trim()]); }
    else { assert.ok(current && /^\s/.test(line), `unexpected line: ${line}`); keys.get(current).push(line.trim()); }
  }
  return keys;
}
// The last YAML document holds the project graph; with a pinned packageManager
// the first one only records pnpm itself.
function projectGraph(lockfile) {
  const documents = lockfile.split(/^---$/m).filter(part => part.trim());
  assert.equal(documents.length, 2, 'expected the pnpm and project lockfile documents');
  const graph = documents.at(-1);
  const section = name => graph.split(new RegExp(`^${name}:\\s*$`, 'm'))[1]?.split(/^\S/m)[0] ?? '';
  const importer = section('importers').split(/^  \.:\s*$/m)[1] ?? '';
  const devDependencies = {};
  for (const match of importer.matchAll(/^      ('?)([^\s']+)\1:\n        specifier: (.+)\n        version: (.+)$/gm)) {
    devDependencies[match[2]] = match[3].replace(/^'(.*)'$/, '$1');
  }
  const versions = [...section('packages').matchAll(/^  '?((?:@[^/@\s]+\/)?[^@'\s]+)@([^:'(]+)'?:/gm)].map(match => [match[1], match[2]]);
  return {devDependencies, versions, boot: documents[0]};
}

const policy = {
  packages: ['', "- '.'"],
  engineStrict: ['true'],
  pmOnFail: ['error'],
  verifyDepsBeforeRun: ['error'],
  minimumReleaseAge: ['1440'],
  minimumReleaseAgeStrict: ['true'],
  minimumReleaseAgeIgnoreMissingTime: ['false'],
  blockExoticSubdeps: ['true'],
  trustPolicy: ['no-downgrade'],
  trustLockfile: ['false'],
  strictDepBuilds: ['true'],
  allowBuilds: ['', 'esbuild: false', 'fsevents: false'],
};
const rootOnly = {autoInstallPeers: ['false'], trustPolicyExcludePrune: ['true']};

for (const [index, dir] of projects.entries()) {
  const label = dir.replace(/\/$/, '') || 'root';
  const pkg = packages[index];
  assert.equal(pkg.packageManager, `pnpm@${pnpmVersion}`, `${label}: same pnpm in both projects`);
  assert.deepEqual(pkg.engines, {node: version, pnpm: pnpmVersion}, `${label}: engines pin Node and pnpm only`);
  for (const stale of ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock']) {
    assert.equal(existsSync(new URL(`${dir}${stale}`, root)), false, `${label}: remove ${stale}; this project uses pnpm`);
  }
  const settings = topLevel(await text(`${dir}pnpm-workspace.yaml`));
  const expected = {...policy, ...(dir ? {} : rootOnly)};
  for (const [key, value] of Object.entries(expected)) {
    const actual = settings.get(key);
    assert.deepEqual(actual && [actual[0], ...actual.slice(1).sort()], [value[0], ...value.slice(1).sort()], `${label}: ${key}`);
  }
  const extra = [...settings.keys()].filter(key => !(key in expected) && !(key === 'trustPolicyExclude' && !dir));
  assert.deepEqual(extra, [], `${label}: unreviewed pnpm settings`);
  // Exceptions name one exact version each; never a range, union or pattern.
  for (const entry of (settings.get('trustPolicyExclude') ?? ['']).slice(1)) {
    assert.match(entry, /^- (?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*@\d+\.\d+\.\d+(?:-[\w.]+)?$/, `${label}: trust exceptions are exact versions (${entry})`);
  }

  const graph = projectGraph(await text(`${dir}pnpm-lock.yaml`));
  assert.match(graph.boot, new RegExp(`specifier: ${pnpmVersion.replaceAll('.', '\\.')}\\n\\s+version: ${pnpmVersion.replaceAll('.', '\\.')}`), `${label}: lockfile records pnpm ${pnpmVersion}`);
  assert.deepEqual(graph.devDependencies, pkg.devDependencies, `${label}: lockfile importer matches package.json`);
  packages[index].graph = graph;
}

assert.equal(packages[1].devDependencies.react, packages[1].devDependencies['react-dom'], 'React and React DOM move together in the fixtures');
// A fixture-pinned Vue older than Nuxt's copy can leave the traced server
// package without its entry file. Keep this test environment on one Vue version.
const fixtureVue = packages[1].devDependencies.vue;
const vueFamily = /^(?:vue|@vue\/(?:compiler-core|compiler-dom|compiler-sfc|compiler-ssr|reactivity|runtime-core|runtime-dom|server-renderer|shared))$/;
for (const [name, resolved] of packages[1].graph.versions) {
  if (vueFamily.test(name)) assert.equal(resolved, fixtureVue, `test/ssr: ${name}@${resolved} differs from the fixture Vue`);
}
// The optional vue/react peers must not enter the kit's own build environment.
for (const [name, resolved] of packages[0].graph.versions) {
  assert.ok(!vueFamily.test(name) && !/^react(?:-dom)?$/.test(name), `root: optional peer ${name}@${resolved} was installed`);
}

// GitLab's private CI definition is intentionally absent from the public
// GitHub distribution; validate it wherever that definition is shipped.
// Both CI providers install through pnpm only. pnpm hands a literal "--" to the
// script, so script arguments follow the script name directly.
const pnpmOnly = (label, source) => {
  assert.doesNotMatch(source, /\bnpm (?:ci|test|run|exec)\b|\bnpx |--prefix test\/ssr|package-lock\.json/, `${label}: CI still calls npm`);
  assert.doesNotMatch(source, /pnpm run [\w:-]+ -- /, `${label}: pass script arguments without "--"`);
  assert.equal([...source.matchAll(/pnpm (?:--dir test\/ssr )?install --frozen-lockfile/g)].length >= 2, true, `${label}: frozen installs for both projects`);
};
if (existsSync(new URL('.gitlab-ci.yml', root))) {
  const gitlab = await text('.gitlab-ci.yml');
  assert.ok(gitlab.split('\n').includes(`image: node:${version}-bookworm`));
  pnpmOnly('GitLab', gitlab);
  assert.match(gitlab, /packageManager\.replace\(\/\^pnpm@\/, ''\)/, 'GitLab installs the pnpm that package.json pins');
  assert.match(gitlab, /files:\n\s+- pnpm-lock\.yaml\n\s+- test\/ssr\/pnpm-lock\.yaml\n/, 'GitLab caches on both pnpm lockfiles');
}
const github = await text('.github/workflows/ci.yml');
pnpmOnly('GitHub', github);
assert.equal([...github.matchAll(/^\s+node-version-file: \.nvmrc\s*$/gm)].length, 2);
assert.doesNotMatch(github, /^\s+node-version:/m, 'GitHub jobs must read the shared version file');
assert.doesNotMatch(github, /actions\/setup-node/, 'pnpm/setup installs Node from .nvmrc');
const setups = [...github.matchAll(/uses: pnpm\/setup@(\S+)/g)].map(match => match[1]);
assert.equal(setups.length, 2, 'both GitHub jobs use pnpm/setup');
for (const ref of setups) assert.match(ref, /^[0-9a-f]{40}$/, 'pin pnpm/setup by commit');
assert.doesNotMatch(github, /^\s+version: /m, 'pnpm/setup reads the pnpm version from packageManager');
console.log(`PASS toolchain contract: Node ${version}, pnpm ${pnpmVersion}, two pnpm projects, one install policy and available CI definitions`);
