class AuRadioGroup extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    this.internals = this.attachInternals();

    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .au-radio-group {
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.625rem;
      }
      .au-radio-group--vertical {
        flex-direction: column;
        label {
          width: fit-content;
          max-width: 100%;
        }
      }
      label {
        cursor: pointer;
        box-sizing: border-box;
        max-width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--au-radio-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          flex-shrink: 0;
          box-sizing: border-box;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) var(--au-radio-input-border-color, oklch(0.55 0 0));
          border-radius: 50%;
          background-color: var(--au-radio-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-radio-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: var(--au-radio-input-checked-circle-color, oklch(0.994 0 0));
            }
          }
        }
        .text {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
          color: var(--au-radio-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-radio-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) var(--au-radio-input-focus-shadow-color, oklch(0.45 0.15 260));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-radio-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
      @media (forced-colors: active) {
        label input[type="radio"] { appearance: auto; }
        label input[type="radio"]:checked::before { content: none; }
        label:has(input:focus-visible), .au-radio-group:focus-visible {
          outline: 2px solid Highlight; outline-offset: 2px;
        }
      }
      .au-radio-group:focus-visible { outline: 2px solid var(--au-radio-input-focus-shadow-color, oklch(0.45 0.15 260)); }
    `;

    const container = document.createElement('div');
    container.setAttribute('class', 'au-radio-group');
    container.setAttribute('role', 'radiogroup');

    // Generate a unique name for the radio group
    this.groupName = 'radio-group-name-' + this.generateId();

    const slot = document.createElement('slot');
    slot.style.display = 'none';

    container.tabIndex = -1;
    this._container = container;
    this._slot = slot;
    this._entries = new Map();
    this._value = null;
    this._selectionSet = false;
    slot.addEventListener('slotchange', () => this.renderRadios());
    this.shadowRoot.append(style, container, slot);
  }

  connectedCallback() {
    for (const name of ['value', 'name', 'disabled', 'required']) {
      if (Object.hasOwn(this, name)) {
        const value = this[name]; delete this[name]; this[name] = value;
      }
    }
    this._mutationObserver ??= new MutationObserver(records => {
      // An explicit checked mutation is an instruction; label/locale updates are not.
      for (const record of records) {
        if (record.attributeName !== 'checked' || !this._entries.has(record.target)) continue;
        if (record.target.hasAttribute('checked')) {
          this._selectedSource = record.target;
          this._selectionSet = true;
        } else if (this._selectedSource === record.target) {
          this._selectedSource = null;
          this._value = null;
          this._selectionSet = true;
        }
      }
      this.renderRadios();
    });
    this._mutationObserver.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['label', 'value', 'checked', 'disabled', 'lang'],
    });
    this._referenceObserver ??= new MutationObserver(() => this.updateGroupAttributes());
    this._referenceObserver.observe(this.getRootNode(), {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['id', 'for', 'aria-label'],
    });
    this.renderRadios();
  }

  disconnectedCallback() {
    this._mutationObserver?.disconnect();
    this._referenceObserver?.disconnect();
  }

  renderRadios() {
    const focused = this.shadowRoot.activeElement;
    const hadFocus = focused && this._container.contains(focused);
    const sources = this._slot.assignedElements();
    const entries = new Map();
    sources.forEach((source, index) => {
      let entry = this._entries.get(source);
      if (!entry) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = 'radio-' + this.generateId();
        input.name = this.groupName;
        label.htmlFor = input.id;
        const text = document.createElement('div');
        text.className = 'text';
        label.append(input, text);
        entry = {source, label, input, text};
        input.addEventListener('input', () => {
          if (input.checked) {
            this._selectedSource = source;
            this._value = input.value;
            this._selectionSet = true;
            this._syncSelection();
          }
        });
        input.addEventListener('change', event => this.handleChange(event, input));
        input.addEventListener('keydown', event => this.handleKeyDown(event, input));
      }
      entry.input.value = source.getAttribute('value') ?? `radio-${index + 1}`;
      entry.input.disabled = this.disabled || Boolean(this._formDisabled) || source.hasAttribute('disabled');
      entry.input.required = this.required;
      entry.text.textContent = source.getAttribute('label') || source.textContent.trim();
      if (source.hasAttribute('lang')) entry.text.setAttribute('lang', source.getAttribute('lang'));
      else entry.text.removeAttribute('lang');
      entries.set(source, entry);
    });
    for (const [source, entry] of this._entries) {
      if (!entries.has(source)) entry.label.remove();
    }
    this._entries = entries;
    let index = 0;
    for (const entry of entries.values()) {
      if (this._container.children[index] !== entry.label) {
        this._container.insertBefore(entry.label, this._container.children[index] || null);
      }
      index++;
    }
    if (!this._selectionSet && entries.size) {
      this._selectedSource = sources.filter(source => source.hasAttribute('checked')).at(-1) || null;
      this._selectionSet = true;
    }
    this._syncSelection();
    if (!this._initialValueSet && entries.size) {
      this._initialValue = this._value;
      this._initialValueSet = true;
    }
    this.updateGroupAttributes();
    if (hadFocus) {
      const stillEnabled = [...entries.values()].some(entry => entry.input === focused && !entry.input.disabled);
      if (stillEnabled && this.shadowRoot.activeElement !== focused) focused.focus();
      else if (!stillEnabled) this.focus();
    }
  }

  _syncSelection() {
    let selected = this._entries.get(this._selectedSource);
    if (!selected && this._value !== null) {
      selected = [...this._entries.values()].find(entry => entry.input.value === this._value);
    }
    this._selectedSource = selected?.source || null;
    if (selected) this._value = selected.input.value;
    const enabled = [...this._entries.values()].filter(entry => !entry.input.disabled);
    const tabStop = selected && !selected.input.disabled ? selected : enabled[0];
    for (const entry of this._entries.values()) {
      entry.input.checked = entry === selected;
      entry.input.tabIndex = entry === tabStop ? 0 : -1;
    }
    this.internals.setFormValue(
      selected && !selected.input.disabled ? selected.input.value : null,
      JSON.stringify({value: this._value}),
    );
    const anchor = enabled[0]?.input;
    if (!anchor || !anchor.willValidate || anchor.validity.valid) this.internals.setValidity({});
    else this.internals.setValidity(anchor.validity, anchor.validationMessage, anchor);
  }

  handleChange(event, input) {
    event.stopPropagation();
    const entry = [...this._entries.values()].find(entry => entry.input === input);
    if (!entry || !input.checked || input.disabled) return;
    this._selectedSource = entry.source;
    this._value = input.value;
    this._selectionSet = true;
    this._syncSelection();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true, detail: {value: input.value},
    }));
  }

  handleKeyDown(event, currentInput) {
    const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
    if (!step || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const enabled = [...this._entries.values()].map(entry => entry.input).filter(input => !input.disabled);
    if (!enabled.length || currentInput.disabled) return;
    const current = enabled.indexOf(currentInput);
    if (current < 0) return;
    const next = enabled[(current + step + enabled.length) % enabled.length];
    next.focus();
    if (next !== currentInput || !next.checked) next.click();
  }

  static get observedAttributes() {
    return ['name', 'value', 'disabled', 'required', 'direction', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid', 'label'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'value') this.value = newValue;
    else if (name === 'disabled' || name === 'required') this.renderRadios();
    else {
      this._syncSelection();
      this.updateGroupAttributes();
    }
  }

  updateGroupAttributes() {
    const container = this._container;
    const root = this.getRootNode();
    const resolve = attribute => (this.getAttribute(attribute) || '').trim().split(/\s+/)
      .filter(Boolean).map(id => root.getElementById?.(id)).filter(element => element && element !== this);
    const explicit = this.getAttribute('aria-label') || this.getAttribute('label');
    let labels = resolve('aria-labelledby');
    if (!labels.length && !explicit && this.isConnected) labels = [...(this.internals.labels || [])];
    const descriptions = resolve('aria-describedby');
    container.removeAttribute('aria-labelledby');
    container.removeAttribute('aria-describedby');
    if (explicit) container.setAttribute('aria-label', explicit);
    else container.removeAttribute('aria-label');
    if ('ariaLabelledByElements' in container) container.ariaLabelledByElements = labels;
    else if (!explicit && labels.length) {
      container.setAttribute('aria-label', labels.map(element => element.getAttribute('aria-label') || element.textContent).join(' ').trim());
    }
    if ('ariaDescribedByElements' in container) container.ariaDescribedByElements = descriptions;
    else if (descriptions.length) {
      if (!this._descriptionMirror) {
        this._descriptionMirror = document.createElement('span');
        this._descriptionMirror.id = 'radio-description-' + this.generateId();
        this._descriptionMirror.hidden = true;
        this.shadowRoot.append(this._descriptionMirror);
      }
      this._descriptionMirror.textContent = descriptions.map(element => element.textContent).join(' ').trim();
      container.setAttribute('aria-describedby', this._descriptionMirror.id);
    }
    container.classList.toggle('au-radio-group--vertical', this.getAttribute('direction') === 'vertical');
    if (this.required) container.setAttribute('aria-required', 'true');
    else container.removeAttribute('aria-required');
    if (this.disabled || this._formDisabled) container.setAttribute('aria-disabled', 'true');
    else container.removeAttribute('aria-disabled');
    if (this.hasAttribute('aria-invalid')) container.setAttribute('aria-invalid', this.getAttribute('aria-invalid'));
    else container.removeAttribute('aria-invalid');
  }

  get value() { return this._entries.get(this._selectedSource)?.input.value ?? null; }
  set value(value) {
    this._value = value == null ? null : String(value);
    this._selectedSource = null;
    this._selectionSet = true;
    this._syncSelection();
  }
  get name() { return this.getAttribute('name') || ''; }
  set name(value) { this.setAttribute('name', value); }
  get required() { return this.hasAttribute('required'); }
  set required(value) { this.toggleAttribute('required', Boolean(value)); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }
  get validity() { return this.internals.validity; }
  get validationMessage() { return this.internals.validationMessage; }
  get willValidate() { return this.internals.willValidate; }
  checkValidity() { return this.internals.checkValidity(); }
  reportValidity() { return this.internals.reportValidity(); }

  focus(options) {
    const inputs = [...this._entries.values()].map(entry => entry.input);
    const target = inputs.find(input => input.tabIndex === 0 && !input.disabled);
    (target || this._container).focus(options);
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this.renderRadios();
  }

  formResetCallback() { this.value = this._initialValue ?? null; }

  formStateRestoreCallback(state) {
    if (typeof state !== 'string') return;
    try {
      const restored = JSON.parse(state);
      if (restored && (restored.value === null || typeof restored.value === 'string')) this.value = restored.value;
    } catch { /* Ignore unrecognized state rather than treating it as an option. */ }
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `${byteArray[0].toString(36)}`;
    }
    return Math.random().toString(36).slice(2);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-radio-group')) {
  customElements.define('au-radio-group', AuRadioGroup);
}
