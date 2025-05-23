class AuAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const container = document.createElement('div');
    container.setAttribute('class', 'au-accordion');
    
    const slot = document.createElement('slot');
    container.appendChild(slot);
    this.shadowRoot.appendChild(container);
  }
}

customElements.define("au-accordion", AuAccordion);


class AuAccordionItem extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({ mode: "open" });

      const regionId = this.generateId();
      const titleId = this.generateId();

      const content = document.createElement('div');
      content.setAttribute('class', 'au-accordion-item');
      
      content.innerHTML = `
        <style>
          .au-accordion-item {
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0% 0 0 / 0);
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: oklch(var(--au-accordion-heading-text-color, 13.98% 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family, 'Helvetica, Arial, sans-serif, system-ui');
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: oklch(var(--au-accordion-heading-bg, 99.4% 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              flex: 1;
            }

            .info {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 0 1 auto;
            }

            .icon {
              transition: transform 300ms ease-in;
              display: flex;
              align-items: middle;
            }

            &[aria-expanded="true"] {
              .icon {
                transform: rotate3d(0, 0, 1, 180deg);
                transform-origin: center;
              }
            }

            &:hover {
              background-color: oklch(var(--au-accordion-heading-hover-bg, 94.66% 0 0));
              border-color: oklch(var(--au-accordion-heading-hover-border-color, 78.94% 0 0));
            }
            
            &:active {
              background-color: oklch(var(--au-accordion-heading-active-bg, 86.89% 0 0));
              border-color: oklch(var(--au-accordion-heading-active-border-color, 78.94% 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) oklch(var(--au-accordion-heading-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: oklch(var(--au-accordion-content-bg, 97.31% 0 0));
            color: oklch(var(--au-accordion-content-text-color, 13.98% 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            max-height: var(--au-accordion-content-max-height, 300px);
            overflow: auto;
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) oklch(var(--au-accordion-heading-border-color, 78.94% 0 0));
          }
        </style>
        <button aria-expanded="false" aria-controls="${regionId}" part="button">
            <div class="heading" id="${titleId}"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        <div role="region" id="${regionId}" aria-labelledby="${titleId}" hidden part="region">
            <slot name="content"></slot>
        </div>
      `;

      this.shadowRoot.append(content);

      this.button = this.shadowRoot.querySelector('button');
      this.button.addEventListener('click', () => this.toggleAccordion());
  }

  connectedCallback() {
    this.updateExpanded();
  }

  static get observedAttributes() {
    return ["open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
        this.updateExpanded();
    }
  }

  updateExpanded() {
    const isOpen = this.hasAttribute('open');
    this.button.setAttribute('aria-expanded', isOpen);
    const region = this.shadowRoot.querySelector('div[role="region"]');
    if (isOpen) {
        region.removeAttribute('hidden');
    } else {
        region.setAttribute('hidden', '');
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-accordion-item-${byteArray[0].toString(36)}`;
  }

  toggleAccordion() {
    const isOpen = this.hasAttribute('open');
    if (isOpen) {
        this.removeAttribute('open');
    } else {
        this.setAttribute('open', '');
    }
  }
}

customElements.define("au-accordion-item", AuAccordionItem);
