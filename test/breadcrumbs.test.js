import { html, fixture, expect } from "@open-wc/testing";
import "../src/components/breadcrumbs.js";

describe("AuBreadcrumbs", () => {
  it("renders the correct number of breadcrumb items", async () => {
    const el = await fixture(
      html`<au-breadcrumbs
        items='[{"text":"Home","url":"/"}, {"text":"About","url":"/about"}]'
      ></au-breadcrumbs>`
    );
    expect(el.shadowRoot.querySelectorAll("nav>ol>li").length).to.equal(2);
  });

  it("displays text for each breadcrumb item", async () => {
    const el = await fixture(
      html`<au-breadcrumbs
        items='[{"text":"Home", "url":"/"}]'
      ></au-breadcrumbs>`
    );
    const item = el.shadowRoot.querySelector("nav>ol>li:first-child");
    expect(item.textContent).to.include("Home");
  });

  it("makes all but the last breadcrumb item clickable", async () => {
    const el = await fixture(
      html`<au-breadcrumbs
        items='[{"text":"Home","url":"/"}, {"text":"About","url":"/about"}, {"text":"Contact"}]'
      ></au-breadcrumbs>`
    );
    const anchors = el.shadowRoot.querySelectorAll("nav>ol>li>a");
    expect(anchors.length).to.equal(2);
    expect(anchors[0].href).to.contain("/");
    expect(anchors[1].href).to.contain("/about");

    const lastLi = el.shadowRoot.querySelector('nav>ol>li:last-child');
    expect(lastLi.querySelector('a')).to.be.null;
    const current = lastLi.querySelector('[aria-current="page"]');
    expect(current).to.not.be.null;
    expect(current.hasAttribute('href')).to.be.false;
  });

  it('should use the custom separator string in li content, except the last one', async () => {
    const separator = ">";
    const el = await fixture(html`
      <au-breadcrumbs
        separator="${separator}"
        items='[{"text":"Home","url":"/"}, {"text":"About","url":"/about"}, {"text":"Contact"}]'
      ></au-breadcrumbs>
    `);

    const lis = el.shadowRoot.querySelectorAll('ol li');
    lis.forEach((li, index) => {
      const sepSpan = li.querySelector('span[aria-hidden="true"]');
      if (index < lis.length - 1) {
        expect(sepSpan.textContent).to.equal(separator);
      } else {
        expect(sepSpan).to.be.null;
      }
    });
  });

  it('Test if the attributes are inherited.', async () => {
    const separator = ">";
    const el = await fixture(html`
      <au-breadcrumbs
        id="demo-id"
        class="demo-class"
        aria-label="demo-aria-label"
      ></au-breadcrumbs>
    `);
    await el.updateComplete;
    const breadcrumbsInside = el.shadowRoot.querySelector('nav');
    expect(breadcrumbsInside.getAttribute('id')).to.equal('demo-id');
    expect(breadcrumbsInside.getAttribute('class')).to.equal('demo-class');
    expect(breadcrumbsInside.getAttribute('aria-label')).to.equal('demo-aria-label');
  });

  it('displays content in slots correctly', async () => {
    const el = await fixture(html`
      <au-breadcrumbs
        items='[{"text":"Home","url":"/"}, {"text":"About","url":"/about"}, {"text":"Contact"}]'
      >
        <span slot="icon-2">icon</span>
      </au-breadcrumbs>
    `);

    await el.updateComplete;
    const iconSlot = el.shadowRoot.querySelector('slot[name="icon-2"]');
    const slottedContent = iconSlot.assignedNodes()[0];
    expect(slottedContent.textContent).to.equal('icon');
  });

  it('applies aria-labelledby when aria-label is absent', async () => {
    const el = await fixture(html`
      <div>
        <span id="crumb-label">Breadcrumb navigation</span>
        <au-breadcrumbs aria-labelledby="crumb-label"></au-breadcrumbs>
      </div>
    `);

    const comp = el.querySelector('au-breadcrumbs');
    const nav = comp.shadowRoot.querySelector('nav');
    expect(nav.getAttribute('aria-labelledby')).to.equal('crumb-label');
  });

  it('uses label attribute as fallback aria-label', async () => {
    const el = await fixture(html`<au-breadcrumbs label="My crumbs"></au-breadcrumbs>`);
    const nav = el.shadowRoot.querySelector('nav');
    expect(nav.getAttribute('aria-label')).to.equal('My crumbs');
  });
});
