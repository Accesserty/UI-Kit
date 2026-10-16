// Registers the v-model wrappers in every Nuxt app instance (server and client).
import { defineNuxtPlugin } from '#app';
import { AccessertyVue } from './vue.js';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(AccessertyVue);
});
