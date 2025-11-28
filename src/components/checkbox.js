class AuCheckbox extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();

    // Generate a unique ID for the input element
    const inputID = this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
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
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(0.7894 0 0));
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
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
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
    `;

    const container = document.createElement('div');
    container.setAttribute('class', 'au-checkbox');

    const label = document.createElement('label');
    label.setAttribute('for', inputID);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = inputID;
    input.name = this.getAttribute('name') || 'default-checkbox';
    input.value = this.getAttribute('value') || 'default';

    const textSlot = document.createElement('div');
    textSlot.setAttribute('class', 'text');
    const slot = document.createElement('slot');
    textSlot.appendChild(slot);

    label.append(input, textSlot);
    container.appendChild(label);
    this.shadowRoot.append(style, container);

    input.addEventListener('change', (event) => {
      this.checked = event.target.checked;
      this.dispatchEvent(new CustomEvent('change', { detail: event.target.checked }));
      this.updateFormValue();
    });

    input.addEventListener('focus', () => {
      this.dispatchEvent(new CustomEvent('focus'));
    });

    input.addEventListener('blur', () => {
      this.dispatchEvent(new CustomEvent('blur'));
    });
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-checkbox-${byteArray[0].toString(36)}`;
  }

  static get observedAttributes() {
    return ['name', 'value', 'checked', 'disabled', 'required'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      switch (name) {
        case 'checked':
          input.checked = newValue !== null;
          break;
        case 'disabled':
          input.disabled = newValue !== null;
          break;
        case 'name':
          input.name = newValue;
          break;
        case 'value':
          input.value = newValue;
          break;
        case 'required':
          input.required = newValue !== null;
          break;
      }
    }
  }

  connectedCallback() {
    this.updateCheckedState();
    this.updateFormValue();
  }

  updateCheckedState() {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.checked = this.hasAttribute('checked');
    }
  }

  updateFormValue() {
    const input = this.shadowRoot.querySelector('input');
    const value = input.checked ? this.getAttribute('value') || 'on' : null;
    this.internals.setFormValue(value);

    if (input.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(input.validity, input.validationMessage, input);
    }
  }

  formDisabledCallback(disabled) {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.disabled = disabled;
    }
  }

  formResetCallback() {
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.checked = false;
      this.checked = false;
      this.updateFormValue();
    }
  }
}

customElements.define('au-checkbox', AuCheckbox);

