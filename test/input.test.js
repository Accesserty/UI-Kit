import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/input.js';

describe('AuInput', () => {
  it('reflects label correctly', async () => {
    const el = await fixture(html`<au-input label="Email"></au-input>`);
    const label = el.shadowRoot.querySelector('label');
    expect(label.textContent).to.equal('Email');
  });

  it('reflects value from attribute', async () => {
    const el = await fixture(html`<au-input value="test"></au-input>`);
    expect(el.value).to.equal('test');
  });

  it('supports user input and event dispatch', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    const input = el.shadowRoot.querySelector('input');

    input.value = 'typed';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(el.value).to.equal('typed');
  });

  it('supports data-clear and data-clear-label', async () => {
    const el = await fixture(html`
      <au-input data-clear data-clear-label="清除內容" value="abc"></au-input>
    `);
    const clearBtn = el.shadowRoot.querySelector('.clear-input');
    expect(clearBtn).to.exist;
    expect(clearBtn.hidden).to.be.false;
    expect(clearBtn.getAttribute('aria-label')).to.equal('清除內容');

    clearBtn.click();
    await nextFrame();
    expect(el.value).to.equal('');
  });

  it('hides clear button if no value or no data-clear attr', async () => {
    const el = await fixture(html`<au-input value=""></au-input>`);
    const clearBtn = el.shadowRoot.querySelector('.clear-input');
    expect(clearBtn.hidden).to.be.true;
  });

  it('shows prefix and affix only when slotted content exists', async () => {
    const el = await fixture(html`
      <au-input>
        <span slot="prefix">P</span>
        <span slot="affix">A</span>
      </au-input>
    `);
    await nextFrame();
    const prefix = el.shadowRoot.querySelector('.prefix');
    const affix = el.shadowRoot.querySelector('.affix');
    expect(prefix.hidden).to.be.false;
    expect(affix.hidden).to.be.false;
  });

  it('adds correct size and layout attributes', async () => {
    const el = await fixture(html`
      <au-input data-size="large" data-layout="vertical"></au-input>
    `);
    const wrapper = el.shadowRoot.querySelector('.input-wrapper');
    expect(wrapper.getAttribute('data-size')).to.equal('large');
    expect(wrapper.getAttribute('data-layout')).to.equal('vertical');
  });

  it('supports form association and reset', async () => {
    const el = await fixture(html`
    <form>
      <au-input name="email" value="default"></au-input>
      <button type="reset">Reset</button>
    </form>
  `);
    const auInput = el.querySelector('au-input');
    let input = auInput.shadowRoot.querySelector('input');

    input.value = 'changed';
    auInput.value = 'changed';

    el.reset();
    await nextFrame();

    // 重新查詢 input（因為 reset 時會重建元素）
    input = auInput.shadowRoot.querySelector('input');

    expect(auInput.value).to.equal('default');
    expect(input.value).to.equal('default');
  });

  it('submits correct value with form', async () => {
    const el = await fixture(html`
      <form>
        <au-input name="username" value="user123"></au-input>
      </form>
    `);

    const input = el.querySelector('au-input');
    const formData = new FormData(el);
    expect(formData.get('username')).to.equal('user123');
  });

  it('can be cleared programmatically with .clear()', async () => {
    const el = await fixture(html`<au-input value="toClear"></au-input>`);
    el.clear();
    await nextFrame();
    expect(el.value).to.equal('');
  });

  it('can be filled programmatically with .suggest()', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    el.suggest('SuggestedValue');
    await nextFrame();
    expect(el.value).to.equal('SuggestedValue');
  });

  it('can be focused programmatically with .focus()', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    el.focus();
    const input = el.shadowRoot.querySelector('input');
    expect(document.activeElement === input || input.matches(':focus')).to.be.true;
  });

  it('disabled property getter/setter works correctly', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    expect(el.disabled).to.be.false;

    el.disabled = true;
    expect(el.hasAttribute('disabled')).to.be.true;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;

    el.disabled = false;
    expect(el.hasAttribute('disabled')).to.be.false;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.false;
  });

  it('required property getter/setter works correctly', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    expect(el.required).to.be.false;

    el.required = true;
    expect(el.hasAttribute('required')).to.be.true;
    expect(el.shadowRoot.querySelector('input').required).to.be.true;

    el.required = false;
    expect(el.hasAttribute('required')).to.be.false;
    expect(el.shadowRoot.querySelector('input').required).to.be.false;
  });

  it('readonly property getter/setter works correctly', async () => {
    const el = await fixture(html`<au-input></au-input>`);
    expect(el.readonly).to.be.false;

    el.readonly = true;
    expect(el.hasAttribute('readonly')).to.be.true;
    expect(el.shadowRoot.querySelector('input').readOnly).to.be.true;

    el.readonly = false;
    expect(el.hasAttribute('readonly')).to.be.false;
    expect(el.shadowRoot.querySelector('input').readOnly).to.be.false;
  });

  it('input event is composed and bubbles across shadow DOM', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-input></au-input>
      </div>
    `);
    const el = wrapper.querySelector('au-input');
    const input = el.shadowRoot.querySelector('input');

    let received = false;
    wrapper.addEventListener('input', () => { received = true; });
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(received).to.be.true;
  });

  it('change event is composed and bubbles across shadow DOM', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-input></au-input>
      </div>
    `);
    const el = wrapper.querySelector('au-input');
    const input = el.shadowRoot.querySelector('input');

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(received).to.be.true;
  });
});
