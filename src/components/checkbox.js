class AuCheckbox extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    this.internals = this.attachInternals();
    this.addEventListener('click', event => this._activateFromHost(event));

    // Generate a unique ID for the input element
    const inputID = this.generateId();

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
            opacity: 0.5;
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

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-checkbox-${byteArray[0].toString(36)}`;
    }
    return `au-checkbox-${Math.random().toString(36).slice(2)}`;
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
          if (newValue === null) input.removeAttribute(name);
          else input.setAttribute(name, newValue);
          break;
      }
      this.updateFormValue();
    }
  }

  syncAccessibleLabel() {
    const input = this.inputElement;
    const root = this.getRootNode();
    const resolve = attribute => (this.getAttribute(attribute) || '').trim()
      .split(/\s+/).filter(Boolean).map(id => root.getElementById?.(id))
      .filter(element => element && element !== this);
    const explicit = this.getAttribute('aria-label');
    let labels = resolve('aria-labelledby');
    const hasSlotText = this._labelSlot.assignedNodes({flatten: true})
      .some(node => node.textContent?.trim());
    if (!labels.length && !explicit && !hasSlotText && this.isConnected) {
      labels = [...this.internals.labels];
    }
    const descriptions = resolve('aria-describedby');
    input.removeAttribute('aria-labelledby');
    input.removeAttribute('aria-describedby');
    if (explicit) input.setAttribute('aria-label', explicit);
    else input.removeAttribute('aria-label');
    if ('ariaLabelledByElements' in input) input.ariaLabelledByElements = labels;
    else if (!explicit && labels.length) {
      input.setAttribute('aria-label', labels.map(element =>
        element.getAttribute('aria-label') || element.textContent).join(' ').trim());
    }
    if ('ariaDescribedByElements' in input) input.ariaDescribedByElements = descriptions;
    else if (descriptions.length) {
      if (!this._descriptionMirror) {
        this._descriptionMirror = document.createElement('span');
        this._descriptionMirror.id = this.generateId();
        this._descriptionMirror.hidden = true;
        this.shadowRoot.append(this._descriptionMirror);
      }
      this._descriptionMirror.textContent = descriptions.map(element => element.textContent).join(' ').trim();
      input.setAttribute('aria-describedby', this._descriptionMirror.id);
    }
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
    for (const name of ['checked', 'disabled', 'required', 'name', 'value']) {
      if (Object.hasOwn(this, name)) {
        const value = this[name]; delete this[name]; this[name] = value;
      }
    }
  }

  get name() { return this.getAttribute('name') || ''; }
  set name(value) { this.setAttribute('name', value); }
  get value() { return this.getAttribute('value') ?? 'on'; }
  set value(value) { this.setAttribute('value', value); }
  get required() { return this.hasAttribute('required'); }
  set required(value) { this.toggleAttribute('required', Boolean(value)); }
  get validity() { return this.internals.validity; }
  get validationMessage() { return this.internals.validationMessage; }
  get willValidate() { return this.internals.willValidate; }
  checkValidity() { return this.internals.checkValidity(); }
  reportValidity() { return this.internals.reportValidity(); }
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
