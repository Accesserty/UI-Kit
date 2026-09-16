import { html, fixture, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/textarea.js';

describe('AuTextarea', () => {
  it('preserves a composed InputEvent once, including composition metadata', async () => {
    const form = await fixture(html`<form><au-textarea name="notes"></au-textarea></form>`);
    const el = form.firstElementChild, events = [];
    form.addEventListener('input', event => events.push(event));
    el.textarea.value = '注';
    const original = new InputEvent('input', {bubbles: true, composed: true, data: '注', inputType: 'insertCompositionText', isComposing: true});
    el.textarea.dispatchEvent(original);
    expect(events).to.deep.equal([original]);
    expect(events[0].isComposing).to.be.true;
    expect(new FormData(form).get('notes')).to.equal('注');
  });

  it('synchronizes user edits without assigning back into the native control', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`);
    const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    let writes = 0;
    Object.defineProperty(el.textarea, 'value', {
      configurable: true,
      get() { return descriptor.get.call(this); },
      set(value) { writes++; descriptor.set.call(this, value); },
    });
    el.textarea.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true, isComposing: true}));
    expect(writes).to.equal(0);
  });

  it('disables editing under a disabled fieldset and restores the host state', async () => {
    const form = await fixture(html`<form><fieldset disabled><au-textarea name="notes" value="Initial" required></au-textarea></fieldset></form>`);
    const fieldset = form.firstElementChild, el = fieldset.firstElementChild;
    expect(el.textarea.disabled).to.be.true;
    expect(new FormData(form).has('notes')).to.be.false;
    fieldset.disabled = false;
    expect(el.textarea.disabled).to.be.false;
    expect(new FormData(form).get('notes')).to.equal('Initial');
    el.disabled = true; fieldset.disabled = true; fieldset.disabled = false;
    expect(el.textarea.disabled).to.be.true;
  });

  it('resolves live external label and description references without rebuilding', async () => {
    const wrapper = await fixture(html`<div><span id="notes-label">Notes</span><span id="notes-help">Required</span><au-textarea aria-labelledby="notes-label" aria-describedby="notes-help" aria-invalid="true"></au-textarea></div>`);
    const el = wrapper.lastElementChild, control = el.textarea;
    expect(control.ariaLabelledByElements).to.deep.equal([wrapper.firstElementChild]);
    expect(control.ariaDescribedByElements).to.deep.equal([wrapper.children[1]]);
    expect(control.getAttribute('aria-invalid')).to.equal('true');
    el.focus();
    const replacement = document.createElement('span'); replacement.id = 'notes-label'; replacement.textContent = '備註';
    wrapper.firstElementChild.replaceWith(replacement); await nextFrame();
    expect(el.textarea).to.equal(control);
    expect(control.ariaLabelledByElements).to.deep.equal([replacement]);
    expect(el.shadowRoot.activeElement).to.equal(control);
    wrapper.children[1].remove(); await nextFrame();
    expect(control.ariaDescribedByElements).to.have.length(0);
  });

  it('submits normalized line breaks and an empty string when the value attribute is removed', async () => {
    const form = await fixture(html`<form><au-textarea name="notes" value="Initial"></au-textarea></form>`);
    const el = form.firstElementChild;
    el.value = 'a\r\nb\rc';
    expect(el.value).to.equal('a\nb\nc');
    expect(new FormData(form).get('notes')).to.equal(el.value);
    el.removeAttribute('value');
    expect(el.value).to.equal('');
    expect(new FormData(form).get('notes')).to.equal('');
  });

  it('bridges non-composed input metadata once and change events only when needed', async () => {
    const el = await fixture(html`<au-textarea></au-textarea>`), inputs = [], changes = [];
    el.addEventListener('input', event => inputs.push(event));
    el.addEventListener('change', event => changes.push(event));
    el.textarea.dispatchEvent(new InputEvent('input', {bubbles: true, data: 'x', inputType: 'insertText'}));
    expect(inputs).to.have.length(1);
    expect(inputs[0].data).to.equal('x');
    expect(inputs[0].inputType).to.equal('insertText');
    expect(inputs[0].composed).to.be.true;
    const original = new Event('change', {bubbles: true, composed: true});
    el.textarea.dispatchEvent(original);
    expect(changes).to.deep.equal([original]);
    el.textarea.dispatchEvent(new Event('change', {bubbles: true}));
    expect(changes).to.have.length(2);
    expect(changes[1].composed).to.be.true;
  });

  it('keeps reset baseline, focus and accessible references through reset/reconnect', async () => {
    const form = await fixture(html`<form><span id="reset-label">Notes</span><span id="reset-help">Help</span><au-textarea name="notes" value="Initial" aria-labelledby="reset-label" aria-describedby="reset-help"></au-textarea></form>`);
    const el = form.lastElementChild, events = [];
    el.addEventListener('input', event => events.push(event));
    el.addEventListener('change', event => events.push(event));
    el.setAttribute('value', 'Assigned');el.value = 'Edited';el.focus();form.reset();
    expect(el.value).to.equal('Initial');
    expect(el.shadowRoot.activeElement).to.equal(el.textarea);
    expect(el.textarea.ariaLabelledByElements).to.deep.equal([form.firstElementChild]);
    expect(el.textarea.ariaDescribedByElements).to.deep.equal([form.children[1]]);
    el.remove();form.append(el);el.formStateRestoreCallback('Restored');
    expect(new FormData(form).get('notes')).to.equal('Restored');
    expect(events).to.have.length(0);
    el.textarea.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
    expect(events).to.have.length(1);
  });

  it('captures the effective value at first connection, not the first attribute assignment', async () => {
    const el = document.createElement('au-textarea');
    el.setAttribute('value', 'First'); el.setAttribute('value', 'Second'); el.value = 'Property';
    const form = await fixture(html`<form></form>`); form.append(el);
    el.value = 'Edited'; form.reset();
    expect(el.value).to.equal('Property');
  });

  it('supports name/required properties, native validity and readonly submission', async () => {
    const form = await fixture(html`<form><au-textarea></au-textarea></form>`), el = form.firstElementChild;
    el.name = 'notes'; el.required = true;
    expect(el.checkValidity()).to.be.false;
    expect(el.textarea.required).to.be.true;
    el.value = 'Filled';expect(el.checkValidity()).to.be.true;
    el.readonly = true;expect(new FormData(form).get('notes')).to.equal('Filled');
    expect(getComputedStyle(el.textarea).pointerEvents).not.to.equal('none');
    el.required = false;expect(el.textarea.required).to.be.false;
    el.name = 'renamed';expect(new FormData(form).has('notes')).to.be.false;
    expect(new FormData(form).get('renamed')).to.equal('Filled');
    el.name = '';expect([...new FormData(form)]).to.have.length(0);
  });

  it('uses containing-shadow-root labels and updates ID/name fallbacks', async () => {
    const host = await fixture(html`<div></div>`), root = host.attachShadow({mode: 'open'});
    root.innerHTML = '<label for="native-notes">Native notes</label><au-textarea id="native-notes"></au-textarea>';
    await nextFrame();const el = root.lastElementChild;
    expect(el.textarea.ariaLabelledByElements).to.deep.equal([root.firstElementChild]);
    el.setAttribute('label', 'Internal');
    expect(el.textarea.ariaLabelledByElements).to.have.length(0);
    expect(el.labelEl.textContent).to.equal('Internal');
    el.setAttribute('label', 'Translated');
    expect(el.textarea.hasAttribute('aria-label')).to.be.false;
    el.removeAttribute('id');
    expect(el.textarea.id).to.match(/^au-textarea-/);
    expect(el.labelEl.htmlFor).to.equal(el.textarea.id);
  });

  it('follows late labels and reconnects its observer in the new root', async () => {
    const wrapper = await fixture(html`<div><au-textarea aria-labelledby="late-notes"></au-textarea></div>`), el = wrapper.firstElementChild;
    const label = document.createElement('span');label.id = 'late-notes';label.textContent = 'Late';
    wrapper.append(label);await nextFrame();
    expect(el.textarea.ariaLabelledByElements).to.deep.equal([label]);
    const nextRoot = document.createElement('div');wrapper.append(nextRoot);const shadow = nextRoot.attachShadow({mode: 'open'});
    shadow.append(el);await nextFrame();expect(el.textarea.ariaLabelledByElements).to.have.length(0);
    shadow.append(label);await nextFrame();expect(el.textarea.ariaLabelledByElements).to.deep.equal([label]);
  });

  it('uses and clears plain-text fallback references without native element-ref support', async () => {
    const saved = [];
    for (const name of ['ariaLabelledByElements', 'ariaDescribedByElements']) {
      let owner = Element.prototype;
      while (owner && !Object.hasOwn(owner, name)) owner = Object.getPrototypeOf(owner);
      if (owner) {saved.push([owner, name, Object.getOwnPropertyDescriptor(owner, name)]);delete owner[name];}
    }
    try {
      const wrapper = await fixture(html`<div><span id="legacy-notes">Notes</span><span id="legacy-description">Help</span><au-textarea aria-labelledby="legacy-notes" aria-describedby="legacy-description"></au-textarea></div>`), el = wrapper.lastElementChild;
      expect(el.textarea.getAttribute('aria-label')).to.equal('Notes');
      const mirror = el.shadowRoot.getElementById(el.textarea.getAttribute('aria-describedby'));
      expect(mirror.textContent).to.equal('Help');
      wrapper.firstElementChild.textContent = 'Translated';await nextFrame();
      expect(el.textarea.getAttribute('aria-label')).to.equal('Translated');
      wrapper.children[1].remove();await nextFrame();
      expect(el.textarea.hasAttribute('aria-describedby')).to.be.false;
      el.setAttribute('aria-label', 'Explicit');expect(el.textarea.getAttribute('aria-label')).to.equal('Explicit');
      el.removeAttribute('aria-label');wrapper.firstElementChild.remove();await nextFrame();
      expect(el.textarea.hasAttribute('aria-label')).to.be.false;
    } finally {for (const [owner, name, descriptor] of saved) Object.defineProperty(owner, name, descriptor);}
  });

  it('upgrades pre-definition properties through setters', async () => {
    const tag = `test-textarea-${crypto.randomUUID()}`;
    const wrapper = await fixture(html`<div></div>`), el = document.createElement(tag);
    el.value = 'Before upgrade'; el.name = 'notes'; el.required = true; el.readonly = true;
    wrapper.append(el);
    customElements.define(tag, class extends customElements.get('au-textarea') {});
    expect(Object.hasOwn(el, 'value')).to.be.false;
    expect(el.textarea.value).to.equal('Before upgrade');
    expect(el.getAttribute('name')).to.equal('notes');
    expect(el.textarea.required).to.be.true;
    expect(el.textarea.readOnly).to.be.true;
  });

  it('keeps the default boundary at least 3:1 against its light backgrounds', async () => {
    const el = await fixture(html`<au-textarea label="Notes"></au-textarea>`);
    const context = document.createElement('canvas').getContext('2d');
    const luminance = color => {
      context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
        .map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const border = luminance(getComputedStyle(el.textareaContainer).borderTopColor);
    for (const background of ['white', getComputedStyle(el.textarea).backgroundColor]) {
      const backdrop = luminance(background);
      expect((Math.max(border, backdrop) + 0.05) / (Math.min(border, backdrop) + 0.05)).to.be.at.least(3);
    }
  });

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
