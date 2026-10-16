import { setupShadow } from '../core/declarative.js'
import { DEFAULT_LABEL, DEFAULT_LINK_TITLE_PREFIX, DEFAULT_SEPARATOR, linkTitle, parseItems, renderBreadcrumbs } from '../views/breadcrumbs.js'
import { upgradeProperties } from '../core/upgrade.js';

class AuBreadcrumbs extends HTMLElement {
  constructor() {
    super()
    // An existing, unregistered element may already carry consumer properties.
    // Restore the accessors before upgrade-time attribute callbacks render it.
    upgradeProperties(this, ['items', 'separator']);
    // Adopts a server-rendered declarative root when present (core/declarative.js).
    setupShadow(this, () => renderBreadcrumbs(), root => {
      this._nav = root.querySelector('nav')
      this._bound = true
      if (this.isConnected) this.connectedCallback()
    })
  }

  connectedCallback() {
    if (!this._bound) return
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
    return parseItems(this.getAttribute('items'))
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
    return this.getAttribute('separator') || DEFAULT_SEPARATOR
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
    const fallback = this.getAttribute('aria-label')?.trim() || this.getAttribute('label')?.trim() || DEFAULT_LABEL
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
    const titles = {template: this.getAttribute('data-link-title-template'), prefix: this.getAttribute('data-link-title-prefix') || DEFAULT_LINK_TITLE_PREFIX}
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
        content.title = linkTitle(item.text, index, titles)
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
    if (!this._bound) return
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
