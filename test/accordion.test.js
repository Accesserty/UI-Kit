// accordion.test.js
import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/accordion.js';

describe('AuAccordion and AuAccordionItem', () => {
  it('renders the correct number of AuAccordionItem components', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item open>
          <span slot="heading">Accordion Title 1</span>
          <div slot="content">Accordion Content 1</div>
        </au-accordion-item>
        <au-accordion-item>
          <span slot="heading">Accordion Title 2</span>
          <div slot="content">Accordion Content 2</div>
        </au-accordion-item>
      </au-accordion>
    `);

    const accordionItems = el.querySelectorAll('au-accordion-item');
    expect(accordionItems.length).to.equal(2);
  });

  it('toggles the accordion item on click', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Accordion Title</span>
          <div slot="content">Accordion Content</div>
        </au-accordion-item>
      </au-accordion>
    `);

    const accordionItem = el.querySelector('au-accordion-item');
    expect(accordionItem.hasAttribute('open')).to.be.false;
    
    const button = accordionItem.shadowRoot.querySelector('button');
    const region = accordionItem.shadowRoot.querySelector('div[role="region"]');
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(region.getAttribute('hidden')).to.equal('');
    // Simulate click to expand
    button.click();
    await accordionItem.updateComplete;
    expect(accordionItem.hasAttribute('open')).to.be.true;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
    expect(region.getAttribute('hidden')).to.be.null;

    // Simulate another click to collapse
    button.click();
    await accordionItem.updateComplete;
    expect(accordionItem.hasAttribute('open')).to.be.false;
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(region.getAttribute('hidden')).to.equal('');

  });

  it('assigns titleID and regionID correctly and ensures proper association', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Accordion Title</span>
          <div slot="content">Accordion Content</div>
        </au-accordion-item>
      </au-accordion>
    `);

    const accordionItem = el.querySelector('au-accordion-item');
    const button = accordionItem.shadowRoot.querySelector('button');
    const heading = accordionItem.shadowRoot.querySelector('button .heading');
    const region = accordionItem.shadowRoot.querySelector('div[role="region"]');

    // Get the IDs from the elements
    const titleId = heading.getAttribute('id');
    const regionId = region.getAttribute('id');

    // Check if the button's aria-controls matches the region's ID
    expect(button.getAttribute('aria-controls')).to.equal(regionId);
    
    // Check if the region's aria-labelledby matches the button's ID
    expect(region.getAttribute('aria-labelledby')).to.equal(titleId);
  });

  it('open property getter reflects attribute', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item open>
          <span slot="heading">Title</span>
          <div slot="content">Content</div>
        </au-accordion-item>
      </au-accordion>
    `);
    const item = el.querySelector('au-accordion-item');
    expect(item.open).to.be.true;
    item.removeAttribute('open');
    expect(item.open).to.be.false;
  });

  it('open property setter updates attribute and DOM', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Title</span>
          <div slot="content">Content</div>
        </au-accordion-item>
      </au-accordion>
    `);
    const item = el.querySelector('au-accordion-item');
    const button = item.shadowRoot.querySelector('button');
    const region = item.shadowRoot.querySelector('div[role="region"]');

    item.open = true;
    expect(item.hasAttribute('open')).to.be.true;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
    expect(region.getAttribute('hidden')).to.be.null;

    item.open = false;
    expect(item.hasAttribute('open')).to.be.false;
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(region.getAttribute('hidden')).to.equal('');
  });

  it('dispatches au-toggle event with correct detail on click', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Title</span>
          <div slot="content">Content</div>
        </au-accordion-item>
      </au-accordion>
    `);
    const item = el.querySelector('au-accordion-item');
    const button = item.shadowRoot.querySelector('button');

    let lastEvent = null;
    el.addEventListener('au-toggle', (e) => { lastEvent = e; });

    button.click();
    expect(lastEvent).to.not.be.null;
    expect(lastEvent.detail.open).to.be.true;
    expect(lastEvent.bubbles).to.be.true;
    expect(lastEvent.composed).to.be.true;

    button.click();
    expect(lastEvent.detail.open).to.be.false;
  });

  it('exclusive mode closes other items when one opens', async () => {
    const el = await fixture(html`
      <au-accordion exclusive>
        <au-accordion-item>
          <span slot="heading">Item 1</span>
          <div slot="content">Content 1</div>
        </au-accordion-item>
        <au-accordion-item>
          <span slot="heading">Item 2</span>
          <div slot="content">Content 2</div>
        </au-accordion-item>
        <au-accordion-item>
          <span slot="heading">Item 3</span>
          <div slot="content">Content 3</div>
        </au-accordion-item>
      </au-accordion>
    `);
    const [item1, item2, item3] = el.querySelectorAll('au-accordion-item');

    item1.shadowRoot.querySelector('button').click();
    expect(item1.open).to.be.true;
    expect(item2.open).to.be.false;
    expect(item3.open).to.be.false;

    item2.shadowRoot.querySelector('button').click();
    expect(item1.open).to.be.false;
    expect(item2.open).to.be.true;
    expect(item3.open).to.be.false;
  });

  it('exclusive mode sets aria-describedby on container', async () => {
    const el = await fixture(html`<au-accordion exclusive></au-accordion>`);
    const container = el.shadowRoot.querySelector('.au-accordion');
    const hint = el.shadowRoot.querySelector('[id^="au-accordion-hint-"]');
    expect(hint).to.not.be.null;
    expect(container.getAttribute('aria-describedby')).to.equal(hint.id);
    expect(hint.textContent.length).to.be.greaterThan(0);
  });

  it('uses localized exclusive hint text and updates when the attribute changes', async () => {
    const el = await fixture(html`
      <au-accordion exclusive data-text-exclusive-hint="一次只能展開一個區塊"></au-accordion>
    `);
    const hint = el.shadowRoot.querySelector('[id^="au-accordion-hint-"]');
    expect(hint.textContent).to.equal('一次只能展開一個區塊');

    el.setAttribute('data-text-exclusive-hint', '一次只能開啟一個項目');
    expect(hint.textContent).to.equal('一次只能開啟一個項目');
  });

  it('non-exclusive mode removes aria-describedby from container', async () => {
    const el = await fixture(html`<au-accordion></au-accordion>`);
    const container = el.shadowRoot.querySelector('.au-accordion');
    expect(container.hasAttribute('aria-describedby')).to.be.false;
  });

  it('non-exclusive mode allows multiple items open', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Item 1</span>
          <div slot="content">Content 1</div>
        </au-accordion-item>
        <au-accordion-item>
          <span slot="heading">Item 2</span>
          <div slot="content">Content 2</div>
        </au-accordion-item>
      </au-accordion>
    `);
    const [item1, item2] = el.querySelectorAll('au-accordion-item');

    item1.shadowRoot.querySelector('button').click();
    item2.shadowRoot.querySelector('button').click();
    expect(item1.open).to.be.true;
    expect(item2.open).to.be.true;
  });

  it('displays content in slots correctly', async () => {
    const el = await fixture(html`
      <au-accordion>
        <au-accordion-item>
          <span slot="heading">Custom Heading</span>
          <div slot="content">Custom Content</div>
          <div slot="sub">Sub Info</div>
          <div slot="icon">Icon</div>
        </au-accordion-item>
      </au-accordion>
    `);

    const accordionItem = el.querySelector('au-accordion-item');
    const headingSlot = accordionItem.shadowRoot.querySelector('slot[name="heading"]');
    const contentSlot = accordionItem.shadowRoot.querySelector('slot[name="content"]');
    const subSlot = accordionItem.shadowRoot.querySelector('slot[name="sub"]');
    const iconSlot = accordionItem.shadowRoot.querySelector('slot[name="icon"]');

    // Fetch slotted content by assignedNodes()
    const headingContent = headingSlot.assignedNodes()[0].textContent;
    const contentContent = contentSlot.assignedNodes()[0].textContent;
    const subContent = subSlot.assignedNodes()[0].textContent;
    const iconContent = iconSlot.assignedNodes()[0].textContent;

    expect(headingContent).to.equal('Custom Heading');
    expect(contentContent).to.equal('Custom Content');
    expect(subContent).to.equal('Sub Info');
    expect(iconContent).to.equal('Icon');
  });
});
