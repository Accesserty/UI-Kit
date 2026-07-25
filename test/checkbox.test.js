import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/checkbox.js';

describe('AuCheckbox', () => {
  it('renders the checkbox with default properties', async () => {
    const el = await fixture(html`<au-checkbox></au-checkbox>`);
    const input = el.shadowRoot.querySelector('input');

    expect(input).to.exist;
    expect(input.type).to.equal('checkbox');
    expect(input.name).to.equal('');
    expect(input.value).to.equal('on');
    expect(input.checked).to.be.false;
    expect(input.disabled).to.be.false;
  });

  it('sets the name, value, checked, and disabled properties correctly', async () => {
    const el = await fixture(html`
      <au-checkbox
        name="test-checkbox"
        value="Checkbox_value"
        checked
        disabled
      ></au-checkbox>
    `);
    const input = el.shadowRoot.querySelector('input');

    expect(input.name).to.equal('test-checkbox');
    expect(input.value).to.equal('Checkbox_value');
    expect(input.checked).to.be.true;
    expect(input.disabled).to.be.true;
  });

  it('renders slot content correctly', async () => {
    const el = await fixture(html`
      <au-checkbox>Checkbox Label</au-checkbox>
    `);
    const textSlot = el.shadowRoot.querySelector('slot');
    const assignedNodes = textSlot.assignedNodes();

    expect(assignedNodes.length).to.equal(1);
    expect(assignedNodes[0].textContent).to.equal('Checkbox Label');
  });

  it('uses label attribute as fallback slot text and updates it', async () => {
    const el = await fixture(html`<au-checkbox label="訂閱電子報"></au-checkbox>`);
    const slot = el.shadowRoot.querySelector('slot');
    const fallback = slot.querySelector('span');

    expect(fallback.textContent).to.equal('訂閱電子報');

    el.setAttribute('label', '接收通知');
    await nextFrame();
    expect(fallback.textContent).to.equal('接收通知');
  });

  it('passes aria-label and aria-labelledby to the internal checkbox', async () => {
    const el = await fixture(html`<au-checkbox aria-label="同意條款"></au-checkbox>`);
    const input = el.shadowRoot.querySelector('input');

    expect(input.getAttribute('aria-label')).to.equal('同意條款');

    el.removeAttribute('aria-label');
    el.setAttribute('aria-labelledby', 'terms-label');
    await nextFrame();
    expect(input.hasAttribute('aria-label')).to.be.false;
    expect(input.getAttribute('aria-labelledby')).to.equal('terms-label');
  });

  it('dispatches a change event when the checkbox is clicked', async () => {
    const el = await fixture(html`
      <au-checkbox></au-checkbox>
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
      <au-checkbox></au-checkbox>
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
    const el1 = await fixture(html`<au-checkbox></au-checkbox>`);
    const el2 = await fixture(html`<au-checkbox></au-checkbox>`);
    const input1 = el1.shadowRoot.querySelector('input');
    const input2 = el2.shadowRoot.querySelector('input');

    expect(input1.id).to.not.equal(input2.id);
  });

  it('checked property getter returns current checked state', async () => {
    const el = await fixture(html`<au-checkbox checked></au-checkbox>`);
    expect(el.checked).to.be.true;

    el.removeAttribute('checked');
    await nextFrame();
    expect(el.checked).to.be.false;
  });

  it('checked property setter updates the attribute', async () => {
    const el = await fixture(html`<au-checkbox></au-checkbox>`);
    el.checked = true;
    expect(el.hasAttribute('checked')).to.be.true;
    expect(el.shadowRoot.querySelector('input').checked).to.be.true;

    el.checked = false;
    expect(el.hasAttribute('checked')).to.be.false;
    expect(el.shadowRoot.querySelector('input').checked).to.be.false;
  });

  it('disabled property getter returns current disabled state', async () => {
    const el = await fixture(html`<au-checkbox disabled></au-checkbox>`);
    expect(el.disabled).to.be.true;
  });

  it('disabled property setter updates the attribute', async () => {
    const el = await fixture(html`<au-checkbox></au-checkbox>`);
    el.disabled = true;
    expect(el.hasAttribute('disabled')).to.be.true;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;

    el.disabled = false;
    expect(el.hasAttribute('disabled')).to.be.false;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.false;
  });

  it('change event is composed and bubbles across shadow DOM', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-checkbox></au-checkbox>
      </div>
    `);
    const el = wrapper.querySelector('au-checkbox');
    const input = el.shadowRoot.querySelector('input');

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });
    input.click();

    expect(received).to.be.true;
  });
});
