var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
/*! Accesserty UI Kit v1.0.3 | built 2026-07-25 */
class AuAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._container = document.createElement("div");
    this._container.setAttribute("class", "au-accordion");
    const slot = document.createElement("slot");
    this._container.appendChild(slot);
    this._exclusiveHint = document.createElement("span");
    this._exclusiveHint.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;";
    const hintId = `au-accordion-hint-${Math.random().toString(36).slice(2)}`;
    this._exclusiveHint.id = hintId;
    this._exclusiveHint.textContent = "Only one section may be expanded at a time.";
    this.shadowRoot.appendChild(this._exclusiveHint);
    this.shadowRoot.appendChild(this._container);
    this._onToggle = this._handleToggle.bind(this);
  }
  connectedCallback() {
    this.addEventListener("au-toggle", this._onToggle);
    this._updateExclusiveAria();
  }
  disconnectedCallback() {
    this.removeEventListener("au-toggle", this._onToggle);
  }
  static get observedAttributes() {
    return ["exclusive", "data-text-exclusive-hint"];
  }
  get exclusive() {
    return this.hasAttribute("exclusive");
  }
  set exclusive(val) {
    if (val) {
      this.setAttribute("exclusive", "");
    } else {
      this.removeAttribute("exclusive");
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "exclusive" && oldValue !== newValue) {
      this._updateExclusiveAria();
    }
    if (name === "data-text-exclusive-hint" && oldValue !== newValue) {
      this._updateExclusiveHint();
    }
  }
  _updateExclusiveHint() {
    if (!this._exclusiveHint) return;
    this._exclusiveHint.textContent = this.getAttribute("data-text-exclusive-hint") || "Only one section may be expanded at a time.";
  }
  _updateExclusiveAria() {
    if (this.exclusive) {
      this._container.setAttribute("aria-describedby", this._exclusiveHint.id);
    } else {
      this._container.removeAttribute("aria-describedby");
    }
  }
  _handleToggle(e) {
    if (!this.exclusive || !e.detail.open) return;
    const items = [...this.children].filter(
      (el) => el.tagName.toLowerCase() === "au-accordion-item" && el !== e.target
    );
    items.forEach((item) => {
      item.open = false;
    });
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-accordion")) {
  customElements.define("au-accordion", AuAccordion);
}
class AuAccordionItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const regionId = this.generateId();
    const titleId = this.generateId();
    const content = document.createElement("div");
    content.setAttribute("class", "au-accordion-item");
    content.innerHTML = `
        <style>
          .au-accordion-item {
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: left;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family);
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              min-width: 0;
              flex: 1 1 auto;
              overflow-wrap: break-word;

              slot,
              ::slotted(*),
              * {
                display: block;
                width: 100%;
              }
            }

            .info {
              display: flex;
              align-items: center;
              gap: 1rem;
              flex: 0 1 auto;
              min-width: 0;
              max-width: 50%;
              & > *:first-child  {
                flex: 1;
                min-width: 20px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;

                slot,
                ::slotted(*),
                * {
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  display: block;
                  width: 100%;
                }
              }
            }

            .icon {
              transition: transform 300ms ease-in;
              display: flex;
              align-items: center;
              flex: 0 0 auto;
            }

            &[aria-expanded="true"] {
              .icon {
                transform: rotate3d(0, 0, 1, 180deg);
                transform-origin: center;
              }
            }

            &:hover {
              background-color: var(--au-accordion-heading-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-accordion-heading-hover-border-color, oklch(0.7894 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(0.7894 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-accordion-heading-focus-shadow-width, 3px) var(--au-accordion-heading-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
            }
          }

          div[role="region"] {
            background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
            color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            /* 這裡設定展開時的高度 */
            /* 注意：calc-size 目前支援度較低，確保你在支援的環境下使用 */
            height: calc-size(auto, size); 
            overflow: hidden; /* 確保內容縮放時不會溢出 */

            /* --- 2. 關鍵：Transition 必須寫在這裡 --- */
            transition-behavior: allow-discrete;
            transition: height 0.5s ease-in-out, display 0.5s step-end allow-discrete; 
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-accordion-content-border-radius, 0);
            @starting-style {
              height: 0;
            }

            &[hidden] {
              height: 0;
              display: none;
            }
          }
        </style>
        <button type="button" aria-expanded="false" aria-controls="${regionId}" part="button">
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
    this.button = this.shadowRoot.querySelector("button");
    this.button.addEventListener("click", () => this.toggleAccordion());
  }
  connectedCallback() {
    this.updateExpanded();
  }
  static get observedAttributes() {
    return ["open"];
  }
  get open() {
    return this.hasAttribute("open");
  }
  set open(val) {
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open" && oldValue !== newValue) {
      this.updateExpanded();
      if (this.isConnected) {
        this.dispatchEvent(new CustomEvent("au-toggle", {
          bubbles: true,
          composed: true,
          detail: { open: this.open }
        }));
      }
    }
  }
  updateExpanded() {
    const isOpen = this.hasAttribute("open");
    this.button.setAttribute("aria-expanded", isOpen);
    const region = this.shadowRoot.querySelector('div[role="region"]');
    if (isOpen) {
      region.removeAttribute("hidden");
    } else {
      region.setAttribute("hidden", "");
    }
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-accordion-item-${byteArray[0].toString(36)}`;
    }
    return `au-accordion-item-${Math.random().toString(36).slice(2)}`;
  }
  toggleAccordion() {
    this.open = !this.open;
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-accordion-item")) {
  customElements.define("au-accordion-item", AuAccordionItem);
}
class AuBreadcrumbs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  static get observedAttributes() {
    return [
      "id",
      "class",
      "aria-label",
      "aria-labelledby",
      "label",
      "items",
      "separator",
      "data-link-title-prefix",
      "data-link-title-template"
    ];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  get items() {
    const attr = this.getAttribute("items");
    if (!attr) return [];
    try {
      return JSON.parse(attr);
    } catch (e) {
      console.error("Error parsing 'items':", e);
      return [];
    }
  }
  set items(val) {
    if (typeof val === "string") {
      this.setAttribute("items", val);
    } else if (Array.isArray(val) || val && typeof val === "object") {
      const newVal = Array.isArray(val) ? val : [val];
      this.setAttribute("items", JSON.stringify(newVal));
    } else {
      console.error("Invalid value provided for 'items'. Expected string (JSON) or Array:", val);
      return;
    }
  }
  get separator() {
    return this.getAttribute("separator") || "/";
  }
  set separator(val) {
    this.setAttribute("separator", val);
  }
  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }
  escapeHTML(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  render() {
    if (!this.shadowRoot) return;
    const id = this.getAttribute("id");
    const classname = this.getAttribute("class");
    const ariaLabel = this.getAttribute("aria-label");
    const ariaLabelledby = this.getAttribute("aria-labelledby");
    const labelAttr = this.getAttribute("label");
    const items = this.items;
    const separator = this.getAttribute("separator") || "/";
    const escapedSeparator = this.escapeHTML(separator);
    const prefix = this.getAttribute("data-link-title-prefix") || "go to";
    const titleTemplate = this.getAttribute("data-link-title-template");
    const escapedId = id !== null ? this.escapeHTML(id) : "";
    const escapedClassname = classname !== null ? this.escapeHTML(classname) : "";
    let navAccessibleAttr = "";
    if (ariaLabel !== null) {
      navAccessibleAttr = `aria-label="${this.escapeHTML(ariaLabel)}"`;
    } else if (ariaLabelledby !== null) {
      navAccessibleAttr = `aria-labelledby="${this.escapeHTML(ariaLabelledby)}"`;
    } else if (labelAttr !== null) {
      navAccessibleAttr = `aria-label="${this.escapeHTML(labelAttr)}"`;
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
        ${id !== null ? `id="` + escapedId + `"` : ""}
        ${classname !== null ? `class="` + escapedClassname + `"` : ""}
        ${navAccessibleAttr}
      >
        <ol>
          ${items.map(
      (item, index) => {
        const text = this.escapeHTML(item.text || "");
        const url = this.escapeHTML(item.url || "");
        const title = this.escapeHTML(
          titleTemplate ? this.formatText(titleTemplate, { text: item.text || "", index: index + 1 }) : `${prefix} ${item.text || ""}`
        );
        return `
                <li>
                  ${index === items.length - 1 ? `<span aria-current="page"><slot name="icon-${index + 1}"></slot><span>${text}</span></span>` : `<a href="${url}" title="${title}"><slot name="icon-${index + 1}"></slot><span>${text}</span></a>`}
                  ${index !== items.length - 1 ? `<span aria-hidden="true">` + escapedSeparator + `</span>` : ""}
                </li>
              `;
      }
    ).join("")}
        </ol>
      </nav>
    `;
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-breadcrumbs")) {
  customElements.define("au-breadcrumbs", AuBreadcrumbs);
}
class AuCard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }
  render() {
    this.shadowRoot.innerHTML = `
      <div class="au-card-container" part="au-card-container">
        <slot name="heading" part="heading"></slot>
        <slot name="media" part="media"></slot>
        <slot name="content" part="content"></slot>
        <slot name="footer" part="footer"></slot>
      </div>
    `;
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-card")) {
  customElements.define("au-card", AuCard);
}
class AuCheckbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    const inputID = this.generateId();
    const style = document.createElement("style");
    style.textContent = `
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-checkbox-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-checkbox-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-checkbox-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-checkbox-input-checked-symbol, '✔︎');
              color: var(--au-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-checkbox-input-checked-text-size, 1.125rem);
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-checkbox-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-checkbox-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-checkbox-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-checkbox-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="checkbox"]:disabled) {
          cursor: not-allowed;
          input[type="checkbox"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-checkbox-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
    `;
    const container = document.createElement("div");
    container.setAttribute("class", "au-checkbox");
    const label = document.createElement("label");
    label.setAttribute("for", inputID);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = inputID;
    input.name = this.getAttribute("name") || "";
    input.value = this.getAttribute("value") || "on";
    const textSlot = document.createElement("div");
    textSlot.setAttribute("class", "text");
    const slot = document.createElement("slot");
    this.labelFallback = document.createElement("span");
    this.labelFallback.textContent = this.getAttribute("label") || "";
    slot.appendChild(this.labelFallback);
    textSlot.appendChild(slot);
    label.append(input, textSlot);
    container.appendChild(label);
    this.shadowRoot.append(style, container);
    input.addEventListener("change", (event) => {
      this.checked = event.target.checked;
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: event.target.checked }));
      this.updateFormValue();
    });
    input.addEventListener("focus", () => {
      this.dispatchEvent(new CustomEvent("focus", { bubbles: true, composed: true }));
    });
    input.addEventListener("blur", () => {
      this.dispatchEvent(new CustomEvent("blur", { bubbles: true, composed: true }));
    });
    this.syncAccessibleLabel();
  }
  get checked() {
    var _a;
    return ((_a = this.shadowRoot.querySelector("input")) == null ? void 0 : _a.checked) ?? false;
  }
  set checked(val) {
    val ? this.setAttribute("checked", "") : this.removeAttribute("checked");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-checkbox-${byteArray[0].toString(36)}`;
    }
    return `au-checkbox-${Math.random().toString(36).slice(2)}`;
  }
  static get observedAttributes() {
    return ["name", "value", "checked", "disabled", "required", "label", "aria-label", "aria-labelledby"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      switch (name) {
        case "checked":
          input.checked = newValue !== null;
          break;
        case "disabled":
          input.disabled = newValue !== null;
          break;
        case "name":
          input.name = newValue;
          break;
        case "value":
          input.value = newValue;
          break;
        case "required":
          input.required = newValue !== null;
          break;
        case "label":
          if (this.labelFallback) this.labelFallback.textContent = newValue || "";
          this.syncAccessibleLabel();
          break;
        case "aria-label":
        case "aria-labelledby":
          this.syncAccessibleLabel();
          break;
      }
    }
  }
  syncAccessibleLabel() {
    const input = this.shadowRoot.querySelector("input");
    if (!input) return;
    if (this.hasAttribute("aria-label")) {
      input.setAttribute("aria-label", this.getAttribute("aria-label"));
    } else {
      input.removeAttribute("aria-label");
    }
    if (this.hasAttribute("aria-labelledby")) {
      input.setAttribute("aria-labelledby", this.getAttribute("aria-labelledby"));
    } else {
      input.removeAttribute("aria-labelledby");
    }
  }
  connectedCallback() {
    this.updateCheckedState();
    this.updateFormValue();
  }
  updateCheckedState() {
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      input.checked = this.hasAttribute("checked");
    }
  }
  updateFormValue() {
    const input = this.shadowRoot.querySelector("input");
    const value = input.checked ? this.getAttribute("value") || "on" : null;
    this.internals.setFormValue(value);
    if (input.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(input.validity, input.validationMessage, input);
    }
  }
  formDisabledCallback(disabled) {
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      input.disabled = disabled;
    }
  }
  formResetCallback() {
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      input.checked = false;
      this.checked = false;
      this.updateFormValue();
    }
  }
}
__publicField(AuCheckbox, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-checkbox")) {
  customElements.define("au-checkbox", AuCheckbox);
}
class AuDropdown extends HTMLElement {
  static get observedAttributes() {
    return ["data-text-trigger"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.triggerId = this.generateId("trigger");
    this.menuId = this.generateId("menu");
    this._focusIndex = null;
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        :is(button) {
          anchor-name: --dropdown-anchor;
          /* behavior */
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);

          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          word-break: break-word;
          width: 100%;
          text-align: left;
          padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);

          /* text */
          color: var(--au-btn-text-color, oklch(0.1398 0 0));
          font-size: var(--au-btn-text-size, 1rem);
          font-family: var(--au-btn-text-family);
          line-height: var(--au-btn-text-line-height, 1.5);

          /* border */
          border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-btn-border-radius, 0);

          /* others decoration */
          background-color: var(--au-btn-bg, oklch(0.994 0 0));
          transition: background-color 160ms ease-in;

          &[data-size="small"] {
            padding: var(--au-btn-small-padding-vertical, 0.25rem) var(--au-btn-small-padding-horizontal, 0.375rem);
          }

