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
      'data-link-title-prefix'
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

  render() {
    if (!this.shadowRoot) return;
    const id = this.getAttribute('id')
    const classname = this.getAttribute('class')
    const ariaLabel = this.getAttribute('aria-label')
    const ariaLabelledby = this.getAttribute('aria-labelledby')
    const labelAttr = this.getAttribute('label')
    const items = this.items // This should always be an array now
    const separator = this.getAttribute('separator') || '/'
    const prefix = this.getAttribute('data-link-title-prefix') || 'go to';

    let navAccessibleAttr = ''
    if (ariaLabel !== null) {
      navAccessibleAttr = `aria-label="${ariaLabel}"`
    } else if (ariaLabelledby !== null) {
      navAccessibleAttr = `aria-labelledby="${ariaLabelledby}"`
    } else if (labelAttr !== null) {
      navAccessibleAttr = `aria-label="${labelAttr}"`
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
        ${id !== null ? `id="` + id + `"` : ''}
        ${classname !== null ? `class="` + classname + `"` : ''}
        ${navAccessibleAttr}
      >
        <ol>
          ${items
        .map(
          (item, index) => `
                <li>
                  ${index === items.length - 1
              ? `<span aria-current="page"><slot name="icon-${index + 1}"></slot><span>${item.text}</span></span>`
              : `<a href="${item.url || ''}" title="${prefix} ${item.text}"><slot name="icon-${index + 1}"></slot><span>${item.text}</span></a>`
            }
                  ${index !== items.length - 1 ? `<span aria-hidden="true">` + separator + `</span>` : ''}
                </li>
              `
        )
        .join('')}
        </ol>
      </nav>
    `
  }
}

customElements.define('au-breadcrumbs', AuBreadcrumbs)
