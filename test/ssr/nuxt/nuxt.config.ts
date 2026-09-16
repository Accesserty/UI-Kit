export default defineNuxtConfig({
 buildDir: new URL('.nuxt', import.meta.url).pathname,
 devtools:{enabled:false}, telemetry:false,
 vue:{compilerOptions:{isCustomElement:tag=>tag.startsWith('au-')}},
 nitro:{preset:'node-server'},
});
