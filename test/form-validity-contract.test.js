// form-validity-contract.test.js — the native form-control API shared through
// AuFormElement: setCustomValidity and form, compared with a native control.
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/input.js';
import '../src/components/textarea.js';
import '../src/components/checkbox.js';
import '../src/components/switch.js';
import '../src/components/radio.js';
import '../src/components/rating.js';
import '../src/components/file-upload.js';

const fields = {
  'au-input': '<au-input name="f" label="F" required></au-input>',
  'au-textarea': '<au-textarea name="f" label="F" required></au-textarea>',
  'au-checkbox': '<au-checkbox name="f" label="F" required></au-checkbox>',
  'au-switch': '<au-switch name="f" label="F" required></au-switch>',
  'au-radio-group': '<au-radio-group name="f" label="F" required><au-radio value="x">X</au-radio></au-radio-group>',
  'au-rating': '<au-rating name="f" label="F"></au-rating>',
  'au-file-upload': '<au-file-upload name="f" label="F" required></au-file-upload>',
};
const state = el => ({ valid: el.validity.valid, customError: el.validity.customError, valueMissing: el.validity.valueMissing, message: el.validationMessage === 'Taken' });

describe('Form controls: setCustomValidity and form, as on native controls', () => {
  for (const [tag, markup] of Object.entries(fields)) {
    it(`${tag} matches a native input step by step`, async () => {
      const required = markup.includes('required');
      const form = await fixture(html`<form></form>`);
      form.innerHTML = `${markup}<input ${required ? 'required' : ''}>`;
      await nextFrame();
      const el = form.querySelector(tag), native = form.querySelector('input');
      expect(el.form).to.equal(form);
      for (const message of ['Taken', '']) {
        el.setCustomValidity(message); native.setCustomValidity(message);
        expect(state(el), `after setCustomValidity('${message}')`).to.deep.equal(state(native));
        expect(el.matches(':invalid')).to.equal(native.matches(':invalid'));
        if (message) {
          form.reset(); await nextFrame();
          expect(state(el), 'a custom error survives reset').to.deep.equal(state(native));
        }
      }
    });
  }

  it('reports a custom error on the visible control', async () => {
    const form = await fixture(html`<form><au-input name="a" label="A"></au-input><au-file-upload name="b" label="B"></au-file-upload></form>`);
    await nextFrame();
    const [input, upload] = [form.querySelector('au-input'), form.querySelector('au-file-upload')];
    upload.setCustomValidity('Taken');
    expect(upload.reportValidity()).to.be.false;
    expect(upload.shadowRoot.activeElement).to.equal(upload.triggerArea);
    input.setCustomValidity('Taken');
    expect(form.reportValidity()).to.be.false;
    expect(input.shadowRoot.activeElement).to.equal(input.shadowRoot.querySelector('input'));
  });

  it('form is null outside a form and follows the form attribute', async () => {
    const wrapper = await fixture(html`<div><form id="target"></form><au-input id="loose" label="L"></au-input><au-input id="tied" label="T" form="target"></au-input></div>`);
    expect(wrapper.querySelector('#loose').form).to.equal(null);
    expect(wrapper.querySelector('#tied').form).to.equal(wrapper.querySelector('#target'));
  });
});
