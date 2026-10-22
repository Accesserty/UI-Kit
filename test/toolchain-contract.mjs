// Keep local development, both CI providers and isolated fixtures in step.
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

const packages = await Promise.all(['package.json', 'test/ssr/package.json'].map(json));
const locks = await Promise.all(['package-lock.json', 'test/ssr/package-lock.json'].map(json));
for (let index = 0; index < packages.length; index++) {
  assert.equal(packages[index].engines.node, version);
  assert.equal(packages[index].engines.npm, '>=11.20.0 <12');
  assert.deepEqual(locks[index].packages[''].engines, packages[index].engines);
  assert.deepEqual(locks[index].packages[''].devDependencies, packages[index].devDependencies);
}
assert.equal(packages[1].devDependencies.react, packages[1].devDependencies['react-dom'], 'React and React DOM move together in the fixtures');
// A fixture-pinned Vue older than Nuxt's copy can leave the traced server
// package without its entry file. Keep this test environment on one Vue version.
const fixtureVue = packages[1].devDependencies.vue;
assert.equal(locks[1].packages[''].devDependencies.vue, fixtureVue);
for (const [path, dependency] of Object.entries(locks[1].packages)) {
  if (path.endsWith('node_modules/vue')) {
    assert.equal(dependency.version, fixtureVue, `${path}: duplicate Vue versions in SSR fixtures`);
  }
}
// GitLab's private CI definition is intentionally absent from the public
// GitHub distribution; validate it wherever that definition is shipped.
if (existsSync(new URL('.gitlab-ci.yml', root))) {
  assert.ok((await text('.gitlab-ci.yml')).split('\n').includes(`image: node:${version}-bookworm`));
}
const github = await text('.github/workflows/ci.yml');
assert.equal([...github.matchAll(/^\s+node-version-file: \.nvmrc\s*$/gm)].length, 2);
assert.doesNotMatch(github, /^\s+node-version:/m, 'GitHub jobs must read the shared version file');
console.log(`PASS toolchain contract: Node ${version}, npm 11, two lockfiles and available CI definitions`);
