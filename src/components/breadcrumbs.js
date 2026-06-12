class AuBreadcrumbs extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
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
    }
  }

  get items() {
    const attr = this.getAttribute('items')
    if (!attr) return []

    try {
      // Attempt to parse the 'items' attribute as JSON
      return JSON.parse(attr)
    } catch (e) {
      console.error("Error parsing 'items':", e)
      return [] // Return an empty array in case of parsing error
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

  escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  render() {
    if (!this.shadowRoot) return;
    const id = this.getAttribute('id')
    const classname = this.getAttribute('class')
    const ariaLabel = this.getAttribute('aria-label')
    const ariaLabelledby = this.getAttribute('aria-labelledby')
    const labelAttr = this.getAttribute('label')
    const items = this.items // This should always be an array now
    const separator = this.getAttribute('separator') || '/'
    const escapedSeparator = this.escapeHTML(separator)
    const prefix = this.getAttribute('data-link-title-prefix') || 'go to';
    const titleTemplate = this.getAttribute('data-link-title-template');
    const escapedId = id !== null ? this.escapeHTML(id) : ''
    const escapedClassname = classname !== null ? this.escapeHTML(classname) : ''

    let navAccessibleAttr = ''
    if (ariaLabel !== null) {
      navAccessibleAttr = `aria-label="${this.escapeHTML(ariaLabel)}"`
    } else if (ariaLabelledby !== null) {
      navAccessibleAttr = `aria-labelledby="${this.escapeHTML(ariaLabelledby)}"`
    } else if (labelAttr !== null) {
      navAccessibleAttr = `aria-label="${this.escapeHTML(labelAttr)}"`
    }

    this.shadowRoot.innerHTML = `
      <style>
        nav {
          background-color: var(--au-breadcrumbs-bg, transparent);
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            display: flex;
            align-items: center;
            li {
              font-size: 0;
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
                padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
                font-size: var(--au-breadcrumbs-text-size, 1rem);
                text-decoration: var(--au-breadcrumbs-text-deco, none);
                color: var(--au-breadcrumbs-link-color, oklch(0.429 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: var(--au-breadcrumbs-link-visited-color, oklch(0.3748 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) var(--au-breadcrumbs-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
                }
                &+span {
                  font-size: var(--au-breadcrumbs-text-size, 1rem);
                }
              }
            }
          }
        }
      </style>
      <nav
        ${id !== null ? `id="` + escapedId + `"` : ''}
        ${classname !== null ? `class="` + escapedClassname + `"` : ''}
        ${navAccessibleAttr}
      >
        <ol>
          ${items
        .map(
          (item, index) => {
            const text = this.escapeHTML(item.text || '')
            const url = this.escapeHTML(item.url || '')
            const title = this.escapeHTML(
              titleTemplate
                ? this.formatText(titleTemplate, { text: item.text || '', index: index + 1 })
                : `${prefix} ${item.text || ''}`
            )
            return `
                <li>
                  ${index === items.length - 1
              ? `<span aria-current="page"><slot name="icon-${index + 1}"></slot><span>${text}</span></span>`
              : `<a href="${url}" title="${title}"><slot name="icon-${index + 1}"></slot><span>${text}</span></a>`
            }
                  ${index !== items.length - 1 ? `<span aria-hidden="true">` + escapedSeparator + `</span>` : ''}
                </li>
              `
          }
        )
        .join('')}
        </ol>
      </nav>
    `
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-breadcrumbs')) {
  customElements.define('au-breadcrumbs', AuBreadcrumbs);
}
