import {fixture, html, expect, nextFrame} from '@open-wc/testing';
import '../src/components/checkbox.js';
import '../src/components/switch.js';

for (const tag of ['au-checkbox', 'au-switch']) {
  describe(`${tag} shared native contract`, () => {
    const mount = async (attributes = '') => {
      const form = await fixture(html`<form></form>`);
      form.innerHTML = `<${tag} name="choice" ${attributes}></${tag}>`;
      return [form, form.firstElementChild, form.firstElementChild.shadowRoot.querySelector('input')];
    };

    it('synchronizes programmatic checked/value/name updates with FormData', async () => {
      const [form, el] = await mount();
      el.checked = true;
      expect(new FormData(form).get('choice')).to.equal('on');
      el.setAttribute('value', '');
      expect(new FormData(form).get('choice')).to.equal('');
      el.removeAttribute('value');
      expect(new FormData(form).get('choice')).to.equal('on');
      el.name = 'renamed';el.value = 'yes';
      expect(new FormData(form).has('choice')).to.be.false;
      expect(new FormData(form).get('renamed')).to.equal('yes');
      el.checked = false;
      expect([...new FormData(form)]).to.have.length(0);
    });

    it('restores initially checked state silently and keeps focus', async () => {
      const [form, el, input] = await mount('checked');
      const events = [];el.addEventListener('change', event => events.push(event));
      el.checked = false; input.focus(); form.reset();
      expect(el.checked).to.be.true;
      expect(el.shadowRoot.activeElement).to.equal(input);
      expect(new FormData(form).get('choice')).to.equal('on');
      expect(events).to.have.length(0);
    });

    it('resolves external names and descriptions across the shadow boundary', async () => {
      const [form, el, input] = await mount('aria-labelledby="toggle-label" aria-describedby="toggle-help"');
      const label = document.createElement('span');label.id = 'toggle-label';label.textContent = 'Receive updates';
      const help = document.createElement('span');help.id = 'toggle-help';help.textContent = 'Optional';
      form.prepend(label, help);await nextFrame();
      expect(input.ariaLabelledByElements).to.deep.equal([label]);
      expect(input.ariaDescribedByElements).to.deep.equal([help]);
      input.focus();label.replaceWith(label.cloneNode(true));await nextFrame();
      expect(input.ariaLabelledByElements).to.deep.equal([form.firstElementChild]);
      expect(el.shadowRoot.activeElement).to.equal(input);
    });

    it('synchronizes form value before the native input event and emits one boolean change', async () => {
      const [form, el, input] = await mount();
      const states = [], changes = [];
      el.addEventListener('input', () => states.push(new FormData(form).get('choice')));
      el.addEventListener('change', event => changes.push(event.detail));
      input.click();
      expect(states).to.deep.equal(['on']);
      expect(changes).to.deep.equal([true]);
      expect(el.hasAttribute('checked')).to.be.true;
      input.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
      expect(changes).to.deep.equal([true, true]);
    });

    it('honors disabled fieldsets and keeps required validity current', async () => {
      const [form, el, input] = await mount('required');
      expect(el.internals.checkValidity()).to.be.false;
      const fieldset = document.createElement('fieldset');fieldset.disabled = true;form.append(fieldset);fieldset.append(el);
      expect(input.disabled).to.be.true;
      input.click();expect(el.checked).to.be.false;
      fieldset.disabled = false;el.checked = true;
      expect(el.internals.checkValidity()).to.be.true;
      el.required = false;el.checked = false;
      expect(input.required).to.be.false;
      expect(el.internals.checkValidity()).to.be.true;
    });

    it('restores checked state independently from the submission value and remains silent', async () => {
      const [form, el, input] = await mount('value="unchecked"');
      const events = [];el.addEventListener('change', event => events.push(event));
      el.formStateRestoreCallback('checked');
      expect(el.checked).to.be.true;
      expect(new FormData(form).get('choice')).to.equal('unchecked');
      el.formStateRestoreCallback('unchecked');
      expect(new FormData(form).has('choice')).to.be.false;
      el.checked = true;el.remove();form.append(el);
      expect(el.checked).to.be.true;
      expect(events).to.have.length(0);
      input.click();expect(events.map(event => event.detail)).to.deep.equal([false]);
    });

    it('preserves native focus events without synthetic duplicates', async () => {
      const [, el, input] = await mount();
      const focus = [], blur = [], focusin = [];
      el.addEventListener('focus', event => focus.push(event));
      el.addEventListener('blur', event => blur.push(event));
      el.addEventListener('focusin', event => focusin.push(event));
      el.focus(); input.blur();
      expect(focus).to.have.length(1);expect(blur).to.have.length(1);expect(focusin).to.have.length(1);
      expect(focus[0].bubbles).to.be.false;expect(focus[0].isTrusted).to.be.true;
    });

    it('activates from a native external label unless the host click is canceled', async () => {
      const [form, el] = await mount('id="click-toggle"');
      const label = document.createElement('label');label.htmlFor = 'click-toggle';label.textContent = 'Activate';form.prepend(label);
      label.click();await nextFrame();expect(el.checked).to.be.true;
      el.addEventListener('click', event => event.preventDefault(), {once: true});
      label.click();await nextFrame();expect(el.checked).to.be.true;
    });

    it('keeps disabled state when an ancestor is re-enabled and excludes unnamed controls', async () => {
      const [form, el, input] = await mount('checked disabled');
      const fieldset = document.createElement('fieldset');form.append(fieldset);fieldset.append(el);
      fieldset.disabled = true;fieldset.disabled = false;
      expect(input.disabled).to.be.true;
      el.disabled = false;expect(new FormData(form).get('choice')).to.equal('on');
      el.removeAttribute('name');expect([...new FormData(form)]).to.have.length(0);
      expect(input.name).to.equal('');
    });

    it('resolves native host labels in a containing shadow root and respects internal labels', async () => {
      const wrapper = await fixture(html`<div></div>`), root = wrapper.attachShadow({mode: 'open'});
      root.innerHTML = `<label for="native-toggle">Native label</label><${tag} id="native-toggle"></${tag}>`;
      const el = root.lastElementChild, input = el.shadowRoot.querySelector('input');await nextFrame();
      expect(input.ariaLabelledByElements).to.deep.equal([root.firstElementChild]);
      el.setAttribute('label', 'Internal');await nextFrame();
      expect(input.ariaLabelledByElements).to.have.length(0);
      el.innerHTML = '<span>Slotted name</span>';await nextFrame();
      expect(input.ariaLabelledByElements).to.have.length(0);
    });

    it('provides plain-text label/description fallbacks when native references are absent', async () => {
      const saved = [];
      for (const name of ['ariaLabelledByElements', 'ariaDescribedByElements']) {
        let owner = Element.prototype;while (owner && !Object.hasOwn(owner, name)) owner = Object.getPrototypeOf(owner);
        if (owner) {saved.push([owner, name, Object.getOwnPropertyDescriptor(owner, name)]);delete owner[name];}
      }
      try {
        const [form, el, input] = await mount('aria-labelledby="fallback-label" aria-describedby="fallback-help"');
        form.insertAdjacentHTML('afterbegin', '<span id="fallback-label">Label</span><span id="fallback-help">Help</span>');await nextFrame();
        expect(input.getAttribute('aria-label')).to.equal('Label');
        expect(el.shadowRoot.getElementById(input.getAttribute('aria-describedby')).textContent).to.equal('Help');
        form.firstElementChild.textContent = 'Translated';await nextFrame();expect(input.getAttribute('aria-label')).to.equal('Translated');
        form.children[1].remove();form.firstElementChild.remove();await nextFrame();
        expect(input.hasAttribute('aria-describedby')).to.be.false;
        expect(input.hasAttribute('aria-label')).to.be.false;
      } finally {for (const [owner, name, descriptor] of saved) Object.defineProperty(owner, name, descriptor);}
    });

    it('upgrades pre-definition properties and captures their reset baseline', async () => {
      const customTag = `test-toggle-${crypto.randomUUID()}`;
      const form = await fixture(html`<form></form>`), el = document.createElement(customTag);
      el.checked = true;el.name = 'pre';el.value = '';el.required = true;form.append(el);
      customElements.define(customTag, class extends customElements.get(tag) {});
      expect(Object.hasOwn(el, 'checked')).to.be.false;
      expect(new FormData(form).get('pre')).to.equal('');
      el.checked = false;form.reset();expect(el.checked).to.be.true;
      expect(el.required).to.be.true;
    });

    it('keeps selection and focus during locale updates', async () => {
      const [, el, input] = await mount('label="Original" checked');
      el.focus();el.setAttribute('label', '翻譯');el.setAttribute('on', '開啟');el.setAttribute('off', '關閉');await nextFrame();
      expect(el.checked).to.be.true;expect(el.shadowRoot.activeElement).to.equal(input);
      if (tag === 'au-switch') expect(input.getAttribute('aria-checked')).to.equal('true');
    });

    it('keeps a visible, non-shrinking default target and sufficiently dark boundary', async () => {
      const [, el, input] = await mount('label="Averylongunbrokenlabelthatneedstowrapwithoutshrinkingthecontrol"');
      el.style.display = 'block';el.style.width = '160px';await nextFrame();
      const rect = input.getBoundingClientRect();expect(rect.width).to.be.at.least(24);expect(rect.height).to.be.at.least(24);
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      ctx.fillStyle = getComputedStyle(input).borderTopColor;ctx.fillRect(0, 0, 1, 1);
      const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
      const luminance = rgb[0]*0.2126 + rgb[1]*0.7152 + rgb[2]*0.0722;
      expect(1.05 / (luminance + 0.05)).to.be.at.least(3);
    });
  });
}
