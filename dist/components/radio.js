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

  class AuRadioGroup extends AuFormElement {

    constructor() {
      super();
      this.attachShadow({ mode: "open", delegatesFocus: true });

      const style = document.createElement('style');
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      /* The visible group label, like the label au-input draws from \`label\`. */
      .au-radio-group-label {
        display: block;
        margin: 0;
        padding: var(--au-radio-group-label-padding-vertical, 0.625rem) 0;
        color: var(--au-radio-group-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-radio-group-label-text-size, 1rem);
        word-break: break-word;
      }
      .au-radio-group-label[hidden] { display: none; }
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
            opacity: var(--au-radio-disabled-opacity, 0.6);
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
      this.groupName = 'radio-group-name-' + uid();

      const slot = document.createElement('slot');
      slot.style.display = 'none';

      // \`label\` draws this visible group label and names the group by it, in the
      // same shadow root, so the reference works in every engine.
      const groupLabel = document.createElement('div');
      groupLabel.className = 'au-radio-group-label';
      groupLabel.id = uid('radio-group-label-');
      groupLabel.hidden = true;

      container.tabIndex = -1;
      this._container = container;
      this._groupLabel = groupLabel;
      this._slot = slot;
      this._entries = new Map();
      this._value = null;
      this._selectionSet = false;
      slot.addEventListener('slotchange', () => this.renderRadios());
      this.shadowRoot.append(style, groupLabel, container, slot);
    }

    connectedCallback() {
      upgradeProperties(this, ['value', 'name', 'disabled', 'required']);
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
          input.id = 'radio-' + uid();
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
      // Left and right follow the reading direction, as they do for native radios.
      const rtl = getComputedStyle(currentInput).direction === 'rtl';
      const step = {ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1}[event.key];
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
      const labelText = (this.getAttribute('label') || '').trim();
      this._groupLabel.textContent = labelText;
      this._groupLabel.hidden = !labelText;
      // Name precedence: aria-labelledby, then aria-label, then the visible label.
      // Decided by what actually names the group: a dangling aria-labelledby or an
      // empty aria-label must not leave a labelled group without a name.
      const explicit = this.getAttribute('aria-label') || null;
      forwardAria(this, container, { explicit, hasOwnLabel: Boolean(labelText), mirrorPrefix: 'radio-description-' });
      if (labelText && !explicit && !idRefs(this, 'aria-labelledby').length) {
        container.setAttribute('aria-labelledby', this._groupLabel.id);
      }
      container.classList.toggle('au-radio-group--vertical', this.getAttribute('direction') === 'vertical');
      if (this.required) container.setAttribute('aria-required', 'true');
      else container.removeAttribute('aria-required');
      if (this.disabled || this._formDisabled) container.setAttribute('aria-disabled', 'true');
      else container.removeAttribute('aria-disabled');
      // The radios are required too, so they get the same state as the group.
      forwardInvalid(this, container, ...[...this._entries.values()].map(entry => entry.input));
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

  }

  if (typeof customElements !== 'undefined' && !customElements.get('au-radio-group')) {
    customElements.define('au-radio-group', AuRadioGroup);
  }

})();
