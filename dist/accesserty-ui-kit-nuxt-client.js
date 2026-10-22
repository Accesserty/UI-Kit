/*! Accesserty UI Kit v3.0.1 */
import { defineNuxtPlugin } from '#app';
import './accesserty-ui-kit.js';

// Defines the custom elements in the browser. The server only renders their tags.
// Resolves to the component bundle next to this file in dist/.

var nuxtPlugin_client = defineNuxtPlugin(() => {});

export { nuxtPlugin_client as default };
