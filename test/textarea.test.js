import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../src/components/textarea.js';

describe('AuTextarea', () => {
  it('renders label correctly', async () => {
    const el = await fixture(html`<au-textarea label="Description"></au-textarea>`);
    const label = el.shadowRoot.querySelector('label');
    expect(label).to.exist;
    expect(label.textContent).to.equal('Description');
  });

  it('uses provided id and applies to label for', async () => {
    const el = await fixture(html`<au-textarea id="my-id" label="Content"></au-textarea>`);
    const label = el.shadowRoot.querySelector('label');
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.id).to.equal('my-id');
    expect(label.getAttribute('for')).to.equal('my-id');
  });

  it('generates a unique id if not provided', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.id).to.match(/^au-textarea-/);
  });

  it('reflects value from property and updates textarea value', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    el.value = 'Hello';
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.value).to.equal('Hello');
  });

  it('updates component value when user types', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    textarea.value = 'Typed!';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).to.equal('Typed!');
  });

  it('dispatches change event correctly', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');

    setTimeout(() => {
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const event = await oneEvent(el, 'change');
    expect(event).to.exist;
  });

  it('reflects placeholder, rows, cols attributes', async () => {
    const el = await fixture(html`<au-textarea placeholder="Enter text" rows="4" cols="40"></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.getAttribute('placeholder')).to.equal('Enter text');
    expect(textarea.getAttribute('rows')).to.equal('4');
    expect(textarea.getAttribute('cols')).to.equal('40');
  });

  it('resets value on form reset', async () => {
    const el = await fixture(html`
    <form>
      <au-textarea name="text" value="Initial value"></au-textarea>
      <button type="reset">Reset</button>
    </form>
  `);
    const auTextarea = el.querySelector('au-textarea');
    let textarea = auTextarea.shadowRoot.querySelector('textarea');
    textarea.value = 'Changed';
    auTextarea.value = 'Changed';
    el.reset();
    await new Promise(r => setTimeout(r));
    // 重新查詢 textarea（因為 reset 時會重建元素）
    textarea = auTextarea.shadowRoot.querySelector('textarea');
    expect(auTextarea.value).to.equal('Initial value');
    expect(textarea.value).to.equal('Initial value');
  });

  it('submits value with form correctly', async () => {
    const el = await fixture(html`
      <form>
        <au-textarea name="comment"></au-textarea>
      </form>
    `);
    const textarea = el.querySelector('au-textarea');
    textarea.value = 'Submitted value';
    await new Promise(r => setTimeout(r));
    const formData = new FormData(el);
    expect(formData.get('comment')).to.equal('Submitted value');
  });

  it('has the required container structure', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const wrapper = el.shadowRoot.querySelector('.textarea-wrapper');
    const container = el.shadowRoot.querySelector('.textarea-container');
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(wrapper).to.exist;
    expect(container).to.exist;
    expect(container.contains(textarea)).to.be.true;
  });

  it('disabled property getter/setter works correctly', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    expect(el.disabled).to.be.false;

    el.disabled = true;
    expect(el.hasAttribute('disabled')).to.be.true;
    expect(el.shadowRoot.querySelector('textarea').disabled).to.be.true;

    el.disabled = false;
    expect(el.hasAttribute('disabled')).to.be.false;
    expect(el.shadowRoot.querySelector('textarea').disabled).to.be.false;
  });

  it('readonly property getter/setter works correctly', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    expect(el.readonly).to.be.false;

    el.readonly = true;
    expect(el.hasAttribute('readonly')).to.be.true;
    expect(el.shadowRoot.querySelector('textarea').readOnly).to.be.true;

    el.readonly = false;
    expect(el.hasAttribute('readonly')).to.be.false;
    expect(el.shadowRoot.querySelector('textarea').readOnly).to.be.false;
  });

  it('input event is composed and bubbles across shadow DOM', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-textarea></au-textarea>
      </div>
    `);
    const el = wrapper.querySelector('au-textarea');
    const textarea = el.shadowRoot.querySelector('textarea');

    let received = false;
    wrapper.addEventListener('input', () => { received = true; });
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(received).to.be.true;
  });

  it('change event is composed and bubbles across shadow DOM', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-textarea></au-textarea>
      </div>
    `);
    const el = wrapper.querySelector('au-textarea');
    const textarea = el.shadowRoot.querySelector('textarea');

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(received).to.be.true;
  });
});