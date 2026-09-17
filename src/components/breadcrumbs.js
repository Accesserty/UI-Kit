class AuBreadcrumbs extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    // An existing, unregistered element may already carry consumer properties.
    // Restore the accessors before upgrade-time attribute callbacks render it.
    for (const name of ['items', 'separator']) {
      if (Object.hasOwn(this, name)) {
        const value = this[name]
        delete this[name]
        this[name] = value
      }
    }
  }

  connectedCallback() {
    this.render()
    this.observeLabelRoot()
  }

  disconnectedCallback() {
    this._labelObserver?.disconnect()
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
      this.render()
      if (name === 'aria-labelledby' && this.isConnected) this.observeLabelRoot()
    }
  }

  get items() {
    const attr = this.getAttribute('items')
    if (!attr) return []

    try {
      const parsed = JSON.parse(attr)
      return Array.isArray(parsed)
        ? parsed.filter(item => item && typeof item === 'object' && !Array.isArray(item) && 'text' in item)
        : []
    } catch {
      return []
    }
  }

  set items(val) {
    if (typeof val === 'string') {
      // 這裡只需要設定屬性，不需要呼叫 render，因為 setAttribute 會觸發 attributeChangedCallback
      this.setAttribute('items', val)
    } else if (Array.isArray(val) || (val && typeof val === 'object')) {
        const newVal = Array.isArray(val) ? val : [val];
        this.setAttribute('items', JSON.stringify(newVal))
    } else {
      console.error("Invalid value provided for 'items'. Expected string (JSON) or Array:", val)
      return
    }
  }

  get separator() {
    return this.getAttribute('separator') || '/'
  }

  set separator(val) {
    this.setAttribute('separator', val)
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
      const url = new URL(value, this.ownerDocument.baseURI)
      if (['http:', 'https:'].includes(url.protocol)) return url.href
      // Plain HTML opened from disk must retain native local navigation.
      // Check the actual document URL, not <base>: a hosted page must not gain
      // file access by changing its base URI. Network file hosts stay excluded.
      const documentURL = new URL(this.ownerDocument.URL)
      return url.protocol === 'file:' && documentURL.protocol === 'file:' &&
        url.host === '' && documentURL.host === '' ? url.href : null
    } catch {
      return null
    }
  }

  observeLabelRoot() {
    this._labelObserver?.disconnect()
    if (!this.getAttribute('aria-labelledby')?.trim()) return
    this._labelObserver ??= new MutationObserver(() => this.syncAccessibleLabel())
    // References may be inserted late, replaced by a framework, or renamed.
    // Shadow children are not observed, so updating the nav cannot loop here.
    this._labelObserver.observe(this.getRootNode(), {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['id', 'aria-label']
    })
    this.syncAccessibleLabel()
  }

  syncAccessibleLabel() {
    if (!this._nav) return
    const root = this.getRootNode()
    const ids = (this.getAttribute('aria-labelledby') || '').trim().split(/\s+/).filter(Boolean)
    const labels = ids.map(id => root.getElementById?.(id)).filter(el => el && el !== this)
    const fallback = this.getAttribute('aria-label')?.trim() || this.getAttribute('label')?.trim() || 'Breadcrumbs'
    if ('ariaLabelledByElements' in this._nav) {
      // Element references can point to ancestors' trees, unlike ID strings
      // copied into a shadow root. Native naming preserves rich label semantics.
      this._nav.ariaLabelledByElements = labels
      this._nav.setAttribute('aria-label', fallback)
    } else {
      // Older engines can still consume plain-text labels. Rich labels should
      // supply an explicit localized aria-label on those engines.
      const text = labels.map(el => el.getAttribute('aria-label') || el.textContent).join(' ').trim()
      this._nav.setAttribute('aria-label', this.getAttribute('aria-label')?.trim() || text || fallback)
    }
  }

  renderItems() {
    const items = this.items
    const list = this._nav.querySelector('ol')
    const active = this.shadowRoot.activeElement
    const prefix = this.getAttribute('data-link-title-prefix') || 'go to'
    const template = this.getAttribute('data-link-title-template')
    items.forEach((item, index) => {
      const current = index === items.length - 1
      const url = current ? null : this.navigationURL(item.url)
      const li = list.children[index] || list.appendChild(document.createElement('li'))
      let content = li.firstElementChild
      const tag = url ? 'A' : 'SPAN'
      if (!content || content.tagName !== tag) {
        const replacement = document.createElement(tag.toLowerCase())
        const icon = document.createElement('slot')
        const text = document.createElement('span')
        replacement.append(icon, text)
        content ? content.replaceWith(replacement) : li.append(replacement)
        content = replacement
      }
      content.className = 'item'
      content.firstElementChild.name = `icon-${index + 1}`
      content.lastElementChild.textContent = String(item.text ?? '')
      current ? content.setAttribute('aria-current', 'page') : content.removeAttribute('aria-current')
      if (url) {
        content.href = url
        content.title = template ? this.formatText(template, {text: item.text ?? '', index: index + 1}) : `${prefix} ${item.text ?? ''}`
      }
      let separator = li.querySelector('[aria-hidden="true"]')
      if (current) separator?.remove()
      else {
        if (!separator) {
          separator = document.createElement('span')
          separator.setAttribute('aria-hidden', 'true')
          li.append(separator)
        }
        separator.textContent = this.separator
      }
    })
    while (list.children.length > items.length) list.lastElementChild.remove()
    // A revoked/removed focused link must not leave keyboard focus on body.
    if (active && !this.shadowRoot.contains(active)) this._nav.focus()
  }

  render() {
    if (!this.shadowRoot) return;
    if (!this._nav) {
      this.shadowRoot.innerHTML = `
      <style>
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
      </style>
      <nav tabindex="-1"><ol></ol></nav>
    `
      this._nav = this.shadowRoot.querySelector('nav')
    }
    for (const name of ['id', 'class']) {
      this.hasAttribute(name) ? this._nav.setAttribute(name, this.getAttribute(name)) : this._nav.removeAttribute(name)
    }
    this.syncAccessibleLabel()
    this.renderItems()
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-breadcrumbs')) {
  customElements.define('au-breadcrumbs', AuBreadcrumbs);
}
