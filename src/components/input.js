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
      background: var(--au-input-wrapper-bg, transparent);

      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: var(--au-input-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-label-text-size, 1rem);
        word-break: break-word;
      }
      input {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-input-padding-vertical, 0.625rem) var(--au-input-padding-horizontal, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-text-size, 1rem);
        border: 0;
        border-radius: var(--au-input-border-radius, 0.25rem);
        outline: none;
        background-color: var(--au-input-bg, oklch(0.994 0 0));
        line-height: var(--au-input-text-line-height, 1.5);

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) var(--au-input-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &[type="color"] {
         padding: 0;
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
      }
      .color-code {
        font-family: var(--au-input-font-family, monospace);
        font-size: var(--au-input-text-size, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        user-select: text; /* Allow copying */
      }
      .clear-input {
        display: grid;
        place-content: center;

        /* behavior */
        cursor: pointer;
        background-color: var(--au-input-clear-bg, oklch(0.994 0 0));
        color: var(--au-input-clear-text-color, oklch(0.1398 0 0));

        width: 2rem;
        height: 2rem;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:hover {
          background-color: var(--au-input-clear-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-input-clear-active-bg, oklch(0.8689 0 0));
        }

        &[hidden] {
          display: none;
        }
      }
      &[data-size="small"] {
        :is(label, input, .color-code) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.375rem);
        }
      }
      &[data-size="large"] {
        :is(label, input, .color-code)  {
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

    this.colorCodeSpan = document.createElement('span');
    this.colorCodeSpan.className = 'color-code';
    this.colorCodeSpan.hidden = true;

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

    inputContainer.append(this.prefixSpan, this.input, this.colorCodeSpan, this.clearButton, this.affixSpan);
    wrapper.append(this.labelEl, inputContainer);
    this.shadowRoot.append(style, wrapper);

    this.input.addEventListener('input', () => {
      this.value = this.input.value;
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this.internals.setFormValue(this.value);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
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
      'list', 'data-size', 'data-layout', 'data-clear', 'data-clear-label'
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
    } else if (name === 'list') {
      this._handleListAttribute(newValue);
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
      this._updateColorCode();
    }
  }

  get validity() {
    return this.internals.validity;
  }

  get validationMessage() {
    return this.internals.validationMessage;
  }

  get willValidate() {
    return this.internals.willValidate;
  }

  checkValidity() {
    return this.internals.checkValidity();
  }

  reportValidity() {
    return this.internals.reportValidity();
  }

  connectedCallback() {
    if (!this._initialValueSet) {
      this._initialValue = this.input.value;
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();

    // Attempt to sync list initially (deferred to ensure light DOM is parsed)
    if (this.hasAttribute('list')) {
      requestAnimationFrame(() => {
        this._handleListAttribute(this.getAttribute('list'));
      });
    }
  }

  formResetCallback() {
    this.input.value = this._initialValue || '';
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();
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
      this._updateColorCode();
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
    this._updateColorCode();
  }

  /** ✅ 開發者用：注入建議值 */
  suggest(val = '') {
    this.input.value = val;
    this.value = val;
    this.internals.setFormValue(val);
    this.dispatchEvent(new Event('input', { bubbles: true }));
    this._updateClearButton();
    this._updateColorCode();
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

  _updateColorCode() {
    if (this.input.type === 'color') {
      this.colorCodeSpan.textContent = this.input.value;
      this.colorCodeSpan.hidden = false;
    } else {
      this.colorCodeSpan.hidden = true;
    }
  }

  /**
   * Syncs the external datalist to an internal shadow DOM datalist
   * because list attributes do not cross shadow DOM boundaries.
   */
  _handleListAttribute(listId) {
    if (!this.shadowRoot || !this.input) return;

    // Remove existing internal datalist if any
    const existingDotted = this.shadowRoot.querySelector('datalist');
    if (existingDotted) {
      existingDotted.remove();
    }

    if (!listId) {
      this.input.removeAttribute('list');
      return;
    }

    // Find external datalist in the root node (document or parent shadow root)
    const root = this.getRootNode();
    const externalDatalist = root instanceof Document || root instanceof ShadowRoot
      ? root.getElementById(listId)
      : document.getElementById(listId);

    if (externalDatalist && externalDatalist.tagName === 'DATALIST') {
      // Create internal datalist
      const internalDatalist = document.createElement('datalist');
      internalDatalist.id = listId; // Use same ID, scoped to shadow root

      // Clone options
      // Note: We clone the children deep to get options
      Array.from(externalDatalist.options).forEach(opt => {
        internalDatalist.appendChild(opt.cloneNode(true));
      });

      this.shadowRoot.appendChild(internalDatalist);
      this.input.setAttribute('list', listId);

      // Optional: Observer for changes in external datalist could be added here
      // for full reactivity, but simple clone is often sufficient for static lists.
    } else {
      // If not found, just pass the attribute anyway (maybe it will exist later?)
      // But purely inside shadow DOM, it won't resolve to outer ID.
      // We accept that limitation for now if not found immediately.
      this.input.setAttribute('list', listId);
    }
  }
}

customElements.define('au-input', AuInput);
