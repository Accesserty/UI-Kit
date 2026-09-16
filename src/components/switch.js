class AuSwitch extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.internals = this.attachInternals();
    this.addEventListener('click', event => this._activateFromHost(event));

    const inputID = this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { max-width: 100%; }
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        box-sizing: border-box;
        max-width: 100%;
        overflow-wrap: anywhere;
        align-items: center;
        gap: var(--au-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--au-switch-padding-top, 0.625rem);
        padding-right: var(--au-switch-padding-right, 0.25rem);
        padding-bottom: var(--au-switch-padding-bottom, 0.625rem);
        padding-left: var(--au-switch-padding-left, 0);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        &:hover {
          text-decoration: underline;
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(0.45 0.15 260));
        } 
        &:has(input:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
          text-decoration: none;
        } 
      }
      .container {
        display: flex;
        flex-wrap: wrap;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
      }
      .input {
        position: relative;
        flex-shrink: 0;
        &:before {
          content: '';
          display: block;
          width: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          height: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          background-color: var(--au-switch-inner-bg, oklch(0.55 0 0));
          pointer-events: none;
          position: absolute;
          top: var(--au-switch-inner-distance, 0.25rem);
          inset-inline-start: var(--au-switch-inner-distance, 0.25rem);
          border-radius: var(--au-switch-inner-border-radius, calc((var(--au-switch-input-width, 4rem) / 2 - var(--au-switch-inner-distance, 0.25rem)) / 2));
          transition: background-color 360ms ease-in, inset-inline-start 240ms ease-in;
        }
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          margin: 0;
          box-sizing: border-box;
          display: block;
          width: var(--au-switch-input-width, 4rem);
          height: calc(var(--au-switch-input-width, 4rem) / 2);
          border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(0.55 0 0));
          background-color: var(--au-switch-input-bg, oklch(0.994 0 0));
          border-radius: var(--au-switch-input-border-radius, calc(var(--au-switch-input-width, 4rem) / 4));
          transition: background-color 360ms ease-in;
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
        }
        &:has(input[type="checkbox"]:checked) input[type="checkbox"] {
          background-color: var(--au-switch-input-checked-bg, oklch(0.1398 0 0));
        }
        &:has(input[type="checkbox"]:checked):before {
          background-color: var(--au-switch-inner-checked-bg, oklch(0.994 0 0));
          inset-inline-start: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .input::before, .input input[type="checkbox"] { transition: none; }
      }
      @media (forced-colors: active) {
        .input input[type="checkbox"] { forced-color-adjust: none; background-color: Canvas; border-color: ButtonText; }
        .input::before { forced-color-adjust: none; background-color: CanvasText; }
        .input:has(input:checked) input[type="checkbox"] { background-color: Highlight; }
        .input:has(input:checked)::before { background-color: HighlightText; }
        .au-switch:has(input:focus-visible) { outline: 2px solid Highlight; outline-offset: 2px; }
      }
     
    `;

    const switchElement = document.createElement('label');
    switchElement.classList.add('au-switch');
    switchElement.setAttribute('for', inputID);

    const container = document.createElement('div');
    container.classList.add('container');

    const offTextSpan = document.createElement('span');
    offTextSpan.classList.add('off-text');
    offTextSpan.setAttribute('aria-hidden', 'true');

    const inputDiv = document.createElement('div');
    inputDiv.classList.add('input');
    this.inputElement = document.createElement('input');
    this.inputElement.id = inputID;
    this.inputElement.type = 'checkbox';
    this.inputElement.value = this.getAttribute('value') ?? 'on';
    this.inputElement.setAttribute('role', 'switch');
    this.inputElement.setAttribute('aria-checked', 'false');
    inputDiv.appendChild(this.inputElement);

    const onTextSpan = document.createElement('span');
    onTextSpan.classList.add('on-text');
    onTextSpan.setAttribute('aria-hidden', 'true');

    container.append(offTextSpan, inputDiv, onTextSpan);
    switchElement.append(container);
    this.shadowRoot.append(style, switchElement);

    const slot = document.createElement('slot');
    this._labelSlot = slot;
    slot.addEventListener('slotchange', () => this.syncAccessibleLabel());
    this.labelFallback = document.createElement('span');
    this.labelFallback.textContent = this.getAttribute('label') || '';
    slot.appendChild(this.labelFallback);
    switchElement.prepend(slot);

    this.inputElement.addEventListener('input', () => { this.checked = this.inputElement.checked; });
    this.inputElement.addEventListener('change', (event) => {
      event.stopPropagation();
      this.checked = this.inputElement.checked;
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
    return this.inputElement?.checked ?? false;
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

  formResetCallback() {
    this.checked = this._initialChecked;
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-switch-${byteArray[0].toString(36)}`;
    }
    return `au-switch-${Math.random().toString(36).slice(2)}`;
  }

  static get observedAttributes() {
    return ['name', 'value', 'checked', 'disabled', 'required', 'off', 'on', 'label', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    const input = this.shadowRoot.querySelector('input');
    const offText = this.shadowRoot.querySelector('.off-text');
    const onText = this.shadowRoot.querySelector('.on-text');

    if (!input || !offText || !onText) return;

    switch (name) {
      case 'checked':
        input.checked = newValue !== null;
        input.setAttribute('aria-checked', input.checked.toString());
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
      case 'off':
        offText.textContent = newValue || '';
        break;
      case 'on':
        onText.textContent = newValue || '';
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
      default:
        if (newValue === null) {
          input.removeAttribute(name);
        } else {
          input.setAttribute(name, newValue);
        }
        break;
    }
    this.updateFormValue();
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
    const input = this.shadowRoot.querySelector('input');
    const offText = this.shadowRoot.querySelector('.off-text');
    const onText = this.shadowRoot.querySelector('.on-text');

    input.setAttribute('aria-checked', input.checked.toString());

    if (this.hasAttribute('off')) {
      offText.textContent = this.getAttribute('off');
    } else {
      offText.textContent = '';
    }

    if (this.hasAttribute('on')) {
      onText.textContent = this.getAttribute('on');
    } else {
      onText.textContent = '';
    }

    input.disabled = this.disabled || Boolean(this._formDisabled);
    this.updateFormValue();
    this._observeLabels();
  }

  updateFormValue() {
    const input = this.inputElement;
    input.setAttribute('aria-checked', String(input.checked));
    this.internals.setFormValue(input.checked ? this.value : null, input.checked ? 'checked' : 'unchecked');
    if (!input.willValidate || input.validity.valid) this.internals.setValidity({});
    else this.internals.setValidity(input.validity, input.validationMessage, input);
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this.inputElement.disabled = this.disabled || disabled;
    this.updateFormValue();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-switch')) {
  customElements.define('au-switch', AuSwitch);
}
