// au-tabs.js
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
      .au-tabs-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
      }

      .au-tabs__item {
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

      [role="tab"] {
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
      }
    `;


    this.tabsList = document.createElement("ul");
    this.tabsList.setAttribute("role", "tablist");
    this.tabsList.classList.add("au-tabs-list");

    this.panelsContainer = document.createElement("div");
    this.panelsContainer.classList.add("au-tabs-panels");

    this.container.append(style, this.tabsList, this.panelsContainer);
    this.shadowRoot.appendChild(this.container);
  }

  connectedCallback() {
    this._renderTabs();
    this._attachEvents();
  }

  _renderTabs() {
    const tabPanels = Array.from(this.querySelectorAll("au-tab-panel"));
    this._tabs = [];
    this._panels = [];
    this.tabsList.innerHTML = "";
    this.panelsContainer.innerHTML = "";

    tabPanels.forEach((panel, index) => {
      const label = panel.getAttribute("label") || `Tab ${index + 1}`;
      const prefix = panel.getAttribute("prefix") || "prefix";
      const badge = panel.getAttribute("badge") || "new";
      const affix = panel.getAttribute("affix") || "affix";
      const id = panel.id || this.generateId();

      const tabId = `tab-${index + 1}-${id}`;
      const panelId = `tab-panel-${index + 1}-${id}`;

      // Create tab button
      const li = document.createElement("li");
      li.setAttribute("role", "presentation");
      li.className = "au-tabs__item" + (index === 0 ? " au-tabs__item--selected" : "");

      const button = document.createElement("button");
      button.setAttribute("role", "tab");
      button.setAttribute("id", tabId);
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-posinset", index + 1);
      button.setAttribute("aria-setsize", tabPanels.length);
      button.setAttribute("tabindex", index === 0 ? "0" : "-1");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");

      button.innerHTML = `
        <span class="au-prefix">${prefix}</span>
        <span>${label}</span>
        <span class="au-badge" aria-label="補充資訊：${badge}">${badge}</span>
        <span class="au-affix">${affix}</span>
      `;

      li.appendChild(button);
      this.tabsList.appendChild(li);

      // Create panel
      const panelDiv = document.createElement("div");
      panelDiv.setAttribute("id", panelId);
      panelDiv.setAttribute("role", "tabpanel");
      panelDiv.setAttribute("aria-labelledby", tabId);
      panelDiv.setAttribute("tabindex", "0");
      panelDiv.className = "au-tabs-panel" + (index === 0 ? " au-tabs-panel--selected" : "");
      if (index !== 0) panelDiv.hidden = true;
      panelDiv.textContent = panel.textContent;

      this._tabs.push(button);
      this._panels.push(panelDiv);

      this.panelsContainer.appendChild(panelDiv);
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
      tab.parentElement.classList.toggle("au-tabs__item--selected", selected);
      this._panels[i].hidden = !selected;
      this._panels[i].classList.toggle("au-tabs-panel--selected", selected);
    });
    this._tabs[index].focus();
    this._selectedIndex = index;
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `${byteArray[0].toString(36)}`;
  }

  _onKeydown(e, index) {
    const lastIndex = this._tabs.length - 1;
    let newIndex = index;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        newIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        newIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = lastIndex;
        break;
      case "Tab":
        e.preventDefault();
        this._panels[index].focus();
        return;
    }
    if (newIndex !== index) {
      e.preventDefault();
      this._selectTab(newIndex);
    }
  }
}

customElements.define("au-tabs", AuTabs);

class AuTabPanel extends HTMLElement {}
customElements.define("au-tab-panel", AuTabPanel);
