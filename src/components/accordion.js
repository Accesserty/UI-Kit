class AuAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const visibilityStyle = document.createElement('style');
    visibilityStyle.textContent = ':host([hidden]:not([hidden="until-found" i])) { display: none; }';
    this.shadowRoot.append(visibilityStyle);

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
    this._childrenObserver = new MutationObserver(() => this._syncItems());
  }

  connectedCallback() {
    if (Object.hasOwn(this, 'exclusive')) {
      const value = this.exclusive; delete this.exclusive; this.exclusive = value;
    }
    this.addEventListener('au-toggle', this._onToggle);
    this._childrenObserver.observe(this, { childList: true });
    this._updateExclusiveAria();
    this._syncItems();
  }

  disconnectedCallback() {
    this.removeEventListener('au-toggle', this._onToggle);
    this._childrenObserver.disconnect();
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
      this._syncItems();
    }
    if (name === 'data-text-exclusive-hint' && oldValue !== newValue) {
      this._updateExclusiveHint();
    }
  }

  _updateExclusiveHint() {
    if (!this._exclusiveHint) return;
    this._exclusiveHint.textContent = this.getAttribute('data-text-exclusive-hint') || 'Only one section may be expanded at a time.';
    this._syncItems();
  }

  _updateExclusiveAria() {
    if (this.exclusive) {
      this._container.setAttribute('aria-describedby', this._exclusiveHint.id);
    } else {
      this._container.removeAttribute('aria-describedby');
    }
  }

  _handleToggle(e) {
    const item = e.composedPath()[0];
    if (item?.parentElement !== this || item.localName !== 'au-accordion-item') return;
    if (this.exclusive && e.detail?.open) this._syncItems(item);
  }

  _syncItems(preferred) {
    const items = [...this.children].filter(el => el.localName === 'au-accordion-item');
    const keep = preferred || items.find(item => item.hasAttribute('open'));
    for (const item of items) {
      item.updateExclusiveHint?.();
      if (this.exclusive && item !== keep && item.hasAttribute('open')) item.removeAttribute('open');
    }
  }
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
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
          .au-accordion-item {
            box-sizing: border-box;
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          :host {
            display: block;
            max-width: 100%;
            min-width: 0;
          }
          [role="heading"] { margin: 0; }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            box-sizing: border-box;
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: start;
            min-height: 24px;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family);
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              min-width: 0;
              flex: 1 1 0;
              max-width: 100%;
              overflow-wrap: break-word;
              overflow-wrap: anywhere;
              word-break: break-word;

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
              flex: 0 0 auto;
              min-width: 0;
              max-width: min(50%, var(--au-accordion-info-max-width, 12rem));
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
              border-color: var(--au-accordion-heading-hover-border-color, oklch(0.55 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(0.55 0 0));
            }
            
            &:focus-visible {
              outline: var(--au-accordion-heading-focus-shadow-width, 3px) solid var(--au-accordion-heading-focus-shadow-color, oklch(0.4 0 0));
              outline-offset: -3px;
            }
          }

          .region {
            overflow-wrap: anywhere;
            background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
            color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-radius: var(--au-accordion-content-border-radius, 0);
            &[hidden] {
              display: none !important;
            }
          }
          .exclusive-hint { position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }
          @media (forced-colors: active) { button:focus-visible { outline: 2px solid Highlight; outline-offset:-2px; } }
          @media (prefers-reduced-motion: reduce) { button, button .icon { transition: none; } }
        </style>
        <div role="heading" aria-level="3">
        <button type="button" id="${titleId}" aria-expanded="false" aria-controls="${regionId}" part="button">
            <div class="heading"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        </div>
        <span class="exclusive-hint" id="${regionId}-hint"></span>
        <div class="region" role="region" id="${regionId}" aria-labelledby="${titleId}" hidden inert part="region">
            <slot name="content"></slot>
        </div>
      `;

    this.shadowRoot.append(content);

    this.button = this.shadowRoot.querySelector('button');
    this.region = this.shadowRoot.querySelector('.region');
    this.heading = this.shadowRoot.querySelector('[role="heading"]');
    this._hint = this.shadowRoot.querySelector('.exclusive-hint');
    this.button.addEventListener('click', () => this.toggleAccordion());
  }

  connectedCallback() {
    if (Object.hasOwn(this, 'open')) {
      const value = this.open; delete this.open; this.open = value;
    }
    this.updateExpanded();
    this.updateSemantics();
    this.updateExclusiveHint();
  }

  static get observedAttributes() {
    return ["open", "heading-level", "no-region"];
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
    if (oldValue === newValue) return;
    if (name !== 'open') { this.updateSemantics(); return; }
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
    // Walk the composed ancestry so slotted controls and nested shadow controls
    // return to their own header before the panel becomes hidden/inert.
    let active = this.ownerDocument.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    for (let node = active; !isOpen && node; node = node.assignedSlot || node.parentNode || node.host) {
      if (node === this.region) { this.button.focus({preventScroll:true}); break; }
    }
    this.button.setAttribute('aria-expanded', isOpen);
    this.region.hidden = !isOpen;
    this.region.inert = !isOpen;
  }

  updateSemantics() {
    const level = Number(this.getAttribute('heading-level'));
    this.heading.setAttribute('aria-level', String(Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3));
    if (this.hasAttribute('no-region')) {
      this.region.removeAttribute('role'); this.region.removeAttribute('aria-labelledby');
    } else {
      this.region.setAttribute('role','region'); this.region.setAttribute('aria-labelledby',this.button.id);
    }
  }

  updateExclusiveHint() {
    const owner = this.parentElement;
    const exclusive = owner?.localName === 'au-accordion' && owner.hasAttribute('exclusive');
    this._hint.textContent = exclusive ? owner.getAttribute('data-text-exclusive-hint') || 'Only one section may be expanded at a time.' : '';
    if (exclusive) this.button.setAttribute('aria-describedby', this._hint.id);
    else this.button.removeAttribute('aria-describedby');
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
if (typeof customElements !== 'undefined' && !customElements.get('au-accordion')) {
  customElements.define("au-accordion", AuAccordion);
}
