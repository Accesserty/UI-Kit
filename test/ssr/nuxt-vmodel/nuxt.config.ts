// Consumer setup as documented: copy dist/ into vendor/ and add the module.
export default defineNuxtConfig({
  buildDir: new URL('.nuxt', import.meta.url).pathname,
  devtools: { enabled: false }, telemetry: false,
  modules: ['./vendor/accesserty-ui-kit-nuxt.js'],
  nitro: { preset: 'node-server' },
});
