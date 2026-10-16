/*! Accesserty UI Kit v3.0.0 */
import { fileURLToPath } from 'node:url';
import { isCustomElement } from './accesserty-ui-kit-vue.js';
import 'vue';

// Nuxt module: `modules: ['<path>/accesserty-ui-kit-nuxt.js']` in nuxt.config.
// - tells Vue's compiler which au-* tags are custom elements (the v-model
//   wrappers are Vue components, so they must not be),
// - registers the v-model wrappers for server and client rendering,
// - loads the custom elements in the browser only,
// - inserts declarative shadow roots for au-accordion, au-tabs and
//   au-breadcrumbs into server-rendered pages (option: declarativeShadowDom).
// Plain function module, so the copied dist files need no @nuxt/kit.

const file = name => fileURLToPath(new URL(name, import.meta.url));

function accessertyNuxt(options, nuxt) {
  const compilerOptions = (nuxt.options.vue.compilerOptions ??= {});
  const previous = compilerOptions.isCustomElement;
  // Wrapped tags must stay Vue components even if the project already treats
  // every au-* tag as a custom element.
  compilerOptions.isCustomElement = tag =>
    isCustomElement(tag) || (!tag.startsWith('au-') && !!previous?.(tag));

  nuxt.options.plugins.unshift(
    { src: file('./accesserty-ui-kit-nuxt-plugin.js') },
    { src: file('./accesserty-ui-kit-nuxt-client.js'), mode: 'client' },
  );

  const { declarativeShadowDom = true } = { ...nuxt.options.accesserty, ...options };
  if (declarativeShadowDom) {
    nuxt.options.nitro.plugins ??= [];
    nuxt.options.nitro.plugins.push(file('./accesserty-ui-kit-nuxt-ssr.js'));
  }
}

accessertyNuxt.meta = { name: 'accesserty-ui-kit', configKey: 'accesserty' };

export { accessertyNuxt as default };
