// Tree data is rendered as text. A sibling-unique id retains node identity;
// otherwise the same object reference is required to retain local state.
function auTreeRecords(value, ancestors = new Set()) {
  return Array.isArray(value) ? value.filter(item =>
    item && typeof item === 'object' && !Array.isArray(item) && !ancestors.has(item)) : [];
}

class AuTree extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._data = [];
    this._nodeRegistry = [];
    this._activeNode = null;
    this._toggleLabel = null;
    this._typeBuffer = '';
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
    this._container = this.shadowRoot.querySelector('[role=tree]');
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleNodeExpand = this.handleNodeExpand.bind(this);
    this.handleNodeCheckChange = this.handleNodeCheckChange.bind(this);
  }

  static get observedAttributes() {
    return ['show-checkbox','data-text-node','data-text-toggle','aria-label','aria-labelledby'];
  }

  connectedCallback() {
    for (const prop of ['data','toggleLabel','fallbackNodeLabel','toggleLabelTemplate']) this._upgradeProperty(prop);
    this.addEventListener('keydown',this.handleKeyDown);
    this.addEventListener('focusin',this.handleFocusIn);
    this.addEventListener('au-tree-node-expand',this.handleNodeExpand);
    this.addEventListener('au-tree-node-check-change',this.handleNodeCheckChange);
    if (!this._rendered) this.render();
    else { this.syncAccessibleLabel(); this.updateNodeRegistry(); }
    this.observeLabelRoot();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown',this.handleKeyDown);
    this.removeEventListener('focusin',this.handleFocusIn);
    this.removeEventListener('au-tree-node-expand',this.handleNodeExpand);
    this.removeEventListener('au-tree-node-check-change',this.handleNodeCheckChange);
    this._labelObserver?.disconnect();
    this._typeBuffer = '';
  }

  _upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this,prop)) {
      const value = this[prop]; delete this[prop]; this[prop] = value;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._container) return;
    if (name === 'aria-label' || name === 'aria-labelledby') {
      this.syncAccessibleLabel();
      if (this.isConnected && name === 'aria-labelledby') this.observeLabelRoot();
    } else {
      const {activeNode,activeElement} = this.findActiveNode();
      this._container.setAttribute('aria-multiselectable',String(this.hasAttribute('show-checkbox')));
      for (const node of this.getAllNodes()) node.syncPresentation();
      if (activeNode && activeElement?.hidden) activeNode.focus();
      this.updateNodeRegistry();
    }
  }

  get data() { return this._data; }
  set data(value) { this._data = Array.isArray(value) ? value : []; this.render(); }
  get toggleLabel() { return this._toggleLabel; }
  set toggleLabel(value) {
    this._toggleLabel = value;
    for (const node of this.getAllNodes()) node.syncPresentation();
  }
  get fallbackNodeLabel() { return this.getAttribute('data-text-node') || 'Node'; }
  set fallbackNodeLabel(value) { this.setAttribute('data-text-node',value || 'Node'); }
  get toggleLabelTemplate() { return this.getAttribute('data-text-toggle'); }
  set toggleLabelTemplate(value) {
    if (value == null) this.removeAttribute('data-text-toggle');
    else this.setAttribute('data-text-toggle',value);
  }

  observeLabelRoot() {
    this._labelObserver?.disconnect();
    if (!this.getAttribute('aria-labelledby')?.trim()) return;
    this._labelObserver ??= new MutationObserver(()=>this.syncAccessibleLabel());
    this._labelObserver.observe(this.getRootNode(),{
      childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['id','aria-label']
    });
    this.syncAccessibleLabel();
  }

  syncAccessibleLabel() {
    const root = this.getRootNode();
    const ids = (this.getAttribute('aria-labelledby') || '').trim().split(/\s+/).filter(Boolean);
    const labels = ids.map(id=>root.getElementById?.(id)).filter(el=>el && el !== this);
    const fallback = this.getAttribute('aria-label')?.trim() || 'Tree';
    if ('ariaLabelledByElements' in this._container) {
      this._container.ariaLabelledByElements = labels;
      this._container.setAttribute('aria-label',fallback);
    } else {
      const text = labels.map(el=>el.getAttribute('aria-label') || el.textContent).join(' ').trim();
      this._container.setAttribute('aria-label',text || fallback);
    }
  }

  static reconcile(container, data, tree, parent, ancestors = new Set()) {
    const records = auTreeRecords(data,ancestors);
    const counts = new Map();
    const idOf = item => (typeof item.id === 'string' && item.id !== '') ||
      (typeof item.id === 'number' && Number.isFinite(item.id)) ? item.id : undefined;
    for (const item of records) {
      const id = idOf(item);
      if (id !== undefined) counts.set(id,(counts.get(id) || 0)+1);
    }
    const old = [...container.children];
    const available = new Map();
    for (const node of old) {
      const bucket = available.get(node._identity) || [];
      bucket.push(node); available.set(node._identity,bucket);
    }
    const retained = new Set();
    records.forEach((item,index)=>{
      const id = idOf(item);
      const identity = id !== undefined && counts.get(id) === 1 ? id : item;
      const node = available.get(identity)?.shift() || document.createElement('au-tree-node');
      node._identity = identity;
      node._tree = tree;
      node.parentTreeNode = parent;
      node._level = parent ? parent._level+1 : 1;
      node._position = index+1;
      node._setSize = records.length;
      node.updateData(item,new Set([...ancestors,item]));
      if (container.children[index] !== node) container.insertBefore(node,container.children[index] || null);
      retained.add(node);
    });
    for (const node of old) if (!retained.has(node)) {
      node.clearOwner(); node.remove();
    }
  }

  render() {
    if (!this._container) return;
    this._rendered = true;
    const {activeNode,activeElement} = this.findActiveNode();
    this._rendering = true;
    try { AuTree.reconcile(this._container,this._data,this,null); }
    finally { this._rendering = false; }
    this.syncAccessibleLabel();
    this._container.setAttribute('aria-multiselectable',String(this.hasAttribute('show-checkbox')));
    this.updateNodeRegistry(activeNode || this._activeNode);
    if (activeNode) {
      const target = this._activeNode;
      if (target === activeNode && activeElement?.isConnected && !activeElement.hidden && !activeElement.disabled) {
        activeElement.focus({preventScroll:true});
      } else (target || this._container).focus({preventScroll:true});
    }
  }

  collectNodes(root, visibleOnly = false) {
    const nodes = [];
    for (const node of root.querySelectorAll('au-tree-node')) {
      nodes.push(node);
      if (!visibleOnly || node.expanded) nodes.push(...this.collectNodes(node.shadowRoot,visibleOnly));
    }
    return nodes;
  }
  getAllNodes() { return this.collectNodes(this.shadowRoot); }

  findActiveNode() {
    let activeElement = this.shadowRoot.activeElement;
    let activeNode = null;
    while (activeElement) {
      if (activeElement instanceof AuTreeNode) activeNode = activeElement;
      if (!activeElement.shadowRoot?.activeElement) break;
      activeElement = activeElement.shadowRoot.activeElement;
    }
    return {activeNode,activeElement};
  }

  updateNodeRegistry(preferred = this.findActiveNode().activeNode || this._activeNode) {
    this._nodeRegistry = this.collectNodes(this.shadowRoot,true);
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
    const node = event.composedPath().find(item=>item instanceof AuTreeNode);
    if (node?._tree === this) this.updateNodeRegistry(node);
  }
  handleNodeExpand(event) {
    if (event.target === this) return;
    const {activeNode} = this.findActiveNode();
    this.updateNodeRegistry();
    if (activeNode && !this._nodeRegistry.includes(activeNode)) this.focusNode(this._activeNode);
  }
  handleNodeCheckChange(event) {
    if (event.detail?.node?._tree !== this) return;
    const checkedNodes = this.getAllNodes().filter(node=>node.checked && !node.indeterminate).map(node=>node.data);
    this.dispatchEvent(new CustomEvent('change',{bubbles:true,composed:true,detail:{checkedNodes}}));
  }

  handleKeyDown(event) {
    const current = event.composedPath().find(item=>item instanceof AuTreeNode);
    if (current?._tree !== this || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    this.updateNodeRegistry(current);
    const index = this._nodeRegistry.indexOf(current);
    let target;
    const rtl = getComputedStyle(current).direction === 'rtl';
    const key = rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : event.key;
    switch(key) {
      case 'ArrowDown': target = this._nodeRegistry[index+1]; break;
      case 'ArrowUp': target = this._nodeRegistry[index-1]; break;
      case 'ArrowRight':
        if (current.hasChildren) {
          if (!current.expanded) current.setExpanded(true);
          else target = current.childNodesList[0];
        }
        break;
      case 'ArrowLeft':
        if (current.expanded) current.setExpanded(false);
        else target = current.parentTreeNode;
        break;
      case 'Home': target = this._nodeRegistry[0]; break;
      case 'End': target = this._nodeRegistry.at(-1); break;
      case '*':
        for (const sibling of current.parentTreeNode?.childNodesList || [...this._container.children]) sibling.setExpanded(true);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          event.preventDefault();
          this.handleTypeAhead(event.key,index);
        }
        return;
    }
    event.preventDefault();
    this._typeBuffer = '';
    if (target) this.focusNode(target);
  }

  handleTypeAhead(char,index) {
    const now = Date.now();
    this._typeBuffer = now-this._typeTime < 700 ? this._typeBuffer+char.toLowerCase() : char.toLowerCase();
    this._typeTime = now;
    const repeated = [...this._typeBuffer].every(letter=>letter === this._typeBuffer[0]);
    const term = repeated ? char.toLowerCase() : this._typeBuffer;
    const nodes = this._nodeRegistry;
    const start = term.length > 1 ? index : index+1;
    for (let offset=0; offset<nodes.length; offset++) {
      const node = nodes[(start+offset)%nodes.length];
      if (node.label.toLowerCase().startsWith(term)) { this.focusNode(node); break; }
    }
  }
  expandAllChildren() { for (const node of this._container.children) node.setExpanded(true); }
}

