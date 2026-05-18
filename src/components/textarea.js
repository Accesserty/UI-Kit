class AuTextarea extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();

    this._id = this.getAttribute('id') || this.generateId();
    this._initialValue = '';
    this._initialValueSet = false;

    const style = document.createElement('style');
    style.textContent = `
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        display: inline-block;
        word-break: break-word;
        margin: var(--au-textarea-label-margin-vertical, 0) var(--au-textarea-label-margin-horizontal, 0);
        padding: var(--au-textarea-label-padding-vertical, 0.625rem) var(--au-textarea-label-padding-horizontal, 0);
        color: var(--au-textarea-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-label-text-size, 1rem);
        font-family: var(--au-textarea-label-text-family);
      }

      .textarea-container {
        display: flex;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        padding: var(--au-textarea-container-padding-vertical, 0.25rem) var(--au-textarea-container-padding-horizontal, 0.25rem);
      }

      textarea {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-textarea-padding-vertical, 0.625rem) var(--au-textarea-padding-horizontal, 1rem);
        color: var(--au-textarea-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-text-size, 1rem);
        font-family: var(--au-textarea-text-family);
        line-height: var(--au-textarea-text-line-height, 1.5);

        border: 0;
        outline: none;
        background-color: var(--au-textarea-bg, oklch(0.994 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        width: 100%;
        
        resize: none;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:read-only {
          color: var(--au-textarea-readonly-text-color, oklch(0.1398 0 0));
          background-color: var(--au-textarea-readonly-bg, oklch(0.95 0 0));
          cursor: default;
          pointer-events: none;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }        
      }
        
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'textarea-wrapper';

    this.labelEl = document.createElement('label');
    this.labelEl.setAttribute('for', this._id);
    this.labelEl.textContent = this.getAttribute('label') || '';

    const textareaContainer = document.createElement('div');
    textareaContainer.className = 'textarea-container';
    this.textareaContainer = textareaContainer;

    this.textarea = document.createElement('textarea');
    this.textarea.id = this._id;

    // 無障礙處理：若沒有 aria-label，使用 label 屬性補上
    const labelAttr = this.getAttribute('label');
    if (labelAttr && !this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
      this.textarea.setAttribute('aria-label', labelAttr);
    }

    // Bind textarea events
    this._bindTextareaEvents();

    textareaContainer.append(this.textarea);
    wrapper.append(this.labelEl, textareaContainer);
    this.shadowRoot.append(style, wrapper);
  }

  _bindTextareaEvents() {
    this.textarea.addEventListener('input', () => {
      this.value = this.textarea.value;
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      this._syncValidity();
    });

    this.textarea.addEventListener('change', () => {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });
  }

  static get observedAttributes() {
    return ['value', 'placeholder', 'name', 'rows', 'cols', 'disabled', 'readonly', 'required', 'maxlength', 'minlength', 'aria-label', 'aria-labelledby', 'label', 'id'];
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'label' && this.labelEl) {
      this.labelEl.textContent = newValue;
      if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
        this.textarea.setAttribute('aria-label', newValue);
      }
    } else if (name === 'id' && newValue) {
      this.textarea.id = newValue;
      this.labelEl?.setAttribute('for', newValue);
    } else if (name === 'value') {
      // 捕捉初始值（第一次設定時）
      if (!this._initialValueSet) {
        this._initialValue = newValue || '';
        this._initialValueSet = true;
      }
      this.textarea.value = newValue;
      this.internals.setFormValue(newValue);
    } else {
      if (newValue === null) {
        this.textarea.removeAttribute(name);
      } else {
        this.textarea.setAttribute(name, newValue);
      }
    }
    this._syncValidity();
  }

  connectedCallback() {
    // 如果還沒設定初始值，從 attribute 或當前值取得
    if (!this._initialValueSet) {
      this._initialValue = this.getAttribute('value') || this.textarea.value || '';
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.textarea.value);
    this._syncValidity();
  }

  get value() {
    return this.textarea.value;
  }

  set value(val) {
    this.textarea.value = val;
    this.internals.setFormValue(val);
    this._syncValidity();
  }

  formResetCallback() {
    const currentValue = this._initialValue || '';

    // 重建 textarea 元素來清除 :user-invalid 狀態
    const newTextarea = this.textarea.cloneNode(false);
    newTextarea.value = currentValue;
    this.textareaContainer.replaceChild(newTextarea, this.textarea);
    this.textarea = newTextarea;

    // 重新綁定事件
    this._bindTextareaEvents();

    // 同步狀態
    this.internals.setFormValue(currentValue);
    this._syncValidity();
  }

  formStateRestoreCallback(state, mode) {
    this.value = state;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
  }

  get readonly() {
    return this.hasAttribute('readonly');
  }

  set readonly(val) {
    val ? this.setAttribute('readonly', '') : this.removeAttribute('readonly');
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-textarea-${byteArray[0].toString(36)}`;
    }
    return `au-textarea-${Math.random().toString(36).slice(2)}`;
  }

  _syncValidity() {
    if (!this.textarea) return;
    if (this.textarea.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(this.textarea.validity, this.textarea.validationMessage, this.textarea);
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-textarea')) {
  customElements.define('au-textarea', AuTextarea);
}