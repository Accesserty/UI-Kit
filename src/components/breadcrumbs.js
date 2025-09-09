class AuBreadcrumbs extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.attachInitialAttributes()
    this.render()
  }

  attachInitialAttributes() {
    // Initially copy attributes to internal elements if needed (only non-style and non-specific attributes are handled here).
    Array.from(this.attributes).forEach((attr) => {
      if (attr.name !== 'style' && !['class', 'label', 'items', 'separator'].includes(attr.name)) {
        this.shadowRoot.host.setAttribute(attr.name, attr.value)
      }
    })
  }

  static get observedAttributes() {
    return [
      'id',
      'class',
      'aria-label',
      'aria-labelledby',
      'label',
      'items',
      'separator'
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  get items() {
    try {
      // Attempt to parse the 'items' attribute
      return JSON.parse(this.getAttribute('items') || '[]')
    } catch (e) {
      console.error("Error parsing 'items':", e)
      return [] // Return an empty array in case of parsing error
    }
  }

  set items(val) {
    try {
      JSON.parse(val) // Validate it's a proper JSON string
      this.setAttribute('items', val)
      this.render()
    } catch (e) {
      console.error("Invalid JSON provided for 'items':", val)
    }
  }

  render() {
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
          background-color: oklch(var(--au-breadcrumbs-bg, transparent));
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
                }
              }
              a {
                display: inline-block;
                padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
                font-size: var(--au-breadcrumbs-text-size, 1rem);
                text-decoration: var(--au-breadcrumbs-text-deco, none);
                color: oklch(var(--au-breadcrumbs-link-color, 42.9% 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: oklch(var(--au-breadcrumbs-link-visited-color, 37.48% 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) oklch(var(--au-breadcrumbs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
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
                  ${
                    index === items.length - 1
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