          &[data-size="large"] {
            padding: var(--au-btn-large-padding-vertical, 1rem) var(--au-btn-large-padding-horizontal, 1.625rem);
            font-size: var(--au-btn-large-text-size, 1.25rem);
          }

          &:disabled {
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.4;
          }

          &:hover {
            background-color: var(--au-btn-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-btn-hover-border-color, oklch(0.7894 0 0));
          }

          &:active {
            background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-btn-active-border-color, oklch(0.7894 0 0));
          }

          &:focus-visible {
            outline: none;
            box-shadow: inset 0 0 0 var(--au-btn-focus-shadow-width, 3px) var(--au-btn-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
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

        .dropdown-menu {
          position: fixed;
          inset: auto;
          position-anchor: --dropdown-anchor;
          top: anchor(--dropdown-anchor bottom);
          left: anchor(--dropdown-anchor left);
          z-index: 1000;
          min-width: anchor-size(--dropdown-anchor width);
          margin-top: 4px;
          background: var(--au-dropdown-menu-bg, oklch(1 0 0));
          border: var(--au-dropdown-menu-border-width, 1px) var(--au-dropdown-menu-border-style, solid) var(--au-dropdown-menu-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-dropdown-menu-border-radius, 0);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0.5rem 0;
          margin: 0;
        }

        .dropdown-menu:popover-open {
          display: block;
        }

        ::slotted(au-dropdown-item) {
          display: block;
        }
      </style>
      <button 
        type="button" 
        role="button"
        id="${this.triggerId}" 
        popovertarget="${this.menuId}"
        aria-haspopup="menu" 
      >
        <slot name="trigger"><span class="trigger-fallback"></span></slot>
        <svg class="icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div 
        id="${this.menuId}" 
        class="dropdown-menu" 
        role="menu" 
        popover="auto"
        aria-labelledby="${this.triggerId}"
      >
        <slot></slot>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.trigger = this.shadowRoot.getElementById(this.triggerId);
    this.menu = this.shadowRoot.getElementById(this.menuId);
    this.triggerFallback = this.shadowRoot.querySelector(".trigger-fallback");
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMenuKeyDown = this.handleMenuKeyDown.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }
  connectedCallback() {
    this.updateTriggerFallback();
    this.trigger.addEventListener("keydown", this.handleKeyDown);
    this.menu.addEventListener("keydown", this.handleMenuKeyDown);
    this.menu.addEventListener("toggle", this.handleToggle);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-text-trigger" && oldValue !== newValue) {
      this.updateTriggerFallback();
    }
  }
  disconnectedCallback() {
    this.trigger.removeEventListener("keydown", this.handleKeyDown);
    this.menu.removeEventListener("keydown", this.handleMenuKeyDown);
    this.menu.removeEventListener("toggle", this.handleToggle);
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-dropdown-${byteArray[0].toString(36)}`;
    }
    return `au-dropdown-${Math.random().toString(36).slice(2)}`;
  }
  updateTriggerFallback() {
    if (!this.triggerFallback) return;
    this.triggerFallback.textContent = this.getAttribute("data-text-trigger") || "Dropdown";
  }
  // 修正點：移除重複的 open/close，保留這裡的邏輯並加強
  open(index = 0) {
    if (this.isOpen) {
      this.focusItem(index);
    } else {
      this._focusIndex = index;
      this.menu.showPopover();
    }
  }
  close() {
    this.menu.hidePopover();
  }
  handleToggle(e) {
    var _a;
    const isOpen = e.newState === "open";
    this.trigger.setAttribute("aria-expanded", isOpen);
    if (isOpen) {
      const indexToFocus = this._focusIndex;
      this._focusIndex = null;
      if (indexToFocus !== null && indexToFocus !== void 0) {
        requestAnimationFrame(() => this.focusItem(indexToFocus));
      }
    } else {
      if (((_a = document.activeElement) == null ? void 0 : _a.closest("au-dropdown")) === this) {
        this.trigger.focus();
      }
      this._focusIndex = null;
    }
  }
  get isOpen() {
    return this.menu.matches(":popover-open");
  }
  set isOpen(val) {
    if (val) {
      this.menu.showPopover();
    } else {
      this.menu.hidePopover();
    }
  }
  focusItem(index) {
    const items = this.items;
    if (items.length > 0) {
      let idx = index;
      if (idx < 0) idx = items.length - 1;
      if (idx >= items.length) idx = 0;
      items[idx].focus();
    }
  }
  get items() {
    return Array.from(this.querySelectorAll("au-dropdown-item"));
  }
  handleKeyDown(e) {
    switch (e.key) {
      case "Enter":
      case " ":
      case "Spacebar":
      case "ArrowDown":
        e.preventDefault();
        this.open(0);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.open(this.items.length - 1);
        break;
    }
  }
  handleMenuKeyDown(e) {
    const items = this.items;
    const currentIndex = items.indexOf(document.activeElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.focusItem(currentIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.focusItem(currentIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        this.focusItem(0);
        break;
      case "End":
        e.preventDefault();
        this.focusItem(items.length - 1);
        break;
      case "Tab":
        this.close();
        break;
      case "Escape":
        e.preventDefault();
        this.close();
        break;
    }
  }
}
class AuDropdownItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: block;
          outline: none;
        }
        
        .item {
          padding: var(--au-dropdown-item-padding, 0.5rem 1rem);
          cursor: pointer;
          color: var(--au-dropdown-item-color, oklch(0.2 0 0));
          font-family: inherit;
          white-space: nowrap;
          transition: background 150ms ease;
        }

        :host(:focus) .item,
        .item:hover {
          outline: none;
          background: var(--au-dropdown-item-hover-bg, oklch(0.95 0 0));
          color: var(--au-dropdown-item-hover-color, oklch(0.1 0 0));
          box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        :host(:focus) {
          outline: none;
        }
      </style>
      <div class="item" role="menuitem" tabindex="-1">
        <slot></slot>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.item = this.shadowRoot.querySelector(".item");
  }
  connectedCallback() {
    this.setAttribute("tabindex", "-1");
    this.setAttribute("role", "none");
    this.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("selected", {
        bubbles: true,
        composed: true,
        detail: { value: this.getAttribute("value") }
      }));
      const dropdown = this.closest("au-dropdown");
      if (dropdown) dropdown.close();
    });
    this.item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        const link = this.querySelector("a");
        if (link) {
          link.click();
        } else {
          this.click();
        }
      }
    });
  }
  focus() {
    this.item.focus();
  }
}
if (typeof customElements !== "undefined") {
  if (!customElements.get("au-dropdown")) customElements.define("au-dropdown", AuDropdown);
  if (!customElements.get("au-dropdown-item")) customElements.define("au-dropdown-item", AuDropdownItem);
}
class AuFileUpload extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "_preventDefault", (e) => e.preventDefault());
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    this.files = [];
    this.previewUrls = /* @__PURE__ */ new Map();
    const style = document.createElement("style");
    style.textContent = `
      .file-upload-container {
        position: relative;
        :is(ul, ol) {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      }
      label {
        display: inline-block;
        padding: var(--au-file-upload-label-padding-vertical, 0.625rem) var(--au-file-upload-label-padding-horizontal, 0);
        color: var(--au-file-upload-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-file-upload-label-text-size, 1rem);
      }
      .upload-area {
        position: relative;
        display: grid;
        place-content: center;
        padding: 4rem;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) var(--au-file-upload-area-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-file-upload-area-border-radius, 0.25rem);
        transition: box-shadow 120ms ease-in;
        ::slotted([slot="trigger"]) {
          position: relative;
          z-index: 2;
        }
        .drop-zone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: transparent;
        }
        &:hover {
          box-shadow: var(--box-shadow);
        }
      }
      .error-area {
        font-size: var(--au-file-upload-error-area-text-size, 0.875rem);
        color: var(--au-file-upload-error-area-text-color, oklch(0.4464 0 0));
      }
      .error-list {
        margin: 0;
        color: var(--au-file-upload-error-list-text-color, oklch(0.4747 0.193 29.04));
      }
      .file-list {
        display: flex;
        flex-direction: column;
        gap: var(--au-file-upload-file-list-gap, 0.625rem);
        [role="listitem"] {
          display: flex;
          justify-content: space-between;
          gap: var(--au-file-upload-file-list-item-gap, 0.625rem);
          word-break: break-word;
          align-items: center;
          >div {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--au-file-upload-file-list-item-inner-gap, 0.625rem);
          }
          .preview {
            flex: 0 0 3rem;
            width: var(--au-file-upload-file-list-preview-width, 3rem);
            height: var(--au-file-upload-file-list-preview-height, 3rem);
            display: grid;
            place-content: center;
            object-fit: contain;
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) var(--au-file-upload-file-list-preview-border-color, oklch(0.7894 0 0));
          }
          .file-name  {
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: var(--au-file-upload-file-list-neme-ellipsis-line, 2);
            overflow: hidden;
            -webkit-box-orient: vertical;
          }
          .delete {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: var(--au-file-upload-delete-tap-highlight-color, oklch(0 0 0 / 0));
            
            /* spacing */
            padding: var(--au-file-upload-delete-padding-vertical, 0.625rem) var(--au-file-upload-delete-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-file-upload-delete-text-color, oklch(0.1398 0 0));
            font-size: var(--au-file-upload-delete-text-size, 1rem);
            line-height: var(--au-file-upload-delete-text-line-height, 1.5);
            
            /* border */
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) var(--au-file-upload-delete-border-color, oklch(0.7894 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);
            
            /* others decoration */
            background-color: var(--au-file-upload-delete-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;
            
            &:hover {
              background-color: var(--au-file-upload-delete-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-file-upload-delete-hover-border-color, oklch(0.7894 0 0));
            }
            
            &:active {
              background-color: var(--au-file-upload-delete-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-file-upload-delete-active-border-color, oklch(0.7894 0 0));
            }
            
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-file-upload-delete-focus-shadow-width, 3px) var(--au-file-upload-delete-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
            }
          }
        }
        &+[aria-live] {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          z-index: -9999;
        }
      }
    `;
    this.wrapper = document.createElement("div");
    this.wrapper.className = "file-upload-wrapper";
    this.container = document.createElement("div");
    this.container.className = "file-upload-container";
    this._id = this.getAttribute("id") || this.generateId();
    this.labelEl = document.createElement("label");
    this.labelEl.textContent = this.getAttribute("label") || "Upload files";
    this.labelEl.setAttribute("for", this._id);
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.hidden = true;
    this.fileInput.id = this._id;
    ["accept", "multiple", "name", "disabled", "required", "form"].forEach((attr) => {
      if (this.hasAttribute(attr)) {
        this.fileInput.setAttribute(attr, this.getAttribute(attr));
      }
    });
    const triggerSlot = document.createElement("slot");
    triggerSlot.name = "trigger";
    triggerSlot.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.fileInput.click();
    });
    triggerSlot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (this.hasAttribute("disabled")) return;
        this.fileInput.click();
      }
    });
    this.dropZone = document.createElement("div");
    this.dropZone.className = "drop-zone";
    this.dropZone.textContent = this.getAttribute("msg-drop-text") || "Drop files here";
    this.usageDisplay = document.createElement("div");
    this.usageDisplay.className = "usage";
    this.usageDisplay.setAttribute("aria-live", "polite");
    this.fileList = document.createElement("ul");
    this.fileList.className = "file-list";
    this.fileList.setAttribute("role", "list");
    this.fileList.setAttribute("aria-live", "polite");
    this.fileList.setAttribute("aria-atomic", "true");
    const hintSlot = document.createElement("slot");
    hintSlot.name = "hint";
    this.errorMessage = document.createElement("div");
    this.errorMessage.className = "error-area";
    this.errorList = document.createElement("ul");
    this.errorList.className = "error-list";
    this.errorMessage.append(hintSlot, this.usageDisplay, this.errorList);
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("role", "status");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.fileInput.addEventListener("change", () => this.handleFiles(this.fileInput.files));
    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (this.hasAttribute("disabled")) return;
      this.dropZone.classList.add("dragover");
    });
    this.dropZone.addEventListener("dragleave", () => {
      if (this.hasAttribute("disabled")) return;
      this.dropZone.classList.remove("dragover");
    });
    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (this.hasAttribute("disabled")) return;
      this.dropZone.classList.remove("dragover");
      const dt = e.dataTransfer;
      if (dt == null ? void 0 : dt.files) this.handleFiles(dt.files);
    });
    const actionGroup = document.createElement("div");
    actionGroup.className = "actions";
    const fileArea = document.createElement("div");
    fileArea.className = "upload-area";
    fileArea.append(triggerSlot, this.dropZone);
    actionGroup.append(fileArea);
    this.container.append(
      this.labelEl,
      actionGroup,
      this.errorMessage,
      this.fileList,
      this.liveRegion,
      this.fileInput
    );
    this.wrapper.append(this.container);
    this.shadowRoot.append(style, this.wrapper);
  }
  static get observedAttributes() {
    return [
      "accept",
      "disabled",
      "form",
      "id",
      "label",
      "multiple",
      "msg-drop-text",
      "msg-total-size-error",
      "msg-type-error",
      "msg-size-error",
      "msg-count-error",
      "msg-added",
      "msg-removed",
      "msg-remove-text",
      "msg-remove-file-label",
      "msg-required",
      "name",
      "required"
    ];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (!this.shadowRoot) return;
    switch (name) {
      case "id":
        this._id = newValue || this.generateId();
        if (this.labelEl) this.labelEl.setAttribute("for", this._id);
        if (this.fileInput) this.fileInput.id = this._id;
        break;
      case "label":
        this.updateLabelText();
        break;
      case "msg-drop-text":
        this.updateDropText();
        break;
      case "msg-remove-text":
      case "msg-remove-file-label":
        this.updateFileList();
        break;
      case "msg-required":
        this.checkValidity();
        break;
      case "disabled":
        this.syncBooleanAttributeToInput("disabled");
        break;
      case "multiple":
        this.syncBooleanAttributeToInput("multiple");
        break;
      case "required":
        this.syncBooleanAttributeToInput("required");
        this.checkValidity();
        break;
      case "accept":
      case "form":
      case "name":
        this.syncAttributeToInput(name);
        break;
    }
  }
  connectedCallback() {
    this.updateLabelText();
    this.updateDropText();
    document.addEventListener("dragover", this._preventDefault);
    document.addEventListener("drop", this._preventDefault);
  }
  disconnectedCallback() {
    document.removeEventListener("dragover", this._preventDefault);
    document.removeEventListener("drop", this._preventDefault);
    this.revokeAllPreviewUrls();
  }
  updateLabelText() {
    if (this.labelEl) this.labelEl.textContent = this.getAttribute("label") || "Upload files";
  }
  updateDropText() {
    if (this.dropZone) this.dropZone.textContent = this.getAttribute("msg-drop-text") || "Drop files here";
  }
  getText(name, fallback) {
    return this.getAttribute(name) || fallback;
  }
  formatMessage(name, fallback, values = {}) {
    const template = this.getText(name, fallback);
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }
  formatFileError(name, fallbackTemplate, legacySuffix, fileName, values = {}) {
    const customMessage = this.getAttribute(name);
    if (customMessage && customMessage.includes("{")) {
      return this.formatMessage(name, fallbackTemplate, { fileName, ...values });
    }
    return `${fileName} ${customMessage || legacySuffix}`;
  }
  syncAttributeToInput(name) {
    if (!this.fileInput) return;
    const value = this.getAttribute(name);
    if (value === null) this.fileInput.removeAttribute(name);
    else this.fileInput.setAttribute(name, value);
  }
  syncBooleanAttributeToInput(name) {
    if (!this.fileInput) return;
    if (this.hasAttribute(name)) this.fileInput.setAttribute(name, "");
    else this.fileInput.removeAttribute(name);
  }
  revokePreviewUrl(file) {
    const url = this.previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(file);
    }
  }
  revokeAllPreviewUrls() {
    this.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.previewUrls.clear();
  }
  handleFiles(fileList) {
    var _a;
    if (this.hasAttribute("disabled")) return;
    const maxTotalSizeMB = parseFloat(this.getAttribute("max-total-size-mb") || "20");
    const maxFiles = parseInt(this.getAttribute("max-files") || "5", 10);
    const maxSizeMB = parseFloat(this.getAttribute("max-size-mb") || "5");
    const acceptAttr = this.getAttribute("accept");
    const acceptList = acceptAttr ? acceptAttr.split(",").map((type) => type.trim()) : [];
    const newFiles = Array.from(fileList);
    const validFiles = [];
    const errorMessages = [];
    newFiles.forEach((file) => {
      const isValidType = acceptList.length === 0 || acceptList.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", ""));
        }
        return file.type === type || file.name.endsWith(type);
      });
      if (!isValidType) {
        errorMessages.push(this.formatFileError(
          "msg-type-error",
          "{fileName} is not an accepted file type.",
          "is not an accepted file type.",
          file.name
        ));
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMessages.push(this.formatFileError(
          "msg-size-error",
          "{fileName} exceeds the maximum size of {maxSize}MB.",
          `exceeds the maximum size of ${maxSizeMB}MB.`,
          file.name,
          { maxSize: maxSizeMB }
        ));
        return;
      }
      validFiles.push(file);
    });
    const uniqueFiles = validFiles.filter(
      (file) => !this.files.some((f) => f.name === file.name && f.size === file.size)
    );
    const slotsLeft = maxFiles - this.files.length;
    const filesToAdd = uniqueFiles.slice(0, slotsLeft);
    const dropped = uniqueFiles.slice(slotsLeft);
    dropped.forEach((file) => {
      errorMessages.push(this.formatFileError(
        "msg-count-error",
        "{fileName} cannot be added. You can only upload up to {maxFiles} files.",
        `You can only upload up to ${maxFiles} files.`,
        file.name,
        { maxFiles }
      ));
    });
    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0) + filesToAdd.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > maxTotalSizeMB * 1024 * 1024) {
      const totalSizeMessage = ((_a = this.getAttribute("msg-total-size-error")) == null ? void 0 : _a.includes("{")) ? this.formatMessage("msg-total-size-error", "Total file size exceeds limit of {maxTotalSize}MB.", { maxTotalSize: maxTotalSizeMB }) : `${this.getText("msg-total-size-error", "Total file size exceeds limit of")} ${maxTotalSizeMB}MB.`;
      errorMessages.push(totalSizeMessage);
      filesToAdd.length = 0;
    }
    if (errorMessages.length > 0) {
      this.showErrors(errorMessages);
    }
    if (filesToAdd.length === 0) return;
    this.files.push(...filesToAdd);
    this.updateFileList();
    this.updateUsage();
    this.announce(this.formatMessage("msg-added", "{count} file(s) added.", { count: filesToAdd.length }));
    this.syncFormValue();
    this.checkValidity();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    this.fileInput.value = "";
  }
  showErrors(messages) {
    this.errorList.innerHTML = "";
    messages.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      this.errorList.appendChild(li);
    });
    this.announce(messages.join(" "));
  }
  announce(message) {
    while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
    requestAnimationFrame(() => {
      const span = document.createElement("span");
      span.textContent = message;
      this.liveRegion.appendChild(span);
    });
  }
  updateFileList() {
    this.fileList.innerHTML = "";
    this.files.forEach((file) => {
      const li = document.createElement("li");
      li.setAttribute("role", "listitem");
      const preview = document.createElement("div");
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.className = "preview";
        let url = this.previewUrls.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          this.previewUrls.set(file, url);
        }
        img.src = url;
        img.alt = file.name;
        img.width = 40;
        img.height = 40;
        preview.appendChild(img);
      } else {
        const icon = document.createElement("span");
        icon.className = "preview";
        icon.textContent = "📄";
        icon.setAttribute("aria-hidden", "true");
        preview.appendChild(icon);
      }
      const nameSpan = document.createElement("span");
      nameSpan.className = "file-name";
      nameSpan.textContent = file.name;
      preview.appendChild(nameSpan);
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "delete";
      removeBtn.textContent = this.getAttribute("msg-remove-text") || "Remove";
      removeBtn.setAttribute("aria-label", this.formatMessage("msg-remove-file-label", "Remove {fileName}", { fileName: file.name }));
      removeBtn.setAttribute("part", "delete");
      removeBtn.addEventListener("click", () => {
        if (this.hasAttribute("disabled")) return;
        this.revokePreviewUrl(file);
        this.files = this.files.filter((f) => f.name !== file.name || f.size !== file.size);
        this.updateFileList();
        this.updateUsage();
        this.announce(this.formatMessage("msg-removed", "{fileName} removed.", { fileName: file.name }));
        this.syncFormValue();
        this.checkValidity();
        this.dispatchEvent(new CustomEvent("remove-file", { bubbles: true, composed: true, detail: file }));
      });
      li.append(preview, removeBtn);
      this.fileList.appendChild(li);
    });
  }
  removeFile(file) {
    if (this.hasAttribute("disabled")) return;
    this.revokePreviewUrl(file);
    this.files = this.files.filter((f) => f.name !== file.name || f.size !== file.size);
    this.updateFileList();
    this.updateUsage();
    this.announce(this.formatMessage("msg-removed", "{fileName} removed.", { fileName: file.name }));
    this.syncFormValue();
    this.checkValidity();
    this.dispatchEvent(new CustomEvent("remove-file", { detail: file }));
  }
  updateUsage() {
    const maxMB = parseFloat(this.getAttribute("max-total-size-mb") || "20");
    const totalMB = this.files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
    this.usageDisplay.textContent = `${totalMB.toFixed(1)}MB / ${maxMB}MB`;
  }
  syncFormValue() {
    const dt = new DataTransfer();
    this.files.forEach((file) => dt.items.add(file));
    this.internals.setFormValue(dt.files);
  }
  checkValidity() {
    if (this.hasAttribute("required") && this.files.length === 0) {
      this.internals.setValidity(
        { valueMissing: true },
        this.getText("msg-required", "Please select at least one file."),
        this.fileInput
      );
      return false;
    }
    this.internals.setValidity({});
    return true;
  }
  formResetCallback() {
    this.revokeAllPreviewUrls();
    this.files = [];
    this.updateFileList();
    this.updateUsage();
    this.syncFormValue();
    this.checkValidity();
  }
  get value() {
    return this.files;
  }
  set value(val) {
    if (Array.isArray(val)) {
      this.revokeAllPreviewUrls();
      this.files = val;
      this.updateFileList();
      this.updateUsage();
      this.syncFormValue();
      this.checkValidity();
    }
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-file-upload-${byteArray[0].toString(36)}`;
    }
    return `au-file-upload-${Math.random().toString(36).slice(2)}`;
  }
}
__publicField(AuFileUpload, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-file-upload")) {
  customElements.define("au-file-upload", AuFileUpload);
}
class AuInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    this._id = this.getAttribute("id") || this.generateId();
    const style = document.createElement("style");
    style.textContent = `
    :host {
      display: block;
      container-type: inline-size;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: var(--au-input-wrapper-bg, transparent);
      container-type: inline-size;

      @container (width < 768px) {
        flex-direction: column;
        align-items: flex-start;
      }

      label {
        margin: 0;
        padding: var(--au-input-label-padding-vertical, 0.625rem) var(--au-input-label-padding-horizontal, 1rem);
        color: var(--au-input-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-label-text-size, 1rem);
        word-break: break-word;
        @container (width < 768px) {
          padding-left: 0;
        }
      }

      input {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-input-padding-vertical, 0.625rem) var(--au-input-padding-horizontal, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        font-size: var(--au-input-text-size, 1rem);
        border: 0;
        border-radius: var(--au-input-border-radius, 0.25rem);
        outline: none;
        background-color: var(--au-input-bg, oklch(0.994 0 0));
        line-height: var(--au-input-text-line-height, 1.5);

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-input-invalid-shadow-width, 3px) var(--au-input-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &[type="color"] {
         padding: 0;
        }

        @container (width < 768px) {
          width: 100%;
          box-sizing: border-box;
        }
      }
      .input-container {
        display: flex;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
        /* prefix/affix 不可被壓縮;窄容器時維持同一行,由 input 彈性縮小
           (原本 <768px 轉 column 會讓 prefix/affix 與輸入框折行) */
        .prefix, .affix {
          flex-shrink: 0;
        }
        @container (width < 768px) {
          input {
            flex: 1;
            min-width: 0;
          }
        }
      }
      .color-code {
        font-family: var(--au-input-text-family);
        font-size: var(--au-input-text-size, 1rem);
        color: var(--au-input-text-color, oklch(0.1398 0 0));
        user-select: text; /* Allow copying */
      }
      .clear-input {
        display: grid;
        place-content: center;

        /* behavior */
        cursor: pointer;
        background-color: var(--au-input-clear-bg, oklch(0.994 0 0));
        color: var(--au-input-clear-text-color, oklch(0.1398 0 0));

        width: 2rem;
        height: 2rem;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:hover {
          background-color: var(--au-input-clear-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-input-clear-active-bg, oklch(0.8689 0 0));
        }

        &[hidden] {
          display: none;
        }
      }
      &[data-size="small"] {
        :is(label, input, .color-code) {
          padding: var(--au-input-small-padding-vertical, 0.25rem) var(--au-input-small-padding-horizontal, 0.375rem);
          @container (width < 768px) {
            padding-left: 0;
          }
        }
      }
      &[data-size="large"] {
        :is(label, input, .color-code)  {
          padding: var(--au-input-large-padding-vertical, 1rem) var(--au-input-large-padding-horizontal, 1.625rem);
          font-size: var(--au-input-large-text-size, 1.25rem);
          @container (width < 768px) {
            padding-left: 0;
          }
        }
      }
      &[data-layout="vertical"] {
        flex-direction: column;
        align-items: initial;
        label {
          padding-left: 0;
        }
        input {
          flex: 1;
        }
      }
    }
  `;
    const wrapper = document.createElement("div");
    wrapper.className = "input-wrapper";
    this.wrapper = wrapper;
    this.labelEl = document.createElement("label");
    this.labelEl.setAttribute("for", this._id);
    this.labelEl.textContent = this.getAttribute("label") || "";
    const inputContainer = document.createElement("div");
    inputContainer.className = "input-container";
    this.inputContainer = inputContainer;
    this.prefixSlot = document.createElement("slot");
    this.prefixSlot.name = "prefix";
    this.prefixSpan = document.createElement("span");
    this.prefixSpan.className = "prefix";
    this.prefixSpan.appendChild(this.prefixSlot);
    this.prefixSpan.hidden = true;
    this.input = document.createElement("input");
    this.input.id = this._id;
    this.syncAttributes();
    this.colorCodeSpan = document.createElement("span");
    this.colorCodeSpan.className = "color-code";
    this.colorCodeSpan.hidden = true;
    this.clearButton = document.createElement("button");
    this.clearButton.type = "button";
    this.clearButton.className = "clear-input";
    this.clearButton.textContent = "✖";
    this.clearButton.hidden = true;
    this.clearButton.setAttribute("part", "clear");
    this.clearButton.addEventListener("click", () => {
      this.clear();
    });
    this.affixSlot = document.createElement("slot");
    this.affixSlot.name = "affix";
    this.affixSpan = document.createElement("span");
    this.affixSpan.className = "affix";
    this.affixSpan.appendChild(this.affixSlot);
    this.affixSpan.hidden = true;
    inputContainer.append(this.prefixSpan, this.input, this.colorCodeSpan, this.clearButton, this.affixSpan);
    wrapper.append(this.labelEl, inputContainer);
    this.shadowRoot.append(style, wrapper);
    this._bindInputEvents();
    this.prefixSlot.addEventListener("slotchange", () => {
      this.prefixSpan.hidden = this.prefixSlot.assignedNodes().length === 0;
    });
    this.affixSlot.addEventListener("slotchange", () => {
      this.affixSpan.hidden = this.affixSlot.assignedNodes().length === 0;
    });
  }
  /** 綁定 input 事件（抽出方法以便 formResetCallback 重用） */
  _bindInputEvents() {
    this.input.addEventListener("input", () => {
      this.value = this.input.value;
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this.internals.setFormValue(this.value);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
    });
    this.input.addEventListener("change", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  static get observedAttributes() {
    return [
      "type",
      "name",
      "value",
      "placeholder",
      "required",
      "disabled",
      "readonly",
      "label",
      "min",
      "max",
      "step",
      "pattern",
      "autocomplete",
      "autofocus",
      "inputmode",
      "maxlength",
      "minlength",
      "list",
      "aria-label",
      "aria-labelledby",
      "data-size",
      "data-layout",
      "data-clear",
      "data-clear-label"
    ];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "label" && this.labelEl) {
      this.labelEl.textContent = newValue;
    } else if ((name === "data-size" || name === "data-layout") && this.wrapper) {
      if (newValue === null) {
        this.wrapper.removeAttribute(name);
      } else {
        this.wrapper.setAttribute(name, newValue);
      }
    } else if (name === "data-clear" || name === "data-clear-label") {
      this._updateClearButton();
    } else if (name === "list") {
      this._handleListAttribute(newValue);
    } else if (this.input) {
      if (newValue === null) {
        this.input.removeAttribute(name);
        const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (typeof this.input[camel] === "boolean") this.input[camel] = false;
        else if (typeof this.input[name] === "boolean") this.input[name] = false;
      } else {
        this.input.setAttribute(name, newValue);
        const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (typeof this.input[camel] === "boolean") this.input[camel] = true;
        else if (typeof this.input[name] === "boolean") this.input[name] = true;
      }
      this._syncValidity();
      this._updateColorCode();
    }
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }
  connectedCallback() {
    if (!this._initialValueSet) {
      this._initialValue = this.input.value;
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.input.value);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();
    if (this.hasAttribute("list")) {
      requestAnimationFrame(() => {
        this._handleListAttribute(this.getAttribute("list"));
      });
    }
  }
  formResetCallback() {
    const currentValue = this._initialValue || "";
    const newInput = this.input.cloneNode(false);
    newInput.value = currentValue;
    this.inputContainer.replaceChild(newInput, this.input);
    this.input = newInput;
    this._bindInputEvents();
    this.internals.setFormValue(currentValue);
    this._syncValidity();
    this._updateClearButton();
    this._updateColorCode();
  }
  get value() {
    var _a;
    return (_a = this.input) == null ? void 0 : _a.value;
  }
  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.setAttribute("value", val);
      this.internals.setFormValue(val);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
    }
  }
  /** ✅ 開發者用：清空 input 值 */
  clear() {
    this.input.value = "";
    this.value = "";
    this.internals.setFormValue("");
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    this._updateClearButton();
    this._updateColorCode();
  }
  /** ✅ 開發者用：注入建議值 */
  suggest(val = "") {
    this.input.value = val;
    this.value = val;
    this.internals.setFormValue(val);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this._updateClearButton();
    this._updateColorCode();
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
  get required() {
    return this.hasAttribute("required");
  }
  set required(val) {
    val ? this.setAttribute("required", "") : this.removeAttribute("required");
  }
  get readonly() {
    return this.hasAttribute("readonly");
  }
  set readonly(val) {
    val ? this.setAttribute("readonly", "") : this.removeAttribute("readonly");
  }
  /** ✅ 開發者用：聚焦 input 欄位 */
  focus() {
    var _a;
    (_a = this.input) == null ? void 0 : _a.focus();
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-input-${byteArray[0].toString(36)}`;
    }
    return `au-input-${Math.random().toString(36).slice(2)}`;
  }
  syncAttributes() {
    Array.from(this.attributes).forEach((attr) => {
      if (!["data-size", "data-layout", "data-clear", "data-clear-label"].includes(attr.name)) {
        this.input.setAttribute(attr.name, attr.value);
        if (attr.name === "value") {
          this.input.defaultValue = attr.value;
        }
      }
    });
  }
  _syncValidity() {
    if (!this.input) return;
    if (this.input.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(this.input.validity, this.input.validationMessage, this.input);
    }
  }
  _updateClearButton() {
    const hasClear = this.hasAttribute("data-clear");
    const hasValue = this.input.value.length > 0;
    const label = this.getAttribute("data-clear-label") || "Clear input";
    this.clearButton.setAttribute("aria-label", label);
    this.clearButton.hidden = !(hasClear && hasValue);
  }
  _updateColorCode() {
    if (this.input.type === "color") {
      this.colorCodeSpan.textContent = this.input.value;
      this.colorCodeSpan.hidden = false;
    } else {
      this.colorCodeSpan.hidden = true;
    }
  }
  /**
   * Binds the external datalist to an internal shadow DOM datalist because
   * `list` attributes do not cross shadow DOM boundaries.
   *
   * A MutationObserver keeps the internal copy in sync, so dynamically updated
   * datalists (e.g. fetch-as-you-type autocomplete) stay current. The observer
   * is torn down on re-target and in disconnectedCallback to avoid leaks.
   */
  _handleListAttribute(listId) {
    if (!this.shadowRoot || !this.input) return;
    this._disconnectDatalistObserver();
    const existingInternal = this.shadowRoot.querySelector("datalist");
    if (existingInternal) existingInternal.remove();
    if (!listId) {
      this.input.removeAttribute("list");
      return;
    }
    const root = this.getRootNode();
    const externalDatalist = root instanceof Document || root instanceof ShadowRoot ? root.getElementById(listId) : document.getElementById(listId);
    if (externalDatalist && externalDatalist.tagName === "DATALIST") {
      this._syncInternalDatalist(externalDatalist, listId);
      this._datalistObserver = new MutationObserver(() => {
        this._syncInternalDatalist(externalDatalist, listId);
      });
      this._datalistObserver.observe(externalDatalist, {
        childList: true,
        subtree: true,
        attributes: true
      });
    } else {
      this.input.setAttribute("list", listId);
    }
  }
  /** Rebuilds the shadow-scoped datalist from the current external datalist. */
  _syncInternalDatalist(externalDatalist, listId) {
    if (!this.shadowRoot || !this.input) return;
    const existingInternal = this.shadowRoot.querySelector("datalist");
    if (existingInternal) existingInternal.remove();
    const internalDatalist = document.createElement("datalist");
    internalDatalist.id = listId;
    Array.from(externalDatalist.options).forEach((opt) => {
      internalDatalist.appendChild(opt.cloneNode(true));
    });
    this.shadowRoot.appendChild(internalDatalist);
    this.input.setAttribute("list", listId);
  }
  _disconnectDatalistObserver() {
    if (this._datalistObserver) {
      this._datalistObserver.disconnect();
      this._datalistObserver = null;
    }
  }
  disconnectedCallback() {
    this._disconnectDatalistObserver();
  }
}
__publicField(AuInput, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-input")) {
  customElements.define("au-input", AuInput);
}
class AuPagination extends HTMLElement {
  static get observedAttributes() {
    return [
      "data-total",
      "data-current-page",
      "data-pager-count",
      "data-page-size",
      "data-page-size-options",
      "data-layout",
      "data-text-total-pages-prefix",
      "data-text-page",
      "data-text-total-items-suffix",
      "data-text-per",
      "data-text-first",
      "data-text-prev",
      "data-text-next",
      "data-text-last",
      "data-text-go",
      "data-text-goto",
      "data-text-pagination-label",
      "data-text-page-size",
      "data-text-page-announcement"
    ];
  }
  // generate unique IDs for input and select
  static generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-pagination-${byteArray[0].toString(36)}`;
    }
    return `au-pagination-${Math.random().toString(36).slice(2)}`;
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectId = AuPagination.generateId();
    this._jumpId = AuPagination.generateId();
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("role", "status");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this._parseAttributes();
    this._render();
  }
  attributeChangedCallback() {
    this._parseAttributes();
    this._requestRender();
  }
  _requestRender() {
    if (this._updatePending) return;
    this._updatePending = true;
    requestAnimationFrame(() => {
      this._render();
      this._updatePending = false;
    });
  }
  _parseAttributes() {
    this.total = parseInt(this.getAttribute("data-total")) || 0;
    this.currentPage = parseInt(this.getAttribute("data-current-page")) || 1;
    this.pagerCount = parseInt(this.getAttribute("data-pager-count")) || 5;
    this.pageSize = parseInt(this.getAttribute("data-page-size")) || 10;
    const opts = this.getAttribute("data-page-size-options");
    if (opts) {
      try {
        this._pageSizeOptions = JSON.parse(opts);
      } catch {
        this._pageSizeOptions = opts.split(",").map((n) => parseInt(n.trim()));
      }
    } else {
      this._pageSizeOptions = [10, 30, 50, 100];
    }
    const lay = this.getAttribute("data-layout");
    if (lay) {
      try {
        this._layout = JSON.parse(lay);
      } catch {
        this._layout = lay.replace(/[[\]' ]/g, "").split(",");
      }
    } else {
      this._layout = ["total_page", "total_items", "page_size", "first", "prev", "pages", "next", "last", "jump"];
    }
    this.texts = {
      totalPagesPrefix: this.getAttribute("data-text-total-pages-prefix") || "Total",
      pageSuffix: this.getAttribute("data-text-page") || "page(s)",
      totalItemsSuffix: this.getAttribute("data-text-total-items-suffix") || "item(s)",
      perText: this.getAttribute("data-text-per") || "each page",
      firstText: this.getAttribute("data-text-first") || "First",
      prevText: this.getAttribute("data-text-prev") || "Prev",
      nextText: this.getAttribute("data-text-next") || "Next",
      lastText: this.getAttribute("data-text-last") || "Last",
      goText: this.getAttribute("data-text-go") || "go to",
      gotoText: this.getAttribute("data-text-goto") || "go to",
      paginationLabel: this.getAttribute("data-text-pagination-label") || "pagination",
      pageSizeText: this.getAttribute("data-text-page-size") || "Page size",
      pageAnnouncement: this.getAttribute("data-text-page-announcement") || "Page {page}"
    };
  }
  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }
  get pageSizeOptions() {
    return this._pageSizeOptions ?? [10, 30, 50, 100];
  }
  set pageSizeOptions(val) {
    this._pageSizeOptions = val;
    this.setAttribute("data-page-size-options", JSON.stringify(val));
  }
  get layout() {
    return this._layout ?? ["total_page", "total_items", "page_size", "first", "prev", "pages", "next", "last", "jump"];
  }
  set layout(val) {
    this._layout = val;
    this.setAttribute("data-layout", JSON.stringify(val));
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
    this.shadowRoot.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = `
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
        border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.7894 0 0));
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
          border-color: var(--au-btn-hover-border-color, oklch(0.7894 0 0));
        }

        &:active {
          background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
          border-color: var(--au-btn-active-border-color, oklch(0.7894 0 0));
        }

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-btn-focus-shadow-width, 3px) var(--au-btn-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &[aria-current="page"] {
          cursor: not-allowed;
          pointer-events: none;
          background-color: var(--au-btn-current-bg, oklch(0.7894 0 0));
          color: var(--au-btn-current-text-color, oklch(0.1398 0 0));
          border-color: var(--au-btn-current-border-color, oklch(0.7894 0 0));
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

      .au-pagination + [aria-live] {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: -9999;
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
        li {
          &:has(.pager:not([aria-current="page"])) {
            @container (width <= 640px) {
              display: none;
            }
          }
        }
      }
    `;
    this.shadowRoot.appendChild(style);
    const root = document.createElement("div");
    root.className = "au-pagination";
    const container = document.createElement("div");
    container.className = "au-pagination-container";
    const grp1 = document.createElement("div");
    grp1.className = "au-pagination-group";
    if (layout.includes("total_page")) {
      const el = document.createElement("span");
      el.textContent = `${t.totalPagesPrefix}${totalPages}${t.pageSuffix}`;
      grp1.appendChild(el);
    }
    if (layout.includes("total_items")) {
      const el = document.createElement("span");
      el.textContent = `${totalItems}${t.totalItemsSuffix}`;
      grp1.appendChild(el);
    }
    if (layout.includes("page_size")) {
      const hiddenLbl = document.createElement("span");
      hiddenLbl.className = "visually-hidden";
      hiddenLbl.textContent = t.pageSizeText;
      grp1.appendChild(hiddenLbl);
      const lbl = document.createElement("label");
      lbl.setAttribute("for", this._selectId);
      lbl.textContent = t.perText;
      grp1.appendChild(lbl);
      const select = document.createElement("select");
      select.id = this._selectId;
      this.pageSizeOptions.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        if (opt === this.pageSize) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener("change", (e) => {
        this.pageSize = +e.target.value;
        this.setAttribute("data-page-size", this.pageSize);
        this.dispatchEvent(new CustomEvent("page-size-change", { detail: this.pageSize, bubbles: true, composed: true }));
        this.currentPage = 1;
        this.setAttribute("data-current-page", "1");
      });
      grp1.appendChild(select);
      const postSpan = document.createElement("span");
      postSpan.textContent = t.totalItemsSuffix;
      grp1.appendChild(postSpan);
    }
    container.appendChild(grp1);
    const grp2 = document.createElement("div");
    grp2.className = "au-pagination-group";
    const ul = document.createElement("ul");
    ul.className = "pagination-buttons";
    if (layout.includes("first")) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = t.firstText;
      btn.disabled = this.currentPage === 1;
      btn.addEventListener("click", () => this._goto(1));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    if (layout.includes("prev")) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = t.prevText;
      btn.disabled = this.currentPage === 1;
      btn.addEventListener("click", () => this._goto(this.currentPage - 1));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    if (layout.includes("pages")) this.pagers.forEach((page) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "pager";
      if (page === this.currentPage) {
        btn.setAttribute("aria-current", "page");
        btn.setAttribute("part", "current-page");
      } else {
        btn.removeAttribute("aria-current");
        btn.removeAttribute("part");
      }
      btn.textContent = page;
      btn.addEventListener("click", () => this._goto(page));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    if (layout.includes("next")) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = t.nextText;
      btn.disabled = this.currentPage >= totalPages;
      btn.addEventListener("click", () => this._goto(this.currentPage + 1));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    if (layout.includes("last")) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = t.lastText;
      btn.disabled = this.currentPage >= totalPages;
      btn.addEventListener("click", () => this._goto(totalPages));
      li.appendChild(btn);
      ul.appendChild(li);
    }
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", t.paginationLabel);
    nav.appendChild(ul);
    grp2.appendChild(nav);
    container.appendChild(grp2);
    if (layout.includes("jump")) {
      const grp3 = document.createElement("div");
      grp3.className = "au-pagination-group";
      const lbl = document.createElement("label");
      lbl.setAttribute("for", this._jumpId);
      lbl.textContent = t.goText;
      grp3.appendChild(lbl);
      const input = document.createElement("input");
      input.type = "number";
      input.id = this._jumpId;
      input.min = "1";
      input.max = String(totalPages);
      input.value = String(this.currentPage);
      input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") this._goto(+input.value);
      });
      grp3.appendChild(input);
      const suf = document.createElement("span");
      suf.textContent = t.pageSuffix;
      grp3.appendChild(suf);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = t.gotoText;
      btn.addEventListener("click", () => this._goto(+input.value));
      grp3.appendChild(btn);
      container.appendChild(grp3);
    }
    root.appendChild(container);
    this.shadowRoot.append(root, this.liveRegion);
  }
  _goto(page) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.setAttribute("data-current-page", String(page));
    this.dispatchEvent(new CustomEvent("page-change", { detail: page, bubbles: true, composed: true }));
    this.announce(this.formatText(this.texts.pageAnnouncement, { page }));
  }
  announce(message) {
    while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
    requestAnimationFrame(() => {
      const span = document.createElement("span");
      span.textContent = message;
      this.liveRegion.appendChild(span);
    });
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-pagination")) {
  customElements.define("au-pagination", AuPagination);
}
class AuRadioGroup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    const style = document.createElement("style");
    style.textContent = `
      .au-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.625rem;
      }
      .au-radio-group--vertical {
        flex-direction: column;
        label {
          width: max-content;
        }
      }
      label {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--au-radio-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) var(--au-radio-input-border-color, oklch(0.7894 0 0));
          border-radius: 50%;
          background-color: var(--au-radio-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-radio-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: '';
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background-color: var(--au-radio-input-checked-circle-color, oklch(0.994 0 0));
            }
          }
        }
        .text {
          flex: 1;
          color: var(--au-radio-label-text-color, oklch(0.1398 0 0));
          font-size: var(--au-radio-label-text-size, 1rem);
        }
        &:hover {
          .text {
            text-decoration: var(--au-radio-label-hover-text-deco, underline);
          }
        }
        &:active {
          .text {
            color: var(--au-radio-label-active-text-color, oklch(0.537 0 0));
          }
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) var(--au-radio-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        &:has(input[type="radio"]:disabled) {
          cursor: not-allowed;
          input[type="radio"] {
            opacity: 0.5;
          }
          .text {
            pointer-events: none;
            text-decoration: none;
            color: var(--au-radio-label-disabled-text-color, oklch(0.537 0 0));
          }
        }
      }
    `;
    const container = document.createElement("div");
    container.setAttribute("class", "au-radio-group");
    container.setAttribute("role", "radiogroup");
    this.groupName = "radio-group-name-" + this.generateId();
    const slot = document.createElement("slot");
    slot.style.display = "none";
    this.shadowRoot.append(style, container, slot);
  }
  connectedCallback() {
    const slot = this.shadowRoot.querySelector("slot");
    slot.addEventListener("slotchange", () => {
      this.renderRadios();
    });
    this._mutationObserver = new MutationObserver(() => {
      this.renderRadios();
      this.updateGroupAttributes();
    });
    this._mutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["label", "value", "checked", "disabled"]
    });
    this.renderRadios();
    this.updateGroupAttributes();
  }
  disconnectedCallback() {
    var _a;
    (_a = this._mutationObserver) == null ? void 0 : _a.disconnect();
  }
  renderRadios() {
    const container = this.shadowRoot.querySelector(".au-radio-group");
    container.innerHTML = "";
    const slot = this.shadowRoot.querySelector("slot");
    const radios = slot.assignedElements();
    const isDisabled = this.hasAttribute("disabled");
    let initialValue = null;
    radios.forEach((radio, index) => {
      const label = document.createElement("label");
      const inputID = "radio-" + this.generateId();
      label.setAttribute("for", inputID);
      const input = document.createElement("input");
      input.type = "radio";
      input.id = inputID;
      input.name = this.groupName;
      input.value = radio.getAttribute("value") || `radio-${index + 1}`;
      if (radio.hasAttribute("checked")) {
        input.checked = true;
        initialValue = input.value;
      }
      if (isDisabled || radio.hasAttribute("disabled")) {
        input.disabled = true;
      }
      const textSlot = document.createElement("div");
      textSlot.setAttribute("class", "text");
      textSlot.textContent = radio.getAttribute("label") || radio.textContent.trim();
      label.append(input, textSlot);
      container.appendChild(label);
      input.addEventListener("change", (event) => this.handleChange(event, input));
      input.addEventListener("keydown", (event) => this.handleKeyDown(event, index));
    });
    this.internals.setFormValue(initialValue);
  }
  handleChange(event, input) {
    if (input.checked) {
      const radios = this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`);
      radios.forEach((radio) => {
        if (radio !== input) {
          radio.checked = false;
        }
      });
      this.internals.setFormValue(input.value);
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: input.value }
      }));
    }
  }
  handleKeyDown(event, currentIndex) {
    const radios = Array.from(this.shadowRoot.querySelectorAll(`input[name="${this.groupName}"]`));
    let nextIndex;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = (currentIndex + 1) % radios.length;
        while (radios[nextIndex].disabled) {
          nextIndex = (nextIndex + 1) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        while (radios[nextIndex].disabled) {
          nextIndex = (nextIndex - 1 + radios.length) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
    }
  }
  static get observedAttributes() {
    return ["disabled", "direction", "aria-label", "aria-labelledby", "label"];
  }
  attributeChangedCallback(name) {
    if (name === "disabled") {
      const isDisabled = this.hasAttribute("disabled");
      this.shadowRoot.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.disabled = isDisabled;
      });
    } else if (["direction", "aria-label", "aria-labelledby", "label"].includes(name)) {
      this.updateGroupAttributes();
    }
  }
  updateGroupAttributes() {
    const container = this.shadowRoot.querySelector(".au-radio-group");
    if (!container) return;
    const ariaLabel = this.getAttribute("aria-label") || this.getAttribute("label");
    if (ariaLabel) {
      container.setAttribute("aria-label", ariaLabel);
    } else {
      container.removeAttribute("aria-label");
    }
    if (this.hasAttribute("aria-labelledby")) {
      container.setAttribute("aria-labelledby", this.getAttribute("aria-labelledby"));
    } else {
      container.removeAttribute("aria-labelledby");
    }
    container.classList.toggle("au-radio-group--vertical", this.getAttribute("direction") === "vertical");
  }
  get value() {
    const checked = Array.from(this.shadowRoot.querySelectorAll('input[type="radio"]')).find((r) => r.checked);
    return (checked == null ? void 0 : checked.value) ?? null;
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
  formResetCallback() {
    this.renderRadios();
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `${byteArray[0].toString(36)}`;
    }
    return Math.random().toString(36).slice(2);
  }
}
__publicField(AuRadioGroup, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-radio-group")) {
  customElements.define("au-radio-group", AuRadioGroup);
}
class AuRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._groupName = "rating-" + this.generateId();
    this._skipRender = false;
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: var(--au-rating-gap, 0.5rem);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
          cursor: not-allowed;
        }

        :host([readonly]) {
          cursor: default;
        }
        
        .au-rating {
          border: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: var(--au-rating-gap, 0.25rem);
        }

        .au-rating:focus-within {
          box-shadow: inset 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
          border-radius: 4px;
        }
        
        .rating-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        
        input[type="radio"] {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: transform 150ms ease;
        }
        
        label:has(input:focus-visible) {
          outline: none;
          box-shadow: 0 0 0 var(--au-rating-focus-width, 3px) var(--au-rating-focus-color, oklch(0.8315 0.157 78));
        }
        
        .star-wrapper {
          position: relative;
          display: block;
          width: var(--au-rating-star-size, 2rem);
          height: var(--au-rating-star-size, 2rem);
        }
        
        .star {
          width: 100%;
          height: 100%;
          stroke: var(--au-rating-star-stroke-color, oklch(0.6 0 0));
          stroke-width: 1;
          transition: fill 150ms ease, transform 150ms ease;
        }
        
        .star-bg {
          fill: var(--au-rating-star-color, oklch(0.8 0 0));
        }
        
        .star-fill {
          position: absolute;
          top: 0;
          left: 0;
          fill: var(--au-rating-star-filled-color, oklch(0.75 0.15 85));
          clip-path: inset(0 var(--au-rating-clip, 100%) 0 0);
          transition: clip-path 150ms ease;
        }
        
        /* Animation for filled stars */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        
        .star-wrapper.animate {
          animation: pulse 200ms ease;
        }
        
        .label-text {
          color: var(--au-rating-label-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-label-size, 0.75rem);
          text-align: center;
          min-height: 1.2em;
          word-break: break-word;
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .score {
          color: var(--au-rating-score-color, oklch(0.1398 0 0));
          font-size: var(--au-rating-score-size, 1rem);
          font-weight: 500;
          white-space: nowrap;
        }
        
        .score:empty {
          display: none;
        }
      </style>
      <fieldset class="au-rating" role="radiogroup">
        <legend class="visually-hidden"></legend>
      </fieldset>
      <span class="score"></span>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._fieldset = this.shadowRoot.querySelector(".au-rating");
    this._legend = this.shadowRoot.querySelector("legend");
    this._scoreEl = this.shadowRoot.querySelector(".score");
    this._internals = this.attachInternals();
  }
  static get formAssociated() {
    return true;
  }
  static get observedAttributes() {
    return [
      "value",
      "max",
      "labels",
      "aria-label",
      "name",
      "show-score",
      "score-info",
      "disabled",
      "readonly",
      "data-text-rating",
      "data-text-star",
      "data-text-score"
    ];
  }
  connectedCallback() {
    this.render();
    this._fieldset.addEventListener("change", (e) => this.handleChange(e));
    this._fieldset.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected && !this._skipRender) {
      if (name === "value") {
        const val = parseFloat(newValue);
        this.updateStars(val);
        this.updateScoreDisplay(val);
        this._internals.setFormValue(newValue);
      } else {
        this.render();
      }
    }
  }
  get max() {
    return parseInt(this.getAttribute("max")) || 5;
  }
  get value() {
    const val = this.getAttribute("value");
    return val ? parseFloat(val) : 0;
  }
  set value(val) {
    this.setAttribute("value", val);
  }
  get labels() {
    const labelsAttr = this.getAttribute("labels");
    if (labelsAttr) {
      return labelsAttr.split(",").map((l) => l.trim());
    }
    return [];
  }
  get name() {
    return this.getAttribute("name") || "rating";
  }
  get scoreInfo() {
    return this.getAttribute("score-info") || "";
  }
  get ratingLabel() {
    return this.getAttribute("aria-label") || this.getAttribute("data-text-rating") || "Rating";
  }
  get starLabelTemplate() {
    return this.getAttribute("data-text-star") || "{value} Star(s)";
  }
  get scoreTemplate() {
    return this.getAttribute("data-text-score") || "{value} / {max} {scoreInfo}";
  }
  get showScore() {
    return this.hasAttribute("show-score");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    if (val) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }
  get readonly() {
    return this.hasAttribute("readonly");
  }
  set readonly(val) {
    if (val) this.setAttribute("readonly", "");
    else this.removeAttribute("readonly");
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return byteArray[0].toString(36);
    }
    return Math.random().toString(36).slice(2);
  }
  getStarSVG(className = "") {
    return `<svg class="star ${className}" viewBox="0 0 24 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }
  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template).trim();
  }
  render() {
    const ariaLabel = this.ratingLabel;
    this._legend.textContent = ariaLabel;
    this._fieldset.setAttribute("aria-label", ariaLabel);
    this._fieldset.innerHTML = '<legend class="visually-hidden"></legend>';
    this._legend = this._fieldset.querySelector("legend");
    this._legend.textContent = ariaLabel;
    if (this.readonly) {
      this._fieldset.setAttribute("aria-readonly", "true");
    }
    if (this.disabled) {
      this._fieldset.setAttribute("aria-disabled", "true");
    }
    const labels = this.labels;
    const currentValue = this.value;
    const intValue = Math.round(currentValue);
    for (let i = 1; i <= this.max; i++) {
      const option = document.createElement("div");
      option.className = "rating-option";
      const inputId = `${this._groupName}-${i}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = this._groupName;
      input.value = i;
      input.id = inputId;
      if (i === intValue) {
        input.checked = true;
      }
      const labelTextContent = labels[i - 1];
      if (!labelTextContent) {
        input.setAttribute("aria-label", this.formatText(this.starLabelTemplate, { value: i, max: this.max }));
      }
      if (this.disabled || this.readonly) {
        input.disabled = true;
      }
      const label = document.createElement("label");
      label.setAttribute("for", inputId);
      const starWrapper = document.createElement("span");
      starWrapper.className = "star-wrapper";
      const fullStars = Math.floor(currentValue);
      const partialFill = currentValue - fullStars;
      let clipRight = 100;
      if (i <= fullStars) {
        clipRight = 0;
      } else if (i === fullStars + 1 && partialFill > 0) {
        clipRight = 100 - partialFill * 100;
      }
      starWrapper.style.setProperty("--au-rating-clip", `${clipRight}%`);
      starWrapper.innerHTML = `
        ${this.getStarSVG("star-bg")}
        ${this.getStarSVG("star-fill")}
      `;
      label.appendChild(starWrapper);
      const labelText = document.createElement("span");
      labelText.className = "label-text";
      labelText.textContent = labels[i - 1] || "";
      label.appendChild(labelText);
      option.appendChild(input);
      option.appendChild(label);
      this._fieldset.appendChild(option);
    }
    this.updateScoreDisplay(currentValue);
    this._internals.setFormValue(currentValue.toString());
  }
  updateScoreDisplay(val) {
    if (this.showScore) {
      this._scoreEl.textContent = this.formatText(this.scoreTemplate, {
        value: val,
        max: this.max,
        scoreInfo: this.scoreInfo
      });
    } else {
      this._scoreEl.textContent = "";
    }
  }
  handleChange(e) {
    if (e.target.type === "radio") {
      const newValue = parseInt(e.target.value);
      this.value = newValue;
      this.updateStars(newValue);
      this.updateScoreDisplay(newValue);
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: newValue }
      }));
    }
  }
  updateStars(selectedValue) {
    const starWrappers = this._fieldset.querySelectorAll(".star-wrapper");
    const fullStars = Math.floor(selectedValue);
    const partialFill = selectedValue - fullStars;
    starWrappers.forEach((wrapper, index) => {
      const starValue = index + 1;
      wrapper.classList.remove("animate");
      let clipRight = 100;
      if (starValue <= fullStars) {
        clipRight = 0;
        if (starValue === fullStars && partialFill === 0) {
          wrapper.classList.add("animate");
        }
      } else if (starValue === fullStars + 1 && partialFill > 0) {
        clipRight = 100 - partialFill * 100;
        wrapper.classList.add("animate");
      }
      wrapper.style.setProperty("--au-rating-clip", `${clipRight}%`);
    });
  }
  handleKeyDown(e) {
    const radios = Array.from(this._fieldset.querySelectorAll('input[type="radio"]'));
    const currentIndex = radios.findIndex((r) => r === this.shadowRoot.activeElement || r.checked);
    let nextIndex;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (this.value === 0 && currentIndex === 0) {
          nextIndex = 0;
        } else {
          nextIndex = (currentIndex + 1) % radios.length;
        }
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        radios[nextIndex].focus();
        radios[nextIndex].click();
        break;
    }
  }
  formResetCallback() {
    this.value = this.getAttribute("value") || 0;
    this._internals.setFormValue(this.value ? this.value.toString() : null);
  }
  formStateRestoreCallback(state, mode) {
    if (state) {
      this.value = state;
    }
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-rating")) {
  customElements.define("au-rating", AuRating);
}
class AuSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    const inputID = this.generateId();
    const style = document.createElement("style");
    style.textContent = `
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-switch-gap, 1rem);
        cursor: pointer;
        padding-top: var(--au-switch-padding-top, 0.625rem);
        padding-right: var(--au-switch-padding-right, 0.25rem);
        padding-bottom: var(--au-switch-padding-bottom, 0.625rem);
        padding-left: var(--au-switch-padding-left, 0);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        &:hover {
          text-decoration: underline;
        }
        &:has(input:focus-visible) {
          box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        } 
        &:has(input:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
          text-decoration: none;
        } 
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
      }
      .input {
        position: relative;
        &:before {
          content: '';
          display: block;
          width: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          height: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          background-color: gray;
          position: absolute;
          top: var(--au-switch-inner-distance, 0.25rem);
          left: var(--au-switch-inner-distance, 0.25rem);
          border-radius: var(--au-switch-inner-border-radius, calc((var(--au-switch-input-width, 4rem) / 2 - var(--au-switch-inner-distance, 0.25rem)) / 2));
          transition: background-color 360ms ease-in, left 240ms ease-in;
        }
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          margin: 0;
          display: block;
          width: var(--au-switch-input-width, 4rem);
          height: calc(var(--au-switch-input-width, 4rem) / 2);
          border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-switch-input-border-radius, calc(var(--au-switch-input-width, 4rem) / 4));
          transition: background-color 360ms ease-in;
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
        }
        &:has(input[type="checkbox"]:checked) input[type="checkbox"] {
          background-color: var(--au-switch-input-checked-bg, oklch(0.1398 0 0));
        }
        &:has(input[type="checkbox"]:checked):before {
          background-color: var(--au-switch-inner-checked-bg, oklch(0.994 0 0));
          left: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
        }
      }
     
    `;
    const switchElement = document.createElement("label");
    switchElement.classList.add("au-switch");
    switchElement.setAttribute("for", inputID);
    const container = document.createElement("div");
    container.classList.add("container");
    const offTextSpan = document.createElement("span");
    offTextSpan.classList.add("off-text");
    offTextSpan.setAttribute("aria-hidden", "true");
    const inputDiv = document.createElement("div");
    inputDiv.classList.add("input");
    this.inputElement = document.createElement("input");
    this.inputElement.id = inputID;
    this.inputElement.type = "checkbox";
    this.inputElement.setAttribute("role", "switch");
    this.inputElement.setAttribute("aria-checked", "false");
    inputDiv.appendChild(this.inputElement);
    const onTextSpan = document.createElement("span");
    onTextSpan.classList.add("on-text");
    onTextSpan.setAttribute("aria-hidden", "true");
    container.append(offTextSpan, inputDiv, onTextSpan);
    switchElement.append(container);
    this.shadowRoot.append(style, switchElement);
    const slot = document.createElement("slot");
    this.labelFallback = document.createElement("span");
    this.labelFallback.textContent = this.getAttribute("label") || "";
    slot.appendChild(this.labelFallback);
    switchElement.prepend(slot);
    this.inputElement.addEventListener("change", (event) => {
      const checked = event.target.checked;
      this.inputElement.setAttribute("aria-checked", checked.toString());
      const formValue = checked ? this.getAttribute("value") || "on" : null;
      this.internals.setFormValue(formValue);
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: checked }));
    });
    this.syncAccessibleLabel();
  }
  get checked() {
    var _a;
    return ((_a = this.inputElement) == null ? void 0 : _a.checked) ?? false;
  }
  set checked(val) {
    val ? this.setAttribute("checked", "") : this.removeAttribute("checked");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
  formResetCallback() {
    this.inputElement.checked = false;
    this.inputElement.setAttribute("aria-checked", "false");
    this.internals.setFormValue(null);
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-switch-${byteArray[0].toString(36)}`;
    }
    return `au-switch-${Math.random().toString(36).slice(2)}`;
  }
  static get observedAttributes() {
    return ["name", "value", "checked", "disabled", "off", "on", "label", "aria-label", "aria-labelledby"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const input = this.shadowRoot.querySelector("input");
    const offText = this.shadowRoot.querySelector(".off-text");
    const onText = this.shadowRoot.querySelector(".on-text");
    if (!input || !offText || !onText) return;
    switch (name) {
      case "checked":
        input.checked = newValue !== null;
        input.setAttribute("aria-checked", input.checked.toString());
        break;
      case "disabled":
        input.disabled = newValue !== null;
        break;
      case "off":
        offText.textContent = newValue || "";
        break;
      case "on":
        onText.textContent = newValue || "";
        break;
      case "label":
        if (this.labelFallback) this.labelFallback.textContent = newValue || "";
        this.syncAccessibleLabel();
        break;
      case "aria-label":
      case "aria-labelledby":
        this.syncAccessibleLabel();
        break;
      default:
        if (newValue === null) {
          input.removeAttribute(name);
        } else {
          input.setAttribute(name, newValue);
        }
        break;
    }
  }
  syncAccessibleLabel() {
    if (!this.inputElement) return;
    if (this.hasAttribute("aria-label")) {
      this.inputElement.setAttribute("aria-label", this.getAttribute("aria-label"));
    } else {
      this.inputElement.removeAttribute("aria-label");
    }
    if (this.hasAttribute("aria-labelledby")) {
      this.inputElement.setAttribute("aria-labelledby", this.getAttribute("aria-labelledby"));
    } else {
      this.inputElement.removeAttribute("aria-labelledby");
    }
  }
  connectedCallback() {
    const input = this.shadowRoot.querySelector("input");
    const offText = this.shadowRoot.querySelector(".off-text");
    const onText = this.shadowRoot.querySelector(".on-text");
    input.setAttribute("aria-checked", input.checked.toString());
    if (this.hasAttribute("off")) {
      offText.textContent = this.getAttribute("off");
    } else {
      offText.textContent = "";
    }
    if (this.hasAttribute("on")) {
      onText.textContent = this.getAttribute("on");
    } else {
      onText.textContent = "";
    }
    const formValue = input.checked ? this.getAttribute("value") || "on" : null;
    this.internals.setFormValue(formValue);
  }
}
__publicField(AuSwitch, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-switch")) {
  customElements.define("au-switch", AuSwitch);
}
class AuTabs extends HTMLElement {
  static get observedAttributes() {
    return ["data-text-tab", "data-text-badge-label-prefix"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tabs = [];
    this._panels = [];
    this._selectedIndex = 0;
    this.container = document.createElement("div");
    this.container.classList.add("au-tabs");
    const style = document.createElement("style");
    style.textContent = `
      .au-tablist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
      }

      .au-tablist-item{
        &:first-of-type {
          [role="tab"] {
            border-top-left-radius: var(--au-tabs-border-radius, 0);
          }
        }
        &:last-of-type {
          [role="tab"] {
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
            border-top-right-radius: var(--au-tabs-border-radius, 0);
          }
        }
      }

      button[role="tab"] {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.25rem;
        padding: var(--au-tabs-padding-vertical, 0.625rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.7894 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: var(--au-tabs-text-color, oklch(0.1398 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family);
        line-height: var(--au-tabs-text-line-height, 1.5);
        white-space: nowrap;

        /* background */
        background-color: var(--au-tabs-bg, oklch(0.9731 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: var(--au-tabs-hover-bg, oklch(0.9466 0 0));
        }
        
        &:active {
          background-color: var(--au-tabs-active-bg, oklch(0.8689 0 0));
        }

        &[aria-selected="true"] {
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(0.994 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(0.7894 0 0));
          background-color: var(--au-tabs-selected-bg, oklch(0.1398 0 0));
          color: var(--au-tabs-selected-text-color, oklch(0.994 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
      }

      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.7894 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.625rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: var(--au-tab-badge-bg, oklch(0.8689 0 0));
        color: var(--au-tab-badge-text-color, oklch(0.1398 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.625rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }

       ::slotted(.au-tab-panel) {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.7894 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
    `;
    this.tabsList = document.createElement("ul");
    this.tabsList.setAttribute("role", "tablist");
    this.tabsList.classList.add("au-tablist");
    const slot = document.createElement("slot");
    slot.name = "panel";
    this.container.append(style, this.tabsList, slot);
    this.shadowRoot.appendChild(this.container);
  }
  connectedCallback() {
    const slot = this.shadowRoot.querySelector('slot[name="panel"]');
    slot.addEventListener("slotchange", () => {
      this._renderTabs();
      this._attachEvents();
    });
    this._renderTabs();
    this._attachEvents();
  }
  attributeChangedCallback() {
    if (!this.isConnected) return;
    this._renderTabs();
    this._attachEvents();
  }
  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }
  _renderTabs() {
    const slot = this.shadowRoot.querySelector('slot[name="panel"]');
    const tabPanels = slot.assignedElements().filter((el) => el.classList.contains("au-tab-panel"));
    this._tabs = [];
    this._panels = [];
    this.tabsList.innerHTML = "";
    const selectedIndex = Math.min(this._selectedIndex, Math.max(tabPanels.length - 1, 0));
    tabPanels.forEach((panel, index) => {
      const label = panel.getAttribute("label") || this.formatText(this.getAttribute("data-text-tab") || "Tab {index}", { index: index + 1 });
      const labelLang = panel.getAttribute("label-lang") || this.getAttribute("data-text-tab-lang") || "";
      const prefix = panel.getAttribute("data-prefix") || "";
      const badge = panel.getAttribute("data-badge") || "";
      const affix = panel.getAttribute("data-affix") || "";
      const id = panel.id || this.generateId();
      const tabId = `tab-${id}`;
      const panelId = `panel-${id}`;
      panel.setAttribute("id", panelId);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-label", label);
      panel.setAttribute("aria-hidden", index === selectedIndex ? "false" : "true");
      const li = document.createElement("li");
      li.setAttribute("role", "presentation");
      li.className = "au-tablist-item" + (index === selectedIndex ? " au-tablist-item--selected" : "");
      const button = document.createElement("button");
      button.setAttribute("role", "tab");
      button.setAttribute("id", tabId);
      button.setAttribute("aria-selected", index === selectedIndex ? "true" : "false");
      button.setAttribute("tabindex", index === selectedIndex ? "0" : "-1");
      const frag = document.createDocumentFragment();
      if (prefix) {
        const span = document.createElement("span");
        span.className = "prefix";
        span.textContent = prefix;
        frag.appendChild(span);
      }
      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      if (labelLang) labelSpan.setAttribute("lang", labelLang);
      labelSpan.textContent = label;
      frag.appendChild(labelSpan);
      if (badge) {
        const span = document.createElement("span");
        span.className = "badge";
        const badgeLabelPrefix = this.getAttribute("data-text-badge-label-prefix") || "Additional information:";
        span.setAttribute("aria-label", `${badgeLabelPrefix} ${badge}`);
        span.textContent = badge;
        frag.appendChild(span);
      }
      if (affix) {
        const span = document.createElement("span");
        span.className = "affix";
        span.textContent = affix;
        frag.appendChild(span);
      }
      button.appendChild(frag);
      li.appendChild(button);
      this.tabsList.appendChild(li);
      this._tabs.push(button);
      this._panels.push(panel);
    });
    this._selectedIndex = selectedIndex;
  }
  _attachEvents() {
    this._tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this._selectTab(index));
      tab.addEventListener("keydown", (e) => this._onKeydown(e, index));
    });
  }
  _selectTab(index) {
    var _a;
    this._tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", selected);
      tab.setAttribute("tabindex", selected ? "0" : "-1");
      tab.parentElement.classList.toggle("au-tablist-item--selected", selected);
      this._panels[i].setAttribute("aria-hidden", !selected);
    });
    this._tabs[index].focus();
    this._selectedIndex = index;
    this.dispatchEvent(new CustomEvent("tab-change", {
      bubbles: true,
      composed: true,
      detail: {
        index,
        label: ((_a = this._panels[index]) == null ? void 0 : _a.getAttribute("label")) ?? ""
      }
    }));
  }
  _onKeydown(e, index) {
    const last = this._tabs.length - 1;
    let next = index;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    e.preventDefault();
    this._selectTab(next);
  }
  get selectedIndex() {
    return this._selectedIndex;
  }
  set selectedIndex(val) {
    this._selectTab(val);
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint32Array(1);
      crypto.getRandomValues(bytes);
      return bytes[0].toString(36);
    }
    return Math.random().toString(36).slice(2);
  }
}
if (typeof customElements !== "undefined" && !customElements.get("au-tabs")) {
  customElements.define("au-tabs", AuTabs);
}
class AuTextarea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
    this._id = this.getAttribute("id") || this.generateId();
    this._initialValue = "";
    this._initialValueSet = false;
    const style = document.createElement("style");
    style.textContent = `
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        display: inline-block;
        word-break: break-word;
        margin: var(--au-textarea-label-margin-vertical, 0) var(--au-textarea-label-margin-horizontal, 0);
        padding: var(--au-textarea-label-padding-vertical, 0.625rem) var(--au-textarea-label-padding-horizontal, 0);
        color: var(--au-textarea-label-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-label-text-size, 1rem);
        font-family: var(--au-textarea-label-text-family);
      }

      .textarea-container {
        display: flex;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(0.7894 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        padding: var(--au-textarea-container-padding-vertical, 0.25rem) var(--au-textarea-container-padding-horizontal, 0.25rem);
      }

      textarea {
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        margin: 0;
        padding: var(--au-textarea-padding-vertical, 0.625rem) var(--au-textarea-padding-horizontal, 1rem);
        color: var(--au-textarea-text-color, oklch(0.1398 0 0));
        font-size: var(--au-textarea-text-size, 1rem);
        font-family: var(--au-textarea-text-family);
        line-height: var(--au-textarea-text-line-height, 1.5);

        border: 0;
        outline: none;
        background-color: var(--au-textarea-bg, oklch(0.994 0 0));
        border-radius: var(--au-textarea-border-radius, 0.25rem);
        width: 100%;
        
        resize: none;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }

        &:read-only {
          color: var(--au-textarea-readonly-text-color, oklch(0.1398 0 0));
          background-color: var(--au-textarea-readonly-bg, oklch(0.95 0 0));
          cursor: default;
          pointer-events: none;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }        
      }
        
    `;
    const wrapper = document.createElement("div");
    wrapper.className = "textarea-wrapper";
    this.labelEl = document.createElement("label");
    this.labelEl.setAttribute("for", this._id);
    this.labelEl.textContent = this.getAttribute("label") || "";
    const textareaContainer = document.createElement("div");
    textareaContainer.className = "textarea-container";
    this.textareaContainer = textareaContainer;
    this.textarea = document.createElement("textarea");
    this.textarea.id = this._id;
    const labelAttr = this.getAttribute("label");
    if (labelAttr && !this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
      this.textarea.setAttribute("aria-label", labelAttr);
    }
    this._bindTextareaEvents();
    textareaContainer.append(this.textarea);
    wrapper.append(this.labelEl, textareaContainer);
    this.shadowRoot.append(style, wrapper);
  }
  _bindTextareaEvents() {
    this.textarea.addEventListener("input", () => {
      this.value = this.textarea.value;
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this._syncValidity();
    });
    this.textarea.addEventListener("change", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  static get observedAttributes() {
    return ["value", "placeholder", "name", "rows", "cols", "disabled", "readonly", "required", "maxlength", "minlength", "aria-label", "aria-labelledby", "label", "id"];
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    var _a;
    if (name === "label" && this.labelEl) {
      this.labelEl.textContent = newValue;
      if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
        this.textarea.setAttribute("aria-label", newValue);
      }
    } else if (name === "id" && newValue) {
      this.textarea.id = newValue;
      (_a = this.labelEl) == null ? void 0 : _a.setAttribute("for", newValue);
    } else if (name === "value") {
      if (!this._initialValueSet) {
        this._initialValue = newValue || "";
        this._initialValueSet = true;
      }
      this.textarea.value = newValue;
      this.internals.setFormValue(newValue);
    } else {
      if (newValue === null) {
        this.textarea.removeAttribute(name);
      } else {
        this.textarea.setAttribute(name, newValue);
      }
    }
    this._syncValidity();
  }
  connectedCallback() {
    if (!this._initialValueSet) {
      this._initialValue = this.getAttribute("value") || this.textarea.value || "";
      this._initialValueSet = true;
    }
    this.internals.setFormValue(this.textarea.value);
    this._syncValidity();
  }
  get value() {
    return this.textarea.value;
  }
  set value(val) {
    this.textarea.value = val;
    this.internals.setFormValue(val);
    this._syncValidity();
  }
  formResetCallback() {
    const currentValue = this._initialValue || "";
    const newTextarea = this.textarea.cloneNode(false);
    newTextarea.value = currentValue;
    this.textareaContainer.replaceChild(newTextarea, this.textarea);
    this.textarea = newTextarea;
    this._bindTextareaEvents();
    this.internals.setFormValue(currentValue);
    this._syncValidity();
  }
  formStateRestoreCallback(state, mode) {
    this.value = state;
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(val) {
    val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }
  get readonly() {
    return this.hasAttribute("readonly");
  }
  set readonly(val) {
    val ? this.setAttribute("readonly", "") : this.removeAttribute("readonly");
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-textarea-${byteArray[0].toString(36)}`;
    }
    return `au-textarea-${Math.random().toString(36).slice(2)}`;
  }
  _syncValidity() {
    if (!this.textarea) return;
    if (this.textarea.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(this.textarea.validity, this.textarea.validationMessage, this.textarea);
    }
  }
}
__publicField(AuTextarea, "formAssociated", true);
if (typeof customElements !== "undefined" && !customElements.get("au-textarea")) {
  customElements.define("au-textarea", AuTextarea);
}
class AuTree extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = [];
    this._nodeRegistry = [];
    this._showCheckbox = false;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNodeExpand = this.handleNodeExpand.bind(this);
    this.handleNodeCheckChange = this.handleNodeCheckChange.bind(this);
    this._toggleLabel = null;
    this._fallbackNodeLabel = "Node";
    this._toggleLabelTemplate = null;
  }
  static get observedAttributes() {
    return ["show-checkbox", "data-text-node", "data-text-toggle"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "show-checkbox") {
      this._showCheckbox = newValue !== null;
      this.getAllNodes().forEach((node) => {
        if (this._showCheckbox) node.setAttribute("show-checkbox", "");
        else node.removeAttribute("show-checkbox");
      });
    }
    if (name === "data-text-node") {
      this._fallbackNodeLabel = newValue || "Node";
      this.getAllNodes().forEach((node) => {
        node.fallbackNodeLabel = this._fallbackNodeLabel;
      });
    }
    if (name === "data-text-toggle") {
      this._toggleLabelTemplate = newValue;
      this.getAllNodes().forEach((node) => {
        node.toggleLabelTemplate = this._toggleLabelTemplate;
      });
    }
  }
  get toggleLabel() {
    return this._toggleLabel;
  }
  set toggleLabel(val) {
    this._toggleLabel = val;
    this.getAllNodes().forEach((node) => {
      node.toggleLabel = val;
    });
  }
  get fallbackNodeLabel() {
    return this._fallbackNodeLabel;
  }
  set fallbackNodeLabel(val) {
    this._fallbackNodeLabel = val || "Node";
    this.setAttribute("data-text-node", this._fallbackNodeLabel);
  }
  get toggleLabelTemplate() {
    return this._toggleLabelTemplate;
  }
  set toggleLabelTemplate(val) {
    this._toggleLabelTemplate = val;
    if (val === null || val === void 0) this.removeAttribute("data-text-toggle");
    else this.setAttribute("data-text-toggle", val);
  }
  get data() {
    return this._data;
  }
  set data(val) {
    this._data = val;
    this.render();
  }
  connectedCallback() {
    this._upgradeProperty("data");
    if (this.shadowRoot.innerHTML === "") this.render();
    this.addEventListener("keydown", this.handleKeyDown);
    this.addEventListener("au-tree-node-expand", this.handleNodeExpand);
    this.addEventListener("au-tree-node-check-change", this.handleNodeCheckChange);
  }
  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }
  generateId() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-tree-${byteArray[0].toString(36)}`;
    }
    return `au-tree-${Math.random().toString(36).slice(2)}`;
  }
  render() {
    const treeId = this.generateId();
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--au-tree-text-family);
          font-size: var(--au-tree-font-size, 1rem);
          color: var(--au-tree-color, oklch(0.1398 0 0));
        }
        /* 使用 div 代替 ul 以防止自定義元素產生無效的列表語義 */
        div[role="tree"] {
          margin: 0;
          padding: 0;
        }
      </style>
      <div role="tree" id="${treeId}"></div>
    `;
    const rootContainer = this.shadowRoot.getElementById(treeId);
    if (Array.isArray(this._data)) {
      this._data.forEach((item) => {
        const node = document.createElement("au-tree-node");
        node.data = item;
        node.toggleLabel = this._toggleLabel;
        node.fallbackNodeLabel = this._fallbackNodeLabel;
        node.toggleLabelTemplate = this._toggleLabelTemplate;
        if (this._showCheckbox) node.setAttribute("show-checkbox", "");
        rootContainer.appendChild(node);
      });
    }
    requestAnimationFrame(() => this.updateNodeRegistry());
  }
  /**
   * 取得 DOM 順序中的所有節點的輔助函式（深度遍歷）
   */
  getAllNodes() {
    return this.collectNodes(this.shadowRoot);
  }
  collectNodes(root, visibleOnly = false) {
    let nodes = [];
    const children = Array.from(root.querySelectorAll("au-tree-node"));
    children.forEach((node) => {
      nodes.push(node);
      if (!visibleOnly || node.expanded) {
        if (node.shadowRoot) {
          nodes = nodes.concat(this.collectNodes(node.shadowRoot, visibleOnly));
        }
      }
    });
    return nodes;
  }
  updateNodeRegistry() {
    this._nodeRegistry = this.collectNodes(this.shadowRoot, true);
    this._nodeRegistry = this.collectNodes(this.shadowRoot, true);
    const activeInfo = this.findActiveNode();
    this._nodeRegistry.forEach((node) => node.tabIndex = -1);
    if (activeInfo.activeNode && this._nodeRegistry.includes(activeInfo.activeNode)) {
      activeInfo.activeNode.tabIndex = 0;
    } else if (this._nodeRegistry.length > 0) {
      this._nodeRegistry[0].tabIndex = 0;
    }
  }
  findActiveNode() {
    let focused = this.shadowRoot.activeElement;
    while (focused && focused.shadowRoot && focused.shadowRoot.activeElement) {
      focused = focused.shadowRoot.activeElement;
    }
    return { activeNode: focused instanceof AuTreeNode ? focused : null };
  }
  handleKeyDown(e) {
    const current = e.composedPath().find((el) => el instanceof AuTreeNode);
    if (!current) return;
    this.updateNodeRegistry();
    const index = this._nodeRegistry.indexOf(current);
    let target = null;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (index < this._nodeRegistry.length - 1) target = this._nodeRegistry[index + 1];
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) target = this._nodeRegistry[index - 1];
        break;
      case "ArrowRight":
        e.preventDefault();
        if (current.hasChildren) {
          if (!current.expanded) {
            current.setExpanded(true);
            this.updateNodeRegistry();
          } else {
            if (index < this._nodeRegistry.length - 1) target = this._nodeRegistry[index + 1];
          }
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (current.hasChildren && current.expanded) {
          current.setExpanded(false);
          this.updateNodeRegistry();
          current.setExpanded(false);
          this.updateNodeRegistry();
          target = current;
        } else {
          const parent2 = current.getRootNode().host;
          if (parent2 instanceof AuTreeNode) target = parent2;
        }
        break;
      case "Home":
        e.preventDefault();
        if (this._nodeRegistry.length > 0) target = this._nodeRegistry[0];
        break;
      case "End":
        e.preventDefault();
        if (this._nodeRegistry.length > 0) target = this._nodeRegistry[this._nodeRegistry.length - 1];
        break;
      case "*":
        e.preventDefault();
        const parent = current.getRootNode().host;
        if (parent && parent instanceof AuTreeNode) {
          parent.expandAllChildren();
        } else {
          this.expandAllChildren();
        }
        this.updateNodeRegistry();
        break;
      default:
        if (e.key.length === 1 && e.key.match(/\S/)) {
          this.handleTypeAhead(e.key, index);
        }
        break;
    }
    if (target) {
      this._nodeRegistry.forEach((n) => n.tabIndex = -1);
      target.tabIndex = 0;
      target.focus();
    }
  }
  handleTypeAhead(char, currentIndex) {
    char = char.toLowerCase();
    const fwd = this._nodeRegistry.slice(currentIndex + 1).find((n) => n.label.toLowerCase().startsWith(char));
    if (fwd) {
      this.focusNode(fwd);
      return;
    }
    const bwd = this._nodeRegistry.slice(0, currentIndex).find((n) => n.label.toLowerCase().startsWith(char));
    if (bwd) {
      this.focusNode(bwd);
    }
  }
  focusNode(node) {
    this._nodeRegistry.forEach((n) => n.tabIndex = -1);
    node.tabIndex = 0;
    node.focus();
  }
  expandAllChildren() {
    Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach((n) => n.setExpanded(true));
  }
  handleNodeExpand() {
  }
  handleNodeCheckChange(e) {
    const checkedNodes = this.getAllNodes().filter((n) => n.checked).map((n) => n.data);
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { checkedNodes } }));
  }
}
class AuTreeNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = {};
    this.expanded = false;
    this.checked = false;
    this.indeterminate = false;
    this._initialized = false;
    this._uid = `au-tree-node-${Math.random().toString(36).substr(2, 9)}`;
    this._toggleLabel = null;
    this._fallbackNodeLabel = "Node";
    this._toggleLabelTemplate = null;
  }
  static get observedAttributes() {
    return ["expanded", "show-checkbox", "checked", "indeterminate"];
  }
  get toggleLabel() {
    return this._toggleLabel;
  }
  set toggleLabel(val) {
    this._toggleLabel = val;
    this.renderContent();
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("au-tree-node").forEach((n) => n.toggleLabel = val);
    }
  }
  get fallbackNodeLabel() {
    return this._fallbackNodeLabel;
  }
  set fallbackNodeLabel(val) {
    this._fallbackNodeLabel = val || "Node";
    this.renderContent();
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("au-tree-node").forEach((n) => n.fallbackNodeLabel = this._fallbackNodeLabel);
    }
  }
  get toggleLabelTemplate() {
    return this._toggleLabelTemplate;
  }
  set toggleLabelTemplate(val) {
    this._toggleLabelTemplate = val;
    this.renderContent();
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("au-tree-node").forEach((n) => n.toggleLabelTemplate = val);
    }
  }
  get data() {
    return this._data;
  }
  set data(val) {
    this._data = val;
    this.render();
  }
  get label() {
    return this._data.label || "";
  }
  get hasChildren() {
    return this._data.children && this._data.children.length > 0;
  }
  getLabelText() {
    return this._data.label || this._fallbackNodeLabel;
  }
  formatText(template, values = {}) {
    return Object.entries(values).reduce((message, [key, value]) => {
      return message.replaceAll(`{${key}}`, String(value));
    }, template);
  }
  escapeHTML(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  connectedCallback() {
    this.shadowRoot.addEventListener("au-tree-node-check-change", this.handleChildCheckChange.bind(this));
    this.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    this.shadowRoot.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = e.target;
      const toggleBtn = target.closest(".toggle-btn");
      if (toggleBtn && !toggleBtn.classList.contains("hidden")) {
        this.setExpanded(!this.expanded);
        this.focus();
        return;
      }
      if (target.closest(".node-content")) ;
    });
    this.shadowRoot.addEventListener("change", (e) => {
      const input = e.target;
      if (input.tagName === "INPUT" && input.type === "checkbox") {
        e.stopPropagation();
        this.toggleCheck(input.checked);
      }
    });
    this.addEventListener("keydown", (e) => {
      const target = e.composedPath()[0];
      const isInternalInteractive = target.tagName === "INPUT" || target.tagName === "BUTTON";
      if (isInternalInteractive) {
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        if (this.hasAttribute("show-checkbox")) {
          if (!isInternalInteractive) this.toggleCheck();
        } else {
          if (this.hasChildren) {
            this.setExpanded(!this.expanded);
          }
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        this.setExpanded(!this.expanded);
      }
    });
  }
  attributeChangedCallback(name, old, val) {
    if (!this._initialized) return;
    if (name === "show-checkbox") {
      this.renderContent();
      const children = this.shadowRoot.querySelectorAll("au-tree-node");
      children.forEach((c) => {
        if (val !== null) c.setAttribute("show-checkbox", "");
        else c.removeAttribute("show-checkbox");
      });
    }
  }
  setExpanded(state) {
    if (state === this.expanded) return;
    this.expanded = state;
    const group = this.shadowRoot.querySelector('div[role="group"]');
    const toggle = this.shadowRoot.querySelector(".toggle-icon");
    if (this.expanded) {
      this.setAttribute("aria-expanded", "true");
      if (group) group.style.display = "block";
      if (toggle) toggle.style.transform = "rotate(90deg)";
    } else {
      this.setAttribute("aria-expanded", "false");
      if (group) group.style.display = "none";
      if (toggle) toggle.style.transform = "rotate(0deg)";
    }
    this.dispatchEvent(new CustomEvent("au-tree-node-expand", { bubbles: true, composed: true }));
  }
  expandAllChildren() {
    this.setExpanded(true);
    Array.from(this.shadowRoot.querySelectorAll("au-tree-node")).forEach((n) => n.expandAllChildren());
  }
  toggleCheck(forceState = null) {
    const newState = forceState !== null ? forceState : !this.checked;
    this.setChecked(newState);
    this.setChildrenChecked(newState);
    this.dispatchEvent(new CustomEvent("au-tree-node-check-change", {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, node: this }
    }));
  }
  setChecked(state, indeterminate = false) {
    this.checked = state;
    this.indeterminate = indeterminate;
    if (this.indeterminate) {
      this.setAttribute("aria-checked", "mixed");
    } else {
      this.setAttribute("aria-checked", state ? "true" : "false");
    }
    const input = this.shadowRoot.querySelector(`input#${this._uid}`);
    if (input) {
      input.checked = state;
      input.indeterminate = indeterminate;
    }
  }
  setChildrenChecked(state) {
    if (!this.hasChildren) return;
    const children = Array.from(this.shadowRoot.querySelectorAll("au-tree-node"));
    children.forEach((child) => {
      child.setChecked(state);
      child.setChildrenChecked(state);
    });
  }
  handleChildCheckChange(e) {
    e.stopPropagation();
    this.updateStateFromChildren();
    this.dispatchEvent(new CustomEvent("au-tree-node-check-change", {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, node: this }
    }));
  }
  updateStateFromChildren() {
    const children = Array.from(this.shadowRoot.querySelectorAll("au-tree-node"));
    const allChecked = children.every((c) => c.checked && !c.indeterminate);
    const allUnchecked = children.every((c) => !c.checked && !c.indeterminate);
    if (allChecked) {
      this.setChecked(true, false);
    } else if (allUnchecked) {
      this.setChecked(false, false);
    } else {
      this.setChecked(false, true);
    }
  }
  render() {
    this._initialized = true;
    const { children } = this._data;
    const showCheckbox = this.hasAttribute("show-checkbox");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          outline: none;
        }
        .node-content {
          display: flex;
          align-items: center;
          gap: var(--au-tree-node-padding-horizontal, 0.25rem);
          padding: var(--au-tree-node-padding-vertical, 0.25rem) var(--au-tree-node-padding-horizontal, 0.25rem);
          .au-checkbox {
            display: flex;
            align-items: center;
            gap: var(--au-tree-node-checkbox-content-gap, 0.375rem);
          }
        }
        .node-content > * {
          vertical-align: middle;
        }
        /* 焦點樣式：當 host 聚焦或內部元素聚焦時框住內容 */
        :host(:focus) .node-content {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tree-focus-shadow-width, 3px) var(--au-tree-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
        }
        
        button {
          /* behavior */
          cursor: pointer;
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);
          
          /* spacing */
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--au-tree-node-padding-horizontal, 1rem);
          word-break: break-word;
          width: 100%;
          text-align: left;
          padding: var(--au-tree-node-padding-vertical, 0.625rem) var(--au-tree-node-padding-horizontal, 1rem);
          
          /* text */
          color: var(--au-tree-node-text-color, oklch(0.1398 0 0));
          font-size: var(--au-tree-node-text-size, 1rem);
          font-family: var(--au-tree-node-text-family);
          line-height: var(--au-tree-node-text-line-height, 1.5);
          
          /* border */
          border: var(--au-tree-node-border-width, 0) var(--au-tree-node-border-style, solid) var(--au-tree-node-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-tree-node-border-radius, 0);
          
          /* others decoration */
          background-color: var(--au-tree-node-bg, transparent);
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
            align-items: center;
          }

          &[aria-expanded="true"] {
            .icon {
              transform: rotate3d(0, 0, 1, 180deg);
              transform-origin: center;
            }
          }

          &:hover {
            background-color: var(--au-tree-node-hover-bg, oklch(0.9466 0 0));
            border-color: var(--au-tree-node-hover-border-color, oklch(0.7894 0 0));
          }
          
          &:active {
            background-color: var(--au-tree-node-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-accordion-heading-active-border-color, oklch(0.7894 0 0));
          }
          
          &:focus-visible {
            outline: none;
          }

          &.hidden {
            visibility: hidden;
            pointer-events: none;
          }
        }
         
        /* 切換按鈕 */
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          width: var(--au-tree-node-toggle-btn-size, 2rem);
          height: var(--au-tree-node-toggle-btn-size, 2rem);
        }

        .toggle-icon {
          width: var(--au-tree-node-toggle-icon-size, 1rem);
          height: var(--au-tree-node-toggle-icon-size, 1rem);
          transition: transform 0.15s ease;
        }
        
        /* 核取方塊樣式 */
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          width: var(--au-tree-node-checkbox-input-width, 1.5rem);
          height: var(--au-tree-node-checkbox-input-height, 1.5rem);
          border: var(--au-tree-node-checkbox-input-border-width, 1px) var(--au-tree-node-checkbox-input-border-style, solid) var(--au-tree-node-checkbox-input-border-color, oklch(0.7894 0 0));
          border-radius: var(--au-tree-node-checkbox-input-border-radius, 0.25rem);
          background-color: var(--au-tree-node-checkbox-input-bg, oklch(0.994 0 0));
          &:focus-visible {
            outline: none;
          }
          &:disabled {
            cursor: not-allowed;
          }
          &:checked {
            background-color: var(--au-tree-node-checkbox-input-checked-bg, oklch(0.1398 0 0));
            display: grid;
            place-content: center;
            &:before {
              content: var(--au-tree-node-checkbox-input-checked-symbol, '✔');
              color: var(--au-tree-node-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-tree-node-checkbox-input-checked-text-size, 1.125rem);
            }
          }
          &:indeterminate {
            background-color: var(--au-tree-node-checkbox-input-checked-bg, oklch(0.1398 0 0)); /* 建議背景色與 checked 一致 */
            border-color: transparent;
            display: grid;
            place-content: center;

            &:before {
              /* 使用 '−' (Minus Sign) 符號，比一般連字號 '-' 更寬更置中 */
              content: var(--au-tree-node-checkbox-input-indeterminate-symbol, '−'); 
              color: var(--au-tree-node-checkbox-input-checked-text-color, oklch(0.994 0 0));
              font-size: var(--au-tree-node-checkbox-input-checked-text-size, 1.125rem);
              
              /* 確保符號垂直置中 */
              line-height: 0; 
              font-weight: bold;
            }
          }
        }

         label {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--au-tree-node-checkbox-content-gap, 0.375rem);
          -webkit-tap-highlight-color: oklch(0 0 0 / 0);
          .text {
            flex: 1;
            font-size: var(--au-tree-node-checkbox-label-text-size, 1rem);
          }
          &:active {
            .text {
              color: var(--au-tree-node-checkbox-label-active-text-color, oklch(0.537 0 0));
            }
          }
          &:has(input:focus-visible) {
            box-shadow: inset 0 0 0 var(--au-tree-node-checkbox-input-focus-shadow-width, 3px) var(--au-tree-node-checkbox-input-focus-shadow-color, oklch(0.8315 0.15681888825079074 78.05241467152487));
          }
          &:has(input[type="checkbox"]:disabled) {
            cursor: not-allowed;
            input[type="checkbox"] {
              opacity: 0.5;
            }
            .text {
              pointer-events: none;
              text-decoration: none;
              color: var(--au-tree-node-checkbox-label-disabled-text-color, oklch(0.537 0 0));
            }
          }
        }
        
        div[role="group"] {
          padding-left: var(--au-tree-indent, 1.5rem);
          margin: 0;
          display: none;
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
      </style>
      <div class="node-content"></div>
      ${this.hasChildren ? `<div role="group"></div>` : ""}
    `;
    this.renderContent();
    if (this.hasChildren) {
      const group = this.shadowRoot.querySelector('div[role="group"]');
      children.forEach((childData) => {
        const childNode = document.createElement("au-tree-node");
        childNode.data = childData;
        childNode.toggleLabel = this._toggleLabel;
        childNode.fallbackNodeLabel = this._fallbackNodeLabel;
        childNode.toggleLabelTemplate = this._toggleLabelTemplate;
        if (showCheckbox) childNode.setAttribute("show-checkbox", "");
        group.appendChild(childNode);
      });
    }
    this.setAttribute("role", "treeitem");
    if (this.hasChildren) {
      this.setAttribute("aria-expanded", "false");
    }
    if (showCheckbox) {
      this.setAttribute("aria-checked", "false");
    }
  }
  renderContent() {
    const container = this.shadowRoot.querySelector(".node-content");
    if (!container) return;
    const showCheckbox = this.hasAttribute("show-checkbox");
    const labelText = this.getLabelText();
    const escapedLabelText = this.escapeHTML(labelText);
    this.setAttribute("aria-label", labelText);
    const arrowIcon = `<svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" aria-hidden="true"/></svg><span class="visually-hidden">${escapedLabelText}</span>`;
    const toggleLabelText = typeof this._toggleLabel === "function" ? this._toggleLabel(this._data) : this.formatText(this._toggleLabelTemplate || "Toggle {label}", { label: labelText });
    const escapedToggleLabelText = this.escapeHTML(toggleLabelText);
    const buttonHtml = this.hasChildren ? `<button class="toggle-btn" tabindex="-1" aria-label="${escapedToggleLabelText}">${arrowIcon}</button>` : `<button class="toggle-btn hidden" tabindex="-1" aria-hidden="true">${arrowIcon}</button>`;
    const checkboxHtml = showCheckbox ? `<div class="au-checkbox"><input type="checkbox" id="${this._uid}" tabindex="-1" ${this.checked ? "checked" : ""}>` : "";
    const labelId = `${this._uid}-label`;
    const labelHtml = showCheckbox ? `<label id="${labelId}" for="${this._uid}">${escapedLabelText}</label></div>` : `<span>${escapedLabelText}</span>`;
    container.innerHTML = `
        ${buttonHtml}
        ${checkboxHtml}
        ${labelHtml}
      `;
    if (showCheckbox && this.indeterminate) {
      const input = container.querySelector("input");
      if (input) input.indeterminate = true;
    }
    const toggle = container.querySelector(".toggle-icon");
    if (this.expanded && toggle) toggle.style.transform = "rotate(90deg)";
  }
}
if (typeof customElements !== "undefined") {
  if (!customElements.get("au-tree")) customElements.define("au-tree", AuTree);
  if (!customElements.get("au-tree-node")) customElements.define("au-tree-node", AuTreeNode);
}
