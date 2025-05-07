import { html, fixture, expect } from '@open-wc/testing';
import '../src/tabs.js';

describe('AuTabs with <div class="au-tab-panel">', () => {
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

  it('focuses the corresponding panel on Tab key press', async () => {
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
  });

  it('associates tab and panel with correct ARIA attributes', async () => {
    const el = await fixture(html`
      <au-tabs>
        <div class="au-tab-panel" slot="panel" id="my-panel" label="My Tab">My Content</div>
      </au-tabs>
    `);

    const tab = el.shadowRoot.querySelector('[role="tab"]');
    const panel = el.querySelector('.au-tab-panel');

    expect(panel.getAttribute('aria-labelledby')).to.equal(tab.id);
    expect(tab.getAttribute('aria-controls')).to.equal(panel.id);
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
