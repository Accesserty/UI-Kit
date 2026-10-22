// Toolchain upgrades must retain the plain-HTML distribution contract.
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {Script} from 'node:vm';
import config from '../vite.config.js';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(config.build.target, 'es2022');
assert.equal(config.build.minify, false, 'only the explicit minified output uses Terser');
assert.equal(config.build.rolldownOptions.input, './src/accesserty-ui-kit.js');
assert.deepEqual(config.build.rolldownOptions.output.map(output => output.format), ['iife', 'iife']);
assert.equal(config.build.rolldownOptions.output[1].minify, false, 'Terser owns the minified output');
assert.equal(config.build.rolldownOptions.output[1].plugins[0].name, 'terser-final-output',
  'minification follows Rolldown code generation');
const minifier = config.build.rolldownOptions.output[1].plugins[0];
const expectedText = 'line one \n  line two\t ';
const sample = {type: 'chunk', fileName: 'sample.js', code: `globalThis.sample = ${JSON.stringify(expectedText)};`};
await minifier.generateBundle.call({}, {format: 'iife', sourcemap: false}, {'sample.js': sample});
const context = {};
new Script(sample.code).runInNewContext(context);
assert.equal(context.sample, expectedText, 'the final minifier preserves embedded whitespace');
assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0, 'component bundles have no runtime package dependencies');

const components = (await readdir(new URL('src/components/', root)))
  .filter(file => file.endsWith('.js'));
const files = ['dist/accesserty-ui-kit.js', 'dist/accesserty-ui-kit.min.js',
  ...components.flatMap(file => [`dist/components/${file}`, `dist/components/${file.replace(/\.js$/, '.min.js')}`])];
for (const file of files) {
  const source = await readFile(new URL(file, root), 'utf8');
  assert.ok(source.startsWith(`/*! Accesserty UI Kit v${pkg.version}`), `${file}: version banner`);
  // Parsing as a classic script rejects accidental ESM-only output, including
  // static imports and import.meta, without pretending to execute a browser DOM.
  new Script(source, {filename: file});
}
const react = await readFile(new URL('dist/accesserty-ui-kit-react.js', root), 'utf8');
assert.ok(react.startsWith("'use client';\n"), 'React entry retains its client directive');
const nuxt = await readFile(new URL('dist/accesserty-ui-kit-nuxt.js', root), 'utf8');
assert.match(nuxt, /import\.meta\.url/, 'Nuxt integration keeps its module-relative paths');
console.log(`PASS build output: ${files.length} classic scripts, version banners, ES2022 and framework entry boundaries`);
