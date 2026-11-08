// Exercise the installed pnpm binary against a loopback-only synthetic registry,
// using this repository's own pnpm-workspace.yaml policy. No real package,
// registry credential or network access beyond 127.0.0.1 is used.
// Run with `pnpm run test:install-policy`.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync, spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';

const binary = process.env.npm_execpath;
assert.ok(binary && existsSync(binary), 'Run pnpm run test:install-policy');
const rootPolicy = readFileSync(new URL('../pnpm-workspace.yaml', import.meta.url), 'utf8');
const fixturePolicy = readFileSync(new URL('./ssr/pnpm-workspace.yaml', import.meta.url), 'utf8');
const name = 'ui-kit-policy-probe';
const OLD = '2020-01-01T00:00:00.000Z';
const LATER = '2020-02-01T00:00:00.000Z';
// A trusted-publisher release as the npm registry describes one. pnpm 12.18
// counts the provenance attestation as the evidence; trustedPublisher alone is
// not enough, and real trusted-publisher releases always carry both.
const trustedPublisher = {name: 'GitHub Actions', email: 'npm-oidc-no-reply@github.com', trustedPublisher: {id: 'github', oidcConfigId: 'probe'}};
const provenance = (base, version) => ({url: `${base}/-/npm/v1/attestations/${name}@${version}`, provenance: {predicateType: 'https://slsa.dev/provenance/v1'}});

function tarball(root, label, manifest) {
  const dir = join(root, label, 'package');
  mkdirSync(dir, {recursive: true});
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest));
  execFileSync('tar', ['-czf', join(root, `${label}.tgz`), '-C', join(root, label), 'package']);
  return readFileSync(join(root, `${label}.tgz`));
}

