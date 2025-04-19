import { html, fixture, expect } from "@open-wc/testing";
import "../src/components/button/button.js";

describe("RyBtn", () => {
  it("Test whether the ry-btn HTML tag exists, whether a shadow DOM has been created, and whether the <button> inside is an instance of HTMLElement.", async () => {
    const el = await fixture(html`<ry-btn></ry-btn>`);
    expect(el.shadowRoot).to.exist;
    expect(el.shadowRoot.querySelector('button')).to.be.an.instanceof(HTMLElement);
  });

  it("Test whether the button content is displayed correctly.", async () => {
    const el = await fixture(html`<ry-btn><span>Test Content</span></ry-btn>`);
    const slotContent = el.shadowRoot.querySelector("slot").assignedNodes();
    const contentText = Array.from(slotContent).reduce((acc, node) => acc + node.textContent, "");
    expect(contentText).to.include("Test Content");
  });
  
  it('Test if the attributes are inherited. except @ and style', async () => {
    const el = await fixture(html`<ry-btn title="this is attribute title content test" @click="handleClick" style="width: 10px;"></ry-btn>`);
    await el.updateComplete;
    const buttonInside = el.shadowRoot.querySelector('button');
    expect(buttonInside.getAttribute('title')).to.equal('this is attribute title content test');
  });

  it('Test disabled', async () => {
    const el = await fixture(html`<ry-btn disabled></ry-btn>`);
    await el.updateComplete;
    const buttonInside = el.shadowRoot.querySelector('button');
    expect(buttonInside.hasAttribute('disabled')).to.be.true;
  });

  it('Test loading and whether the spinner exist', async () => {
    const el = await fixture(html`<ry-btn loading></ry-btn>`);
    await el.updateComplete;
    const buttonInside = el.shadowRoot.querySelector('button');
    expect(buttonInside.hasAttribute('loading')).to.be.true;
    expect(buttonInside.hasAttribute('disabled')).to.be.true;
    expect(buttonInside.hasAttribute('aria-busy')).to.be.true;
    const spinner = buttonInside.querySelector('.spinner');
    expect(spinner, 'whether the spinner exist').to.exist;
    const spans = spinner.querySelectorAll('span');
    expect(spans.length, 'whether the spinner has 3 items').to.equal(3);
  });

});
