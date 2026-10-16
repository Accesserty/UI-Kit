// Types for dist/accesserty-ui-kit-vue.js.
import type { DefineComponent, Plugin } from 'vue';

type Model<T> = DefineComponent<{ modelValue?: T; modelModifiers?: Record<string, boolean> }>;
/** Like a native checkbox: a boolean, an array or Set of the checked boxes' values, or true-value / false-value. */
type Checkable = boolean | unknown[] | Set<unknown> | string | number | null;

export declare const wrappedTags: readonly ['au-input', 'au-textarea', 'au-checkbox', 'au-switch', 'au-radio-group', 'au-rating', 'au-file-upload'];

/** Use as Vue's `compilerOptions.isCustomElement` in Vite or Nuxt config. */
export declare function isCustomElement(tag: string): boolean;

export declare const components: Readonly<{
  'au-input': Model<string | number>;
  'au-textarea': Model<string>;
  'au-checkbox': Model<Checkable>;
  'au-switch': Model<Checkable>;
  'au-radio-group': Model<string | number | boolean | null>;
  'au-rating': Model<number>;
  'au-file-upload': Model<File[]>;
}>;

/** `app.use(AccessertyVue)` registers the v-model components globally. */
export declare const AccessertyVue: Plugin;
export default AccessertyVue;

declare module 'vue' {
  interface GlobalComponents {
    'au-input': Model<string | number>;
    'au-textarea': Model<string>;
    'au-checkbox': Model<Checkable>;
    'au-switch': Model<Checkable>;
    'au-radio-group': Model<string | number | boolean | null>;
    'au-rating': Model<number>;
    'au-file-upload': Model<File[]>;
  }
}