// versions: [{version, time, trusted, script, exotic}]
async function fixture({policy = rootPolicy, versions, wanted}, exercise) {
  const root = mkdtempSync(join(tmpdir(), 'ui-kit-install-policy-'));
  const marker = join(root, 'install-script-ran');
  const project = join(root, 'project');
  mkdirSync(project);
  const files = new Map();
  const requests = [];
  let base;
  const server = createServer((req, res) => {
    requests.push(req.url);
    if (files.has(req.url)) {
      res.writeHead(200, {'content-type': 'application/octet-stream'});
      res.end(files.get(req.url));
    } else if (req.url === `/${name}`) {
      const time = {created: OLD, modified: versions.at(-1).time};
      const documents = {};
      for (const entry of versions) {
        time[entry.version] = entry.time;
        const manifest = {name, version: entry.version, ...entry.manifest};
        const bytes = files.get(`/${entry.version}.tgz`);
        documents[entry.version] = {...manifest,
          ...(entry.trusted ? {_npmUser: trustedPublisher} : {_npmUser: {name: 'probe', email: 'probe@example.invalid'}}),
          dist: {tarball: `${base}/${entry.version}.tgz`, integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
            ...(entry.trusted ? {attestations: provenance(base, entry.version)} : {})}};
      }
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify({name, 'dist-tags': {latest: versions.at(-1).version}, time, versions: documents}));
    } else {
      res.writeHead(404); res.end('Not a fixture endpoint');
    }
  });
  const children = new Set();
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
    for (const entry of versions) {
      entry.manifest = {
        ...(entry.script ? {scripts: {postinstall: `node -e ${JSON.stringify(`require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran')`)}`}} : {}),
        ...(entry.exotic ? {dependencies: {'ui-kit-policy-hidden': `${base.replace('127.0.0.1', 'localhost')}/hidden.tgz`}} : {}),
      };
      if (entry.exotic) files.set('/hidden.tgz', tarball(root, 'hidden', {name: 'ui-kit-policy-hidden', version: '1.0.0'}));
      files.set(`/${entry.version}.tgz`, tarball(root, `v${entry.version}`, {name, version: entry.version, ...entry.manifest}));
    }
    writeFileSync(join(project, '.npmrc'), `registry=${base}/\n`);
    writeFileSync(join(project, 'pnpm-workspace.yaml'), policy);
    writeFileSync(join(project, 'package.json'), JSON.stringify({name: 'policy-fixture', private: true, dependencies: {[name]: wanted}}));
    const run = (args = ['install', '--no-frozen-lockfile']) => new Promise((resolve, reject) => {
      const env = Object.fromEntries(['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG'].filter(key => process.env[key]).map(key => [key, process.env[key]]));
      const child = spawn(binary, [...args, '--store-dir', join(root, 'store'), '--reporter', 'append-only'],
        {cwd: project, env: {...env, CI: 'true', PNPM_CONFIG_UPDATE_NOTIFIER: 'false'}, stdio: ['ignore', 'pipe', 'pipe']});
      children.add(child);
      let output = '';
      child.stdout.on('data', chunk => { output += chunk; });
      child.stderr.on('data', chunk => { output += chunk; });
      const timer = setTimeout(() => child.kill('SIGKILL'), 20000);
      child.once('error', error => { clearTimeout(timer); children.delete(child); reject(error); });
      child.once('close', (code, signal) => { clearTimeout(timer); children.delete(child); resolve({code, signal, output}); });
    });
    const locked = () => readFileSync(join(project, 'pnpm-lock.yaml'), 'utf8').match(new RegExp(`^  ${name}@([^:]+):`, 'm'))?.[1];
    await exercise({run, marker, project, requests, locked});
  } finally {
    for (const child of children) child.kill('SIGKILL');
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    rmSync(root, {recursive: true, force: true});
  }
}

const exempt = (policy, entry) => policy.replace(/^trustPolicyExclude:\n/m, `trustPolicyExclude:\n  - ${entry}\n`);
assert.match(rootPolicy, /^trustPolicyExclude:\n/m, 'The root policy lists its exact trust exceptions');

for (const [label, policy] of [['root', rootPolicy], ['test/ssr', fixturePolicy]]) {
  test(`${label}: approved policy installs an old package and rejects a changed frozen manifest`, {timeout: 50000}, async () => {
    await fixture({policy, versions: [{version: '1.0.0', time: OLD}], wanted: '1.0.0'}, async ({run, project}) => {
      const first = await run();
      assert.equal(first.code, 0, first.output);
      const lock = readFileSync(join(project, 'pnpm-lock.yaml'), 'utf8');
      const repeated = await run(['install', '--frozen-lockfile']);
      assert.equal(repeated.code, 0, repeated.output);
      assert.equal(readFileSync(join(project, 'pnpm-lock.yaml'), 'utf8'), lock);
      const pkg = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
      pkg.dependencies[name] = '2.0.0';
      writeFileSync(join(project, 'package.json'), JSON.stringify(pkg));
      const changed = await run(['install', '--frozen-lockfile']);
      assert.notEqual(changed.code, 0, changed.output);
      assert.match(changed.output, /OUTDATED_LOCKFILE|out.of.date|frozen.lockfile/i);
    });
  });

  test(`${label}: an unreviewed dependency install script cannot execute`, {timeout: 25000}, async () => {
    await fixture({policy, versions: [{version: '1.0.0', time: OLD, script: true}], wanted: '1.0.0'}, async ({run, marker}) => {
      const result = await run();
      assert.notEqual(result.code, 0, result.output);
      assert.match(result.output, /IGNORED_BUILDS|unreviewed|unapproved|not.*approv/i);
      assert.equal(existsSync(marker), false, 'postinstall must not write its marker');
    });
  });

  test(`${label}: the strict one-day cooldown refuses a just-published package`, {timeout: 25000}, async () => {
    await fixture({policy, versions: [{version: '1.0.0', time: new Date().toISOString()}], wanted: '1.0.0'}, async ({run, project}) => {
      const result = await run();
      assert.notEqual(result.code, 0, result.output);
      assert.match(result.output, /release.age|published|cooldown|NO_MATCHING_VERSION/i);
      // pnpm 12 may start downloading the tarball before the age check ends
      // (about 2 in 10 runs on 12.16.1 and 12.18.0), so assert the outcome
      // that matters: the package is never installed.
      assert.equal(existsSync(join(project, 'node_modules', name)), false, 'fresh package must not be installed');
    });
  });

  test(`${label}: a registry dependency cannot introduce an external tarball dependency`, {timeout: 25000}, async () => {
    await fixture({policy, versions: [{version: '1.0.0', time: OLD, exotic: true}], wanted: '1.0.0'}, async ({run}) => {
      const result = await run();
      assert.notEqual(result.code, 0, result.output);
      assert.match(result.output, /EXOTIC|exotic|non.registry|untrusted/i);
    });
  });

  test(`${label}: a pinned version that lost trusted publishing is refused`, {timeout: 25000}, async () => {
    const versions = [{version: '1.0.0', time: OLD, trusted: true}, {version: '1.0.1', time: LATER}];
    await fixture({policy, versions, wanted: '1.0.1'}, async ({run, project}) => {
      const result = await run();
      assert.notEqual(result.code, 0, result.output);
      assert.match(result.output, /TRUST_DOWNGRADE|trust downgrade/i);
      assert.equal(existsSync(join(project, 'node_modules', name)), false, 'downgraded package must not be installed');
    });
  });
}

// pnpm does not always fail on a trust downgrade: when an older trusted version
// satisfies the range it picks that one. Version-by-version lockfile review is
// therefore part of every dependency change.
test('root: a range falls back to the older trusted version instead of failing', {timeout: 25000}, async () => {
  const versions = [{version: '1.0.0', time: OLD, trusted: true}, {version: '1.0.1', time: LATER}];
  await fixture({versions, wanted: '^1.0.0'}, async ({run, locked}) => {
    const result = await run();
    assert.equal(result.code, 0, result.output);
    assert.equal(locked(), '1.0.0');
  });
});

test('root: an exact exception admits only the listed version', {timeout: 50000}, async () => {
  const versions = [{version: '1.0.0', time: OLD, trusted: true}, {version: '1.0.1', time: LATER}, {version: '1.0.2', time: LATER}];
  const policy = exempt(rootPolicy, `${name}@1.0.1`);
  await fixture({policy, versions, wanted: '1.0.1'}, async ({run, locked}) => {
    const listed = await run();
    assert.equal(listed.code, 0, listed.output);
    assert.equal(locked(), '1.0.1');
  });
  await fixture({policy, versions, wanted: '1.0.2'}, async ({run}) => {
    const other = await run();
    assert.notEqual(other.code, 0, other.output);
    assert.match(other.output, /TRUST_DOWNGRADE|trust downgrade/i);
  });
});
