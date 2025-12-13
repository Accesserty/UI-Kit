class AuTextarea extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();

    this._id = this.getAttribute('id') || this.generateId();

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
        font-family: var(--au-textarea-label-text-family, 'Helvetica, Arial, sans-serif, system-ui');
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
        font-family: var(--au-textarea-text-family, 'Helvetica, Arial, sans-serif, system-ui');
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
      }
        
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'textarea-wrapper';

    this.labelEl = document.createElement('label');
    this.labelEl.setAttribute('for', this._id);
    this.labelEl.textContent = this.getAttribute('label') || '';

    const textareaContainer = document.createElement('div');
    textareaContainer.className = 'textarea-container';


    this.textarea = document.createElement('textarea');
    this.textarea.id = this._id;

    // 無障礙處理：若沒有 aria-label，使用 label 屬性補上
    const labelAttr = this.getAttribute('label');
    if (labelAttr && !this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
      this.textarea.setAttribute('aria-label', labelAttr);
    }

    this.textarea.addEventListener('input', () => {
      this.value = this.textarea.value;
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this._syncValidity();
    });

    this.textarea.addEventListener('change', () => {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    textareaContainer.append(this.textarea);
    wrapper.append(this.labelEl, textareaContainer);
    this.shadowRoot.append(style, wrapper);
  }

  static get observedAttributes() {
    return ['placeholder', 'name', 'rows', 'cols', 'disabled', 'readonly', 'required', 'maxlength', 'minlength', 'aria-label', 'aria-labelledby', 'label', 'id'];
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
    this.value = '';
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-textarea-${byteArray[0].toString(36)}`;
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

customElements.define('au-textarea', AuTextarea);