// Builds one self-contained file per component in dist/components/, for pages
// that need only a few components: <script src="components/tabs.js" defer>.
// Each comes readable (tabs.js) and minified (tabs.min.js); both work the same.
// Each file carries the shared code it imports, so it works on its own, also
// from file:// pages. Files can be combined with each other or with the full
// bundle: every element is defined only once.
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const banner = `/*! Accesserty UI Kit v${pkg.version} */`;

const names = readdirSync('src/components').filter(file => file.endsWith('.js')).map(file => basename(file, '.js'));
for (const name of names) {
  // One build per file: IIFE output cannot share chunks between entries.
  const bundle = await rollup({ input: `src/components/${name}.js` });
  await bundle.write({ file: `dist/components/${name}.js`, format: 'iife', banner });
  // terser keeps the /*! banner, so the version stays traceable.
  await bundle.write({ file: `dist/components/${name}.min.js`, format: 'iife', banner, plugins: [terser()] });
  await bundle.close();
}
console.log(`components: dist/components/{${names.join(',')}}{.js,.min.js}`);