class AuTreeNode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this._data = {};
    this._expanded = false;
    this._checked = false;
    this._indeterminate = false;
    this._toggleLabel = null;
    this._fallbackNodeLabel = 'Node';
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
    this._row = this.shadowRoot.querySelector('.node-content');
    this._group = this.shadowRoot.querySelector('[role=group]');
    this._checkmark = this.shadowRoot.querySelector('.checkmark');
    this._button = this.shadowRoot.querySelector('button');
    this._text = this.shadowRoot.querySelector('.text');
    // Stable listeners are installed once, not on every connection.
    this._button.addEventListener('click',()=>{this.setExpanded(!this.expanded);this.focus();});
    this._row.addEventListener('click',event=>{
      if (event.target.closest('button')) return;
      this.focus();
      if (this.hasCheckbox) this.toggleCheck();
      else if (this.hasChildren) this.setExpanded(!this.expanded);
    });
    this.addEventListener('click',event=>{
      // Retargeted descendant clicks must not activate this node a second time.
      if (event.composedPath()[0] !== this) return;
      this.focus();
      if (this.hasCheckbox) this.toggleCheck();
      else if (this.hasChildren) this.setExpanded(!this.expanded);
    });
    this.addEventListener('keydown',event=>{
      if (event.composedPath()[0] !== this || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();event.stopPropagation();
        if (event.key === ' ' && this.hasCheckbox) this.toggleCheck();
        else if (this.hasChildren) this.setExpanded(!this.expanded);
      }
    });
  }

  static get observedAttributes() {return ['expanded','checked','indeterminate','show-checkbox'];}
  connectedCallback() {this.syncPresentation();}
  attributeChangedCallback(name,oldValue,newValue) {
    if (oldValue === newValue || this._syncing) return;
    if (name === 'expanded') this.setExpanded(newValue !== null);
    else if (name === 'checked') this.setChecked(newValue !== null,this.indeterminate);
    else if (name === 'indeterminate') this.setChecked(this.checked,newValue !== null);
    else this.syncPresentation();
  }

  get data() {return this._data;}
  set data(value) {
    if (this._tree && !this._tree._rendering) {
      const {activeNode,activeElement}=this._tree.findActiveNode();
      this.updateData(value,new Set([value]));
      this._tree.updateNodeRegistry(activeNode);
      if (activeNode && activeElement?.isConnected) activeElement.focus({preventScroll:true});
    } else this.updateData(value,new Set([value]));
  }
  get childNodesList() {return [...this._group.children];}
  get hasChildren() {return this._group.childElementCount > 0;}
  get hasCheckbox() {return this._tree ? this._tree.hasAttribute('show-checkbox') : this.hasAttribute('show-checkbox');}
  get disabled() {return !!this._data.disabled || !!this.parentTreeNode?.disabled;}
  get label() {return this.getLabelText();}
  get expanded() {return this._expanded;}
  set expanded(value) {this.setExpanded(value);}
  get checked() {return this._checked;}
  set checked(value) {this.setChecked(value,this.indeterminate);}
  get indeterminate() {return this._indeterminate;}
  set indeterminate(value) {this.setChecked(this.checked,value);}
  get toggleLabel() {return this._tree?.toggleLabel ?? this._toggleLabel;}
  set toggleLabel(value) {this._toggleLabel=value;this.syncPresentation();for(const child of this.childNodesList) child.toggleLabel=value;}
  get fallbackNodeLabel() {return this._tree?.fallbackNodeLabel || this._fallbackNodeLabel;}
  set fallbackNodeLabel(value) {this._fallbackNodeLabel=value || 'Node';this.syncPresentation();for(const child of this.childNodesList) child.fallbackNodeLabel=value;}
  get toggleLabelTemplate() {return this._tree?.toggleLabelTemplate ?? this._toggleLabelTemplate;}
  set toggleLabelTemplate(value) {this._toggleLabelTemplate=value;this.syncPresentation();for(const child of this.childNodesList) child.toggleLabelTemplate=value;}
  getLabelText() {return this._data.label == null || this._data.label === '' ? this.fallbackNodeLabel : String(this._data.label);}

  clearOwner() {this._tree=null;for(const child of this.childNodesList) child.clearOwner();}

  updateData(value,ancestors) {
    this._data = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    if ('checked' in this._data) this._checked=!!this._data.checked;
    if ('expanded' in this._data) this._expanded=!!this._data.expanded;
    AuTree.reconcile(this._group,this._data.children,this._tree,this,ancestors);
    if (!this.hasChildren) {this._expanded=false;this._indeterminate=false;}
    else this.updateStateFromChildren();
    this.syncPresentation();
  }

  syncPresentation() {
    const text=this.getLabelText();
    this.setAttribute('role','treeitem');
    this.setAttribute('aria-label',text);
    this.setAttribute('aria-disabled',String(this.disabled));
    this.setAttribute('aria-level',String(this._level || 1));
    this.setAttribute('aria-posinset',String(this._position || 1));
    this.setAttribute('aria-setsize',String(this._setSize || 1));
    this._syncing=true;
    this.toggleAttribute('expanded',this.hasChildren && this.expanded);
    this.toggleAttribute('checked',this.checked);
    this.toggleAttribute('indeterminate',this.indeterminate);
    this._syncing=false;
    if (this.hasChildren) this.setAttribute('aria-expanded',String(this.expanded));
    else this.removeAttribute('aria-expanded');
    if (this.hasCheckbox) this.setAttribute('aria-checked',this.indeterminate ? 'mixed' : String(this.checked));
    else this.removeAttribute('aria-checked');
    this._text.textContent=text;
    const custom=this.toggleLabel;
    const toggleText=typeof custom === 'function' ? custom(this._data) : (this.toggleLabelTemplate || 'Toggle {label}').replaceAll('{label}',text);
    this._button.setAttribute('aria-label',String(toggleText));
    this._button.classList.toggle('hidden',!this.hasChildren);
    this._button.setAttribute('aria-hidden',String(!this.hasChildren));
    this._checkmark.hidden=!this.hasCheckbox;
    this._group.hidden=!this.hasChildren || !this.expanded;
    this._group.inert=this._group.hidden;
    if(this._data.lang) this.setAttribute('lang',String(this._data.lang)); else this.removeAttribute('lang');
  }

  setExpanded(value) {
    const next=!!value && this.hasChildren;
    if (next === this.expanded) {this.syncPresentation();return;}
    const tree=this._tree;
    const active=tree?.findActiveNode().activeNode;
    this._expanded=next;
    this.syncPresentation();
    if(tree) {
      tree.updateNodeRegistry(active || tree._activeNode);
      if(active && !tree._nodeRegistry.includes(active)) tree.focusNode(tree._activeNode);
    }
    this.dispatchEvent(new CustomEvent('au-tree-node-expand',{bubbles:true,composed:true}));
  }
  expandAllChildren() {this.setExpanded(true);for(const child of this.childNodesList) child.setExpanded(true);}

  setChecked(value,indeterminate=false) {
    this._checked=!!value;this._indeterminate=!!indeterminate;this.syncPresentation();
  }
  setChildrenChecked(value) {
    for (const child of this.childNodesList) {
      if(child.disabled) continue;
      child.setChecked(value);child.setChildrenChecked(value);
    }
  }
  updateStateFromChildren() {
    const children=this.childNodesList.filter(child=>!child.disabled);
    if (!children.length) return;
    const all=children.every(child=>child.checked && !child.indeterminate);
    const none=children.every(child=>!child.checked && !child.indeterminate);
    this.setChecked(all,!all && !none);
  }
  toggleCheck(value=null) {
    if (!this.hasCheckbox || this.disabled) {this.syncPresentation();return;}
    const tree=this._tree;
    const before=tree?.getAllNodes().map(node=>[node.checked,node.indeterminate].join(':')).join(',');
    const next=value == null ? !this.checked : !!value;
    this.setChecked(next);this.setChildrenChecked(next);
    let parent=this.parentTreeNode;
    while(parent) {parent.updateStateFromChildren();parent=parent.parentTreeNode;}
    const after=tree?.getAllNodes().map(node=>[node.checked,node.indeterminate].join(':')).join(',');
    if(tree && before === after) return;
    this.dispatchEvent(new CustomEvent('au-tree-node-check-change',{bubbles:true,composed:true,detail:{checked:this.checked,node:this}}));
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('au-tree-node')) customElements.define('au-tree-node',AuTreeNode);
  if (!customElements.get('au-tree')) customElements.define('au-tree',AuTree);
}
