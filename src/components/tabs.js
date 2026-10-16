import { uid } from '../core/id.js';
import { setupShadow } from '../core/declarative.js';
import { DEFAULT_BADGE_LABEL_PREFIX, renderTab, renderTabContent, renderTabs, tabLabel } from '../views/tabs.js';
import { upgradeProperties } from '../core/upgrade.js';

class AuTabs extends HTMLElement {
  static get observedAttributes() {
    return ['data-text-tab', 'data-text-tab-lang', 'data-text-badge-label-prefix', 'selected-index', 'aria-label', 'aria-labelledby'];
  }

  constructor() {
    super();
    this._tabs = [];
    this._panels = [];
    this._selectedIndex = -1;
    this._entries = new Map();
    this._nextTabId = 1;
    // Adopts a server-rendered declarative root when present (core/declarative.js).
    setupShadow(this, () => renderTabs(), (root, adopted) => {
      this.container = root.querySelector('.au-tabs');
      this.tabsList = root.querySelector('ul.au-tablist');
      this._slot = root.querySelector('slot[name="panel"]');
      this._slot.addEventListener("slotchange", () => this._renderTabs());
      // Server-rendered tabs are claimed in order by the panels they belong to.
      if (adopted) {
        this._serverItems = [...this.tabsList.children];
        this._nextTabId = this._serverItems.length + 1;
      }
      this._bound = true;
      if (this.isConnected) this.connectedCallback();
      // The server's interim rule showed the selected panel; panels carry their own state now.
      root.querySelector('style[data-preselect]')?.remove();
    });
  }

  connectedCallback() {
    if (!this._bound) return;
    upgradeProperties(this, ['selectedIndex']);
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
    else if (this._bound && this.isConnected) this._renderTabs();
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
        let li = this._serverItems?.shift();
        if (!li) {
          const template = document.createElement('template');
          template.innerHTML = renderTab({}, {id: `tab-${this._nextTabId++}`});
          li = template.content.firstElementChild;
        }
        const button = li.querySelector('[role="tab"]');
        entry = {panel, li, button, originals: new Map(), written: new Map()};
        button.addEventListener('click', () => this._selectTab(this._panels.indexOf(panel)));
        button.addEventListener('keydown', event => this._onKeydown(event, this._panels.indexOf(panel)));
      }
      if (!panel.id) this._writePanel(entry, 'id', 'panel-' + uid());
      const label = tabLabel(panel.getAttribute('label'), this.getAttribute('data-text-tab'), index);
      const lang = panel.getAttribute('label-lang') || this.getAttribute('data-text-tab-lang') || '';
      entry.label = label;
      this._writePanel(entry, 'role', 'tabpanel');
      // Light-DOM panels cannot reference a button inside a descendant shadow root.
      this._writePanel(entry, 'aria-label', label);
      if ('ariaControlsElements' in entry.button) entry.button.ariaControlsElements = [panel];
      const content = renderTabContent({
        label, lang, prefix: panel.getAttribute('data-prefix'),
        badge: panel.getAttribute('data-badge'), affix: panel.getAttribute('data-affix'),
      }, this.getAttribute('data-text-badge-label-prefix') || DEFAULT_BADGE_LABEL_PREFIX);
      // Unchanged content keeps its nodes (and the adopted server markup).
      if (entry.button.innerHTML !== content) entry.button.innerHTML = content;
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
    if (changed && emit) this.dispatchEvent(new CustomEvent('au-tab-change', {
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

}

if (typeof customElements !== 'undefined' && !customElements.get('au-tabs')) {
  customElements.define("au-tabs", AuTabs);
}
