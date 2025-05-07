class AuTabs extends HTMLElement {
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
            border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
            border-top-right-radius: var(--au-tabs-border-radius, 0);
          }
        }
      }

      button[role="tab"] {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0% 0 0 / 0);

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.25rem;
        padding: var(--au-tabs-padding-vertical, 0.75rem) var(--au-tabs-padding-horizontal, 1rem);

        /* border */
        border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
        border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) oklch(var(--au-tabs-border-color, 78.94% 0 0));
        border-right: 0;
        border-bottom: 0;

        /* text */
        color: oklch(var(--au-tabs-text-color, 13.98% 0 0));
        font-size: var(--au-tabs-text-size, 1rem);
        font-family: var(--au-tabs-text-family, 'Helvetica, Arial, sans-serif, system-ui');
        line-height: var(--au-tabs-text-line-height, 1.5);

        /* background */
        background-color: oklch(var(--au-tabs-bg, 97.31% 0 0));
        transition: background-color 120ms ease-in;

        &:hover {
          background-color: oklch(var(--au-tabs-hover-bg, 94.66% 0 0));
        }
        
        &:active {
          background-color: oklch(var(--au-tabs-active-bg, 86.89% 0 0));
        }

        &[aria-selected="true"] {
          paint-order: stroke fill;
          -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) oklch(var(--au-tabs-selected-text-stroke-color, 99.4% 0 0));
          box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) oklch(var(--au-tabs-selected-shadow-color, 78.94% 0 0));
          background-color: oklch(var(--au-tabs-selected-bg, 13.98% 0 0));
          color: oklch(var(--au-tabs-selected-text-color, 99.4% 0 0));
        }

        /* focusd */
        &:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) oklch(var(--au-tabs-focus-shadow-color, 83.15% 0.15681888825079074 78.05241467152487));
        }
      }

      .au-tabpanels {
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) oklch(var(--au-tabpanels-border-color, 78.94% 0 0));
      }

      .au-tab-panel {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
      }

      .badge {
        background-color: oklch(var(--au-tab-badge-bg, 86.89% 0 0));
        color: oklch(var(--au-tab-badge-text-color, 13.98% 0 0));
        padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.5rem);
        border-radius: var(--au-tab-badge-border-radius, 0.75rem);
      }

       ::slotted(.au-tab-panel) {
        padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
        display: none;
        border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) oklch(var(--au-tabpanels-border-color, 78.94% 0 0));
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
    this._renderTabs();
    this._attachEvents();
  }

  _renderTabs() {
    const tabPanels = Array.from(this.querySelectorAll(':scope > .au-tab-panel[slot="panel"]'));
    this._tabs = [];
    this._panels = [];
    this.tabsList.innerHTML = "";

    tabPanels.forEach((panel, index) => {
      const label = panel.getAttribute("label") || `Tab ${index + 1}`;
      const prefix = panel.getAttribute("data-prefix") || "";
      const badge = panel.getAttribute("data-badge") || "";
      const affix = panel.getAttribute("data-affix") || "";
      const id = panel.id || this.generateId();
      const tabId = `tab-${id}`;
      const panelId = `panel-${id}`;

      panel.setAttribute("id", panelId);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.setAttribute("aria-hidden", index === 0 ? "false" : "true");

      const li = document.createElement("li");
      li.setAttribute("role", "presentation");
      li.className = "au-tablist-item" + (index === 0 ? " au-tablist-item--selected" : "");

      const button = document.createElement("button");
      button.setAttribute("role", "tab");
      button.setAttribute("id", tabId);
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.setAttribute("tabindex", index === 0 ? "0" : "-1");

      const frag = document.createDocumentFragment();

      if (prefix) {
        const span = document.createElement("span");
        span.className = "prefix";
        span.textContent = prefix;
        frag.appendChild(span);
      }

      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      labelSpan.textContent = label;
      frag.appendChild(labelSpan);

      if (badge) {
        const span = document.createElement("span");
        span.className = "badge";
        span.setAttribute("aria-label", `補充資訊：${badge}`);
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
  }

  _attachEvents() {
    this._tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this._selectTab(index));
      tab.addEventListener("keydown", (e) => this._onKeydown(e, index));
    });
  }

  _selectTab(index) {
    this._tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", selected);
      tab.setAttribute("tabindex", selected ? "0" : "-1");
      tab.parentElement.classList.toggle("au-tablist-item--selected", selected);
      this._panels[i].setAttribute("aria-hidden", !selected);
    });
    this._tabs[index].focus();
    this._selectedIndex = index;
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

  generateId() {
    const bytes = new Uint32Array(1);
    window.crypto.getRandomValues(bytes);
    return bytes[0].toString(36);
  }
}

customElements.define("au-tabs", AuTabs);
