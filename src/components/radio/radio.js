class RyRadioGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const style = document.createElement('style');
    style.textContent = `
      .ry-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
      .ry-radio-group--vertical {
        flex-direction: column;
        label {
          width: max-content;
        }
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--ry-radio-content-gap, 0.5rem);
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          margin: 0;
          cursor: pointer;
          width: var(--ry-radio-input-width, 1.5rem);
          height: var(--ry-radio-input-height, 1.5rem);
          border: var(--ry-radio-input-border-width, 1px) var(--ry-radio-input-border-style, solid) oklch(var(--ry-radio-input-border-color, 78.94% 0 0));
          border-radius: 50%;
          background-color: oklch(var(--ry-radio-input-bg, 99.4% 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: oklch(var(--ry-radio-input-checked-bg, 13.98% 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: oklch(var(--ry-radio-input-checked-circle-color, 99.4% 0 0));
            }
          }
        }
        .text {
          flex: 1;
          color: oklch(var(--ry-radio-label-text-color, 13.98% 0 0));
          font-size: var(--ry-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--ry-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: oklch(var(--ry-radio-label-active-text-color, 53.7% 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--ry-radio-input-focus-shadow-width, 3px) oklch(var(--ry-radio-input-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: oklch(var(--ry-radio-label-disabled-text-color, 53.7% 0 0));
          }
        }
      }
    `;

    const container = document.createElement('div');
    container.setAttribute('class', 'ry-radio-group');
    container.setAttribute('role', 'radiogroup');

    // Generate a unique name for the radio group
    this.groupName = 'radio-group-name-' + this.generateId();

    this.shadowRoot.append(style, container);
  }

  connectedCallback() {
    this.renderRadios();
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      const container = this.shadowRoot.querySelector('.ry-radio-group');
      container.setAttribute('aria-label', ariaLabel);
    }
    const direction = this.getAttribute('direction');
    if (direction === 'vertical') {
      const container = this.shadowRoot.querySelector('.ry-radio-group');
      container.classList.add('ry-radio-group--vertical');
    }
  }

  renderRadios() {
    const container = this.shadowRoot.querySelector('.ry-radio-group');
    container.innerHTML = ''; // Clear the container before rendering

    const radios = Array.from(this.children);
    const isDisabled = this.hasAttribute('disabled'); // Check if the group is disabled

    radios.forEach((radio, index) => {
      const label = document.createElement('label');
      const inputID = 'radio-' + this.generateId();
      label.setAttribute('for', inputID);

      const input = document.createElement('input');
      input.type = 'radio';
      input.id =  inputID;
      input.name = this.groupName;
      input.value = radio.getAttribute('value') || `radio-${index + 1}`;

      if (radio.hasAttribute('checked')) {
        input.checked = true;
      }

      if (isDisabled || radio.hasAttribute('disabled')) {
        input.disabled = true;
      }

      const textSlot = document.createElement('div');
      textSlot.setAttribute('class', 'text');
      textSlot.textContent = radio.textContent.trim();

      label.append(input, textSlot);
      container.appendChild(label);

      // Add event listeners for keyboard interaction and focus management
      input.addEventListener('change', (event) => this.handleChange(event, input));
      input.addEventListener('keydown', (event) => this.handleKeyDown(event, index));
    });
  }

  handleChange(event, input) {
    if (input.checked) {
      const radios = this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`);
      radios.forEach((radio) => {
        if (radio !== input) {
          radio.checked = false;
        }
      });
    }
  }

  handleKeyDown(event, currentIndex) {
    const radios = Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));
    let nextIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % radios.length;
        // Skip disabled radios
        while (radios[nextIndex].disabled) {
          nextIndex = (nextIndex + 1) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        // Skip disabled radios
        while (radios[nextIndex].disabled) {
          nextIndex = (nextIndex - 1 + radios.length) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      default:
        break;
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `${byteArray[0].toString(36)}`;
  }
}

customElements.define('ry-radio-group', RyRadioGroup);
