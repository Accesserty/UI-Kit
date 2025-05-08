class AuPagination extends HTMLElement {
  static get observedAttributes() {
    return [
      'data-total', 'data-current-page', 'data-pager-count',
      'data-page-size', 'data-page-size-options', 'data-layout',
      'data-text-total-pages-prefix', 'data-text-page', 'data-text-total-items-suffix',
      'data-text-per', 'data-text-first', 'data-text-prev',
      'data-text-next', 'data-text-last', 'data-text-go', 'data-text-goto'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._parseAttributes();
    this._render();
  }

  attributeChangedCallback() {
    this._parseAttributes();
    this._render();
  }

  _parseAttributes() {
    this.total = parseInt(this.getAttribute('data-total')) || 0;
    this.currentPage = parseInt(this.getAttribute('data-current-page')) || 1;
    this.pagerCount = parseInt(this.getAttribute('data-pager-count')) || 5;
    this.pageSize = parseInt(this.getAttribute('data-page-size')) || 10;
    const opts = this.getAttribute('data-page-size-options');
    if (opts) {
      try { this.pageSizeOptions = JSON.parse(opts); }
      catch { this.pageSizeOptions = opts.split(',').map(n => parseInt(n.trim())); }
    } else { this.pageSizeOptions = [10, 30, 50, 100]; }
    const lay = this.getAttribute('data-layout');
    if (lay) {
      try { this.layout = JSON.parse(lay); }
      catch { this.layout = lay.replace(/\[|\]|'/g, '').split(',').map(s => s.trim()); }
    } else {
      this.layout = ['total_page','total_items','page_size','first','prev','pages','next','last','jump'];
    }
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
      gotoText: this.getAttribute('data-text-goto') || 'go to'
    };
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

    this.shadowRoot.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = `
      :is(ul, ol) {
        list-style: none;
        margin: 0;
        padding: 0;
      } 
      :is(button, select, input) {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
        
        /* spacing */
        padding: var(--au-pagination-btn-padding-vertical, 0.75rem) var(--au-pagination-btn-padding-horizontal, 1rem);
        
        /* text */
        color: oklch(var(--au-pagination-btn-text-color, 13.98% 0 0));
        font-size: var(--au-pagination-btn-text-size, 1rem);
        font-family: var(--au-pagination-btn-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-pagination-btn-text-line-height, 1.5);
        
        /* border */
        border: var(--au-pagination-btn-border-width, 1px) var(--au-pagination-btn-border-style, solid) oklch(var(--au-pagination-btn-border-color, 78.94% 0 0));
        border-radius: var(--au-pagination-btn-border-radius, 0.25rem);
        
        /* others decoration */
        background-color: oklch(var(--au-pagination-btn-bg, 99.4% 0 0));
        transition: background-color 160ms ease-in;
        
        &:disabled {
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.4;
        }
        
        &:hover {
          background-color: oklch(var(--au-pagination-btn-hover-bg, 94.66% 0 0));
          border-color: oklch(var(--au-pagination-btn-hover-border-color, 78.94% 0 0));
        }
        
        &:active {
          background-color: oklch(var(--au-pagination-btn-active-bg, 86.89% 0 0));
          border-color: oklch(var(--au-pagination-btn-active-border-color, 78.94% 0 0));
        }
        
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-pagination-btn-focus-shadow-width, 3px) oklch(var(--au-pagination-btn-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
        
        &.a11y {
          transition: none;
          text-shadow: var(--au-pagination-btn-a11y-text-shadow, none);
          background-image: var(--au-pagination-btn-a11y-bg-image, none);
            
          background-size: var(--au-pagination-btn-a11y-bg-size, 1.5rem 1.5rem);
          background-position: var(--au-pagination-btn-a11y-bg-position, center center);
          &:hover {
            background-image: var(--au-pagination-btn-a11y-hover-bg-image, none);
          }
          &:active {
            background-image: var(--au-pagination-btn-a11y-active-bg-image, none);
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
        gap: 0.5rem;
        justify-content: center;
      }

      .pagination-buttons {
        li {
          &:last-child {  
            button {
              margin-right: 0;
            }
          }
        }
        button {
          margin-right: 0.5rem;
          &.pager:not([aria-current="page"]) {
            @container (width <= 640px) {
              display: none;
            }
          }
        }
      }
    `;
    this.shadowRoot.appendChild(style);

    const root = document.createElement('div');
    root.className = 'au-pagination';


    const container = document.createElement('div');
    container.className = 'au-pagination-container';

    // 第一組: 總頁數/總筆數/每頁顯示
    const grp1 = document.createElement('div');
    grp1.className = 'au-pagination-group';
    if (layout.includes('total_page')) {
      const el = document.createElement('span');
      el.textContent = `${t.totalPagesPrefix}${totalPages}${t.pageSuffix}`;
      grp1.appendChild(el);
    }
    if (layout.includes('total_items')) {
      const el = document.createElement('span');
      el.textContent = `${totalItems}${t.totalItemsSuffix}`;
      grp1.appendChild(el);
    }
    if (layout.includes('page_size')) {
      const wrap = document.createElement('span');
      if (t.perText) wrap.append(Object.assign(document.createElement('span'), { textContent: t.perText }));
      const select = document.createElement('select');
      this.pageSizeOptions.forEach(opt => {
        const o = document.createElement('option'); o.value = opt; o.textContent = opt;
        if (opt === this.pageSize) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', e => {
        this.pageSize = +e.target.value;
        this.setAttribute('data-page-size', this.pageSize);
        this.dispatchEvent(new CustomEvent('page-size-change', { detail: this.pageSize }));
        this._render();
      });
      wrap.appendChild(select);
      if (t.totalItemsSuffix) wrap.append(Object.assign(document.createElement('span'), { textContent: t.totalItemsSuffix }));
      grp1.appendChild(wrap);
    }
    container.appendChild(grp1);

    // 第二組: 按鈕列表
    const grp2 = document.createElement('div');
    grp2.className = 'au-pagination-group';
    const ul = document.createElement('ul');
    ul.className = 'pagination-buttons';
    if (layout.includes('first')) {
      const li = document.createElement('li');
      const btn = document.createElement('button'); btn.textContent = t.firstText;
      btn.disabled = this.currentPage === 1; btn.addEventListener('click', () => this._goto(1));
      li.appendChild(btn); ul.appendChild(li);
    }
    if (layout.includes('prev')) {
      const li = document.createElement('li');
      const btn = document.createElement('button'); btn.textContent = t.prevText;
      btn.disabled = this.currentPage === 1; btn.addEventListener('click', () => this._goto(this.currentPage - 1));
      li.appendChild(btn); ul.appendChild(li);
    }
    if (layout.includes('pages')) this.pagers.forEach(page => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'pager';
      btn.setAttribute('aria-current', page === this.currentPage ? 'page' : 'false');
      btn.disabled = page === this.currentPage;
      btn.innerHTML = '';
      const v1 = document.createElement('span'); v1.className = 'visually-hidden'; v1.textContent = t.gotoText;
      const v2 = document.createElement('span'); v2.textContent = page;
      const v3 = document.createElement('span'); v3.className = 'visually-hidden'; v3.textContent = t.pageSuffix;
      btn.append(v1, v2, v3, document.createComment(''));
      btn.addEventListener('click', () => this._goto(page));
      li.appendChild(btn); ul.appendChild(li);
    });
    if (layout.includes('next')) {
      const li = document.createElement('li');
      const btn = document.createElement('button'); btn.textContent = t.nextText;
      btn.disabled = this.currentPage >= totalPages; btn.addEventListener('click', () => this._goto(this.currentPage + 1));
      li.appendChild(btn); ul.appendChild(li);
    }
    if (layout.includes('last')) {
      const li = document.createElement('li');
      const btn = document.createElement('button'); btn.textContent = t.lastText;
      btn.disabled = this.currentPage >= totalPages; btn.addEventListener('click', () => this._goto(totalPages));
      li.appendChild(btn); ul.appendChild(li);
    }
    // nav 包裹 ul
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'pagination');
    nav.appendChild(ul);
    grp2.appendChild(nav);
    container.appendChild(grp2);

    // 第三組: 跳轉
    if (layout.includes('jump')) {
      const grp3 = document.createElement('div');
      grp3.className = 'au-pagination-group';
      const label = document.createElement('span'); label.textContent = t.goText;
      const input = document.createElement('input');
      input.type = 'number'; input.min = 1; input.max = totalPages; input.value = this.currentPage;
      input.addEventListener('keyup', e => { if (e.key === 'Enter') this._goto(+input.value); });
      const suffix = document.createElement('span'); suffix.textContent = t.pageSuffix;
      grp3.append(label, input, suffix);
      container.appendChild(grp3);
    }

    root.appendChild(container);
    this.shadowRoot.appendChild(root);
  }

  _goto(page) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.setAttribute('data-current-page', page);
    this.dispatchEvent(new CustomEvent('page-change', { detail: page }));
    this._render();
  }
}

customElements.define('au-pagination', AuPagination);
