/*! Accesserty UI Kit v3.0.0 */
(function () {
  'use strict';

  // Shadow root setup for components that support declarative Shadow DOM.
  //
  // A server can send a component's shadow root as
  // `<au-x><template shadowrootmode="open">…</template>…</au-x>`. The browser
  // turns that template into the shadow root while parsing, so the component
  // must adopt it instead of building (and wiping) its own.
  //
  // While the document is still parsing, a host can be constructed before its
  // template child has arrived: a synchronous script defined the element early,
  // or streamed server rendering hydrated part of the page first. In that case
  // the decision waits for DOMContentLoaded. Otherwise it happens immediately.

  /**
   * @param {HTMLElement} host
   * @param {() => string} render   markup for a shadow root the component builds itself
   * @param {(root: ShadowRoot, adopted: boolean) => void} bind  look up nodes, add listeners, sync state
   */
  function setupShadow(host, render, bind) {
    const internals = host.attachInternals();
    const ready = () => {
      const adopted = !!internals.shadowRoot;
      const root = internals.shadowRoot ?? host.attachShadow({ mode: 'open' });
      if (!adopted) {
        // Declarative markup inserted without the HTML parser (innerHTML) stays an
        // inert <template> in the light DOM; the component's own root replaces it.
        host.querySelector(':scope > template[shadowrootmode]')?.remove();
        root.innerHTML = render();
      }
      bind(root, adopted);
    };
    if (internals.shadowRoot || host.ownerDocument.readyState !== 'loading') ready();
    else host.ownerDocument.addEventListener('DOMContentLoaded', ready, { once: true });
  }

  // Text and attribute escaping for markup rendered on the server and in the browser.
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  }

  // Shadow DOM markup and styles for au-accordion and au-accordion-item.
  // Pure functions with no DOM access: the browser builds shadow roots from them
  // and server rendering emits the same markup as declarative shadow roots.
  // Ids are fixed: each shadow root is its own id scope.

  const DEFAULT_EXCLUSIVE_HINT = 'Only one section may be expanded at a time.';

  const VISUALLY_HIDDEN = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;';

  const accordionStyles = `:host([hidden]:not([hidden="until-found" i])) { display: none; }`;

  /** @param { exclusive?: boolean, hint?: string } [state] */
  function renderAccordion({ exclusive = false, hint = DEFAULT_EXCLUSIVE_HINT } = {}) {
    return `<style>${accordionStyles}</style>`
      + `<span id="hint" style="${VISUALLY_HIDDEN}"${exclusive ? '' : ' hidden'}>${exclusive ? escapeHTML(hint) : ''}</span>`
      + `<div class="au-accordion"${exclusive ? ' aria-describedby="hint"' : ''}><slot></slot></div>`;
  }

  const accordionItemStyles = `
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
        font-family: var(--au-accordion-heading-text-family, inherit);
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
        &[hidden]:not([hidden="until-found" i]) {
          display: none !important;
        }
        /* Collapsed but searchable: find-in-page and fragment links can reveal it.
           Zero the box so no padded strip shows, even under ::part() overrides. */
        &[hidden="until-found" i] {
          content-visibility: hidden;
          padding-block: 0 !important;
          border-bottom-width: 0 !important;
        }
      }
      .exclusive-hint { position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }
      @media (forced-colors: active) { button:focus-visible { outline: 2px solid Highlight; outline-offset:-2px; } }
      @media (prefers-reduced-motion: reduce) { button, button .icon { transition: none; } }
`;

  /**
   * @param {{ open?: boolean, headingLevel?: number, region?: boolean, hint?: string }} [state]
   * `hint` is the group's exclusive instruction, or empty when the group is not exclusive.
   */
  function renderAccordionItem({ open = false, headingLevel = 3, region = true, hint = '' } = {}) {
    const level = Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6 ? headingLevel : 3;
    return `<div class="au-accordion-item"><style>${accordionItemStyles}</style>`
      + `<div role="heading" aria-level="${level}">`
      + `<button type="button" id="title" aria-expanded="${open}" aria-controls="region" part="button"${hint ? ' aria-describedby="hint"' : ''}>`
      + `<div class="heading"><slot name="heading"></slot></div>`
      + `<div class="info"><div><slot name="sub"></slot></div><div class="icon" aria-hidden="true"><slot name="icon"></slot></div></div>`
      + `</button></div>`
      + `<span class="exclusive-hint" id="hint">${escapeHTML(hint)}</span>`
      + `<div class="region"${region ? ' role="region" aria-labelledby="title"' : ''} id="region"${open ? '' : ' hidden="until-found"'} part="region"><slot name="content"></slot></div>`
      + `</div>`;
  }

  // A property set before the element was defined is stored on the instance
  // and hides the class's accessor. Take it off and assign it again, so the
  // setter runs (and the value is reflected) once the element is upgraded.
  function upgradeProperties(element, names) {
    for (const name of names) {
      if (Object.hasOwn(element, name)) {
        const value = element[name];
        delete element[name];
        element[name] = value;
      }
    }
  }

  // Both elements adopt a server-rendered declarative shadow root when present
  // (see core/declarative.js). Until the root is ready (_bound), lifecycle
  // callbacks do nothing; bind() then runs the connected setup once.

  class AuAccordion extends HTMLElement {
    constructor() {
      super();
      this._onToggle = this._handleToggle.bind(this);
      this._childrenObserver = new MutationObserver(() => this._syncItems());
      setupShadow(this, () => renderAccordion(), root => {
        this._exclusiveHint = root.getElementById('hint');
        this._container = root.querySelector('.au-accordion');
        this._bound = true;
        if (this.isConnected) this.connectedCallback();
      });
    }

    connectedCallback() {
      if (!this._bound) return;
      upgradeProperties(this, ['exclusive']);
      this.addEventListener('au-toggle', this._onToggle);
      this._childrenObserver.observe(this, { childList: true });
      this._updateExclusiveAria();
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
      if (!this._bound) return;
      if (name === 'exclusive' && oldValue !== newValue) {
        this._updateExclusiveAria();
      }
      if (name === 'data-text-exclusive-hint' && oldValue !== newValue) {
        this._updateExclusiveHint();
      }
    }

    _updateExclusiveHint() {
      if (!this._exclusiveHint) return;
      this._exclusiveHint.hidden = !this.exclusive;
      this._exclusiveHint.textContent = this.exclusive
        ? this.getAttribute('data-text-exclusive-hint') || DEFAULT_EXCLUSIVE_HINT
        : '';
      this._syncItems();
    }

    _updateExclusiveAria() {
      if (this.exclusive) {
        this._container.setAttribute('aria-describedby', this._exclusiveHint.id);
      } else {
        this._container.removeAttribute('aria-describedby');
      }
      this._updateExclusiveHint();
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
      // An element upgraded in place gets one callback per attribute it already
      // has. That is its initial state, not a change, so it emits no au-toggle.
      this._initialOpen = this.isConnected && this.hasAttribute('open');
      setupShadow(this, () => renderAccordionItem(), root => {
        this.button = root.getElementById('title');
        this.region = root.getElementById('region');
        this.heading = root.querySelector('[role="heading"]');
        this._hint = root.getElementById('hint');
        this.button.addEventListener('click', () => this.toggleAccordion());
        // Find-in-page or a link into collapsed content opens the item; the usual
        // au-toggle follows, so framework bindings and exclusive groups stay in step.
        // The browser removes hidden itself after this event. Removing it here would
        // stop Chrome from revealing enclosing items, so the region is resynced later.
        this.region.addEventListener('beforematch', () => {
          this._revealing = true;
          try { this.open = true; } finally { this._revealing = false; }
          setTimeout(() => this.updateExpanded());
        });
        this._bound = true;
        if (this.isConnected) this.connectedCallback();
      });
    }

    connectedCallback() {
      if (!this._bound) return;
      upgradeProperties(this, ['open']);
      this.updateExpanded();
      this.updateSemantics();
      this.updateExclusiveHint();
    }

    static supportsUntilFound = typeof HTMLElement !== 'undefined' && 'onbeforematch' in HTMLElement.prototype;

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
      if (oldValue === newValue || !this._bound) return;
      if (name !== 'open') { this.updateSemantics(); return; }
      this.updateExpanded();
      const initial = this._initialOpen && oldValue === null;
      this._initialOpen = false;
      if (this.isConnected && !initial) {
        this.dispatchEvent(new CustomEvent('au-toggle', {
          bubbles: true,
          composed: true,
          detail: { open: this.open },
        }));
      }
    }

    updateExpanded() {
      if (!this._bound) return;
      const isOpen = this.hasAttribute('open');
      // Walk the composed ancestry so slotted controls and nested shadow controls
      // return to their own header before the panel becomes hidden/inert.
      let active = this.ownerDocument.activeElement;
      while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
      for (let node = active; !isOpen && node; node = node.assignedSlot || node.parentNode || node.host) {
        if (node === this.region) { this.button.focus({preventScroll:true}); break; }
      }
      this.button.setAttribute('aria-expanded', isOpen);
      if (isOpen && this._revealing) return;
      if (isOpen) {
        this.region.removeAttribute('hidden');
        this.region.inert = false;
      } else if (AuAccordionItem.supportsUntilFound) {
        // inert would also block find-in-page, so until-found stands alone here.
        this.region.setAttribute('hidden', 'until-found');
        this.region.inert = false;
      } else {
        this.region.hidden = true;
        this.region.inert = true;
      }
    }

    updateSemantics() {
      if (!this._bound) return;
      const level = Number(this.getAttribute('heading-level'));
      this.heading.setAttribute('aria-level', String(Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3));
      if (this.hasAttribute('no-region')) {
        this.region.removeAttribute('role'); this.region.removeAttribute('aria-labelledby');
      } else {
        this.region.setAttribute('role','region'); this.region.setAttribute('aria-labelledby',this.button.id);
      }
    }

    updateExclusiveHint() {
      if (!this._bound) return;
      const owner = this.parentElement;
      const exclusive = owner?.localName === 'au-accordion' && owner.hasAttribute('exclusive');
      this._hint.textContent = exclusive ? owner.getAttribute('data-text-exclusive-hint') || DEFAULT_EXCLUSIVE_HINT : '';
      if (exclusive) this.button.setAttribute('aria-describedby', this._hint.id);
      else this.button.removeAttribute('aria-describedby');
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

})();
