/*! Accesserty UI Kit v3.0.3 */
(function () {
  'use strict';

  // Random ids for elements inside a component's shadow root (label targets,
  // aria references). Each root is its own id scope, so collisions only matter
  // within one component; 32 random bits are plenty.
  function uid(prefix = '') {
    return prefix + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  }

  // A property set before the element was defined is stored on the instance
  // and hides the class's accessor. Take it off and assign it again, so the
  // setter runs (and the value is reflected) once the element is upgraded.
  function upgradeProperties(element, names) {
    for (const name of names) {
      if (Object.hasOwn(element, name)) {
        const value = element[name];
        delete element[name];
        element[name] = value;
      }
    }
  }

  // Elements named by an id-reference attribute on the host (aria-labelledby,
  // aria-describedby). They live in the host's tree, not in its shadow root.
  function idRefs(host, attribute) {
    const root = host.getRootNode();
    return (host.getAttribute(attribute) || '').trim().split(/\s+/).filter(Boolean)
      .map(id => root.getElementById?.(id)).filter(element => element && element !== host);
  }

  // Gives the control inside the shadow root the host's accessible name and
  // description: aria-label as is; aria-labelledby, aria-describedby and a
  // <label for> through element references where the browser has them, or as
  // text (a hidden mirror for descriptions) where it does not.
  // - explicit: the name to use as aria-label, if any
  // - hasOwnLabel: the component shows its own label, so a <label for> is not needed
  // - mirrorPrefix: id prefix for the description mirror
  // Safari+VoiceOver announces an untouched required control as "invalid data"
  // from the moment the page loads, because WebKit maps native constraint
  // validity to the invalid state. Unless the host sets aria-invalid, mark the
  // inner controls as not invalid; the application sets aria-invalid="true"
  // when it shows an error. A failed native submit still announces the
  // browser's validation message.
  function forwardInvalid(host, ...targets) {
    const value = host.getAttribute('aria-invalid') ?? 'false';
    for (const target of targets) target?.setAttribute('aria-invalid', value);
  }

  function forwardAria(host, target, { explicit, hasOwnLabel, mirrorPrefix }) {
    let labels = idRefs(host, 'aria-labelledby');
    if (!labels.length && !explicit && !hasOwnLabel && host.isConnected) labels = [...(host.internals.labels || [])];
    const descriptions = idRefs(host, 'aria-describedby');
    target.removeAttribute('aria-labelledby');
    target.removeAttribute('aria-describedby');
    if (explicit) target.setAttribute('aria-label', explicit);
    else target.removeAttribute('aria-label');
    if ('ariaLabelledByElements' in target) target.ariaLabelledByElements = labels;
    else if (!explicit && labels.length) {
      target.setAttribute('aria-label', labels.map(element => element.getAttribute('aria-label') || element.textContent).join(' ').trim());
    }
    if ('ariaDescribedByElements' in target) target.ariaDescribedByElements = descriptions;
    else if (descriptions.length) {
      if (!host._descriptionMirror) {
        host._descriptionMirror = document.createElement('span');
        host._descriptionMirror.id = uid(mirrorPrefix);
        host._descriptionMirror.hidden = true;
        host.shadowRoot.append(host._descriptionMirror);
      }
      host._descriptionMirror.textContent = descriptions.map(element => element.textContent).join(' ').trim();
      target.setAttribute('aria-describedby', host._descriptionMirror.id);
    }
  }

  // Base class of the kit's form controls. It joins the element to its <form>
  // through ElementInternals and exposes the same validity API as native
  // controls. Value, reset, restore and disabled handling stay in each
  // component, because they depend on the kind of value it holds.

  const VALIDITY_FLAGS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort',
    'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput'];

  class AuFormElement extends HTMLElement {
    static formAssociated = true;

    constructor() {
      super();
      const internals = this.attachInternals();
      this.internals = internals;
      // Components report their own validity through internals.setValidity. Keep
      // that report so a custom error (setCustomValidity) can sit on top of it and
      // be removed again without losing it, as on a native control.
      const setValidity = internals.setValidity.bind(internals);
      let own = { flags: {}, message: '', anchor: undefined };
      this._customValidity = '';
      this._applyValidity = () => {
        if (!this._customValidity) { setValidity(own.flags, own.message, own.anchor); return; }
        const flags = { customError: true };
        for (const flag of VALIDITY_FLAGS) if (own.flags[flag]) flags[flag] = true;
        setValidity(flags, this._customValidity, own.anchor || this._validityAnchor());
      };
      internals.setValidity = (flags = {}, message = '', anchor) => {
        own = { flags, message, anchor };
        this._applyValidity();
      };
    }

    get form() { return this.internals.form; }

    get validity() { return this.internals.validity; }
    get validationMessage() { return this.internals.validationMessage; }
    get willValidate() { return this.internals.willValidate; }
    checkValidity() { return this.internals.checkValidity(); }
    reportValidity() { return this.internals.reportValidity(); }

    // As on a native control: a non-empty message makes the field invalid with
    // that message (validity.customError); an empty one removes it. The
    // component's own checks, such as required, keep working underneath.
    setCustomValidity(message) {
      this._customValidity = message == null ? '' : String(message);
      this._applyValidity();
    }

    // Where the browser points (and focuses) when it reports a custom error.
    _validityAnchor() {
      return this.shadowRoot?.querySelector('input:not([type=hidden]), textarea, button, [tabindex]') || undefined;
    }
  }

  class AuCheckbox extends AuFormElement {

    constructor() {
      super();
      this.attachShadow({ mode: "open", delegatesFocus: true });
      this.addEventListener('click', event => this._activateFromHost(event));

      // Generate a unique ID for the input element
      const inputID = uid('au-checkbox-');

      const style = document.createElement('style');
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { max-width: 100%; }
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
        box-sizing: border-box;
        max-width: 100%;
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-checkbox-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          box-sizing: border-box;
          margin: 0;
          flex-shrink: 0;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(0.55 0 0));
          border-radius: var(--au-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-checkbox-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-checkbox-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-checkbox-input-checked-symbol, '✔︎');
              color: var(--au-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
          color: var(--au-checkbox-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-checkbox-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(0.45 0.15 260));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: var(--au-checkbox-disabled-opacity, 0.6);
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-checkbox-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
      @media (forced-colors: active) {
        label input[type="checkbox"] { appearance: auto; }
        label input[type="checkbox"]:checked::before { content: none; }
        label:has(input:focus-visible) { outline: 2px solid Highlight; outline-offset: 2px; }
      }
    `;

      const container = document.createElement('div');
      container.setAttribute('class', 'au-checkbox');

      const label = document.createElement('label');
      label.setAttribute('for', inputID);

      const input = document.createElement('input');
      this.inputElement = input;
      input.type = 'checkbox';
      input.id = inputID;
      // The shadow <input> does not participate in the outer form; submission is
      // driven by the host's `name` + internals.setFormValue(). So mirror the host
      // name (empty when absent, matching native "unnamed control is not
      // submitted") instead of fabricating one, and default the value to native
      // "on" so the element value matches what setFormValue submits.
      input.name = this.getAttribute('name') || '';
      input.value = this.getAttribute('value') ?? 'on';

      const textSlot = document.createElement('div');
      textSlot.setAttribute('class', 'text');
      const slot = document.createElement('slot');
      this._labelSlot = slot;
      slot.addEventListener('slotchange', () => this.syncAccessibleLabel());
      this.labelFallback = document.createElement('span');
      this.labelFallback.textContent = this.getAttribute('label') || '';
      slot.appendChild(this.labelFallback);
      textSlot.appendChild(slot);

      label.append(input, textSlot);
      container.appendChild(label);
      this.shadowRoot.append(style, container);

      input.addEventListener('input', () => { this.checked = input.checked; });
      input.addEventListener('change', (event) => {
        event.stopPropagation();
        this.checked = input.checked;
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: this.checked }));
      });

    }

    _activateFromHost(event) {
      if (event.composedPath()[0] !== this) return;
      // Wait for cancellation on the original host/label click before forwarding.
      queueMicrotask(() => {
        if (!event.defaultPrevented && this.isConnected && !this.inputElement.disabled) {
          this.inputElement.focus();
          this.inputElement.click();
        }
      });
    }

    get checked() {
      return this.shadowRoot.querySelector('input')?.checked ?? false;
    }

    set checked(val) {
      this.toggleAttribute('checked', Boolean(val));
      this.inputElement.checked = Boolean(val);
      this.updateFormValue();
    }

    get disabled() {
      return this.hasAttribute('disabled');
    }

    set disabled(val) {
      val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
    }

    static get observedAttributes() {
      return ['name', 'value', 'checked', 'disabled', 'required', 'label', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      const input = this.shadowRoot.querySelector('input');
      if (input) {
        switch (name) {
          case 'checked':
            input.checked = newValue !== null;
            break;
          case 'disabled':
            input.disabled = this.disabled || Boolean(this._formDisabled);
            break;
          case 'name':
            input.name = newValue ?? '';
            break;
          case 'value':
            input.value = newValue ?? 'on';
            break;
          case 'required':
            input.required = newValue !== null;
            break;
          case 'label':
            if (this.labelFallback) this.labelFallback.textContent = newValue || '';
            this.syncAccessibleLabel();
            break;
          case 'aria-label':
          case 'aria-labelledby':
          case 'aria-describedby':
            this.syncAccessibleLabel();
            break;
          case 'aria-invalid':
            forwardInvalid(this, input);
            break;
        }
        this.updateFormValue();
      }
    }

    syncAccessibleLabel() {
      const hasSlotText = this._labelSlot.assignedNodes({flatten: true}).some(node => node.textContent?.trim());
      forwardAria(this, this.inputElement, { explicit: this.getAttribute('aria-label'), hasOwnLabel: hasSlotText, mirrorPrefix: 'au-checkbox-' });
    }

    _observeLabels() {
      this._labelObserver?.disconnect();
      this._labelObserver ??= new MutationObserver(() => this.syncAccessibleLabel());
      this._labelObserver.observe(this.getRootNode(), {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['id', 'for', 'aria-label'],
      });
      this.syncAccessibleLabel();
    }

    disconnectedCallback() { this._labelObserver?.disconnect(); }

    _upgradeProperties() {
      upgradeProperties(this, ['checked', 'disabled', 'required', 'name', 'value']);
    }

    get name() { return this.getAttribute('name') || ''; }
    set name(value) { this.setAttribute('name', value); }
    get value() { return this.getAttribute('value') ?? 'on'; }
    set value(value) { this.setAttribute('value', value); }
    get required() { return this.hasAttribute('required'); }
    set required(value) { this.toggleAttribute('required', Boolean(value)); }
    focus(options) { this.inputElement.focus(options); }

    formStateRestoreCallback(state) {
      if (state === 'checked' || state === 'unchecked') this.checked = state === 'checked';
    }

    connectedCallback() {
      this._upgradeProperties();
      if (!this._initialCheckedSet) {
        this._initialChecked = this.checked;
        this._initialCheckedSet = true;
      }
      this.inputElement.disabled = this.disabled || Boolean(this._formDisabled);
      forwardInvalid(this, this.inputElement);
      this.updateFormValue();
      this._observeLabels();
    }

    updateCheckedState() {
      this.checked = this.hasAttribute('checked');
    }

    updateFormValue() {
      const input = this.shadowRoot.querySelector('input');
      const value = input.checked ? this.value : null;
      this.internals.setFormValue(value, input.checked ? 'checked' : 'unchecked');

      if (!input.willValidate || input.validity.valid) {
        this.internals.setValidity({});
      } else {
        this.internals.setValidity(input.validity, input.validationMessage, input);
      }
    }

    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      const input = this.shadowRoot.querySelector('input');
      if (input) {
        input.disabled = this.disabled || disabled;
        this.updateFormValue();
      }
    }

    formResetCallback() {
      this.checked = this._initialChecked;
    }
  }

  if (typeof customElements !== 'undefined' && !customElements.get('au-checkbox')) {
    customElements.define('au-checkbox', AuCheckbox);
  }

})();
