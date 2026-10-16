import accessertyNuxt, { type AccessertyNuxtOptions } from './vendor/accesserty-ui-kit-nuxt.js';

const options: AccessertyNuxtOptions = { declarativeShadowDom: false };
void [accessertyNuxt, options];
// @ts-expect-error unknown option
const wrong: AccessertyNuxtOptions = { shadow: true };
void wrong;
