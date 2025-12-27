class AuSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const inputID = this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
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
          box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        } 
        &:has(input:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
          text-decoration: none;
        } 
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
      }
      .input {
        position: relative;
        &:before {
          content: '';
          display: block;
          width: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          height: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          background-color: gray;
          position: absolute;
          top: var(--au-switch-inner-distance, 0.25rem);
          left: var(--au-switch-inner-distance, 0.25rem);
          border-radius: var(--au-switch-inner-border-radius, calc((var(--au-switch-input-width, 4rem) / 2 - var(--au-switch-inner-distance, 0.25rem)) / 2));
          transition: background-color 360ms ease-in, left 240ms ease-in;
        }
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          margin: 0;
          display: block;
          width: var(--au-switch-input-width, 4rem);
          height: calc(var(--au-switch-input-width, 4rem) / 2);
          border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(0.7894 0 0));
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
          left: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
        }
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
    switchElement.prepend(slot);

    this.inputElement.addEventListener('change', (event) => {
      const checked = event.target.checked;
      this.inputElement.setAttribute('aria-checked', checked.toString());
      this.dispatchEvent(new CustomEvent('change', { detail: checked }));
    });
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-switch-${byteArray[0].toString(36)}`;
  }

  static get observedAttributes() {
    return ['name', 'value', 'checked', 'disabled', 'off', 'on'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
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
        input.disabled = newValue !== null;
        break;
      case 'off':
        offText.textContent = newValue || 'Off';
        break;
      case 'on':
        onText.textContent = newValue || 'On';
        break;
      default:
        input.setAttribute(name, newValue);
        break;
    }
  }

  connectedCallback() {
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
  }
}

customElements.define('au-switch', AuSwitch);
