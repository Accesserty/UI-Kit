class AuInput extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this._id = this.getAttribute('id') || this.generateId();

    const style = document.createElement('style');
    style.textContent = `
    .input-wrapper {
      display: flex;
      align-items: center;
      label {
        word-break: break-word;
      }
      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: oklch(var(--au-input-label-text-color, 13.98% 0 0));
        font-size: var(--au-inpu-label-text-size, 1rem);
      }
      input {
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        margin: 0;
        padding: var(--au-input-padding-vertical, 0.625rem) var(--au-input-padding-horizontal, 1rem);
        color: oklch(var(--au-input-text-color, 13.98% 0 0));
        font-size: var(--au-input-text-size, 1rem);
        border: 0;
        border-radius: var(--au-input-border-radius, 0.25rem);
        outline: none;
        background-color: oklch(var(--au-input-bg, 99.4% 0 0));
        line-height: var(--au-input-text-line-height, 1.5);

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) oklch(var(--au-input-invalid-shadow-color, 57.22% 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) oklch(var(--au-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) oklch(var(--au-input-border-color, 78.94% 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
      }
      .clear-input {
        display: grid;
        place-content: center;

        /* behavior */
        cursor: pointer;
        background-color: oklch(var(--au-input-clear-bg, 99.4% 0 0));
        
        width: 2rem;
        height: 2rem;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) oklch(var(--au-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }

        &:hover {
          background-color: oklch(var(--au-input-clear-hover-bg, 94.66% 0 0));
        }
        
        &:active {
          background-color: oklch(var(--au-input-clear-active-bg, 86.89% 0 0));
        }

        &[hidden] {
          display: none;
        }
      }
      &[data-size="small"] {
        :is(label, input) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.375rem);
        }
      }
      &[data-size="large"] {
        :is(label, input)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 1.625rem);
          font-size: var(--au-input-large-text-size, 1.25rem);
        }
      }
      &[data-layout="vertical"] {
        flex-direction: column;
        align-items: initial;
        label {
          padding-left: 0;
        }
        input {
          flex: 1;
        }
      }
    }
  `;

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    this.wrapper = wrapper;

    this.labelEl = document.createElement('label');
    this.labelEl.setAttribute('for', this._id);
    this.labelEl.textContent = this.getAttribute('label') || '';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    this.prefixSlot = document.createElement('slot');
    this.prefixSlot.name = 'prefix';
    this.prefixSpan = document.createElement('span');
    this.prefixSpan.className = 'prefix';
    this.prefixSpan.appendChild(this.prefixSlot);
    this.prefixSpan.hidden = true;

    this.input = document.createElement('input');
    this.input.id = this._id;
    this.syncAttributes();

    this.clearButton = document.createElement('button');
    this.clearButton.type = 'button';
    this.clearButton.className = 'clear-input';
    this.clearButton.textContent = '✖';
    this.clearButton.hidden = true;
    this.clearButton.setAttribute('part', 'clear');
    this.clearButton.addEventListener('click', () => {
      this.clear();
    });

    this.affixSlot = document.createElement('slot');
    this.affixSlot.name = 'affix';
    this.affixSpan = document.createElement('span');
    this.affixSpan.className = 'affix';
    this.affixSpan.appendChild(this.affixSlot);
    this.affixSpan.hidden = true;

    inputContainer.append(this.prefixSpan, this.input, this.clearButton, this.affixSpan);
    wrapper.append(this.labelEl, inputContainer);
    this.shadowRoot.append(style, wrapper);

    this.input.addEventListener('input', () => {
      this.value = this.input.value;
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this.internals.setFormValue(this.value);
      this._syncValidity();
      this._updateClearButton();
    });

    this.input.addEventListener('change', () => {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    this.prefixSlot.addEventListener('slotchange', () => {
      this.prefixSpan.hidden = this.prefixSlot.assignedNodes().length === 0;
    });

    this.affixSlot.addEventListener('slotchange', () => {
      this.affixSpan.hidden = this.affixSlot.assignedNodes().length === 0;
    });
  }

  static get observedAttributes() {
    return [
      'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'label',
      'min', 'max', 'step', 'pattern', 'autocomplete', 'autofocus', 'inputmode', 'maxlength', 'minlength',
      'data-size', 'data-layout', 'data-clear', 'data-clear-label'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'label' && this.labelEl) {
      this.labelEl.textContent = newValue;
    } else if ((name === 'data-size' || name === 'data-layout') && this.wrapper) {
      if (newValue === null) {
        this.wrapper.removeAttribute(name);
      } else {
        this.wrapper.setAttribute(name, newValue);
      }
    } else if (name === 'data-clear' || name === 'data-clear-label') {
      this._updateClearButton();
    } else if (this.input) {
      if (newValue === null && typeof this.input[name] === 'boolean') {
        this.input[name] = false;
        this.input.removeAttribute(name);
      } else {
        this.input.setAttribute(name, newValue);
        if (typeof this.input[name] === 'boolean') {
          this.input[name] = true;
        }
      }
      this._syncValidity();
    }
  }

  connectedCallback() {
    if (!this._initialValueSet) {
      this._initialValue = this.input.value;
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
  }

  formResetCallback() {
    this.input.value = this._initialValue || '';
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
  }

  get value() {
    return this.input?.value;
  }

  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.setAttribute('value', val);
      this.internals.setFormValue(val);
      this._syncValidity();
      this._updateClearButton();
    }
  }

  /** ✅ 開發者用：清空 input 值 */
  clear() {
    this.input.value = '';
    this.value = '';
    this.internals.setFormValue('');
    this.dispatchEvent(new Event('input', { bubbles: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this._updateClearButton();
  }

  /** ✅ 開發者用：注入建議值 */
  suggest(val = '') {
    this.input.value = val;
    this.value = val;
    this.internals.setFormValue(val);
    this.dispatchEvent(new Event('input', { bubbles: true }));
    this._updateClearButton();
  }

  /** ✅ 開發者用：聚焦 input 欄位 */
  focus() {
    this.input?.focus();
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-input-${byteArray[0].toString(36)}`;
  }

  syncAttributes() {
    Array.from(this.attributes).forEach(attr => {
      if (!['data-size', 'data-layout', 'data-clear', 'data-clear-label'].includes(attr.name)) {
        this.input.setAttribute(attr.name, attr.value);
        if (attr.name === 'value') {
          this.input.defaultValue = attr.value;
        }
      }
    });
  }

  _syncValidity() {
    if (!this.input) return;
    if (this.input.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(this.input.validity, this.input.validationMessage, this.input);
    }
  }

  _updateClearButton() {
    const hasClear = this.hasAttribute('data-clear');
    const hasValue = this.input.value.length > 0;
    const label = this.getAttribute('data-clear-label') || 'Clear input';
    this.clearButton.setAttribute('aria-label', label);
    this.clearButton.hidden = !(hasClear && hasValue);
  }
}

customElements.define('au-input', AuInput);
