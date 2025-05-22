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
