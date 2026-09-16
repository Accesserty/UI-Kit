/**
 * @open-wc/testing
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/file-upload.js';

describe('<au-file-upload>', () => {
  it('forwards public focus to the trigger without opening the picker', async () => {
    const wrapper = await fixture(html`<div><button>Outside</button><au-file-upload></au-file-upload></div>`);
    const upload = wrapper.querySelector('au-file-upload');
    let clicks = 0; upload.fileInput.click = () => clicks++;
    upload.focus({preventScroll:true});
    expect(upload.shadowRoot.activeElement).to.equal(upload.defaultTrigger);
    upload.setAttribute('disabled', '');
    wrapper.querySelector('button').focus(); upload.focus();
    expect(document.activeElement).to.equal(wrapper.querySelector('button'));
    expect(clicks).to.equal(0);
  });
  it('normalizes invalid limits and permits explicit zero limits', async () => {
    const el=await fixture(html`<au-file-upload multiple max-files="-1" max-size-mb="garbage" max-total-size-mb="Infinity"></au-file-upload>`);
    el.handleFiles(Array.from({length:6},(_,i)=>new File(['x'],`${i}.txt`)));
    expect(el.value).to.have.length(5);
    el.value=[];el.setAttribute('max-files','0');el.handleFiles([new File(['x'],'zero.txt')]);
    expect(el.value).to.have.length(0);
  });

  it('resets the native input after rejected selection and emits only accepted changes', async () => {
    const el=await fixture(html`<au-file-upload accept=".txt"></au-file-upload>`);
    let changes=0;el.addEventListener('change',()=>changes++);
    for(const name of ['bad.jpg','good.txt']){
      const dt=new DataTransfer();dt.items.add(new File(['x'],name));el.fileInput.files=dt.files;
      el.fileInput.dispatchEvent(new Event('change',{bubbles:true,composed:true}));
      expect(el.fileInput.value).to.equal('');
    }
    expect(changes).to.equal(1);
    el.formResetCallback();await nextFrame();await nextFrame();
    expect(el.liveRegion.textContent).to.equal('');expect(el.errorList.textContent).to.equal('');
  });

  it('revokes previews on disconnect, restores them on reconnect and retains row identity', async () => {
    const wrapper=await fixture(html`<div><au-file-upload></au-file-upload></div>`);
    const el=wrapper.firstElementChild,file=new File(['x'],'preview.png',{type:'image/png'});
    el.value=[file];const row=el.fileList.firstElementChild,url=el.previewUrls.get(file);
    el.remove();expect(el.previewUrls.size).to.equal(0);wrapper.append(el);
    expect(el.fileList.firstElementChild).to.equal(row);expect(el.previewUrls.get(file)).not.to.equal(url);
    expect(row.querySelector('img').alt).to.equal('');
    el.value=[];expect(el.previewUrls.size).to.equal(0);
  });

  it('honors disabled fieldsets without changing the retained selection', async () => {
    const form = await fixture(html`<form><fieldset><au-file-upload name="files" multiple><button type="button" slot="trigger">Choose</button></au-file-upload></fieldset></form>`);
    const fieldset = form.querySelector('fieldset'), el = form.querySelector('au-file-upload');
    const one = new File(['1'], 'one.txt'); el.value = [one];
    fieldset.disabled = true;
    el.handleFiles([new File(['2'], 'two.txt')]); el.removeFile(one);
    expect(el.value).to.deep.equal([one]);
    expect(el.fileInput.disabled).to.be.true;
    expect(el.shadowRoot.querySelector('button.delete').disabled).to.be.true;
    expect([...new FormData(form)]).to.have.length(0);
    fieldset.disabled = false;
    expect(new FormData(form).get('files').name).to.equal('one.txt');
  });

  it('limits single selection and deduplicates within one batch', async () => {
    const el = await fixture(html`<au-file-upload></au-file-upload>`);
    const one = new File(['1'], 'one.txt'), two = new File(['2'], 'two.txt');
    el.handleFiles([one, two]);expect(el.value).to.deep.equal([one]);
    el.value=[];el.setAttribute('multiple','');el.handleFiles([one,one,two]);
    expect(el.value).to.deep.equal([one,two]);
    el.setAttribute('max-files','1');el.handleFiles([new File(['3'],'three.txt'),new File(['4'],'four.txt')]);
    expect(el.value).to.deep.equal([one,two]);
  });

  it('matches extensions case-insensitively and does not accept a MIME prefix impostor', async () => {
    const el = await fixture(html`<au-file-upload accept=".TXT, image/*" multiple></au-file-upload>`);
    el.handleFiles([new File(['1'],'ONE.txt',{type:'text/plain'}),new File(['2'],'bad.bin',{type:'imagex/fake'})]);
    expect(el.value.map(f=>f.name)).to.deep.equal(['ONE.txt']);
  });

  it('does not cancel drag/drop elsewhere in the document', async () => {
    await fixture(html`<au-file-upload></au-file-upload>`);
    for(const type of ['dragover','drop']) {
      const event=new Event(type,{bubbles:true,cancelable:true});document.body.dispatchEvent(event);
      expect(event.defaultPrevented).to.be.false;
    }
  });

  it('keeps the same remove button through translation and clears stale errors', async () => {
    const el=await fixture(html`<au-file-upload accept=".txt"></au-file-upload>`);
    el.handleFiles([new File(['1'],'bad.jpg')]);
    el.handleFiles([new File(['1'],'good.txt')]);
    expect(el.errorList.textContent).to.equal('');
    const button=el.shadowRoot.querySelector('button.delete');button.focus();el.setAttribute('msg-remove-text','刪除');
    expect(el.shadowRoot.activeElement).to.equal(button);
  });

  it('uses a visible validation anchor and a named default keyboard trigger', async () => {
    const form=await fixture(html`<form><au-file-upload required label="Attachments"></au-file-upload></form>`);
    const el=form.firstElementChild;
    expect(el.shadowRoot.querySelector('slot[name=trigger] button').textContent).to.equal('Attachments');
    expect(form.reportValidity()).to.be.false;
    expect(el.shadowRoot.activeElement).not.to.equal(el.fileInput);
    expect(el.shadowRoot.activeElement).not.to.be.null;
    expect(el.errorList.textContent).to.include('Please select');
  });

  it('defensively copies controlled values and replays pre-registration assignment', async () => {
    const tag='test-late-file-upload',el=document.createElement(tag);
    const files=[new File(['1'],'one.txt')];el.value=files;document.body.append(el);
    try {
      customElements.define(tag,class extends customElements.get('au-file-upload'){});
      expect(Object.hasOwn(el,'value')).to.be.false;
      files.push(new File(['2'],'two.txt'));el.value.push(new File(['3'],'three.txt'));
      expect(el.value.map(f=>f.name)).to.deep.equal(['one.txt']);
    } finally {el.remove();}
  });

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

  it('opens the picker once for keyboard activation of a slotted button', async () => {
    const el = await fixture(html`
      <au-file-upload>
        <button type="button" slot="trigger">上傳</button>
      </au-file-upload>
    `);
    const trigger = el.querySelector('[slot="trigger"]');
    let clicks = 0;
    el.fileInput.click = () => { clicks += 1; };
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true, composed: true}));
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true, composed: true}));
    expect(clicks).to.equal(2);
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
        msg-remove-text="刪除"
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

  it('submits actual files under the current field name and clears them on reset', async () => {
    const form = await fixture(html`<form><au-file-upload name="attachments" multiple></au-file-upload></form>`);
    const el = form.firstElementChild;
    el.value = [new File(['first'], 'one.txt', {type:'text/plain'}), new File(['second'], 'two.txt')];
    const values = new FormData(form).getAll('attachments');
    expect(values).to.have.length(2);
    expect(values.every(value => value instanceof File)).to.be.true;
    expect(await values[0].text()).to.equal('first');
    expect(values.map(file => file.name)).to.deep.equal(['one.txt', 'two.txt']);
    el.setAttribute('name', 'renamed');
    expect(new FormData(form).has('attachments')).to.be.false;
    expect(new FormData(form).getAll('renamed')).to.have.length(2);
    el.removeAttribute('name');
    expect([...new FormData(form)]).to.have.length(0);
    el.setAttribute('name', 'attachments');
    form.reset();
    expect([...new FormData(form)]).to.have.length(0);
  });

  it('uses the same bubbling removal contract for the public method and button', async () => {
    const wrapper = await fixture(html`<div><au-file-upload name="files"></au-file-upload></div>`);
    const el = wrapper.firstElementChild;
    const one = new File(['1'], 'one.txt'), two = new File(['2'], 'two.txt');
    el.value = [one, two];
    const received = [], changes = [];
    wrapper.addEventListener('remove-file', event => received.push(event));
    wrapper.addEventListener('change', event => changes.push(event));
    el.removeFile(one);
    el.shadowRoot.querySelector('button.delete').click();
    el.removeFile(two); // Removing an absent file is a no-op.
    expect(received.map(event => event.detail)).to.deep.equal([one, two]);
    expect(received.every(event => event.bubbles && event.composed)).to.be.true;
    expect(changes).to.have.length(2);
  });

  it('includes the visible remove label even when only one localization attribute changes', async () => {
    const el = await fixture(html`<au-file-upload msg-remove-text="Delete"></au-file-upload>`);
    el.value = [new File(['a'], 'a.txt')];
    expect(el.shadowRoot.querySelector('button.delete').getAttribute('aria-label')).to.equal('Delete a.txt');
    el.setAttribute('msg-remove-file-label', 'Remove {fileName}');
    expect(el.shadowRoot.querySelector('button.delete').getAttribute('aria-label')).to.include('Delete');
  });

  it('preserves removal-button focus during localization and moves it to the next available control', async () => {
    const el = await fixture(html`<au-file-upload><button slot="trigger">Choose files</button></au-file-upload>`);
    const one = new File(['1'], 'one.txt'), two = new File(['2'], 'two.txt');
    el.value = [one, two];
    el.shadowRoot.querySelector('button.delete').focus();
    el.setAttribute('msg-remove-text', 'Delete');
    expect(el.shadowRoot.activeElement?.classList.contains('delete')).to.be.true;
    el.shadowRoot.activeElement.click();
    expect(el.shadowRoot.activeElement?.getAttribute('aria-label')).to.include('two.txt');
    el.shadowRoot.activeElement.click();
    expect(document.activeElement).to.equal(el.querySelector('button'));
  });
});
