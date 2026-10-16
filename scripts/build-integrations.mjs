// Builds the framework integrations as plain ES modules next to the bundles in dist/.
// Rollup directly (not Vite's app build) so dynamic imports and directives stay as written.
import { copyFileSync, readdirSync, readFileSync } from 'node:fs';
import { rollup } from 'rollup';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const banner = `/*! Accesserty UI Kit v${pkg.version} */`;

const entries = {
  'accesserty-ui-kit-vue': 'src/integrations/vue.js',
  'accesserty-ui-kit-react': 'src/integrations/react.js',
  'accesserty-ui-kit-nuxt': 'src/integrations/nuxt.js',
  'accesserty-ui-kit-nuxt-plugin': 'src/integrations/nuxt-plugin.js',
  'accesserty-ui-kit-nuxt-client': 'src/integrations/nuxt-plugin.client.js',
  'accesserty-ui-kit-nuxt-ssr': 'src/integrations/nuxt-ssr.js',
  'accesserty-ui-kit-ssr': 'src/ssr/inject.js',
};

const bundle = await rollup({
  input: entries,
  // Frameworks come from the consumer's project; the component bundle is the
  // file next to the integration in dist/.
  external: id => ['vue', 'react', '#app', './accesserty-ui-kit.js', './accesserty-ui-kit-ssr.js'].includes(id) || id.startsWith('node:'),
  // Keep external paths as written: they name files next to the output in dist/.
  makeAbsoluteExternalsRelative: false,
  onwarn(warning, warn) {
    // "use client" is re-added by the banner below.
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    warn(warning);
  },
});
await bundle.write({
  dir: 'dist',
  format: 'es',
  entryFileNames: '[name].js',
  chunkFileNames: '[name].js',
  // Next.js needs the directive before anything else in the module.
  banner: chunk => (chunk.name === 'accesserty-ui-kit-react' ? `'use client';\n${banner}` : banner),
});
await bundle.close();
// Type declarations sit next to the files they describe.
for (const file of readdirSync('src/types')) copyFileSync(`src/types/${file}`, `dist/${file}`);
console.log('integrations:', Object.keys(entries).map(name => `dist/${name}.js`).join(', '));
