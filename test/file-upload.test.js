/**
 * @open-wc/testing
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
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
    await el.updateComplete;

    const slotBtn = el.querySelector('[slot="trigger"]');
    // stub fileInput.click
    el.fileInput.__clicked = false;
    el.fileInput.click = () => { el.fileInput.__clicked = true; };

    slotBtn.click();
    expect(el.fileInput.__clicked).to.be.true;
  });

  it('adds valid image file to list with preview', async () => {
    const el = await fixture(html`<au-file-upload accept=".jpg"></au-file-upload>`);
    const file = new File(['hello'], 'test.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;

    const listItem = el.shadowRoot.querySelector('.file-list li');
    expect(listItem).to.exist;
    expect(listItem.textContent).to.include('test.jpg');
    expect(listItem.querySelector('img')).to.exist;
  });

  it('shows icon for non-image file', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });

    el.handleFiles([file]);
    await el.updateComplete;

    const icon = el.shadowRoot.querySelector('.preview');
    expect(icon.textContent).to.equal('📄');
  });

  it('shows error for wrong file type', async () => {
    const el = await fixture(html`<au-file-upload accept=".jpg"></au-file-upload>`);
    const file = new File([''], 'bad.pdf', { type: 'application/pdf' });

    el.handleFiles([file]);
    await el.updateComplete;

    const error = el.shadowRoot.querySelector('.error-list');
    expect(error.textContent).to.include('not an accepted');
  });

  it('supports localized file upload messages and templates', async () => {
    const el = await fixture(html`
      <au-file-upload
        accept=".jpg"
        msg-type-error="{fileName} 的檔案格式不支援"
        msg-added="已新增 {count} 個檔案"
        msg-removed="已移除 {fileName}"
        msg-remove-file-label="刪除 {fileName}"
      ></au-file-upload>
    `);
    const invalidFile = new File([''], 'bad.pdf', { type: 'application/pdf' });
    const validFile = new File([''], 'good.jpg', { type: 'image/jpeg' });

    el.handleFiles([invalidFile]);
    await nextFrame();
    expect(el.shadowRoot.querySelector('.error-list').textContent).to.include('bad.pdf 的檔案格式不支援');

    el.handleFiles([validFile]);
    await nextFrame();
    await nextFrame();
    expect(el.liveRegion.textContent).to.include('已新增 1 個檔案');

    const removeBtn = el.shadowRoot.querySelector('button.delete');
    expect(removeBtn.getAttribute('aria-label')).to.equal('刪除 good.jpg');

    removeBtn.click();
    await nextFrame();
    await nextFrame();
    expect(el.liveRegion.textContent).to.include('已移除 good.jpg');
  });

  it('shows error if file is too large', async () => {
    const el = await fixture(html`<au-file-upload max-size-mb="0.001"></au-file-upload>`);
    const largeBuffer = new ArrayBuffer(1024 * 1024 * 1);
    const file = new File([largeBuffer], 'big.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;

    const error = el.shadowRoot.querySelector('.error-list');
    expect(error.textContent).to.include('exceeds the maximum size');
  });

  it('removes file on button click', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['a'], 'a.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;

    const removeBtn = el.shadowRoot.querySelector('button[aria-label^="Remove"]');
    removeBtn.click();
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('.file-list').children.length).to.equal(0);
  });

  it('resets files on formResetCallback', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;

    el.formResetCallback();
    await el.updateComplete;

    expect(el.files.length).to.equal(0);
    expect(el.shadowRoot.querySelector('.file-list').children.length).to.equal(0);
  });

  it('validates required when no file selected', async () => {
    const el = await fixture(html`<au-file-upload required></au-file-upload>`);
    await el.updateComplete;

    const valid = el.checkValidity();
    expect(valid).to.be.false;
    expect(el.internals.validity.valueMissing).to.be.true;
  });

  it('prevents adding or removing files when disabled', async () => {
    const el = await fixture(html`<au-file-upload disabled></au-file-upload>`);
    const file = new File(['a'], 'a.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;
    expect(el.files.length).to.equal(0);

    el.removeAttribute('disabled');
    el.handleFiles([file]);
    await el.updateComplete;
    expect(el.files.length).to.equal(1);

    el.setAttribute('disabled', '');
    await el.updateComplete;
    const removeBtn = el.shadowRoot.querySelector('button.delete');
    removeBtn.click();
    await el.updateComplete;
    expect(el.files.length).to.equal(1);
  });

  it('value getter returns current file array', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });

    el.handleFiles([file]);
    await el.updateComplete;

    expect(el.value).to.be.an('array');
    expect(el.value.length).to.equal(1);
    expect(el.value[0].name).to.equal('test.txt');
  });

  it('value setter replaces file list and updates UI', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const file1 = new File(['a'], 'first.txt', { type: 'text/plain' });
    const file2 = new File(['b'], 'second.txt', { type: 'text/plain' });

    el.handleFiles([file1]);
    await el.updateComplete;
    expect(el.files.length).to.equal(1);

    el.value = [file2];
    await el.updateComplete;
    expect(el.files.length).to.equal(1);
    expect(el.files[0].name).to.equal('second.txt');
  });

  it('change event is composed and bubbles when files are added', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-file-upload></au-file-upload>
      </div>
    `);
    const el = wrapper.querySelector('au-file-upload');
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' });

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });

    el.handleFiles([file]);
    await el.updateComplete;

    expect(received).to.be.true;
  });

  it('remove-file event is composed and bubbles with the removed File as detail', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-file-upload></au-file-upload>
      </div>
    `);
    const el = wrapper.querySelector('au-file-upload');
    const file = new File(['y'], 'y.jpg', { type: 'image/jpeg' });

    el.handleFiles([file]);
    await el.updateComplete;

    let removedFile = null;
    wrapper.addEventListener('remove-file', e => { removedFile = e.detail; });

    const removeBtn = el.shadowRoot.querySelector('button[aria-label^="Remove"]');
    removeBtn.click();
    await el.updateComplete;

    expect(removedFile).to.exist;
    expect(removedFile.name).to.equal('y.jpg');
  });
});
