class AuAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._container = document.createElement('div');
    this._container.setAttribute('class', 'au-accordion');

    const slot = document.createElement('slot');
    this._container.appendChild(slot);

    this._exclusiveHint = document.createElement('span');
    this._exclusiveHint.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;';
    const hintId = `au-accordion-hint-${Math.random().toString(36).slice(2)}`;
    this._exclusiveHint.id = hintId;
    this._exclusiveHint.textContent = 'Only one section may be expanded at a time.';

    this.shadowRoot.appendChild(this._exclusiveHint);
    this.shadowRoot.appendChild(this._container);

    this._onToggle = this._handleToggle.bind(this);
  }

  connectedCallback() {
    this.addEventListener('au-toggle', this._onToggle);
    this._updateExclusiveAria();
  }

  disconnectedCallback() {
    this.removeEventListener('au-toggle', this._onToggle);
  }

  static get observedAttributes() {
    return ['exclusive', 'data-text-exclusive-hint'];
  }

  get exclusive() {
    return this.hasAttribute('exclusive');
  }

  set exclusive(val) {
    if (val) {
      this.setAttribute('exclusive', '');
    } else {
      this.removeAttribute('exclusive');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'exclusive' && oldValue !== newValue) {
      this._updateExclusiveAria();
    }
    if (name === 'data-text-exclusive-hint' && oldValue !== newValue) {
      this._updateExclusiveHint();
    }
  }

  _updateExclusiveHint() {
    if (!this._exclusiveHint) return;
    this._exclusiveHint.textContent = this.getAttribute('data-text-exclusive-hint') || 'Only one section may be expanded at a time.';
  }

  _updateExclusiveAria() {
    if (this.exclusive) {
      this._container.setAttribute('aria-describedby', this._exclusiveHint.id);
    } else {
      this._container.removeAttribute('aria-describedby');
    }
  }

  _handleToggle(e) {
    if (!this.exclusive || !e.detail.open) return;
    const items = [...this.children].filter(
      el => el.tagName.toLowerCase() === 'au-accordion-item' && el !== e.target
    );
    items.forEach(item => { item.open = false; });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-accordion')) {
  customElements.define("au-accordion", AuAccordion);
}


class AuAccordionItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const regionId = this.generateId();
    const titleId = this.generateId();

    const content = document.createElement('div');
    content.setAttribute('class', 'au-accordion-item');

    content.innerHTML = `
        <style>
          .au-accordion-item {
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family);
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              min-width: 0;
              flex: 1 1 auto;
              overflow-wrap: break-word;

              slot,
              ::slotted(*),
              * {
                display: block;
                width: 100%;
              }
            }

            .info {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 0 1 auto;
              min-width: 0;
              max-width: 50%;
              & > *:first-child  {
                flex: 1;
                min-width: 20px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                slot,
                ::slotted(*),
                * {
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  display: block;
                  width: 100%;
                }
              }
            }

            .icon {
              transition: transform 300ms ease-in;
              display: flex;
              align-items: center;
              flex: 0 0 auto;
            }

            &[aria-expanded="true"] {
              .icon {
                transform: rotate3d(0, 0, 1, 180deg);
                transform-origin: center;
              }
            }

            &:hover {
              background-color: var(--au-accordion-heading-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-accordion-heading-hover-border-color, oklch(0.7894 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(0.7894 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) var(--au-accordion-heading-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
            color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            /* 這裡設定展開時的高度 */
            /* 注意：calc-size 目前支援度較低，確保你在支援的環境下使用 */
            height: calc-size(auto, size); 
            overflow: hidden; /* 確保內容縮放時不會溢出 */

            /* --- 2. 關鍵：Transition 必須寫在這裡 --- */
            transition-behavior: allow-discrete;
            transition: height 0.5s ease-in-out, display 0.5s step-end allow-discrete; 
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-content-border-radius, 0);
            @starting-style {
              height: 0;
            }

            &[hidden] {
              height: 0;
              display: none;
            }
          }
        </style>
        <button type="button" aria-expanded="false" aria-controls="${regionId}" part="button">
            <div class="heading" id="${titleId}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${regionId}" aria-labelledby="${titleId}" hidden part="region">
            <slot name="content"></slot>
        </div>
      `;

    this.shadowRoot.append(content);

    this.button = this.shadowRoot.querySelector('button');
    this.button.addEventListener('click', () => this.toggleAccordion());
  }

  connectedCallback() {
    this.updateExpanded();
  }

  static get observedAttributes() {
    return ["open"];
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    if (val) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open" && oldValue !== newValue) {
      this.updateExpanded();
      if (this.isConnected) {
        this.dispatchEvent(new CustomEvent('au-toggle', {
          bubbles: true,
          composed: true,
          detail: { open: this.open },
        }));
      }
    }
  }

  updateExpanded() {
    const isOpen = this.hasAttribute('open');
    this.button.setAttribute('aria-expanded', isOpen);
    const region = this.shadowRoot.querySelector('div[role="region"]');
    if (isOpen) {
      region.removeAttribute('hidden');
    } else {
      region.setAttribute('hidden', '');
    }
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-accordion-item-${byteArray[0].toString(36)}`;
    }
    return `au-accordion-item-${Math.random().toString(36).slice(2)}`;
  }

  toggleAccordion() {
    this.open = !this.open;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-accordion-item')) {
  customElements.define("au-accordion-item", AuAccordionItem);
}
