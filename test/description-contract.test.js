import {fixture, html, expect, nextFrame} from '@open-wc/testing';
import '../src/components/rating.js';
import '../src/components/file-upload.js';

for (const tag of ['au-rating', 'au-file-upload']) {
  const targets = el => tag === 'au-rating' ? [el._fieldset] : [el.container, el.triggerArea, el.defaultTrigger];
  for (const shadow of [false, true]) {
    it(`${tag} follows external descriptions in a ${shadow ? 'shadow' : 'document'} root without losing focus`, async () => {
      const wrapper = await fixture(html`<div></div>`);
      const root = shadow ? wrapper.attachShadow({mode:'open'}) : wrapper;
      const el = document.createElement(tag);
      el.setAttribute('aria-describedby','description-test description-test');
      root.append(el);
      const help = document.createElement('span'); help.id = 'description-test'; help.textContent = 'Select a value';
      root.append(help); await nextFrame();
      el.focus(); const focused = el.shadowRoot.activeElement;
      for (const target of targets(el)) {
        expect(target.ariaDescribedByElements.filter(node => node === help)).to.have.length(1);
      }
      help.textContent = 'Updated error'; await nextFrame();
      expect(el.shadowRoot.activeElement).to.equal(focused);
      const replacement = help.cloneNode(true); help.replaceWith(replacement); await nextFrame();
      for (const target of targets(el)) expect(target.ariaDescribedByElements).to.include(replacement);
      el.remove(); root.append(el); await nextFrame();
      replacement.remove(); await nextFrame();
      for (const target of targets(el)) expect(target.ariaDescribedByElements).not.to.include(replacement);
      el.removeAttribute('aria-describedby');
      for (const target of targets(el)) expect(target.ariaDescribedByElements.length).to.equal(tag === 'au-rating' ? 1 : 2);
    });
  }

  it(`${tag} fallback mirror updates, empties and retains internal descriptions`, async () => {
    const wrapper = await fixture(html`<div><span id="fallback-help">Error text</span></div>`);
    const el = document.createElement(tag); wrapper.append(el);
    // Model an engine without element-reference reflection on these targets.
    for (const target of targets(el)) Object.defineProperty(target, 'ariaDescribedByElements', {value:undefined,configurable:true});
    el.setAttribute('aria-describedby','fallback-help');
    expect(el._descriptionMirror.hidden).to.be.true;
    expect(el._descriptionMirror.textContent).to.equal('Error text');
    for (const target of targets(el)) expect(target.getAttribute('aria-describedby')).to.include('external-description');
    wrapper.querySelector('span').textContent = ''; await nextFrame();
    expect(el._descriptionMirror.textContent).to.equal('');
    for (const target of targets(el)) expect(target.getAttribute('aria-describedby')).to.equal(tag === 'au-rating' ? 'score' : 'upload-errors upload-drop');
  });
}

it('upload preserves consumer trigger ARIA and does not let aria-invalid=false mask required validity', async () => {
  const el = await fixture(html`<au-file-upload required aria-invalid="false"><button slot="trigger" aria-describedby="consumer-help">Choose</button></au-file-upload>`);
  expect(el.defaultTrigger.getAttribute('aria-invalid')).to.equal('true');
  expect(el.internals.checkValidity()).to.be.false;
  expect(el.querySelector('button').getAttribute('aria-describedby')).to.equal('consumer-help');
  el.value = [new File(['x'],'test.txt')];
  el.setAttribute('aria-invalid','true');
  expect(el.defaultTrigger.getAttribute('aria-invalid')).to.equal('true');
  expect(el.internals.checkValidity()).to.be.true; // ARIA is not a custom validation API.
  el.removeAttribute('aria-invalid');
  expect(el.defaultTrigger.getAttribute('aria-invalid')).to.equal('false');
});
