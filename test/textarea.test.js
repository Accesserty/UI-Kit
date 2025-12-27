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
    const textarea = auTextarea.shadowRoot.querySelector('textarea');

    textarea.value = 'Changed';
    auTextarea.value = 'Changed';

    el.reset();
    await new Promise(r => setTimeout(r));

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
});