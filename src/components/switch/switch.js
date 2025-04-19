class RySwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const inputID = this.generateId();

    const style = document.createElement('style');
    style.textContent = `
      .ry-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ry-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--ry-switch-padding-top, 0.5rem);
        padding-right: var(--ry-switch-padding-right, 0.25rem);
        padding-bottom: var(--ry-switch-padding-bottom, 0.5rem);
        padding-left: var(--ry-switch-padding-left, 0.25rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--ry-switch-container-gap, 0.5rem);
      }
      .input {
        position: relative;
      }
      input[type="checkbox"] {
        appearance: none;
        cursor: pointer;
        margin: 0;
        display: block;
        width: var(--ry-switch-input-width, 4rem);
        height: calc(var(--ry-switch-input-width, 4rem) / 2);
        border: var(--ry-switch-input-border-width, 1px) var(--ry-switch-input-border-style, solid) oklch(var(--ry-switch-input-border-color, 78.94% 0 0));
        border-radius: var(--ry-switch-input-border-radius, calc(var(--ry-switch-input-width, 4rem) / 4));
        transition: background-color 360ms ease-in;
      }
      input[type="checkbox"]:focus-visible {
        outline: none;
      }
      .input:before {
        content: '';
        display: block;
        width: calc(var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem));
        height: calc(var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem));
        background-color: gray;
        position: absolute;
        top: var(--ry-switch-inner-distance, 0.25rem);
        left: var(--ry-switch-inner-distance, 0.25rem);
        border-radius: var(--ry-switch-inner-border-radius, calc((var(--ry-switch-input-width, 4rem) / 2 - var(--ry-switch-inner-distance, 0.25rem)) / 2));
        transition: background-color 360ms ease-in, left 240ms ease-in;
      }
      .input:has(input[type="checkbox"]:checked) input[type="checkbox"] {
        background-color: oklch(var(--ry-switch-input-checked-bg, 13.98% 0 0));
      }
      .input:has(input[type="checkbox"]:checked):before {
        background-color: oklch(var(--ry-switch-inner-checked-bg, 99.4% 0 0));
        left: calc(100% - (var(--ry-switch-input-width, 4rem) / 2 - 2 * var(--ry-switch-inner-distance, 0.25rem)) - var(--ry-switch-inner-distance, 0.25rem));
      }
      .ry-switch:hover,
      .ry-switch:has(input:focus-visible) {
        box-shadow: inset 0 0 0 var(--ry-switch-focus-shadow-width, 3px) oklch(var(--ry-switch-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
      }
    `;

    // HTML structure for the switch
    const switchElement = document.createElement('label');
    switchElement.classList.add('ry-switch');
    switchElement.setAttribute('for', inputID);

    // Create switch container
    const container = document.createElement('div');
    container.classList.add('container');

    const offTextSpan = document.createElement('span');
    offTextSpan.classList.add('off-text');
    offTextSpan.setAttribute('aria-hidden', 'true');

    const inputDiv = document.createElement('div');
    inputDiv.classList.add('input');
    const inputElement = document.createElement('input');
    inputElement.id = inputID;
    inputElement.type = 'checkbox';
    inputElement.setAttribute('role', 'switch');
    inputDiv.appendChild(inputElement);

    const onTextSpan = document.createElement('span');
    onTextSpan.classList.add('on-text');
    onTextSpan.setAttribute('aria-hidden', 'true');

    container.append(offTextSpan, inputDiv, onTextSpan);

    switchElement.append(container);

    // Append elements to the shadow root
    this.shadowRoot.append(style, switchElement);

    // Add label text slot
    const slot = document.createElement('slot');
    switchElement.prepend(slot);

    // Event listener for switch change
    inputElement.addEventListener('change', (event) => {
      if (event.target === inputElement) {
        this.dispatchEvent(new CustomEvent('change', { detail: inputElement.checked }));
      }
    });
  }

  // Method to generate a unique ID
  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `ry-switch-${byteArray[0].toString(36)}`;
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
    const offText = this.shadowRoot.querySelector('.off-text');
    const onText = this.shadowRoot.querySelector('.on-text');

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

customElements.define('ry-switch', RySwitch);
