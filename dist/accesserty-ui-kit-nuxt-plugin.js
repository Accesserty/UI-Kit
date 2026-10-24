/*! Accesserty UI Kit v3.0.2 */
import { defineNuxtPlugin } from '#app';
import { AccessertyVue } from './accesserty-ui-kit-vue.js';
import 'vue';

// Registers the v-model wrappers in every Nuxt app instance (server and client).

var nuxtPlugin = defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(AccessertyVue);
});

export { nuxtPlugin as default };
