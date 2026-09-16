class AuTextarea extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();

    this._id = this.getAttribute('id') || this.generateId();
    this._initialValue = '';
    this._initialValueSet = false;

    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
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
      label[hidden] { display: none; }

      .textarea-container {
        display: flex;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(0.55 0 0));
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
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        
        resize: vertical;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(0.45 0.15 260));
        }

        &:read-only {
          color: var(--au-textarea-readonly-text-color, oklch(0.1398 0 0));
          background-color: var(--au-textarea-readonly-bg, oklch(0.95 0 0));
          cursor: default;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }        
      }
      @media (forced-colors: active) {
        textarea:focus-visible { outline: 2px solid Highlight; outline-offset: -2px; }
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

    // Bind textarea events
    this._bindTextareaEvents();

    textareaContainer.append(this.textarea);
    wrapper.append(this.labelEl, textareaContainer);
    this.shadowRoot.append(style, wrapper);
  }

  _bindTextareaEvents() {
    this.textarea.addEventListener('input', (event) => {
      this._syncFormValue();
      // Preserve native composed events (including IME metadata and trust).
      if (!event.composed) {
        const forwarded = event instanceof InputEvent
          ? new InputEvent('input', {
            bubbles: true, composed: true, data: event.data,
            inputType: event.inputType, isComposing: event.isComposing,
          })
          : new Event('input', { bubbles: true, composed: true });
        this.dispatchEvent(forwarded);
      }
    });

    this.textarea.addEventListener('change', (event) => {
      this._syncFormValue();
      if (!event.composed) this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });
  }

  static get observedAttributes() {
    return ['value', 'placeholder', 'name', 'rows', 'cols', 'disabled', 'readonly', 'required', 'maxlength', 'minlength', 'autocomplete', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid', 'label', 'id'];
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
    if (oldValue === newValue) return;
    if (name === 'label' && this.labelEl) {
      this.labelEl.textContent = newValue;
    } else if (name === 'id') {
      this._id = newValue || this.generateId();
      this.textarea.id = this._id;
      this.labelEl.htmlFor = this._id;
    } else if (name === 'value') {
      this.value = newValue ?? '';
    } else if (!['aria-label', 'aria-labelledby', 'aria-describedby'].includes(name)) {
      if (newValue === null) {
        this.textarea.removeAttribute(name);
      } else {
        this.textarea.setAttribute(name, newValue);
      }
    }
    this._syncControlState();
    this._syncAccessibleReferences();
  }

  connectedCallback() {
    for (const name of ['value', 'name', 'disabled', 'readonly', 'required']) {
      if (Object.hasOwn(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value;
      }
    }
    if (!this._initialValueSet) {
      this._initialValue = this.textarea.value;
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.textarea.value);
    this._syncControlState();
    this._observeExternalReferences();
  }

  get value() {
    return this.textarea.value;
  }

  set value(val) {
    this.textarea.value = val;
    this._syncFormValue();
  }

  formResetCallback() {
    const currentValue = this._initialValue || '';
    const wasFocused = this.shadowRoot.activeElement === this.textarea;

    // 重建 textarea 元素來清除 :user-invalid 狀態
    const newTextarea = this.textarea.cloneNode(false);
    newTextarea.value = currentValue;
    this.textareaContainer.replaceChild(newTextarea, this.textarea);
    this.textarea = newTextarea;

    // 重新綁定事件
    this._bindTextareaEvents();

    // 同步狀態
    this.internals.setFormValue(this.textarea.value);
    this._syncControlState();
    this._syncAccessibleReferences();
    if (wasFocused) this.textarea.focus();
  }

  formStateRestoreCallback(state, mode) {
    if (typeof state === 'string') this.value = state;
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this._syncControlState();
  }

  get name() { return this.getAttribute('name') || ''; }
  set name(value) { this.setAttribute('name', value); }

  get required() { return this.hasAttribute('required'); }
  set required(value) { this.toggleAttribute('required', Boolean(value)); }

  focus(options) { this.textarea.focus(options); }

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

  _syncControlState() {
    this.textarea.disabled = Boolean(this.disabled || this._formDisabled);
    this.textarea.readOnly = this.readonly;
    this._syncValidity();
  }

  _observeExternalReferences() {
    this._referenceObserver?.disconnect();
    this._referenceObserver ??= new MutationObserver(() => this._syncAccessibleReferences());
    this._referenceObserver.observe(this.getRootNode(), {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ['id', 'for', 'aria-label'],
    });
    this._syncAccessibleReferences();
  }

  _syncAccessibleReferences() {
    const root = this.getRootNode();
    const resolve = attribute => (this.getAttribute(attribute) || '').trim()
      .split(/\s+/).filter(Boolean).map(id => root.getElementById?.(id))
      .filter(element => element && element !== this);
    const explicit = this.getAttribute('aria-label');
    let labels = resolve('aria-labelledby');
    if (!labels.length && !explicit && !this.getAttribute('label') && this.isConnected) {
      labels = [...this.internals.labels];
    }
    const descriptions = resolve('aria-describedby');
    this.textarea.removeAttribute('aria-labelledby');
    this.textarea.removeAttribute('aria-describedby');
    if (explicit) this.textarea.setAttribute('aria-label', explicit);
    else this.textarea.removeAttribute('aria-label');
    this.labelEl.hidden = !this.labelEl.textContent;
    if ('ariaLabelledByElements' in this.textarea) {
      this.textarea.ariaLabelledByElements = labels;
    } else if (!explicit && labels.length) {
      this.textarea.setAttribute('aria-label', labels.map(element =>
        element.getAttribute('aria-label') || element.textContent).join(' ').trim());
    }
    if ('ariaDescribedByElements' in this.textarea) {
      this.textarea.ariaDescribedByElements = descriptions;
    } else if (descriptions.length) {
      if (!this._descriptionMirror) {
        this._descriptionMirror = document.createElement('span');
        this._descriptionMirror.id = this.generateId();
        this._descriptionMirror.hidden = true;
        this.shadowRoot.append(this._descriptionMirror);
      }
      this._descriptionMirror.textContent = descriptions.map(element => element.textContent).join(' ').trim();
      this.textarea.setAttribute('aria-describedby', this._descriptionMirror.id);
    }
  }

  disconnectedCallback() {
    this._referenceObserver?.disconnect();
  }

  _syncFormValue() {
    // Reading user edits must not assign back into an active IME composition.
    this.internals.setFormValue(this.textarea.value);
    this._syncValidity();
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
