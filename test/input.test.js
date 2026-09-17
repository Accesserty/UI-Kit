import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/input.js';

describe('Input state restoration contract', () => {
  it('restores silently, preserves focus and retains the initial reset baseline', async () => {
    const form = await fixture(html`<form><au-input name="restored" value="initial" required></au-input></form>`);
    const input = form.firstElementChild;
    const events = [];
    form.addEventListener('input', () => events.push('input'));
    form.addEventListener('change', () => events.push('change'));
    input.focus();
    input.formStateRestoreCallback('restored value', 'restore');
    expect(input.value).to.equal('restored value');
    expect(new FormData(form).get('restored')).to.equal('restored value');
    expect(input.shadowRoot.activeElement).to.equal(input.input);
    input.formStateRestoreCallback('', 'autocomplete');
    expect(input.internals.checkValidity()).to.be.false;
    input.formStateRestoreCallback(new FormData(), 'restore');
    expect(input.value).to.equal('');
    form.reset();
    expect(input.value).to.equal('initial');
    expect(new FormData(form).get('restored')).to.equal('initial');
    expect(input.internals.checkValidity()).to.be.true;
    expect(events).to.deep.equal([]);
  });
});

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

  it('updates aria-label and aria-labelledby on the internal input', async () => {
    const el = await fixture(html`<au-input aria-label="搜尋"></au-input>`);
    const input = el.shadowRoot.querySelector('input');

    expect(input.getAttribute('aria-label')).to.equal('搜尋');

    el.setAttribute('aria-label', 'Search');
    await nextFrame();
    expect(input.getAttribute('aria-label')).to.equal('Search');

    el.removeAttribute('aria-label');
    el.setAttribute('aria-labelledby', 'search-label');
    await nextFrame();
    expect(input.hasAttribute('aria-label')).to.be.false;
    expect(input.ariaLabelledByElements).to.have.length(0);
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

  it('clones an external datalist into the shadow root', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-input label="Flavor" list="flavors"></au-input>
        <datalist id="flavors">
          <option value="Vanilla"></option>
          <option value="Chocolate"></option>
        </datalist>
      </div>
    `);
    const el = wrapper.querySelector('au-input');
    await nextFrame(); // connectedCallback defers list handling via rAF

    const internal = el.shadowRoot.querySelector('datalist');
    expect(internal).to.exist;
    expect(internal.querySelectorAll('option').length).to.equal(2);
  });

  it('keeps the internal datalist in sync when the external one changes', async () => {
    const wrapper = await fixture(html`
      <div>
        <au-input label="Flavor" list="flavors-dynamic"></au-input>
        <datalist id="flavors-dynamic">
          <option value="Vanilla"></option>
        </datalist>
      </div>
    `);
    const el = wrapper.querySelector('au-input');
    await nextFrame();

    const external = wrapper.querySelector('#flavors-dynamic');
    const opt = document.createElement('option');
    opt.value = 'Matcha';
    external.appendChild(opt);

    await nextFrame(); // allow the MutationObserver to fire

    const internal = el.shadowRoot.querySelector('datalist');
    const values = [...internal.querySelectorAll('option')].map(o => o.value);
    expect(values).to.include('Matcha');
    expect(internal.querySelectorAll('option').length).to.equal(2);
  });

  it('preserves one composed InputEvent including IME metadata', async () => {
    const wrapper = await fixture(html`<div><au-input></au-input></div>`);
    const el=wrapper.firstElementChild, events=[];
    wrapper.addEventListener('input', event=>events.push(event));
    el.input.value='中';
    const event=new InputEvent('input',{bubbles:true,composed:true,data:'中',inputType:'insertCompositionText',isComposing:true});
    el.input.dispatchEvent(event);
    expect(events).to.have.length(1);
    expect(events[0]).to.equal(event);
    expect(events[0].isComposing).to.be.true;
    expect(el.value).to.equal('中');
  });

  it('disables editing and clearing under a disabled fieldset', async () => {
    const form=await fixture(html`<form><fieldset disabled><au-input name="name" value="Initial" data-clear></au-input></fieldset></form>`);
    const fieldset=form.firstElementChild, el=fieldset.firstElementChild;
    expect(el.input.disabled).to.be.true;
    expect(el.clearButton.hidden || el.clearButton.disabled).to.be.true;
    el.clear();
    expect(el.value).to.equal('Initial');
    expect(new FormData(form).has('name')).to.be.false;
    fieldset.disabled=false;await nextFrame();
    expect(el.input.disabled).to.be.false;
    el.readonly=true; el.clear();
    expect(el.value).to.equal('Initial');
  });

  it('resolves external names and descriptions and follows replacement through reset', async () => {
    const form=await fixture(html`<form><span id="outside-name">Name</span><span id="outside-error">Required</span>
      <au-input aria-labelledby="outside-name" aria-describedby="outside-error" value="Default"></au-input></form>`);
    const el=form.querySelector('au-input');
    expect(el.input.ariaLabelledByElements).to.deep.equal([form.querySelector('#outside-name')]);
    expect(el.input.ariaDescribedByElements).to.deep.equal([form.querySelector('#outside-error')]);
    el.focus();
    const original=el.input;
    const replacement=document.createElement('span');replacement.id='outside-name';replacement.textContent='姓名';
    form.firstElementChild.replaceWith(replacement);await nextFrame();
    expect(el.input.ariaLabelledByElements).to.deep.equal([replacement]);
    expect(el.input).to.equal(original);
    expect(el.shadowRoot.activeElement).to.equal(original);
    form.reset();
    expect(el.input.ariaLabelledByElements).to.deep.equal([replacement]);
    expect(el.input.ariaDescribedByElements).to.deep.equal([form.querySelector('#outside-error')]);
    expect(el.shadowRoot.activeElement).to.equal(el.input);
  });

  it('synchronizes value attributes after editing and submits the sanitized native value', async () => {
    const form=await fixture(html`<form><au-input name="quantity" type="number" value="2"></au-input></form>`);
    const el=form.firstElementChild;
    el.value='3';el.setAttribute('value','4');
    expect(el.value).to.equal('4');expect(new FormData(form).get('quantity')).to.equal('4');
    el.value='not a number';
    expect(el.value).to.equal('');expect(new FormData(form).get('quantity')).to.equal('');
  });

  it('returns focus to the input after its clear button disappears', async () => {
    const el=await fixture(html`<au-input value="Text" data-clear></au-input>`);
    el.clearButton.focus();el.clearButton.click();
    expect(el.value).to.equal('');expect(el.shadowRoot.activeElement).to.equal(el.input);
  });

  it('discovers a late datalist and follows replacement without stale options', async () => {
    const wrapper=await fixture(html`<div><au-input list="late-options"></au-input></div>`);
    const el=wrapper.firstElementChild;await nextFrame();
    const list=document.createElement('datalist');list.id='late-options';list.innerHTML='<option value="A"></option>';
    wrapper.append(list);await nextFrame();
    expect(el.input.list?.options[0].value).to.equal('A');
    const replacement=list.cloneNode(false);replacement.innerHTML='<option value="B"></option>';list.replaceWith(replacement);await nextFrame();
    expect(el.input.list?.options[0].value).to.equal('B');
  });

  it('supports native labels for the host and references in a containing shadow root', async () => {
    const wrapper=await fixture(html`<div></div>`), root=wrapper.attachShadow({mode:'open'});
    root.innerHTML='<label for="field">Account</label><span id="help">Use your name</span><au-input id="field" aria-describedby="help"></au-input>';
    await nextFrame();
    const el=root.querySelector('au-input');
    expect(el.input.ariaLabelledByElements).to.deep.equal([root.querySelector('label')]);
    expect(el.input.ariaDescribedByElements).to.deep.equal([root.querySelector('#help')]);
    root.querySelector('#help').remove();await nextFrame();
    expect(el.input.ariaDescribedByElements).to.have.length(0);
  });

  it('falls back to plain-text labeling and an internal description mirror on older engines', async () => {
    const saved=[];
    for(const name of ['ariaLabelledByElements','ariaDescribedByElements']){
      let owner=Element.prototype;while(owner&&!Object.hasOwn(owner,name))owner=Object.getPrototypeOf(owner);
      if(owner){saved.push([owner,name,Object.getOwnPropertyDescriptor(owner,name)]);delete owner[name];}
    }
    try {
      const wrapper=await fixture(html`<div><span id="legacy-name">Account</span><span id="legacy-help">Required</span><au-input aria-labelledby="legacy-name" aria-describedby="legacy-help"></au-input></div>`);
      const el=wrapper.querySelector('au-input');
      expect(el.input.getAttribute('aria-label')).to.equal('Account');
      const mirror=el.shadowRoot.getElementById(el.input.getAttribute('aria-describedby'));
      expect(mirror.textContent).to.equal('Required');
      wrapper.querySelector('#legacy-help').textContent='Updated help';await nextFrame();
      expect(mirror.textContent).to.equal('Updated help');
      wrapper.querySelector('#legacy-help').remove();await nextFrame();
      expect(el.input.hasAttribute('aria-describedby')).to.be.false;
    } finally {for(const [owner,name,descriptor] of saved)Object.defineProperty(owner,name,descriptor);}
  });

  it('preserves one composed change event across reset and reconnect', async () => {
    const form=await fixture(html`<form><au-input value="Initial"></au-input></form>`),el=form.firstElementChild;
    form.reset();el.remove();form.append(el);
    const events=[];form.addEventListener('change',event=>events.push(event));
    const event=new Event('change',{bubbles:true,composed:true});el.input.dispatchEvent(event);
    expect(events).to.deep.equal([event]);
  });

  it('submits a native color value rather than an unsanitized empty string after clear', async () => {
    const form=await fixture(html`<form><au-input name="color" type="color" value="#ff0000"></au-input></form>`);
    const el=form.firstElementChild;el.clear();
    expect(new FormData(form).get('color')).to.equal(el.input.value);
  });

  it('keeps a usable field inside a 320px container when prefix and affix are wide', async () => {
    const box = await fixture(html`<div style="width:320px">
      <au-input label="Date"><span slot="prefix">Type a Date</span>
        <div slot="affix"><button>Today(.suggest())</button> <button>Clear(.clear())</button></div></au-input>
      <au-input label="Color" type="color" value="#3b82f6"></au-input></div>`);
    await nextFrame();
    const [withAffix, color] = box.querySelectorAll('au-input');
    const hostRight = withAffix.getBoundingClientRect().right;
    const innerRight = Math.max(...[...withAffix.shadowRoot.querySelectorAll('*')].map(el => el.getBoundingClientRect().right));
    expect(innerRight).to.be.at.most(hostRight + 1);
    expect(withAffix.input.getBoundingClientRect().width).to.be.at.least(128);
    expect(color.input.getBoundingClientRect().width).to.be.at.least(24);
  });

  it('forwards only input attributes when upgraded from existing markup', async () => {
    // Parse in a document without the registry so the element upgrades on
    // insertion with its attributes already present, as with <script defer>.
    const inert = document.implementation.createHTMLDocument('');
    inert.body.innerHTML = `<au-input label="Name" name="n" placeholder="p" required hidden inert
      title="tip" class="x" style="outline:4px solid red" onclick="window.__auInputClicks=(window.__auInputClicks||0)+1"></au-input>`;
    const container = await fixture(html`<div></div>`);
    const el = document.adoptNode(inert.body.firstElementChild);
    container.append(el);
    const inner = el.shadowRoot.querySelector('input');
    for (const name of ['hidden', 'inert', 'title', 'class', 'style', 'onclick', 'label']) {
      expect(inner.hasAttribute(name), name).to.be.false;
    }
    expect(inner.getAttribute('name')).to.equal('n');
    expect(inner.getAttribute('placeholder')).to.equal('p');
    expect(inner.required).to.be.true;
    el.hidden = false;
    el.inert = false;
    expect(inner.getBoundingClientRect().width).to.be.greaterThan(0);
    window.__auInputClicks = 0;
    inner.click();
    expect(window.__auInputClicks).to.equal(1);
  });

  it('submits the sanitized reset value when the input type has changed', async () => {
    const form=await fixture(html`<form><au-input name="quantity" value="Text"></au-input></form>`);
    const el=form.firstElementChild;
    el.setAttribute('type','number');el.value='5';form.reset();
    expect(el.input.value).to.equal('');
    expect(new FormData(form).get('quantity')).to.equal('');
  });
});
