// ssr-inject.test.js — server-side insertion of declarative shadow roots.
import { expect } from '@open-wc/testing';
import { createInjector, injectDeclarativeShadow } from '../src/ssr/inject.js';

const page = `<!doctype html><html><head><script>var s="<au-accordion-item>";</script><style>au-accordion-item{}</style></head><body>
<!-- <au-accordion-item> in a comment -->
<au-accordion exclusive data-text-exclusive-hint='One "answer" at a time'><au-accordion-item open heading-level="2"><span slot="heading">Q</span><div slot="content"><img src=x alt="a>b"><br></div></au-accordion-item>
<au-accordion-item><span slot="heading">R</span></au-accordion-item></au-accordion>
<au-accordion-item>orphan</au-accordion-item><textarea><au-accordion-item></textarea></body></html>`;

const count = (text, part) => text.split(part).length - 1;

describe('injectDeclarativeShadow', () => {
  const html = injectDeclarativeShadow(page);

  it('adds one declarative root after each supported start tag', () => {
    expect(count(html, '<template shadowrootmode="open">')).to.equal(4);
  });

  it('leaves script, style, comments and textarea text alone', () => {
    expect(html).to.include('var s="<au-accordion-item>";</script>');
    expect(html).to.include('<!-- <au-accordion-item> in a comment -->');
    expect(html).to.include('<textarea><au-accordion-item></textarea>');
  });

  it('renders state from the element and its group', () => {
    const doc = Document.parseHTMLUnsafe(html);
    const [first, second, orphan] = doc.querySelectorAll('au-accordion-item');
    expect(first.shadowRoot.getElementById('title').getAttribute('aria-expanded')).to.equal('true');
    expect(first.shadowRoot.querySelector('[role=heading]').getAttribute('aria-level')).to.equal('2');
    expect(first.shadowRoot.getElementById('hint').textContent).to.equal('One "answer" at a time');
    expect(second.shadowRoot.getElementById('region').getAttribute('hidden')).to.equal('until-found');
    expect(orphan.shadowRoot.getElementById('hint').textContent).to.equal('');
    expect(doc.querySelector('au-accordion').shadowRoot.querySelector('.au-accordion').getAttribute('aria-describedby')).to.equal('hint');
  });

  it('is idempotent', () => {
    expect(injectDeclarativeShadow(html)).to.equal(html);
  });

  it('gives the same result for streamed input, whatever the chunk size', () => {
    for (const size of [1, 2, 3, 5, 7, 11, 13, 17, 25, 40]) {
      const injector = createInjector();
      let out = '';
      for (let i = 0; i < page.length; i += size) out += injector.push(page.slice(i, i + size));
      out += injector.flush();
      expect(out, `chunk size ${size}`).to.equal(html);
    }
  });
});

describe('injectDeclarativeShadow for au-tabs', () => {
  const page = `<au-tabs aria-label="Product" selected-index="1" data-text-tab="Tab {index}" data-text-badge-label-prefix="Info:">
<p>Intro text that is not a panel</p>
<div class="au-tab-panel" slot="panel" label="Intro" data-badge="new"><au-tabs><div class="au-tab-panel" slot="panel">Inner</div></au-tabs></div>
<div class="au-tab-panel" slot="panel" label-lang="zh-Hant">規格</div>
<div class="au-tab-panel" slot="panel"><script>var x = "</div>";</script>Reviews</div>
</au-tabs>`;
  const html = injectDeclarativeShadow(page);
  const doc = Document.parseHTMLUnsafe(html);
  const outer = doc.querySelector('au-tabs');

  it('renders one tab per direct panel, labelled like the component', () => {
    const tabs = [...outer.shadowRoot.querySelectorAll('[role=tab]')];
    expect(tabs.map(tab => tab.textContent)).to.deep.equal(['Intronew', 'Tab 2', 'Tab 3']);
    expect(tabs.map(tab => tab.id)).to.deep.equal(['tab-1', 'tab-2', 'tab-3']);
    expect(tabs[0].querySelector('.badge').getAttribute('aria-label')).to.equal('Info: new');
    expect(tabs[1].querySelector('.label').lang).to.equal('zh-Hant');
    expect(outer.shadowRoot.querySelector('[role=tablist]').getAttribute('aria-label')).to.equal('Product');
  });

  it('selects selected-index and shows that panel before the script runs', () => {
    const tabs = [...outer.shadowRoot.querySelectorAll('[role=tab]')];
    expect(tabs.map(tab => tab.getAttribute('aria-selected'))).to.deep.equal(['false', 'true', 'false']);
    // The selected panel is the third element child (after the paragraph).
    expect(outer.shadowRoot.querySelector('style[data-preselect]').textContent).to.include(':nth-child(3)');
  });

  it('renders nested tabs from their own children', () => {
    const inner = outer.querySelector('au-tabs');
    expect([...inner.shadowRoot.querySelectorAll('[role=tab]')].map(tab => tab.textContent)).to.deep.equal(['Tab 1']);
  });

  it('waits for the end tag when streamed', () => {
    for (const size of [1, 4, 9, 33]) {
      const injector = createInjector();
      let out = '';
      for (let i = 0; i < page.length; i += size) out += injector.push(page.slice(i, i + size));
      out += injector.flush();
      expect(out, `chunk size ${size}`).to.equal(html);
    }
  });
});

describe('injectDeclarativeShadow for au-breadcrumbs', () => {
  const items = JSON.stringify([
    { text: 'Home', url: '/' }, { text: 'Bad', url: 'javascript:alert(1)' },
    { text: 'Docs & <guides>', url: 'docs.html?a=1&b=2' }, { text: 'Install', url: '/install' },
  ]);
  const html = injectDeclarativeShadow(`<au-breadcrumbs id="crumbs" class="site" label="Site" separator="›" data-link-title-template="Open {text} ({index})" items='${items.replace(/'/g, '&#39;')}'></au-breadcrumbs>`);
  const nav = Document.parseHTMLUnsafe(html).querySelector('au-breadcrumbs').shadowRoot.querySelector('nav');

  it('renders the items as links, keeping only safe URLs', () => {
    const entries = [...nav.querySelectorAll('li > .item')];
    expect(entries.map(entry => entry.localName)).to.deep.equal(['a', 'span', 'a', 'span']);
    expect(entries[0].getAttribute('href')).to.equal('/');
    expect(entries[2].getAttribute('href')).to.equal('docs.html?a=1&b=2');
    expect(entries[2].getAttribute('title')).to.equal('Open Docs & <guides> (3)');
    expect(entries[2].querySelector('span').textContent).to.equal('Docs & <guides>');
    expect(entries[3].getAttribute('aria-current')).to.equal('page');
  });

  it('copies id, class and label and uses the separator', () => {
    expect(nav.id).to.equal('crumbs');
    expect(nav.className).to.equal('site');
    expect(nav.getAttribute('aria-label')).to.equal('Site');
    expect([...nav.querySelectorAll('[aria-hidden="true"]')].map(s => s.textContent)).to.deep.equal(['›', '›', '›']);
    expect(nav.querySelector('slot[name="icon-1"]')).to.exist;
  });
});
