import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/switch.js'; // 确保路径正确

describe('AuSwitch', () => {
  it('renders slot content correctly', async () => {
    const el = await fixture(html`
      <au-switch>
        Label Text
      </au-switch>
    `);

    const slot = el.shadowRoot.querySelector('slot');
    const assignedNodes = slot.assignedNodes();
    expect(assignedNodes.length).to.be.greaterThan(0);
    expect(assignedNodes[0].textContent.trim()).to.equal('Label Text');
  });

  it('sets the off and on text from attributes', async () => {
    const el = await fixture(html`
      <au-switch off="Inactive" on="Active">
        Label Text
      </au-switch>
    `);

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('Inactive');
    expect(onText.textContent).to.equal('Active');
  });

  it('sets the default off and on text when attributes are not provided', async () => {
    const el = await fixture(html`
      <au-switch>
        Label Text
      </au-switch>
    `);

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('');
    expect(onText.textContent).to.equal('');
  });

  it('toggles the checked state on click', async () => {
    const el = await fixture(html`
      <au-switch>
        Label Text
      </au-switch>
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
      <au-switch>
        Label Text
      </au-switch>
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
      <au-switch checked>
        Label Text
      </au-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    expect(input.checked).to.be.true;
  });

  it('sets the disabled attribute correctly', async () => {
    const el = await fixture(html`
      <au-switch disabled>
        Label Text
      </au-switch>
    `);

    const input = el.shadowRoot.querySelector('input');
    expect(input.disabled).to.be.true;
  });

  it('reflects attribute changes correctly', async () => {
    const el = await fixture(html`
      <au-switch>
        Label Text
      </au-switch>
    `);

    el.setAttribute('off', 'Inactive');
    el.setAttribute('on', 'Active');

    const offText = el.shadowRoot.querySelector('.off-text');
    const onText = el.shadowRoot.querySelector('.on-text');

    expect(offText.textContent).to.equal('Inactive');
    expect(onText.textContent).to.equal('Active');
  });

  it('checked property getter reflects internal input state', async () => {
    const el = await fixture(html`<au-switch checked>Label</au-switch>`);
    expect(el.checked).to.be.true;
  });

  it('checked property setter updates internal input', async () => {
    const el = await fixture(html`<au-switch>Label</au-switch>`);
    expect(el.checked).to.be.false;

    el.checked = true;
    expect(el.hasAttribute('checked')).to.be.true;
    expect(el.shadowRoot.querySelector('input').checked).to.be.true;

    el.checked = false;
    expect(el.hasAttribute('checked')).to.be.false;
    expect(el.shadowRoot.querySelector('input').checked).to.be.false;
  });

  it('disabled property setter adds/removes attribute', async () => {
    const el = await fixture(html`<au-switch>Label</au-switch>`);
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
        <au-switch>Label</au-switch>
      </div>
    `);
    const el = wrapper.querySelector('au-switch');
    const input = el.shadowRoot.querySelector('input');

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });
    input.click();

    expect(received).to.be.true;
  });

  it('is form-associated: FormData captures the value when checked', async () => {
    const form = await fixture(html`
      <form>
        <au-switch name="newsletter" value="yes" checked>Subscribe</au-switch>
      </form>
    `);
    const formData = new FormData(form);
    expect(formData.get('newsletter')).to.equal('yes');
  });

  it('is form-associated: FormData has no entry when unchecked', async () => {
    const form = await fixture(html`
      <form>
        <au-switch name="newsletter" value="yes">Subscribe</au-switch>
      </form>
    `);
    const formData = new FormData(form);
    expect(formData.get('newsletter')).to.be.null;
  });

  it('formResetCallback resets to unchecked state', async () => {
    const form = await fixture(html`
      <form>
        <au-switch name="agree">Agree</au-switch>
        <button type="reset">Reset</button>
      </form>
    `);
    const el = form.querySelector('au-switch');
    const input = el.shadowRoot.querySelector('input');

    input.click();
    expect(input.checked).to.be.true;

    form.reset();
    expect(el.shadowRoot.querySelector('input').checked).to.be.false;
  });
});
