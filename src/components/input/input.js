class AuInput extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();

    this._id = this.getAttribute('id') || this.generateId();

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'au-input-wrapper');

    const style = document.createElement('style');
    style.textContent = `
      
    `;

    this.label = document.createElement('label');
    this.label.setAttribute('for', this._id);
    this.label.textContent = this.getAttribute('label') || '';

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // prefix slot if provided
    const hasPrefix = this.querySelector('[slot="prefix"]');
    if (hasPrefix) {
      this.prefixSlot = document.createElement('slot');
      this.prefixSlot.name = 'prefix';
      const prefixSpan = document.createElement('span');
      prefixSpan.classList.add('prefix');
      prefixSpan.appendChild(this.prefixSlot);
      inputContainer.appendChild(prefixSpan);
    }

    this.input = document.createElement('input');
    this.input.id = this._id;
    this.syncAttributes();
    inputContainer.appendChild(this.input);

    // affix slot if provided
    const hasAffix = this.querySelector('[slot="affix"]');
    if (hasAffix) {
      this.affixSlot = document.createElement('slot');
      this.affixSlot.name = 'affix';
      const affixSpan = document.createElement('span');
      affixSpan.classList.add('affix');
      affixSpan.appendChild(this.affixSlot);
      inputContainer.appendChild(affixSpan);
    }

    wrapper.append(this.label, inputContainer);
    this.shadowRoot.append(style, wrapper);

    this.input.addEventListener('input', () => {
      this.value = this.input.value;
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this.internals.setFormValue(this.value);
      this._syncValidity();
    });

    this.input.addEventListener('change', () => {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  static get observedAttributes() {
    return [
      'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'label',
      'min', 'max', 'step', 'pattern', 'autocomplete', 'autofocus', 'inputmode', 'maxlength', 'minlength', 'size'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'label' && this.label) {
      this.label.textContent = newValue;
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
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
  }

  formResetCallback() {
    this.input.value = '';
    this.value = '';
    this.internals.setFormValue('');
    this._syncValidity();
  }

  get value() {
    return this.input?.value;
  }

  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.internals.setFormValue(val);
      this._syncValidity();
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-input-${byteArray[0].toString(36)}`;
  }

  syncAttributes() {
    const exclude = new Set(['label', 'id']);
    Array.from(this.attributes).forEach(attr => {
      if (!exclude.has(attr.name)) {
        this.input.setAttribute(attr.name, attr.value);
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

  checkValidity() {
    return this.input.checkValidity();
  }

  reportValidity() {
    return this.input.reportValidity();
  }
}

customElements.define('au-input', AuInput);