// AuRating - Interactive rating component with optional score display and partial star support
class AuRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._groupName = 'rating-' + this.generateId();
    this._skipRender = false;

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: var(--au-rating-gap, 0.5rem);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
          cursor: not-allowed;
        }

        :host([readonly]) {
          cursor: default;
        }
        
        .au-rating {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: var(--au-rating-gap, 0.25rem);
        }

        .au-rating:focus-within {
          box-shadow: inset 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
          border-radius: 4px;
        }
        
        .rating-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        
        input[type="radio"] {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: transform 150ms ease;
        }
        
        label:has(input:focus-visible) {
          outline: none;
          box-shadow: 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
        }
        
        .star-wrapper {
          position: relative;
          display: block;
          width: var(--au-rating-star-size, 2rem);
          height: var(--au-rating-star-size, 2rem);
        }
        
        .star {
          width: 100%;
          height: 100%;
          stroke: var(--au-rating-star-stroke-color, oklch(0.6 0 0));
          stroke-width: 1;
          transition: fill 150ms ease, transform 150ms ease;
        }
        
        .star-bg {
          fill: var(--au-rating-star-color, oklch(0.8 0 0));
        }
        
        .star-fill {
          position: absolute;
          top: 0;
          left: 0;
          fill: var(--au-rating-star-filled-color, oklch(0.75 0.15 85));
          clip-path: inset(0 var(--au-rating-clip, 100%) 0 0);
          transition: clip-path 150ms ease;
        }
        
        /* Animation for filled stars */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        
        .star-wrapper.animate {
          animation: pulse 200ms ease;
        }
        
        .label-text {
          color: var(--au-rating-label-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-label-size, 0.75rem);
          text-align: center;
          min-height: 1.2em;
          word-break: break-word;
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .score {
          color: var(--au-rating-score-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-score-size, 1rem);
          font-weight: 500;
          white-space: nowrap;
        }
        
        .score:empty {
          display: none;
        }
      </style>
      <fieldset class="au-rating" role="radiogroup">
        <legend class="visually-hidden"></legend>
      </fieldset>
      <span class="score"></span>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._fieldset = this.shadowRoot.querySelector('.au-rating');
    this._legend = this.shadowRoot.querySelector('legend');
    this._scoreEl = this.shadowRoot.querySelector('.score');
    this._internals = this.attachInternals();
  }

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    return ['value', 'max', 'labels', 'aria-label', 'name', 'show-score', 'score-info', 'disabled', 'readonly'];
  }

  connectedCallback() {
    this.render();
    this._fieldset.addEventListener('change', (e) => this.handleChange(e));
    this._fieldset.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected && !this._skipRender) {
      if (name === 'value') {
        const val = parseFloat(newValue);
        this.updateStars(val);
        this.updateScoreDisplay(val);
        this._internals.setFormValue(newValue);
      } else {
        this.render();
      }
    }
  }

  get max() {
    return parseInt(this.getAttribute('max')) || 5;
  }

  get value() {
    const val = this.getAttribute('value');
    return val ? parseFloat(val) : 0;
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  get labels() {
    const labelsAttr = this.getAttribute('labels');
    if (labelsAttr) {
      return labelsAttr.split(',').map(l => l.trim());
    }
    return [];
  }

  get name() {
    return this.getAttribute('name') || 'rating';
  }

  get scoreInfo() {
    return this.getAttribute('score-info') || '';
  }

  get showScore() {
    return this.hasAttribute('show-score');
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  get readonly() {
    return this.hasAttribute('readonly');
  }

  set readonly(val) {
    if (val) this.setAttribute('readonly', '');
    else this.removeAttribute('readonly');
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return byteArray[0].toString(36);
  }

  getStarSVG(className = '') {
    return `<svg class="star ${className}" viewBox="0 0 24 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }

  render() {
    const ariaLabel = this.getAttribute('aria-label') || 'Rating';
    this._legend.textContent = ariaLabel;
    this._fieldset.setAttribute('aria-label', ariaLabel);

    // Clear existing options
    this._fieldset.innerHTML = '<legend class="visually-hidden"></legend>';
    this._legend = this._fieldset.querySelector('legend');
    this._legend.textContent = ariaLabel;

    if (this.readonly) {
      this._fieldset.setAttribute('aria-readonly', 'true');
    }
    if (this.disabled) {
      this._fieldset.setAttribute('aria-disabled', 'true');
    }

    const labels = this.labels;
    const currentValue = this.value;
    const intValue = Math.round(currentValue);

    for (let i = 1; i <= this.max; i++) {
      const option = document.createElement('div');
      option.className = 'rating-option';

      const inputId = `${this._groupName}-${i}`;
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = this._groupName;
      input.value = i;
      input.id = inputId;
      if (i === intValue) {
        input.checked = true;
      }
      
      const labelTextContent = labels[i - 1];
      if (!labelTextContent) {
        input.setAttribute('aria-label', `${i} Star${i !== 1 ? 's' : ''}`);
      }
      
      if (this.disabled || this.readonly) {
        input.disabled = true;
      }

      const label = document.createElement('label');
      label.setAttribute('for', inputId);
      
      const starWrapper = document.createElement('span');
      starWrapper.className = 'star-wrapper';
      
      const fullStars = Math.floor(currentValue);
      const partialFill = currentValue - fullStars;
      let clipRight = 100;

      if (i <= fullStars) {
        clipRight = 0;
      } else if (i === fullStars + 1 && partialFill > 0) {
        clipRight = 100 - (partialFill * 100);
      }

      starWrapper.style.setProperty('--au-rating-clip', `${clipRight}%`);
      starWrapper.innerHTML = `
        ${this.getStarSVG('star-bg')}
        ${this.getStarSVG('star-fill')}
      `;

      label.appendChild(starWrapper);

      const labelText = document.createElement('span');
      labelText.className = 'label-text';
      labelText.textContent = labels[i - 1] || '';
      label.appendChild(labelText);

      option.appendChild(input);
      option.appendChild(label);
      this._fieldset.appendChild(option);
    }

    this.updateScoreDisplay(currentValue);
    this._internals.setFormValue(currentValue.toString());
  }

  updateScoreDisplay(val) {
    if (this.showScore) {
      this._scoreEl.textContent = `${val} / ${this.max} ${this.scoreInfo}`.trim();
    } else {
      this._scoreEl.textContent = '';
    }
  }

  handleChange(e) {
    if (e.target.type === 'radio') {
      const newValue = parseInt(e.target.value);
      this.value = newValue;
      this.updateStars(newValue);
      this.updateScoreDisplay(newValue);
      
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: newValue }
      }));
    }
  }

  updateStars(selectedValue) {
    const starWrappers = this._fieldset.querySelectorAll('.star-wrapper');
    const fullStars = Math.floor(selectedValue);
    const partialFill = selectedValue - fullStars;

    starWrappers.forEach((wrapper, index) => {
      const starValue = index + 1;
      wrapper.classList.remove('animate');
      
      let clipRight = 100;
      if (starValue <= fullStars) {
        clipRight = 0;
        if (starValue === fullStars && partialFill === 0) { // Only animate full integer steps? Or last star?
             wrapper.classList.add('animate');
        }
      } else if (starValue === fullStars + 1 && partialFill > 0) {
        clipRight = 100 - (partialFill * 100);
        wrapper.classList.add('animate');
      }

      wrapper.style.setProperty('--au-rating-clip', `${clipRight}%`);
    });
  }

  handleKeyDown(e) {
    const radios = Array.from(this._fieldset.querySelectorAll('input[type="radio"]'));
    const currentIndex = radios.findIndex(r => r === this.shadowRoot.activeElement || r.checked);
    let nextIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if (this.value === 0 && currentIndex === 0) {
          nextIndex = 0;
        } else {
          nextIndex = (currentIndex + 1) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
    }
  }

  formResetCallback() {
    this.value = this.getAttribute('value') || 0;
    this._internals.setFormValue(this.value ? this.value.toString() : null);
  }

  formStateRestoreCallback(state, mode) {
    if (state) {
        this.value = state;
    }
  }
}

customElements.define('au-rating', AuRating);
