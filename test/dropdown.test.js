import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/dropdown.js';

describe('AuDropdown', () => {
  let el;
  beforeEach(async () => {
    el = await fixture(html`
      <au-dropdown>
        <span slot="trigger">Choose Option</span>
        <au-dropdown-item value="1">Option 1</au-dropdown-item>
        <au-dropdown-item value="2">Option 2</au-dropdown-item>
        <au-dropdown-item value="3">Option 3</au-dropdown-item>
      </au-dropdown>
    `);
  });

  // --- Initial State ---
  it('renders with correct initial attributes', () => {
    const trigger = el.shadowRoot.querySelector('button');
    const menu = el.shadowRoot.querySelector('[role="menu"]');
    
    expect(trigger.getAttribute('role')).to.equal('button');
    expect(trigger.getAttribute('aria-haspopup')).to.equal('menu');
    expect(trigger.getAttribute('popovertarget')).to.equal(menu.id);
    expect(menu.getAttribute('popover')).to.equal('auto');
    expect(menu.getAttribute('aria-labelledby')).to.equal(trigger.id);
    expect(el.isOpen).to.be.false;
  });

  // --- Mouse Interaction ---
  it('toggles menu on trigger click', async () => {
    const trigger = el.shadowRoot.querySelector('button');
    trigger.click();
    await new Promise(r => setTimeout(r, 50));
    expect(el.isOpen).to.be.true;
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');

    trigger.click();
    await new Promise(r => setTimeout(r, 50));
    expect(el.isOpen).to.be.false;
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  // --- Keyboard: Trigger Activation ---
  it('opens menu with Enter key, focuses first item', async () => {
    const trigger = el.shadowRoot.querySelector('button');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    expect(el.isOpen).to.be.true;
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;
  });

  it('opens menu with Space key, focuses first item', async () => {
    const trigger = el.shadowRoot.querySelector('button');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    expect(el.isOpen).to.be.true;
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;
  });

  it('opens menu with ArrowDown key, focuses first item', async () => {
    const trigger = el.shadowRoot.querySelector('button');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    expect(el.isOpen).to.be.true;
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;
  });

  it('opens menu with ArrowUp key, focuses last item', async () => {
    const trigger = el.shadowRoot.querySelector('button');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    expect(el.isOpen).to.be.true;
    expect(el.items[el.items.length - 1].shadowRoot.activeElement).to.not.be.null;
  });

  // --- Keyboard: Menu Navigation (Cycling) ---
  it('navigates with ArrowDown (cycles to first from last)', async () => {
    el.open(2); // Focus last item
    await new Promise(r => setTimeout(r, 100));
    
    const lastItem = el.items[2];
    lastItem.shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 50));
    
    // Should now be on first item (cycling)
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;
  });

  it('navigates with ArrowUp (cycles to last from first)', async () => {
    el.open(0); // Focus first item
    await new Promise(r => setTimeout(r, 100));
    
    const firstItem = el.items[0];
    firstItem.shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 50));
    
    // Should now be on last item (cycling)
    expect(el.items[el.items.length - 1].shadowRoot.activeElement).to.not.be.null;
  });

  it('navigates to first item with Home key', async () => {
    el.open(1);
    await new Promise(r => setTimeout(r, 100));
    
    el.items[1].shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;
  });

  it('navigates to last item with End key', async () => {
    el.open(0);
    await new Promise(r => setTimeout(r, 100));
    
    el.items[0].shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(el.items[el.items.length - 1].shadowRoot.activeElement).to.not.be.null;
  });

  // --- Keyboard: Closing the Menu ---
  it('closes on Escape key, returns focus to trigger', async () => {
    el.open();
    await new Promise(r => setTimeout(r, 50));
    
    el.menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(el.isOpen).to.be.false;
    expect(el.shadowRoot.activeElement).to.equal(el.trigger);
  });

  it('closes on Tab key', async () => {
    el.open();
    await new Promise(r => setTimeout(r, 50));
    
    el.menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(el.isOpen).to.be.false;
  });

  // --- Item Selection ---
  it('dispatches selected event on item mouse click', async () => {
    let eventDetail = null;
    el.addEventListener('selected', (e) => { eventDetail = e.detail; });
    
    el.items[0].click();
    await new Promise(r => setTimeout(r, 50));
    
    expect(eventDetail).to.not.be.null;
    expect(eventDetail.value).to.equal('1');
    expect(el.isOpen).to.be.false;
  });

  it('dispatches selected event on item keyboard activation (Enter)', async () => {
    let eventDetail = null;
    el.addEventListener('selected', (e) => { eventDetail = e.detail; });
    
    el.open(0);
    await new Promise(r => setTimeout(r, 100));
    
    el.items[0].shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(eventDetail).to.not.be.null;
    expect(eventDetail.value).to.equal('1');
    expect(el.isOpen).to.be.false;
  });

  it('dispatches selected event on item keyboard activation (Space)', async () => {
    let eventDetail = null;
    el.addEventListener('selected', (e) => { eventDetail = e.detail; });
    
    el.open(1);
    await new Promise(r => setTimeout(r, 100));
    
    el.items[1].shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    
    expect(eventDetail).to.not.be.null;
    expect(eventDetail.value).to.equal('2');
    expect(el.isOpen).to.be.false;
  });

  // --- Focus Return ---
  it('returns focus to trigger when menu closes (light dismiss)', async () => {
    el.open();
    await new Promise(r => setTimeout(r, 50));
    expect(el.isOpen).to.be.true;
    
    el.close();
    await new Promise(r => setTimeout(r, 50));
    
    expect(el.isOpen).to.be.false;
    expect(el.shadowRoot.activeElement).to.equal(el.trigger);
  });

  // --- Programmatic API ---
  it('open(index) focuses correct item when menu is already open', async () => {
    el.open(0);
    await new Promise(r => setTimeout(r, 100));
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;

    el.open(2); // Call open again with different index
    await new Promise(r => setTimeout(r, 50));
    expect(el.items[2].shadowRoot.activeElement).to.not.be.null;
  });
});

describe('AuDropdownItem', () => {
  it('has correct roles and attributes', async () => {
    const item = await fixture(html`
      <au-dropdown-item value="test-val">Test Item</au-dropdown-item>
    `);
    expect(item.getAttribute('role')).to.equal('none');
    expect(item.getAttribute('tabindex')).to.equal('-1');
    expect(item.shadowRoot.querySelector('.item').getAttribute('role')).to.equal('menuitem');
  });
});
