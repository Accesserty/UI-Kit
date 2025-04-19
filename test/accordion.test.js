// accordion.test.js
import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/accordion/accordion.js';

describe('RyAccordion and RyAccordionItem', () => {
  it('renders the correct number of RyAccordionItem components', async () => {
    const el = await fixture(html`
      <ry-accordion>
        <ry-accordion-item open>
          <span slot="heading">Accordion Title 1</span>
          <div slot="content">Accordion Content 1</div>
        </ry-accordion-item>
        <ry-accordion-item>
          <span slot="heading">Accordion Title 2</span>
          <div slot="content">Accordion Content 2</div>
        </ry-accordion-item>
      </ry-accordion>
    `);

    const accordionItems = el.querySelectorAll('ry-accordion-item');
    expect(accordionItems.length).to.equal(2);
  });

  it('toggles the accordion item on click', async () => {
    const el = await fixture(html`
      <ry-accordion>
        <ry-accordion-item>
          <span slot="heading">Accordion Title</span>
          <div slot="content">Accordion Content</div>
        </ry-accordion-item>
      </ry-accordion>
    `);

    const accordionItem = el.querySelector('ry-accordion-item');
    expect(accordionItem.hasAttribute('open')).to.be.false;
    
    const button = accordionItem.shadowRoot.querySelector('button');
    const region = accordionItem.shadowRoot.querySelector('div[role="region"]');
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(region.getAttribute('aria-hidden')).to.be.equal('true');

    // Simulate click to expand
    button.click();
    await accordionItem.updateComplete;
    expect(accordionItem.hasAttribute('open')).to.be.true;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
    expect(region.getAttribute('aria-hidden')).to.be.equal('false');

    // Simulate another click to collapse
    button.click();
    await accordionItem.updateComplete;
    expect(accordionItem.hasAttribute('open')).to.be.false;
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(region.getAttribute('aria-hidden')).to.be.equal('true');

  });

  it('assigns titleID and regionID correctly and ensures proper association', async () => {
    const el = await fixture(html`
      <ry-accordion>
        <ry-accordion-item>
          <span slot="heading">Accordion Title</span>
          <div slot="content">Accordion Content</div>
        </ry-accordion-item>
      </ry-accordion>
    `);

    const accordionItem = el.querySelector('ry-accordion-item');
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
      <ry-accordion>
        <ry-accordion-item>
          <span slot="heading">Custom Heading</span>
          <div slot="content">Custom Content</div>
          <div slot="sub">Sub Info</div>
          <div slot="icon">Icon</div>
        </ry-accordion-item>
      </ry-accordion>
    `);

    const accordionItem = el.querySelector('ry-accordion-item');
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
