import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/checkbox/checkbox.js';

describe('RyCheckbox', () => {
  it('renders the checkbox with default properties', async () => {
    const el = await fixture(html`<ry-checkbox></ry-checkbox>`);
    const input = el.shadowRoot.querySelector('input');

    expect(input).to.exist;
    expect(input.type).to.equal('checkbox');
    expect(input.name).to.equal('default-checkbox');
    expect(input.value).to.equal('default');
    expect(input.checked).to.be.false;
    expect(input.disabled).to.be.false;
  });

  it('sets the name, value, checked, and disabled properties correctly', async () => {
    const el = await fixture(html`
      <ry-checkbox
        name="test-checkbox"
        value="Checkbox_value"
        checked
        disabled
      ></ry-checkbox>
    `);
    const input = el.shadowRoot.querySelector('input');

    expect(input.name).to.equal('test-checkbox');
    expect(input.value).to.equal('Checkbox_value');
    expect(input.checked).to.be.true;
    expect(input.disabled).to.be.true;
  });

  it('renders slot content correctly', async () => {
    const el = await fixture(html`
      <ry-checkbox>Checkbox Label</ry-checkbox>
    `);
    const textSlot = el.shadowRoot.querySelector('slot');
    const assignedNodes = textSlot.assignedNodes();

    expect(assignedNodes.length).to.equal(1);
    expect(assignedNodes[0].textContent).to.equal('Checkbox Label');
  });

  it('dispatches a change event when the checkbox is clicked', async () => {
    const el = await fixture(html`
      <ry-checkbox></ry-checkbox>
    `);
    const input = el.shadowRoot.querySelector('input');
    let changeEventDetail = null;

    el.addEventListener('change', (event) => {
      changeEventDetail = event.detail;
    });

    input.click();
    await el.updateComplete;

    expect(changeEventDetail).to.be.true;

    input.click();
    await el.updateComplete;

    expect(changeEventDetail).to.be.false;
  });

  it('reflects attribute changes to the checkbox element', async () => {
    const el = await fixture(html`
      <ry-checkbox></ry-checkbox>
    `);
    const input = el.shadowRoot.querySelector('input');

    el.setAttribute('checked', '');
    await el.updateComplete;
    expect(input.checked).to.be.true;

    el.removeAttribute('checked');
    await el.updateComplete;
    expect(input.checked).to.be.false;

    el.setAttribute('disabled', '');
    await el.updateComplete;
    expect(input.disabled).to.be.true;

    el.removeAttribute('disabled');
    await el.updateComplete;
    expect(input.disabled).to.be.false;
  });

  it('generates a unique ID for each checkbox instance', async () => {
    const el1 = await fixture(html`<ry-checkbox></ry-checkbox>`);
    const el2 = await fixture(html`<ry-checkbox></ry-checkbox>`);
    const input1 = el1.shadowRoot.querySelector('input');
    const input2 = el2.shadowRoot.querySelector('input');

    expect(input1.id).to.not.equal(input2.id);
  });
});