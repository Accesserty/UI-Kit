import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/card/card.js'; // Adjust the path to where your component is located

describe('RyCard', () => {
  it('has four slots for "heading", "media", "content", and "footer"', async () => {
    const el = await fixture(html`<ry-card></ry-card>`);
    const slots = el.shadowRoot.querySelectorAll('slot');
    const slotNames = Array.from(slots).map(slot => slot.name);
    expect(slotNames).to.include.members(['heading', 'media', 'content', 'footer']);
  });

  it('renders default slot content correctly', async () => {
    const el = await fixture(html`
      <ry-card>
        <div slot="heading">Header</div>
        <div slot="media">Media Content</div>
        <div slot="content">Main Content</div>
        <div slot="footer">Footer</div>
      </ry-card>
    `);
    
    const headingSlot = el.shadowRoot.querySelector('slot[name="heading"]');
    const assignedNodesHeading = headingSlot.assignedNodes({flatten: true});
    expect(assignedNodesHeading[0].textContent).to.equal('Header');

    const mediaSlot = el.shadowRoot.querySelector('slot[name="media"]');
    const assignedNodesMedia = mediaSlot.assignedNodes({flatten: true});
    expect(assignedNodesMedia[0].textContent).to.equal('Media Content');

    const contentSlot = el.shadowRoot.querySelector('slot[name="content"]');
    const assignedNodesContent = contentSlot.assignedNodes({flatten: true});
    expect(assignedNodesContent[0].textContent).to.equal('Main Content');

    const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');
    const assignedNodesFooter = footerSlot.assignedNodes({flatten: true});
    expect(assignedNodesFooter[0].textContent).to.equal('Footer');
  });

  it('renders slots in a specific order regardless of the provided order', async () => {
    const el = await fixture(html`
      <ry-card>
        <div slot="footer">Footer</div>
        <div slot="content">Main Content</div>
        <div slot="media">Media Content</div>
        <div slot="heading">Header</div>
      </ry-card>
    `);

    const slots = el.shadowRoot.querySelectorAll('slot');
    const slotNames = Array.from(slots).map(slot => slot.name);
    expect(slotNames).to.deep.equal(['heading', 'media', 'content', 'footer']);
  });
});