import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../src/components/file-upload.js';

describe('<au-file-upload>', () => {
  it('renders label and input correctly', async () => {
    const el = await fixture(html`<au-file-upload label="附件"></au-file-upload>`);
    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input[type=file]');
    expect(label.textContent).to.equal('附件');
    expect(input.hidden).to.be.true;
    expect(label.getAttribute('for')).to.equal(input.id);
  });

  it('opens file dialog on trigger slot click', async () => {
    const el = await fixture(html`
      <au-file-upload>
        <button slot="trigger">上傳</button>
      </au-file-upload>
    `);
    const slotBtn = el.querySelector('[slot="trigger"]');
    const spy = sinon.spy(el.fileInput, 'click');
    slotBtn.click();
    expect(spy.calledOnce).to.be.true;
  });

  it('adds valid image file to list with preview', async () => {
    const el = await fixture(html`<au-file-upload accept=".jpg"></au-file-upload>`);
    const file = new File(['hello'], 'test.jpg', { type: 'image/jpeg' });
    el.handleFiles([file]);
    const listItem = el.shadowRoot.querySelector('.file-list li');
    expect(listItem).to.exist;
    expect(listItem.textContent).to.include('test.jpg');
    expect(listItem.querySelector('img')).to.exist;
  });

  it('shows icon for non-image file', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    el.handleFiles([file]);
    const icon = el.shadowRoot.querySelector('.preview');
    expect(icon.textContent).to.equal('📄');
  });

  it('shows error for wrong file type', async () => {
    const el = await fixture(html`<au-file-upload accept=".jpg"></au-file-upload>`);
    const file = new File([''], 'bad.pdf', { type: 'application/pdf' });
    el.handleFiles([file]);
    const error = el.shadowRoot.querySelector('.error-list');
    expect(error.textContent).to.include('not an accepted');
  });

  it('shows error if file is too large', async () => {
    const el = await fixture(html`<au-file-upload max-size-mb="0.001"></au-file-upload>`);
    const file = new File([new ArrayBuffer(1024 * 10)], 'big.jpg', { type: 'image/jpeg' });
    el.handleFiles([file]);
    const error = el.shadowRoot.querySelector('.error-list');
    expect(error.textContent).to.include('exceeds the maximum');
  });

  it('removes file on button click', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    el.handleFiles([file]);
    const removeBtn = el.shadowRoot.querySelector('button[aria-label^="Remove"]');
    removeBtn.click();
    expect(el.shadowRoot.querySelector('.file-list').children.length).to.equal(0);
  });

  it('resets files on formResetCallback', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    el.handleFiles([file]);
    el.formResetCallback();
    expect(el.files.length).to.equal(0);
    expect(el.shadowRoot.querySelector('.file-list').children.length).to.equal(0);
  });

  it('validates required when no file selected', async () => {
    const el = await fixture(html`<au-file-upload required></au-file-upload>`);
    el.checkValidity();
    expect(el.internals.validity.valueMissing).to.be.true;
  });
});