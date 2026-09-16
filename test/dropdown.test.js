import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/dropdown.js';

describe('AuDropdown', () => {
  it('degrades to an inline keyboard menu when Popover methods are unavailable', async () => {
    const wrapper = await fixture(html`<div><button>Outside</button><au-dropdown><au-dropdown-item value="a">Alpha</au-dropdown-item><au-dropdown-item value="b">Beta</au-dropdown-item></au-dropdown></div>`);
    const dropdown = wrapper.querySelector('au-dropdown');
    dropdown.remove();
    Object.defineProperty(dropdown.menu, 'showPopover', {value:undefined,configurable:true});
    Object.defineProperty(dropdown.menu, 'hidePopover', {value:undefined,configurable:true});
    wrapper.append(dropdown);
    expect(dropdown.isOpen).to.be.false;
    expect(dropdown.menu.hidden).to.be.true;
    expect(dropdown.trigger.hasAttribute('popovertarget')).to.be.false;
    dropdown.trigger.click();
    expect(dropdown.isOpen).to.be.true;
    expect(getComputedStyle(dropdown.menu).position).to.equal('static');
    expect(dropdown.items[0].shadowRoot.activeElement).to.equal(dropdown.items[0].item);
    dropdown.items[0].item.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowDown',bubbles:true,composed:true}));
    expect(dropdown.items[1].shadowRoot.activeElement).to.equal(dropdown.items[1].item);
    dropdown.items[1].item.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true,composed:true}));
    expect(dropdown.isOpen).to.be.false;
    expect(dropdown.shadowRoot.activeElement).to.equal(dropdown.trigger);
    let selections=0; dropdown.addEventListener('selected',()=>selections++);
    dropdown.open(); dropdown.items[0].click();
    expect(selections).to.equal(1);
    dropdown.open(); wrapper.querySelector('button').focus();
    expect(dropdown.isOpen).to.be.false;
    expect(document.activeElement).to.equal(wrapper.querySelector('button'));
    dropdown.open(); dropdown.remove(); wrapper.append(dropdown);
    expect(dropdown.isOpen).to.be.false;
  });

  it('keeps native popovers inside the viewport in LTR/RTL without CSS anchors', async () => {
    const dropdown = await fixture(html`<au-dropdown style="position:fixed;right:0;bottom:0;width:140px"><au-dropdown-item>${'LongWord'.repeat(60)}</au-dropdown-item></au-dropdown>`);
    for(const dir of ['ltr','rtl']) {
      dropdown.dir=dir; dropdown.open(); await nextFrame();
      const box=dropdown.menu.getBoundingClientRect();
      expect(box.left).to.be.at.least(7);
      expect(box.right).to.be.at.most(innerWidth-7);
      expect(box.top).to.be.at.least(7);
      expect(box.bottom).to.be.at.most(innerHeight-7);
      expect(box.bottom).to.be.at.most(dropdown.trigger.getBoundingClientRect().top);
      expect(getComputedStyle(dropdown.menu).positionAnchor).not.to.equal('--dropdown-anchor');
      dropdown.close();
      expect(dropdown._trackingPosition).to.be.false;
    }
  });
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
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
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

  it('does not force focus back to trigger when menu closes from Tab', async () => {
    el.open(0);
    await new Promise(r => setTimeout(r, 100));
    expect(el.items[0].shadowRoot.activeElement).to.not.be.null;

    el.items[0].shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      composed: true,
    }));
    await new Promise(r => setTimeout(r, 50));

    expect(el.isOpen).to.be.false;
    expect(el.shadowRoot.activeElement).to.not.equal(el.trigger);
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

  it('uses localized fallback trigger text when no trigger slot is provided', async () => {
    const dropdown = await fixture(html`
      <au-dropdown data-text-trigger="更多操作">
        <au-dropdown-item value="edit">Edit</au-dropdown-item>
      </au-dropdown>
    `);

    const fallback = dropdown.shadowRoot.querySelector('.trigger-fallback');
    expect(fallback.textContent).to.equal('更多操作');

    dropdown.setAttribute('data-text-trigger', '更多選項');
    expect(fallback.textContent).to.equal('更多選項');
  });

  it('navigates and returns focus inside a containing shadow root', async () => {
    const wrapper = await fixture(html`<div></div>`);
    wrapper.attachShadow({ mode: 'open' }).append(el);
    el.open(0);
    await new Promise(r => setTimeout(r, 100));
    el.items[0].item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    expect(el.items[1].shadowRoot.activeElement).to.equal(el.items[1].item);
    el.items[1].item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 50));
    expect(el.shadowRoot.activeElement).to.equal(el.trigger);
  });

  it('does not restore stale expanded state after disconnect and reconnect', async () => {
    el.open();
    await new Promise(r => setTimeout(r, 100));
    const parent = el.parentNode;
    el.remove();
    parent.append(el);
    await new Promise(r => setTimeout(r, 50));
    expect(el.isOpen).to.be.false;
    expect(el.trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('keeps one selection notification after moving existing items and the dropdown', async () => {
    let count = 0;
    el.addEventListener('selected', () => count++);
    const first = el.items[0];
    for (let i = 0; i < 3; i++) {
      first.remove();
      el.append(first);
      const parent = el.parentNode;
      el.remove();
      parent.append(el);
    }
    first.click();
    expect(count).to.equal(1);
    el.open(el.items.indexOf(first));
    await new Promise(r => setTimeout(r, 100));
    first.item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    expect(count).to.equal(2);
    expect(el.isOpen).to.be.false;
  });

  it('focuses on open without a deferred paint and leaves external action focus alone', async () => {
    const dialogAction = await fixture(html`<button>Action destination</button>`);
    el.open(1);
    expect(el.trigger.getAttribute('aria-expanded')).to.equal('true');
    expect(el.items[1].shadowRoot.activeElement).to.equal(el.items[1].item);
    el.addEventListener('selected', () => dialogAction.focus());
    el.items[1].click();
    expect(el.trigger.getAttribute('aria-expanded')).to.equal('false');
    await new Promise(r => setTimeout(r, 50));
    expect(document.activeElement).to.equal(dialogAction);
    expect(el.isOpen).to.be.false;
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
