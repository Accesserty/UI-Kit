import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/radio.js';

describe('AuRadioGroup', () => {
  it('preserves the selected option, DOM identity and focus during label changes', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a" checked>A</au-radio><au-radio value="b">B</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild;await nextFrame();
    const input = el.shadowRoot.querySelectorAll('input')[1];input.click();input.focus();
    el.children[1].setAttribute('label', '翻譯');await nextFrame();
    expect(el.value).to.equal('b');expect(new FormData(form).get('pick')).to.equal('b');
    expect(el.shadowRoot.querySelectorAll('input')[1]).to.equal(input);
    expect(el.shadowRoot.activeElement).to.equal(input);
  });

  it('supports value assignment, late options and an explicit empty option value', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a">A</au-radio><au-radio value="">Empty</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild;await nextFrame();
    el.value = '';expect(el.value).to.equal('');expect(new FormData(form).get('pick')).to.equal('');
    el.value = 'late';expect(el.value).to.equal(null);expect(new FormData(form).has('pick')).to.be.false;
    const option = document.createElement('au-radio');option.setAttribute('value', 'late');option.textContent = 'Late';el.append(option);await nextFrame();
    expect(el.value).to.equal('late');expect(new FormData(form).get('pick')).to.equal('late');
  });

  it('preserves choice and individual disabled state across group and fieldset disabled cycles', async () => {
    const form = await fixture(html`<form><fieldset><au-radio-group name="pick"><au-radio value="a" checked>A</au-radio><au-radio value="b">B</au-radio><au-radio value="c" disabled>C</au-radio></au-radio-group></fieldset></form>`);
    const fieldset = form.firstElementChild, el = fieldset.firstElementChild;await nextFrame();
    el.shadowRoot.querySelectorAll('input')[1].click();
    el.disabled = true;el.disabled = false;
    expect(el.shadowRoot.querySelectorAll('input')[2].disabled).to.be.true;
    await nextFrame();expect(el.value).to.equal('b');
    fieldset.disabled = true;expect([...el.shadowRoot.querySelectorAll('input')].every(input => input.disabled)).to.be.true;
    expect(new FormData(form).has('pick')).to.be.false;
    fieldset.disabled = false;expect(el.value).to.equal('b');
  });

  it('resolves external group names and descriptions', async () => {
    const wrapper = await fixture(html`<div><span id="radio-label">Delivery</span><span id="radio-help">Choose one</span><au-radio-group aria-labelledby="radio-label" aria-describedby="radio-help"><au-radio value="a">A</au-radio></au-radio-group></div>`);
    await nextFrame();const group = wrapper.lastElementChild.shadowRoot.querySelector('[role=radiogroup]');
    expect(group.ariaLabelledByElements).to.deep.equal([wrapper.firstElementChild]);
    expect(group.ariaDescribedByElements).to.deep.equal([wrapper.children[1]]);
  });

  it('keeps native submission current before input reaches the consumer', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a">A</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild;await nextFrame();const values = [];
    el.addEventListener('input', () => values.push(new FormData(form).get('pick')));
    el.shadowRoot.querySelector('input').click();expect(values).to.deep.equal(['a']);
  });

  it('validates a required group and preserves native reset focus', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick" required><au-radio value="a">A</au-radio><au-radio value="b">B</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild;await nextFrame();expect(el.internals.checkValidity()).to.be.false;
    const input = el.shadowRoot.querySelectorAll('input')[1];input.click();input.focus();expect(el.internals.checkValidity()).to.be.true;
    form.reset();expect(el.value).to.equal(null);expect(el.shadowRoot.activeElement).to.equal(input);
  });
  it('renders correct number of radios based on children', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="one">One</div>
        <div value="two">Two</div>
        <div value="three">Three</div>
      </au-radio-group>
    `);
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios.length).to.equal(3);
  });

  it('marks the correct radio as checked', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="a">A</div>
        <div value="b" checked>B</div>
      </au-radio-group>
    `);
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[1].checked).to.be.true;
    expect(radios[0].checked).to.be.false;
  });

  it('applies disabled to all radios when group is disabled', async () => {
    const el = await fixture(html`
      <au-radio-group disabled>
        <div value="x">X</div>
        <div value="y">Y</div>
      </au-radio-group>
    `);
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => expect(radio.disabled).to.be.true);
  });

  it('keyboard navigation: right/down arrow wraps forward', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement.shadowRoot.activeElement).to.equal(radios[1]);
  });

  it('keyboard navigation: left/up arrow wraps backward', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement.shadowRoot.activeElement).to.equal(radios[1]);
  });

  it('adds aria-label to radiogroup when attribute is present', async () => {
    const el = await fixture(html`
      <au-radio-group aria-label="Options">
        <div value="A">A</div>
      </au-radio-group>
    `);
    await nextFrame();

    const group = el.shadowRoot.querySelector('.au-radio-group');
    expect(group.getAttribute('aria-label')).to.equal('Options');
  });

  it('uses label as fallback aria-label and updates group labeling attributes', async () => {
    const el = await fixture(html`
      <au-radio-group label="付款方式">
        <div value="card">Card</div>
      </au-radio-group>
    `);
    await nextFrame();

    const group = el.shadowRoot.querySelector('.au-radio-group');
    expect(group.getAttribute('aria-label')).to.equal('付款方式');

    el.setAttribute('aria-label', 'Payment method');
    await nextFrame();
    expect(group.getAttribute('aria-label')).to.equal('Payment method');

    el.removeAttribute('aria-label');
    el.removeAttribute('label');
    el.setAttribute('aria-labelledby', 'payment-label');
    await nextFrame();
    expect(group.hasAttribute('aria-label')).to.be.false;
    expect(group.ariaLabelledByElements).to.deep.equal([]);
  });

  it('uses child label attributes as localized radio option text', async () => {
    const el = await fixture(html`
      <au-radio-group aria-label="語言">
        <div value="zh" label="繁體中文"></div>
        <div value="en" label="English"></div>
      </au-radio-group>
    `);
    await nextFrame();

    const labels = el.shadowRoot.querySelectorAll('.text');
    expect(labels[0].textContent).to.equal('繁體中文');
    expect(labels[1].textContent).to.equal('English');
  });

  it('updates radio option text when a child label attribute changes', async () => {
    const el = await fixture(html`
      <au-radio-group aria-label="語言">
        <div value="zh" label="繁體中文"></div>
      </au-radio-group>
    `);
    await nextFrame();

    const option = el.querySelector('[value="zh"]');
    option.setAttribute('label', 'Traditional Chinese');
    await nextFrame();

    const label = el.shadowRoot.querySelector('.text');
    expect(label.textContent).to.equal('Traditional Chinese');
  });

  it('adds vertical class when direction="vertical"', async () => {
    const el = await fixture(html`
      <au-radio-group direction="vertical">
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);
    await nextFrame();

    const group = el.shadowRoot.querySelector('.au-radio-group');
    expect(group.classList.contains('au-radio-group--vertical')).to.be.true;
  });

  it('respects individual radio disabled attribute', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">One</div>
        <div value="2" disabled>Two</div>
      </au-radio-group>
    `);
    await nextFrame();
  
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[0].disabled).to.be.false;
    expect(radios[1].disabled).to.be.true;
  });

  it('assigns the same name to all radios for grouping', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="x">X</div>
        <div value="y">Y</div>
      </au-radio-group>
    `);
    await nextFrame();
  
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    const name1 = radios[0].getAttribute('name');
    const name2 = radios[1].getAttribute('name');
  
    expect(name1).to.equal(name2);
  });

  it('ensures label "for" matches input id for accessibility', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="a">A</div>
      </au-radio-group>
    `);
    await nextFrame();

    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input[type="radio"]');

    expect(label.getAttribute('for')).to.equal(input.getAttribute('id'));
  });

  it('value getter returns the checked radio value', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="alpha">Alpha</div>
        <div value="beta" checked>Beta</div>
      </au-radio-group>
    `);
    await nextFrame();
    expect(el.value).to.equal('beta');
  });

  it('value getter returns null when nothing is checked', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="a">A</div>
        <div value="b">B</div>
      </au-radio-group>
    `);
    await nextFrame();
    expect(el.value).to.be.null;
  });

  it('disabled setter adds/removes the attribute and disables all radios', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="x">X</div>
        <div value="y">Y</div>
      </au-radio-group>
    `);
    await nextFrame();

    el.disabled = true;
    await nextFrame();
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios.forEach(r => expect(r.disabled).to.be.true);

    el.disabled = false;
    await nextFrame();
    const radios2 = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios2.forEach(r => expect(r.disabled).to.be.false);
  });

  it('change event fires with correct detail when a radio is selected', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="one">One</div>
        <div value="two">Two</div>
      </au-radio-group>
    `);
    await nextFrame();

    let detail = null;
    el.addEventListener('change', e => { detail = e.detail; });

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[1].click();

    expect(detail).to.deep.equal({ value: 'two' });
  });

  it('change event is composed and bubbles across shadow DOM boundary', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-radio-group>
          <div value="a">A</div>
          <div value="b">B</div>
        </au-radio-group>
      </div>
    `);
    const el = wrapper.querySelector('au-radio-group');
    await nextFrame();

    let received = false;
    wrapper.addEventListener('change', () => { received = true; });

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].click();

    expect(received).to.be.true;
  });

  it('is form-associated: FormData captures the selected value', async () => {
    const form = await fixture(html`
      <form>
        <au-radio-group name="choice">
          <div value="yes" checked>Yes</div>
          <div value="no">No</div>
        </au-radio-group>
      </form>
    `);
    await nextFrame();
    const formData = new FormData(form);
    expect(formData.get('choice')).to.equal('yes');
  });

  it('form reset restores the initial choice without replacing inputs', async () => {
    const form = await fixture(html`
      <form>
        <au-radio-group name="pick">
          <div value="a" checked>A</div>
          <div value="b">B</div>
        </au-radio-group>
        <button type="reset">Reset</button>
      </form>
    `);
    const el = form.querySelector('au-radio-group');
    await nextFrame();

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[1].click();
    await nextFrame();
    expect(el.value).to.equal('b');

    form.reset();
    await nextFrame();
    expect(el.value).to.equal('a');
    expect(el.shadowRoot.querySelector('input')).to.equal(radios[0]);
  });

  it('retains selection identity through reorder and updates a selected value', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a" checked>A</au-radio><au-radio value="b">B</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild, source = el.lastElementChild;
    const input = el.shadowRoot.querySelectorAll('input')[1];
    input.click(); input.focus(); el.prepend(source); await nextFrame();
    expect(el.shadowRoot.querySelector('input')).to.equal(input);
    expect(el.shadowRoot.activeElement).to.equal(input);
    source.setAttribute('value', 'renamed'); await nextFrame();
    expect(el.value).to.equal('renamed'); expect(new FormData(form).get('pick')).to.equal('renamed');
  });

  it('restores matching replacement options and moves focus after removal', async () => {
    const el = await fixture(html`<au-radio-group value="b"><au-radio value="a">A</au-radio><au-radio value="b">B</au-radio></au-radio-group>`);
    const selected = el.lastElementChild;
    el.focus(); selected.remove(); await nextFrame();
    expect(el.value).to.equal(null);
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('input'));
    el.append(selected.cloneNode(true)); await nextFrame();
    expect(el.value).to.equal('b');
  });

  it('honors explicit checked changes but not stale defaults on text and language updates', async () => {
    const el = await fixture(html`<au-radio-group><au-radio value="a" checked>A</au-radio><au-radio value="b">B</au-radio></au-radio-group>`);
    const source = el.lastElementChild;
    source.setAttribute('checked', ''); await nextFrame(); expect(el.value).to.equal('b');
    source.textContent = '繁體中文'; source.lang = 'zh-Hant'; await nextFrame();
    expect(el.value).to.equal('b'); expect(el.shadowRoot.querySelectorAll('.text')[1].lang).to.equal('zh-Hant');
    source.removeAttribute('checked'); await nextFrame(); expect(el.value).to.equal(null);
  });

  it('skips disabled radios, wraps, and does not loop on an all-disabled group', async () => {
    const el = await fixture(html`<au-radio-group><au-radio value="a">A</au-radio><au-radio value="b" disabled>B</au-radio><au-radio value="c">C</au-radio></au-radio-group>`);
    const inputs = el.shadowRoot.querySelectorAll('input');
    inputs[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'})); expect(el.value).to.equal('c');
    inputs[2].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'})); expect(el.value).to.equal('a');
    el.disabled = true;
    inputs[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'})); expect(el.value).to.equal('a');
    expect([...inputs].every(input => input.tabIndex === -1)).to.be.true;
  });

  it('emits one input followed by one composed change after reconnect', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a">A</au-radio><au-radio value="b">B</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild; el.remove(); form.append(el); await nextFrame();
    const events = [];
    form.addEventListener('input', event => events.push([event.type, event.composed, new FormData(form).get('pick')]));
    form.addEventListener('change', event => events.push([event.type, event.composed, event.detail.value]));
    el.shadowRoot.querySelectorAll('input')[1].click();
    expect(events).to.deep.equal([['input', true, 'b'], ['change', true, 'b']]);
    el.value = 'a'; form.reset(); el.formStateRestoreCallback('{"value":"b"}');
    expect(events).to.have.length(2); expect(el.value).to.equal('b');
    el.formStateRestoreCallback('invalid'); expect(el.value).to.equal('b');
  });

  it('omits disabled selections and unnamed groups without losing their values', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"><au-radio value="a" checked>A</au-radio><au-radio value="b">B</au-radio></au-radio-group></form>`);
    const el = form.firstElementChild;
    el.firstElementChild.setAttribute('disabled', ''); await nextFrame();
    expect(el.value).to.equal('a'); expect(new FormData(form).has('pick')).to.be.false;
    el.value = 'b'; el.name = 'renamed'; expect(new FormData(form).get('renamed')).to.equal('b');
    el.name = ''; expect([...new FormData(form)]).to.deep.equal([]);
    el.value = null; expect(el.value).to.equal(null);
  });

  it('captures the first populated reset value for asynchronously inserted options', async () => {
    const form = await fixture(html`<form><au-radio-group name="pick"></au-radio-group></form>`);
    const el = form.firstElementChild;
    el.innerHTML = '<au-radio value="late" checked>Late</au-radio><au-radio value="other">Other</au-radio>';
    await nextFrame(); el.value = 'other'; form.reset(); expect(el.value).to.equal('late');
  });

  it('tracks associated labels and replacement external descriptions', async () => {
    const wrapper = await fixture(html`<div><label for="radio-dynamic">Delivery</label><span id="radio-description">Choose one</span><au-radio-group id="radio-dynamic" aria-describedby="radio-description"><au-radio>A</au-radio></au-radio-group></div>`);
    const group = wrapper.lastElementChild.shadowRoot.querySelector('[role=radiogroup]');
    expect(group.ariaLabelledByElements).to.deep.equal([wrapper.firstElementChild]);
    const replacement = document.createElement('span'); replacement.id = 'radio-description'; replacement.textContent = 'New help';
    wrapper.children[1].replaceWith(replacement); await nextFrame();
    expect(group.ariaDescribedByElements).to.deep.equal([replacement]);
    replacement.remove(); await nextFrame(); expect(group.ariaDescribedByElements).to.deep.equal([]);
  });
});
