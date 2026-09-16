import { html, fixture, expect, nextFrame } from "@open-wc/testing";
import "../src/components/breadcrumbs.js";

describe("AuBreadcrumbs", () => {
  it('upgrades properties assigned before deferred registration without shadowing setters', async () => {
    const tag = 'test-late-breadcrumbs';
    const el = document.createElement(tag);
    el.setAttribute('items', '[{"text":"Old"}]');
    el.items = '[{"text":"Home","url":"/"},{"text":"Current"}]';
    el.separator = '›';
    document.body.append(el);
    try {
      customElements.define(tag, class extends customElements.get('au-breadcrumbs') {});
      expect(Object.hasOwn(el, 'items')).to.be.false;
      expect(Object.hasOwn(el, 'separator')).to.be.false;
      expect(el.items).to.deep.equal([{text:'Home',url:'/'},{text:'Current'}]);
      expect(el.shadowRoot.querySelector('a').textContent).to.equal('Home');
      expect(el.shadowRoot.querySelector('[aria-hidden=true]').textContent).to.equal('›');
      el.items = [{text:'Updated',url:'/docs'},{text:'Here'}];
      expect(el.shadowRoot.querySelector('a').textContent).to.equal('Updated');
      el.remove();document.body.append(el);
      expect(el.shadowRoot.querySelectorAll('li')).to.have.length(2);
    } finally { el.remove(); }
  });

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
    expect(nav.ariaLabelledByElements).to.deep.equal([el.querySelector('#crumb-label')]);
  });

  it('uses label attribute as fallback aria-label', async () => {
    const el = await fixture(html`<au-breadcrumbs label="My crumbs"></au-breadcrumbs>`);
    const nav = el.shadowRoot.querySelector('nav');
    expect(nav.getAttribute('aria-label')).to.equal('My crumbs');
  });

  it('uses localized link title template when provided', async () => {
    const el = await fixture(html`
      <au-breadcrumbs
        data-link-title-template="前往{text}"
        items='[{"text":"首頁","url":"/"}, {"text":"目前頁"}]'
      ></au-breadcrumbs>
    `);
    const anchor = el.shadowRoot.querySelector('a');
    expect(anchor.getAttribute('title')).to.equal('前往首頁');
  });

  it('escapes rendered text, separator, link title, and inherited nav labels', async () => {
    const el = await fixture(html`
      <au-breadcrumbs
        aria-label='Breadcrumb "trail"'
        separator="<"
        data-link-title-template="前往{text}"
        items='[{"text":"<Home>","url":"/"}, {"text":"Current"}]'
      ></au-breadcrumbs>
    `);
    const nav = el.shadowRoot.querySelector('nav');
    const anchor = el.shadowRoot.querySelector('a');
    const separator = el.shadowRoot.querySelector('li span[aria-hidden="true"]');

    expect(nav.getAttribute('aria-label')).to.equal('Breadcrumb "trail"');
    expect(anchor.textContent).to.include('<Home>');
    expect(anchor.getAttribute('title')).to.equal('前往<Home>');
    expect(separator.textContent).to.equal('<');
    expect(el.shadowRoot.querySelector('a span').innerHTML).to.equal('&lt;Home&gt;');
  });

  it('renders executable, unsupported, missing and malformed URLs as text', async () => {
    const el = await fixture(html`<au-breadcrumbs></au-breadcrumbs>`);
    for (const url of ['javascript:alert(1)', ' JAVAscript:alert(1)', 'java\nscript:alert(1)',
      'java\tscript:alert(1)', 'data:text/html,test', 'vbscript:msgbox(1)',
      'file:///etc/passwd', 'blob:https://example.com/id', 'mailto:test@example.com', 'http://[', '', null]) {
      el.items = [{ text: 'Unsafe', url }, { text: 'Current' }];
      expect(el.shadowRoot.querySelector('a'), String(url)).to.be.null;
      expect(el.shadowRoot.querySelector('li').textContent).to.include('Unsafe');
      expect(el.shadowRoot.querySelectorAll('[aria-current="page"]')).to.have.length(1);
    }
  });

  it('allows HTTP(S), relative, fragment and query navigation through URL parsing', async () => {
    const el = await fixture(html`<au-breadcrumbs></au-breadcrumbs>`);
    for (const url of ['https://example.com/a', 'http://example.com/', '/docs', '../guide', '#section', '?page=2', '//example.com/a']) {
      el.items = [{ text: 'Link', url }, { text: 'Current' }];
      expect(el.shadowRoot.querySelector('a').href).to.equal(new URL(url, document.baseURI).href);
    }
  });

  it('handles valid JSON with a non-list shape and malformed entries without throwing', async () => {
    const el = await fixture(html`<au-breadcrumbs></au-breadcrumbs>`);
    for (const value of ['null', 'true', '42', '"text"', '{"other":1}']) {
      el.setAttribute('items', value);
      expect(el.shadowRoot.querySelectorAll('li')).to.have.length(0);
    }
    el.setAttribute('items', '[null,42,[],{"text":"Current"}]');
    expect(el.shadowRoot.querySelectorAll('li')).to.have.length(1);
  });

  it('allows local file navigation only from an actual local document, not a hosted file base', async () => {
    const el = await fixture(html`<au-breadcrumbs></au-breadcrumbs>`);
    const resolve = (value, URL, baseURI = URL) => el.navigationURL.call({ownerDocument:{URL,baseURI}},value);
    const local = 'file:///demo/breadcrumbs.html';
    for (const value of ['./index.html','../guide.html','#section','?page=2','file:///demo/index.html']) {
      expect(resolve(value,local)).to.equal(new URL(value,local).href);
    }
    for (const value of ['javascript:alert(1)','java\nscript:alert(1)','data:text/html,test',
      'blob:null/test','file://remote-host/share/file.html','//remote-host/share/file.html']) {
      expect(resolve(value,local),value).to.equal(null);
    }
    expect(resolve('./index.html','https://example.com/','file:///demo/')).to.equal(null);
    expect(resolve('file:///demo/index.html','https://example.com/')).to.equal(null);
    expect(resolve('https://example.com/',local)).to.equal('https://example.com/');
  });

  it('updates external label references on replacement without rebuilding focused links', async () => {
    const wrapper = await fixture(html`<div><span id="dynamic-crumb-label">Navigation</span>
      <au-breadcrumbs aria-labelledby="dynamic-crumb-label" items='[{"text":"Home","url":"/"},{"text":"Current"}]'></au-breadcrumbs></div>`);
    const el = wrapper.querySelector('au-breadcrumbs');
    const nav = el.shadowRoot.querySelector('nav');
    const link = nav.querySelector('a');
    link.focus();
    const replacement = document.createElement('span');
    replacement.id = 'dynamic-crumb-label'; replacement.textContent = '導覽';
    wrapper.firstElementChild.replaceWith(replacement);
    await nextFrame();
    expect(nav.ariaLabelledByElements).to.deep.equal([replacement]);
    expect(el.shadowRoot.activeElement).to.equal(link);
    expect(el.shadowRoot.querySelector('nav')).to.equal(nav);
  });

  it('resolves ordered labels in the containing shadow root and supports late labels', async () => {
    const wrapper = await fixture(html`<div></div>`);
    const root = wrapper.attachShadow({mode:'open'});
    root.innerHTML = '<au-breadcrumbs aria-labelledby="second first" label="Fallback"></au-breadcrumbs>';
    const el = root.firstElementChild;
    for (const id of ['first', 'second']) {
      const label = document.createElement('span'); label.id = id; label.textContent = id;
      root.append(label);
    }
    await nextFrame();
    expect(el.shadowRoot.querySelector('nav').ariaLabelledByElements)
      .to.deep.equal([root.getElementById('second'), root.getElementById('first')]);
  });

  it('preserves focused links during label and separator changes', async () => {
    const el = await fixture(html`<au-breadcrumbs items='[{"text":"Home","url":"/"},{"text":"Current"}]'></au-breadcrumbs>`);
    const link = el.shadowRoot.querySelector('a'); link.focus();
    el.setAttribute('aria-label', '導覽'); el.separator = '›';
    expect(el.shadowRoot.activeElement).to.equal(link);
  });

  it('releases and rebinds external label tracking across reconnects', async () => {
    const wrapper = await fixture(html`<div><span id="reconnect-label">Original</span>
      <au-breadcrumbs aria-labelledby="reconnect-label"></au-breadcrumbs></div>`);
    const el = wrapper.querySelector('au-breadcrumbs');
    el.remove();
    const replacement = document.createElement('span'); replacement.id = 'reconnect-label'; replacement.textContent = 'New';
    wrapper.firstElementChild.replaceWith(replacement);
    wrapper.append(el); await nextFrame();
    expect(el.shadowRoot.querySelector('nav').ariaLabelledByElements).to.deep.equal([replacement]);
  });

  it('keeps keyboard focus within navigation if a focused URL is revoked', async () => {
    const el = await fixture(html`<au-breadcrumbs items='[{"text":"Home","url":"/"},{"text":"Current"}]'></au-breadcrumbs>`);
    el.shadowRoot.querySelector('a').focus();
    el.items = [{text:'Home',url:'javascript:alert(1)'},{text:'Current'}];
    expect(el.shadowRoot.querySelector('a')).to.be.null;
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('nav'));
  });

  it('falls back to its localized name when all referenced labels disappear', async () => {
    const wrapper = await fixture(html`<div><span id="removed-label">Navigation</span>
      <au-breadcrumbs aria-labelledby="removed-label" label="導覽"></au-breadcrumbs></div>`);
    const el = wrapper.querySelector('au-breadcrumbs');
    wrapper.firstElementChild.remove();
    await nextFrame();
    const nav = el.shadowRoot.querySelector('nav');
    expect(nav.ariaLabelledByElements).to.have.length(0);
    expect(nav.getAttribute('aria-label')).to.equal('導覽');
  });

  it('supports dynamic plain-text labels without native element-reference APIs', async () => {
    // Simulate an older engine for this fixture only, restoring the native API.
    let owner = Element.prototype;
    while (owner && !Object.hasOwn(owner, 'ariaLabelledByElements')) owner = Object.getPrototypeOf(owner);
    const descriptor = owner && Object.getOwnPropertyDescriptor(owner, 'ariaLabelledByElements');
    try {
      if (owner) delete owner.ariaLabelledByElements;
      const wrapper = await fixture(html`<div><span id="legacy-label">Original</span>
        <au-breadcrumbs aria-labelledby="legacy-label" label="Fallback"></au-breadcrumbs></div>`);
      const el = wrapper.querySelector('au-breadcrumbs');
      const nav = el.shadowRoot.querySelector('nav');
      expect('ariaLabelledByElements' in nav).to.be.false;
      expect(nav.getAttribute('aria-label')).to.equal('Original');
      wrapper.firstElementChild.textContent = 'Updated';
      await nextFrame();
      expect(nav.getAttribute('aria-label')).to.equal('Updated');
      el.setAttribute('aria-label', 'Explicit rich-label alternative');
      expect(nav.getAttribute('aria-label')).to.equal('Explicit rich-label alternative');
      el.removeAttribute('aria-label');
      wrapper.firstElementChild.remove();
      await nextFrame();
      expect(nav.getAttribute('aria-label')).to.equal('Fallback');
    } finally {
      if (owner) Object.defineProperty(owner, 'ariaLabelledByElements', descriptor);
    }
  });

  it('wraps long breadcrumb text in narrow containers', async () => {
    const wrapper = await fixture(html`<div style="width:180px"><au-breadcrumbs></au-breadcrumbs></div>`);
    const el = wrapper.firstElementChild;
    el.items = [{text:'long-name'.repeat(30),url:'/docs'},
      {text:'blocked-name'.repeat(30),url:'javascript:alert(1)'},
      {text:'current-name'.repeat(30)}];
    await nextFrame();
    const nav = el.shadowRoot.querySelector('nav');
    expect(nav.scrollWidth).to.be.at.most(nav.clientWidth + 1);
  });
});
