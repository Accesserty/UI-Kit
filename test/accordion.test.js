// accordion.test.js
import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/accordion.js';

// Collapsed regions stay searchable (hidden="until-found") where the browser can
// reveal them, and fall back to hidden + inert elsewhere.
const untilFound = customElements.get('au-accordion-item').supportsUntilFound;
const collapsedHidden = untilFound ? 'until-found' : '';

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
    expect(region.getAttribute('hidden')).to.equal(collapsedHidden);
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
    expect(region.getAttribute('hidden')).to.equal(collapsedHidden);

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
    const titleId = button.getAttribute('id');
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
    expect(region.getAttribute('hidden')).to.equal(collapsedHidden);
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
    const hint = el.shadowRoot.querySelector('#hint');
    expect(hint).to.not.be.null;
    expect(container.getAttribute('aria-describedby')).to.equal(hint.id);
    expect(hint.textContent.length).to.be.greaterThan(0);
  });

  it('uses localized exclusive hint text and updates when the attribute changes', async () => {
    const el = await fixture(html`
      <au-accordion exclusive data-text-exclusive-hint="一次只能展開一個區塊"></au-accordion>
    `);
    const hint = el.shadowRoot.querySelector('#hint');
    expect(hint.textContent).to.equal('一次只能展開一個區塊');

    el.setAttribute('data-text-exclusive-hint', '一次只能開啟一個項目');
    expect(hint.textContent).to.equal('一次只能開啟一個項目');
  });

  it('non-exclusive mode removes aria-describedby from container', async () => {
    const el = await fixture(html`<au-accordion></au-accordion>`);
    const container = el.shadowRoot.querySelector('.au-accordion');
    const hint = el.shadowRoot.querySelector('#hint');
    expect(container.hasAttribute('aria-describedby')).to.be.false;
    expect(hint.hidden).to.be.true;
    expect(hint.textContent).to.equal('');
  });

  it('exposes instructions only while exclusive and restores the current language when re-enabled', async () => {
    const el = await fixture(html`<au-accordion data-text-exclusive-hint="一次只能展開一項">
      <au-accordion-item open><span slot="heading">One</span></au-accordion-item>
      <au-accordion-item open><span slot="heading">Two</span></au-accordion-item>
    </au-accordion>`);
    const hint = el.shadowRoot.querySelector('#hint');
    const [first, second] = el.children;
    expect(first.open && second.open).to.be.true;
    expect(hint.textContent).to.equal('');
    first.button.focus();

    el.exclusive = true;
    expect(hint.hidden).to.be.false;
    expect(hint.textContent).to.equal('一次只能展開一項');
    expect(second.open).to.be.false;
    expect(first.button.getAttribute('aria-describedby')).to.equal(first._hint.id);
    expect(first._hint.textContent).to.equal(hint.textContent);

    el.exclusive = false;
    expect(hint.hidden).to.be.true;
    expect(hint.textContent).to.equal('');
    expect(first._hint.textContent).to.equal('');
    expect(first.button.hasAttribute('aria-describedby')).to.be.false;
    el.setAttribute('data-text-exclusive-hint', 'Only one panel at a time.');
    expect(hint.textContent).to.equal('');
    second.open = true;
    expect(first.open && second.open).to.be.true;

    el.exclusive = true;
    expect(hint.hidden).to.be.false;
    expect(hint.textContent).to.equal('Only one panel at a time.');
    expect(first._hint.textContent).to.equal(hint.textContent);
    expect(first.shadowRoot.activeElement).to.equal(first.button);
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

  it('keeps the heading from pushing status and icon outside narrow headers', async () => {
    const el = await fixture(html`
      <div style="width: 320px;">
        <au-accordion>
          <au-accordion-item>
            <span slot="heading">https://accesserty.com/?code=6e46c637-8180-49fc-8480-0cd77f3a9f63</span>
            <span slot="sub">High</span>
            <span slot="icon">▼</span>
            <div slot="content">Content</div>
          </au-accordion-item>
        </au-accordion>
      </div>
    `);

    const accordionItem = el.querySelector('au-accordion-item');
    const button = accordionItem.shadowRoot.querySelector('button');
    const heading = accordionItem.shadowRoot.querySelector('.heading');
    const info = accordionItem.shadowRoot.querySelector('.info');
    const icon = accordionItem.shadowRoot.querySelector('.icon');

    const buttonRect = button.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();

    expect(buttonRect.width).to.be.at.most(320);
    expect(headingRect.right).to.be.at.most(infoRect.left);
    expect(infoRect.right).to.be.at.most(buttonRect.right);
    expect(iconRect.width).to.be.greaterThan(0);
  });

  it('does not let a nested toggle close its containing exclusive item', async () => {
    const el = await fixture(html`<au-accordion exclusive><au-accordion-item open>
      <span slot="heading">Outer</span><div slot="content"><au-accordion exclusive>
        <au-accordion-item><span slot="heading">Inner</span></au-accordion-item>
      </au-accordion></div></au-accordion-item><au-accordion-item></au-accordion-item></au-accordion>`);
    const outer = el.firstElementChild, inner = outer.querySelector('au-accordion-item');
    inner.button.click();
    expect(inner.open).to.be.true;expect(outer.open).to.be.true;
  });

  it('normalizes initial, inserted and enabled exclusive state without affecting nested groups', async () => {
    const el = await fixture(html`<au-accordion exclusive><au-accordion-item open></au-accordion-item><au-accordion-item open></au-accordion-item></au-accordion>`);
    const [a,b] = el.children;
    expect(a.open).to.be.true;expect(b.open).to.be.false;
    const c = document.createElement('au-accordion-item');c.open=true;el.append(c);await nextFrame();
    expect(c.open).to.be.false;
    el.exclusive=false;b.open=true;c.open=true;el.exclusive=true;
    expect([...el.children].map(n=>n.open)).to.deep.equal([true,false,false]);
    b.open=true;expect(a.open).to.be.false;expect(b.open).to.be.true;
  });

  it('returns slotted and nested-shadow focus before hiding, but does not steal external focus', async () => {
    const host = await fixture(html`<div><button id="outside">Outside</button><au-accordion-item open>
      <span slot="heading">Details</span><div slot="content"><button id="inside">Inside</button><span id="nested"></span></div>
    </au-accordion-item></div>`);
    const item=host.querySelector('au-accordion-item');
    host.querySelector('#inside').focus();item.open=false;
    expect(item.shadowRoot.activeElement).to.equal(item.button);expect(item.region.inert).to.equal(!untilFound);
    item.open=true;
    const shadow=host.querySelector('#nested').attachShadow({mode:'open'});shadow.innerHTML='<button>Nested</button>';
    shadow.firstElementChild.focus();item.open=false;
    expect(item.shadowRoot.activeElement).to.equal(item.button);
    host.querySelector('#outside').focus();item.open=true;item.open=false;
    expect(document.activeElement).to.equal(host.querySelector('#outside'));
  });

  it('exposes configurable heading levels and optional named regions without replacing controls', async () => {
    const item=await fixture(html`<au-accordion-item heading-level="2"><span slot="heading">Title</span></au-accordion-item>`);
    expect(item.heading.getAttribute('aria-level')).to.equal('2');expect(item.button.parentElement).to.equal(item.heading);
    expect(item.region.getAttribute('aria-labelledby')).to.equal(item.button.id);
    item.button.focus();const original=item.button;
    item.querySelector('[slot=heading]').textContent='翻譯';item.setAttribute('heading-level','4');
    expect(item.heading.getAttribute('aria-level')).to.equal('4');expect(item.shadowRoot.activeElement).to.equal(original);
    for(const value of ['0','7','2.5','abc','']){item.setAttribute('heading-level',value);expect(item.heading.getAttribute('aria-level')).to.equal('3');}
    item.setAttribute('no-region','');expect(item.region.hasAttribute('role')).to.be.false;
    item.open=true;expect(item.region.hidden).to.be.false;
    item.removeAttribute('no-region');expect(item.region.getAttribute('role')).to.equal('region');
  });

  it('describes the actual trigger and updates the hint without focus loss', async () => {
    const el=await fixture(html`<au-accordion exclusive><au-accordion-item><span slot="heading">Title</span></au-accordion-item></au-accordion>`);
    const item=el.firstElementChild;item.button.focus();
    expect(item.button.getAttribute('aria-describedby')).to.equal(item._hint.id);
    el.setAttribute('data-text-exclusive-hint','一次只能開啟一個區塊');
    expect(item._hint.textContent).to.equal('一次只能開啟一個區塊');expect(item.shadowRoot.activeElement).to.equal(item.button);
    el.exclusive=false;expect(item.button.hasAttribute('aria-describedby')).to.be.false;
  });

  it('keeps single state-change notifications after reconnects including programmatic changes', async () => {
    const wrapper=await fixture(html`<div><au-accordion><au-accordion-item></au-accordion-item></au-accordion></div>`);
    const el=wrapper.firstElementChild,item=el.firstElementChild,events=[];
    el.addEventListener('au-toggle',e=>events.push(e.detail.open));
    for(let i=0;i<3;i++){el.remove();wrapper.append(el);item.remove();el.append(item);}
    item.button.click();item.open=true;item.open=false;
    expect(events).to.deep.equal([true,false]);
  });

  it('upgrades open and exclusive assignments made before definition', async () => {
    const rootTag='test-accordion-'+crypto.randomUUID(),itemTag='test-item-'+crypto.randomUUID();
    const host=await fixture(html`<div></div>`),root=document.createElement(rootTag),item=document.createElement(itemTag);
    root.exclusive=true;item.open=true;root.append(item);host.append(root);
    customElements.define(itemTag,class extends customElements.get('au-accordion-item'){});
    customElements.define(rootTag,class extends customElements.get('au-accordion'){});
    expect(Object.hasOwn(item,'open')).to.be.false;expect(Object.hasOwn(root,'exclusive')).to.be.false;
    expect(item.hasAttribute('open')).to.be.true;expect(root.hasAttribute('exclusive')).to.be.true;
    expect(item.region.hidden).to.be.false;
  });

  it('opens a collapsed item when find-in-page or a link reveals its content', async () => {
    const el = await fixture(html`<au-accordion exclusive>
      <au-accordion-item open><span slot="heading">Returns</span><div slot="content">Seven days.</div></au-accordion-item>
      <au-accordion-item><span slot="heading">Shipping</span><div slot="content">
        <au-accordion-item id="ship-inner"><span slot="heading">Rates</span><div slot="content"><p id="ship-free">Free over 1000.</p></div></au-accordion-item>
      </div></au-accordion-item>
    </au-accordion>`);
    const [first, second] = el.children;
    expect(second.region.getAttribute('hidden')).to.equal(collapsedHidden);
    expect(second.region.inert).to.equal(!untilFound);
    if (!untilFound) return;
    const events = [];
    el.addEventListener('au-toggle', e => events.push(e.detail.open));
    second.region.dispatchEvent(new Event('beforematch'));
    expect(second.open).to.be.true;
    expect(second.button.getAttribute('aria-expanded')).to.equal('true');
    // The browser removes hidden after the event; removing it during the event
    // stops Chrome from revealing enclosing items. The item resyncs afterwards.
    expect(second.region.getAttribute('hidden')).to.equal('until-found');
    await new Promise(resolve => setTimeout(resolve));
    expect(second.region.hasAttribute('hidden')).to.be.false;
    expect(first.open).to.be.false;
    expect(first.region.getAttribute('hidden')).to.equal('until-found');
    // The group closes the other item while the opening event is still dispatching.
    expect(events).to.deep.equal([false, true]);
    // A real fragment navigation into collapsed content runs the same path,
    // including nested items: the outer one must open too.
    const inner = el.querySelector('#ship-inner');
    second.open = false; first.open = false; events.length = 0;
    location.hash = 'ship-free';
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(inner.open).to.be.true;
    expect(second.open).to.be.true;
    expect(el.querySelector('#ship-free').checkVisibility()).to.be.true;
    expect(events).to.deep.equal([true, true]);
    history.replaceState(null, '', location.pathname + location.search);
  });

  it('falls back to hidden + inert where until-found is unsupported', async () => {
    const Item = customElements.get('au-accordion-item'), saved = Item.supportsUntilFound;
    Item.supportsUntilFound = false;
    try {
      const item = await fixture(html`<au-accordion-item><span slot="heading">Q</span><div slot="content"><button>A</button></div></au-accordion-item>`);
      expect(item.region.getAttribute('hidden')).to.equal('');
      expect(item.region.inert).to.be.true;
      expect(getComputedStyle(item.region).display).to.equal('none');
      item.open = true;
      expect(item.region.hasAttribute('hidden')).to.be.false;
      expect(item.region.inert).to.be.false;
    } finally {
      Item.supportsUntilFound = saved;
    }
  });

  it('does not emit au-toggle for the open state an element is upgraded with', async () => {
    const tag = 'test-upgrade-item-' + crypto.randomUUID();
    const host = await fixture(html`<div></div>`);
    host.innerHTML = `<${tag} open><span slot="heading">A</span></${tag}>`;
    const events = [];
    host.addEventListener('au-toggle', e => events.push(e.detail.open));
    customElements.define(tag, class extends customElements.get('au-accordion-item') {});
    const item = host.firstElementChild;
    expect(item.open).to.be.true;
    expect(item.button.getAttribute('aria-expanded')).to.equal('true');
    await nextFrame();
    expect(events).to.deep.equal([]);
    item.open = false;
    expect(events).to.deep.equal([false]);
  });

  it('still emits for a change made right after an element is created', () => {
    const item = document.createElement('au-accordion-item');
    document.body.append(item);
    const events = [];
    item.addEventListener('au-toggle', e => events.push(e.detail.open));
    item.open = true;
    item.remove();
    expect(events).to.deep.equal([true]);
  });
});
