class AuTabs extends HTMLElement {
  static get observedAttributes() {
    return ['data-text-tab', 'data-text-tab-lang', 'data-text-badge-label-prefix', 'selected-index', 'aria-label', 'aria-labelledby'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tabs = [];
    this._panels = [];
    this._selectedIndex = -1;
    this._entries = new Map();

    this.container = document.createElement("div");
    this.container.classList.add("au-tabs");

    const style = document.createElement("style");
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .au-tabs { min-width: 0; }
      .au-tablist-item { flex-shrink: 0; max-width: 100%; }
      .label, .prefix, .badge, .affix { min-width: 0; overflow-wrap: anywhere; }
      .au-tablist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
        max-width: 100%;
      }

      .au-tablist-item{
        &:first-of-type {
          [role="tab"] {
            border-top-left-radius: var(--au-tabs-border-radius, 0);
          }
        }
        &:last-of-type {
          [role="tab"] {
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
            border-top-right-radius: var(--au-tabs-border-radius, 0);
          }
        }
      }

      button[role="tab"] {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.25rem;
        padding: var(--au-tabs-padding-vertical, 0.625rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: var(--au-tabs-text-color, oklch(0.1398 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family);
        line-height: var(--au-tabs-text-line-height, 1.5);
        white-space: normal;
        box-sizing: border-box;
        max-width: 100%;
        min-width: 24px;
        min-height: 24px;

        /* background */
        background-color: var(--au-tabs-bg, oklch(0.9731 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: var(--au-tabs-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-tabs-active-bg, oklch(0.8689 0 0));
        }

        &[aria-selected="true"] {
          text-decoration: underline;
          text-underline-offset: 0.2em;
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(0.994 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(0.55 0 0));
          background-color: var(--au-tabs-selected-bg, oklch(0.1398 0 0));
          color: var(--au-tabs-selected-text-color, oklch(0.994 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
        }
      }

      button[aria-selected="true"]:focus-visible {
        box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-selected-focus-shadow-color, white);
      }
      @media (prefers-reduced-motion: reduce) {
        button[role="tab"] { transition: none; }
      }
      @media (forced-colors: active) {
        button[aria-selected="true"] { border-bottom: 3px solid ButtonText; }
        button[role="tab"]:focus-visible { outline: 2px solid Highlight; outline-offset: -4px; }
      }
      .au-tablist:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.625rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: var(--au-tab-badge-bg, oklch(0.8689 0 0));
        color: var(--au-tab-badge-text-color, oklch(0.1398 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.625rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }

       ::slotted(.au-tab-panel) {
        box-sizing: border-box;
        min-width: 0;
        overflow-wrap: anywhere;
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
      ::slotted(.au-tab-panel:focus-visible) {
        outline: 2px solid var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
        outline-offset: -2px;
      }
      @media (forced-colors: active) {
        ::slotted(.au-tab-panel:focus-visible) { outline-color: Highlight; }
      }
    `;

    this.tabsList = document.createElement("ul");
    this.tabsList.setAttribute("role", "tablist");
    this.tabsList.classList.add("au-tablist");

    const slot = document.createElement("slot");
    slot.name = "panel";
    this._slot = slot;
    slot.addEventListener("slotchange", () => this._renderTabs());
    this.tabsList.tabIndex = -1;
    this.tabsList.setAttribute("aria-orientation", "horizontal");

    this.container.append(style, this.tabsList, slot);
    this.shadowRoot.appendChild(this.container);
  }

  connectedCallback() {
    if (Object.hasOwn(this, 'selectedIndex')) {
      const value = this.selectedIndex; delete this.selectedIndex; this.selectedIndex = value;
    }
    this._observer ??= new MutationObserver(records => {
      if (records.some(record => record.target === this || record.target.parentNode === this)) this._renderTabs();
    });
    this._observer.observe(this, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['label', 'label-lang', 'data-prefix', 'data-badge', 'data-affix', 'id', 'class', 'slot'],
    });
    this._referenceObserver ??= new MutationObserver(() => this._updateLabel());
    this._root = this.getRootNode();
    this._referenceObserver.observe(this._root, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['id', 'aria-label'],
    });
    this._onRootFocusIn ??= event => {
      this._focusInPanel = this._panels.find(panel => event.composedPath().includes(panel)) || null;
    };
    this._root.addEventListener('focusin', this._onRootFocusIn);
    this._renderTabs();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._referenceObserver?.disconnect();
    this._root?.removeEventListener('focusin', this._onRootFocusIn);
    this._focusInPanel = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'selected-index') this.selectedIndex = newValue === null ? 0 : newValue;
    else if (this.isConnected) this._renderTabs();
  }

  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }

  _writePanel(entry, name, value) {
    const current = entry.panel.getAttribute(name);
    if (!entry.originals.has(name) || current !== entry.written.get(name)) entry.originals.set(name, current);
    if (current !== value) {
      if (value === null) entry.panel.removeAttribute(name);
      else entry.panel.setAttribute(name, value);
    }
    entry.written.set(name, value);
  }

  _releasePanel(entry) {
    // Restore only attributes still owned by this component, never later consumer edits.
    for (const [name, value] of entry.originals) {
      if (entry.panel.getAttribute(name) !== entry.written.get(name)) continue;
      if (value === null) entry.panel.removeAttribute(name);
      else entry.panel.setAttribute(name, value);
    }
  }

  _renderTabs() {
    const panels = this._slot.assignedElements().filter(panel => panel.classList.contains('au-tab-panel'));
    const focusedTab = this.shadowRoot.activeElement;
    const lostPanelFocus = this._focusInPanel && !panels.includes(this._focusInPanel);
    const entries = new Map();
    for (const [index, panel] of panels.entries()) {
      let entry = this._entries.get(panel);
      if (!entry) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation'); li.className = 'au-tablist-item';
        const button = document.createElement('button');
        button.type = 'button'; button.setAttribute('role', 'tab');
        button.id = 'tab-' + this.generateId();
        li.append(button);
        entry = {panel, li, button, originals: new Map(), written: new Map()};
        button.addEventListener('click', () => this._selectTab(this._panels.indexOf(panel)));
        button.addEventListener('keydown', event => this._onKeydown(event, this._panels.indexOf(panel)));
      }
      if (!panel.id) this._writePanel(entry, 'id', 'panel-' + this.generateId());
      const label = panel.getAttribute('label') || this.formatText(this.getAttribute('data-text-tab') || 'Tab {index}', {index: index + 1});
      const lang = panel.getAttribute('label-lang') || this.getAttribute('data-text-tab-lang') || '';
      entry.label = label;
      this._writePanel(entry, 'role', 'tabpanel');
      // Light-DOM panels cannot reference a button inside a descendant shadow root.
      this._writePanel(entry, 'aria-label', label);
      if ('ariaControlsElements' in entry.button) entry.button.ariaControlsElements = [panel];
      const fragment = document.createDocumentFragment();
      for (const [className, text] of [
        ['prefix', panel.getAttribute('data-prefix')], ['label', label],
        ['badge', panel.getAttribute('data-badge')], ['affix', panel.getAttribute('data-affix')],
      ]) {
        if (!text) continue;
        const span = document.createElement('span');
        span.className = className; span.textContent = text;
        if (className === 'label' && lang) span.lang = lang;
        if (className === 'badge') span.setAttribute('aria-label', `${this.getAttribute('data-text-badge-label-prefix') || 'Additional information:'} ${text}`);
        fragment.append(span);
      }
      entry.button.replaceChildren(fragment);
      entries.set(panel, entry);
    }
    for (const [panel, entry] of this._entries) {
      if (!entries.has(panel)) { this._releasePanel(entry); entry.li.remove(); }
    }
    let index = 0;
    for (const entry of entries.values()) {
      if (this.tabsList.children[index] !== entry.li) this.tabsList.insertBefore(entry.li, this.tabsList.children[index] || null);
      index++;
    }
    this._entries = entries;
    this._panels = panels;
    this._tabs = [...entries.values()].map(entry => entry.button);
    let selected = panels.indexOf(this._selectedPanel);
    if (this._pendingIndex !== undefined) selected = Math.min(this._pendingIndex, panels.length - 1);
    else if (selected < 0) selected = Math.min(Math.max(this._selectedIndex, 0), panels.length - 1);
    if (panels.length) this._pendingIndex = undefined;
    this._selectedIndex = selected;
    this._selectedPanel = panels[selected] || null;
    this._syncSelection();
    this._updateLabel();
    if (focusedTab && this._tabs.includes(focusedTab)) {
      if (this.shadowRoot.activeElement !== focusedTab) focusedTab.focus();
    } else if (focusedTab || lostPanelFocus) {
      (this._tabs[selected] || this.tabsList).focus();
    }
  }

  _syncSelection() {
    for (const [index, panel] of this._panels.entries()) {
      const entry = this._entries.get(panel), selected = index === this._selectedIndex;
      entry.button.setAttribute('aria-selected', String(selected));
      entry.button.tabIndex = selected ? 0 : -1;
      entry.li.classList.toggle('au-tablist-item--selected', selected);
      this._writePanel(entry, 'aria-hidden', String(!selected));
      this._writePanel(entry, 'hidden', selected ? null : '');
      this._writePanel(entry, 'inert', selected ? null : '');
      const currentTabindex = panel.getAttribute('tabindex');
      const originalTabindex = entry.written.has('tabindex') && currentTabindex === entry.written.get('tabindex')
        ? entry.originals.get('tabindex') : currentTabindex;
      this._writePanel(entry, 'tabindex', selected ? originalTabindex ?? '0' : '-1');
    }
  }

  _updateLabel() {
    const root = this.getRootNode();
    const labels = (this.getAttribute('aria-labelledby') || '').trim().split(/\s+/)
      .filter(Boolean).map(id => root.getElementById?.(id)).filter(element => element && element !== this);
    const explicit = this.getAttribute('aria-label');
    this.tabsList.removeAttribute('aria-labelledby');
    if (explicit) this.tabsList.setAttribute('aria-label', explicit);
    else this.tabsList.removeAttribute('aria-label');
    if ('ariaLabelledByElements' in this.tabsList) this.tabsList.ariaLabelledByElements = labels;
    else if (!explicit && labels.length) this.tabsList.setAttribute('aria-label', labels.map(element => element.getAttribute('aria-label') || element.textContent).join(' ').trim());
  }

  _selectTab(index, {focus = true, emit = true} = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= this._tabs.length) return;
    const changed = this._selectedIndex !== index;
    const focusWasInPanel = this._focusInPanel && this._focusInPanel !== this._panels[index];
    this._selectedIndex = index;
    this._selectedPanel = this._panels[index];
    this._syncSelection();
    if (focus || focusWasInPanel || this._tabs.includes(this.shadowRoot.activeElement)) this._tabs[index].focus();
    if (changed && emit) this.dispatchEvent(new CustomEvent('tab-change', {
      bubbles: true, composed: true,
      detail: {index, label: this._entries.get(this._selectedPanel).label},
    }));
  }

  _onKeydown(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey || index < 0) return;
    const last = this._tabs.length - 1;
    const rtl = getComputedStyle(this._tabs[index]).direction === 'rtl';
    const key = rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : event.key;
    let next;
    switch (key) {
      case 'ArrowRight': next = index === last ? 0 : index + 1; break;
      case 'ArrowLeft': next = index === 0 ? last : index - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = last; break;
      default: return;
    }
    event.preventDefault();
    this._selectTab(next);
  }

  get selectedIndex() { return this._selectedIndex; }

  set selectedIndex(value) {
    const index = Number(value);
    if (!Number.isInteger(index) || index < 0) return;
    if (!this._tabs.length) { this._pendingIndex = index; return; }
    this._selectTab(Math.min(index, this._tabs.length - 1), {focus: false, emit: false});
  }

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint32Array(1);
      crypto.getRandomValues(bytes);
      return bytes[0].toString(36);
    }
    return Math.random().toString(36).slice(2);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-tabs')) {
  customElements.define("au-tabs", AuTabs);
}
