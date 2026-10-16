// React integration: components with React's usual form props for the seven
// au-* form components. Controlled (`value` / `checked`) and uncontrolled
// (`defaultValue` / `defaultChecked`) use, `onChange` with the element as
// `event.target`, and `ref` pointing at the element itself.
// The build adds "use client" so Next.js server components can import them.
import { createElement, useCallback, useEffect, useRef } from 'react';

const readValue = el => el.value;
const writeValue = (el, value) => { el.value = value; };
const readChecked = el => el.checked;
const writeChecked = (el, value) => { el.checked = !!value; };

// How each form component carries its value.
const models = {
  AuInput: { tag: 'au-input', prop: 'value', defaultProp: 'defaultValue', event: 'input', read: readValue, write: writeValue },
  AuTextarea: { tag: 'au-textarea', prop: 'value', defaultProp: 'defaultValue', event: 'input', read: readValue, write: writeValue },
  AuCheckbox: { tag: 'au-checkbox', prop: 'checked', defaultProp: 'defaultChecked', event: 'change', read: readChecked, write: writeChecked, boolean: true },
  AuSwitch: { tag: 'au-switch', prop: 'checked', defaultProp: 'defaultChecked', event: 'change', read: readChecked, write: writeChecked, boolean: true },
  AuRadioGroup: { tag: 'au-radio-group', prop: 'value', defaultProp: 'defaultValue', event: 'change', read: readValue, write: writeValue },
  AuRating: { tag: 'au-rating', prop: 'value', defaultProp: 'defaultValue', event: 'change', read: el => Number(el.value), write: writeValue },
  // Files cannot be server-rendered or set from props; read event.target.value.
  AuFileUpload: { tag: 'au-file-upload', event: 'change' },
};

function assignRef(ref, node) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

function wrap(name, model) {
  function Component(props) {
    const { onChange, ref: forwarded, children, ...rest } = props;
    const controlled = model.prop ? props[model.prop] : undefined;
    const initial = model.defaultProp ? props[model.defaultProp] : undefined;
    if (model.prop) { delete rest[model.prop]; delete rest[model.defaultProp]; }

    const el = useRef(null);
    const latest = useRef({ controlled, onChange });
    latest.current = { controlled, onChange };

    const setRef = useCallback(node => {
      el.current = node;
      assignRef(forwarded, node);
    }, [forwarded]);

    // A controlled value always wins over what the user typed, as with native inputs.
    const restore = () => {
      const { controlled: value } = latest.current;
      if (value !== undefined && el.current && model.read(el.current) !== value) model.write(el.current, value);
    };

    useEffect(() => {
      const node = el.current;
      if (!node) return;
      const listener = event => {
        if (event.target !== node) return;
        latest.current.onChange?.(event);
        if (model.prop) requestAnimationFrame(restore);
      };
      node.addEventListener(model.event, listener);
      return () => node.removeEventListener(model.event, listener);
    }, []);

    useEffect(() => { if (model.prop) restore(); });

    const domProps = { ...rest, ref: setRef };
    const value = controlled !== undefined ? controlled : initial;
    if (model.prop && value !== undefined) {
      // React 19 renders custom-element props as attributes on the server and
      // sets matching properties in the browser.
      domProps[model.prop] = model.boolean ? !!value : value;
    }
    return createElement(model.tag, domProps, children);
  }
  Component.displayName = name;
  return Component;
}

export const AuInput = wrap('AuInput', models.AuInput);
export const AuTextarea = wrap('AuTextarea', models.AuTextarea);
export const AuCheckbox = wrap('AuCheckbox', models.AuCheckbox);
export const AuSwitch = wrap('AuSwitch', models.AuSwitch);
export const AuRadioGroup = wrap('AuRadioGroup', models.AuRadioGroup);
export const AuRating = wrap('AuRating', models.AuRating);
export const AuFileUpload = wrap('AuFileUpload', models.AuFileUpload);

/**
 * Defines the au-* elements in the browser. Call it from a client component
 * effect (the elements cannot be defined during server rendering):
 *   useEffect(() => { defineElements(); }, []);
 */
export function defineElements() {
  return import('./accesserty-ui-kit.js');
}
