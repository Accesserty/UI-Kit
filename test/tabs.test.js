import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/tabs/tabs.js';

describe('AuTabs and AuTabPanel', () => {
  it('renders the correct number of AuTabPanel components', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="tab1" label="Tab 1">Content 1</au-tab-panel>
        <au-tab-panel id="tab2" label="Tab 2">Content 2</au-tab-panel>
      </au-tabs>
    `);

    const panels = el.querySelectorAll('au-tab-panel');
    expect(panels.length).to.equal(2);

    const shadowTabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(shadowTabs.length).to.equal(2);

    const tabPanels = el.shadowRoot.querySelectorAll('[role="tabpanel"]');
    expect(tabPanels.length).to.equal(2);
  });

  it('selects a tab on click and updates aria attributes correctly', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="tab1" label="Tab 1">Content 1</au-tab-panel>
        <au-tab-panel id="tab2" label="Tab 2">Content 2</au-tab-panel>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    const panels = el.shadowRoot.querySelectorAll('[role="tabpanel"]');

    tabs[1].click();
    await new Promise(r => setTimeout(r));

    expect(tabs[1].getAttribute('aria-selected')).to.equal('true');
    expect(panels[1].hidden).to.be.false;
    expect(tabs[0].getAttribute('aria-selected')).to.equal('false');
    expect(panels[0].hidden).to.be.true;
  });

  it('navigates tabs using arrow keys with wrap-around', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="tab1" label="Tab 1">Content 1</au-tab-panel>
        <au-tab-panel id="tab2" label="Tab 2">Content 2</au-tab-panel>
        <au-tab-panel id="tab3" label="Tab 3">Content 3</au-tab-panel>
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

  it('moves to corresponding panel on Tab key press', async () => {
  const el = await fixture(html`
    <au-tabs>
      <au-tab-panel id="tab1" label="Tab 1">Content 1</au-tab-panel>
      <au-tab-panel id="tab2" label="Tab 2">Content 2</au-tab-panel>
    </au-tabs>
  `);

  const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');

  tabs[0].focus();
  tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  await new Promise(r => setTimeout(r, 20));

  const selectedPanel = el.shadowRoot.querySelector('.au-tab-panel--selected');
  expect(selectedPanel).to.exist;
  expect(selectedPanel.textContent).to.include('Content 1');
  expect(el.shadowRoot.activeElement).to.equal(selectedPanel);
});

  it('associates tab and panel with correct ARIA attributes', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="my-panel" label="My Tab">My Content</au-tab-panel>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');
    const panel = el.shadowRoot.querySelector('[role="tabpanel"]');

    expect(panel.getAttribute('aria-labelledby')).to.equal(tab.id);
    expect(tab.getAttribute('aria-controls')).to.equal(panel.id);
  });

  it('renders prefix, badge, and affix content correctly', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="tab1" label="Tab 1" prefix="Pre" badge="9+" affix="End">Panel 1</au-tab-panel>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');

    expect(tab.querySelector('.prefix').textContent).to.equal('Pre');
    expect(tab.querySelector('.badge').textContent).to.equal('9+');
    expect(tab.querySelector('.affix').textContent).to.equal('End');
  });

  it('preserves HTML content inside au-tab-panel', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="html-panel" label="HTML">
          <h2>Heading</h2>
          <p><strong>Bold</strong> Text</p>
        </au-tab-panel>
      </au-tabs>
    `);

    const panel = el.shadowRoot.querySelector('[role="tabpanel"]');
    expect(panel.querySelector('h2')).to.exist;
    expect(panel.querySelector('strong')).to.exist;
  });

  it('focuses the selected tab by default when switched programmatically', async () => {
    const el = await fixture(html`
      <au-tabs>
        <au-tab-panel id="tab1" label="First">1</au-tab-panel>
        <au-tab-panel id="tab2" label="Second">2</au-tab-panel>
      </au-tabs>
    `);

    const tabs = el.shadowRoot.querySelectorAll('[role="tab"]');
    el._selectTab(1);
    await new Promise(r => setTimeout(r));
    expect(tabs[1].getAttribute('tabindex')).to.equal('0');
    expect(tabs[0].getAttribute('tabindex')).to.equal('-1');
  });
});
