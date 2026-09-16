import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/card.js';

describe('AuCard', () => {
  it('has four slots for "heading", "media", "content", and "footer"', async () => {
    const el = await fixture(html`<au-card></au-card>`);
    const slots = el.shadowRoot.querySelectorAll('slot');
    const slotNames = Array.from(slots).map(slot => slot.name);
    expect(slotNames).to.include.members(['heading', 'media', 'content', 'footer']);
  });

  it('projects named slot content correctly', async () => {
    const el = await fixture(html`
      <au-card>
        <div slot="heading">Header</div>
        <div slot="media">Media Content</div>
        <div slot="content">Main Content</div>
        <div slot="footer">Footer</div>
      </au-card>
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
      <au-card>
        <div slot="footer">Footer</div>
        <div slot="content">Main Content</div>
        <div slot="media">Media Content</div>
        <div slot="heading">Header</div>
      </au-card>
    `);

    const slots = el.shadowRoot.querySelectorAll('slot');
    const slotNames = Array.from(slots).map(slot => slot.name);
    expect(slotNames).to.deep.equal(['heading', 'media', 'content', 'footer']);
  });

  it('keeps shell, slot identity and native control focus on repeated render calls', async () => {
    const el=await fixture(html`<au-card><h2 slot="heading">Title</h2><input slot="content" value="Initial"></au-card>`);
    const shell=el.shadowRoot.querySelector('.au-card-container'),slot=el.shadowRoot.querySelector('[name=content]'),input=el.querySelector('input');
    input.focus();el.render();el.render();
    expect(el.shadowRoot.querySelector('.au-card-container')).to.equal(shell);
    expect(el.shadowRoot.querySelector('[name=content]')).to.equal(slot);
    expect(document.activeElement).to.equal(input);
    el.querySelector('h2').textContent='翻譯';
    expect(document.activeElement).to.equal(input);
  });

  it('leaves native forms, click events and reset to consumer elements across reconnects', async () => {
    const form=await fixture(html`<form><au-card><input slot="content" name="title" value="Initial"><button slot="footer" type="button">Save</button></au-card></form>`);
    const el=form.firstElementChild,input=el.querySelector('input'),button=el.querySelector('button'),events=[];
    button.addEventListener('click',e=>events.push(e));
    input.value='Changed';expect(new FormData(form).get('title')).to.equal('Changed');
    for(let i=0;i<3;i++){el.remove();form.append(el);el.render();}
    button.click();expect(events).to.have.length(1);
    expect(new FormData(form).get('title')).to.equal('Changed');form.reset();expect(input.value).to.equal('Initial');
    expect(el.hasAttribute('role')).to.be.false;expect(el.hasAttribute('tabindex')).to.be.false;
  });

  it('is a shrinkable block, wraps long text, and respects hidden', async () => {
    const wrapper=await fixture(html`<div style="display:grid;grid-template-columns:1fr;width:160px"><au-card><p slot="content">LongUnbrokenTextLongUnbrokenTextLongUnbrokenTextLongUnbrokenText</p></au-card></div>`);
    const el=wrapper.firstElementChild;
    expect(getComputedStyle(el).display).to.equal('block');
    expect(wrapper.scrollWidth).to.be.at.most(160);
    el.hidden=true;expect(getComputedStyle(el).display).to.equal('none');
  });

  it('has no default slot and does not invent heading semantics from slot names', async () => {
    const el=await fixture(html`<au-card><span slot="heading">Plain title</span><p>Unassigned content</p></au-card>`);
    expect(el.shadowRoot.querySelector('slot:not([name])')).to.equal(null);
    expect(el.shadowRoot.querySelector('[role=heading],h1,h2,h3,h4,h5,h6')).to.equal(null);
    expect(el.querySelector('p').assignedSlot).to.equal(null);
  });
});
