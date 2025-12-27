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
