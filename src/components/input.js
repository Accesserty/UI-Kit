class AuInput extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();
    this._id = this.getAttribute('id') || this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
    :host {
      display: block;
      container-type: inline-size;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: var(--au-input-wrapper-bg, transparent);
      container-type: inline-size;
      min-width: 0;

      @container (width < 768px) {
        flex-direction: column;
        align-items: flex-start;
      }

      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: var(--au-input-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-label-text-size, 1rem);
        word-break: break-word;
        @container (width < 768px) {
          padding-left: 0;
        }
      }
      label[hidden] { display: none; }

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
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.45 0.15 260));
        }

        &[type="color"] {
         padding: 0;
        }

        @container (width < 768px) {
          width: 100%;
          box-sizing: border-box;
        }
      }
      .input-container {
        display: flex;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.55 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
        /* prefix/affix 不可被壓縮;窄容器時優先維持同一行,由 input 彈性縮小。
           只有在放不下「可用寬度的輸入框」時才換行,避免 input 被擠到幾乎為零、
           內容溢出元件(WCAG 1.4.10)。 */
        .prefix, .affix {
          flex-shrink: 0;
          max-inline-size: 100%;
        }
        @container (width < 768px) {
          flex-wrap: wrap;
          input {
            flex: 1 1 8rem;
            min-width: 0;
          }
          /* A colour swatch keeps its own width; stretching it would push the
             colour code onto a second line. */
          input[type="color"] {
            flex: 0 0 auto;
            inline-size: 3.125rem;
          }
        }
      }
      .color-code {
        font-family: var(--au-input-text-family);
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
        flex-shrink: 0;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.45 0.15 260));
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
          @container (width < 768px) {
            padding-left: 0;
          }
        }
      }
      &[data-size="large"] {
        :is(label, input, .color-code)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 1.625rem);
          font-size: var(--au-input-large-text-size, 1.25rem);
          @container (width < 768px) {
            padding-left: 0;
          }
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
    @media (forced-colors: active) {
      input:focus-visible, .clear-input:focus-visible { outline: 2px solid Highlight; outline-offset: -2px; }
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
    this.inputContainer = inputContainer;

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

    // Bind input events
    this._bindInputEvents();

    this.prefixSlot.addEventListener('slotchange', () => {
      this.prefixSpan.hidden = this.prefixSlot.assignedNodes().length === 0;
    });

    this.affixSlot.addEventListener('slotchange', () => {
      this.affixSpan.hidden = this.affixSlot.assignedNodes().length === 0;
    });
  }

  /** 綁定 input 事件（抽出方法以便 formResetCallback 重用） */
  _bindInputEvents() {
    this.input.addEventListener('input', (event) => {
      this.value = this.input.value;
      // Native composed events already cross Shadow DOM. Preserve their identity,
      // trust and composition metadata; bridge only explicitly non-composed events.
      if (!event.composed) {
        const forwarded = event instanceof InputEvent
          ? new InputEvent('input', {bubbles:true,composed:true,data:event.data,inputType:event.inputType,isComposing:event.isComposing})
          : new Event('input', {bubbles:true,composed:true});
        this.dispatchEvent(forwarded);
      }
    });

    this.input.addEventListener('change', (event) => {
      this.value = this.input.value;
      if (!event.composed) this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });
  }

  static get observedAttributes() {
    return [
      'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'label',
      'min', 'max', 'step', 'pattern', 'autocomplete', 'autofocus', 'inputmode', 'maxlength', 'minlength',
      'list', 'id', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-invalid',
      'data-size', 'data-layout', 'data-clear', 'data-clear-label'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
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
    } else if (name === 'id') {
      this._id = newValue || this.generateId();
      this.input.id = this._id;
      this.labelEl.htmlFor = this._id;
    } else if (['aria-label','aria-labelledby','aria-describedby'].includes(name)) {
      this._syncAccessibleReferences();
    } else if (this.input) {
      if (newValue === null) {
        this.input.removeAttribute(name);
        const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (typeof this.input[camel] === 'boolean') this.input[camel] = false;
        else if (typeof this.input[name] === 'boolean') this.input[name] = false;
      } else {
        this.input.setAttribute(name, newValue);
        const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (typeof this.input[camel] === 'boolean') this.input[camel] = true;
        else if (typeof this.input[name] === 'boolean') this.input[name] = true;
      }
      if (name === 'value') this.input.value = newValue ?? '';
      this.internals.setFormValue(this.input.value);
      this._syncValidity();
      this._updateColorCode();
    }
    this._syncControlState();
    this._syncAccessibleReferences();
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
    for (const name of ['value','disabled','required','readonly']) {
      if (Object.hasOwn(this,name)) {const value=this[name];delete this[name];this[name]=value;}
    }
    if (!this._initialValueSet) {
      this._initialValue = this.input.value;
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();
    this._syncControlState();
    this._observeExternalReferences();

    // Attempt to sync list initially (deferred to ensure light DOM is parsed)
    if (this.hasAttribute('list')) {
      requestAnimationFrame(() => {
        if (this.isConnected) this._handleListAttribute(this.getAttribute('list'));
      });
    }
  }

  formResetCallback() {
    const currentValue = this._initialValue || '';
    const wasFocused = this.shadowRoot.activeElement === this.input;

    // 重建 input 元素來清除 :user-invalid 狀態
    const newInput = this.input.cloneNode(false);
    newInput.value = currentValue;
    this.inputContainer.replaceChild(newInput, this.input);
    this.input = newInput;

    // 重新綁定事件
    this._bindInputEvents();

    // 同步狀態
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();
    this._syncControlState();
    this._syncAccessibleReferences();
    if (wasFocused) this.input.focus();
  }

  formStateRestoreCallback(state, mode) {
    // Browser restoration is not a user edit. Reuse native sanitization and
    // form/validity synchronization without changing the reset baseline.
    if (typeof state === 'string' && this.input?.type !== 'file') this.value = state;
  }

  get value() {
    return this.input?.value;
  }

  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.setAttribute('value', val);
      this.internals.setFormValue(this.input.value);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
    }
  }

  /** ✅ 開發者用：清空 input 值 */
  clear() {
    if (this.input.disabled || this.input.readOnly || !this.input.value) return;
    const wasFocused = this.shadowRoot.activeElement === this.clearButton;
    this.input.value = '';
    this.value = '';
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this._updateClearButton();
    this._updateColorCode();
    if (wasFocused) this.input.focus();
  }

  /** ✅ 開發者用：注入建議值 */
  suggest(val = '') {
    if (this.input.disabled || this.input.readOnly) return;
    this.input.value = val;
    this.value = val;
    this.internals.setFormValue(this.input.value);
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this._updateClearButton();
    this._updateColorCode();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
  }

  get required() {
    return this.hasAttribute('required');
  }

  set required(val) {
    val ? this.setAttribute('required', '') : this.removeAttribute('required');
  }

  get readonly() {
    return this.hasAttribute('readonly');
  }

  set readonly(val) {
    val ? this.setAttribute('readonly', '') : this.removeAttribute('readonly');
  }

  /** ✅ 開發者用：聚焦 input 欄位 */
  focus(options) {
    this.input?.focus(options);
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-input-${byteArray[0].toString(36)}`;
    }
    return `au-input-${Math.random().toString(36).slice(2)}`;
  }

  // Forward only the documented input attributes. Copying every host attribute
  // would also copy hidden, inert, style and inline handlers, which then stay on
  // the inner input after the host changes (and run twice for handlers).
  syncAttributes() {
    const handledElsewhere = new Set(['id', 'label', 'list', 'aria-label', 'aria-labelledby',
      'aria-describedby', 'data-size', 'data-layout', 'data-clear', 'data-clear-label']);
    for (const name of this.constructor.observedAttributes) {
      if (handledElsewhere.has(name) || !this.hasAttribute(name)) continue;
      const value = this.getAttribute(name);
      this.input.setAttribute(name, value);
      if (name === 'value') this.input.defaultValue = value;
    }
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
    if (!this.clearButton) return;
    const hasClear = this.hasAttribute('data-clear');
    const hasValue = this.input.value.length > 0;
    const label = this.getAttribute('data-clear-label') || 'Clear input';
    this.clearButton.setAttribute('aria-label', label);
    this.clearButton.disabled = this.input.disabled || this.input.readOnly;
    this.clearButton.hidden = !(hasClear && hasValue) || this.clearButton.disabled;
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    this._syncControlState();
  }

  _syncControlState() {
    if (!this.input) return;
    this.input.disabled = Boolean(this.disabled || this._formDisabled);
    this.input.readOnly = this.readonly;
    this._updateClearButton();
    this._syncValidity();
  }

  _observeExternalReferences() {
    this._referenceObserver?.disconnect();
    this._referenceObserver ??= new MutationObserver(() => {
      this._syncAccessibleReferences();
      const listId=this.getAttribute('list');
      const found=this.getRootNode().getElementById?.(listId);
      const target=found?.tagName==='DATALIST' ? found : null;
      if (listId && target !== this._externalDatalist) this._handleListAttribute(listId);
    });
    this._referenceObserver.observe(this.getRootNode(), {
      subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['id','for','aria-label']
    });
    this._syncAccessibleReferences();
  }

  _syncAccessibleReferences() {
    if (!this.input) return;
    const root=this.getRootNode();
    const resolve=attribute=>(this.getAttribute(attribute)||'').trim().split(/\s+/).filter(Boolean)
      .map(id=>root.getElementById?.(id)).filter(el=>el && el!==this);
    const explicit=this.getAttribute('aria-label');
    let labels=resolve('aria-labelledby');
    if (!labels.length && !explicit && !this.getAttribute('label') && this.isConnected) labels=[...this.internals.labels];
    const descriptions=resolve('aria-describedby');
    this.input.removeAttribute('aria-labelledby');
    this.input.removeAttribute('aria-describedby');
    explicit ? this.input.setAttribute('aria-label',explicit) : this.input.removeAttribute('aria-label');
    this.labelEl.hidden=!this.labelEl.textContent;
    if ('ariaLabelledByElements' in this.input) this.input.ariaLabelledByElements=labels;
    else if (!explicit && labels.length) this.input.setAttribute('aria-label',labels.map(el=>el.getAttribute('aria-label')||el.textContent).join(' ').trim());
    if ('ariaDescribedByElements' in this.input) this.input.ariaDescribedByElements=descriptions;
    else if (descriptions.length) {
      if (!this._descriptionMirror) {
        this._descriptionMirror=document.createElement('span');
        this._descriptionMirror.id=this.generateId();this._descriptionMirror.hidden=true;
        this.shadowRoot.append(this._descriptionMirror);
      }
      this._descriptionMirror.textContent=descriptions.map(el=>el.textContent).join(' ').trim();
      this.input.setAttribute('aria-describedby',this._descriptionMirror.id);
    }
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
   * Binds the external datalist to an internal shadow DOM datalist because
   * `list` attributes do not cross shadow DOM boundaries.
   *
   * A MutationObserver keeps the internal copy in sync, so dynamically updated
   * datalists (e.g. fetch-as-you-type autocomplete) stay current. The observer
   * is torn down on re-target and in disconnectedCallback to avoid leaks.
   */
  _handleListAttribute(listId) {
    if (!this.shadowRoot || !this.input) return;

    this._disconnectDatalistObserver();

    const existingInternal = this.shadowRoot.querySelector('datalist');
    if (existingInternal) existingInternal.remove();

    if (!listId) {
      this.input.removeAttribute('list');
      return;
    }

    // Find the external datalist in the root node (document or parent shadow root)
    const root = this.getRootNode();
    const externalDatalist = root instanceof Document || root instanceof ShadowRoot
      ? root.getElementById(listId)
      : document.getElementById(listId);

    if (externalDatalist && externalDatalist.tagName === 'DATALIST') {
      this._externalDatalist = externalDatalist;
      this._syncInternalDatalist(externalDatalist, listId);

      // Keep the internal copy in sync with later changes to the external list.
      this._datalistObserver = new MutationObserver(() => {
        this._syncInternalDatalist(externalDatalist, listId);
      });
      this._datalistObserver.observe(externalDatalist, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    } else {
      // Not found yet; pass the attribute through (it cannot resolve inside the
      // shadow root by outer id, but we keep the author's intent).
      this.input.setAttribute('list', listId);
    }
  }

  /** Rebuilds the shadow-scoped datalist from the current external datalist. */
  _syncInternalDatalist(externalDatalist, listId) {
    if (!this.shadowRoot || !this.input) return;

    const existingInternal = this.shadowRoot.querySelector('datalist');
    if (existingInternal) existingInternal.remove();

    const internalDatalist = document.createElement('datalist');
    internalDatalist.id = listId; // same id, scoped to this shadow root
    Array.from(externalDatalist.options).forEach(opt => {
      internalDatalist.appendChild(opt.cloneNode(true));
    });

    this.shadowRoot.appendChild(internalDatalist);
    this.input.setAttribute('list', listId);
  }

  _disconnectDatalistObserver() {
    this._externalDatalist = null;
    if (this._datalistObserver) {
      this._datalistObserver.disconnect();
      this._datalistObserver = null;
    }
  }

  disconnectedCallback() {
    this._disconnectDatalistObserver();
    this._referenceObserver?.disconnect();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-input')) {
  customElements.define('au-input', AuInput);
}
