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
    const el = await fixture(html`<au-textarea id="custom-id" label="Description"></au-textarea>`);
    const label = el.shadowRoot.querySelector('label');
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.id).to.equal('custom-id');
    expect(label.getAttribute('for')).to.equal('custom-id');
  });

  it('generates id if not provided', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.id).to.match(/^au-textarea-/);
  });

  it('reflects value from attribute and allows programmatic change', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    el.value = 'Hello';
    expect(el.value).to.equal('Hello');
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.value).to.equal('Hello');
  });

  it('updates value on user input', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    textarea.value = 'test input';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).to.equal('test input');
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
    const el = await fixture(html`<au-textarea placeholder="Enter" rows="4" cols="50"></au-textarea>`);
    const textarea = el.shadowRoot.querySelector('textarea');
    expect(textarea.getAttribute('placeholder')).to.equal('Enter');
    expect(textarea.getAttribute('rows')).to.equal('4');
    expect(textarea.getAttribute('cols')).to.equal('50');
  });

  it('participates in form submission and resets properly', async () => {
    const el = await fixture(html`
      <form>
        <au-textarea name="note" value="初始Content"></au-textarea>
        <button type="reset">Reset</button>
      </form>
    `);
    const auTextarea = el.querySelector('au-textarea');
    const textarea = auTextarea.shadowRoot.querySelector('textarea');

    textarea.value = 'After';
    auTextarea.value = 'After';

    el.reset();
    await new Promise(r => setTimeout(r));

    expect(auTextarea.value).to.equal('');
    expect(textarea.value).to.equal('');
  });

  it('submits value with form', async () => {
    const el = await fixture(html`
      <form>
        <au-textarea name="note"></au-textarea>
      </form>
    `);
  
    const textarea = el.querySelector('au-textarea');
    textarea.value = 'Content';
    await new Promise(r => setTimeout(r));
  
    const data = new FormData(el);
    expect(data.get('note')).to.equal('Content');
  });
  
});
