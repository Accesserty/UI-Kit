// Checks repository-owned demo assets and the component/test inventory.
import assert from 'node:assert/strict';
import './css-docs-contract.mjs';
import {readdir, readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const demoFiles = (await readdir(resolve(root, 'demo')))
  .filter(name => name.endsWith('.html'))
  .map(name => resolve(root, 'demo', name));

for (const file of demoFiles) {
  const source = await readFile(file, 'utf8');
  for (const [, rawReference] of source.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)=["']([^"']+)["']/gi)) {
    const reference = rawReference.split(/[?#]/, 1)[0];
    if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
    await readFile(resolve(dirname(file), reference));
  }
}

const components = (await readdir(resolve(root, 'src/components')))
  .filter(name => name.endsWith('.js'))
  .map(name => name.slice(0, -3))
  .sort();
const unitTests = new Set((await readdir(resolve(root, 'test')))
  .filter(name => name.endsWith('.test.js'))
  .map(name => name.replace(/\.test\.js$/, '')));
for (const name of components) assert.ok(unitTests.has(name), `missing unit test for ${name}`);

assert.equal(components.length, 15);
console.log(`PASS docs contract: ${demoFiles.length} demo files, ${components.length} component/unit-test pairs`);
