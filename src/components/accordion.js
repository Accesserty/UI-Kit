import { setupShadow } from '../core/declarative.js';
import { DEFAULT_EXCLUSIVE_HINT, renderAccordion, renderAccordionItem } from '../views/accordion.js';
import { upgradeProperties } from '../core/upgrade.js';

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
