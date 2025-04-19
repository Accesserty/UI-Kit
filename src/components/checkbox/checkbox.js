class RyCheckbox extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();

    // Generate a unique ID for the input element
    const inputID = this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      .ry-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--ry-checkbox-padding, 0.25rem);
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--ry-checkbox-content-gap, 0.5rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--ry-checkbox-input-width, 1.5rem);
          height: var(--ry-checkbox-input-height, 1.5rem);
          border: var(--ry-checkbox-input-border-width, 1px) var(--ry-checkbox-input-border-style, solid) oklch(var(--ry-checkbox-input-border-color, 78.94% 0 0));
          border-radius: var(--ry-checkbox-input-border-radius, 0.25rem);
          background-color: oklch(var(--ry-checkbox-input-bg, 99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: oklch(var(--ry-checkbox-input-checked-bg, 13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--ry-checkbox-input-checked-symbol, '✔︎');
              color: oklch(var(--ry-checkbox-input-checked-text-color, 99.4% 0 0));
              font-size: var(--ry-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: oklch(var(--ry-checkbox-label-text-color, 13.98% 0 0));
          font-size: var(--ry-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--ry-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: oklch(var(--ry-checkbox-label-active-text-color, 53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--ry-checkbox-input-focus-shadow-width, 3px) oklch(var(--ry-checkbox-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: oklch(var(--ry-checkbox-label-disabled-text-color, 53.7% 0 0));
          }
        }
      }
    `;

    const container = document.createElement('div');
    container.setAttribute('class', 'ry-checkbox');

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
    return `ry-checkbox-${byteArray[0].toString(36)}`;
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

customElements.define('ry-checkbox', RyCheckbox);

