import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/tabs.js';

describe('AuTabs with <div class="au-tab-panel">', () => {
  it('uses visual horizontal direction under inherited and changing RTL', async () => {
    const box=await fixture(html`<div dir="rtl"><au-tabs><div class="au-tab-panel" slot="panel" label="One">One</div><div class="au-tab-panel" slot="panel" label="Two">Two</div><div class="au-tab-panel" slot="panel" label="Three">Three</div></au-tabs></div>`);
    const el=box.querySelector('au-tabs'),tabs=[...el.shadowRoot.querySelectorAll('[role=tab]')];
    const press=key=>el.shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,composed:true,cancelable:true}));
    tabs[0].focus();press('ArrowLeft');expect(el.shadowRoot.activeElement).to.equal(tabs[1]);
    press('ArrowRight');expect(el.shadowRoot.activeElement).to.equal(tabs[0]);
    press('End');expect(el.shadowRoot.activeElement).to.equal(tabs[2]);
    press('Home');expect(el.shadowRoot.activeElement).to.equal(tabs[0]);
    box.dir='ltr';press('ArrowRight');expect(el.shadowRoot.activeElement).to.equal(tabs[1]);
  });

  it('preserves panel IDs, tab nodes and focus across label and language changes', async () => {
    const el = await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel" id="stable-one" label="One">One</div><div class="au-tab-panel" slot="panel" id="stable-two" label="Two">Two</div></au-tabs>`);
    const tab = el.shadowRoot.querySelectorAll('[role=tab]')[1];tab.click();
    el.lastElementChild.setAttribute('label', '第二頁');el.lastElementChild.setAttribute('label-lang','zh-Hant');await nextFrame();
    expect(el.lastElementChild.id).to.equal('stable-two');
    expect(el.shadowRoot.querySelectorAll('[role=tab]')[1]).to.equal(tab);
    expect(tab.querySelector('.label').textContent).to.equal('第二頁');
    expect(tab.querySelector('.label').lang).to.equal('zh-Hant');expect(el.shadowRoot.activeElement).to.equal(tab);
  });

  it('preserves the selected panel through reorder and selects a neighbor after removal', async () => {
    const el = await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel" label="One">One</div><div class="au-tab-panel" slot="panel" label="Two">Two</div></au-tabs>`);
    const panel=el.lastElementChild;el.shadowRoot.querySelectorAll('[role=tab]')[1].click();
    el.prepend(panel);await nextFrame();expect(el.selectedIndex).to.equal(0);expect(panel.hidden).to.be.false;
    panel.remove();await nextFrame();expect(el.selectedIndex).to.equal(0);
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('[role=tab]'));
    expect(panel.hasAttribute('aria-hidden')).to.be.false;expect(panel.hasAttribute('role')).to.be.false;
  });

  it('makes inactive panels inert and gives plain-text panels a native Tab stop', async () => {
    const el=await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel">One</div><div class="au-tab-panel" slot="panel"><button>Other</button></div></au-tabs>`);
    expect(el.firstElementChild.tabIndex).to.equal(0);
    expect(el.lastElementChild.hidden).to.be.true;expect(el.lastElementChild.inert).to.be.true;
  });

  it('does not cancel vertical arrow scrolling in a horizontal tab list', async () => {
    const el=await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel">One</div><div class="au-tab-panel" slot="panel">Two</div></au-tabs>`);
    const event=new KeyboardEvent('keydown',{key:'ArrowDown',cancelable:true,bubbles:true});
    el.shadowRoot.querySelector('[role=tab]').dispatchEvent(event);
    expect(event.defaultPrevented).to.be.false;expect(el.selectedIndex).to.equal(0);
  });

  it('emits one event per actual user change after reconnect, not repeated activation', async () => {
    const wrapper=await fixture(html`<div><button id="outside">Outside</button><au-tabs><div class="au-tab-panel" slot="panel" label="One">One</div><div class="au-tab-panel" slot="panel">Two</div></au-tabs></div>`);
    const el=wrapper.lastElementChild;el.remove();wrapper.append(el);await nextFrame();
    const events=[];el.addEventListener('tab-change',e=>events.push(e.detail));
    const tab=el.shadowRoot.querySelectorAll('[role=tab]')[1];tab.click();tab.click();
    expect(events).to.deep.equal([{index:1,label:'Tab 2'}]);
    wrapper.firstElementChild.focus();el.selectedIndex=0;expect(events).to.have.length(1);
    expect(document.activeElement).to.equal(wrapper.firstElementChild);
  });

  it('handles empty groups, invalid indexes and initial selected-index safely', async () => {
    const el=await fixture(html`<au-tabs selected-index="1"></au-tabs>`);
    expect(el.selectedIndex).to.equal(-1);el.selectedIndex=1;
    el.innerHTML='<div slot="panel" class="au-tab-panel">One</div><div slot="panel" class="au-tab-panel">Two</div>';await nextFrame();
    expect(el.selectedIndex).to.equal(1);
    for(const value of [NaN,Infinity,-1,0.5,'wrong']){el.selectedIndex=value;expect(el.selectedIndex).to.equal(1);}
    el.selectedIndex=99;expect(el.selectedIndex).to.equal(1);
  });

  it('names the tablist through external references and links tabs to their panels', async () => {
    const wrapper=await fixture(html`<div><span id="tabs-name">Account</span><au-tabs aria-labelledby="tabs-name"><div class="au-tab-panel" slot="panel">One</div></au-tabs></div>`);
    const el=wrapper.lastElementChild;
    expect(el.tabsList.ariaLabelledByElements).to.deep.equal([wrapper.firstElementChild]);
    expect(el.shadowRoot.querySelector('[role=tab]').ariaControlsElements).to.deep.equal([el.firstElementChild]);
  });

  it('resolves multiple external names and updates a replacement reference', async () => {
    const wrapper=await fixture(html`<div><span id="tabs-label-one">Account</span><span id="tabs-label-two">Settings</span><au-tabs aria-labelledby="tabs-label-one tabs-label-two"><div class="au-tab-panel" slot="panel">One</div></au-tabs></div>`);
    const el=wrapper.lastElementChild;
    expect(el.tabsList.ariaLabelledByElements).to.deep.equal([wrapper.children[0],wrapper.children[1]]);
    const replacement=wrapper.firstElementChild.cloneNode(true);replacement.textContent='Profile';wrapper.firstElementChild.replaceWith(replacement);await nextFrame();
    expect(el.tabsList.ariaLabelledByElements[0]).to.equal(replacement);
  });

  it('updates badges and fallback language without resetting the selected tab', async () => {
    const el=await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel">One</div><div class="au-tab-panel" slot="panel" data-badge="0">Two</div></au-tabs>`);
    const tab=el.shadowRoot.querySelectorAll('[role=tab]')[1];tab.click();
    el.setAttribute('data-text-tab','頁籤 {index}');el.setAttribute('data-text-tab-lang','zh-Hant');
    el.lastElementChild.setAttribute('data-badge','3');el.setAttribute('data-text-badge-label-prefix','數量：');await nextFrame();
    expect(tab.querySelector('.label').lang).to.equal('zh-Hant');
    expect(tab.querySelector('.badge').getAttribute('aria-label')).to.equal('數量： 3');
    expect(el.selectedIndex).to.equal(1);expect(el.shadowRoot.activeElement).to.equal(tab);
  });

  it('recovers focus from a removed active panel and handles removal of all panels', async () => {
    const el=await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel"><button>First</button></div><div class="au-tab-panel" slot="panel">Two</div></au-tabs>`);
    el.querySelector('button').focus();el.firstElementChild.remove();await nextFrame();
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('[role=tab]'));
    el.lastElementChild.remove();await nextFrame();expect(el.selectedIndex).to.equal(-1);expect(el.shadowRoot.activeElement).to.equal(el.tabsList);
  });

  it('keeps nested tab state independent', async () => {
    const el=await fixture(html`<au-tabs><div class="au-tab-panel" slot="panel"><au-tabs><div class="au-tab-panel" slot="panel">Inner one</div><div class="au-tab-panel" slot="panel">Inner two</div></au-tabs></div><div class="au-tab-panel" slot="panel">Outer two</div></au-tabs>`);
    const inner=el.querySelector('au-tabs');inner.shadowRoot.querySelectorAll('[role=tab]')[1].click();await nextFrame();
    expect(inner.selectedIndex).to.equal(1);expect(el.selectedIndex).to.equal(0);
  });
  it('renders the correct number of tab panels', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" id="tab1" label="Tab 1">Content 1</div>
        <div class="au-tab-panel" slot="panel" id="tab2" label="Tab 2">Content 2</div>
      </au-tabs>
    `);

    const panels = el.querySelectorAll('.au-tab-panel');
    expect(panels.length).to.equal(2);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(tabs.length).to.equal(2);
  });

  it('selects a tab on click and updates aria attributes correctly', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" id="tab1" label="Tab 1">Content 1</div>
        <div class="au-tab-panel" slot="panel" id="tab2" label="Tab 2">Content 2</div>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    const panels = el.querySelectorAll('.au-tab-panel');

    tabs[1].click();
    await new Promise(r => setTimeout(r));

    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');
    expect(panels[1].getAttribute('aria-hidden')).to.equal('false');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('false');
    expect(panels[0].getAttribute('aria-hidden')).to.equal('true');
  });

  it('navigates tabs using arrow keys with wrap-around', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="Tab 1">Content 1</div>
        <div class="au-tab-panel" slot="panel" label="Tab 2">Content 2</div>
        <div class="au-tab-panel" slot="panel" label="Tab 3">Content 3</div>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');

    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await new Promise(r => setTimeout(r));
    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await new Promise(r => setTimeout(r));
    expect(tabs[2].getAttribute('aria-selected')).to.equal('true');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await new Promise(r => setTimeout(r));
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await new Promise(r => setTimeout(r));
    expect(tabs[2].getAttribute('aria-selected')).to.equal('true');
  });

  it('keeps the active plain-text panel available in native Tab order', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="Tab 1">Content 1</div>
        <div class="au-tab-panel" slot="panel" label="Tab 2">Content 2</div>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');

    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await new Promise(r => setTimeout(r));

    const panel = el.querySelector('.au-tab-panel[aria-hidden="false"]');
    expect(panel).to.exist;
    expect(panel.textContent).to.include('Content 1');
    expect(panel.tabIndex).to.equal(0);
  });

  it('names the light-DOM panel and uses a real control reference from its tab', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" id="my-panel" label="My Tab">My Content</div>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');
    const panel = el.querySelector('.au-tab-panel');

    // A shadow-to-ancestor element reference is supported, unlike a raw ID string.
    expect(panel.getAttribute('aria-label')).to.equal('My Tab');
    expect(panel.hasAttribute('aria-labelledby')).to.equal(false);
    expect(tab.ariaControlsElements).to.deep.equal([panel]);
  });

  it('renders prefix, badge, and affix content correctly', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="Tab 1" data-prefix="Pre" data-badge="9+" data-affix="End">Panel 1</div>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');

    const prefix = tab.querySelector('.prefix');
    const badge = tab.querySelector('.badge');
    const affix = tab.querySelector('.affix');

    expect(prefix).to.exist;
    expect(prefix?.textContent).to.equal('Pre');

    expect(badge).to.exist;
    expect(badge?.textContent).to.equal('9+');

    expect(affix).to.exist;
    expect(affix?.textContent).to.equal('End');
  });

  it('supports localized fallback tab labels and badge aria-label prefix', async () => {
    const el = await fixture(html`
      <au-tabs data-text-tab="頁籤 {index}" data-text-badge-label-prefix="補充資訊：">
        <div class="au-tab-panel" slot="panel" data-badge="3">Panel 1</div>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');
    const label = tab.querySelector('.label');
    const badge = tab.querySelector('.badge');

    expect(label.textContent).to.equal('頁籤 1');
    expect(badge.getAttribute('aria-label')).to.equal('補充資訊： 3');
  });

  it('applies panel and fallback label language to generated tab labels', async () => {
    const el = await fixture(html`
      <au-tabs data-text-tab="頁籤 {index}" data-text-tab-lang="zh-Hant-TW">
        <div class="au-tab-panel" slot="panel" label="Settings" label-lang="en">Panel 1</div>
        <div class="au-tab-panel" slot="panel">Panel 2</div>
      </au-tabs>
    `);

    const labels = el.shadowRoot.querySelectorAll('.label');
    expect(labels[0].getAttribute('lang')).to.equal('en');
    expect(labels[1].getAttribute('lang')).to.equal('zh-Hant-TW');
  });

  it('preserves selected tab when localization attributes change', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="First">1</div>
        <div class="au-tab-panel" slot="panel" label="Second">2</div>
      </au-tabs>
    `);

    el.selectedIndex = 1;
    await new Promise(r => setTimeout(r));
    el.setAttribute('data-text-badge-label-prefix', 'Info:');
    await new Promise(r => setTimeout(r));

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(el.selectedIndex).to.equal(1);
    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('does not render prefix, badge, or affix if they are empty', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="Tab 1"></div>
        <div class="au-tab-panel" slot="panel" label="Tab 2" data-badge="0"></div>
      </au-tabs>
    `);

    const [tab1, tab2] = el.shadowRoot.querySelectorAll('[role="tab"]');

    expect(tab1.querySelector('.prefix')).to.be.null;
    expect(tab1.querySelector('.badge')).to.be.null;
    expect(tab1.querySelector('.affix')).to.be.null;

    const badge = tab2.querySelector('.badge');
    expect(badge).to.exist;
    expect(badge?.textContent).to.equal('0');
  });

  it('preserves HTML content inside panels', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="HTML">
          <h2>Heading</h2>
          <p><strong>Bold</strong> Text</p>
        </div>
      </au-tabs>
    `);

    const panel = el.querySelector('.au-tab-panel');
    expect(panel.querySelector('h2')).to.exist;
    expect(panel.querySelector('strong')).to.exist;
  });

  it('focuses the selected tab by default when switched programmatically', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" label="First">1</div>
        <div class="au-tab-panel" slot="panel" label="Second">2</div>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    el._selectTab(1);
    await new Promise(r => setTimeout(r));

    expect(tabs[1].getAttribute('tabindex')).to.equal('0');
    expect(tabs[0].getAttribute('tabindex')).to.equal('-1');
  });
});
