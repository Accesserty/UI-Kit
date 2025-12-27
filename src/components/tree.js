class AuTree extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = [];
    this._nodeRegistry = [];
    this._showCheckbox = false;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNodeExpand = this.handleNodeExpand.bind(this);
    this.handleNodeCheckChange = this.handleNodeCheckChange.bind(this);
    this._toggleLabel = null;
  }

  static get observedAttributes() {
    return ['show-checkbox'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'show-checkbox') {
      this._showCheckbox = newValue !== null;
      // 傳播到所有現有的節點
      this.getAllNodes().forEach(node => {
        if (this._showCheckbox) node.setAttribute('show-checkbox', '');
        else node.removeAttribute('show-checkbox');
      });
    }
  }

  get toggleLabel() { return this._toggleLabel; }
  set toggleLabel(val) {
    this._toggleLabel = val;
    this.getAllNodes().forEach(node => {
      node.toggleLabel = val;
    });
  }

  get data() { return this._data; }
  set data(val) {
    this._data = val;
    this.render();
  }

  connectedCallback() {
    this._upgradeProperty('data');
    if (this.shadowRoot.innerHTML === '') this.render();
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('au-tree-node-expand', this.handleNodeExpand);
    this.addEventListener('au-tree-node-check-change', this.handleNodeCheckChange);
  }

  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  generateId() {
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    return `au-tree-${byteArray[0].toString(36)}`;
  }

  render() {
    const treeId = this.generateId();
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--au-tree-font-family, system-ui, -apple-system, sans-serif);
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
      this._data.forEach(item => {
        const node = document.createElement('au-tree-node');
        node.data = item; // 傳遞資料物件
        node.toggleLabel = this._toggleLabel; // 傳遞 toggleLabel 設定
        if (this._showCheckbox) node.setAttribute('show-checkbox', '');
        rootContainer.appendChild(node);
      });
    }

    // 初始化註冊表
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
    const children = Array.from(root.querySelectorAll('au-tree-node'));
    children.forEach(node => {
      nodes.push(node);
      // 如果 visibleOnly 為 true，則僅在展開時遍歷
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
    // 管理 tabindex：嚴格保持只有一個 "0"，其餘為 "-1"
    const activeInfo = this.findActiveNode();
    this._nodeRegistry.forEach(node => node.tabIndex = -1);

    if (activeInfo.activeNode && this._nodeRegistry.includes(activeInfo.activeNode)) {
      activeInfo.activeNode.tabIndex = 0;
    } else if (this._nodeRegistry.length > 0) {
      this._nodeRegistry[0].tabIndex = 0;
    }
  }

  findActiveNode() {
    // 尋找當前有焦點或 tabindex=0 的元素
    let focused = this.shadowRoot.activeElement;
    while (focused && focused.shadowRoot && focused.shadowRoot.activeElement) {
      focused = focused.shadowRoot.activeElement;
    }
    return { activeNode: focused instanceof AuTreeNode ? focused : null };
  }

  handleKeyDown(e) {
    const current = e.composedPath().find(el => el instanceof AuTreeNode);
    if (!current) return;

    // 重新整理註冊表以確保準確性
    this.updateNodeRegistry();
    const index = this._nodeRegistry.indexOf(current);

    let target = null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < this._nodeRegistry.length - 1) target = this._nodeRegistry[index + 1];
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) target = this._nodeRegistry[index - 1];
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (current.hasChildren) {
          if (!current.expanded) {
            current.setExpanded(true);
            this.updateNodeRegistry();
          } else {
            // 移至第一個子節點
            if (index < this._nodeRegistry.length - 1) target = this._nodeRegistry[index + 1];
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (current.hasChildren && current.expanded) {
          current.setExpanded(false);
          this.updateNodeRegistry();
          current.setExpanded(false);
          this.updateNodeRegistry();
          target = current; // 保持焦點
        } else {
          // 返回父節點
          const parent = current.getRootNode().host;
          if (parent instanceof AuTreeNode) target = parent;
        }
        break;
      case 'Home':
        e.preventDefault();
        if (this._nodeRegistry.length > 0) target = this._nodeRegistry[0];
        break;
      case 'End':
        e.preventDefault();
        if (this._nodeRegistry.length > 0) target = this._nodeRegistry[this._nodeRegistry.length - 1];
        break;
      case '*':
        e.preventDefault();
        // 使用者請求：展開所有同級節點
        const parent = current.getRootNode().host;
        if (parent && parent instanceof AuTreeNode) {
          parent.expandAllChildren();
        } else {
          // 根層級
          this.expandAllChildren();
        }
        this.updateNodeRegistry();
        break;
      default:
        // 預先輸入搜尋 (Type-ahead)
        if (e.key.length === 1 && e.key.match(/\S/)) {
          this.handleTypeAhead(e.key, index);
        }
        break;
    }

    if (target) {
      this._nodeRegistry.forEach(n => n.tabIndex = -1);
      target.tabIndex = 0;
      target.focus();
    }
  }

  handleTypeAhead(char, currentIndex) {
    char = char.toLowerCase();
    // 向後搜尋
    const fwd = this._nodeRegistry.slice(currentIndex + 1).find(n => n.label.toLowerCase().startsWith(char));
    if (fwd) {
      this.focusNode(fwd);
      return;
    }
    // 從頭循環搜尋
    const bwd = this._nodeRegistry.slice(0, currentIndex).find(n => n.label.toLowerCase().startsWith(char));
    if (bwd) {
      this.focusNode(bwd);
    }
  }

  focusNode(node) {
    this._nodeRegistry.forEach(n => n.tabIndex = -1);
    node.tabIndex = 0;
    node.focus();
  }

  expandAllChildren() {
    Array.from(this.shadowRoot.querySelectorAll('au-tree-node')).forEach(n => n.setExpanded(true));
  }

  handleNodeExpand() {
    // 邏輯在大多數情況下透過同步更新處理，
    // 但監聽器確保捕獲冒泡的更新。
  }

  handleNodeCheckChange(e) {
    // 根節點不需要在此處理特定邏輯，因為節點會處理傳播。
    // 如果需要，我們可以在此發出根層級的 'change' 事件來聚合所有資料。
    const checkedNodes = this.getAllNodes().filter(n => n.checked).map(n => n.data);
    this.dispatchEvent(new CustomEvent('change', { detail: { checkedNodes } }));
  }
}

class AuTreeNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = {};
    this.expanded = false;
    this.checked = false;
    this.indeterminate = false;
    this._initialized = false;
    this._uid = `au-tree-node-${Math.random().toString(36).substr(2, 9)}`;
    this._toggleLabel = null;
  }

  static get observedAttributes() {
    return ['expanded', 'show-checkbox', 'checked', 'indeterminate'];
  }

  get toggleLabel() { return this._toggleLabel; }
  set toggleLabel(val) {
    this._toggleLabel = val;
    this.renderContent();
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('au-tree-node').forEach(n => n.toggleLabel = val);
    }
  }

  get data() { return this._data; }
  set data(val) {
    this._data = val;
    this.render();
  }

  get label() { return this._data.label || ''; }
  get hasChildren() { return this._data.children && this._data.children.length > 0; }


  connectedCallback() {
    // 捕獲子節點的勾選變更（向上傳播）
    this.shadowRoot.addEventListener('au-tree-node-check-change', this.handleChildCheckChange.bind(this));

    this.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 透過委派處理內部互動
    this.shadowRoot.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = e.target;

      // 處理切換按鈕
      const toggleBtn = target.closest('.toggle-btn');
      if (toggleBtn && !toggleBtn.classList.contains('hidden')) {
        this.setExpanded(!this.expanded);
        this.focus(); // 確保 Host 獲得焦點
        return;
      }

      // 處理核取方塊 (Input)
      // 原生 input change 事件處理狀態，但 click 事件會冒泡。
      // 我們依賴 'change' 事件處理邏輯。
      // 然而，如果我們點擊 Label，它會觸發 Input 的點擊。
      // 如果 'change' 監聽器處理了它，我們不需要在這裡對 Checkbox 點擊做任何事。

      // 後備方案：如果點擊 node-content 中的空白處，將焦點設為 host
      if (target.closest('.node-content')) {
        // this.focus(); 
      }
    });

    // 監聽輸入變更（當點擊 Input 或 Label 時發生原生事件）
    // 委派迴圈對 'change' 效果不佳，因為它不會從 ShadowDOM 冒泡？
    // 等等，Input 的 'change' 事件會冒泡。
    this.shadowRoot.addEventListener('change', (e) => {
      const input = e.target;
      if (input.tagName === 'INPUT' && input.type === 'checkbox') {
        e.stopPropagation();
        this.toggleCheck(input.checked);
      }
    });

    this.addEventListener('keydown', (e) => {
      // 如果焦點在 Input 或 Button 上，我們讓它們自然處理 Enter/Space？
      // 使用者互動需求：「點擊按鈕展開/折疊」，「點擊 Input 勾選」。
      // 但為了 Tree Item (Host) 的無障礙功能，我們仍然需要快捷鍵。
      const target = e.composedPath()[0];
      const isInternalInteractive = target.tagName === 'INPUT' || target.tagName === 'BUTTON';

      if (isInternalInteractive) {
        // 讓原生行為發生（Space 切換 input，Enter 點擊按鈕）
        // 但方向鍵必須冒泡到 AuTree 以進行導航！
        // 核取方塊 input 通常不會消耗 Up/Down。
        return;
      }

      // 如果焦點在 Host (treeitem) 上：
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();

        if (this.hasAttribute('show-checkbox')) {
          // 標準樹狀行為：Space 切換動作（勾選）
          if (!isInternalInteractive) this.toggleCheck();
        } else {
          if (this.hasChildren) {
            this.setExpanded(!this.expanded);
          }
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        this.setExpanded(!this.expanded);
      }
    });
  }

  attributeChangedCallback(name, old, val) {
    if (!this._initialized) return;

    if (name === 'show-checkbox') {
      this.renderContent();
      // 傳播
      const children = this.shadowRoot.querySelectorAll('au-tree-node');
      children.forEach(c => {
        if (val !== null) c.setAttribute('show-checkbox', '');
        else c.removeAttribute('show-checkbox');
      });
    }
    // 如果手動更改屬性（內部邏輯中很少見），則反映 ARIA 狀態
  }

  setExpanded(state) {
    if (state === this.expanded) return;
    this.expanded = state;
    const group = this.shadowRoot.querySelector('div[role="group"]');
    const toggle = this.shadowRoot.querySelector('.toggle-icon');

    if (this.expanded) {
      this.setAttribute('aria-expanded', 'true');
      if (group) group.style.display = 'block';
      if (toggle) toggle.style.transform = 'rotate(90deg)';
    } else {
      this.setAttribute('aria-expanded', 'false');
      if (group) group.style.display = 'none';
      if (toggle) toggle.style.transform = 'rotate(0deg)';
    }
    this.dispatchEvent(new CustomEvent('au-tree-node-expand', { bubbles: true, composed: true }));
  }

  expandAllChildren() {
    this.setExpanded(true);
    Array.from(this.shadowRoot.querySelectorAll('au-tree-node')).forEach(n => n.expandAllChildren());
  }

  toggleCheck(forceState = null) {
    const newState = forceState !== null ? forceState : !this.checked;
    this.setChecked(newState);
    // 向下級聯
    this.setChildrenChecked(newState);

    // 向上發送
    this.dispatchEvent(new CustomEvent('au-tree-node-check-change', {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, node: this }
    }));
  }

  setChecked(state, indeterminate = false) {
    this.checked = state;
    this.indeterminate = indeterminate;

    // 更新 ARIA
    if (this.indeterminate) {
      this.setAttribute('aria-checked', 'mixed');
    } else {
      this.setAttribute('aria-checked', state ? 'true' : 'false');
    }

    // 更新視覺 input
    const input = this.shadowRoot.querySelector(`input#${this._uid}`);
    if (input) {
      input.checked = state;
      input.indeterminate = indeterminate;
    }
  }

  setChildrenChecked(state) {
    if (!this.hasChildren) return;
    const children = Array.from(this.shadowRoot.querySelectorAll('au-tree-node'));
    children.forEach(child => {
      child.setChecked(state);
      child.setChildrenChecked(state);
    });
  }

  handleChildCheckChange(e) {
    e.stopPropagation();
    this.updateStateFromChildren();
    // 進一步向上傳播
    this.dispatchEvent(new CustomEvent('au-tree-node-check-change', {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, node: this }
    }));
  }

  updateStateFromChildren() {
    const children = Array.from(this.shadowRoot.querySelectorAll('au-tree-node'));
    const allChecked = children.every(c => c.checked && !c.indeterminate);
    const allUnchecked = children.every(c => !c.checked && !c.indeterminate);

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
    const showCheckbox = this.hasAttribute('show-checkbox');

    // 結構： 
    // .node-content (框架)
    //   button.toggle-btn (如果有子節點)
    //   input (核取方塊)
    //   label (文字)

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
          font-family: var(--au-tree-node-text-family, 'Helvetica, Arial, sans-serif, system-ui');
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
            align-items: middle;
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
      ${this.hasChildren ? `<div role="group"></div>` : ''}
    `;

    this.renderContent();

    // 渲染子節點
    if (this.hasChildren) {
      const group = this.shadowRoot.querySelector('div[role="group"]');
      children.forEach(childData => {
        const childNode = document.createElement('au-tree-node');
        childNode.data = childData;
        childNode.toggleLabel = this._toggleLabel;
        if (showCheckbox) childNode.setAttribute('show-checkbox', '');
        group.appendChild(childNode);
      });
    }

    // Host 上的 ARIA 配置
    this.setAttribute('role', 'treeitem');
    if (this.hasChildren) {
      this.setAttribute('aria-expanded', 'false');
    }
    if (showCheckbox) {
      this.setAttribute('aria-checked', 'false');
    }
  }

  renderContent() {
    const container = this.shadowRoot.querySelector('.node-content');
    if (!container) return;
    const showCheckbox = this.hasAttribute('show-checkbox');
    const labelText = this._data.label || 'Node'; // 取得純文字標籤

    // 1. 修正：直接在 Host 上設定 aria-label，解決 Shadow DOM 邊界問題
    this.setAttribute('aria-label', labelText);
    const arrowIcon = `<svg class="toggle-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" aria-hidden="true"/></svg><span class="visually-hidden">${this._data.label || 'Node'}</span>`;

    const toggleLabelText = typeof this._toggleLabel === 'function'
      ? this._toggleLabel(this._data)
      : `Toggle ${this._data.label || 'Node'}`;

    // 切換按鈕
    const buttonHtml = this.hasChildren
      ? `<button class="toggle-btn" tabindex="-1" aria-label="${toggleLabelText}">${arrowIcon}</button>`
      : `<button class="toggle-btn hidden" tabindex="-1" aria-hidden="true">${arrowIcon}</button>`; // 佔位符

    // 核取方塊
    // 使用 tabindex="-1" 將 Roving Tabindex 流程保留在 Host 作為主要，
    // 但允許滑鼠使用者點擊它。
    // 如果使用者在某些瀏覽模式下嘗試，也可以 tab 到它，但明確設置 -1 會將其從序列中移除。
    const checkboxHtml = showCheckbox
      ? `<div class="au-checkbox"><input type="checkbox" id="${this._uid}" tabindex="-1" ${this.checked ? 'checked' : ''}>`
      : '';

    const labelId = `${this._uid}-label`;
    const labelHtml = showCheckbox
      ? `<label id="${labelId}" for="${this._uid}">${this._data.label || 'Node'}</label></div>`
      : `<span>${this._data.label || 'Node'}</span>`;
    // 更好：如果沒有核取方塊， label 表現為文字。
    // 如果我們想要在沒有核取方塊時點擊標籤展開，我們需要監聽器。

    container.innerHTML = `
        ${buttonHtml}
        ${checkboxHtml}
        ${labelHtml}
      `;


    if (showCheckbox && this.indeterminate) {
      const input = container.querySelector('input');
      if (input) input.indeterminate = true;
    }

    const toggle = container.querySelector('.toggle-icon');
    if (this.expanded && toggle) toggle.style.transform = 'rotate(90deg)';
  }
}

customElements.define('au-tree', AuTree);
customElements.define('au-tree-node', AuTreeNode);
