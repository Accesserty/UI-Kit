/*! Accesserty UI Kit v3.0.0 */
import { defineComponent, ref, watch, h } from 'vue';

// Vue 3 integration: Vue components registered under the custom-element tag
// names, so `<au-input v-model="name">` works in Vue templates, including
// server rendering, where Vue's compiler rejects v-model on custom elements.
// Each wrapper renders the real element, maps the model to the element's own
// property and event, and forwards template-ref access to the element.

const valueOf = el => el.value;

// Vue's own v-model rules for native controls, so au-* fields bind the same way.
// Loose equality as Vue compares checkbox and radio values: same value, same
// string form, or arrays/objects with loosely equal members.
function looseEqual(a, b) {
  if (a === b) return true;
  const objects = a !== null && b !== null && typeof a === 'object' && typeof b === 'object';
  if (!objects) return String(a) === String(b);
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => looseEqual(item, b[i]));
  }
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => looseEqual(a[key], b[key]));
}
// <input type="number"> v-model yields a number when the text parses as one.
const looseToNumber = value => { const number = parseFloat(value); return Number.isNaN(number) ? value : number; };

// Checkbox and switch: a boolean; or, like a native checkbox, an array or Set
// that collects the `value` of each checked box; or true-value / false-value.
const checkable = {
  prop: 'checked', event: 'change', boolean: true,
  checked(model, attrs) {
    const own = attrs.value === undefined ? 'on' : attrs.value;
    if (Array.isArray(model)) return model.some(item => looseEqual(item, own));
    if (model instanceof Set) return [...model].some(item => looseEqual(item, own));
    const trueValue = attrs['true-value'] ?? attrs.trueValue;
    return trueValue === undefined ? !!model : looseEqual(model, trueValue);
  },
  next(el, model, attrs) {
    const own = attrs.value === undefined ? 'on' : attrs.value;
    if (Array.isArray(model)) {
      const others = model.filter(item => !looseEqual(item, own));
      return el.checked ? [...others, own] : others;
    }
    if (model instanceof Set) {
      const next = new Set([...model].filter(item => !looseEqual(item, own)));
      if (el.checked) next.add(own);
      return next;
    }
    if (el.checked) return attrs['true-value'] ?? attrs.trueValue ?? true;
    return attrs['false-value'] ?? attrs.falseValue ?? false;
  },
  omit: ['true-value', 'trueValue', 'false-value', 'falseValue'],
};

// Radio group: the option's own value comes back, so <au-radio :value="2">
// gives the number 2, as a native radio does.
function optionValues(nodes, found = new Map()) {
  for (const node of nodes || []) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'au-radio' && node.props && node.props.value !== undefined) found.set(String(node.props.value), node.props.value);
    if (Array.isArray(node.children)) optionValues(node.children, found);
  }
  return found;
}

// How each form component carries its value.
const models = {
  'au-input': {
    prop: 'value', event: 'input', lazyEvent: 'change', empty: '',
    read: (el, attrs) => attrs.type === 'number' ? looseToNumber(el.value) : el.value,
  },
  'au-textarea': { prop: 'value', event: 'input', lazyEvent: 'change', read: valueOf, empty: '' },
  'au-checkbox': checkable,
  'au-switch': checkable,
  'au-radio-group': { prop: 'value', event: 'change', read: valueOf, empty: null, options: true },
  'au-rating': { prop: 'value', event: 'change', read: el => Number(el.value), empty: 0 },
  // The element owns its File list; writing it back after every change would
  // also clear the validation messages it just announced.
  'au-file-upload': { prop: 'value', event: 'change', read: valueOf, empty: () => [], files: true },
};

const wrappedTags = Object.freeze(Object.keys(models));

/** Use as Vue's `compilerOptions.isCustomElement` (Vite, Nuxt or runtime). */
function isCustomElement(tag) {
  return tag.startsWith('au-') && !Object.hasOwn(models, tag);
}

const sameFiles = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((file, i) => file === b[i]);

// Template refs point at the wrapper; forward properties and methods to the element.
function forwardTo(el) {
  return new Proxy({}, {
    has: (_, key) => !!el.value && key in el.value,
    get: (_, key) => {
      const value = el.value?.[key];
      return typeof value === 'function' ? value.bind(el.value) : value;
    },
    set: (_, key, value) => {
      if (el.value) el.value[key] = value;
      return true;
    },
  });
}

function wrap(tag) {
  const model = models[tag];
  return defineComponent({
    name: tag,
    inheritAttrs: false,
    props: {
      modelValue: { type: null, default: undefined },
      modelModifiers: { type: Object, default: () => ({}) },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, slots, emit, expose }) {
      const el = ref(null);
      expose(forwardTo(el));

      if (model.files) {
        watch(() => props.modelValue, files => {
          if (el.value && Array.isArray(files) && !sameFiles(files, el.value.value)) el.value.value = files;
        });
      }

      let options = new Map();
      const onModel = event => {
        if (event.target !== el.value) return;
        let value;
        if (model.next) value = model.next(el.value, props.modelValue, attrs);
        else if (model.options) value = options.has(el.value.value) ? options.get(el.value.value) : el.value.value;
        else value = model.read(el.value, attrs);
        emit('update:modelValue', value);
      };

      return () => {
        const eventName = props.modelModifiers.lazy && model.lazyEvent ? model.lazyEvent : model.event;
        const data = { ...attrs, ref: el };
        for (const name of model.omit || []) delete data[name];
        const children = slots.default?.();
        if (model.options) options = optionValues(children);
        if (props.modelValue !== undefined && !model.files) {
          // Booleans are presence attributes so server rendering outputs `checked`.
          if (model.boolean) data[model.prop] = model.checked(props.modelValue, attrs) ? '' : null;
          else data[model.prop] = model.options && props.modelValue !== null ? String(props.modelValue) : props.modelValue;
        }
        const handler = 'on' + eventName[0].toUpperCase() + eventName.slice(1);
        const own = attrs[handler];
        data[handler] = own ? [own, onModel].flat() : onModel;
        return h(tag, data, children);
      };
    },
  });
}

const components = Object.freeze(Object.fromEntries(wrappedTags.map(tag => [tag, wrap(tag)])));

/** Vue plugin: `app.use(AccessertyVue)` registers the wrappers globally. */
const AccessertyVue = {
  install(app) {
    for (const [tag, component] of Object.entries(components)) app.component(tag, component);
    // Only affects templates compiled at runtime; build tools need `isCustomElement` in their config.
    app.config.compilerOptions.isCustomElement = isCustomElement;
  },
};

export { AccessertyVue, components, AccessertyVue as default, isCustomElement, wrappedTags };
