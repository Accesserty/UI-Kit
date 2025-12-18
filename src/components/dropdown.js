class AuDropdown extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.triggerId = this.generateId('trigger');
    this.menuId = this.generateId('menu');
    // 初始化內部狀態
    this._focusIndex = null;

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        button {
          /* behavior */
          anchor-name: --dropdown-anchor;
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);
          
          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          word-break: break-word;
          width: 100%;
          text-align: left;
          padding: var(--au-dropdown-padding-vertical, 0.625rem) var(--au-dropdown-padding-horizontal, 1rem);
          
          /* text */
          color: var(--au-dropdown-text-color, oklch(0.1398 0 0));
          font-size: var(--au-dropdown-text-size, 1rem);
          font-family: var(--au-dropdown-text-family, 'Helvetica, Arial, sans-serif, system-ui');
          line-height: var(--au-dropdown-text-line-height, 1.5);
          
          /* border */
          border: var(--au-dropdown-border-width, 1px) var(--au-dropdown-border-style, solid) var(--au-dropdown-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-dropdown-border-radius, 0);
          
          /* others decoration */
          background-color: var(--au-dropdown-bg, oklch(0.994 0 0));
          transition: background-color 160ms ease-in;

          .heading {
            flex: 1;
          }

          .info {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 0 1 auto;
          }

          .icon {
            transition: transform 300ms ease-in;
            display: flex;
            align-items: middle;
            width: 1rem;
            height: 1rem;
            font-size: 1rem;
            line-height: 1rem;
          }

          &[aria-expanded="true"] {
            .icon {
              transform: rotate3d(0, 0, 1, 180deg);
              transform-origin: center;
            }
          }

          &:hover {
            background-color: var(--au-dropdown-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-dropdown-hover-border-color, oklch(0.7894 0 0));
          }
          
          &:active {
            background-color: var(--au-dropdown-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-dropdown-active-border-color, oklch(0.7894 0 0));
          }
          
          &:focus-visible {
            outline: none;
            box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
          }
        }

        .dropdown-menu {
          position: fixed;
          inset: auto;
          position-anchor: --dropdown-anchor;
          top: anchor(--dropdown-anchor bottom);
          left: anchor(--dropdown-anchor left);
          z-index: 1000;
          min-width: anchor-size(--dropdown-anchor width);
          margin-top: 4px;
          background: var(--au-dropdown-menu-bg, oklch(1 0 0));
          border: var(--au-dropdown-menu-border-width, 1px) var(--au-dropdown-menu-border-style, solid) var(--au-dropdown-menu-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-dropdown-menu-border-radius, 0);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0.5rem 0;
          margin: 0;
        }

        .dropdown-menu:popover-open {
          display: block;
        }

        ::slotted(au-dropdown-item) {
          display: block;
        }
      </style>
      <button 
        type="button" 
        role="button"
        id="${this.triggerId}" 
        popovertarget="${this.menuId}"
        aria-haspopup="menu" 
      >
        <slot name="trigger">Dropdown</slot>
        <svg class="icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
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

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMenuKeyDown = this.handleMenuKeyDown.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  connectedCallback() {
    this.trigger.addEventListener('keydown', this.handleKeyDown);
    this.menu.addEventListener('keydown', this.handleMenuKeyDown);
    this.menu.addEventListener('toggle', this.handleToggle);
  }

  disconnectedCallback() {
    this.trigger.removeEventListener('keydown', this.handleKeyDown);
    this.menu.removeEventListener('keydown', this.handleMenuKeyDown);
    this.menu.removeEventListener('toggle', this.handleToggle);
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-dropdown-${byteArray[0].toString(36)}`;
  }

  // 修正點：移除重複的 open/close，保留這裡的邏輯並加強
  open(index = 0) {
    if (this.isOpen) {
      this.focusItem(index);
    } else {
      // 儲存預計要聚焦的 index，讓 handleToggle 使用
      this._focusIndex = index;
      this.menu.showPopover();
    }
  }

  close() {
    this.menu.hidePopover();
  }

  handleToggle(e) {
    const isOpen = e.newState === 'open';
    this.trigger.setAttribute('aria-expanded', isOpen);
    
    if (isOpen) {
      requestAnimationFrame(() => {
        // 優先使用 open() 指定的 index，如果沒有指定（例如滑鼠點擊），預設為 0
        const indexToFocus = this._focusIndex ?? 0;
        this.focusItem(indexToFocus);
        
        // 重置狀態，避免下次開啟時誤用舊的 index
        this._focusIndex = null;
      });
    } else {
      // 確保關閉時焦點回到 Trigger
      if (document.activeElement?.closest('au-dropdown') === this) {
         this.trigger.focus();
      }
      this._focusIndex = null;
    }
  }

  get isOpen() {
    return this.menu.matches(':popover-open');
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
    return Array.from(this.querySelectorAll('au-dropdown-item'));
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        this.open(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        // 這裡傳入最後一個項目的 index，透過 _focusIndex 傳遞給 handleToggle
        this.open(this.items.length - 1);
        break;
    }
  }

  handleMenuKeyDown(e) {
    const items = this.items;
    const currentIndex = items.indexOf(document.activeElement);

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
        this.close();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }
}

// AuDropdownItem 保持不變
class AuDropdownItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: block;
          outline: none;
        }
        
        .item {
          padding: var(--au-dropdown-item-padding, 0.5rem 1rem);
          cursor: pointer;
          color: var(--au-dropdown-item-color, oklch(0.2 0 0));
          font-family: inherit;
          white-space: nowrap;
          transition: background 150ms ease;
        }

        :host(:focus) .item,
        .item:hover {
          outline: none;
          background: var(--au-dropdown-item-hover-bg, oklch(0.95 0 0));
          color: var(--au-dropdown-item-hover-color, oklch(0.1 0 0));
          box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        :host(:focus) {
          outline: none;
        }
      </style>
      <div class="item" role="menuitem" tabindex="-1">
        <slot></slot>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.item = this.shadowRoot.querySelector('.item');
  }

  connectedCallback() {
    this.setAttribute('tabindex', '-1');
    this.setAttribute('role', 'none'); 

    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('selected', {
        bubbles: true,
        composed: true,
        detail: { value: this.getAttribute('value') }
      }));
      
      const dropdown = this.closest('au-dropdown');
      if (dropdown) dropdown.close();
    });
    
    this.item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = this.querySelector('a');
        if (link) {
          link.click();
        } else {
          this.click();
        }
      }
    });
  }

  focus() {
    this.item.focus();
  }
}

customElements.define("au-dropdown", AuDropdown);
customElements.define("au-dropdown-item", AuDropdownItem);