// aria-forwarding-contract.test.js — the shared name/description forwarding
// (src/core/aria.js) in engines without element-reference reflection.
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../src/components/input.js';
import '../src/components/textarea.js';
import '../src/components/checkbox.js';
import '../src/components/switch.js';
import '../src/components/radio.js';

const targets = {
  'au-input': el => el.input,
  'au-textarea': el => el.textarea,
  'au-checkbox': el => el.inputElement,
  'au-switch': el => el.inputElement,
  'au-radio-group': el => el._container,
};

// Removes the reflected properties for one test, then restores them.
async function withoutReflection(run) {
  const removed = [];
  for (const name of ['ariaLabelledByElements', 'ariaDescribedByElements']) {
    let owner = Element.prototype;
    while (owner && !Object.hasOwn(owner, name)) owner = Object.getPrototypeOf(owner);
    if (!owner) continue;
    removed.push([owner, name, Object.getOwnPropertyDescriptor(owner, name)]);
    delete owner[name];
  }
  try { await run(); } finally {
    for (const [owner, name, descriptor] of removed) Object.defineProperty(owner, name, descriptor);
  }
}

describe('ARIA forwarding without element references', () => {
  for (const [tag, target] of Object.entries(targets)) {
    it(`${tag} names and describes its control as text`, () => withoutReflection(async () => {
      const wrapper = await fixture(html`<div><span id="fwd-name">Delivery address</span><span id="fwd-help">As on your ID</span></div>`);
      const el = document.createElement(tag);
      el.setAttribute('aria-labelledby', 'fwd-name');
      el.setAttribute('aria-describedby', 'fwd-help');
      wrapper.append(el);
      await nextFrame();
      const control = target(el);
      expect('ariaLabelledByElements' in control).to.be.false;
      expect(control.getAttribute('aria-label')).to.equal('Delivery address');
      expect(el._descriptionMirror.hidden).to.be.true;
      expect(el._descriptionMirror.textContent).to.equal('As on your ID');
      expect(control.getAttribute('aria-describedby')).to.equal(el._descriptionMirror.id);
      el.setAttribute('aria-label', 'Explicit name');
      await nextFrame();
      expect(control.getAttribute('aria-label')).to.equal('Explicit name');
    }));
  }
});
