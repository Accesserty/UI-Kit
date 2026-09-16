import {fixture, html, expect, nextFrame} from '@open-wc/testing';
import '../src/accesserty-ui-kit.js';

const tags = [
  'au-accordion', 'au-accordion-item', 'au-breadcrumbs', 'au-card',
  'au-carousel', 'au-checkbox', 'au-dropdown', 'au-dropdown-item',
  'au-file-upload', 'au-input', 'au-pagination', 'au-radio-group',
  'au-rating', 'au-switch', 'au-tabs', 'au-textarea', 'au-tree', 'au-tree-node',
];

for (const tag of tags) {
  describe(`${tag} host visibility`, () => {
    it('honors initial and toggled hidden without destroying the shadow content', async () => {
      const root = await fixture(html`<div></div>`);
      const el = document.createElement(tag);
      el.hidden = true;
      root.append(el);
      await nextFrame();
      const shadow = el.shadowRoot;
      expect(getComputedStyle(el).display).to.equal('none');
      expect(el.getClientRects().length).to.equal(0);
      el.hidden = false;
      await nextFrame();
      expect(getComputedStyle(el).display).not.to.equal('none');
      expect(el.shadowRoot).to.equal(shadow);
      // Invalid values still mean hidden in HTML, including the string "false".
      el.setAttribute('hidden', 'false');
      expect(getComputedStyle(el).display).to.equal('none');
      el.removeAttribute('hidden');
      expect(getComputedStyle(el).display).not.to.equal('none');
    });

    it('does not force display:none on hidden=until-found', async () => {
      const root = await fixture(html`<div></div>`);
      const el = document.createElement(tag);
      el.setAttribute('hidden', 'until-found');
      root.append(el);
      await nextFrame();
      expect(getComputedStyle(el).display).not.to.equal('none');
      el.setAttribute('hidden', 'UNTIL-FOUND');
      expect(getComputedStyle(el).display).not.to.equal('none');
      // This checks CSS preservation, not browser Find-in-page support.
    });
  });
}
