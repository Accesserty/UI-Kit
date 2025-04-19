class RyBreadcrumbs extends HTMLElement {
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
    return ['id', 'class', 'aria-label', 'items', 'separator']
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
    const items = this.items // This should always be an array now
    const separator = this.getAttribute('separator') || '/'

    this.shadowRoot.innerHTML = `
      <style>
        nav {
          background-color: oklch(var(--ry-breadcrumbs-bg, transparent));
          overflow: auto;
          white-space: nowrap;
          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            li {
              display: inline-block;
              vertical-align: middle;
              &:last-child {
                a {
                  text-decoration: none;
                }
              }
              a {
                display: inline-block;
                padding: var(--ry-breadcrumbs-link-padding-vertical, 0.75rem) var(--ry-breadcrumbs-link-padding-horizontal, 0.5rem);
                font-size: var(--ry-breadcrumbs-text-size, 1rem);
                text-decoration: var(--ry-breadcrumbs-text-deco, none);
                color: oklch(var(--ry-breadcrumbs-link-color, 42.9% 0.2972777928415759 264.05202063805507));
                -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
                &:hover {
                  opacity: 0.7;
                }
                &:active {
                  opacity: 1;
                }
                &:visited {
                  color: oklch(var(--ry-breadcrumbs-link-visited-color, 37.48% 0.167 303.51));
                }
                &:focus-visible {
                  outline: none;
                  box-shadow: inset 0 0 0 var(--ry-breadcrumbs-focus-shadow-width, 3px) oklch(var(--ry-breadcrumbs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
                }
                &[aria-current="page"] {
                  color: oklch(var(--ry-breadcrumbs-link-currentpage-color, 13.98% 0 0));
                  pointer-events: none;
                }
              }
            }
          }
        }
      </style>
      <nav 
        ${id !== null ? `id="` + id + `"` : ''}
        ${classname !== null ? `class="` + classname + `"` : ''}
        ${ariaLabel !== null ? `aria-label="` + ariaLabel + `"` : ''}
      >
        <ol>
          ${items
            .map(
              (item, index) => `
                <li>
                  <a href="${item.url || ''}" ${index === items.length - 1 ? 'aria-current="page"' : ''}>
                    <slot name="icon-${index+1}"></slot>
                    <span>${item.text}</span>
                  </a>
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

customElements.define('ry-breadcrumbs', RyBreadcrumbs)
