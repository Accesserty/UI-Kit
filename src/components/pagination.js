class AuPagination extends HTMLElement {
  static get observedAttributes() {
    return [
      'data-total', 'data-current-page', 'data-pager-count',
      'data-page-size', 'data-page-size-options', 'data-layout',
      'data-text-total-pages-prefix', 'data-text-page', 'data-text-total-items-suffix',
      'data-text-per', 'data-text-first', 'data-text-prev',
      'data-text-next', 'data-text-last', 'data-text-go', 'data-text-goto',
      'data-text-pagination-label', 'data-text-page-size', 'data-text-page-announcement'
    ];
  }

  // generate unique IDs for input and select
  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-pagination-${byteArray[0].toString(36)}`;
    }
    return `au-pagination-${Math.random().toString(36).slice(2)}`;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // unique IDs for accessibility
    this._selectId = AuPagination.generateId();
    this._jumpId = AuPagination.generateId();
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'visually-hidden';
    this._nodes = new Map();
    this._parseAttributes();
    this._render();
  }

  connectedCallback() {
    for (const key of ['total', 'currentPage', 'pageSize', 'pagerCount', 'layout', 'pageSizeOptions']) {
      if (Object.hasOwn(this, key)) { const value = this[key]; delete this[key]; this[key] = value; }
    }
    this._requestRender();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._renderFrame);
    cancelAnimationFrame(this._announceFrame);
    this._updatePending = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._parseAttributes();
    this._requestRender();
  }

  _requestRender() {
    if (this._updatePending) return;
    this._updatePending = true;
    this._renderFrame = requestAnimationFrame(() => {
      this._updatePending = false;
      this._render();
    });
  }

  _parseAttributes() {
    const integer = (value, fallback, min = 1) => {
      const number = Number(value);
      return (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isSafeInteger(number) && number >= min ? number : fallback;
    };
    this._total = integer(this.getAttribute('data-total'), 0, 0);
    this._pageSize = integer(this.getAttribute('data-page-size'), 10);
    this._currentPage = Math.min(integer(this.getAttribute('data-current-page'), 1), this.totalPages);
    this._pagerCount = Math.min(integer(this.getAttribute('data-pager-count'), 5), 100);
    const opts = this.getAttribute('data-page-size-options');
    if (opts) {
      try { this._pageSizeOptions = JSON.parse(opts); }
      catch { this._pageSizeOptions = opts.split(',').map(n => n.trim()); }
    } else {
      this._pageSizeOptions = [10, 30, 50, 100];
    }
    this._pageSizeOptions = Array.isArray(this._pageSizeOptions)
      ? [...new Set(this._pageSizeOptions.map(value => integer(value, 0)).filter(Boolean))] : [10, 30, 50, 100];
    const lay = this.getAttribute('data-layout');
    if (lay) {
      try { this._layout = JSON.parse(lay); }
      catch { this._layout = lay.replace(/[[\]' ]/g, '').split(','); }
    } else {
      this._layout = ['total_page', 'total_items', 'page_size', 'first', 'prev', 'pages', 'next', 'last', 'jump'];
    }
    const supported = ['total_page', 'total_items', 'page_size', 'first', 'prev', 'pages', 'next', 'last', 'jump'];
    this._layout = Array.isArray(this._layout) ? [...new Set(this._layout.filter(value => supported.includes(value)))] : supported;
    this.texts = {
      totalPagesPrefix: this.getAttribute('data-text-total-pages-prefix') || 'Total',
      pageSuffix: this.getAttribute('data-text-page') || 'page(s)',
      totalItemsSuffix: this.getAttribute('data-text-total-items-suffix') || 'item(s)',
      perText: this.getAttribute('data-text-per') || 'each page',
      firstText: this.getAttribute('data-text-first') || 'First',
      prevText: this.getAttribute('data-text-prev') || 'Prev',
      nextText: this.getAttribute('data-text-next') || 'Next',
      lastText: this.getAttribute('data-text-last') || 'Last',
      goText: this.getAttribute('data-text-go') || 'go to',
      gotoText: this.getAttribute('data-text-goto') || 'go to',
      paginationLabel: this.getAttribute('data-text-pagination-label') || 'pagination',
      pageSizeText: this.getAttribute('data-text-page-size') || 'Page size',
      pageAnnouncement: this.getAttribute('data-text-page-announcement') || 'Page {page}'
    };
  }

  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }

  get total() { return this._total; }
  set total(value) { this.setAttribute('data-total', String(value)); }
  get currentPage() { return this._currentPage; }
  set currentPage(value) { this.setAttribute('data-current-page', String(value)); }
  get pageSize() { return this._pageSize; }
  set pageSize(value) { this.setAttribute('data-page-size', String(value)); }
  get pagerCount() { return this._pagerCount; }
  set pagerCount(value) { this.setAttribute('data-pager-count', String(value)); }

  get pageSizeOptions() {
    return [...(this._pageSizeOptions ?? [10, 30, 50, 100])];
  }

  set pageSizeOptions(val) {
    this.setAttribute('data-page-size-options', JSON.stringify(val));
  }

  get layout() {
    return [...(this._layout ?? ['total_page', 'total_items', 'page_size', 'first', 'prev', 'pages', 'next', 'last', 'jump'])];
  }

  set layout(val) {
    this.setAttribute('data-layout', JSON.stringify(val));
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  get pagers() {
    const groupIndex = Math.floor((this.currentPage - 1) / this.pagerCount);
    const start = groupIndex * this.pagerCount + 1;
    const end = Math.min(start + this.pagerCount - 1, this.totalPages);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  _render() {
    const t = this.texts;
    const layout = this.layout;
    const totalPages = this.totalPages;
    const totalItems = this.total;

    if (!this._style) {
    const style = document.createElement('style');
    style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-inline-size: 0; }
      *, *::before, *::after { box-sizing: border-box; }
      button, select, input { min-inline-size: 24px; min-block-size: 24px; max-inline-size: 100%; }
      input { inline-size: 7rem; }
      label, span, button { overflow-wrap: anywhere; }
      :is(ul, ol) {
        list-style: none;
        margin: 0;
        padding: 0;
      } 
      :is(button, select, input) {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);

        /* spacing */
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
          outline: 2px solid var(--au-pagination-focus-color, #222);
          outline-offset: 2px;
        }

        &[aria-current="page"] {
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 0.2em;
          cursor: not-allowed;
          pointer-events: none;
          background-color: var(--au-btn-current-bg, oklch(0.7894 0 0));
          color: var(--au-btn-current-text-color, oklch(0.1398 0 0));
          border-color: var(--au-btn-current-border-color, oklch(0.55 0 0));
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

      .visually-hidden { 
        position: absolute; 
        width: 1px; 
        height: 1px; 
        padding: 0; 
        margin: -1px; 
        overflow: hidden; 
        clip: rect(0,0,0,0); 
        border: 0;
      }

      .au-pagination {
        container-type: inline-size;
        position: relative;
      }

      :is(.au-pagination-container, .au-pagination-group, .pagination-buttons) {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .au-pagination-container {
        gap: 1rem;
        @container (width <= 640px) {
          flex-direction: column;
        }
      }

      :is(.au-pagination-group) {
        gap: 0.625rem;
        justify-content: center;
      }

      .pagination-buttons {
        gap: 0.625rem;
        justify-content: center;
      }
      @media (prefers-reduced-motion: reduce) { button, input, select { transition: none; } }
      @media (forced-colors: active) {
        button:focus-visible, input:focus-visible, select:focus-visible { outline-color: Highlight; }
        button[aria-current="page"] { border: 3px solid Highlight; }
      }
    `;
    this.shadowRoot.appendChild(style);
    this._style = style;
    }

    const focused = this.shadowRoot.activeElement;
    this._usedNodes = new Set();
    const node = (key, tag, text) => {
      this._usedNodes.add(key);
      let element = this._nodes.get(key);
      if (!element) { element = document.createElement(tag); this._nodes.set(key, element); }
      if (text !== undefined && element.textContent !== String(text)) element.textContent = String(text);
      return element;
    };
    // Keep stable controls in place. replaceChildren/innerHTML would blur them,
    // close an open select and detach the established live-region node.
    const children = (parent, desired) => {
      for (const child of [...parent.children]) if (!desired.includes(child)) child.remove();
      desired.forEach((child, index) => {
        if (parent.children[index] !== child) parent.insertBefore(child, parent.children[index] || null);
      });
    };
    const root = node('root', 'div'); root.className = 'au-pagination';
    const container = node('container', 'div'); container.className = 'au-pagination-container';
    const grp1 = node('info', 'div'); grp1.className = 'au-pagination-group';
    const info = [];
    if (layout.includes('total_page')) info.push(node('total-pages', 'span', t.totalPagesPrefix + ' ' + totalPages + ' ' + t.pageSuffix));
    if (layout.includes('total_items')) info.push(node('total-items', 'span', totalItems + ' ' + t.totalItemsSuffix));
    if (layout.includes('page_size')) {
      const hidden = node('size-name', 'span', t.pageSizeText); hidden.className = 'visually-hidden'; hidden.id = this._selectId + '-name';
      const label = node('size-label', 'label'); label.htmlFor = this._selectId;
      children(label, [node('size-prefix', 'span', t.perText + ' '), hidden]);
      const select = node('size', 'select'); select.id = this._selectId;
      const options = [...new Set([...this.pageSizeOptions, this.pageSize])].sort((a,b) => a-b).map(size => {
        const option = node('size-' + size, 'option', size); option.value = String(size); return option;
      });
      children(select, options); select.value = String(this.pageSize);
      select.onchange = () => {
        const size = Number(select.value);
        if (size === this.pageSize) return;
        this.pageSize = size;
        this.currentPage = 1;
        // Observers see the complete new state; programmatic writes stay silent.
        this.dispatchEvent(new CustomEvent('page-size-change', { detail: size, bubbles: true, composed: true }));
        this.announce(this.formatText(this.texts.pageAnnouncement, { page: this.currentPage }));
      };
      info.push(label, select, node('size-suffix', 'span', t.totalItemsSuffix));
    }
    children(grp1, info);

    const grp2 = node('navigation', 'div'); grp2.className = 'au-pagination-group';
    const nav = node('nav', 'nav'); nav.setAttribute('aria-label', t.paginationLabel); nav.tabIndex = -1;
    const list = node('buttons', 'ul'); list.className = 'pagination-buttons';
    const items = [];
    const button = (key, label, page, disabled = false, current = false) => {
      const li = node('li-' + key, 'li');
      const btn = node(key, 'button', label); btn.type = 'button'; btn.dataset.control = key;
      btn.disabled = disabled;
      btn.className = key.startsWith('page-') ? 'pager' : '';
      if (current) { btn.setAttribute('aria-current', 'page'); btn.setAttribute('part', 'current-page'); }
      else { btn.removeAttribute('aria-current'); btn.removeAttribute('part'); }
      btn.onclick = () => this._goto(typeof page === 'function' ? page() : page);
      children(li, [btn]); items.push(li);
    };
    if (layout.includes('first')) button('first', t.firstText, 1, this.currentPage === 1);
    if (layout.includes('prev')) button('prev', t.prevText, () => this.currentPage - 1, this.currentPage === 1);
    if (layout.includes('pages')) this.pagers.forEach(page => button('page-' + page, page, page, false, page === this.currentPage));
    if (layout.includes('next')) button('next', t.nextText, () => this.currentPage + 1, this.currentPage >= totalPages);
    if (layout.includes('last')) button('last', t.lastText, () => this.totalPages, this.currentPage >= totalPages);
    children(list, items); children(nav, [list]); children(grp2, [nav]);
    const groups = [grp1, grp2];
    if (layout.includes('jump')) {
      const grp3 = node('jump-group', 'div'); grp3.className = 'au-pagination-group';
      const label = node('jump-label', 'label', t.goText); label.htmlFor = this._jumpId;
      const input = node('jump', 'input'); input.type = 'number'; input.id = this._jumpId;
      input.min = '1'; input.max = String(totalPages); input.step = '1'; input.required = true;
      // Translation/layout updates must not erase an unfinished page entry.
      if (this._renderedPage !== this.currentPage || !input.isConnected) input.value = String(this.currentPage);
      const jump = () => { if (input.reportValidity()) this._goto(input.valueAsNumber); };
      input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); jump(); } };
      const btn = node('jump-confirm', 'button', t.gotoText); btn.type = 'button'; btn.onclick = jump;
      children(grp3, [label, input, node('jump-suffix', 'span', t.pageSuffix), btn]); groups.push(grp3);
    }
    children(container, groups); children(root, [container]);
    if (!root.isConnected) this.shadowRoot.append(root);
    if (this.liveRegion.parentNode !== this.shadowRoot) this.shadowRoot.append(this.liveRegion);
    this._renderedPage = this.currentPage;
    for (const key of this._nodes.keys()) if (!this._usedNodes.has(key)) this._nodes.delete(key);
    if (focused && this.isConnected && (!focused.isConnected || focused.disabled || this.shadowRoot.activeElement !== focused)) {
      const target = focused.isConnected && !focused.disabled ? focused : list.querySelector('[aria-current="page"]') || list.querySelector('button:not(:disabled)') || nav;
      target.focus({ preventScroll: true });
    }
  }

  _goto(page) {
    if (!Number.isSafeInteger(page)) return;
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.dispatchEvent(new CustomEvent('page-change', { detail: page, bubbles: true, composed: true }));
    this.announce(this.formatText(this.texts.pageAnnouncement, { page: this.currentPage }));
  }

  announce(message) {
    cancelAnimationFrame(this._announceFrame);
    while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
    this._announceFrame = requestAnimationFrame(() => {
      const span = document.createElement('span');
      span.textContent = message;
      this.liveRegion.appendChild(span);
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-pagination')) {
  customElements.define('au-pagination', AuPagination);
}
