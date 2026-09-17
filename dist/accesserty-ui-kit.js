var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
/*! Accesserty UI Kit v2.0.1 */
(function() {
  "use strict";
  class AuAccordion extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const visibilityStyle = document.createElement("style");
      visibilityStyle.textContent = ':host([hidden]:not([hidden="until-found" i])) { display: none; }';
      this.shadowRoot.append(visibilityStyle);
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
      this._childrenObserver = new MutationObserver(() => this._syncItems());
    }
    connectedCallback() {
      if (Object.hasOwn(this, "exclusive")) {
        const value = this.exclusive;
        delete this.exclusive;
        this.exclusive = value;
      }
      this.addEventListener("au-toggle", this._onToggle);
      this._childrenObserver.observe(this, { childList: true });
      this._updateExclusiveAria();
      this._syncItems();
    }
    disconnectedCallback() {
      this.removeEventListener("au-toggle", this._onToggle);
      this._childrenObserver.disconnect();
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
        this._syncItems();
      }
      if (name === "data-text-exclusive-hint" && oldValue !== newValue) {
        this._updateExclusiveHint();
      }
    }
    _updateExclusiveHint() {
      if (!this._exclusiveHint) return;
      this._exclusiveHint.textContent = this.getAttribute("data-text-exclusive-hint") || "Only one section may be expanded at a time.";
      this._syncItems();
    }
    _updateExclusiveAria() {
      if (this.exclusive) {
        this._container.setAttribute("aria-describedby", this._exclusiveHint.id);
      } else {
        this._container.removeAttribute("aria-describedby");
      }
    }
    _handleToggle(e) {
      var _a;
      const item = e.composedPath()[0];
      if ((item == null ? void 0 : item.parentElement) !== this || item.localName !== "au-accordion-item") return;
      if (this.exclusive && ((_a = e.detail) == null ? void 0 : _a.open)) this._syncItems(item);
    }
    _syncItems(preferred) {
      var _a;
      const items = [...this.children].filter((el) => el.localName === "au-accordion-item");
      const keep = preferred || items.find((item) => item.hasAttribute("open"));
      for (const item of items) {
        (_a = item.updateExclusiveHint) == null ? void 0 : _a.call(item);
        if (this.exclusive && item !== keep && item.hasAttribute("open")) item.removeAttribute("open");
      }
    }
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
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
          .au-accordion-item {
            box-sizing: border-box;
            margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
          }
          :host {
            display: block;
            max-width: 100%;
            min-width: 0;
          }
          [role="heading"] { margin: 0; }
          button {
            /* behavior */
            cursor: pointer;
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            box-sizing: border-box;
            
            /* spacing */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            word-break: break-word;
            width: 100%;
            text-align: start;
            min-height: 24px;
            padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);
            
            /* text */
            color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
            font-size: var(--au-accordion-heading-text-size, 1rem);
            font-family: var(--au-accordion-heading-text-family);
            line-height: var(--au-accordion-heading-text-line-height, 1.5);
            
            /* border */
            border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-radius: var(--au-accordion-heading-border-radius, 0);
            
            /* others decoration */
            background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            .heading {
              min-width: 0;
              flex: 1 1 0;
              max-width: 100%;
              overflow-wrap: break-word;
              overflow-wrap: anywhere;
              word-break: break-word;

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
              flex: 0 0 auto;
              min-width: 0;
              max-width: min(50%, var(--au-accordion-info-max-width, 12rem));
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
              border-color: var(--au-accordion-heading-hover-border-color, oklch(0.55 0 0));
            }
            
            &:active {
              background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-accordion-heading-active-border-color, oklch(0.55 0 0));
            }
            
            &:focus-visible {
              outline: var(--au-accordion-heading-focus-shadow-width, 3px) solid var(--au-accordion-heading-focus-shadow-color, oklch(0.4 0 0));
              outline-offset: -3px;
            }
          }

          .region {
            overflow-wrap: anywhere;
            background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
            color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
            padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
            overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
            border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
            border-radius: var(--au-accordion-content-border-radius, 0);
            &[hidden] {
              display: none !important;
            }
          }
          .exclusive-hint { position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }
          @media (forced-colors: active) { button:focus-visible { outline: 2px solid Highlight; outline-offset:-2px; } }
          @media (prefers-reduced-motion: reduce) { button, button .icon { transition: none; } }
        </style>
        <div role="heading" aria-level="3">
        <button type="button" id="${titleId}" aria-expanded="false" aria-controls="${regionId}" part="button">
            <div class="heading"><slot name="heading"></slot></div>
            <div class="info">
              <div>
                <slot name="sub"></slot>
              </div>
              <div class="icon" aria-hidden="true">
                <slot name="icon"></slot>
              </div>
            </div>
        </button>
        </div>
        <span class="exclusive-hint" id="${regionId}-hint"></span>
        <div class="region" role="region" id="${regionId}" aria-labelledby="${titleId}" hidden inert part="region">
            <slot name="content"></slot>
        </div>
      `;
      this.shadowRoot.append(content);
      this.button = this.shadowRoot.querySelector("button");
      this.region = this.shadowRoot.querySelector(".region");
      this.heading = this.shadowRoot.querySelector('[role="heading"]');
      this._hint = this.shadowRoot.querySelector(".exclusive-hint");
      this.button.addEventListener("click", () => this.toggleAccordion());
    }
    connectedCallback() {
      if (Object.hasOwn(this, "open")) {
        const value = this.open;
        delete this.open;
        this.open = value;
      }
      this.updateExpanded();
      this.updateSemantics();
      this.updateExclusiveHint();
    }
    static get observedAttributes() {
      return ["open", "heading-level", "no-region"];
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
      if (oldValue === newValue) return;
      if (name !== "open") {
        this.updateSemantics();
        return;
      }
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
      var _a;
      const isOpen = this.hasAttribute("open");
      let active = this.ownerDocument.activeElement;
      while ((_a = active == null ? void 0 : active.shadowRoot) == null ? void 0 : _a.activeElement) active = active.shadowRoot.activeElement;
      for (let node = active; !isOpen && node; node = node.assignedSlot || node.parentNode || node.host) {
        if (node === this.region) {
          this.button.focus({ preventScroll: true });
          break;
        }
      }
      this.button.setAttribute("aria-expanded", isOpen);
      this.region.hidden = !isOpen;
      this.region.inert = !isOpen;
    }
    updateSemantics() {
      const level = Number(this.getAttribute("heading-level"));
      this.heading.setAttribute("aria-level", String(Number.isInteger(level) && level >= 1 && level <= 6 ? level : 3));
      if (this.hasAttribute("no-region")) {
        this.region.removeAttribute("role");
        this.region.removeAttribute("aria-labelledby");
      } else {
        this.region.setAttribute("role", "region");
        this.region.setAttribute("aria-labelledby", this.button.id);
      }
    }
    updateExclusiveHint() {
      const owner = this.parentElement;
      const exclusive = (owner == null ? void 0 : owner.localName) === "au-accordion" && owner.hasAttribute("exclusive");
      this._hint.textContent = exclusive ? owner.getAttribute("data-text-exclusive-hint") || "Only one section may be expanded at a time." : "";
      if (exclusive) this.button.setAttribute("aria-describedby", this._hint.id);
      else this.button.removeAttribute("aria-describedby");
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
  if (typeof customElements !== "undefined" && !customElements.get("au-accordion")) {
    customElements.define("au-accordion", AuAccordion);
  }
  class AuBreadcrumbs extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      for (const name of ["items", "separator"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
    }
    connectedCallback() {
      this.render();
      this.observeLabelRoot();
    }
    disconnectedCallback() {
      var _a;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
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
        if (name === "aria-labelledby" && this.isConnected) this.observeLabelRoot();
      }
    }
    get items() {
      const attr = this.getAttribute("items");
      if (!attr) return [];
      try {
        const parsed = JSON.parse(attr);
        return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "object" && !Array.isArray(item) && "text" in item) : [];
      } catch {
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
    navigationURL(value) {
      if (typeof value !== "string" || !value.trim()) return null;
      try {
        const url = new URL(value, this.ownerDocument.baseURI);
        if (["http:", "https:"].includes(url.protocol)) return url.href;
        const documentURL = new URL(this.ownerDocument.URL);
        return url.protocol === "file:" && documentURL.protocol === "file:" && url.host === "" && documentURL.host === "" ? url.href : null;
      } catch {
        return null;
      }
    }
    observeLabelRoot() {
      var _a, _b;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      if (!((_b = this.getAttribute("aria-labelledby")) == null ? void 0 : _b.trim())) return;
      this._labelObserver ?? (this._labelObserver = new MutationObserver(() => this.syncAccessibleLabel()));
      this._labelObserver.observe(this.getRootNode(), {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "aria-label"]
      });
      this.syncAccessibleLabel();
    }
    syncAccessibleLabel() {
      var _a, _b, _c;
      if (!this._nav) return;
      const root = this.getRootNode();
      const ids = (this.getAttribute("aria-labelledby") || "").trim().split(/\s+/).filter(Boolean);
      const labels = ids.map((id) => {
        var _a2;
        return (_a2 = root.getElementById) == null ? void 0 : _a2.call(root, id);
      }).filter((el) => el && el !== this);
      const fallback = ((_a = this.getAttribute("aria-label")) == null ? void 0 : _a.trim()) || ((_b = this.getAttribute("label")) == null ? void 0 : _b.trim()) || "Breadcrumbs";
      if ("ariaLabelledByElements" in this._nav) {
        this._nav.ariaLabelledByElements = labels;
        this._nav.setAttribute("aria-label", fallback);
      } else {
        const text = labels.map((el) => el.getAttribute("aria-label") || el.textContent).join(" ").trim();
        this._nav.setAttribute("aria-label", ((_c = this.getAttribute("aria-label")) == null ? void 0 : _c.trim()) || text || fallback);
      }
    }
    renderItems() {
      const items = this.items;
      const list = this._nav.querySelector("ol");
      const active = this.shadowRoot.activeElement;
      const prefix = this.getAttribute("data-link-title-prefix") || "go to";
      const template = this.getAttribute("data-link-title-template");
      items.forEach((item, index) => {
        const current = index === items.length - 1;
        const url = current ? null : this.navigationURL(item.url);
        const li = list.children[index] || list.appendChild(document.createElement("li"));
        let content = li.firstElementChild;
        const tag = url ? "A" : "SPAN";
        if (!content || content.tagName !== tag) {
          const replacement = document.createElement(tag.toLowerCase());
          const icon = document.createElement("slot");
          const text = document.createElement("span");
          replacement.append(icon, text);
          content ? content.replaceWith(replacement) : li.append(replacement);
          content = replacement;
        }
        content.className = "item";
        content.firstElementChild.name = `icon-${index + 1}`;
        content.lastElementChild.textContent = String(item.text ?? "");
        current ? content.setAttribute("aria-current", "page") : content.removeAttribute("aria-current");
        if (url) {
          content.href = url;
          content.title = template ? this.formatText(template, { text: item.text ?? "", index: index + 1 }) : `${prefix} ${item.text ?? ""}`;
        }
        let separator = li.querySelector('[aria-hidden="true"]');
        if (current) separator == null ? void 0 : separator.remove();
        else {
          if (!separator) {
            separator = document.createElement("span");
            separator.setAttribute("aria-hidden", "true");
            li.append(separator);
          }
          separator.textContent = this.separator;
        }
      });
      while (list.children.length > items.length) list.lastElementChild.remove();
      if (active && !this.shadowRoot.contains(active)) this._nav.focus();
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
    `;
        this._nav = this.shadowRoot.querySelector("nav");
      }
      for (const name of ["id", "class"]) {
        this.hasAttribute(name) ? this._nav.setAttribute(name, this.getAttribute(name)) : this._nav.removeAttribute(name);
      }
      this.syncAccessibleLabel();
      this.renderItems();
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
      if (this._rendered) return;
      this._rendered = true;
      this.shadowRoot.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host { display:block; min-inline-size:0; box-sizing:border-box; }

        .au-card-container { min-inline-size:0; overflow-wrap:anywhere; }
      </style>
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
  class AuCarousel extends HTMLElement {
    static get observedAttributes() {
      return [
        "data-live-template",
        "data-item-fallback",
        "data-dot-template",
        "data-text-prev",
        "data-text-next",
        "data-text-pagination",
        "data-text-instructions",
        "data-icon-prev",
        "data-icon-next",
        "aria-label",
        "aria-labelledby",
        "data-text-roledescription"
      ];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._current = -1;
      this._slides = [];
      this._names = [];
      this._dots = [];
      this._settle = null;
      this._FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host {
        display: block;
        /* The carousel is its OWN container, so "slides per view" responds to
           the carousel's width, not the viewport. @container rules below target
           descendants, because a container can't style itself. Author-facing
           custom properties live here so slotted (light-DOM) slides inherit
           them — shadow-DOM variables would NOT reach slotted content. */
        container: au-carousel / inline-size;

        --au-carousel-gap: 1rem;
        --au-carousel-visible: 1;                 /* overridden by @container */

        --au-carousel-dot-target: 1.75rem;        /* >=24px focus/click target */
        --au-carousel-dot-size: 0.7rem;           /* visible dot diameter */
        --au-carousel-dot-color: oklch(0.62 0 0); /* >=3:1 on white (WCAG 1.4.11) */
        --au-carousel-dot-current-color: oklch(0.2 0 0);
        --au-carousel-dot-gap: 0.25rem;
        --au-carousel-dot-focus-shadow-width: 3px;
        --au-carousel-dot-focus-shadow-color: oklch(0.55 0.2 256); /* >=3:1 on white */

        --au-carousel-button-size: 2.75rem;       /* >=24px target */
        --au-carousel-button-bg: oklch(0.2 0 0);
        --au-carousel-button-text-color: oklch(0.99 0 0);
        --au-carousel-button-radius: 999px;
        --au-carousel-button-disabled-opacity: 0.35;
        --au-carousel-button-focus-shadow-width: 3px;
        --au-carousel-button-focus-shadow-color: oklch(0.55 0.2 256); /* >=3:1 on white */

        --au-carousel-controls-gap: 0.75rem;
      }


      /* ---- pagination: one real button per slide, named by its title ---- */
      .au-carousel-pagination {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: var(--au-carousel-dot-gap);
        margin-block-end: 0.5rem;
      }
      .au-carousel-dot {
        display: inline-flex;
        inline-size: var(--au-carousel-dot-target);
        block-size: var(--au-carousel-dot-target);
        min-inline-size: 24px;
        min-block-size: 24px;
        flex-shrink: 0;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        /* draw the visible dot inside the larger hit area */
        background-image: radial-gradient(
          circle,
          var(--au-carousel-dot-color) 0 calc(var(--au-carousel-dot-size) / 2),
          transparent calc(var(--au-carousel-dot-size) / 2)
        );
      }
      .au-carousel-dot[aria-current="true"] {
        border: 2px solid var(--au-carousel-dot-current-color);
        border-radius: 999px;
        background-image: radial-gradient(
          circle,
          var(--au-carousel-dot-current-color) 0 calc(var(--au-carousel-dot-size) / 2),
          transparent calc(var(--au-carousel-dot-size) / 2)
        );
      }
      .au-carousel-dot:focus-visible {
        outline: none;
        border-radius: 999px;
        box-shadow: 0 0 0 var(--au-carousel-dot-focus-shadow-width) var(--au-carousel-dot-focus-shadow-color);
      }

      /* ---- the track: scroll-snap, DOM order = reading order ---- */
      .au-carousel-track {
        /* One slide's width, derived from slides-per-view; reused by the
           trailing spacer so the LAST slide can still scroll to the left edge.
           (Slides get their own flex-basis via ::slotted below, because slotted
           light-DOM content does not inherit this shadow-DOM variable.) */
        --au-carousel-slide-basis: calc(
          (100% - (var(--au-carousel-visible) - 1) * var(--au-carousel-gap))
          / var(--au-carousel-visible)
        );
        display: flex;
        gap: var(--au-carousel-gap);
        margin: 0;
        padding: 0;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        /* The host's container-type applies size/layout/style containment but
           NOT paint, so a slotted slide's off-screen width would otherwise leak
           into the document and give the PAGE a horizontal scrollbar. Paint
           containment clips the track's overflow to its own box (the intended
           scroll viewport) while keeping the internal scroll working. It sits on
           the track, not the host, so the dots' and buttons' focus rings — which
           live outside the track — are never clipped. */
        contain: paint;
      }
      @container au-carousel (min-width: 34rem) { .au-carousel-track { --au-carousel-visible: 2; } }
      @container au-carousel (min-width: 52rem) { .au-carousel-track { --au-carousel-visible: 3; } }
      @media (prefers-reduced-motion: reduce) {
        .au-carousel-track { scroll-behavior: auto; }
      }
      /* Trailing space so the last slide can snap to the left edge; without it
         you can't scroll past the end and the last few slides never become
         current. max(0px, …) guards the 1-per-view case (basis == 100%). */
      .au-carousel-track::after {
        content: "";
        flex: 0 0 max(0px, calc(100% - var(--au-carousel-slide-basis) - var(--au-carousel-gap)));
      }

      /* Slides are author-defined light-DOM content: the component only sizes
         and snaps them. Their visual design (cards, images, text) is the
         author's, styled from the light DOM. */
      ::slotted(*) {
        flex: 0 0 100%;
        min-inline-size: 0;
        scroll-snap-align: start;
      }
      @container au-carousel (min-width: 34rem) {
        ::slotted(*) { flex-basis: calc((100% - 1 * var(--au-carousel-gap)) / 2); }
      }
      @container au-carousel (min-width: 52rem) {
        ::slotted(*) { flex-basis: calc((100% - 2 * var(--au-carousel-gap)) / 3); }
      }

      /* ---- prev / next: real buttons after the content ---- */
      .au-carousel-controls {
        display: flex;
        justify-content: center;
        gap: var(--au-carousel-controls-gap);
        margin-block-start: 0.75rem;
      }
      .au-carousel-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--au-carousel-button-size);
        block-size: var(--au-carousel-button-size);
        min-inline-size: 24px;
        min-block-size: 24px;
        flex-shrink: 0;
        border: none;
        border-radius: var(--au-carousel-button-radius);
        background: var(--au-carousel-button-bg);
        color: var(--au-carousel-button-text-color);
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
      }
      .au-carousel-button[aria-disabled="true"] {
        opacity: var(--au-carousel-button-disabled-opacity);
        cursor: not-allowed;
      }
      .au-carousel-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 var(--au-carousel-button-focus-shadow-width) var(--au-carousel-button-focus-shadow-color);
      }
      @media (forced-colors: active) {
        .au-carousel-dot { background-image:none; border:1px solid ButtonText; border-radius:999px; }
        .au-carousel-dot[aria-current="true"] { background:Highlight; border:3px double ButtonText; }
        .au-carousel-button { border:1px solid ButtonText; }
        .au-carousel-button[aria-disabled="true"] { color:GrayText; opacity:1; }
        .au-carousel-dot:focus-visible,.au-carousel-button:focus-visible { outline:2px solid Highlight;outline-offset:2px;box-shadow:none; }
      }

      .au-carousel-live,
      .au-carousel-sr-hint {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `;
      this._wrapper = document.createElement("div");
      this._wrapper.className = "au-carousel";
      this._wrapper.tabIndex = -1;
      this._wrapper.setAttribute("role", "group");
      this._pagination = document.createElement("div");
      this._pagination.className = "au-carousel-pagination";
      this._pagination.setAttribute("role", "group");
      this._hintId = this.generateId();
      this._hint = document.createElement("div");
      this._hint.className = "au-carousel-sr-hint";
      this._hint.id = this._hintId;
      this._pagination.setAttribute("aria-describedby", this._hintId);
      this._track = document.createElement("div");
      this._track.className = "au-carousel-track";
      this._slot = document.createElement("slot");
      this._track.appendChild(this._slot);
      this._controls = document.createElement("div");
      this._controls.className = "au-carousel-controls";
      this._prevBtn = document.createElement("button");
      this._prevBtn.type = "button";
      this._prevBtn.className = "au-carousel-button";
      this._prevBtn.dataset.carouselPrev = "";
      this._prevBtn.textContent = "‹";
      this._nextBtn = document.createElement("button");
      this._nextBtn.type = "button";
      this._nextBtn.className = "au-carousel-button";
      this._nextBtn.dataset.carouselNext = "";
      this._nextBtn.textContent = "›";
      this._controls.append(this._prevBtn, this._nextBtn);
      this._live = document.createElement("div");
      this._live.className = "au-carousel-live";
      this._live.setAttribute("aria-live", "polite");
      this._live.setAttribute("aria-atomic", "true");
      this._wrapper.append(this._pagination, this._track, this._controls, this._live, this._hint);
      this.shadowRoot.append(style, this._wrapper);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onPaginationKeydown = this._onPaginationKeydown.bind(this);
      this._onPrevKeydown = this._onPrevKeydown.bind(this);
      this._onPrevClick = () => {
        if (this._current > 0) this.slideTo(this._current - 1);
      };
      this._onNextClick = () => {
        if (this._current < this._maxIndex()) this.slideTo(this._current + 1);
      };
      this._onFocusIn = this._onFocusIn.bind(this);
      this._onScroll = this._onScroll.bind(this);
      this._onSettled = this._onSettled.bind(this);
      this._resizeObserver = new ResizeObserver(() => {
        if (this._current > this._maxIndex()) this.setCurrent(this._maxIndex());
        else this._apply();
      });
      this._contentObserver = new MutationObserver(() => {
        clearTimeout(this._contentTimer);
        this._contentTimer = setTimeout(() => {
          if (this.isConnected) this._rebuild();
        }, 100);
      });
    }
    connectedCallback() {
      let initial;
      if (Object.hasOwn(this, "current")) {
        initial = this.current;
        delete this.current;
      }
      this._applyText();
      this._slot.addEventListener("slotchange", this._onSlotChange);
      this._pagination.addEventListener("keydown", this._onPaginationKeydown);
      this._prevBtn.addEventListener("click", this._onPrevClick);
      this._nextBtn.addEventListener("click", this._onNextClick);
      this._prevBtn.addEventListener("keydown", this._onPrevKeydown);
      this.addEventListener("focusin", this._onFocusIn);
      this._track.addEventListener("scroll", this._onScroll, { passive: true });
      this._resizeObserver.observe(this);
      this._contentObserver.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["data-title"]
      });
      this._rebuild();
      if (initial !== void 0) this.current = initial;
      this._observeLabelRoot();
    }
    disconnectedCallback() {
      var _a;
      this._slot.removeEventListener("slotchange", this._onSlotChange);
      this._pagination.removeEventListener("keydown", this._onPaginationKeydown);
      this._prevBtn.removeEventListener("click", this._onPrevClick);
      this._nextBtn.removeEventListener("click", this._onNextClick);
      this._prevBtn.removeEventListener("keydown", this._onPrevKeydown);
      this.removeEventListener("focusin", this._onFocusIn);
      this._track.removeEventListener("scroll", this._onScroll);
      this._resizeObserver.disconnect();
      this._contentObserver.disconnect();
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      clearTimeout(this._settle);
      clearTimeout(this._contentTimer);
    }
    attributeChangedCallback(name) {
      if (!this.isConnected) return;
      this._applyText();
      this._rebuild();
      if (name === "aria-labelledby") this._observeLabelRoot();
    }
    _observeLabelRoot() {
      var _a, _b;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      if (!((_b = this.getAttribute("aria-labelledby")) == null ? void 0 : _b.trim())) return;
      this._labelObserver ?? (this._labelObserver = new MutationObserver(() => this._applyName()));
      this._labelObserver.observe(this.getRootNode(), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["id", "aria-label"] });
      this._applyName();
    }
    _applyName() {
      const root = this.getRootNode();
      const labels = (this.getAttribute("aria-labelledby") || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((el) => el && el !== this);
      const fallback = this.getAttribute("aria-label") || "Carousel";
      if ("ariaLabelledByElements" in this._wrapper) {
        this._wrapper.ariaLabelledByElements = labels;
        this._wrapper.setAttribute("aria-label", fallback);
      } else this._wrapper.setAttribute("aria-label", labels.map((el) => el.getAttribute("aria-label") || el.textContent).join(" ").trim() || fallback);
      this._wrapper.setAttribute("aria-roledescription", this.getAttribute("data-text-roledescription") || "carousel");
    }
    // ---- i18n text (aria-labels + templates) ----
    _applyText() {
      this._applyName();
      this._prevBtn.setAttribute("aria-label", this.getAttribute("data-text-prev") || "Previous slide");
      this._nextBtn.setAttribute("aria-label", this.getAttribute("data-text-next") || "Next slide");
      this._prevBtn.textContent = this.getAttribute("data-icon-prev") || "‹";
      this._nextBtn.textContent = this.getAttribute("data-icon-next") || "›";
      this._pagination.setAttribute("aria-label", this.getAttribute("data-text-pagination") || "Choose a slide");
      this._hint.textContent = this.getAttribute("data-text-instructions") || "Use the arrow keys to move between slides.";
    }
    _fill(tpl, name, i) {
      return tpl.replaceAll("{title}", name).replaceAll("{current}", String(i + 1)).replaceAll("{total}", String(this._slides.length));
    }
    // Resolve a slide's human title: explicit data-title -> its heading ->
    // positional fallback. `real` marks whether a genuine title/heading was found
    // (vs the positional fallback), so the dot label can add "{current} of
    // {total}" to real titles without doubling it onto an already-positional
    // fallback. The plain title is what the live region and slide-change event
    // use for {title}.
    _resolveName(el, i) {
      if (el.dataset && el.dataset.title) return { name: el.dataset.title, real: true };
      const h = el.querySelector && el.querySelector("h1, h2, h3, h4, h5, h6");
      if (h && h.textContent.trim()) return { name: h.textContent.trim(), real: true };
      const fallback = this.getAttribute("data-item-fallback") || "Item {current} of {total}";
      console.warn(
        `[au-carousel] slide ${i + 1} has no data-title or heading; using a positional label. Add one for a clearer screen-reader name.`
      );
      return { name: this._fill(fallback, "", i), real: false };
    }
    // ---- (re)build the dots from the slotted slides ----
    _rebuild() {
      const oldSlides = this._slides;
      const selected = oldSlides[this._current];
      const focusedDot = this._dots.indexOf(this.shadowRoot.activeElement);
      const focusedSlide = oldSlides[focusedDot];
      const oldDots = new Map(oldSlides.map((slide, i) => [slide, this._dots[i]]));
      this._slides = this._slot.assignedElements();
      const total = this._slides.length;
      const resolved = this._slides.map((el, i) => this._resolveName(el, i));
      this._names = resolved.map((r) => r.name);
      const dotTemplate = this.getAttribute("data-dot-template") || "{title}, {current} of {total}";
      this._dotLabels = resolved.map((r, i) => r.real ? this._fill(dotTemplate, r.name, i) : r.name);
      this._dots = this._dotLabels.map((label, i) => {
        const slide = this._slides[i];
        let b = oldDots.get(slide);
        if (!b) {
          b = document.createElement("button");
          b.type = "button";
          b.className = "au-carousel-dot";
          b.tabIndex = -1;
          b.addEventListener("click", () => {
            const index = this._slides.indexOf(slide);
            if (index < 0) return;
            this._setRoving(index);
            this.slideTo(index);
          });
        }
        b.setAttribute("aria-label", label);
        if (this._pagination.children[i] !== b) this._pagination.insertBefore(b, this._pagination.children[i] || null);
        return b;
      });
      for (const dot of oldDots.values()) if (!this._dots.includes(dot)) dot.remove();
      if (!total) {
        this._current = -1;
        this._live.textContent = "";
        this._apply();
        if (focusedDot >= 0) this._wrapper.focus({ preventScroll: true });
        return;
      }
      const retained = this._slides.indexOf(selected);
      this._current = retained >= 0 ? retained : this._normalizeIndex(this._current);
      this._apply();
      if (focusedDot >= 0) {
        const retainedFocus = this._slides.indexOf(focusedSlide);
        const index = retainedFocus >= 0 ? retainedFocus : this._current;
        this._setRoving(index);
        this._dots[index].focus({ preventScroll: true });
      }
      if (oldSlides.length !== total || oldSlides.some((slide, i) => slide !== this._slides[i])) this._scrollToIndex(this._current, "instant");
    }
    /**
     * Re-read the slotted slides and rebuild the dots. Call this after changing a
     * slide's data-title or heading text when an immediate refresh is needed.
     * The content observer also refreshes those edits after its debounce.
     */
    refresh() {
      this._rebuild();
    }
    // How many slides show at once (from the @container rules).
    visibleCount() {
      const raw = parseInt(getComputedStyle(this._track).getPropertyValue("--au-carousel-visible"), 10);
      return Math.max(1, raw || 1);
    }
    // The trailing spacer lets ANY slide scroll to the left edge, so prev/next and
    // the current dot can reach the very last slide.
    _maxIndex() {
      return Math.max(0, this._slides.length - 1);
    }
    // Roving tabindex: exactly ONE dot is ever a tab stop.
    _setRoving(i) {
      const idx = Math.max(0, Math.min(this._slides.length - 1, i));
      this._dots.forEach((d, j) => {
        d.tabIndex = j === idx ? 0 : -1;
      });
    }
    _firstFocusable(i) {
      const el = this._slides[i];
      if (!el) return null;
      return [el, ...el.querySelectorAll(this._FOCUSABLE)].find((node) => {
        if (node.tabIndex < 0 || node.matches(":disabled") || !node.getClientRects().length) return false;
        for (let parent = node; parent; parent = parent.assignedSlot || parent.parentNode || parent.host) {
          if (parent instanceof Element && (parent.hasAttribute("inert") || getComputedStyle(parent).visibility === "hidden")) return false;
        }
        return true;
      }) || null;
    }
    _apply() {
      this._dots.forEach((d, j) => {
        d.setAttribute("aria-current", j === this._current ? "true" : "false");
      });
      this._prevBtn.disabled = this._slides.length === 0;
      this._nextBtn.disabled = this._slides.length === 0;
      this._prevBtn.setAttribute("aria-disabled", String(this._current <= 0));
      this._nextBtn.setAttribute("aria-disabled", String(!this._slides.length || this._current >= this._maxIndex()));
      if (!this._pagination.contains(this.shadowRoot.activeElement)) {
        this._setRoving(this._current);
      }
    }
    setCurrent(i) {
      if (!this._slides.length) {
        this._current = -1;
        this._apply();
        return;
      }
      const idx = this._normalizeIndex(i);
      const changed = idx !== this._current;
      this._current = idx;
      this._apply();
      if (changed && this._slides.length) {
        if (!this._pagination.contains(this.shadowRoot.activeElement)) {
          const tpl = this.getAttribute("data-live-template") || "{title}, item {current} of {total}";
          this._live.textContent = this._fill(tpl, this._names[idx], idx);
        }
        this.dispatchEvent(
          new CustomEvent("slide-change", {
            bubbles: true,
            composed: true,
            detail: { index: idx, total: this._slides.length, title: this._names[idx] }
          })
        );
      }
    }
    slideTo(i) {
      if (!this._slides.length) return;
      const idx = this._normalizeIndex(i);
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      this._scrollToIndex(idx, behavior);
      this.setCurrent(idx);
    }
    _normalizeIndex(value) {
      const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
      return Math.max(0, Math.min(this._maxIndex(), Number.isFinite(number) ? Math.trunc(number) : 0));
    }
    _startDistance(slide) {
      const rect = this._track.getBoundingClientRect(), item = slide.getBoundingClientRect();
      return getComputedStyle(this._track).direction === "rtl" ? item.right - (rect.left + this._track.clientLeft + this._track.clientWidth) : item.left - (rect.left + this._track.clientLeft);
    }
    _scrollToIndex(index, behavior) {
      if (!this._slides[index]) return;
      this._track.scrollTo({ left: this._track.scrollLeft + this._startDistance(this._slides[index]), behavior });
    }
    // ---- event handlers ----
    _onSlotChange() {
      this._rebuild();
    }
    _onPaginationKeydown(e) {
      if (e.ctrlKey || e.altKey && e.key !== "Tab" || e.metaKey || e.isComposing) return;
      const idx = this._dots.indexOf(this.shadowRoot.activeElement);
      if (idx < 0) return;
      if (e.key === "Tab" && !e.shiftKey) {
        const target = this._firstFocusable(this._current);
        if (target) {
          e.preventDefault();
          target.focus();
        }
        return;
      }
      const last = this._slides.length - 1;
      let to = null;
      const rtl = getComputedStyle(this._track).direction === "rtl";
      if (e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowDown") to = Math.min(last, idx + 1);
      else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowUp") to = Math.max(0, idx - 1);
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = last;
      if (to === null) return;
      e.preventDefault();
      this._setRoving(to);
      this._dots[to].focus();
      this.slideTo(to);
    }
    _onPrevKeydown(e) {
      if (e.ctrlKey || e.altKey && e.key !== "Tab" || e.metaKey || e.isComposing) return;
      if (e.key !== "Tab" || !e.shiftKey) return;
      const target = this._firstFocusable(this._current);
      if (target) {
        e.preventDefault();
        target.focus();
      }
    }
    _onFocusIn(e) {
      const li = this._slides.find((s) => e.composedPath().includes(s));
      if (!li) return;
      const i = this._slides.indexOf(li);
      if (i < this._current || i >= this._current + this.visibleCount()) this.slideTo(i);
    }
    _onScroll() {
      clearTimeout(this._settle);
      this._settle = setTimeout(this._onSettled, 120);
    }
    // Current = the left-most slide in view, read from the scroll position when
    // scrolling settles (deterministic for N-per-view; no mid-scroll chatter).
    _onSettled() {
      if (this._slides.length < 1) return;
      let nearest = 0, distance = Infinity;
      this._slides.forEach((slide, i) => {
        const delta = Math.abs(this._startDistance(slide));
        if (delta < distance) {
          distance = delta;
          nearest = i;
        }
      });
      this.setCurrent(nearest);
    }
    // ---- public properties ----
    get current() {
      return this._current;
    }
    set current(val) {
      this.slideTo(val);
    }
    generateId() {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const byteArray = new Uint32Array(1);
        crypto.getRandomValues(byteArray);
        return `au-carousel-${byteArray[0].toString(36)}`;
      }
      return `au-carousel-${Math.random().toString(36).slice(2)}`;
    }
  }
  if (typeof customElements !== "undefined" && !customElements.get("au-carousel")) {
    customElements.define("au-carousel", AuCarousel);
  }
  class AuCheckbox extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open", delegatesFocus: true });
      this.internals = this.attachInternals();
      this.addEventListener("click", (event) => this._activateFromHost(event));
      const inputID = this.generateId();
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { max-width: 100%; }
      .au-checkbox {
        display: inline-block;
        vertical-align: middle;
        padding: var(--au-checkbox-padding, 0.25rem);
        box-sizing: border-box;
        max-width: 100%;
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
          box-sizing: border-box;
          margin: 0;
          flex-shrink: 0;
          width: var(--au-checkbox-input-width, 1.5rem);
          height: var(--au-checkbox-input-height, 1.5rem);
          border: var(--au-checkbox-input-border-width, 1px) var(--au-checkbox-input-border-style, solid) var(--au-checkbox-input-border-color, oklch(0.55 0 0));
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
          min-width: 0;
          overflow-wrap: anywhere;
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
          box-shadow: inset 0 0 0 var(--au-checkbox-input-focus-shadow-width, 3px) var(--au-checkbox-input-focus-shadow-color, oklch(0.45 0.15 260));
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
      @media (forced-colors: active) {
        label input[type="checkbox"] { appearance: auto; }
        label input[type="checkbox"]:checked::before { content: none; }
        label:has(input:focus-visible) { outline: 2px solid Highlight; outline-offset: 2px; }
      }
    `;
      const container = document.createElement("div");
      container.setAttribute("class", "au-checkbox");
      const label = document.createElement("label");
      label.setAttribute("for", inputID);
      const input = document.createElement("input");
      this.inputElement = input;
      input.type = "checkbox";
      input.id = inputID;
      input.name = this.getAttribute("name") || "";
      input.value = this.getAttribute("value") ?? "on";
      const textSlot = document.createElement("div");
      textSlot.setAttribute("class", "text");
      const slot = document.createElement("slot");
      this._labelSlot = slot;
      slot.addEventListener("slotchange", () => this.syncAccessibleLabel());
      this.labelFallback = document.createElement("span");
      this.labelFallback.textContent = this.getAttribute("label") || "";
      slot.appendChild(this.labelFallback);
      textSlot.appendChild(slot);
      label.append(input, textSlot);
      container.appendChild(label);
      this.shadowRoot.append(style, container);
      input.addEventListener("input", () => {
        this.checked = input.checked;
      });
      input.addEventListener("change", (event) => {
        event.stopPropagation();
        this.checked = input.checked;
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: this.checked }));
      });
    }
    _activateFromHost(event) {
      if (event.composedPath()[0] !== this) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented && this.isConnected && !this.inputElement.disabled) {
          this.inputElement.focus();
          this.inputElement.click();
        }
      });
    }
    get checked() {
      var _a;
      return ((_a = this.shadowRoot.querySelector("input")) == null ? void 0 : _a.checked) ?? false;
    }
    set checked(val) {
      this.toggleAttribute("checked", Boolean(val));
      this.inputElement.checked = Boolean(val);
      this.updateFormValue();
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
      return ["name", "value", "checked", "disabled", "required", "label", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      const input = this.shadowRoot.querySelector("input");
      if (input) {
        switch (name) {
          case "checked":
            input.checked = newValue !== null;
            break;
          case "disabled":
            input.disabled = this.disabled || Boolean(this._formDisabled);
            break;
          case "name":
            input.name = newValue ?? "";
            break;
          case "value":
            input.value = newValue ?? "on";
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
          case "aria-describedby":
            this.syncAccessibleLabel();
            break;
          case "aria-invalid":
            if (newValue === null) input.removeAttribute(name);
            else input.setAttribute(name, newValue);
            break;
        }
        this.updateFormValue();
      }
    }
    syncAccessibleLabel() {
      const input = this.inputElement;
      const root = this.getRootNode();
      const resolve = (attribute) => (this.getAttribute(attribute) || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((element) => element && element !== this);
      const explicit = this.getAttribute("aria-label");
      let labels = resolve("aria-labelledby");
      const hasSlotText = this._labelSlot.assignedNodes({ flatten: true }).some((node) => {
        var _a;
        return (_a = node.textContent) == null ? void 0 : _a.trim();
      });
      if (!labels.length && !explicit && !hasSlotText && this.isConnected) {
        labels = [...this.internals.labels];
      }
      const descriptions = resolve("aria-describedby");
      input.removeAttribute("aria-labelledby");
      input.removeAttribute("aria-describedby");
      if (explicit) input.setAttribute("aria-label", explicit);
      else input.removeAttribute("aria-label");
      if ("ariaLabelledByElements" in input) input.ariaLabelledByElements = labels;
      else if (!explicit && labels.length) {
        input.setAttribute("aria-label", labels.map((element) => element.getAttribute("aria-label") || element.textContent).join(" ").trim());
      }
      if ("ariaDescribedByElements" in input) input.ariaDescribedByElements = descriptions;
      else if (descriptions.length) {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = this.generateId();
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        this._descriptionMirror.textContent = descriptions.map((element) => element.textContent).join(" ").trim();
        input.setAttribute("aria-describedby", this._descriptionMirror.id);
      }
    }
    _observeLabels() {
      var _a;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      this._labelObserver ?? (this._labelObserver = new MutationObserver(() => this.syncAccessibleLabel()));
      this._labelObserver.observe(this.getRootNode(), {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "for", "aria-label"]
      });
      this.syncAccessibleLabel();
    }
    disconnectedCallback() {
      var _a;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
    }
    _upgradeProperties() {
      for (const name of ["checked", "disabled", "required", "name", "value"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
    }
    get name() {
      return this.getAttribute("name") || "";
    }
    set name(value) {
      this.setAttribute("name", value);
    }
    get value() {
      return this.getAttribute("value") ?? "on";
    }
    set value(value) {
      this.setAttribute("value", value);
    }
    get required() {
      return this.hasAttribute("required");
    }
    set required(value) {
      this.toggleAttribute("required", Boolean(value));
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
    focus(options) {
      this.inputElement.focus(options);
    }
    formStateRestoreCallback(state) {
      if (state === "checked" || state === "unchecked") this.checked = state === "checked";
    }
    connectedCallback() {
      this._upgradeProperties();
      if (!this._initialCheckedSet) {
        this._initialChecked = this.checked;
        this._initialCheckedSet = true;
      }
      this.inputElement.disabled = this.disabled || Boolean(this._formDisabled);
      this.updateFormValue();
      this._observeLabels();
    }
    updateCheckedState() {
      this.checked = this.hasAttribute("checked");
    }
    updateFormValue() {
      const input = this.shadowRoot.querySelector("input");
      const value = input.checked ? this.value : null;
      this.internals.setFormValue(value, input.checked ? "checked" : "unchecked");
      if (!input.willValidate || input.validity.valid) {
        this.internals.setValidity({});
      } else {
        this.internals.setValidity(input.validity, input.validationMessage, input);
      }
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      const input = this.shadowRoot.querySelector("input");
      if (input) {
        input.disabled = this.disabled || disabled;
        this.updateFormValue();
      }
    }
    formResetCallback() {
      this.checked = this._initialChecked;
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
      this._returnFocusOnClose = true;
      const template = document.createElement("template");
      template.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: inline-block;
          max-inline-size: 100%;
          min-inline-size: 0;
        }
        :is(button) {
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
          text-align: start;
          padding: var(--au-btn-padding-vertical, 0.625rem) var(--au-btn-padding-horizontal, 1rem);

          /* text */
          color: var(--au-btn-text-color, oklch(0.1398 0 0));
          font-size: var(--au-btn-text-size, 1rem);
          font-family: var(--au-btn-text-family);
          line-height: var(--au-btn-text-line-height, 1.5);

          /* border */
          border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.55 0 0));
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
            border-color: var(--au-btn-hover-border-color, oklch(0.55 0 0));
          }

          &:active {
            background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
            border-color: var(--au-btn-active-border-color, oklch(0.55 0 0));
          }

          &:focus-visible {
            outline: var(--au-btn-focus-shadow-width, 3px) solid var(--au-btn-focus-shadow-color, oklch(0.4 0 0));
            outline-offset: 2px;
          }

          .icon {
            display: inline-block;
            line-height: 1;
            margin-inline-start: auto;
          }

          .icon::before {
            content: var(--au-dropdown-arrow-down-icon, var(--au-control-arrow-down-icon, '▼'));
          }

          &[aria-expanded="true"] .icon::before {
            content: var(--au-dropdown-arrow-up-icon, var(--au-control-arrow-up-icon, '▲'));
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
          z-index: 1000;
          box-sizing: border-box;
          overflow: auto;
          background: var(--au-dropdown-menu-bg, oklch(1 0 0));
          border: var(--au-dropdown-menu-border-width, 1px) var(--au-dropdown-menu-border-style, solid) var(--au-dropdown-menu-border-color, oklch(0.55 0 0));
          border-radius: var(--au-dropdown-menu-border-radius, 0);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 0.5rem 0;
          margin: 0;
        }

        .dropdown-menu:popover-open {
          display: block;
        }
        .dropdown-menu[data-inline] { position: static; max-inline-size: 100%; margin-block-start: 4px; }
        .dropdown-menu[hidden] { display: none; }

        ::slotted(au-dropdown-item) {
          display: block;
        }
        @media (forced-colors: active) {
          button:focus-visible { outline: 2px solid Highlight; }
        }
        @media (prefers-reduced-motion: reduce) {
          button { transition: none; }
        }
      </style>
      <button 
        type="button" 
        role="button"
        id="${this.triggerId}" 
        popovertarget="${this.menuId}"
        aria-haspopup="menu" 
        aria-expanded="false"
      >
        <slot name="trigger"><span class="trigger-fallback"></span></slot>
        <span class="icon" aria-hidden="true"></span>
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
      this._handleFallbackClick = () => {
        if (!this._nativePopover) this.isOpen ? this.close() : this.open();
      };
      this._dismissFallback = (event) => {
        if (!this._nativePopover && this.isOpen && !event.composedPath().includes(this)) this.closeWithoutReturningFocus();
      };
      this._positionMenu = this._positionMenu.bind(this);
    }
    connectedCallback() {
      this._nativePopover = typeof this.menu.showPopover === "function" && typeof this.menu.hidePopover === "function";
      this.menu.toggleAttribute("data-inline", !this._nativePopover);
      this.menu.hidden = !this._nativePopover;
      if (this._nativePopover) {
        this.menu.setAttribute("popover", "auto");
        this.trigger.setAttribute("popovertarget", this.menuId);
      } else {
        this.menu.removeAttribute("popover");
        this.trigger.removeAttribute("popovertarget");
      }
      this.updateTriggerFallback();
      this.trigger.setAttribute("aria-expanded", String(this.isOpen));
      this.trigger.addEventListener("keydown", this.handleKeyDown);
      this.menu.addEventListener("keydown", this.handleMenuKeyDown);
      this.menu.addEventListener("toggle", this.handleToggle);
      this.trigger.addEventListener("click", this._handleFallbackClick);
      this.ownerDocument.addEventListener("pointerdown", this._dismissFallback);
      this.ownerDocument.addEventListener("focusin", this._dismissFallback);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "data-text-trigger" && oldValue !== newValue) {
        this.updateTriggerFallback();
      }
    }
    disconnectedCallback() {
      var _a;
      clearTimeout(this._tabCloseTimer);
      (_a = this._restoreTabStops) == null ? void 0 : _a.call(this);
      this._stopPositionTracking();
      if (!this._nativePopover) this.menu.hidden = true;
      this._returnFocusOnClose = true;
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.removeEventListener("keydown", this.handleKeyDown);
      this.menu.removeEventListener("keydown", this.handleMenuKeyDown);
      this.menu.removeEventListener("toggle", this.handleToggle);
      this.trigger.removeEventListener("click", this._handleFallbackClick);
      this.ownerDocument.removeEventListener("pointerdown", this._dismissFallback);
      this.ownerDocument.removeEventListener("focusin", this._dismissFallback);
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
    open(index = 0) {
      if (!this.isConnected) return;
      this._returnFocusOnClose = true;
      if (!this.isOpen) {
        if (this._nativePopover) this.menu.showPopover();
        else this.menu.hidden = false;
      }
      this.trigger.setAttribute("aria-expanded", "true");
      this._startPositionTracking();
      this.focusItem(index);
    }
    close() {
      if (!this.isOpen) return;
      const active = this.getRootNode().activeElement;
      const restore = this._returnFocusOnClose && (active === this || this.contains(active));
      if (this._nativePopover) this.menu.hidePopover();
      else this.menu.hidden = true;
      this._stopPositionTracking();
      this.trigger.setAttribute("aria-expanded", "false");
      if (restore && this.isConnected) this.trigger.focus();
      if (!this._nativePopover) this._returnFocusOnClose = true;
    }
    closeWithoutReturningFocus() {
      this._returnFocusOnClose = false;
      this.close();
    }
    _leaveInlineMenuWithTab() {
      var _a;
      (_a = this._restoreTabStops) == null ? void 0 : _a.call(this);
      const saved = [...this.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter((el) => el.closest("au-dropdown") === this && !el.closest('[slot="trigger"]')).map((el) => [el, el.getAttribute("tabindex")]);
      for (const [el] of saved) el.setAttribute("tabindex", "-1");
      this._restoreTabStops = () => {
        for (const [el, value] of saved) {
          if (el.getAttribute("tabindex") !== "-1") continue;
          if (value === null) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", value);
        }
        this._restoreTabStops = null;
      };
      clearTimeout(this._tabCloseTimer);
      this._tabCloseTimer = setTimeout(() => {
        var _a2;
        (_a2 = this._restoreTabStops) == null ? void 0 : _a2.call(this);
        this.closeWithoutReturningFocus();
      }, 0);
    }
    handleToggle() {
      if (!this.isConnected) return;
      const isOpen = this.isOpen;
      this.trigger.setAttribute("aria-expanded", isOpen);
      if (isOpen) this._startPositionTracking();
      else this._stopPositionTracking();
      if (!isOpen) {
        const active = this.getRootNode().activeElement;
        if (this._returnFocusOnClose && (active === this || this.contains(active))) {
          this.trigger.focus();
        }
        this._returnFocusOnClose = true;
      }
    }
    get isOpen() {
      return this._nativePopover ? this.menu.matches(":popover-open") : !this.menu.hidden;
    }
    set isOpen(val) {
      if (val) {
        if (this.isConnected) {
          if (this._nativePopover) this.menu.showPopover();
          else this.menu.hidden = false;
          this.trigger.setAttribute("aria-expanded", "true");
          this._startPositionTracking();
        }
      } else {
        this.close();
      }
    }
    _startPositionTracking() {
      var _a, _b;
      if (!this._nativePopover) return;
      this._positionMenu();
      if (this._trackingPosition) return;
      this._trackingPosition = true;
      const view = this.ownerDocument.defaultView;
      view.addEventListener("resize", this._positionMenu);
      view.addEventListener("scroll", this._positionMenu, true);
      (_a = view.visualViewport) == null ? void 0 : _a.addEventListener("resize", this._positionMenu);
      (_b = view.visualViewport) == null ? void 0 : _b.addEventListener("scroll", this._positionMenu);
      if (typeof ResizeObserver !== "undefined") {
        this._sizeObserver ?? (this._sizeObserver = new ResizeObserver(this._positionMenu));
        this._sizeObserver.observe(this.trigger);
        this._sizeObserver.observe(this.menu);
      }
    }
    _stopPositionTracking() {
      var _a, _b, _c;
      this._trackingPosition = false;
      (_a = this._sizeObserver) == null ? void 0 : _a.disconnect();
      const view = this.ownerDocument.defaultView;
      view.removeEventListener("resize", this._positionMenu);
      view.removeEventListener("scroll", this._positionMenu, true);
      (_b = view.visualViewport) == null ? void 0 : _b.removeEventListener("resize", this._positionMenu);
      (_c = view.visualViewport) == null ? void 0 : _c.removeEventListener("scroll", this._positionMenu);
    }
    _positionMenu() {
      if (!this.isConnected || !this._nativePopover || !this.isOpen) return;
      const view = this.ownerDocument.defaultView, viewport = view.visualViewport;
      const left = ((viewport == null ? void 0 : viewport.offsetLeft) || 0) + 8, top = ((viewport == null ? void 0 : viewport.offsetTop) || 0) + 8;
      const right = left + ((viewport == null ? void 0 : viewport.width) || view.innerWidth) - 16;
      const bottom = top + ((viewport == null ? void 0 : viewport.height) || view.innerHeight) - 16;
      const anchor = this.trigger.getBoundingClientRect();
      const width = Math.max(0, right - left);
      this.menu.style.maxWidth = width + "px";
      this.menu.style.minWidth = Math.min(anchor.width, width) + "px";
      const below = Math.max(0, bottom - anchor.bottom - 4);
      const above = Math.max(0, anchor.top - top - 4);
      const placeAbove = this.menu.scrollHeight > below && above > below;
      this.menu.style.maxHeight = (placeAbove ? above : below) + "px";
      const box = this.menu.getBoundingClientRect();
      const start = getComputedStyle(this).direction === "rtl" ? anchor.right - box.width : anchor.left;
      this.menu.style.left = Math.max(left, Math.min(start, right - box.width)) + "px";
      this.menu.style.top = Math.max(top, Math.min(placeAbove ? anchor.top - box.height - 4 : anchor.bottom + 4, bottom - box.height)) + "px";
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
      return Array.from(this.querySelectorAll("au-dropdown-item")).filter((item) => item.closest("au-dropdown") === this);
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
      const currentItem = e.composedPath().find((node) => node instanceof HTMLElement && node.localName === "au-dropdown-item");
      if (currentItem && !items.includes(currentItem)) return;
      const currentIndex = items.indexOf(currentItem);
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
          if (this._nativePopover) this.closeWithoutReturningFocus();
          else this._leaveInlineMenuWithTab();
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
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: block;
          outline: none;
        }
        
        .item {
          padding: var(--au-dropdown-item-padding, 0.5rem 1rem);
          cursor: pointer;
          color: var(--au-dropdown-item-color, oklch(0.2 0 0));
          font-family: inherit;
          white-space: normal;
          overflow-wrap: anywhere;
          transition: background 150ms ease;
        }

        .item:focus,
        .item:hover {
          outline: none;
          background: var(--au-dropdown-item-hover-bg, oklch(0.95 0 0));
          color: var(--au-dropdown-item-hover-color, oklch(0.1 0 0));
          box-shadow: inset 0 0 0 var(--au-dropdown-focus-shadow-width, 3px) var(--au-dropdown-focus-shadow-color, oklch(0.4 0 0));
        }

        :host(:focus) {
          outline: none;
        }
        @media (forced-colors: active) {
          .item:focus { outline: 2px solid Highlight; outline-offset: -2px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .item { transition: none; }
        }
      </style>
      <div class="item" role="menuitem" tabindex="-1">
        <slot></slot>
      </div>
    `;
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.item = this.shadowRoot.querySelector(".item");
      this.handleClick = this.handleClick.bind(this);
      this.handleItemKeyDown = this.handleItemKeyDown.bind(this);
    }
    connectedCallback() {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("role", "none");
      this.addEventListener("click", this.handleClick);
      this.item.addEventListener("keydown", this.handleItemKeyDown);
    }
    disconnectedCallback() {
      this.removeEventListener("click", this.handleClick);
      this.item.removeEventListener("keydown", this.handleItemKeyDown);
    }
    handleClick() {
      this.dispatchEvent(new CustomEvent("selected", {
        bubbles: true,
        composed: true,
        detail: { value: this.getAttribute("value") }
      }));
      const dropdown = this.closest("au-dropdown");
      if (dropdown) dropdown.close();
    }
    handleItemKeyDown(e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        const link = this.querySelector("a");
        if (link) {
          link.click();
        } else {
          this.click();
        }
      }
    }
    focus(options) {
      this.item.focus(options);
    }
  }
  if (typeof customElements !== "undefined") {
    if (!customElements.get("au-dropdown")) customElements.define("au-dropdown", AuDropdown);
    if (!customElements.get("au-dropdown-item")) customElements.define("au-dropdown-item", AuDropdownItem);
  }
  class AuFileUpload extends HTMLElement {
    static get observedAttributes() {
      return [
        "accept",
        "aria-describedby",
        "aria-invalid",
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
        "required",
        "max-total-size-mb"
      ];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.internals = this.attachInternals();
      this.files = [];
      this.previewUrls = /* @__PURE__ */ new Map();
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-inline-size: 0; }

      * { box-sizing: border-box; }
      .file-upload-wrapper, .file-upload-container, .actions { min-inline-size: 0; overflow-wrap: anywhere; }
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
        padding: clamp(0.75rem, 4vw, 2rem);
        gap: 0.75rem;
        min-inline-size: 0;
        border: var(--au-file-upload-area-border-width, 1px) var(--au-file-upload-area-border-style, dashed) var(--au-file-upload-area-border-color, oklch(0.55 0 0));
        border-radius: var(--au-file-upload-area-border-radius, 0.25rem);
        transition: box-shadow 120ms ease-in;
        ::slotted([slot="trigger"]) {
          position: relative;
          z-index: 2;
        }
        .drop-zone {
          text-align: center;
        }
        &:hover {
          box-shadow: var(--box-shadow, 0 0.75rem 1.125rem oklch(from oklch(0.1398 0 0) l c h / 0.15));
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
            min-width: 0;
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
            border: var(--au-file-upload-file-list-preview-border-width, 1px) var(--au-file-upload-file-list-preview-border-style, solid) var(--au-file-upload-file-list-preview-border-color, oklch(0.55 0 0));
          }
          .file-name  {
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: var(--au-file-upload-file-list-neme-ellipsis-line, 2);
            overflow: hidden;
            -webkit-box-orient: vertical;
          }
          .delete {
            min-inline-size: 24px;
            min-block-size: 24px;
            max-inline-size: 100%;
            flex-shrink: 0;
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
            border: var(--au-file-upload-delete-border-width, 1px) var(--au-file-upload-delete-border-style, solid) var(--au-file-upload-delete-border-color, oklch(0.55 0 0));
            border-radius: var(--au-file-upload-delete-border-radius, 0.25rem);

            /* others decoration */
            background-color: var(--au-file-upload-delete-bg, oklch(0.994 0 0));
            transition: background-color 160ms ease-in;

            &:hover {
              background-color: var(--au-file-upload-delete-hover-bg, oklch(0.9466 0 0));
              border-color: var(--au-file-upload-delete-hover-border-color, oklch(0.55 0 0));
            }

            &:active {
              background-color: var(--au-file-upload-delete-active-bg, oklch(0.8689 0 0));
              border-color: var(--au-file-upload-delete-active-border-color, oklch(0.55 0 0));
            }

            &:focus-visible {
              outline: max(2px, var(--au-file-upload-delete-focus-shadow-width, 3px)) solid var(--au-file-upload-delete-focus-shadow-color, oklch(0.45 0.15 260));
              outline-offset: 2px;
            }
          }
        }
        &+[aria-live] {
          position: absolute;
          inline-size: 1px; block-size: 1px; padding: 0;
          overflow: hidden; clip-path: inset(50%); white-space: nowrap;
        }
      }
      .trigger-area { min-inline-size: 0; }
      /* Highlight is a forced-colors system colour; in normal mode its value is
         browser-chosen (Chrome: translucent light blue, 1.5:1 on white). */
      .trigger-area:focus-visible, .default-trigger:focus-visible {
        outline: max(2px, var(--au-file-upload-trigger-focus-outline-width, 2px)) solid var(--au-file-upload-trigger-focus-outline-color, oklch(0.45 0.15 260));
        outline-offset: 2px;
      }
      .default-trigger { font: inherit; min-block-size: 24px; min-inline-size: 24px; padding: 0.625rem; max-inline-size: 100%; overflow-wrap: anywhere; }
      .file-upload-container[aria-disabled="true"] { opacity: 0.65; }
      @media (max-width: 360px) { .file-list [role=listitem] { flex-wrap: wrap; } }
      @media (prefers-reduced-motion: reduce) { .upload-area, .file-list [role=listitem] .delete { transition: none; } }
      @media (forced-colors: active) {
        .file-list [role=listitem] .delete:focus-visible,
        .trigger-area:focus-visible, .default-trigger:focus-visible { outline: 2px solid Highlight; }
      }
    `;
      this.wrapper = document.createElement("div");
      this.wrapper.className = "file-upload-wrapper";
      this.container = document.createElement("div");
      this.container.className = "file-upload-container";
      this.container.setAttribute("role", "group");
      this.container.setAttribute("aria-labelledby", "upload-label");
      this.container.setAttribute("aria-describedby", "upload-errors upload-drop");
      this._id = this.getAttribute("id") || this.generateId();
      this.labelEl = document.createElement("label");
      this.labelEl.id = "upload-label";
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
      this.defaultTrigger = document.createElement("button");
      this.defaultTrigger.type = "button";
      this.defaultTrigger.className = "default-trigger";
      this.defaultTrigger.textContent = this.labelEl.textContent;
      triggerSlot.append(this.defaultTrigger);
      triggerSlot.addEventListener("click", () => {
        if (this.effectiveDisabled) return;
        this.fileInput.click();
      });
      triggerSlot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          const nativeButton = e.composedPath().some((node) => node instanceof Element && node.matches("button"));
          if (nativeButton || !e.composedPath().some((node) => node instanceof Element && node.matches("input, a[href]"))) {
            e.preventDefault();
          } else {
            return;
          }
          if (this.effectiveDisabled) return;
          this.fileInput.click();
        }
      });
      this.dropZone = document.createElement("div");
      this.dropZone.className = "drop-zone";
      this.dropZone.id = "upload-drop";
      this.dropZone.textContent = this.getAttribute("msg-drop-text") || "Drop files here";
      this.usageDisplay = document.createElement("div");
      this.usageDisplay.className = "usage";
      this.fileList = document.createElement("ul");
      this.fileList.className = "file-list";
      this.fileList.setAttribute("role", "list");
      const hintSlot = document.createElement("slot");
      hintSlot.name = "hint";
      this.errorMessage = document.createElement("div");
      this.errorMessage.className = "error-area";
      this.errorMessage.id = "upload-errors";
      this.errorList = document.createElement("ul");
      this.errorList.className = "error-list";
      this.errorMessage.append(hintSlot, this.usageDisplay, this.errorList);
      this.liveRegion = document.createElement("div");
      this.liveRegion.setAttribute("aria-live", "polite");
      this.liveRegion.setAttribute("role", "status");
      this.liveRegion.setAttribute("aria-atomic", "true");
      this.fileInput.addEventListener("change", (e) => {
        e.stopPropagation();
        try {
          this.handleFiles(this.fileInput.files);
        } finally {
          this.fileInput.value = "";
        }
      });
      this.addEventListener("invalid", () => {
        this.showErrors([this.internals.validationMessage]);
      });
      this.container.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (this.effectiveDisabled) return;
        this.dropZone.classList.add("dragover");
      });
      this.container.addEventListener("dragleave", () => {
        this.dropZone.classList.remove("dragover");
      });
      this.container.addEventListener("drop", (e) => {
        e.preventDefault();
        if (this.effectiveDisabled) return;
        this.dropZone.classList.remove("dragover");
        const dt = e.dataTransfer;
        if (dt == null ? void 0 : dt.files) this.handleFiles(dt.files);
      });
      const actionGroup = document.createElement("div");
      actionGroup.className = "actions";
      const fileArea = document.createElement("div");
      fileArea.className = "upload-area";
      this.triggerArea = document.createElement("div");
      this.triggerArea.className = "trigger-area";
      this.triggerArea.tabIndex = -1;
      this.triggerArea.setAttribute("role", "group");
      this.triggerArea.setAttribute("aria-labelledby", "upload-label");
      this.triggerArea.setAttribute("aria-describedby", "upload-errors");
      this.triggerArea.append(triggerSlot);
      fileArea.append(this.triggerArea, this.dropZone);
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
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (!this.shadowRoot) return;
      switch (name) {
        case "aria-describedby":
          if (this.isConnected) this._observeDescriptions();
          break;
        case "aria-invalid":
          this.updateValidity();
          break;
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
          this.updateValidity();
          break;
        case "disabled":
          this.syncDisabled();
          break;
        case "multiple":
          this.syncBooleanAttributeToInput("multiple");
          break;
        case "required":
          this.syncBooleanAttributeToInput("required");
          this.updateValidity();
          break;
        case "accept":
        case "form":
        case "name":
          this.syncAttributeToInput(name);
          if (name === "name") this.syncFormValue();
          break;
        case "max-total-size-mb":
          this.updateUsage();
          break;
      }
    }
    connectedCallback() {
      if (Object.hasOwn(this, "value")) {
        const value = this.value;
        delete this.value;
        this.value = value;
      }
      this.updateLabelText();
      this.updateDropText();
      this.updateFileList();
      this.syncFormValue();
      this.updateUsage();
      this.updateValidity();
      this.syncDisabled();
      this._observeDescriptions();
    }
    disconnectedCallback() {
      var _a;
      (_a = this._descriptionObserver) == null ? void 0 : _a.disconnect();
      cancelAnimationFrame(this._announcementFrame);
      this.liveRegion.textContent = "";
      this.revokeAllPreviewUrls();
    }
    get effectiveDisabled() {
      return this.hasAttribute("disabled") || !!this._formDisabled;
    }
    _observeDescriptions() {
      var _a;
      (_a = this._descriptionObserver) == null ? void 0 : _a.disconnect();
      if (this.hasAttribute("aria-describedby")) {
        this._descriptionObserver ?? (this._descriptionObserver = new MutationObserver(() => this._syncDescriptions()));
        this._descriptionObserver.observe(this.getRootNode(), {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["id"]
        });
      }
      this._syncDescriptions();
    }
    _syncDescriptions() {
      const root = this.getRootNode();
      const external = [...new Set((this.getAttribute("aria-describedby") || "").trim().split(/\s+/))].filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((el) => el && el !== this);
      for (const target of [this.container, this.triggerArea, this.defaultTrigger]) {
        if (typeof target.ariaDescribedByElements !== "undefined") {
          target.ariaDescribedByElements = [this.errorMessage, this.dropZone, ...external];
        } else {
          if (!this._descriptionMirror) {
            this._descriptionMirror = document.createElement("span");
            this._descriptionMirror.id = "external-description";
            this._descriptionMirror.hidden = true;
            this.shadowRoot.append(this._descriptionMirror);
          }
          const text = external.map((el) => el.textContent).join(" ").trim();
          if (this._descriptionMirror.textContent !== text) this._descriptionMirror.textContent = text;
          target.setAttribute("aria-describedby", "upload-errors upload-drop" + (text ? " external-description" : ""));
        }
      }
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      this.syncDisabled();
    }
    syncDisabled() {
      if (!this.triggerArea) return;
      const disabled = this.effectiveDisabled;
      this.fileInput.disabled = disabled;
      this.defaultTrigger.disabled = disabled;
      this.triggerArea.inert = disabled;
      this.container.setAttribute("aria-disabled", String(disabled));
      this.fileList.querySelectorAll("button").forEach((button) => {
        button.disabled = disabled;
      });
      if (disabled) this.dropZone.classList.remove("dragover");
    }
    updateLabelText() {
      if (this.labelEl) this.labelEl.textContent = this.getAttribute("label") || "Upload files";
      if (this.defaultTrigger) this.defaultTrigger.textContent = this.labelEl.textContent;
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
      if (this.effectiveDisabled) return;
      const maxTotalSizeMB = this.limit("max-total-size-mb", 20);
      const maxFiles = Math.min(Math.floor(this.limit("max-files", 5)), this.hasAttribute("multiple") ? Infinity : 1);
      const maxSizeMB = this.limit("max-size-mb", 5);
      const acceptAttr = this.getAttribute("accept");
      const acceptList = acceptAttr ? acceptAttr.toLowerCase().split(",").map((type) => type.trim()).filter(Boolean) : [];
      const newFiles = Array.from(fileList || []).filter((file) => file instanceof File);
      const validFiles = [];
      const errorMessages = [];
      newFiles.forEach((file) => {
        const isValidType = acceptList.length === 0 || acceptList.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.toLowerCase().startsWith(type.slice(0, -1));
          }
          return type.startsWith(".") ? file.name.toLowerCase().endsWith(type) : file.type.toLowerCase() === type;
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
      const uniqueFiles = [];
      validFiles.forEach((file) => {
        if (![...this.files, ...uniqueFiles].some((f) => f.name === file.name && f.size === file.size)) uniqueFiles.push(file);
      });
      const slotsLeft = Math.max(0, maxFiles - this.files.length);
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
      this.showErrors(errorMessages);
      if (filesToAdd.length === 0) return;
      this.files.push(...filesToAdd);
      this.updateFileList();
      this.updateUsage();
      this.announce([this.formatMessage("msg-added", "{count} file(s) added.", { count: filesToAdd.length }), ...errorMessages].join(" "));
      this.syncFormValue();
      this.updateValidity();
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
      cancelAnimationFrame(this._announcementFrame);
      while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
      if (!this.isConnected || !message) return;
      this._announcementFrame = requestAnimationFrame(() => {
        const span = document.createElement("span");
        span.textContent = message;
        this.liveRegion.appendChild(span);
      });
    }
    createFileRow(file) {
      const row = document.createElement("li");
      row.setAttribute("role", "listitem");
      const preview = document.createElement("div");
      const image = file.type.startsWith("image/");
      const icon = document.createElement(image ? "img" : "span");
      icon.className = "preview";
      if (image) {
        icon.alt = "";
        icon.width = 40;
        icon.height = 40;
      } else {
        icon.textContent = "📄";
        icon.setAttribute("aria-hidden", "true");
      }
      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = file.name;
      preview.append(icon, name);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "delete";
      button._file = file;
      button.setAttribute("part", "delete");
      button.addEventListener("click", () => this.removeFile(file));
      row.append(preview, button);
      return row;
    }
    updateFileList() {
      const previousButtons = [...this.fileList.querySelectorAll("button.delete")];
      const focused = this.shadowRoot.activeElement;
      const focusedIndex = previousButtons.indexOf(focused);
      const focusedFile = focused == null ? void 0 : focused._file;
      this._fileRows ?? (this._fileRows = /* @__PURE__ */ new Map());
      for (const [file, row] of this._fileRows) {
        if (!this.files.includes(file)) {
          row.remove();
          this._fileRows.delete(file);
          this.revokePreviewUrl(file);
        }
      }
      this.files.forEach((file, index) => {
        var _a;
        let li = this._fileRows.get(file);
        if (!li) {
          li = this.createFileRow(file);
          this._fileRows.set(file, li);
        }
        const removeBtn = li.querySelector("button.delete");
        const visibleLabel = ((_a = this.getAttribute("msg-remove-text")) == null ? void 0 : _a.trim()) || "Remove";
        const requestedName = this.formatMessage("msg-remove-file-label", "{action} {fileName}", { action: visibleLabel, fileName: file.name });
        removeBtn.textContent = visibleLabel;
        removeBtn.setAttribute("aria-label", requestedName.includes(visibleLabel) ? requestedName : `${visibleLabel} ${requestedName}`);
        removeBtn.disabled = this.effectiveDisabled;
        const img = li.querySelector("img");
        if (img) {
          if (!this.previewUrls.has(file)) this.previewUrls.set(file, URL.createObjectURL(file));
          if (img.src !== this.previewUrls.get(file)) img.src = this.previewUrls.get(file);
        }
        if (this.fileList.children[index] !== li) this.fileList.insertBefore(li, this.fileList.children[index] || null);
      });
      if (focusedIndex >= 0) {
        const buttons = [...this.fileList.querySelectorAll("button.delete")];
        const next = buttons.find((button) => button._file === focusedFile) || buttons[Math.min(focusedIndex, buttons.length - 1)];
        if (next) next.focus();
        else this.focusTrigger();
      }
    }
    removeFile(file) {
      if (this.effectiveDisabled) return;
      const index = this.files.findIndex((f) => f === file || f.name === (file == null ? void 0 : file.name) && f.size === (file == null ? void 0 : file.size));
      if (index < 0) return;
      const removed = this.files[index];
      this.revokePreviewUrl(removed);
      this.files = this.files.filter((_, i) => i !== index);
      this.updateFileList();
      this.updateUsage();
      this.announce(this.formatMessage("msg-removed", "{fileName} removed.", { fileName: removed.name }));
      this.syncFormValue();
      this.updateValidity();
      this.dispatchEvent(new CustomEvent("remove-file", { bubbles: true, composed: true, detail: removed }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    updateUsage() {
      const maxMB = this.limit("max-total-size-mb", 20);
      const totalMB = this.files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
      this.usageDisplay.textContent = `${totalMB.toFixed(1)}MB / ${maxMB}MB`;
    }
    syncFormValue() {
      const name = this.getAttribute("name");
      if (!name || this.files.length === 0) {
        this.internals.setFormValue(null);
        return;
      }
      const data = new FormData();
      this.files.forEach((file) => data.append(name, file, file.name));
      this.internals.setFormValue(data);
    }
    limit(name, fallback) {
      const raw = this.getAttribute(name);
      const value = (raw == null ? void 0 : raw.trim()) ? Number(raw) : NaN;
      return Number.isFinite(value) && value >= 0 ? value : fallback;
    }
    focus(options) {
      if (!this.effectiveDisabled) this.focusTrigger(options);
    }
    focusTrigger(options) {
      const slot = this.shadowRoot.querySelector("slot[name=trigger]");
      const roots = slot.assignedElements({ flatten: true });
      const candidates = roots.flatMap((root) => [root, ...root.querySelectorAll("button,input,[tabindex]")]);
      const trigger = candidates.find((el) => el.matches("button,input,[tabindex]") && !el.matches(":disabled") && el.tabIndex >= 0 && !el.closest("[hidden],[inert]") && el.getClientRects().length && getComputedStyle(el).visibility === "visible");
      (trigger || this.triggerArea).focus(options);
    }
    updateValidity() {
      const missing = this.hasAttribute("required") && this.files.length === 0;
      const invalid = missing ? "true" : this.getAttribute("aria-invalid") || "false";
      for (const target of [this.container, this.triggerArea, this.defaultTrigger]) target.setAttribute("aria-invalid", invalid);
      if (missing) {
        this.internals.setValidity(
          { valueMissing: true },
          this.getText("msg-required", "Please select at least one file."),
          this.triggerArea
        );
        return false;
      }
      this.internals.setValidity({});
      return true;
    }
    checkValidity() {
      this.updateValidity();
      return this.internals.checkValidity();
    }
    reportValidity() {
      this.updateValidity();
      return this.internals.reportValidity();
    }
    formResetCallback() {
      this.revokeAllPreviewUrls();
      this.files = [];
      this.fileInput.value = "";
      this.showErrors([]);
      this.updateFileList();
      this.updateUsage();
      this.syncFormValue();
      this.updateValidity();
    }
    get value() {
      return [...this.files];
    }
    set value(val) {
      if (Array.isArray(val)) {
        this.files = [...new Set(val.filter((file) => file instanceof File))];
        this.fileInput.value = "";
        this.showErrors([]);
        this.updateFileList();
        this.updateUsage();
        this.syncFormValue();
        this.updateValidity();
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
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
    :host {
      display: block;
      container-type: inline-size;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: var(--au-input-wrapper-bg, transparent);
      container-type: inline-size;
      min-width: 0;

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
      label[hidden] { display: none; }

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
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.45 0.15 260));
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
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        border: var(--au-input-border-width, 1px) var(--au-input-border-style, solid) var(--au-input-border-color, oklch(0.55 0 0));
        border-radius: var(--au-input-border-radius, 0.25rem);
        padding: var(--au-input-container-padding-vertical, 0.25rem) var(--au-input-container-padding-horizontal, 0.25rem);
        gap: var(--au-input-container-gap, 0.625rem);
        /* prefix/affix 不可被壓縮;窄容器時優先維持同一行,由 input 彈性縮小。
           只有在放不下「可用寬度的輸入框」時才換行,避免 input 被擠到幾乎為零、
           內容溢出元件(WCAG 1.4.10)。 */
        .prefix, .affix {
          flex-shrink: 0;
          max-inline-size: 100%;
        }
        @container (width < 768px) {
          flex-wrap: wrap;
          input {
            flex: 1 1 8rem;
            min-width: 0;
          }
          /* A colour swatch keeps its own width; stretching it would push the
             colour code onto a second line. */
          input[type="color"] {
            flex: 0 0 auto;
            inline-size: 3.125rem;
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
        flex-shrink: 0;
        
        /* border */
        border: 0;
        border-radius: var(--au-input-clear-border-radius, 0.25rem);

        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-input-focus-shadow-width, 3px) var(--au-input-focus-shadow-color, oklch(0.45 0.15 260));
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
    @media (forced-colors: active) {
      input:focus-visible, .clear-input:focus-visible { outline: 2px solid Highlight; outline-offset: -2px; }
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
      this.input.addEventListener("input", (event) => {
        this.value = this.input.value;
        if (!event.composed) {
          const forwarded = event instanceof InputEvent ? new InputEvent("input", { bubbles: true, composed: true, data: event.data, inputType: event.inputType, isComposing: event.isComposing }) : new Event("input", { bubbles: true, composed: true });
          this.dispatchEvent(forwarded);
        }
      });
      this.input.addEventListener("change", (event) => {
        this.value = this.input.value;
        if (!event.composed) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
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
        "id",
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "aria-invalid",
        "data-size",
        "data-layout",
        "data-clear",
        "data-clear-label"
      ];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
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
      } else if (name === "id") {
        this._id = newValue || this.generateId();
        this.input.id = this._id;
        this.labelEl.htmlFor = this._id;
      } else if (["aria-label", "aria-labelledby", "aria-describedby"].includes(name)) {
        this._syncAccessibleReferences();
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
        if (name === "value") this.input.value = newValue ?? "";
        this.internals.setFormValue(this.input.value);
        this._syncValidity();
        this._updateColorCode();
      }
      this._syncControlState();
      this._syncAccessibleReferences();
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
      for (const name of ["value", "disabled", "required", "readonly"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
      if (!this._initialValueSet) {
        this._initialValue = this.input.value;
        this._initialValueSet = true;
      }
      this.internals.setFormValue(this.input.value);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
      this._syncControlState();
      this._observeExternalReferences();
      if (this.hasAttribute("list")) {
        requestAnimationFrame(() => {
          if (this.isConnected) this._handleListAttribute(this.getAttribute("list"));
        });
      }
    }
    formResetCallback() {
      const currentValue = this._initialValue || "";
      const wasFocused = this.shadowRoot.activeElement === this.input;
      const newInput = this.input.cloneNode(false);
      newInput.value = currentValue;
      this.inputContainer.replaceChild(newInput, this.input);
      this.input = newInput;
      this._bindInputEvents();
      this.internals.setFormValue(this.input.value);
      this._syncValidity();
      this._updateClearButton();
      this._updateColorCode();
      this._syncControlState();
      this._syncAccessibleReferences();
      if (wasFocused) this.input.focus();
    }
    formStateRestoreCallback(state, mode) {
      var _a;
      if (typeof state === "string" && ((_a = this.input) == null ? void 0 : _a.type) !== "file") this.value = state;
    }
    get value() {
      var _a;
      return (_a = this.input) == null ? void 0 : _a.value;
    }
    set value(val) {
      if (this.input) {
        this.input.value = val;
        this.setAttribute("value", val);
        this.internals.setFormValue(this.input.value);
        this._syncValidity();
        this._updateClearButton();
        this._updateColorCode();
      }
    }
    /** ✅ 開發者用：清空 input 值 */
    clear() {
      if (this.input.disabled || this.input.readOnly || !this.input.value) return;
      const wasFocused = this.shadowRoot.activeElement === this.clearButton;
      this.input.value = "";
      this.value = "";
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      this._updateClearButton();
      this._updateColorCode();
      if (wasFocused) this.input.focus();
    }
    /** ✅ 開發者用：注入建議值 */
    suggest(val = "") {
      if (this.input.disabled || this.input.readOnly) return;
      this.input.value = val;
      this.value = val;
      this.internals.setFormValue(this.input.value);
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
    focus(options) {
      var _a;
      (_a = this.input) == null ? void 0 : _a.focus(options);
    }
    generateId() {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const byteArray = new Uint32Array(1);
        crypto.getRandomValues(byteArray);
        return `au-input-${byteArray[0].toString(36)}`;
      }
      return `au-input-${Math.random().toString(36).slice(2)}`;
    }
    // Forward only the documented input attributes. Copying every host attribute
    // would also copy hidden, inert, style and inline handlers, which then stay on
    // the inner input after the host changes (and run twice for handlers).
    syncAttributes() {
      const handledElsewhere = /* @__PURE__ */ new Set([
        "id",
        "label",
        "list",
        "aria-label",
        "aria-labelledby",
        "aria-describedby",
        "data-size",
        "data-layout",
        "data-clear",
        "data-clear-label"
      ]);
      for (const name of this.constructor.observedAttributes) {
        if (handledElsewhere.has(name) || !this.hasAttribute(name)) continue;
        const value = this.getAttribute(name);
        this.input.setAttribute(name, value);
        if (name === "value") this.input.defaultValue = value;
      }
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
      if (!this.clearButton) return;
      const hasClear = this.hasAttribute("data-clear");
      const hasValue = this.input.value.length > 0;
      const label = this.getAttribute("data-clear-label") || "Clear input";
      this.clearButton.setAttribute("aria-label", label);
      this.clearButton.disabled = this.input.disabled || this.input.readOnly;
      this.clearButton.hidden = !(hasClear && hasValue) || this.clearButton.disabled;
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      this._syncControlState();
    }
    _syncControlState() {
      if (!this.input) return;
      this.input.disabled = Boolean(this.disabled || this._formDisabled);
      this.input.readOnly = this.readonly;
      this._updateClearButton();
      this._syncValidity();
    }
    _observeExternalReferences() {
      var _a;
      (_a = this._referenceObserver) == null ? void 0 : _a.disconnect();
      this._referenceObserver ?? (this._referenceObserver = new MutationObserver(() => {
        var _a2, _b;
        this._syncAccessibleReferences();
        const listId = this.getAttribute("list");
        const found = (_b = (_a2 = this.getRootNode()).getElementById) == null ? void 0 : _b.call(_a2, listId);
        const target = (found == null ? void 0 : found.tagName) === "DATALIST" ? found : null;
        if (listId && target !== this._externalDatalist) this._handleListAttribute(listId);
      }));
      this._referenceObserver.observe(this.getRootNode(), {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "for", "aria-label"]
      });
      this._syncAccessibleReferences();
    }
    _syncAccessibleReferences() {
      if (!this.input) return;
      const root = this.getRootNode();
      const resolve = (attribute) => (this.getAttribute(attribute) || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((el) => el && el !== this);
      const explicit = this.getAttribute("aria-label");
      let labels = resolve("aria-labelledby");
      if (!labels.length && !explicit && !this.getAttribute("label") && this.isConnected) labels = [...this.internals.labels];
      const descriptions = resolve("aria-describedby");
      this.input.removeAttribute("aria-labelledby");
      this.input.removeAttribute("aria-describedby");
      explicit ? this.input.setAttribute("aria-label", explicit) : this.input.removeAttribute("aria-label");
      this.labelEl.hidden = !this.labelEl.textContent;
      if ("ariaLabelledByElements" in this.input) this.input.ariaLabelledByElements = labels;
      else if (!explicit && labels.length) this.input.setAttribute("aria-label", labels.map((el) => el.getAttribute("aria-label") || el.textContent).join(" ").trim());
      if ("ariaDescribedByElements" in this.input) this.input.ariaDescribedByElements = descriptions;
      else if (descriptions.length) {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = this.generateId();
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        this._descriptionMirror.textContent = descriptions.map((el) => el.textContent).join(" ").trim();
        this.input.setAttribute("aria-describedby", this._descriptionMirror.id);
      }
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
        this._externalDatalist = externalDatalist;
        this._syncInternalDatalist(externalDatalist, listId);
        this._datalistObserver = new MutationObserver(() => {
          this._syncInternalDatalist(externalDatalist, listId);
        });
        this._datalistObserver.observe(externalDatalist, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
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
      this._externalDatalist = null;
      if (this._datalistObserver) {
        this._datalistObserver.disconnect();
        this._datalistObserver = null;
      }
    }
    disconnectedCallback() {
      var _a;
      this._disconnectDatalistObserver();
      (_a = this._referenceObserver) == null ? void 0 : _a.disconnect();
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
      this.liveRegion.className = "visually-hidden";
      this._nodes = /* @__PURE__ */ new Map();
      this._parseAttributes();
      this._render();
    }
    connectedCallback() {
      for (const key of ["total", "currentPage", "pageSize", "pagerCount", "layout", "pageSizeOptions"]) {
        if (Object.hasOwn(this, key)) {
          const value = this[key];
          delete this[key];
          this[key] = value;
        }
      }
      this._requestRender();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._renderFrame);
      cancelAnimationFrame(this._announceFrame);
      this._updatePending = false;
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      this._parseAttributes();
      this._requestRender();
    }
    _requestRender() {
      if (this._updatePending) return;
      this._updatePending = true;
      this._renderFrame = requestAnimationFrame(() => {
        this._updatePending = false;
        this._render();
      });
    }
    _parseAttributes() {
      const integer = (value, fallback, min = 1) => {
        const number = Number(value);
        return (typeof value === "number" || typeof value === "string") && String(value).trim() !== "" && Number.isSafeInteger(number) && number >= min ? number : fallback;
      };
      this._total = integer(this.getAttribute("data-total"), 0, 0);
      this._pageSize = integer(this.getAttribute("data-page-size"), 10);
      this._currentPage = Math.min(integer(this.getAttribute("data-current-page"), 1), this.totalPages);
      this._pagerCount = Math.min(integer(this.getAttribute("data-pager-count"), 5), 100);
      const opts = this.getAttribute("data-page-size-options");
      if (opts) {
        try {
          this._pageSizeOptions = JSON.parse(opts);
        } catch {
          this._pageSizeOptions = opts.split(",").map((n) => n.trim());
        }
      } else {
        this._pageSizeOptions = [10, 30, 50, 100];
      }
      this._pageSizeOptions = Array.isArray(this._pageSizeOptions) ? [...new Set(this._pageSizeOptions.map((value) => integer(value, 0)).filter(Boolean))] : [10, 30, 50, 100];
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
      const supported = ["total_page", "total_items", "page_size", "first", "prev", "pages", "next", "last", "jump"];
      this._layout = Array.isArray(this._layout) ? [...new Set(this._layout.filter((value) => supported.includes(value)))] : supported;
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
    get total() {
      return this._total;
    }
    set total(value) {
      this.setAttribute("data-total", String(value));
    }
    get currentPage() {
      return this._currentPage;
    }
    set currentPage(value) {
      this.setAttribute("data-current-page", String(value));
    }
    get pageSize() {
      return this._pageSize;
    }
    set pageSize(value) {
      this.setAttribute("data-page-size", String(value));
    }
    get pagerCount() {
      return this._pagerCount;
    }
    set pagerCount(value) {
      this.setAttribute("data-pager-count", String(value));
    }
    get pageSizeOptions() {
      return [...this._pageSizeOptions ?? [10, 30, 50, 100]];
    }
    set pageSizeOptions(val) {
      this.setAttribute("data-page-size-options", JSON.stringify(val));
    }
    get layout() {
      return [...this._layout ?? ["total_page", "total_items", "page_size", "first", "prev", "pages", "next", "last", "jump"]];
    }
    set layout(val) {
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
      if (!this._style) {
        const style = document.createElement("style");
        style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-inline-size: 0; }
      *, *::before, *::after { box-sizing: border-box; }
      button, select, input { min-inline-size: 24px; min-block-size: 24px; max-inline-size: 100%; }
      input { inline-size: 7rem; }
      label, span, button { overflow-wrap: anywhere; }
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
        border: var(--au-btn-border-width, 1px) var(--au-btn-border-style, solid) var(--au-btn-border-color, oklch(0.55 0 0));
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
          border-color: var(--au-btn-hover-border-color, oklch(0.55 0 0));
        }

        &:active {
          background-color: var(--au-btn-active-bg, oklch(0.8689 0 0));
          border-color: var(--au-btn-active-border-color, oklch(0.55 0 0));
        }

        &:focus-visible {
          outline: 2px solid var(--au-pagination-focus-color, #222);
          outline-offset: 2px;
        }

        &[aria-current="page"] {
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 0.2em;
          cursor: not-allowed;
          pointer-events: none;
          background-color: var(--au-btn-current-bg, oklch(0.7894 0 0));
          color: var(--au-btn-current-text-color, oklch(0.1398 0 0));
          border-color: var(--au-btn-current-border-color, oklch(0.55 0 0));
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
        justify-content: center;
      }
      @media (prefers-reduced-motion: reduce) { button, input, select { transition: none; } }
      @media (forced-colors: active) {
        button:focus-visible, input:focus-visible, select:focus-visible { outline-color: Highlight; }
        button[aria-current="page"] { border: 3px solid Highlight; }
      }
    `;
        this.shadowRoot.appendChild(style);
        this._style = style;
      }
      const focused = this.shadowRoot.activeElement;
      this._usedNodes = /* @__PURE__ */ new Set();
      const node = (key, tag, text) => {
        this._usedNodes.add(key);
        let element = this._nodes.get(key);
        if (!element) {
          element = document.createElement(tag);
          this._nodes.set(key, element);
        }
        if (text !== void 0 && element.textContent !== String(text)) element.textContent = String(text);
        return element;
      };
      const children = (parent, desired) => {
        for (const child of [...parent.children]) if (!desired.includes(child)) child.remove();
        desired.forEach((child, index) => {
          if (parent.children[index] !== child) parent.insertBefore(child, parent.children[index] || null);
        });
      };
      const root = node("root", "div");
      root.className = "au-pagination";
      const container = node("container", "div");
      container.className = "au-pagination-container";
      const grp1 = node("info", "div");
      grp1.className = "au-pagination-group";
      const info = [];
      if (layout.includes("total_page")) info.push(node("total-pages", "span", t.totalPagesPrefix + " " + totalPages + " " + t.pageSuffix));
      if (layout.includes("total_items")) info.push(node("total-items", "span", totalItems + " " + t.totalItemsSuffix));
      if (layout.includes("page_size")) {
        const hidden = node("size-name", "span", t.pageSizeText);
        hidden.className = "visually-hidden";
        hidden.id = this._selectId + "-name";
        const label = node("size-label", "label");
        label.htmlFor = this._selectId;
        children(label, [node("size-prefix", "span", t.perText + " "), hidden]);
        const select = node("size", "select");
        select.id = this._selectId;
        const options = [.../* @__PURE__ */ new Set([...this.pageSizeOptions, this.pageSize])].sort((a, b) => a - b).map((size) => {
          const option = node("size-" + size, "option", size);
          option.value = String(size);
          return option;
        });
        children(select, options);
        select.value = String(this.pageSize);
        select.onchange = () => {
          const size = Number(select.value);
          if (size === this.pageSize) return;
          this.pageSize = size;
          this.currentPage = 1;
          this.dispatchEvent(new CustomEvent("page-size-change", { detail: size, bubbles: true, composed: true }));
          this.announce(this.formatText(this.texts.pageAnnouncement, { page: this.currentPage }));
        };
        info.push(label, select, node("size-suffix", "span", t.totalItemsSuffix));
      }
      children(grp1, info);
      const grp2 = node("navigation", "div");
      grp2.className = "au-pagination-group";
      const nav = node("nav", "nav");
      nav.setAttribute("aria-label", t.paginationLabel);
      nav.tabIndex = -1;
      const list = node("buttons", "ul");
      list.className = "pagination-buttons";
      const items = [];
      const button = (key, label, page, disabled = false, current = false) => {
        const li = node("li-" + key, "li");
        const btn = node(key, "button", label);
        btn.type = "button";
        btn.dataset.control = key;
        btn.disabled = disabled;
        btn.className = key.startsWith("page-") ? "pager" : "";
        if (current) {
          btn.setAttribute("aria-current", "page");
          btn.setAttribute("part", "current-page");
        } else {
          btn.removeAttribute("aria-current");
          btn.removeAttribute("part");
        }
        btn.onclick = () => this._goto(typeof page === "function" ? page() : page);
        children(li, [btn]);
        items.push(li);
      };
      if (layout.includes("first")) button("first", t.firstText, 1, this.currentPage === 1);
      if (layout.includes("prev")) button("prev", t.prevText, () => this.currentPage - 1, this.currentPage === 1);
      if (layout.includes("pages")) this.pagers.forEach((page) => button("page-" + page, page, page, false, page === this.currentPage));
      if (layout.includes("next")) button("next", t.nextText, () => this.currentPage + 1, this.currentPage >= totalPages);
      if (layout.includes("last")) button("last", t.lastText, () => this.totalPages, this.currentPage >= totalPages);
      children(list, items);
      children(nav, [list]);
      children(grp2, [nav]);
      const groups = [grp1, grp2];
      if (layout.includes("jump")) {
        const grp3 = node("jump-group", "div");
        grp3.className = "au-pagination-group";
        const label = node("jump-label", "label", t.goText);
        label.htmlFor = this._jumpId;
        const input = node("jump", "input");
        input.type = "number";
        input.id = this._jumpId;
        input.min = "1";
        input.max = String(totalPages);
        input.step = "1";
        input.required = true;
        if (this._renderedPage !== this.currentPage || !input.isConnected) input.value = String(this.currentPage);
        const jump = () => {
          if (input.reportValidity()) this._goto(input.valueAsNumber);
        };
        input.onkeydown = (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            jump();
          }
        };
        const btn = node("jump-confirm", "button", t.gotoText);
        btn.type = "button";
        btn.onclick = jump;
        children(grp3, [label, input, node("jump-suffix", "span", t.pageSuffix), btn]);
        groups.push(grp3);
      }
      children(container, groups);
      children(root, [container]);
      if (!root.isConnected) this.shadowRoot.append(root);
      if (this.liveRegion.parentNode !== this.shadowRoot) this.shadowRoot.append(this.liveRegion);
      this._renderedPage = this.currentPage;
      for (const key of this._nodes.keys()) if (!this._usedNodes.has(key)) this._nodes.delete(key);
      if (focused && this.isConnected && (!focused.isConnected || focused.disabled || this.shadowRoot.activeElement !== focused)) {
        const target = focused.isConnected && !focused.disabled ? focused : list.querySelector('[aria-current="page"]') || list.querySelector("button:not(:disabled)") || nav;
        target.focus({ preventScroll: true });
      }
    }
    _goto(page) {
      if (!Number.isSafeInteger(page)) return;
      if (page < 1) page = 1;
      if (page > this.totalPages) page = this.totalPages;
      if (page === this.currentPage) return;
      this.currentPage = page;
      this.dispatchEvent(new CustomEvent("page-change", { detail: page, bubbles: true, composed: true }));
      this.announce(this.formatText(this.texts.pageAnnouncement, { page: this.currentPage }));
    }
    announce(message) {
      cancelAnimationFrame(this._announceFrame);
      while (this.liveRegion.firstChild) this.liveRegion.removeChild(this.liveRegion.firstChild);
      this._announceFrame = requestAnimationFrame(() => {
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
      this.attachShadow({ mode: "open", delegatesFocus: true });
      this.internals = this.attachInternals();
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .au-radio-group {
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 0.625rem;
      }
      .au-radio-group--vertical {
        flex-direction: column;
        label {
          width: fit-content;
          max-width: 100%;
        }
      }
      label {
        cursor: pointer;
        box-sizing: border-box;
        max-width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--au-radio-content-gap, 0.375rem);
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        padding: 0.25rem;
        input[type="radio"] {
          appearance: none;
          flex-shrink: 0;
          box-sizing: border-box;
          margin: 0;
          cursor: pointer;
          width: var(--au-radio-input-width, 1.5rem);
          height: var(--au-radio-input-height, 1.5rem);
          border: var(--au-radio-input-border-width, 1px) var(--au-radio-input-border-style, solid) var(--au-radio-input-border-color, oklch(0.55 0 0));
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
          min-width: 0;
          overflow-wrap: anywhere;
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
          box-shadow: inset 0 0 0 var(--au-radio-input-focus-shadow-width, 3px) var(--au-radio-input-focus-shadow-color, oklch(0.45 0.15 260));
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
      @media (forced-colors: active) {
        label input[type="radio"] { appearance: auto; }
        label input[type="radio"]:checked::before { content: none; }
        label:has(input:focus-visible), .au-radio-group:focus-visible {
          outline: 2px solid Highlight; outline-offset: 2px;
        }
      }
      .au-radio-group:focus-visible { outline: 2px solid var(--au-radio-input-focus-shadow-color, oklch(0.45 0.15 260)); }
    `;
      const container = document.createElement("div");
      container.setAttribute("class", "au-radio-group");
      container.setAttribute("role", "radiogroup");
      this.groupName = "radio-group-name-" + this.generateId();
      const slot = document.createElement("slot");
      slot.style.display = "none";
      container.tabIndex = -1;
      this._container = container;
      this._slot = slot;
      this._entries = /* @__PURE__ */ new Map();
      this._value = null;
      this._selectionSet = false;
      slot.addEventListener("slotchange", () => this.renderRadios());
      this.shadowRoot.append(style, container, slot);
    }
    connectedCallback() {
      for (const name of ["value", "name", "disabled", "required"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
      this._mutationObserver ?? (this._mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          if (record.attributeName !== "checked" || !this._entries.has(record.target)) continue;
          if (record.target.hasAttribute("checked")) {
            this._selectedSource = record.target;
            this._selectionSet = true;
          } else if (this._selectedSource === record.target) {
            this._selectedSource = null;
            this._value = null;
            this._selectionSet = true;
          }
        }
        this.renderRadios();
      }));
      this._mutationObserver.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["label", "value", "checked", "disabled", "lang"]
      });
      this._referenceObserver ?? (this._referenceObserver = new MutationObserver(() => this.updateGroupAttributes()));
      this._referenceObserver.observe(this.getRootNode(), {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "for", "aria-label"]
      });
      this.renderRadios();
    }
    disconnectedCallback() {
      var _a, _b;
      (_a = this._mutationObserver) == null ? void 0 : _a.disconnect();
      (_b = this._referenceObserver) == null ? void 0 : _b.disconnect();
    }
    renderRadios() {
      const focused = this.shadowRoot.activeElement;
      const hadFocus = focused && this._container.contains(focused);
      const sources = this._slot.assignedElements();
      const entries = /* @__PURE__ */ new Map();
      sources.forEach((source, index2) => {
        let entry = this._entries.get(source);
        if (!entry) {
          const label = document.createElement("label");
          const input = document.createElement("input");
          input.type = "radio";
          input.id = "radio-" + this.generateId();
          input.name = this.groupName;
          label.htmlFor = input.id;
          const text = document.createElement("div");
          text.className = "text";
          label.append(input, text);
          entry = { source, label, input, text };
          input.addEventListener("input", () => {
            if (input.checked) {
              this._selectedSource = source;
              this._value = input.value;
              this._selectionSet = true;
              this._syncSelection();
            }
          });
          input.addEventListener("change", (event) => this.handleChange(event, input));
          input.addEventListener("keydown", (event) => this.handleKeyDown(event, input));
        }
        entry.input.value = source.getAttribute("value") ?? `radio-${index2 + 1}`;
        entry.input.disabled = this.disabled || Boolean(this._formDisabled) || source.hasAttribute("disabled");
        entry.input.required = this.required;
        entry.text.textContent = source.getAttribute("label") || source.textContent.trim();
        if (source.hasAttribute("lang")) entry.text.setAttribute("lang", source.getAttribute("lang"));
        else entry.text.removeAttribute("lang");
        entries.set(source, entry);
      });
      for (const [source, entry] of this._entries) {
        if (!entries.has(source)) entry.label.remove();
      }
      this._entries = entries;
      let index = 0;
      for (const entry of entries.values()) {
        if (this._container.children[index] !== entry.label) {
          this._container.insertBefore(entry.label, this._container.children[index] || null);
        }
        index++;
      }
      if (!this._selectionSet && entries.size) {
        this._selectedSource = sources.filter((source) => source.hasAttribute("checked")).at(-1) || null;
        this._selectionSet = true;
      }
      this._syncSelection();
      if (!this._initialValueSet && entries.size) {
        this._initialValue = this._value;
        this._initialValueSet = true;
      }
      this.updateGroupAttributes();
      if (hadFocus) {
        const stillEnabled = [...entries.values()].some((entry) => entry.input === focused && !entry.input.disabled);
        if (stillEnabled && this.shadowRoot.activeElement !== focused) focused.focus();
        else if (!stillEnabled) this.focus();
      }
    }
    _syncSelection() {
      var _a;
      let selected = this._entries.get(this._selectedSource);
      if (!selected && this._value !== null) {
        selected = [...this._entries.values()].find((entry) => entry.input.value === this._value);
      }
      this._selectedSource = (selected == null ? void 0 : selected.source) || null;
      if (selected) this._value = selected.input.value;
      const enabled = [...this._entries.values()].filter((entry) => !entry.input.disabled);
      const tabStop = selected && !selected.input.disabled ? selected : enabled[0];
      for (const entry of this._entries.values()) {
        entry.input.checked = entry === selected;
        entry.input.tabIndex = entry === tabStop ? 0 : -1;
      }
      this.internals.setFormValue(
        selected && !selected.input.disabled ? selected.input.value : null,
        JSON.stringify({ value: this._value })
      );
      const anchor = (_a = enabled[0]) == null ? void 0 : _a.input;
      if (!anchor || !anchor.willValidate || anchor.validity.valid) this.internals.setValidity({});
      else this.internals.setValidity(anchor.validity, anchor.validationMessage, anchor);
    }
    handleChange(event, input) {
      event.stopPropagation();
      const entry = [...this._entries.values()].find((entry2) => entry2.input === input);
      if (!entry || !input.checked || input.disabled) return;
      this._selectedSource = entry.source;
      this._value = input.value;
      this._selectionSet = true;
      this._syncSelection();
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: input.value }
      }));
    }
    handleKeyDown(event, currentInput) {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const enabled = [...this._entries.values()].map((entry) => entry.input).filter((input) => !input.disabled);
      if (!enabled.length || currentInput.disabled) return;
      const current = enabled.indexOf(currentInput);
      if (current < 0) return;
      const next = enabled[(current + step + enabled.length) % enabled.length];
      next.focus();
      if (next !== currentInput || !next.checked) next.click();
    }
    static get observedAttributes() {
      return ["name", "value", "disabled", "required", "direction", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "label"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (name === "value") this.value = newValue;
      else if (name === "disabled" || name === "required") this.renderRadios();
      else {
        this._syncSelection();
        this.updateGroupAttributes();
      }
    }
    updateGroupAttributes() {
      const container = this._container;
      const root = this.getRootNode();
      const resolve = (attribute) => (this.getAttribute(attribute) || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((element) => element && element !== this);
      const explicit = this.getAttribute("aria-label") || this.getAttribute("label");
      let labels = resolve("aria-labelledby");
      if (!labels.length && !explicit && this.isConnected) labels = [...this.internals.labels || []];
      const descriptions = resolve("aria-describedby");
      container.removeAttribute("aria-labelledby");
      container.removeAttribute("aria-describedby");
      if (explicit) container.setAttribute("aria-label", explicit);
      else container.removeAttribute("aria-label");
      if ("ariaLabelledByElements" in container) container.ariaLabelledByElements = labels;
      else if (!explicit && labels.length) {
        container.setAttribute("aria-label", labels.map((element) => element.getAttribute("aria-label") || element.textContent).join(" ").trim());
      }
      if ("ariaDescribedByElements" in container) container.ariaDescribedByElements = descriptions;
      else if (descriptions.length) {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = "radio-description-" + this.generateId();
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        this._descriptionMirror.textContent = descriptions.map((element) => element.textContent).join(" ").trim();
        container.setAttribute("aria-describedby", this._descriptionMirror.id);
      }
      container.classList.toggle("au-radio-group--vertical", this.getAttribute("direction") === "vertical");
      if (this.required) container.setAttribute("aria-required", "true");
      else container.removeAttribute("aria-required");
      if (this.disabled || this._formDisabled) container.setAttribute("aria-disabled", "true");
      else container.removeAttribute("aria-disabled");
      if (this.hasAttribute("aria-invalid")) container.setAttribute("aria-invalid", this.getAttribute("aria-invalid"));
      else container.removeAttribute("aria-invalid");
    }
    get value() {
      var _a;
      return ((_a = this._entries.get(this._selectedSource)) == null ? void 0 : _a.input.value) ?? null;
    }
    set value(value) {
      this._value = value == null ? null : String(value);
      this._selectedSource = null;
      this._selectionSet = true;
      this._syncSelection();
    }
    get name() {
      return this.getAttribute("name") || "";
    }
    set name(value) {
      this.setAttribute("name", value);
    }
    get required() {
      return this.hasAttribute("required");
    }
    set required(value) {
      this.toggleAttribute("required", Boolean(value));
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      this.toggleAttribute("disabled", Boolean(value));
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
    focus(options) {
      const inputs = [...this._entries.values()].map((entry) => entry.input);
      const target = inputs.find((input) => input.tabIndex === 0 && !input.disabled);
      (target || this._container).focus(options);
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      this.renderRadios();
    }
    formResetCallback() {
      this.value = this._initialValue ?? null;
    }
    formStateRestoreCallback(state) {
      if (typeof state !== "string") return;
      try {
        const restored = JSON.parse(state);
        if (restored && (restored.value === null || typeof restored.value === "string")) this.value = restored.value;
      } catch {
      }
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
      const template = document.createElement("template");
      template.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {
          display: inline-flex;
          flex-wrap: wrap;
          max-width: 100%;
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
          flex-wrap: wrap;
          min-inline-size: 0;
          max-width: 100%;
          gap: var(--au-rating-gap, 0.25rem);
        }

        .rating-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 0 1 auto;
          min-width: 0;
          max-width: 100%;
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
          box-sizing: border-box;
          min-width: 24px;
          min-height: 24px;
          max-width: 100%;
          border-radius: 4px;
          transition: transform 150ms ease;
        }
        :host([readonly]) label, :host(:disabled) label { cursor: default; }
        
        input:checked + label {
          box-shadow: inset 0 -2px 0 currentColor;
        }

        input:focus-visible + label {
          outline: var(--au-rating-focus-width, 3px) solid var(--au-rating-focus-color, oklch(0.45 0.15 260));
          outline-offset: -3px;
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
          stroke: var(--au-rating-star-stroke-color, oklch(0.45 0 0));
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
        :host(:dir(rtl)) .star-fill {
          clip-path: inset(0 0 0 var(--au-rating-clip, 100%));
        }

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
          white-space: normal;
          overflow-wrap: anywhere;
        }
        
        .score:empty {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
        @media (forced-colors: active) {
          .star { forced-color-adjust: auto; stroke: CanvasText; }
          .star-bg { fill: Canvas; }
          .star-fill { fill: CanvasText; }
          input:checked + label { border-bottom: 2px solid CanvasText; }
          input:focus-visible + label { outline-color: Highlight; }
        }
      </style>
      <fieldset class="au-rating" role="radiogroup" aria-describedby="score">
        <legend class="visually-hidden"></legend>
      </fieldset>
      <span class="score" id="score"></span>
    `;
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._fieldset = this.shadowRoot.querySelector(".au-rating");
      this._legend = this.shadowRoot.querySelector("legend");
      this._scoreEl = this.shadowRoot.querySelector(".score");
      this._internals = this.attachInternals();
      this._fieldset.addEventListener("change", (e) => this.handleChange(e));
      this._fieldset.addEventListener("keydown", (e) => this.handleKeyDown(e));
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
        "aria-invalid",
        "aria-describedby",
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
      for (const name of ["name", "value", "max", "disabled", "readonly"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
      if (this._defaultValue === void 0) this._defaultValue = this.value;
      this.render();
      this._observeDescriptions();
    }
    disconnectedCallback() {
      var _a;
      (_a = this._descriptionObserver) == null ? void 0 : _a.disconnect();
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "aria-describedby") {
        if (oldValue !== newValue && this.isConnected) this._observeDescriptions();
        return;
      }
      if (oldValue !== newValue && this.isConnected) this.render();
    }
    _observeDescriptions() {
      var _a;
      (_a = this._descriptionObserver) == null ? void 0 : _a.disconnect();
      if (this.hasAttribute("aria-describedby")) {
        this._descriptionObserver ?? (this._descriptionObserver = new MutationObserver(() => this._syncDescriptions()));
        this._descriptionObserver.observe(this.getRootNode(), {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["id"]
        });
      }
      this._syncDescriptions();
    }
    _syncDescriptions() {
      const root = this.getRootNode();
      const external = [...new Set((this.getAttribute("aria-describedby") || "").trim().split(/\s+/))].filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((el) => el && el !== this);
      if (!external.length) {
        if (this._descriptionMirror) this._descriptionMirror.textContent = "";
        this._fieldset.setAttribute("aria-describedby", "score");
        return;
      }
      if (typeof this._fieldset.ariaDescribedByElements !== "undefined") {
        this._fieldset.ariaDescribedByElements = [this._scoreEl, ...external];
      } else {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = "external-description";
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        const text = external.map((el) => el.textContent).join(" ").trim();
        if (this._descriptionMirror.textContent !== text) this._descriptionMirror.textContent = text;
        this._fieldset.setAttribute("aria-describedby", text ? "score external-description" : "score");
      }
    }
    get max() {
      const max = Number(this.getAttribute("max"));
      return Number.isInteger(max) && max > 0 ? Math.min(max, 100) : 5;
    }
    set max(value) {
      this.setAttribute("max", value);
    }
    get value() {
      const val = Number(this.getAttribute("value"));
      return Number.isFinite(val) ? Math.min(this.max, Math.max(0, val)) : 0;
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
      return this.getAttribute("name") || "";
    }
    set name(value) {
      this.setAttribute("name", value);
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
      var _a;
      const ariaLabel = this.ratingLabel;
      this._legend.textContent = ariaLabel;
      this._fieldset.setAttribute("aria-label", ariaLabel);
      if (this.hasAttribute("aria-invalid")) this._fieldset.setAttribute("aria-invalid", this.getAttribute("aria-invalid"));
      else this._fieldset.removeAttribute("aria-invalid");
      const disabled = this.disabled || this._formDisabled;
      this.readonly ? this._fieldset.setAttribute("aria-readonly", "true") : this._fieldset.removeAttribute("aria-readonly");
      disabled ? this._fieldset.setAttribute("aria-disabled", "true") : this._fieldset.removeAttribute("aria-disabled");
      const labels = this.labels;
      const currentValue = this.value;
      const previousFocus = this.shadowRoot.activeElement;
      const options = [...this._fieldset.querySelectorAll(".rating-option")];
      for (let i = 1; i <= this.max; i++) {
        let option = options[i - 1];
        if (!option) {
          option = document.createElement("div");
          option.className = "rating-option";
          option.innerHTML = `<input type="radio"><label><span class="star-wrapper">${this.getStarSVG("star-bg")}${this.getStarSVG("star-fill")}</span><span class="label-text"></span></label>`;
          this._fieldset.appendChild(option);
        }
        const input = option.querySelector("input");
        const label = option.querySelector("label");
        input.name = this._groupName;
        input.value = i;
        input.id = `${this._groupName}-${i}`;
        label.htmlFor = input.id;
        input.checked = i === currentValue;
        input.tabIndex = i === (Number.isInteger(currentValue) && currentValue > 0 ? currentValue : 1) ? 0 : -1;
        const labelTextContent = labels[i - 1];
        if (!labelTextContent) {
          input.setAttribute("aria-label", this.formatText(this.starLabelTemplate, { value: i, max: this.max }));
        } else input.removeAttribute("aria-label");
        input.disabled = Boolean(disabled || this.readonly);
        option.querySelector(".label-text").textContent = labelTextContent || "";
      }
      options.slice(this.max).forEach((option) => option.remove());
      if (previousFocus && !this.shadowRoot.contains(previousFocus) && !disabled && !this.readonly) {
        (_a = this._fieldset.querySelector('input[tabindex="0"]')) == null ? void 0 : _a.focus();
      }
      this.updateStars(currentValue);
      this.updateScoreDisplay(currentValue);
      this._internals.setFormValue(currentValue.toString());
    }
    updateScoreDisplay(val) {
      this._scoreEl.classList.toggle("visually-hidden", !this.showScore);
      this._scoreEl.textContent = this.formatText(this.scoreTemplate, {
        value: val,
        max: this.max,
        scoreInfo: this.scoreInfo
      });
    }
    handleChange(e) {
      if (e.target.type === "radio") {
        e.stopPropagation();
        if (this.disabled || this._formDisabled || this.readonly) {
          this.render();
          return;
        }
        const newValue = parseInt(e.target.value);
        this.value = newValue;
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
      if (this.disabled || this._formDisabled || this.readonly) return;
      const radios = Array.from(this._fieldset.querySelectorAll('input[type="radio"]'));
      if (!radios.length) return;
      let currentIndex = radios.indexOf(this.shadowRoot.activeElement);
      if (currentIndex < 0) currentIndex = radios.findIndex((r) => r.checked);
      let nextIndex;
      const rtl = getComputedStyle(this._fieldset).direction === "rtl";
      const key = rtl && e.key === "ArrowRight" ? "ArrowLeft" : rtl && e.key === "ArrowLeft" ? "ArrowRight" : e.key;
      switch (key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          nextIndex = (currentIndex + 1) % radios.length;
          radios[nextIndex].focus();
          radios[nextIndex].click();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          nextIndex = currentIndex < 0 ? radios.length - 1 : (currentIndex - 1 + radios.length) % radios.length;
          radios[nextIndex].focus();
          radios[nextIndex].click();
          break;
      }
    }
    formResetCallback() {
      this.value = this._defaultValue ?? 0;
    }
    focus(options) {
      var _a;
      if (this.disabled || this._formDisabled || this.readonly) return;
      (_a = this._fieldset.querySelector('input[tabindex="0"]:not(:disabled)')) == null ? void 0 : _a.focus(options);
    }
    formStateRestoreCallback(state, mode) {
      if (typeof state === "string") this.value = state;
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      if (this.isConnected) this.render();
    }
  }
  if (typeof customElements !== "undefined" && !customElements.get("au-rating")) {
    customElements.define("au-rating", AuRating);
  }
  class AuSwitch extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open", delegatesFocus: true });
      this.internals = this.attachInternals();
      this.addEventListener("click", (event) => this._activateFromHost(event));
      const inputID = this.generateId();
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { max-width: 100%; }
      .au-switch {
        display: inline-flex;
        flex-wrap: wrap;
        box-sizing: border-box;
        max-width: 100%;
        overflow-wrap: anywhere;
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
          box-shadow: inset 0 0 0 var(--au-switch-focus-shadow-width, 3px) var(--au-switch-focus-shadow-color, oklch(0.45 0.15 260));
        } 
        &:has(input:disabled) {
          cursor: not-allowed;
          opacity: 0.5;
          text-decoration: none;
        } 
      }
      .container {
        display: flex;
        flex-wrap: wrap;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        gap: var(--au-switch-container-gap, 0.625rem);
      }
      .input {
        position: relative;
        flex-shrink: 0;
        &:before {
          content: '';
          display: block;
          width: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          height: calc(var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem));
          background-color: var(--au-switch-inner-bg, oklch(0.55 0 0));
          pointer-events: none;
          position: absolute;
          top: var(--au-switch-inner-distance, 0.25rem);
          inset-inline-start: var(--au-switch-inner-distance, 0.25rem);
          border-radius: var(--au-switch-inner-border-radius, calc((var(--au-switch-input-width, 4rem) / 2 - var(--au-switch-inner-distance, 0.25rem)) / 2));
          transition: background-color 360ms ease-in, inset-inline-start 240ms ease-in;
        }
        input[type="checkbox"] {
          appearance: none;
          cursor: pointer;
          margin: 0;
          box-sizing: border-box;
          display: block;
          width: var(--au-switch-input-width, 4rem);
          height: calc(var(--au-switch-input-width, 4rem) / 2);
          border: var(--au-switch-input-border-width, 1px) var(--au-switch-input-border-style, solid) var(--au-switch-input-border-color, oklch(0.55 0 0));
          background-color: var(--au-switch-input-bg, oklch(0.994 0 0));
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
          inset-inline-start: calc(100% - (var(--au-switch-input-width, 4rem) / 2 - 2 * var(--au-switch-inner-distance, 0.25rem)) - var(--au-switch-inner-distance, 0.25rem));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .input::before, .input input[type="checkbox"] { transition: none; }
      }
      @media (forced-colors: active) {
        .input input[type="checkbox"] { forced-color-adjust: none; background-color: Canvas; border-color: ButtonText; }
        .input::before { forced-color-adjust: none; background-color: CanvasText; }
        .input:has(input:checked) input[type="checkbox"] { background-color: Highlight; }
        .input:has(input:checked)::before { background-color: HighlightText; }
        .au-switch:has(input:focus-visible) { outline: 2px solid Highlight; outline-offset: 2px; }
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
      this.inputElement.value = this.getAttribute("value") ?? "on";
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
      this._labelSlot = slot;
      slot.addEventListener("slotchange", () => this.syncAccessibleLabel());
      this.labelFallback = document.createElement("span");
      this.labelFallback.textContent = this.getAttribute("label") || "";
      slot.appendChild(this.labelFallback);
      switchElement.prepend(slot);
      this.inputElement.addEventListener("input", () => {
        this.checked = this.inputElement.checked;
      });
      this.inputElement.addEventListener("change", (event) => {
        event.stopPropagation();
        this.checked = this.inputElement.checked;
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: this.checked }));
      });
    }
    _activateFromHost(event) {
      if (event.composedPath()[0] !== this) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented && this.isConnected && !this.inputElement.disabled) {
          this.inputElement.focus();
          this.inputElement.click();
        }
      });
    }
    get checked() {
      var _a;
      return ((_a = this.inputElement) == null ? void 0 : _a.checked) ?? false;
    }
    set checked(val) {
      this.toggleAttribute("checked", Boolean(val));
      this.inputElement.checked = Boolean(val);
      this.updateFormValue();
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(val) {
      val ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
    }
    formResetCallback() {
      this.checked = this._initialChecked;
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
      return ["name", "value", "checked", "disabled", "required", "off", "on", "label", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
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
          input.disabled = this.disabled || Boolean(this._formDisabled);
          break;
        case "name":
          input.name = newValue ?? "";
          break;
        case "value":
          input.value = newValue ?? "on";
          break;
        case "required":
          input.required = newValue !== null;
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
        case "aria-describedby":
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
      this.updateFormValue();
    }
    syncAccessibleLabel() {
      const input = this.inputElement;
      const root = this.getRootNode();
      const resolve = (attribute) => (this.getAttribute(attribute) || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((element) => element && element !== this);
      const explicit = this.getAttribute("aria-label");
      let labels = resolve("aria-labelledby");
      const hasSlotText = this._labelSlot.assignedNodes({ flatten: true }).some((node) => {
        var _a;
        return (_a = node.textContent) == null ? void 0 : _a.trim();
      });
      if (!labels.length && !explicit && !hasSlotText && this.isConnected) {
        labels = [...this.internals.labels];
      }
      const descriptions = resolve("aria-describedby");
      input.removeAttribute("aria-labelledby");
      input.removeAttribute("aria-describedby");
      if (explicit) input.setAttribute("aria-label", explicit);
      else input.removeAttribute("aria-label");
      if ("ariaLabelledByElements" in input) input.ariaLabelledByElements = labels;
      else if (!explicit && labels.length) {
        input.setAttribute("aria-label", labels.map((element) => element.getAttribute("aria-label") || element.textContent).join(" ").trim());
      }
      if ("ariaDescribedByElements" in input) input.ariaDescribedByElements = descriptions;
      else if (descriptions.length) {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = this.generateId();
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        this._descriptionMirror.textContent = descriptions.map((element) => element.textContent).join(" ").trim();
        input.setAttribute("aria-describedby", this._descriptionMirror.id);
      }
    }
    _observeLabels() {
      var _a;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      this._labelObserver ?? (this._labelObserver = new MutationObserver(() => this.syncAccessibleLabel()));
      this._labelObserver.observe(this.getRootNode(), {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "for", "aria-label"]
      });
      this.syncAccessibleLabel();
    }
    disconnectedCallback() {
      var _a;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
    }
    _upgradeProperties() {
      for (const name of ["checked", "disabled", "required", "name", "value"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
    }
    get name() {
      return this.getAttribute("name") || "";
    }
    set name(value) {
      this.setAttribute("name", value);
    }
    get value() {
      return this.getAttribute("value") ?? "on";
    }
    set value(value) {
      this.setAttribute("value", value);
    }
    get required() {
      return this.hasAttribute("required");
    }
    set required(value) {
      this.toggleAttribute("required", Boolean(value));
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
    focus(options) {
      this.inputElement.focus(options);
    }
    formStateRestoreCallback(state) {
      if (state === "checked" || state === "unchecked") this.checked = state === "checked";
    }
    connectedCallback() {
      this._upgradeProperties();
      if (!this._initialCheckedSet) {
        this._initialChecked = this.checked;
        this._initialCheckedSet = true;
      }
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
      input.disabled = this.disabled || Boolean(this._formDisabled);
      this.updateFormValue();
      this._observeLabels();
    }
    updateFormValue() {
      const input = this.inputElement;
      input.setAttribute("aria-checked", String(input.checked));
      this.internals.setFormValue(input.checked ? this.value : null, input.checked ? "checked" : "unchecked");
      if (!input.willValidate || input.validity.valid) this.internals.setValidity({});
      else this.internals.setValidity(input.validity, input.validationMessage, input);
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      this.inputElement.disabled = this.disabled || disabled;
      this.updateFormValue();
    }
  }
  __publicField(AuSwitch, "formAssociated", true);
  if (typeof customElements !== "undefined" && !customElements.get("au-switch")) {
    customElements.define("au-switch", AuSwitch);
  }
  class AuTabs extends HTMLElement {
    static get observedAttributes() {
      return ["data-text-tab", "data-text-tab-lang", "data-text-badge-label-prefix", "selected-index", "aria-label", "aria-labelledby"];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._tabs = [];
      this._panels = [];
      this._selectedIndex = -1;
      this._entries = /* @__PURE__ */ new Map();
      this.container = document.createElement("div");
      this.container.classList.add("au-tabs");
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .au-tabs { min-width: 0; }
      .au-tablist-item { flex-shrink: 0; max-width: 100%; }
      .label, .prefix, .badge, .affix { min-width: 0; overflow-wrap: anywhere; }
      .au-tablist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
        max-width: 100%;
      }

      .au-tablist-item{
        &:first-of-type {
          [role="tab"] {
            border-top-left-radius: var(--au-tabs-border-radius, 0);
          }
        }
        &:last-of-type {
          [role="tab"] {
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
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
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: var(--au-tabs-text-color, oklch(0.1398 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family);
        line-height: var(--au-tabs-text-line-height, 1.5);
        white-space: normal;
        box-sizing: border-box;
        max-width: 100%;
        min-width: 24px;
        min-height: 24px;

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
          text-decoration: underline;
          text-underline-offset: 0.2em;
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(0.994 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(0.55 0 0));
          background-color: var(--au-tabs-selected-bg, oklch(0.1398 0 0));
          color: var(--au-tabs-selected-text-color, oklch(0.994 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
        }
      }

      button[aria-selected="true"]:focus-visible {
        box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-selected-focus-shadow-color, white);
      }
      @media (prefers-reduced-motion: reduce) {
        button[role="tab"] { transition: none; }
      }
      @media (forced-colors: active) {
        button[aria-selected="true"] { border-bottom: 3px solid ButtonText; }
        button[role="tab"]:focus-visible { outline: 2px solid Highlight; outline-offset: -4px; }
      }
      .au-tablist:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
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
        box-sizing: border-box;
        min-width: 0;
        overflow-wrap: anywhere;
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
      }

      ::slotted(.au-tab-panel[aria-hidden="false"]) {
        display: block;
      }
      ::slotted(.au-tab-panel:focus-visible) {
        outline: 2px solid var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
        outline-offset: -2px;
      }
      @media (forced-colors: active) {
        ::slotted(.au-tab-panel:focus-visible) { outline-color: Highlight; }
      }
    `;
      this.tabsList = document.createElement("ul");
      this.tabsList.setAttribute("role", "tablist");
      this.tabsList.classList.add("au-tablist");
      const slot = document.createElement("slot");
      slot.name = "panel";
      this._slot = slot;
      slot.addEventListener("slotchange", () => this._renderTabs());
      this.tabsList.tabIndex = -1;
      this.tabsList.setAttribute("aria-orientation", "horizontal");
      this.container.append(style, this.tabsList, slot);
      this.shadowRoot.appendChild(this.container);
    }
    connectedCallback() {
      if (Object.hasOwn(this, "selectedIndex")) {
        const value = this.selectedIndex;
        delete this.selectedIndex;
        this.selectedIndex = value;
      }
      this._observer ?? (this._observer = new MutationObserver((records) => {
        if (records.some((record) => record.target === this || record.target.parentNode === this)) this._renderTabs();
      }));
      this._observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["label", "label-lang", "data-prefix", "data-badge", "data-affix", "id", "class", "slot"]
      });
      this._referenceObserver ?? (this._referenceObserver = new MutationObserver(() => this._updateLabel()));
      this._root = this.getRootNode();
      this._referenceObserver.observe(this._root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "aria-label"]
      });
      this._onRootFocusIn ?? (this._onRootFocusIn = (event) => {
        this._focusInPanel = this._panels.find((panel) => event.composedPath().includes(panel)) || null;
      });
      this._root.addEventListener("focusin", this._onRootFocusIn);
      this._renderTabs();
    }
    disconnectedCallback() {
      var _a, _b, _c;
      (_a = this._observer) == null ? void 0 : _a.disconnect();
      (_b = this._referenceObserver) == null ? void 0 : _b.disconnect();
      (_c = this._root) == null ? void 0 : _c.removeEventListener("focusin", this._onRootFocusIn);
      this._focusInPanel = null;
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (name === "selected-index") this.selectedIndex = newValue === null ? 0 : newValue;
      else if (this.isConnected) this._renderTabs();
    }
    formatText(template, values = {}) {
      return Object.entries(values).reduce((message, [key, value]) => {
        return message.replaceAll(`{${key}}`, String(value));
      }, template);
    }
    _writePanel(entry, name, value) {
      const current = entry.panel.getAttribute(name);
      if (!entry.originals.has(name) || current !== entry.written.get(name)) entry.originals.set(name, current);
      if (current !== value) {
        if (value === null) entry.panel.removeAttribute(name);
        else entry.panel.setAttribute(name, value);
      }
      entry.written.set(name, value);
    }
    _releasePanel(entry) {
      for (const [name, value] of entry.originals) {
        if (entry.panel.getAttribute(name) !== entry.written.get(name)) continue;
        if (value === null) entry.panel.removeAttribute(name);
        else entry.panel.setAttribute(name, value);
      }
    }
    _renderTabs() {
      const panels = this._slot.assignedElements().filter((panel) => panel.classList.contains("au-tab-panel"));
      const focusedTab = this.shadowRoot.activeElement;
      const lostPanelFocus = this._focusInPanel && !panels.includes(this._focusInPanel);
      const entries = /* @__PURE__ */ new Map();
      for (const [index2, panel] of panels.entries()) {
        let entry = this._entries.get(panel);
        if (!entry) {
          const li = document.createElement("li");
          li.setAttribute("role", "presentation");
          li.className = "au-tablist-item";
          const button = document.createElement("button");
          button.type = "button";
          button.setAttribute("role", "tab");
          button.id = "tab-" + this.generateId();
          li.append(button);
          entry = { panel, li, button, originals: /* @__PURE__ */ new Map(), written: /* @__PURE__ */ new Map() };
          button.addEventListener("click", () => this._selectTab(this._panels.indexOf(panel)));
          button.addEventListener("keydown", (event) => this._onKeydown(event, this._panels.indexOf(panel)));
        }
        if (!panel.id) this._writePanel(entry, "id", "panel-" + this.generateId());
        const label = panel.getAttribute("label") || this.formatText(this.getAttribute("data-text-tab") || "Tab {index}", { index: index2 + 1 });
        const lang = panel.getAttribute("label-lang") || this.getAttribute("data-text-tab-lang") || "";
        entry.label = label;
        this._writePanel(entry, "role", "tabpanel");
        this._writePanel(entry, "aria-label", label);
        if ("ariaControlsElements" in entry.button) entry.button.ariaControlsElements = [panel];
        const fragment = document.createDocumentFragment();
        for (const [className, text] of [
          ["prefix", panel.getAttribute("data-prefix")],
          ["label", label],
          ["badge", panel.getAttribute("data-badge")],
          ["affix", panel.getAttribute("data-affix")]
        ]) {
          if (!text) continue;
          const span = document.createElement("span");
          span.className = className;
          span.textContent = text;
          if (className === "label" && lang) span.lang = lang;
          if (className === "badge") span.setAttribute("aria-label", `${this.getAttribute("data-text-badge-label-prefix") || "Additional information:"} ${text}`);
          fragment.append(span);
        }
        entry.button.replaceChildren(fragment);
        entries.set(panel, entry);
      }
      for (const [panel, entry] of this._entries) {
        if (!entries.has(panel)) {
          this._releasePanel(entry);
          entry.li.remove();
        }
      }
      let index = 0;
      for (const entry of entries.values()) {
        if (this.tabsList.children[index] !== entry.li) this.tabsList.insertBefore(entry.li, this.tabsList.children[index] || null);
        index++;
      }
      this._entries = entries;
      this._panels = panels;
      this._tabs = [...entries.values()].map((entry) => entry.button);
      let selected = panels.indexOf(this._selectedPanel);
      if (this._pendingIndex !== void 0) selected = Math.min(this._pendingIndex, panels.length - 1);
      else if (selected < 0) selected = Math.min(Math.max(this._selectedIndex, 0), panels.length - 1);
      if (panels.length) this._pendingIndex = void 0;
      this._selectedIndex = selected;
      this._selectedPanel = panels[selected] || null;
      this._syncSelection();
      this._updateLabel();
      if (focusedTab && this._tabs.includes(focusedTab)) {
        if (this.shadowRoot.activeElement !== focusedTab) focusedTab.focus();
      } else if (focusedTab || lostPanelFocus) {
        (this._tabs[selected] || this.tabsList).focus();
      }
    }
    _syncSelection() {
      for (const [index, panel] of this._panels.entries()) {
        const entry = this._entries.get(panel), selected = index === this._selectedIndex;
        entry.button.setAttribute("aria-selected", String(selected));
        entry.button.tabIndex = selected ? 0 : -1;
        entry.li.classList.toggle("au-tablist-item--selected", selected);
        this._writePanel(entry, "aria-hidden", String(!selected));
        this._writePanel(entry, "hidden", selected ? null : "");
        this._writePanel(entry, "inert", selected ? null : "");
        const currentTabindex = panel.getAttribute("tabindex");
        const originalTabindex = entry.written.has("tabindex") && currentTabindex === entry.written.get("tabindex") ? entry.originals.get("tabindex") : currentTabindex;
        this._writePanel(entry, "tabindex", selected ? originalTabindex ?? "0" : "-1");
      }
    }
    _updateLabel() {
      const root = this.getRootNode();
      const labels = (this.getAttribute("aria-labelledby") || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((element) => element && element !== this);
      const explicit = this.getAttribute("aria-label");
      this.tabsList.removeAttribute("aria-labelledby");
      if (explicit) this.tabsList.setAttribute("aria-label", explicit);
      else this.tabsList.removeAttribute("aria-label");
      if ("ariaLabelledByElements" in this.tabsList) this.tabsList.ariaLabelledByElements = labels;
      else if (!explicit && labels.length) this.tabsList.setAttribute("aria-label", labels.map((element) => element.getAttribute("aria-label") || element.textContent).join(" ").trim());
    }
    _selectTab(index, { focus = true, emit = true } = {}) {
      if (!Number.isInteger(index) || index < 0 || index >= this._tabs.length) return;
      const changed = this._selectedIndex !== index;
      const focusWasInPanel = this._focusInPanel && this._focusInPanel !== this._panels[index];
      this._selectedIndex = index;
      this._selectedPanel = this._panels[index];
      this._syncSelection();
      if (focus || focusWasInPanel || this._tabs.includes(this.shadowRoot.activeElement)) this._tabs[index].focus();
      if (changed && emit) this.dispatchEvent(new CustomEvent("tab-change", {
        bubbles: true,
        composed: true,
        detail: { index, label: this._entries.get(this._selectedPanel).label }
      }));
    }
    _onKeydown(event, index) {
      if (event.altKey || event.ctrlKey || event.metaKey || index < 0) return;
      const last = this._tabs.length - 1;
      const rtl = getComputedStyle(this._tabs[index]).direction === "rtl";
      const key = rtl && event.key === "ArrowRight" ? "ArrowLeft" : rtl && event.key === "ArrowLeft" ? "ArrowRight" : event.key;
      let next;
      switch (key) {
        case "ArrowRight":
          next = index === last ? 0 : index + 1;
          break;
        case "ArrowLeft":
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
      event.preventDefault();
      this._selectTab(next);
    }
    get selectedIndex() {
      return this._selectedIndex;
    }
    set selectedIndex(value) {
      const index = Number(value);
      if (!Number.isInteger(index) || index < 0) return;
      if (!this._tabs.length) {
        this._pendingIndex = index;
        return;
      }
      this._selectTab(Math.min(index, this._tabs.length - 1), { focus: false, emit: false });
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
      this.attachShadow({ mode: "open", delegatesFocus: true });
      this.internals = this.attachInternals();
      this._id = this.getAttribute("id") || this.generateId();
      this._initialValue = "";
      this._initialValueSet = false;
      const style = document.createElement("style");
      style.textContent = `
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
      :host { display: block; min-width: 0; }
      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
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
      label[hidden] { display: none; }

      .textarea-container {
        display: flex;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        border: var(--au-textarea-border-width, 1px) var(--au-textarea-border-style, solid) var(--au-textarea-border-color, oklch(0.55 0 0));
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
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        
        resize: vertical;
        field-sizing: content;

        &:user-invalid {
          box-shadow: inset 0 0 0 var(--au-textarea-invalid-shadow-width, 3px) var(--au-textarea-invalid-shadow-color, oklch(0.5722 0.233 29.08));
        }

        &:focus-visible {
          box-shadow: inset 0 0 0 var(--au-textarea-focus-shadow-width, 3px) var(--au-textarea-focus-shadow-color, oklch(0.45 0.15 260));
        }

        &:read-only {
          color: var(--au-textarea-readonly-text-color, oklch(0.1398 0 0));
          background-color: var(--au-textarea-readonly-bg, oklch(0.95 0 0));
          cursor: default;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }        
      }
      @media (forced-colors: active) {
        textarea:focus-visible { outline: 2px solid Highlight; outline-offset: -2px; }
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
      this._bindTextareaEvents();
      textareaContainer.append(this.textarea);
      wrapper.append(this.labelEl, textareaContainer);
      this.shadowRoot.append(style, wrapper);
    }
    _bindTextareaEvents() {
      this.textarea.addEventListener("input", (event) => {
        this._syncFormValue();
        if (!event.composed) {
          const forwarded = event instanceof InputEvent ? new InputEvent("input", {
            bubbles: true,
            composed: true,
            data: event.data,
            inputType: event.inputType,
            isComposing: event.isComposing
          }) : new Event("input", { bubbles: true, composed: true });
          this.dispatchEvent(forwarded);
        }
      });
      this.textarea.addEventListener("change", (event) => {
        this._syncFormValue();
        if (!event.composed) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
    static get observedAttributes() {
      return ["value", "placeholder", "name", "rows", "cols", "disabled", "readonly", "required", "maxlength", "minlength", "autocomplete", "aria-label", "aria-labelledby", "aria-describedby", "aria-invalid", "label", "id"];
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
      if (oldValue === newValue) return;
      if (name === "label" && this.labelEl) {
        this.labelEl.textContent = newValue;
      } else if (name === "id") {
        this._id = newValue || this.generateId();
        this.textarea.id = this._id;
        this.labelEl.htmlFor = this._id;
      } else if (name === "value") {
        this.value = newValue ?? "";
      } else if (!["aria-label", "aria-labelledby", "aria-describedby"].includes(name)) {
        if (newValue === null) {
          this.textarea.removeAttribute(name);
        } else {
          this.textarea.setAttribute(name, newValue);
        }
      }
      this._syncControlState();
      this._syncAccessibleReferences();
    }
    connectedCallback() {
      for (const name of ["value", "name", "disabled", "readonly", "required"]) {
        if (Object.hasOwn(this, name)) {
          const value = this[name];
          delete this[name];
          this[name] = value;
        }
      }
      if (!this._initialValueSet) {
        this._initialValue = this.textarea.value;
        this._initialValueSet = true;
      }
      this.internals.setFormValue(this.textarea.value);
      this._syncControlState();
      this._observeExternalReferences();
    }
    get value() {
      return this.textarea.value;
    }
    set value(val) {
      this.textarea.value = val;
      this._syncFormValue();
    }
    formResetCallback() {
      const currentValue = this._initialValue || "";
      const wasFocused = this.shadowRoot.activeElement === this.textarea;
      const newTextarea = this.textarea.cloneNode(false);
      newTextarea.value = currentValue;
      this.textareaContainer.replaceChild(newTextarea, this.textarea);
      this.textarea = newTextarea;
      this._bindTextareaEvents();
      this.internals.setFormValue(this.textarea.value);
      this._syncControlState();
      this._syncAccessibleReferences();
      if (wasFocused) this.textarea.focus();
    }
    formStateRestoreCallback(state, mode) {
      if (typeof state === "string") this.value = state;
    }
    formDisabledCallback(disabled) {
      this._formDisabled = disabled;
      this._syncControlState();
    }
    get name() {
      return this.getAttribute("name") || "";
    }
    set name(value) {
      this.setAttribute("name", value);
    }
    get required() {
      return this.hasAttribute("required");
    }
    set required(value) {
      this.toggleAttribute("required", Boolean(value));
    }
    focus(options) {
      this.textarea.focus(options);
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
    _syncControlState() {
      this.textarea.disabled = Boolean(this.disabled || this._formDisabled);
      this.textarea.readOnly = this.readonly;
      this._syncValidity();
    }
    _observeExternalReferences() {
      var _a;
      (_a = this._referenceObserver) == null ? void 0 : _a.disconnect();
      this._referenceObserver ?? (this._referenceObserver = new MutationObserver(() => this._syncAccessibleReferences()));
      this._referenceObserver.observe(this.getRootNode(), {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "for", "aria-label"]
      });
      this._syncAccessibleReferences();
    }
    _syncAccessibleReferences() {
      const root = this.getRootNode();
      const resolve = (attribute) => (this.getAttribute(attribute) || "").trim().split(/\s+/).filter(Boolean).map((id) => {
        var _a;
        return (_a = root.getElementById) == null ? void 0 : _a.call(root, id);
      }).filter((element) => element && element !== this);
      const explicit = this.getAttribute("aria-label");
      let labels = resolve("aria-labelledby");
      if (!labels.length && !explicit && !this.getAttribute("label") && this.isConnected) {
        labels = [...this.internals.labels];
      }
      const descriptions = resolve("aria-describedby");
      this.textarea.removeAttribute("aria-labelledby");
      this.textarea.removeAttribute("aria-describedby");
      if (explicit) this.textarea.setAttribute("aria-label", explicit);
      else this.textarea.removeAttribute("aria-label");
      this.labelEl.hidden = !this.labelEl.textContent;
      if ("ariaLabelledByElements" in this.textarea) {
        this.textarea.ariaLabelledByElements = labels;
      } else if (!explicit && labels.length) {
        this.textarea.setAttribute("aria-label", labels.map((element) => element.getAttribute("aria-label") || element.textContent).join(" ").trim());
      }
      if ("ariaDescribedByElements" in this.textarea) {
        this.textarea.ariaDescribedByElements = descriptions;
      } else if (descriptions.length) {
        if (!this._descriptionMirror) {
          this._descriptionMirror = document.createElement("span");
          this._descriptionMirror.id = this.generateId();
          this._descriptionMirror.hidden = true;
          this.shadowRoot.append(this._descriptionMirror);
        }
        this._descriptionMirror.textContent = descriptions.map((element) => element.textContent).join(" ").trim();
        this.textarea.setAttribute("aria-describedby", this._descriptionMirror.id);
      }
    }
    disconnectedCallback() {
      var _a;
      (_a = this._referenceObserver) == null ? void 0 : _a.disconnect();
    }
    _syncFormValue() {
      this.internals.setFormValue(this.textarea.value);
      this._syncValidity();
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
  function auTreeRecords(value, ancestors = /* @__PURE__ */ new Set()) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item) && !ancestors.has(item)) : [];
  }
  class AuTree extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._data = [];
      this._nodeRegistry = [];
      this._activeNode = null;
      this._toggleLabel = null;
      this._typeBuffer = "";
      this._typeTime = 0;
      this.shadowRoot.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host { display:block; min-width:0; font-family:var(--au-tree-text-family);
          font-size:var(--au-tree-font-size,1rem); color:var(--au-tree-color,oklch(0.1398 0 0)); }
        [role=tree] { margin:0; padding:0; min-width:0; }
        [role=tree]:focus-visible { outline:2px solid var(--au-tree-focus-shadow-color,oklch(0.4 0 0)); }
        @media (forced-colors:active) { [role=tree]:focus-visible {outline-color:Highlight;} }
      </style><div role="tree" tabindex="-1"></div>`;
      this._container = this.shadowRoot.querySelector("[role=tree]");
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleFocusIn = this.handleFocusIn.bind(this);
      this.handleNodeExpand = this.handleNodeExpand.bind(this);
      this.handleNodeCheckChange = this.handleNodeCheckChange.bind(this);
    }
    static get observedAttributes() {
      return ["show-checkbox", "data-text-node", "data-text-toggle", "aria-label", "aria-labelledby"];
    }
    connectedCallback() {
      for (const prop of ["data", "toggleLabel", "fallbackNodeLabel", "toggleLabelTemplate"]) this._upgradeProperty(prop);
      this.addEventListener("keydown", this.handleKeyDown);
      this.addEventListener("focusin", this.handleFocusIn);
      this.addEventListener("au-tree-node-expand", this.handleNodeExpand);
      this.addEventListener("au-tree-node-check-change", this.handleNodeCheckChange);
      if (!this._rendered) this.render();
      else {
        this.syncAccessibleLabel();
        this.updateNodeRegistry();
      }
      this.observeLabelRoot();
    }
    disconnectedCallback() {
      var _a;
      this.removeEventListener("keydown", this.handleKeyDown);
      this.removeEventListener("focusin", this.handleFocusIn);
      this.removeEventListener("au-tree-node-expand", this.handleNodeExpand);
      this.removeEventListener("au-tree-node-check-change", this.handleNodeCheckChange);
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      this._typeBuffer = "";
    }
    _upgradeProperty(prop) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || !this._container) return;
      if (name === "aria-label" || name === "aria-labelledby") {
        this.syncAccessibleLabel();
        if (this.isConnected && name === "aria-labelledby") this.observeLabelRoot();
      } else {
        const { activeNode, activeElement } = this.findActiveNode();
        this._container.setAttribute("aria-multiselectable", String(this.hasAttribute("show-checkbox")));
        for (const node of this.getAllNodes()) node.syncPresentation();
        if (activeNode && (activeElement == null ? void 0 : activeElement.hidden)) activeNode.focus();
        this.updateNodeRegistry();
      }
    }
    get data() {
      return this._data;
    }
    set data(value) {
      this._data = Array.isArray(value) ? value : [];
      this.render();
    }
    get toggleLabel() {
      return this._toggleLabel;
    }
    set toggleLabel(value) {
      this._toggleLabel = value;
      for (const node of this.getAllNodes()) node.syncPresentation();
    }
    get fallbackNodeLabel() {
      return this.getAttribute("data-text-node") || "Node";
    }
    set fallbackNodeLabel(value) {
      this.setAttribute("data-text-node", value || "Node");
    }
    get toggleLabelTemplate() {
      return this.getAttribute("data-text-toggle");
    }
    set toggleLabelTemplate(value) {
      if (value == null) this.removeAttribute("data-text-toggle");
      else this.setAttribute("data-text-toggle", value);
    }
    observeLabelRoot() {
      var _a, _b;
      (_a = this._labelObserver) == null ? void 0 : _a.disconnect();
      if (!((_b = this.getAttribute("aria-labelledby")) == null ? void 0 : _b.trim())) return;
      this._labelObserver ?? (this._labelObserver = new MutationObserver(() => this.syncAccessibleLabel()));
      this._labelObserver.observe(this.getRootNode(), {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["id", "aria-label"]
      });
      this.syncAccessibleLabel();
    }
    syncAccessibleLabel() {
      var _a;
      const root = this.getRootNode();
      const ids = (this.getAttribute("aria-labelledby") || "").trim().split(/\s+/).filter(Boolean);
      const labels = ids.map((id) => {
        var _a2;
        return (_a2 = root.getElementById) == null ? void 0 : _a2.call(root, id);
      }).filter((el) => el && el !== this);
      const fallback = ((_a = this.getAttribute("aria-label")) == null ? void 0 : _a.trim()) || "Tree";
      if ("ariaLabelledByElements" in this._container) {
        this._container.ariaLabelledByElements = labels;
        this._container.setAttribute("aria-label", fallback);
      } else {
        const text = labels.map((el) => el.getAttribute("aria-label") || el.textContent).join(" ").trim();
        this._container.setAttribute("aria-label", text || fallback);
      }
    }
    static reconcile(container, data, tree, parent, ancestors = /* @__PURE__ */ new Set()) {
      const records = auTreeRecords(data, ancestors);
      const counts = /* @__PURE__ */ new Map();
      const idOf = (item) => typeof item.id === "string" && item.id !== "" || typeof item.id === "number" && Number.isFinite(item.id) ? item.id : void 0;
      for (const item of records) {
        const id = idOf(item);
        if (id !== void 0) counts.set(id, (counts.get(id) || 0) + 1);
      }
      const old = [...container.children];
      const available = /* @__PURE__ */ new Map();
      for (const node of old) {
        const bucket = available.get(node._identity) || [];
        bucket.push(node);
        available.set(node._identity, bucket);
      }
      const retained = /* @__PURE__ */ new Set();
      records.forEach((item, index) => {
        var _a;
        const id = idOf(item);
        const identity = id !== void 0 && counts.get(id) === 1 ? id : item;
        const node = ((_a = available.get(identity)) == null ? void 0 : _a.shift()) || document.createElement("au-tree-node");
        node._identity = identity;
        node._tree = tree;
        node.parentTreeNode = parent;
        node._level = parent ? parent._level + 1 : 1;
        node._position = index + 1;
        node._setSize = records.length;
        node.updateData(item, /* @__PURE__ */ new Set([...ancestors, item]));
        if (container.children[index] !== node) container.insertBefore(node, container.children[index] || null);
        retained.add(node);
      });
      for (const node of old) if (!retained.has(node)) {
        node.clearOwner();
        node.remove();
      }
    }
    render() {
      if (!this._container) return;
      this._rendered = true;
      const { activeNode, activeElement } = this.findActiveNode();
      this._rendering = true;
      try {
        AuTree.reconcile(this._container, this._data, this, null);
      } finally {
        this._rendering = false;
      }
      this.syncAccessibleLabel();
      this._container.setAttribute("aria-multiselectable", String(this.hasAttribute("show-checkbox")));
      this.updateNodeRegistry(activeNode || this._activeNode);
      if (activeNode) {
        const target = this._activeNode;
        if (target === activeNode && (activeElement == null ? void 0 : activeElement.isConnected) && !activeElement.hidden && !activeElement.disabled) {
          activeElement.focus({ preventScroll: true });
        } else (target || this._container).focus({ preventScroll: true });
      }
    }
    collectNodes(root, visibleOnly = false) {
      const nodes = [];
      for (const node of root.querySelectorAll("au-tree-node")) {
        nodes.push(node);
        if (!visibleOnly || node.expanded) nodes.push(...this.collectNodes(node.shadowRoot, visibleOnly));
      }
      return nodes;
    }
    getAllNodes() {
      return this.collectNodes(this.shadowRoot);
    }
    findActiveNode() {
      var _a;
      let activeElement = this.shadowRoot.activeElement;
      let activeNode = null;
      while (activeElement) {
        if (activeElement instanceof AuTreeNode) activeNode = activeElement;
        if (!((_a = activeElement.shadowRoot) == null ? void 0 : _a.activeElement)) break;
        activeElement = activeElement.shadowRoot.activeElement;
      }
      return { activeNode, activeElement };
    }
    updateNodeRegistry(preferred = this.findActiveNode().activeNode || this._activeNode) {
      this._nodeRegistry = this.collectNodes(this.shadowRoot, true);
      while (preferred && !this._nodeRegistry.includes(preferred)) preferred = preferred.parentTreeNode;
      this._activeNode = preferred || this._nodeRegistry[0] || null;
      for (const node of this.getAllNodes()) node.tabIndex = node === this._activeNode ? 0 : -1;
    }
    focusNode(node, options) {
      if (!this._nodeRegistry.includes(node)) return;
      this.updateNodeRegistry(node);
      node.focus(options);
    }
    focus(options) {
      this.updateNodeRegistry();
      (this._activeNode || this._container).focus(options);
    }
    handleFocusIn(event) {
      const node = event.composedPath().find((item) => item instanceof AuTreeNode);
      if ((node == null ? void 0 : node._tree) === this) this.updateNodeRegistry(node);
    }
    handleNodeExpand(event) {
      if (event.target === this) return;
      const { activeNode } = this.findActiveNode();
      this.updateNodeRegistry();
      if (activeNode && !this._nodeRegistry.includes(activeNode)) this.focusNode(this._activeNode);
    }
    handleNodeCheckChange(event) {
      var _a, _b;
      if (((_b = (_a = event.detail) == null ? void 0 : _a.node) == null ? void 0 : _b._tree) !== this) return;
      const checkedNodes = this.getAllNodes().filter((node) => node.checked && !node.indeterminate).map((node) => node.data);
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { checkedNodes } }));
    }
    handleKeyDown(event) {
      var _a;
      const current = event.composedPath().find((item) => item instanceof AuTreeNode);
      if ((current == null ? void 0 : current._tree) !== this || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      this.updateNodeRegistry(current);
      const index = this._nodeRegistry.indexOf(current);
      let target;
      const rtl = getComputedStyle(current).direction === "rtl";
      const key = rtl && event.key === "ArrowRight" ? "ArrowLeft" : rtl && event.key === "ArrowLeft" ? "ArrowRight" : event.key;
      switch (key) {
        case "ArrowDown":
          target = this._nodeRegistry[index + 1];
          break;
        case "ArrowUp":
          target = this._nodeRegistry[index - 1];
          break;
        case "ArrowRight":
          if (current.hasChildren) {
            if (!current.expanded) current.setExpanded(true);
            else target = current.childNodesList[0];
          }
          break;
        case "ArrowLeft":
          if (current.expanded) current.setExpanded(false);
          else target = current.parentTreeNode;
          break;
        case "Home":
          target = this._nodeRegistry[0];
          break;
        case "End":
          target = this._nodeRegistry.at(-1);
          break;
        case "*":
          for (const sibling of ((_a = current.parentTreeNode) == null ? void 0 : _a.childNodesList) || [...this._container.children]) sibling.setExpanded(true);
          break;
        default:
          if (event.key.length === 1 && /\S/.test(event.key)) {
            event.preventDefault();
            this.handleTypeAhead(event.key, index);
          }
          return;
      }
      event.preventDefault();
      this._typeBuffer = "";
      if (target) this.focusNode(target);
    }
    handleTypeAhead(char, index) {
      const now = Date.now();
      this._typeBuffer = now - this._typeTime < 700 ? this._typeBuffer + char.toLowerCase() : char.toLowerCase();
      this._typeTime = now;
      const repeated = [...this._typeBuffer].every((letter) => letter === this._typeBuffer[0]);
      const term = repeated ? char.toLowerCase() : this._typeBuffer;
      const nodes = this._nodeRegistry;
      const start = term.length > 1 ? index : index + 1;
      for (let offset = 0; offset < nodes.length; offset++) {
        const node = nodes[(start + offset) % nodes.length];
        if (node.label.toLowerCase().startsWith(term)) {
          this.focusNode(node);
          break;
        }
      }
    }
    expandAllChildren() {
      for (const node of this._container.children) node.setExpanded(true);
    }
  }
  class AuTreeNode extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._data = {};
      this._expanded = false;
      this._checked = false;
      this._indeterminate = false;
      this._toggleLabel = null;
      this._fallbackNodeLabel = "Node";
      this._toggleLabelTemplate = null;
      this.shadowRoot.innerHTML = `
      <style>
      :host([hidden]:not([hidden="until-found" i])) { display: none; }
        :host {display:block;min-width:0;outline:none;}
        [hidden] {display:none!important;}
        .node-content {
          display:flex;align-items:center;min-width:0;box-sizing:border-box;
          gap:var(--au-tree-node-padding-horizontal,0.25rem);
          padding:var(--au-tree-node-padding-vertical,0.25rem) var(--au-tree-node-padding-horizontal,0.25rem);
          background:var(--au-tree-node-bg,transparent);
          border:var(--au-tree-node-border-width,0) var(--au-tree-node-border-style,solid) var(--au-tree-node-border-color,oklch(0.55 0 0));
          border-radius:var(--au-tree-node-border-radius,0);
          color:var(--au-tree-node-text-color,oklch(0.1398 0 0));
          font:inherit;font-family:var(--au-tree-node-text-family,inherit);
          font-size:var(--au-tree-node-text-size,1rem);line-height:var(--au-tree-node-text-line-height,1.5);
        }
        .node-content:hover {background:var(--au-tree-node-hover-bg,oklch(0.9466 0 0));border-color:var(--au-tree-node-hover-border-color,oklch(0.55 0 0));}
        .node-content:active {background:var(--au-tree-node-active-bg,oklch(0.8689 0 0));}
        :host(:focus) > .node-content,.node-content:focus-within {
          outline:var(--au-tree-focus-shadow-width,3px) solid var(--au-tree-focus-shadow-color,oklch(0.4 0 0));outline-offset:-3px;
        }
        .toggle-btn {
          display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
          min-width:24px;min-height:24px;width:var(--au-tree-node-toggle-btn-size,2rem);height:var(--au-tree-node-toggle-btn-size,2rem);
          padding:0;border:0;background:transparent;color:inherit;cursor:pointer;
        }
        .toggle-btn.hidden {visibility:hidden;pointer-events:none;}
        .toggle-icon {width:var(--au-tree-node-toggle-icon-size,1rem);height:var(--au-tree-node-toggle-icon-size,1rem);transition:transform 150ms ease;}
        :host([aria-expanded=true]) .toggle-icon {transform:rotate(90deg);}
        :host(:dir(rtl)) .toggle-icon {transform:rotate(180deg);}
        :host(:dir(rtl)[aria-expanded=true]) .toggle-icon {transform:rotate(90deg);}
        .label {display:flex;align-items:center;min-width:0;gap:var(--au-tree-node-checkbox-content-gap,0.375rem);cursor:pointer;}
        .text {min-width:0;overflow-wrap:anywhere;font-size:var(--au-tree-node-checkbox-label-text-size,inherit);}
        .label:active {color:var(--au-tree-node-checkbox-label-active-text-color,oklch(0.537 0 0));}
        :host([aria-disabled=true]) .label {cursor:not-allowed;color:var(--au-tree-node-checkbox-label-disabled-text-color,oklch(0.537 0 0));}
        .checkmark {
          appearance:none;box-sizing:border-box;flex-shrink:0;min-width:24px;min-height:24px;
          width:var(--au-tree-node-checkbox-input-width,1.5rem);height:var(--au-tree-node-checkbox-input-height,1.5rem);
          margin:0;border:var(--au-tree-node-checkbox-input-border-width,1px) var(--au-tree-node-checkbox-input-border-style,solid) var(--au-tree-node-checkbox-input-border-color,oklch(0.4 0 0));
          border-radius:var(--au-tree-node-checkbox-input-border-radius,0.25rem);
          background:var(--au-tree-node-checkbox-input-bg,oklch(0.994 0 0));cursor:pointer;
        }
        :host([aria-disabled=true]) .checkmark {cursor:not-allowed;}
        :host([checked]) .checkmark,:host([indeterminate]) .checkmark {display:grid;place-content:center;background:var(--au-tree-node-checkbox-input-checked-bg,oklch(0.1398 0 0));}
        :host([checked]) .checkmark::before {content:var(--au-tree-node-checkbox-input-checked-symbol,'✔');}
        :host([indeterminate]) .checkmark::before {content:var(--au-tree-node-checkbox-input-indeterminate-symbol,'−');}
        .checkmark::before {color:var(--au-tree-node-checkbox-input-checked-text-color,oklch(0.994 0 0));font-size:var(--au-tree-node-checkbox-input-checked-text-size,1.125rem);}
        :host(:focus-visible) .checkmark {outline:var(--au-tree-node-checkbox-input-focus-shadow-width,3px) solid var(--au-tree-node-checkbox-input-focus-shadow-color,oklch(0.4 0 0));outline-offset:1px;}
        [role=group] {padding-inline-start:var(--au-tree-indent,1.5rem);margin:0;min-width:0;}
        @media(forced-colors:active) {
          :host(:focus) > .node-content,.node-content:focus-within,:host(:focus-visible) .checkmark {outline:2px solid Highlight;outline-offset:-2px;}
          .checkmark {forced-color-adjust:none;background:Canvas;border-color:CanvasText;}
          :host([checked]) .checkmark,:host([indeterminate]) .checkmark {background:Highlight;}
          .checkmark::before {color:HighlightText;}
          :host([aria-disabled=true]) .checkmark {border-color:GrayText;}
        }
        @media(prefers-reduced-motion:reduce) {.toggle-icon {transition:none;}}
      </style>
      <div class="node-content">
        <button type="button" class="toggle-btn" tabindex="-1"><svg class="toggle-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
        <span class="label"><span class="checkmark" aria-hidden="true"></span><span class="text"></span></span>
      </div><div role="group" hidden inert></div>`;
      this._row = this.shadowRoot.querySelector(".node-content");
      this._group = this.shadowRoot.querySelector("[role=group]");
      this._checkmark = this.shadowRoot.querySelector(".checkmark");
      this._button = this.shadowRoot.querySelector("button");
      this._text = this.shadowRoot.querySelector(".text");
      this._button.addEventListener("click", () => {
        this.setExpanded(!this.expanded);
        this.focus();
      });
      this._row.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        this.focus();
        if (this.hasCheckbox) this.toggleCheck();
        else if (this.hasChildren) this.setExpanded(!this.expanded);
      });
      this.addEventListener("click", (event) => {
        if (event.composedPath()[0] !== this) return;
        this.focus();
        if (this.hasCheckbox) this.toggleCheck();
        else if (this.hasChildren) this.setExpanded(!this.expanded);
      });
      this.addEventListener("keydown", (event) => {
        if (event.composedPath()[0] !== this || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === " " && this.hasCheckbox) this.toggleCheck();
          else if (this.hasChildren) this.setExpanded(!this.expanded);
        }
      });
    }
    static get observedAttributes() {
      return ["expanded", "checked", "indeterminate", "show-checkbox"];
    }
    connectedCallback() {
      this.syncPresentation();
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue || this._syncing) return;
      if (name === "expanded") this.setExpanded(newValue !== null);
      else if (name === "checked") this.setChecked(newValue !== null, this.indeterminate);
      else if (name === "indeterminate") this.setChecked(this.checked, newValue !== null);
      else this.syncPresentation();
    }
    get data() {
      return this._data;
    }
    set data(value) {
      if (this._tree && !this._tree._rendering) {
        const { activeNode, activeElement } = this._tree.findActiveNode();
        this.updateData(value, /* @__PURE__ */ new Set([value]));
        this._tree.updateNodeRegistry(activeNode);
        if (activeNode && (activeElement == null ? void 0 : activeElement.isConnected)) activeElement.focus({ preventScroll: true });
      } else this.updateData(value, /* @__PURE__ */ new Set([value]));
    }
    get childNodesList() {
      return [...this._group.children];
    }
    get hasChildren() {
      return this._group.childElementCount > 0;
    }
    get hasCheckbox() {
      return this._tree ? this._tree.hasAttribute("show-checkbox") : this.hasAttribute("show-checkbox");
    }
    get disabled() {
      var _a;
      return !!this._data.disabled || !!((_a = this.parentTreeNode) == null ? void 0 : _a.disabled);
    }
    get label() {
      return this.getLabelText();
    }
    get expanded() {
      return this._expanded;
    }
    set expanded(value) {
      this.setExpanded(value);
    }
    get checked() {
      return this._checked;
    }
    set checked(value) {
      this.setChecked(value, this.indeterminate);
    }
    get indeterminate() {
      return this._indeterminate;
    }
    set indeterminate(value) {
      this.setChecked(this.checked, value);
    }
    get toggleLabel() {
      var _a;
      return ((_a = this._tree) == null ? void 0 : _a.toggleLabel) ?? this._toggleLabel;
    }
    set toggleLabel(value) {
      this._toggleLabel = value;
      this.syncPresentation();
      for (const child of this.childNodesList) child.toggleLabel = value;
    }
    get fallbackNodeLabel() {
      var _a;
      return ((_a = this._tree) == null ? void 0 : _a.fallbackNodeLabel) || this._fallbackNodeLabel;
    }
    set fallbackNodeLabel(value) {
      this._fallbackNodeLabel = value || "Node";
      this.syncPresentation();
      for (const child of this.childNodesList) child.fallbackNodeLabel = value;
    }
    get toggleLabelTemplate() {
      var _a;
      return ((_a = this._tree) == null ? void 0 : _a.toggleLabelTemplate) ?? this._toggleLabelTemplate;
    }
    set toggleLabelTemplate(value) {
      this._toggleLabelTemplate = value;
      this.syncPresentation();
      for (const child of this.childNodesList) child.toggleLabelTemplate = value;
    }
    getLabelText() {
      return this._data.label == null || this._data.label === "" ? this.fallbackNodeLabel : String(this._data.label);
    }
    clearOwner() {
      this._tree = null;
      for (const child of this.childNodesList) child.clearOwner();
    }
    updateData(value, ancestors) {
      this._data = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      if ("checked" in this._data) this._checked = !!this._data.checked;
      if ("expanded" in this._data) this._expanded = !!this._data.expanded;
      AuTree.reconcile(this._group, this._data.children, this._tree, this, ancestors);
      if (!this.hasChildren) {
        this._expanded = false;
        this._indeterminate = false;
      } else this.updateStateFromChildren();
      this.syncPresentation();
    }
    syncPresentation() {
      const text = this.getLabelText();
      this.setAttribute("role", "treeitem");
      this.setAttribute("aria-label", text);
      this.setAttribute("aria-disabled", String(this.disabled));
      this.setAttribute("aria-level", String(this._level || 1));
      this.setAttribute("aria-posinset", String(this._position || 1));
      this.setAttribute("aria-setsize", String(this._setSize || 1));
      this._syncing = true;
      this.toggleAttribute("expanded", this.hasChildren && this.expanded);
      this.toggleAttribute("checked", this.checked);
      this.toggleAttribute("indeterminate", this.indeterminate);
      this._syncing = false;
      if (this.hasChildren) this.setAttribute("aria-expanded", String(this.expanded));
      else this.removeAttribute("aria-expanded");
      if (this.hasCheckbox) this.setAttribute("aria-checked", this.indeterminate ? "mixed" : String(this.checked));
      else this.removeAttribute("aria-checked");
      this._text.textContent = text;
      const custom = this.toggleLabel;
      const toggleText = typeof custom === "function" ? custom(this._data) : (this.toggleLabelTemplate || "Toggle {label}").replaceAll("{label}", text);
      this._button.setAttribute("aria-label", String(toggleText));
      this._button.classList.toggle("hidden", !this.hasChildren);
      this._button.setAttribute("aria-hidden", String(!this.hasChildren));
      this._checkmark.hidden = !this.hasCheckbox;
      this._group.hidden = !this.hasChildren || !this.expanded;
      this._group.inert = this._group.hidden;
      if (this._data.lang) this.setAttribute("lang", String(this._data.lang));
      else this.removeAttribute("lang");
    }
    setExpanded(value) {
      const next = !!value && this.hasChildren;
      if (next === this.expanded) {
        this.syncPresentation();
        return;
      }
      const tree = this._tree;
      const active = tree == null ? void 0 : tree.findActiveNode().activeNode;
      this._expanded = next;
      this.syncPresentation();
      if (tree) {
        tree.updateNodeRegistry(active || tree._activeNode);
        if (active && !tree._nodeRegistry.includes(active)) tree.focusNode(tree._activeNode);
      }
      this.dispatchEvent(new CustomEvent("au-tree-node-expand", { bubbles: true, composed: true }));
    }
    expandAllChildren() {
      this.setExpanded(true);
      for (const child of this.childNodesList) child.setExpanded(true);
    }
    setChecked(value, indeterminate = false) {
      this._checked = !!value;
      this._indeterminate = !!indeterminate;
      this.syncPresentation();
    }
    setChildrenChecked(value) {
      for (const child of this.childNodesList) {
        if (child.disabled) continue;
        child.setChecked(value);
        child.setChildrenChecked(value);
      }
    }
    updateStateFromChildren() {
      const children = this.childNodesList.filter((child) => !child.disabled);
      if (!children.length) return;
      const all = children.every((child) => child.checked && !child.indeterminate);
      const none = children.every((child) => !child.checked && !child.indeterminate);
      this.setChecked(all, !all && !none);
    }
    toggleCheck(value = null) {
      if (!this.hasCheckbox || this.disabled) {
        this.syncPresentation();
        return;
      }
      const tree = this._tree;
      const before = tree == null ? void 0 : tree.getAllNodes().map((node) => [node.checked, node.indeterminate].join(":")).join(",");
      const next = value == null ? !this.checked : !!value;
      this.setChecked(next);
      this.setChildrenChecked(next);
      let parent = this.parentTreeNode;
      while (parent) {
        parent.updateStateFromChildren();
        parent = parent.parentTreeNode;
      }
      const after = tree == null ? void 0 : tree.getAllNodes().map((node) => [node.checked, node.indeterminate].join(":")).join(",");
      if (tree && before === after) return;
      this.dispatchEvent(new CustomEvent("au-tree-node-check-change", { bubbles: true, composed: true, detail: { checked: this.checked, node: this } }));
    }
  }
  if (typeof customElements !== "undefined") {
    if (!customElements.get("au-tree-node")) customElements.define("au-tree-node", AuTreeNode);
    if (!customElements.get("au-tree")) customElements.define("au-tree", AuTree);
  }
})();
