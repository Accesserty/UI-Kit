import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/switch/switch.js'; // 确保路径正确

describe('RySwitch', () => {
  it('renders slot content correctly', async () => {
    const el = await fixture(html`
      <ry-switch>
        Label Text
      </ry-switch>
    `);

    const slot = el.shadowRoot.querySelector('slot');
    const assignedNodes = slot.assignedNodes();
    expect(assignedNodes.length).to.be.greaterThan(0);
    expect(assignedNodes[0].textContent.trim()).to.equal('Label Text');
  });

  it('sets the off and on text from attributes', async () => {
    const el = await fixture(html`
      <ry-switch off="Inactive" on="Active">
        Label Text
      </ry-switch>
    `);

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('Inactive');
    expect(onText.textContent).to.equal('Active');
  });

  it('sets the default off and on text when attributes are not provided', async () => {
    const el = await fixture(html`
      <ry-switch>
        Label Text
      </ry-switch>
    `);

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('');
    expect(onText.textContent).to.equal('');
  });

  it('toggles the checked state on click', async () => {
    const el = await fixture(html`
      <ry-switch>
        Label Text
      </ry-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    expect(input.checked).to.be.false;

    input.click();
    expect(input.checked).to.be.true;

    input.click();
    expect(input.checked).to.be.false;
  });

  it('dispatches change event on state change', async () => {
    const el = await fixture(html`
      <ry-switch>
        Label Text
      </ry-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    let changed = false;

    el.addEventListener('change', () => {
      changed = true;
    });

    input.click();
    expect(changed).to.be.true;
  });

  it('sets the checked attribute correctly', async () => {
    const el = await fixture(html`
      <ry-switch checked>
        Label Text
      </ry-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    expect(input.checked).to.be.true;
  });

  it('sets the disabled attribute correctly', async () => {
    const el = await fixture(html`
      <ry-switch disabled>
        Label Text
      </ry-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    expect(input.disabled).to.be.true;
  });

  it('reflects attribute changes correctly', async () => {
    const el = await fixture(html`
      <ry-switch>
        Label Text
      </ry-switch>
    `);

    el.setAttribute('off', 'Inactive');
    el.setAttribute('on', 'Active');

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('Inactive');
    expect(onText.textContent).to.equal('Active');
  });
});
