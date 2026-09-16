import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/tree.js';

const sampleData = [
  {
    label: 'Root 1',
    children: [
      { label: 'Child 1.1' },
      { label: 'Child 1.2' }
    ]
  },
  {
    label: 'Root 2',
    children: [
      { label: 'Child 2.1', children: [{ label: 'Grandchild 2.1.1' }] }
    ]
  }
];

describe('AuTree', () => {
  it('activates host, marker and text exactly once without activating ancestors', async () => {
    const tree = await fixture(html`<au-tree show-checkbox></au-tree>`);
    tree.data=[{label:'Parent',expanded:true,children:[{label:'Child'},{label:'Disabled',disabled:true}]}];
    const [parent,child,disabled]=tree.getAllNodes();
    let changes=0;tree.addEventListener('change',()=>changes++);
    child.click();expect(child.checked).to.be.true;expect(changes).to.equal(1);
    child.shadowRoot.querySelector('.checkmark').click();expect(child.checked).to.be.false;expect(changes).to.equal(2);
    child.shadowRoot.querySelector('.text').click();expect(child.checked).to.be.true;expect(changes).to.equal(3);
    expect(tree.findActiveNode().activeElement).to.equal(child);
    disabled.click();expect(disabled.checked).to.be.false;expect(changes).to.equal(3);
    const marker=child.shadowRoot.querySelector('.checkmark');
    expect(marker.getAttribute('aria-hidden')).to.equal('true');
    marker.focus();expect(tree.findActiveNode().activeElement).to.equal(disabled);
    expect(child.shadowRoot.querySelector('input,[role=checkbox]')).to.equal(null);
    parent.shadowRoot.querySelector('button').click();expect(parent.expanded).to.be.false;expect(changes).to.equal(3);
  });

  it('mirrors only horizontal tree keys under inherited and changing RTL', async () => {
    const box=await fixture(html`<div dir="rtl"><au-tree></au-tree></div>`),tree=box.querySelector('au-tree');
    tree.data=[{label:'Parent',children:[{label:'Child'}]}];const [parent,child]=tree.getAllNodes();
    const press=(node,key)=>node.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,composed:true,cancelable:true}));
    parent.focus();press(parent,'ArrowLeft');expect(parent.expanded).to.be.true;
    press(parent,'ArrowLeft');expect(tree.findActiveNode().activeNode).to.equal(child);
    press(child,'ArrowRight');expect(tree.findActiveNode().activeNode).to.equal(parent);
    press(parent,'ArrowRight');expect(parent.expanded).to.be.false;
    box.dir='ltr';press(parent,'ArrowRight');expect(parent.expanded).to.be.true;
  });

  it('preserves keyed nodes, host focus, checks and expansion across data translations', async () => {
    const el = await fixture(html`<au-tree show-checkbox></au-tree>`);
    el.data = [{id:'root',label:'Files',children:[{id:'a',label:'Alpha'},{id:'b',label:'Beta'}]}];
    const root = el.getAllNodes()[0];root.setExpanded(true);
    const child = el.getAllNodes()[1];child.toggleCheck(true);
    const marker = child.shadowRoot.querySelector('.checkmark');child.focus();
    el.data = [{id:'root',label:'檔案',children:[{id:'b',label:'乙'},{id:'a',label:'甲'}]}];
    expect(el.getAllNodes()[0]).to.equal(root);
    expect(el.getAllNodes()[2]).to.equal(child);
    expect(root.expanded).to.be.true;
    expect(child.checked).to.be.true;
    expect(child.shadowRoot.querySelector('.checkmark')).to.equal(marker);
    expect(el.findActiveNode().activeElement).to.equal(child);
  });

  it('does not check disabled branches and emits one change after reconnect', async () => {
    const el = await fixture(html`<au-tree show-checkbox .data=${[{label:'Parent',children:[{label:'Enabled'},{label:'Disabled',disabled:true}]}]}></au-tree>`);
    for(let i=0;i<3;i++){const parent=el.parentNode;el.remove();parent.append(el);}
    let count=0;el.addEventListener('change',()=>count++);
    const [parent,enabled,disabled]=el.getAllNodes();
    enabled.toggleCheck(true);
    expect(count).to.equal(1);
    disabled.toggleCheck(true);
    expect(count).to.equal(1);
    expect(disabled.checked).to.be.false;
    parent.toggleCheck(false);parent.toggleCheck(true);
    expect(disabled.checked).to.be.false;
    expect(count).to.equal(3);
  });

  it('never exposes expansion on a leaf or checking in a non-checkable tree', async () => {
    const el=await fixture(html`<au-tree .data=${[{label:'Leaf'}]}></au-tree>`);
    const leaf=el.getAllNodes()[0];leaf.setExpanded(true);leaf.setChecked(true);
    expect(leaf.hasAttribute('aria-expanded')).to.be.false;
    expect(leaf.hasAttribute('aria-checked')).to.be.false;
  });

  it('moves descendant focus to a collapsed ancestor and removes hidden tab stops', async () => {
    const el=await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
    const root=el.getAllNodes()[0];root.setExpanded(true);
    const child=el.getAllNodes()[1];el.focusNode(child);root.setExpanded(false);
    expect(el.shadowRoot.activeElement).to.equal(root);
    expect(root.tabIndex).to.equal(0);expect(child.tabIndex).to.equal(-1);
    expect(root.shadowRoot.querySelector('[role=group]').inert).to.be.true;
  });

  it('expands only the current sibling level with *', async () => {
    const el=await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
    const roots=[...el.shadowRoot.querySelectorAll('au-tree-node')];
    roots[0].focus();roots[0].dispatchEvent(new KeyboardEvent('keydown',{key:'*',bubbles:true,composed:true}));
    expect(roots.every(n=>n.expanded)).to.be.true;
    expect(roots[1].shadowRoot.querySelector('au-tree-node').expanded).to.be.false;
  });

  it('keeps checked state when checkbox UI is hidden and restored', async () => {
    const el=await fixture(html`<au-tree show-checkbox .data=${[{label:'Item'}]}></au-tree>`);
    const node=el.getAllNodes()[0];node.toggleCheck(true);
    el.removeAttribute('show-checkbox');expect(node.hasAttribute('aria-checked')).to.be.false;
    el.setAttribute('show-checkbox','');expect(node.checked).to.be.true;
    expect(node.getAttribute('aria-checked')).to.equal('true');
    expect(el.shadowRoot.querySelector('[role=tree]').getAttribute('aria-multiselectable')).to.equal('true');
  });

  it('normalizes malformed records and cyclic children without treating labels as markup', async () => {
    const cyclic={id:'cycle',label:'<img src=x onerror=alert(1)>'};cyclic.children=[cyclic,null,2,{label:0,children:'invalid'}];
    const el=await fixture(html`<au-tree></au-tree>`);el.data=[null,1,[],cyclic];
    expect(el.getAllNodes().length).to.equal(2);
    expect(el.getAllNodes()[0].shadowRoot.querySelector('img')).to.equal(null);
    expect(el.getAllNodes()[0].getAttribute('aria-label')).to.equal(cyclic.label);
    expect(el.getAllNodes()[1].label).to.equal('0');
    el.getAllNodes()[1].setAttribute('expanded','');
    expect(el.getAllNodes()[1].hasAttribute('expanded')).to.be.false;
    el.data=null;expect(el.getAllNodes()).to.have.length(0);
  });

  it('keeps original objects unchanged and falls back when the focused node is removed', async () => {
    const data=[{id:'p',label:'Parent',children:[{id:'a',label:'Alpha'},{id:'b',label:'Beta'}]}];
    const snapshot=JSON.stringify(data);
    const el=await fixture(html`<au-tree show-checkbox .data=${data}></au-tree>`);
    const parent=el.getAllNodes()[0];parent.setExpanded(true);el.getAllNodes()[1].toggleCheck(true);el.getAllNodes()[1].focus();
    expect(JSON.stringify(data)).to.equal(snapshot);
    el.data=[{id:'p',label:'Parent',children:[{id:'b',label:'Beta'}]}];
    expect(el.findActiveNode().activeNode).to.equal(parent);
    el.data=[];expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('[role=tree]'));
  });

  it('uses single and multiple character type-ahead without consuming modified shortcuts', async () => {
    const el=await fixture(html`<au-tree .data=${[{label:'Start'},{label:'Beta'},{label:'Bravo'},{label:'Alpha'}]}></au-tree>`);
    el.focus();
    const press=(key,options={})=>el.findActiveNode().activeNode.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,composed:true,cancelable:true,...options}));
    press('b');expect(el.findActiveNode().activeNode.label).to.equal('Beta');
    press('r');expect(el.findActiveNode().activeNode.label).to.equal('Bravo');
    expect(press('a',{ctrlKey:true})).to.be.true;
    expect(el.findActiveNode().activeNode.label).to.equal('Bravo');
    expect(press('a',{isComposing:true})).to.be.true;
  });

  it('tracks replaced tree labels and preserves text nodes through locale changes', async () => {
    const box=await fixture(html`<div><span id="tree-test-label">Files</span><au-tree aria-labelledby="tree-test-label" show-checkbox .data=${[{label:'One'}]}></au-tree></div>`);
    const el=box.querySelector('au-tree'),node=el.getAllNodes()[0];
    node.focus();el.toggleLabelTemplate='展開 {label}';el.fallbackNodeLabel='節點';
    expect(el.findActiveNode().activeElement).to.equal(node);
    const replacement=document.createElement('span');replacement.id='tree-test-label';replacement.textContent='檔案';box.querySelector('span').replaceWith(replacement);
    await new Promise(r=>setTimeout(r,0));
    const container=el.shadowRoot.querySelector('[role=tree]');
    if('ariaLabelledByElements' in container) expect(container.ariaLabelledByElements).to.deep.equal([replacement]);
    else expect(container.getAttribute('aria-label')).to.equal('檔案');
  });
  it('renders structure from data', async () => {
    const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
    const nodes = el.shadowRoot.querySelectorAll('au-tree-node');
    expect(nodes.length).to.equal(2);
    expect(nodes[0].data.label).to.equal('Root 1');
    expect(nodes[1].data.label).to.equal('Root 2');
  });

  it('renders children mostly hidden initially', async () => {
    const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
    const rootNode = el.shadowRoot.querySelector('au-tree-node');

    // Check internal structure
    const group = rootNode.shadowRoot.querySelector('div[role="group"]');
    expect(group).to.exist;
    expect(window.getComputedStyle(group).display).to.equal('none');
  });

  it('has accessible roles', async () => {
    const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);

    const node = el.shadowRoot.querySelector('au-tree-node');
    expect(node.getAttribute('role')).to.equal('treeitem');
    expect(node.getAttribute('aria-expanded')).to.equal('false');
    // Ensure host has accessible name
    expect(node.getAttribute('aria-label')).to.equal('Root 1');
  });

  describe('toggleLabel', () => {
    it('uses default toggle label when not specified', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      const node = el.shadowRoot.querySelector('au-tree-node');
      const btn = node.shadowRoot.querySelector('.toggle-btn');
      expect(btn.getAttribute('aria-label')).to.equal('Toggle Root 1');
    });

    it('uses custom toggle label function', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      el.toggleLabel = (node) => `Custom ${node.label}`;

      await nextFrame(); // Wait for property propagation and re-render

      const node = el.shadowRoot.querySelector('au-tree-node');
      const btn = node.shadowRoot.querySelector('.toggle-btn');
      expect(btn.getAttribute('aria-label')).to.equal('Custom Root 1');
    });

    it('uses localized toggle label template from attribute', async () => {
      const el = await fixture(html`
        <au-tree
          data-text-node="節點"
          data-text-toggle="展開或收合 {label}"
          .data=${sampleData}
        ></au-tree>
      `);
      const node = el.shadowRoot.querySelector('au-tree-node');
      const btn = node.shadowRoot.querySelector('.toggle-btn');
      expect(btn.getAttribute('aria-label')).to.equal('展開或收合 Root 1');
    });

    it('uses localized fallback node label when data label is missing', async () => {
      const el = await fixture(html`
        <au-tree
          data-text-node="未命名節點"
          data-text-toggle="展開或收合 {label}"
          .data=${[{ children: [{ label: 'Child' }] }]}
        ></au-tree>
      `);
      const node = el.shadowRoot.querySelector('au-tree-node');
      const btn = node.shadowRoot.querySelector('.toggle-btn');
      expect(node.getAttribute('aria-label')).to.equal('未命名節點');
      expect(btn.getAttribute('aria-label')).to.equal('展開或收合 未命名節點');
    });

    it('propagates toggleLabel to children', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      el.toggleLabel = (node) => `Children ${node.label}`;
      await nextFrame();

      const rootNode = el.shadowRoot.querySelector('au-tree-node');
      rootNode.setExpanded(true); // Ensure children are rendered/accessible if lazy (though they are in DOM)
      await nextFrame();

      const childNode = rootNode.shadowRoot.querySelector('au-tree-node');
      const btn = childNode.shadowRoot.querySelector('.toggle-btn');
      // Child 1.1 doesn't have children, so button is hidden, but ARIA label might still be generated or button exists but hidden
      // Let's check a node that has children but we just need to check if the property `toggleLabel` was set on the element
      expect(childNode.toggleLabel).to.be.a('function');

      // Let's check if the invisible button has the label, or check Root 2 which has children
      const root2 = el.shadowRoot.querySelectorAll('au-tree-node')[1];
      const btn2 = root2.shadowRoot.querySelector('.toggle-btn');
      expect(btn2.getAttribute('aria-label')).to.equal('Children Root 2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('sets initial focus key (Roving Tabindex)', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      // Wait for registry update
      await new Promise(r => requestAnimationFrame(r));

      const nodes = el.shadowRoot.querySelectorAll('au-tree-node');
      expect(nodes[0].tabIndex).to.equal(0);
      expect(nodes[1].tabIndex).to.equal(-1);
    });

    it('expands node on ArrowRight', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      const node = el.shadowRoot.querySelector('au-tree-node');

      // Focus node
      node.focus();
      // Simulate ArrowRight
      node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await nextFrame();

      expect(node.expanded).to.be.true;
      expect(node.getAttribute('aria-expanded')).to.equal('true');
    });

    it('collapses node on ArrowLeft', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      const node = el.shadowRoot.querySelector('au-tree-node');
      node.setExpanded(true);
      await nextFrame();
      expect(node.expanded).to.be.true;

      node.focus();
      node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
      await nextFrame();

      expect(node.expanded).to.be.false;
    });

    it('moves focus with ArrowDown/ArrowUp', async () => {
      const el = await fixture(html`<au-tree .data=${sampleData}></au-tree>`);
      await nextFrame();
      const nodes = el.shadowRoot.querySelectorAll('au-tree-node');

      nodes[0].focus();
      nodes[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await nextFrame();

      expect(el.shadowRoot.activeElement).to.equal(nodes[1]);
    });
  });

  describe('Checkboxes', () => {
    it('cascades checked state downwards', async () => {
      const el = await fixture(html`<au-tree show-checkbox .data=${sampleData}></au-tree>`);
      const node = el.shadowRoot.querySelector('au-tree-node');

      // Simulate check
      node.toggleCheck(true);
      expect(node.checked).to.be.true;

      // Check children
      const children = node.shadowRoot.querySelectorAll('au-tree-node');
      expect(children.length).to.equal(2);
      expect(children[0].checked).to.be.true;
    });

    it('calculates indeterminate state upward', async () => {
      const el = await fixture(html`<au-tree show-checkbox .data=${sampleData}></au-tree>`);
      const rootNode = el.shadowRoot.querySelector('au-tree-node');

      // Find first child
      const child1 = rootNode.shadowRoot.querySelectorAll('au-tree-node')[0];

      // Trigger check on child
      child1.toggleCheck(true);
      await nextFrame();

      expect(rootNode.indeterminate).to.be.true;
      expect(rootNode.checked).to.be.false;
    });
  });
});
