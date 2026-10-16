import { createApp } from 'vue';
import { AccessertyVue, components, isCustomElement, wrappedTags } from './vendor/accesserty-ui-kit-vue.js';

createApp({}).use(AccessertyVue);
const custom: boolean = isCustomElement('au-card');
const tags: readonly string[] = wrappedTags;
const input = components['au-input'];
void [custom, tags, input];
// @ts-expect-error isCustomElement takes a tag name
isCustomElement(42);

// Checkbox and switch models take the shapes a native checkbox v-model takes.
type Props<C> = C extends new (...args: never) => { $props: infer P } ? P : never;
const checkboxModels: Props<typeof components['au-checkbox']>['modelValue'][] = [true, ['a', 'b'], new Set([1]), 'yes', null];
const radioModels: Props<typeof components['au-radio-group']>['modelValue'][] = ['m', 2, null];
void [checkboxModels, radioModels];
