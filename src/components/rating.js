// AuRating - Interactive rating component with optional score display and partial star support
class AuRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._groupName = 'rating-' + this.generateId();

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: inline-flex;
          flex-wrap: wrap;
          max-width: 100%;
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
          flex-wrap: wrap;
          min-inline-size: 0;
          max-width: 100%;
          gap: var(--au-rating-gap, 0.25rem);
        }

        .rating-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 0 1 auto;
          min-width: 0;
          max-width: 100%;
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
          box-sizing: border-box;
          min-width: 24px;
          min-height: 24px;
          max-width: 100%;
          border-radius: 4px;
          transition: transform 150ms ease;
        }
        :host([readonly]) label, :host(:disabled) label { cursor: default; }
        
        input:checked + label {
          box-shadow: inset 0 -2px 0 currentColor;
        }

        input:focus-visible + label {
          outline: var(--au-rating-focus-width, 3px) solid var(--au-rating-focus-color, oklch(0.45 0.15 260));
          outline-offset: -3px;
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
          stroke: var(--au-rating-star-stroke-color, oklch(0.45 0 0));
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
        :host(:dir(rtl)) .star-fill {
          clip-path: inset(0 0 0 var(--au-rating-clip, 100%));
        }

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
          white-space: normal;
          overflow-wrap: anywhere;
        }
        
        .score:empty {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
        @media (forced-colors: active) {
          .star { forced-color-adjust: auto; stroke: CanvasText; }
          .star-bg { fill: Canvas; }
          .star-fill { fill: CanvasText; }
          input:checked + label { border-bottom: 2px solid CanvasText; }
          input:focus-visible + label { outline-color: Highlight; }
        }
      </style>
      <fieldset class="au-rating" role="radiogroup" aria-describedby="score">
        <legend class="visually-hidden"></legend>
      </fieldset>
      <span class="score" id="score"></span>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._fieldset = this.shadowRoot.querySelector('.au-rating');
    this._legend = this.shadowRoot.querySelector('legend');
    this._scoreEl = this.shadowRoot.querySelector('.score');
    this._internals = this.attachInternals();
    this._fieldset.addEventListener('change', (e) => this.handleChange(e));
    this._fieldset.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    return [
      'value',
      'max',
      'labels',
      'aria-label',
      'aria-invalid',
      'aria-describedby',
      'name',
      'show-score',
      'score-info',
      'disabled',
      'readonly',
      'data-text-rating',
      'data-text-star',
      'data-text-score'
    ];
  }

  connectedCallback() {
    // Properties assigned before registration must not shadow public setters.
    for (const name of ['name', 'value', 'max', 'disabled', 'readonly']) {
      if (Object.hasOwn(this, name)) {
        const value = this[name]; delete this[name]; this[name] = value;
      }
    }
    if (this._defaultValue === undefined) this._defaultValue = this.value;
    this.render();
    this._observeDescriptions();
  }

  disconnectedCallback() {
    this._descriptionObserver?.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'aria-describedby') {
      if (oldValue !== newValue && this.isConnected) this._observeDescriptions();
      return;
    }
    if (oldValue !== newValue && this.isConnected) this.render();
  }

  _observeDescriptions() {
    this._descriptionObserver?.disconnect();
    if (this.hasAttribute('aria-describedby')) {
      this._descriptionObserver ??= new MutationObserver(() => this._syncDescriptions());
      this._descriptionObserver.observe(this.getRootNode(), {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['id'],
      });
    }
    this._syncDescriptions();
  }

  _syncDescriptions() {
    const root = this.getRootNode();
    const external = [...new Set((this.getAttribute('aria-describedby') || '').trim().split(/\s+/))]
      .filter(Boolean).map(id => root.getElementById?.(id)).filter(el => el && el !== this);
    if (!external.length) {
      if (this._descriptionMirror) this._descriptionMirror.textContent = '';
      this._fieldset.setAttribute('aria-describedby', 'score');
      return;
    }
    if (typeof this._fieldset.ariaDescribedByElements !== 'undefined') {
      this._fieldset.ariaDescribedByElements = [this._scoreEl, ...external];
    } else {
      if (!this._descriptionMirror) {
        this._descriptionMirror = document.createElement('span');
        this._descriptionMirror.id = 'external-description';
        this._descriptionMirror.hidden = true;
        this.shadowRoot.append(this._descriptionMirror);
      }
      const text = external.map(el => el.textContent).join(' ').trim();
      if (this._descriptionMirror.textContent !== text) this._descriptionMirror.textContent = text;
      this._fieldset.setAttribute('aria-describedby', text ? 'score external-description' : 'score');
    }
  }

  get max() {
    const max = Number(this.getAttribute('max'));
    // Bound DOM work even when configuration is malformed or untrusted.
    return Number.isInteger(max) && max > 0 ? Math.min(max, 100) : 5;
  }

  set max(value) {
    this.setAttribute('max', value);
  }

  get value() {
    const val = Number(this.getAttribute('value'));
    return Number.isFinite(val) ? Math.min(this.max, Math.max(0, val)) : 0;
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
    return this.getAttribute('name') || '';
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  get scoreInfo() {
    return this.getAttribute('score-info') || '';
  }

  get ratingLabel() {
    return this.getAttribute('aria-label') || this.getAttribute('data-text-rating') || 'Rating';
  }

  get starLabelTemplate() {
    return this.getAttribute('data-text-star') || '{value} Star(s)';
  }

  get scoreTemplate() {
    return this.getAttribute('data-text-score') || '{value} / {max} {scoreInfo}';
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
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return byteArray[0].toString(36);
    }
    return Math.random().toString(36).slice(2);
  }

  getStarSVG(className = '') {
    return `<svg class="star ${className}" viewBox="0 0 24 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }

  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template).trim();
  }

  render() {
    const ariaLabel = this.ratingLabel;
    this._legend.textContent = ariaLabel;
    this._fieldset.setAttribute('aria-label', ariaLabel);
    if (this.hasAttribute('aria-invalid')) this._fieldset.setAttribute('aria-invalid', this.getAttribute('aria-invalid'));
    else this._fieldset.removeAttribute('aria-invalid');

    const disabled = this.disabled || this._formDisabled;
    this.readonly ? this._fieldset.setAttribute('aria-readonly', 'true') : this._fieldset.removeAttribute('aria-readonly');
    disabled ? this._fieldset.setAttribute('aria-disabled', 'true') : this._fieldset.removeAttribute('aria-disabled');

    const labels = this.labels;
    const currentValue = this.value;
    const previousFocus = this.shadowRoot.activeElement;
    const options = [...this._fieldset.querySelectorAll('.rating-option')];

    for (let i = 1; i <= this.max; i++) {
      let option = options[i - 1];
      if (!option) {
        option = document.createElement('div');
        option.className = 'rating-option';
        // Only static component-owned markup is parsed as HTML.
        option.innerHTML = `<input type="radio"><label><span class="star-wrapper">${this.getStarSVG('star-bg')}${this.getStarSVG('star-fill')}</span><span class="label-text"></span></label>`;
        this._fieldset.appendChild(option);
      }
      const input = option.querySelector('input');
      const label = option.querySelector('label');
      input.name = this._groupName;
      input.value = i;
      input.id = `${this._groupName}-${i}`;
      label.htmlFor = input.id;
      input.checked = i === currentValue;
      input.tabIndex = i === (Number.isInteger(currentValue) && currentValue > 0 ? currentValue : 1) ? 0 : -1;
      
      const labelTextContent = labels[i - 1];
      if (!labelTextContent) {
        input.setAttribute('aria-label', this.formatText(this.starLabelTemplate, { value: i, max: this.max }));
      } else input.removeAttribute('aria-label');
      input.disabled = Boolean(disabled || this.readonly);
      option.querySelector('.label-text').textContent = labelTextContent || '';
    }
    options.slice(this.max).forEach(option => option.remove());
    if (previousFocus && !this.shadowRoot.contains(previousFocus) && !disabled && !this.readonly) {
      this._fieldset.querySelector('input[tabindex="0"]')?.focus();
    }
    this.updateStars(currentValue);
    this.updateScoreDisplay(currentValue);
    this._internals.setFormValue(currentValue.toString());
  }

  updateScoreDisplay(val) {
    // Exact fractional/zero values remain available as the group's description.
    this._scoreEl.classList.toggle('visually-hidden', !this.showScore);
    this._scoreEl.textContent = this.formatText(this.scoreTemplate, {
        value: val,
        max: this.max,
        scoreInfo: this.scoreInfo
    });
  }

  handleChange(e) {
    if (e.target.type === 'radio') {
      e.stopPropagation();
      if (this.disabled || this._formDisabled || this.readonly) { this.render(); return; }
      const newValue = parseInt(e.target.value);
      this.value = newValue;
      
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
        if (starValue === fullStars && partialFill === 0) {
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
    if (this.disabled || this._formDisabled || this.readonly) return;
    const radios = Array.from(this._fieldset.querySelectorAll('input[type="radio"]'));
    if (!radios.length) return;
    let currentIndex = radios.indexOf(this.shadowRoot.activeElement);
    if (currentIndex < 0) currentIndex = radios.findIndex(r => r.checked);
    let nextIndex;

    const rtl = getComputedStyle(this._fieldset).direction === 'rtl';
    const key = rtl && e.key === 'ArrowRight' ? 'ArrowLeft' : rtl && e.key === 'ArrowLeft' ? 'ArrowRight' : e.key;
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % radios.length;
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex < 0 ? radios.length - 1 : (currentIndex - 1 + radios.length) % radios.length;
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
    }
  }

  formResetCallback() {
    this.value = this._defaultValue ?? 0;
  }

  focus(options) {
    if (this.disabled || this._formDisabled || this.readonly) return;
    this._fieldset.querySelector('input[tabindex="0"]:not(:disabled)')?.focus(options);
  }

  formStateRestoreCallback(state, mode) {
    if (typeof state === 'string') this.value = state;
  }

  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    if (this.isConnected) this.render();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-rating')) {
  customElements.define('au-rating', AuRating);
}
