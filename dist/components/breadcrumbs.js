/*! Accesserty UI Kit v3.0.1 */
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

  // Shadow DOM markup and styles for au-breadcrumbs. Pure functions shared by
  // the browser and server rendering.

  const DEFAULT_LABEL = 'Breadcrumbs';
  const DEFAULT_SEPARATOR = '/';
  const DEFAULT_LINK_TITLE_PREFIX = 'go to';

  const breadcrumbsStyles = `
  :host([hidden]:not([hidden="until-found" i])) { display: none; }
    nav {
      background-color: var(--au-breadcrumbs-bg, transparent);
      overflow-x: auto;
      overflow-y: hidden;
      white-space: normal;
      &:focus-visible {
        outline: 2px solid var(--au-breadcrumbs-focus-shadow-color, oklch(0.45 0.15 260));
        outline-offset: -2px;
      }
      ol {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        li {
          font-size: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          >span.item {
            display: inline-block;
            box-sizing: border-box;
            max-width: 100%;
            padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
            font-size: var(--au-breadcrumbs-text-size, 1rem);
            color: var(--au-breadcrumbs-link-currentpage-color, oklch(0.1398 0 0));
          }
          >span[aria-hidden="true"] { font-size: var(--au-breadcrumbs-text-size, 1rem); }
          &:last-child {
            a {
              text-decoration: none;
            }
            >span {
              padding-left: var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
              font-size: var(--au-breadcrumbs-text-size, 1rem);
              color: var(--au-breadcrumbs-link-currentpage-color, oklch(0.1398 0 0));
            }
          }
          a {
            display: inline-block;
            box-sizing: border-box;
            max-width: 100%;
            padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
            font-size: var(--au-breadcrumbs-text-size, 1rem);
            text-decoration: var(--au-breadcrumbs-text-deco, underline);
            color: var(--au-breadcrumbs-link-color, oklch(0.429 0.2972777928415759 264.05202063805507));
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            &:hover {
              text-decoration: underline;
            }
            &:active {
              opacity: 1;
            }
            &:visited {
              color: var(--au-breadcrumbs-link-visited-color, oklch(0.3748 0.167 303.51));
            }
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) var(--au-breadcrumbs-focus-shadow-color, oklch(0.45 0.15 260));
              /* Forced colours drop box-shadow. Nested here so it outranks the
                 outline: none above; a top-level a:focus-visible would not. */
              @media (forced-colors: active) {
                outline: 2px solid Highlight;
                outline-offset: -2px;
              }
            }
            &+span {
              font-size: var(--au-breadcrumbs-text-size, 1rem);
            }
          }
        }
      }
    }
    @media (forced-colors: active) {
      nav:focus-visible {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }
    }
`;

  /** The `items` attribute: a JSON array of objects with `text` (and `url`). */
  function parseItems(value) {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter(item => item && typeof item === 'object' && !Array.isArray(item) && 'text' in item)
        : [];
    } catch {
      return [];
    }
  }

  /** Link title from `data-link-title-template` or `data-link-title-prefix`. */
  function linkTitle(text, index, { template, prefix } = {}) {
    return template
      ? template.replaceAll('{text}', String(text ?? '')).replaceAll('{index}', String(index + 1))
      : `${prefix || DEFAULT_LINK_TITLE_PREFIX} ${text ?? ''}`;
  }

  /**
   * @param {{ id?: string, className?: string, label?: string, separator?: string,
   *   items?: {{ text: string, href?: string|null, title?: string }}[] }} [state]
   * The last item is the current page; items without an href render as text.
   */
  function renderBreadcrumbs({ id, className, label, separator = DEFAULT_SEPARATOR, items = [] } = {}) {
    const list = items.map((item, index) => {
      const current = index === items.length - 1;
      const content = `<slot name="icon-${index + 1}"></slot><span>${escapeHTML(item.text ?? '')}</span>`;
      const link = !current && item.href
        ? `<a class="item" href="${escapeHTML(item.href)}" title="${escapeHTML(item.title ?? '')}">${content}</a>`
        : `<span class="item"${current ? ' aria-current="page"' : ''}>${content}</span>`;
      return `<li>${link}${current ? '' : `<span aria-hidden="true">${escapeHTML(separator)}</span>`}</li>`;
    }).join('');
    const attrs = (id ? ` id="${escapeHTML(id)}"` : '') + (className ? ` class="${escapeHTML(className)}"` : '')
      + (label ? ` aria-label="${escapeHTML(label)}"` : '');
    return `<style>${breadcrumbsStyles}</style><nav tabindex="-1"${attrs}><ol>${list}</ol></nav>`;
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

  class AuBreadcrumbs extends HTMLElement {
    constructor() {
      super();
      // An existing, unregistered element may already carry consumer properties.
      // Restore the accessors before upgrade-time attribute callbacks render it.
      upgradeProperties(this, ['items', 'separator']);
      // Adopts a server-rendered declarative root when present (core/declarative.js).
      setupShadow(this, () => renderBreadcrumbs(), root => {
        this._nav = root.querySelector('nav');
        this._bound = true;
        if (this.isConnected) this.connectedCallback();
      });
    }

    connectedCallback() {
      if (!this._bound) return
      this.render();
      this.observeLabelRoot();
    }

    disconnectedCallback() {
      this._labelObserver?.disconnect();
    }

    static get observedAttributes() {
      return [
        'id',
        'class',
        'aria-label',
        'aria-labelledby',
        'label',
        'items',
        'separator',
        'data-link-title-prefix',
        'data-link-title-template'
      ]
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
        if (name === 'aria-labelledby' && this.isConnected) this.observeLabelRoot();
      }
    }

    get items() {
      return parseItems(this.getAttribute('items'))
    }

    set items(val) {
      if (typeof val === 'string') {
        // 這裡只需要設定屬性，不需要呼叫 render，因為 setAttribute 會觸發 attributeChangedCallback
        this.setAttribute('items', val);
      } else if (Array.isArray(val) || (val && typeof val === 'object')) {
          const newVal = Array.isArray(val) ? val : [val];
          this.setAttribute('items', JSON.stringify(newVal));
      } else {
        console.error("Invalid value provided for 'items'. Expected string (JSON) or Array:", val);
        return
      }
    }

    get separator() {
      return this.getAttribute('separator') || DEFAULT_SEPARATOR
    }

    set separator(val) {
      this.setAttribute('separator', val);
    }

    formatText(template, values = {}) {
      return Object.entries(values).reduce((message, [key, value]) => {
        return message.replaceAll(`{${key}}`, String(value))
      }, template)
    }

    navigationURL(value) {
      if (typeof value !== 'string' || !value.trim()) return null
      try {
        // Use the browser parser, including its control-character normalization.
        // Store the validated absolute URL so a later <base> change cannot alter it.
        const url = new URL(value, this.ownerDocument.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href
        // Plain HTML opened from disk must retain native local navigation.
        // Check the actual document URL, not <base>: a hosted page must not gain
        // file access by changing its base URI. Network file hosts stay excluded.
        const documentURL = new URL(this.ownerDocument.URL);
        return url.protocol === 'file:' && documentURL.protocol === 'file:' &&
          url.host === '' && documentURL.host === '' ? url.href : null
      } catch {
        return null
      }
    }

    observeLabelRoot() {
      this._labelObserver?.disconnect();
      if (!this.getAttribute('aria-labelledby')?.trim()) return
      this._labelObserver ??= new MutationObserver(() => this.syncAccessibleLabel());
      // References may be inserted late, replaced by a framework, or renamed.
      // Shadow children are not observed, so updating the nav cannot loop here.
      this._labelObserver.observe(this.getRootNode(), {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['id', 'aria-label']
      });
      this.syncAccessibleLabel();
    }

    syncAccessibleLabel() {
      if (!this._nav) return
      const root = this.getRootNode();
      const ids = (this.getAttribute('aria-labelledby') || '').trim().split(/\s+/).filter(Boolean);
      const labels = ids.map(id => root.getElementById?.(id)).filter(el => el && el !== this);
      const fallback = this.getAttribute('aria-label')?.trim() || this.getAttribute('label')?.trim() || DEFAULT_LABEL;
      if ('ariaLabelledByElements' in this._nav) {
        // Element references can point to ancestors' trees, unlike ID strings
        // copied into a shadow root. Native naming preserves rich label semantics.
        this._nav.ariaLabelledByElements = labels;
        this._nav.setAttribute('aria-label', fallback);
      } else {
        // Older engines can still consume plain-text labels. Rich labels should
        // supply an explicit localized aria-label on those engines.
        const text = labels.map(el => el.getAttribute('aria-label') || el.textContent).join(' ').trim();
        this._nav.setAttribute('aria-label', this.getAttribute('aria-label')?.trim() || text || fallback);
      }
    }

    renderItems() {
      const items = this.items;
      const list = this._nav.querySelector('ol');
      const active = this.shadowRoot.activeElement;
      const titles = {template: this.getAttribute('data-link-title-template'), prefix: this.getAttribute('data-link-title-prefix') || DEFAULT_LINK_TITLE_PREFIX};
      items.forEach((item, index) => {
        const current = index === items.length - 1;
        const url = current ? null : this.navigationURL(item.url);
        const li = list.children[index] || list.appendChild(document.createElement('li'));
        let content = li.firstElementChild;
        const tag = url ? 'A' : 'SPAN';
        if (!content || content.tagName !== tag) {
          const replacement = document.createElement(tag.toLowerCase());
          const icon = document.createElement('slot');
          const text = document.createElement('span');
          replacement.append(icon, text);
          content ? content.replaceWith(replacement) : li.append(replacement);
          content = replacement;
        }
        content.className = 'item';
        content.firstElementChild.name = `icon-${index + 1}`;
        content.lastElementChild.textContent = String(item.text ?? '');
        current ? content.setAttribute('aria-current', 'page') : content.removeAttribute('aria-current');
        if (url) {
          content.href = url;
          content.title = linkTitle(item.text, index, titles);
        }
        let separator = li.querySelector('[aria-hidden="true"]');
        if (current) separator?.remove();
        else {
          if (!separator) {
            separator = document.createElement('span');
            separator.setAttribute('aria-hidden', 'true');
            li.append(separator);
          }
          separator.textContent = this.separator;
        }
      });
      while (list.children.length > items.length) list.lastElementChild.remove();
      // A revoked/removed focused link must not leave keyboard focus on body.
      if (active && !this.shadowRoot.contains(active)) this._nav.focus();
    }

    render() {
      if (!this._bound) return
      for (const name of ['id', 'class']) {
        this.hasAttribute(name) ? this._nav.setAttribute(name, this.getAttribute(name)) : this._nav.removeAttribute(name);
      }
      this.syncAccessibleLabel();
      this.renderItems();
    }
  }

  if (typeof customElements !== 'undefined' && !customElements.get('au-breadcrumbs')) {
    customElements.define('au-breadcrumbs', AuBreadcrumbs);
  }

})();
