class AuDropdown extends HTMLElement {
  static get observedAttributes() {
    return ['data-text-trigger'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.triggerId = this.generateId('trigger');
    this.menuId = this.generateId('menu');
    this._returnFocusOnClose = true;

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: inline-block;
          max-inline-size: 100%;
          min-inline-size: 0;
        }
        :is(button) {
          /* behavior */
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);

          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          word-break: break-word;
          width: 100%;
          text-align: start;
          padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);

          /* text */
          color: var(--au-btn-text-color, oklch(0.1398 0 0));
          font-size: var(--au-btn-text-size, 1rem);
          font-family: var(--au-btn-text-family);
          line-height: var(--au-btn-text-line-height, 1.5);

          /* border */
          border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.55 0 0));
          border-radius: var(--au-btn-border-radius, 0);

          /* others decoration */
          background-color: var(--au-btn-bg, oklch(0.994 0 0));
          transition: background-color 160ms ease-in;

          &[data-size="small"] {
            padding: var(--au-btn-small-padding-vertical, 0.25rem) var(--au-btn-small-padding-horizontal, 0.375rem);
          }

          &[data-size="large"] {
            padding: var(--au-btn-large-padding-vertical, 1rem) var(--au-btn-large-padding-horizontal, 1.625rem);
            font-size: var(--au-btn-large-text-size, 1.25rem);
          }

          &:disabled {
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.4;
          }

          &:hover {
            background-color: var(--au-btn-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-btn-hover-border-color, oklch(0.55 0 0));
          }

          &:active {
            background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-btn-active-border-color, oklch(0.55 0 0));
          }

          &:focus-visible {
            outline: var(--au-btn-focus-shadow-width, 3px) solid var(--au-btn-focus-shadow-color, oklch(0.4 0 0));
            outline-offset: 2px;
          }

          .icon {
            display: inline-block;
            line-height: 1;
            margin-inline-start: auto;
          }

          .icon::before {
            content: var(--au-dropdown-arrow-down-icon, var(--au-control-arrow-down-icon, '▼'));
          }

          &[aria-expanded="true"] .icon::before {
            content: var(--au-dropdown-arrow-up-icon, var(--au-control-arrow-up-icon, '▲'));
          }

          &.a11y {
            transition: none;
            text-shadow: var(--au-btn-a11y-text-shadow, none);
            background-image: var(--au-btn-a11y-bg-image, none);

            background-size: var(--au-btn-a11y-bg-size, 1.5rem 1.5rem);
            background-position: var(--au-btn-a11y-bg-position, center center);

            &:hover {
              background-image: var(--au-btn-a11y-hover-bg-image, none);
            }

            &:active {
              background-image: var(--au-btn-a11y-active-bg-image, none);
            }
          }
        }

        .dropdown-menu {
          position: fixed;
          inset: auto;
          z-index: 1000;
          box-sizing: border-box;
          overflow: auto;
          background: var(--au-dropdown-menu-bg, oklch(1 0 0));
          border: var(--au-dropdown-menu-border-width, 1px) var(--au-dropdown-menu-border-style, solid) var(--au-dropdown-menu-border-color, oklch(0.55 0 0));
          border-radius: var(--au-dropdown-menu-border-radius, 0);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0.5rem 0;
          margin: 0;
        }

        .dropdown-menu:popover-open {
          display: block;
        }
        .dropdown-menu[data-inline] { position: static; max-inline-size: 100%; margin-block-start: 4px; }
        .dropdown-menu[hidden] { display: none; }

        ::slotted(au-dropdown-item) {
          display: block;
        }
        @media (forced-colors: active) {
          button:focus-visible { outline: 2px solid Highlight; }
        }
        @media (prefers-reduced-motion: reduce) {
          button { transition: none; }
        }
      </style>
      <button 
        type="button" 
        role="button"
        id="${this.triggerId}" 
        popovertarget="${this.menuId}"
        aria-haspopup="menu" 
        aria-expanded="false"
      >
        <slot name="trigger"><span class="trigger-fallback"></span></slot>
        <span class="icon" aria-hidden="true"></span>
      </button>
      <div 
        id="${this.menuId}" 
        class="dropdown-menu" 
        role="menu" 
        popover="auto"
        aria-labelledby="${this.triggerId}"
      >
        <slot></slot>
      </div>
    `;

    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.trigger = this.shadowRoot.getElementById(this.triggerId);
    this.menu = this.shadowRoot.getElementById(this.menuId);
    this.triggerFallback = this.shadowRoot.querySelector('.trigger-fallback');

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMenuKeyDown = this.handleMenuKeyDown.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this._handleFallbackClick = () => {
      if (!this._nativePopover) this.isOpen ? this.close() : this.open();
    };
    this._dismissFallback = event => {
      if (!this._nativePopover && this.isOpen && !event.composedPath().includes(this)) this.closeWithoutReturningFocus();
    };
    this._positionMenu = this._positionMenu.bind(this);
  }

  connectedCallback() {
    this._nativePopover = typeof this.menu.showPopover === 'function' && typeof this.menu.hidePopover === 'function';
    this.menu.toggleAttribute('data-inline', !this._nativePopover);
    this.menu.hidden = !this._nativePopover;
    if (this._nativePopover) {
      this.menu.setAttribute('popover', 'auto');
      this.trigger.setAttribute('popovertarget', this.menuId);
    } else {
      this.menu.removeAttribute('popover');
      this.trigger.removeAttribute('popovertarget');
    }
    this.updateTriggerFallback();
    this.trigger.setAttribute('aria-expanded', String(this.isOpen));
    this.trigger.addEventListener('keydown', this.handleKeyDown);
    this.menu.addEventListener('keydown', this.handleMenuKeyDown);
    this.menu.addEventListener('toggle', this.handleToggle);
    this.trigger.addEventListener('click', this._handleFallbackClick);
    this.ownerDocument.addEventListener('pointerdown', this._dismissFallback);
    this.ownerDocument.addEventListener('focusin', this._dismissFallback);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-text-trigger' && oldValue !== newValue) {
      this.updateTriggerFallback();
    }
  }

  disconnectedCallback() {
    clearTimeout(this._tabCloseTimer);
    this._restoreTabStops?.();
    this._stopPositionTracking();
    if (!this._nativePopover) this.menu.hidden = true;
    this._returnFocusOnClose = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeEventListener('keydown', this.handleKeyDown);
    this.menu.removeEventListener('keydown', this.handleMenuKeyDown);
    this.menu.removeEventListener('toggle', this.handleToggle);
    this.trigger.removeEventListener('click', this._handleFallbackClick);
    this.ownerDocument.removeEventListener('pointerdown', this._dismissFallback);
    this.ownerDocument.removeEventListener('focusin', this._dismissFallback);
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-dropdown-${byteArray[0].toString(36)}`;
    }
    return `au-dropdown-${Math.random().toString(36).slice(2)}`;
  }

  updateTriggerFallback() {
    if (!this.triggerFallback) return;
    this.triggerFallback.textContent = this.getAttribute('data-text-trigger') || 'Dropdown';
  }

  open(index = 0) {
    if (!this.isConnected) return;
    this._returnFocusOnClose = true;
    if (!this.isOpen) {
      if (this._nativePopover) this.menu.showPopover();
      else this.menu.hidden = false;
    }
    this.trigger.setAttribute('aria-expanded', 'true');
    this._startPositionTracking();
    // showPopover makes the items focusable immediately. Keyboard interaction
    // must not wait for a paint frame (which background/occluded tabs can defer).
    this.focusItem(index);
  }

  close() {
    if (!this.isOpen) return;
    // Firefox can clear focus while hiding the popover, before `toggle` runs.
    const active = this.getRootNode().activeElement;
    const restore = this._returnFocusOnClose && (active === this || this.contains(active));
    if (this._nativePopover) this.menu.hidePopover();
    else this.menu.hidden = true;
    this._stopPositionTracking();
    this.trigger.setAttribute('aria-expanded', 'false');
    if (restore && this.isConnected) this.trigger.focus();
    if (!this._nativePopover) this._returnFocusOnClose = true;
  }

  closeWithoutReturningFocus() {
    this._returnFocusOnClose = false;
    this.close();
  }

  _leaveInlineMenuWithTab() {
    // Keep the focused menuitem rendered until the browser completes Tab.
    // Temporarily exclude consumer links from that sequential traversal so Tab
    // leaves the menu, then restore consumer attributes without moving focus.
    this._restoreTabStops?.();
    const saved = [...this.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter(el => el.closest('au-dropdown') === this && !el.closest('[slot="trigger"]'))
      .map(el => [el, el.getAttribute('tabindex')]);
    for (const [el] of saved) el.setAttribute('tabindex', '-1');
    this._restoreTabStops = () => {
      for (const [el, value] of saved) {
        if (el.getAttribute('tabindex') !== '-1') continue;
        if (value === null) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', value);
      }
      this._restoreTabStops = null;
    };
    clearTimeout(this._tabCloseTimer);
    this._tabCloseTimer = setTimeout(() => {
      this._restoreTabStops?.();
      this.closeWithoutReturningFocus();
    }, 0);
  }

  handleToggle() {
    if (!this.isConnected) return;
    const isOpen = this.isOpen;
    this.trigger.setAttribute('aria-expanded', isOpen);
    if (isOpen) this._startPositionTracking();
    else this._stopPositionTracking();

    if (!isOpen) {
      // Escape/light dismiss should return focus to the trigger, but Tab should
      // keep the browser's natural focus movement instead of creating a loop.
      const active = this.getRootNode().activeElement;
      if (this._returnFocusOnClose && (active === this || this.contains(active))) {
        this.trigger.focus();
      }
      this._returnFocusOnClose = true;
    }
  }

  get isOpen() {
    return this._nativePopover ? this.menu.matches(':popover-open') : !this.menu.hidden;
  }

  set isOpen(val) {
    if (val) {
      if (this.isConnected) {
        if (this._nativePopover) this.menu.showPopover();
        else this.menu.hidden = false;
        this.trigger.setAttribute('aria-expanded', 'true');
        this._startPositionTracking();
      }
    } else {
      this.close();
    }
  }

  _startPositionTracking() {
    if (!this._nativePopover) return;
    this._positionMenu();
    if (this._trackingPosition) return;
    this._trackingPosition = true;
    const view = this.ownerDocument.defaultView;
    view.addEventListener('resize', this._positionMenu);
    view.addEventListener('scroll', this._positionMenu, true);
    view.visualViewport?.addEventListener('resize', this._positionMenu);
    view.visualViewport?.addEventListener('scroll', this._positionMenu);
    if (typeof ResizeObserver !== 'undefined') {
      this._sizeObserver ??= new ResizeObserver(this._positionMenu);
      this._sizeObserver.observe(this.trigger);
      this._sizeObserver.observe(this.menu);
    }
  }

  _stopPositionTracking() {
    this._trackingPosition = false;
    this._sizeObserver?.disconnect();
    const view = this.ownerDocument.defaultView;
    view.removeEventListener('resize', this._positionMenu);
    view.removeEventListener('scroll', this._positionMenu, true);
    view.visualViewport?.removeEventListener('resize', this._positionMenu);
    view.visualViewport?.removeEventListener('scroll', this._positionMenu);
  }

  _positionMenu() {
    if (!this.isConnected || !this._nativePopover || !this.isOpen) return;
    const view = this.ownerDocument.defaultView, viewport = view.visualViewport;
    const left = (viewport?.offsetLeft || 0) + 8, top = (viewport?.offsetTop || 0) + 8;
    const right = left + (viewport?.width || view.innerWidth) - 16;
    const bottom = top + (viewport?.height || view.innerHeight) - 16;
    const anchor = this.trigger.getBoundingClientRect();
    const width = Math.max(0, right - left);
    this.menu.style.maxWidth = width + 'px';
    this.menu.style.minWidth = Math.min(anchor.width, width) + 'px';
    const below = Math.max(0, bottom - anchor.bottom - 4);
    const above = Math.max(0, anchor.top - top - 4);
    const placeAbove = this.menu.scrollHeight > below && above > below;
    this.menu.style.maxHeight = (placeAbove ? above : below) + 'px';
    const box = this.menu.getBoundingClientRect();
    const start = getComputedStyle(this).direction === 'rtl' ? anchor.right - box.width : anchor.left;
    this.menu.style.left = Math.max(left, Math.min(start, right - box.width)) + 'px';
    this.menu.style.top = Math.max(top, Math.min(placeAbove ? anchor.top - box.height - 4 : anchor.bottom + 4, bottom - box.height)) + 'px';
  }

  focusItem(index) {
    const items = this.items;
    if (items.length > 0) {
      // 修正：確保 index 在有效範圍內
      let idx = index;
      if (idx < 0) idx = items.length - 1;
      if (idx >= items.length) idx = 0;

      items[idx].focus();
    }
  }

  get items() {
    return Array.from(this.querySelectorAll('au-dropdown-item')).filter(item => item.closest('au-dropdown') === this);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'Spacebar':
      case 'ArrowDown':
        e.preventDefault();
        this.open(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.open(this.items.length - 1);
        break;
    }
  }

  handleMenuKeyDown(e) {
    const items = this.items;
    // composedPath retains the actual option through containing shadow roots.
    const currentItem = e.composedPath().find(node => node instanceof HTMLElement && node.localName === 'au-dropdown-item');
    if (currentItem && !items.includes(currentItem)) return;
    const currentIndex = items.indexOf(currentItem);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusItem(currentIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusItem(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        this.focusItem(items.length - 1);
        break;
      case 'Tab':
        if (this._nativePopover) this.closeWithoutReturningFocus();
        else this._leaveInlineMenuWithTab();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }
}

class AuDropdownItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: block;
          outline: none;
        }
        
        .item {
          padding: var(--au-dropdown-item-padding, 0.5rem 1rem);
          cursor: pointer;
          color: var(--au-dropdown-item-color, oklch(0.2 0 0));
          font-family: inherit;
          white-space: normal;
          overflow-wrap: anywhere;
          transition: background 150ms ease;
        }

        .item:focus,
        .item:hover {
          outline: none;
          background: var(--au-dropdown-item-hover-bg, oklch(0.95 0 0));
          color: var(--au-dropdown-item-hover-color, oklch(0.1 0 0));
          box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.4 0 0));
        }

        :host(:focus) {
          outline: none;
        }
        @media (forced-colors: active) {
          .item:focus { outline: 2px solid Highlight; outline-offset: -2px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .item { transition: none; }
        }
      </style>
      <div class="item" role="menuitem" tabindex="-1">
        <slot></slot>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.item = this.shadowRoot.querySelector('.item');
    this.handleClick = this.handleClick.bind(this);
    this.handleItemKeyDown = this.handleItemKeyDown.bind(this);
  }

  connectedCallback() {
    this.setAttribute('tabindex', '-1');
    this.setAttribute('role', 'none');

    this.addEventListener('click', this.handleClick);
    this.item.addEventListener('keydown', this.handleItemKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    this.item.removeEventListener('keydown', this.handleItemKeyDown);
  }

  handleClick() {
    this.dispatchEvent(new CustomEvent('selected', {
      bubbles: true,
      composed: true,
      detail: { value: this.getAttribute('value') }
    }));

    const dropdown = this.closest('au-dropdown');
    if (dropdown) dropdown.close();
  }

  handleItemKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const link = this.querySelector('a');
      if (link) {
        link.click();
      } else {
        this.click();
      }
    }
  }

  focus(options) {
    this.item.focus(options);
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('au-dropdown')) customElements.define("au-dropdown", AuDropdown);
  if (!customElements.get('au-dropdown-item')) customElements.define("au-dropdown-item", AuDropdownItem);
}
