import { fixture, expect } from '@open-wc/testing';
import '../src/components/carousel.js';

const tick = () => new Promise((r) => setTimeout(r));

const slidesHtml = (n) =>
  Array.from(
    { length: n },
    (_, i) => `<div data-title="Slide ${i + 1}"><a href="#s${i + 1}">Link ${i + 1}</a></div>`
  ).join('');

// Build a real <au-carousel> node (with dynamic children) and connect it via
// fixture — @open-wc's `html` tag can't interpolate a raw HTML string safely.
async function mount(innerHtml, attrs = {}) {
  const el = document.createElement('au-carousel');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.innerHTML = innerHtml;
  return fixture(el);
}

describe('AuCarousel', () => {
  it('renders one pagination dot per slotted slide', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    expect(el.shadowRoot.querySelectorAll('.au-carousel-dot').length).to.equal(4);
  });

  it('names each dot from data-title and includes its position in the set', async () => {
    const el = await mount(
      '<div data-title="Coastal cliffs"><a href="#a">A</a></div>' +
        '<div data-title="City at dusk"><a href="#b">B</a></div>'
    );
    await tick();
    const dots = el.shadowRoot.querySelectorAll('.au-carousel-dot');
    expect(dots[0].getAttribute('aria-label')).to.equal('Coastal cliffs, 1 of 2');
    expect(dots[1].getAttribute('aria-label')).to.equal('City at dusk, 2 of 2');
  });

  it('customizes the dot name/position with data-dot-template (i18n)', async () => {
    const el = await mount(
      '<div data-title="海岸"><a href="#a">A</a></div>' +
        '<div data-title="城市"><a href="#b">B</a></div>',
      { 'data-dot-template': '{title}，第 {current} 項，共 {total} 項' }
    );
    await tick();
    const dots = el.shadowRoot.querySelectorAll('.au-carousel-dot');
    expect(dots[0].getAttribute('aria-label')).to.equal('海岸，第 1 項，共 2 項');
    expect(dots[1].getAttribute('aria-label')).to.equal('城市，第 2 項，共 2 項');
  });

  it('falls back to the slide heading (with position) when no data-title is given', async () => {
    const el = await mount('<div><h3>From heading</h3><a href="#a">A</a></div>');
    await tick();
    expect(el.shadowRoot.querySelector('.au-carousel-dot').getAttribute('aria-label')).to.equal(
      'From heading, 1 of 1'
    );
  });

  it('exposes a visually-hidden usage hint tied to the pagination group', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    const group = el.shadowRoot.querySelector('.au-carousel-pagination');
    const hintId = group.getAttribute('aria-describedby');
    expect(hintId).to.be.a('string').and.not.equal('');
    const hint = el.shadowRoot.getElementById(hintId);
    expect(hint).to.exist;
    expect(hint.textContent).to.equal('Use the arrow keys to move between slides.');
  });

  it('localizes the usage hint via data-text-instructions', async () => {
    const el = await mount(slidesHtml(3), { 'data-text-instructions': '用方向鍵切換投影片' });
    await tick();
    const group = el.shadowRoot.querySelector('.au-carousel-pagination');
    const hint = el.shadowRoot.getElementById(group.getAttribute('aria-describedby'));
    expect(hint.textContent).to.equal('用方向鍵切換投影片');
  });

  it('keeps the usage hint after a slot rebuild', async () => {
    const el = await mount(slidesHtml(2));
    await tick();
    const extra = document.createElement('div');
    extra.dataset.title = 'Added';
    extra.innerHTML = '<a href="#x">X</a>';
    el.appendChild(extra);
    await tick();
    const group = el.shadowRoot.querySelector('.au-carousel-pagination');
    const hint = el.shadowRoot.getElementById(group.getAttribute('aria-describedby'));
    expect(hint).to.exist;
    expect(hint.textContent).to.equal('Use the arrow keys to move between slides.');
  });

  it('uses a translatable positional fallback when a slide is unnamed', async () => {
    const el = await mount('<div><a href="#a">A</a></div><div><a href="#b">B</a></div>', {
      'data-item-fallback': '第 {current} / {total} 張',
    });
    await tick();
    const dots = el.shadowRoot.querySelectorAll('.au-carousel-dot');
    expect(dots[0].getAttribute('aria-label')).to.equal('第 1 / 2 張');
    expect(dots[1].getAttribute('aria-label')).to.equal('第 2 / 2 張');
  });

  it('marks only the current dot with aria-current', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    expect(dots[0].getAttribute('aria-current')).to.equal('true');
    expect(dots.slice(1).every((d) => d.getAttribute('aria-current') === 'false')).to.be.true;
  });

  it('keeps exactly one dot as a tab stop (roving tabindex)', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    dots[2].click();
    await tick();
    expect(dots[2].tabIndex).to.equal(0);
    expect(dots[0].tabIndex).to.equal(-1);
    expect(dots[1].tabIndex).to.equal(-1);
  });

  it('disables prev at the first slide and next at the last', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    expect(el._prevBtn.getAttribute('aria-disabled')).to.equal('true');
    expect(el._nextBtn.getAttribute('aria-disabled')).to.equal('false');
  });

  it('lets next/prev reach the very last slide (maxIndex = total - 1)', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    const next = el.shadowRoot.querySelector('[data-carousel-next]');
    next.click();
    next.click();
    next.click();
    await tick();
    expect(el.current).to.equal(3);
    expect(next.getAttribute('aria-disabled')).to.equal('true');
    expect(
      el.shadowRoot.querySelectorAll('.au-carousel-dot')[3].getAttribute('aria-current')
    ).to.equal('true');
  });

  it('moves the current slide with arrow keys inside the pagination group', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    dots[0].focus();
    dots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();
    expect(el.current).to.equal(1);
    el.shadowRoot.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true })
    );
    await tick();
    expect(el.current).to.equal(3);
    el.shadowRoot.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );
    await tick();
    expect(el.current).to.equal(0);
  });

  it('does NOT remove slides from the tab order (all stay reachable)', async () => {
    const el = await mount(slidesHtml(5));
    await tick();
    [...el.children].forEach((s) => {
      expect(s.hasAttribute('inert')).to.be.false;
      expect(s.querySelector('a').hasAttribute('tabindex')).to.be.false;
    });
  });

  it('emits a composed, bubbling slide-change event with detail', async () => {
    const wrapper = document.createElement('div');
    const carousel = document.createElement('au-carousel');
    carousel.innerHTML = slidesHtml(3);
    wrapper.appendChild(carousel);
    const el = await fixture(wrapper);
    const c = el.querySelector('au-carousel');
    await tick();
    let detail = null;
    el.addEventListener('slide-change', (e) => (detail = e.detail));
    c.shadowRoot.querySelector('[data-carousel-next]').click();
    await tick();
    expect(detail).to.deep.equal({ index: 1, total: 3, title: 'Slide 2' });
  });

  it('announces the current slide via the polite live region', async () => {
    const el = await mount(slidesHtml(3), {
      'data-live-template': '{title}, item {current} of {total}',
    });
    await tick();
    el.shadowRoot.querySelector('[data-carousel-next]').click();
    await tick();
    const live = el.shadowRoot.querySelector('.au-carousel-live');
    expect(live.getAttribute('aria-live')).to.equal('polite');
    expect(live.textContent).to.equal('Slide 2, item 2 of 3');
  });

  it('applies localized aria-labels to prev/next and the pagination group', async () => {
    const el = await mount(slidesHtml(2), {
      'data-text-prev': '上一張',
      'data-text-next': '下一張',
      'data-text-pagination': '選擇投影片',
    });
    await tick();
    expect(el.shadowRoot.querySelector('[data-carousel-prev]').getAttribute('aria-label')).to.equal(
      '上一張'
    );
    expect(el.shadowRoot.querySelector('[data-carousel-next]').getAttribute('aria-label')).to.equal(
      '下一張'
    );
    expect(
      el.shadowRoot.querySelector('.au-carousel-pagination').getAttribute('aria-label')
    ).to.equal('選擇投影片');
  });

  it('renders default chevron glyphs on the prev/next buttons', async () => {
    const el = await mount(slidesHtml(2));
    await tick();
    expect(el.shadowRoot.querySelector('[data-carousel-prev]').textContent).to.equal('‹');
    expect(el.shadowRoot.querySelector('[data-carousel-next]').textContent).to.equal('›');
  });

  it('lets authors swap the prev/next glyphs via data-icon-prev/next', async () => {
    const el = await mount(slidesHtml(2), { 'data-icon-prev': '←', 'data-icon-next': '→' });
    await tick();
    const prev = el.shadowRoot.querySelector('[data-carousel-prev]');
    const next = el.shadowRoot.querySelector('[data-carousel-next]');
    expect(prev.textContent).to.equal('←');
    expect(next.textContent).to.equal('→');
    // Swapping the glyph must not touch the accessible name.
    expect(prev.getAttribute('aria-label')).to.equal('Previous slide');
    expect(next.getAttribute('aria-label')).to.equal('Next slide');
  });

  it('updates the glyphs when the icon attributes change', async () => {
    const el = await mount(slidesHtml(2));
    await tick();
    el.setAttribute('data-icon-prev', '‹‹');
    el.setAttribute('data-icon-next', '››');
    await tick();
    expect(el.shadowRoot.querySelector('[data-carousel-prev]').textContent).to.equal('‹‹');
    expect(el.shadowRoot.querySelector('[data-carousel-next]').textContent).to.equal('››');
  });

  it('rebuilds the dots when slides are added', async () => {
    const el = await mount(slidesHtml(2));
    await tick();
    expect(el.shadowRoot.querySelectorAll('.au-carousel-dot').length).to.equal(2);

    const extra = document.createElement('div');
    extra.dataset.title = 'Added';
    extra.innerHTML = '<a href="#x">X</a>';
    el.appendChild(extra);
    await tick();

    const dots = el.shadowRoot.querySelectorAll('.au-carousel-dot');
    expect(dots.length).to.equal(3);
    expect(dots[2].getAttribute('aria-label')).to.equal('Added, 3 of 3');
  });

  it('clamps the current slide and updates controls when slides are removed', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    el.current = 2;
    await tick();

    el.lastElementChild.remove();
    await tick();

    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    const prev = el.shadowRoot.querySelector('[data-carousel-prev]');
    const next = el.shadowRoot.querySelector('[data-carousel-next]');
    expect(dots.length).to.equal(2);
    expect(el.current).to.equal(1);
    expect(dots[1].getAttribute('aria-current')).to.equal('true');
    expect(prev.getAttribute('aria-disabled')).to.equal('false');
    expect(next.getAttribute('aria-disabled')).to.equal('true');
  });

  it('clears its state and disables navigation when all slides are removed', async () => {
    const el = await mount(slidesHtml(2));
    await tick();

    el.replaceChildren();
    await tick();

    expect(el.current).to.equal(-1);
    expect(el.shadowRoot.querySelectorAll('.au-carousel-dot').length).to.equal(0);
    expect(el.shadowRoot.querySelector('[data-carousel-prev]').disabled).to.be.true;
    expect(el.shadowRoot.querySelector('[data-carousel-next]').disabled).to.be.true;
  });

  it('moves Shift+Tab from Previous to the current slide content', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    el.current = 1;
    await tick();

    const prev = el.shadowRoot.querySelector('[data-carousel-prev]');
    prev.focus();
    prev.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    );
    await tick();

    expect(document.activeElement).to.equal(el.children[1].querySelector('a'));
  });

  it('moves Tab from a dot to the current slide content', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    el.current = 1;
    await tick();

    const dot = el.shadowRoot.querySelectorAll('.au-carousel-dot')[1];
    dot.focus();
    dot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    await tick();

    expect(document.activeElement).to.equal(el.children[1].querySelector('a'));
  });

  it('does not re-announce via the live region while a dot is focused', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    const live = el.shadowRoot.querySelector('.au-carousel-live');
    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    dots[0].focus();
    live.textContent = ''; // clear whatever the initial render announced
    dots[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();
    // The focused dot announces its own "{title}, {current} of {total}" name, so
    // the live region must stay empty to avoid a double announcement.
    expect(el.current).to.equal(1);
    expect(live.textContent).to.equal('');
  });

  it('refresh() re-reads a slide title changed at runtime (locale switch)', async () => {
    const el = await mount(
      '<div data-title="Coast"><a href="#a">A</a></div>' +
        '<div data-title="City"><a href="#b">B</a></div>'
    );
    await tick();
    // Simulate a framework rewriting only the slide titles on a locale switch.
    el.children[0].dataset.title = '海岸';
    el.children[1].dataset.title = '城市';
    el.refresh();
    await tick();
    const dots = el.shadowRoot.querySelectorAll('.au-carousel-dot');
    expect(dots[0].getAttribute('aria-label')).to.equal('海岸, 1 of 2');
    expect(dots[1].getAttribute('aria-label')).to.equal('城市, 2 of 2');
  });

  it('auto-refreshes dot names when a slide data-title changes at runtime', async () => {
    const el = await mount(
      '<div data-title="Coast"><a href="#a">A</a></div>' +
        '<div data-title="City"><a href="#b">B</a></div>'
    );
    await tick();
    el.children[0].dataset.title = '海岸';
    // MutationObserver is debounced ~100ms.
    await new Promise((r) => setTimeout(r, 160));
    expect(el.shadowRoot.querySelector('.au-carousel-dot').getAttribute('aria-label')).to.equal(
      '海岸, 1 of 2'
    );
  });

  it('auto-refreshes dot names when a slide heading text changes at runtime', async () => {
    const el = await mount(
      '<div><h3>Coast</h3><a href="#a">A</a></div><div><h3>City</h3><a href="#b">B</a></div>'
    );
    await tick();
    el.querySelector('h3').textContent = '海岸';
    await new Promise((r) => setTimeout(r, 160));
    expect(el.shadowRoot.querySelector('.au-carousel-dot').getAttribute('aria-label')).to.equal(
      '海岸, 1 of 2'
    );
  });

  it('preserves the current index and focused dot across a refresh', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    el.current = 2;
    const dots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    dots[2].focus();
    el.refresh();
    await tick();
    expect(el.current).to.equal(2);
    const newDots = [...el.shadowRoot.querySelectorAll('.au-carousel-dot')];
    expect(el.shadowRoot.activeElement).to.equal(newDots[2]);
  });

  it('exposes current as a property getter/setter', async () => {
    const el = await mount(slidesHtml(4));
    await tick();
    expect(el.current).to.equal(0);
    el.current = 2;
    await tick();
    expect(el.current).to.equal(2);
    expect(
      el.shadowRoot.querySelectorAll('.au-carousel-dot')[2].getAttribute('aria-current')
    ).to.equal('true');
  });

  it('clamps current within range and never goes out of bounds', async () => {
    const el = await mount(slidesHtml(3));
    await tick();
    el.current = 99;
    await tick();
    expect(el.current).to.equal(2);
    el.current = -5;
    await tick();
    expect(el.current).to.equal(0);
  });

  it('normalizes invalid and fractional indexes without accessing a missing slide', async () => {
    const el=await mount(slidesHtml(3));await tick();
    for(const value of [NaN,Infinity,undefined,null,'bad',{},Symbol('invalid')]){
      el.current=value;expect(el.current).to.equal(0);
    }
    el.current='1.9';expect(el.current).to.equal(1);
    el.setCurrent(2.8);expect(el.current).to.equal(2);
  });

  it('retains current slide and dot identity on reorder and translation', async () => {
    const el=await mount(slidesHtml(3));await tick();
    el.current=1;const slide=el.children[1],dot=el._dots[1];dot.focus();
    const changes=[];el.addEventListener('slide-change',e=>changes.push(e.detail));
    el.prepend(slide);el.refresh();
    expect(el.current).to.equal(0);expect(el._dots[0]).to.equal(dot);
    expect(el.shadowRoot.activeElement).to.equal(dot);
    slide.dataset.title='翻譯';el.refresh();
    expect(el._dots[0]).to.equal(dot);expect(dot.getAttribute('aria-label')).to.equal('翻譯, 1 of 3');
    expect(changes).to.have.length(0);
    expect(el._dots.filter(n=>n.tabIndex===0)).to.have.length(1);
  });

  it('recovers removed dot focus and clears empty announcements', async () => {
    const el=await mount(slidesHtml(3));await tick();
    el.current=2;el._dots[2].focus();el.lastElementChild.remove();el.refresh();
    expect(el.shadowRoot.activeElement).to.equal(el._dots[1]);
    el.replaceChildren();el.refresh();
    expect(el.current).to.equal(-1);expect(el._live.textContent).to.equal('');
    expect(el.shadowRoot.activeElement).to.equal(el._wrapper);
    el.setCurrent(3);expect(el.current).to.equal(-1);
  });

  it('skips hidden, negative-tabindex, disabled-fieldset and inert focus targets', async () => {
    const el=await mount('<div data-title="First"><button hidden>Hidden</button><button tabindex="-1">Skip</button><fieldset disabled><button>Disabled</button></fieldset><div inert><button>Inert</button></div><button id="usable">Usable</button></div>');await tick();
    expect(el._firstFocusable(0)).to.equal(el.querySelector('#usable'));
    const dot=el._dots[0];dot.focus();dot.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    expect(document.activeElement).to.equal(el.querySelector('#usable'));
  });

  it('can enter a slide that is itself a native focusable element', async () => {
    const el=await mount('<a href="#first" data-title="First">First</a>');await tick();
    expect(el._firstFocusable(0)).to.equal(el.firstElementChild);
  });

  it('supports Safari Option+Tab traversal from dots and back from Previous', async () => {
    const el=await mount(slidesHtml(3));await tick();el.current=1;
    for(const [button,shiftKey] of [[el._dots[1],false],[el._prevBtn,true]]){
      button.focus();button.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',altKey:true,shiftKey,bubbles:true,cancelable:true}));
      expect(document.activeElement).to.equal(el.children[1].querySelector('a'));
    }
  });

  it('keeps boundary button focus and emits no extra event on repeated activation', async () => {
    const el=await mount(slidesHtml(2));await tick();
    const events=[];el.addEventListener('slide-change',e=>events.push(e.detail.index));
    el._nextBtn.focus();el._nextBtn.click();el._nextBtn.click();
    expect(el.shadowRoot.activeElement).to.equal(el._nextBtn);
    expect(el._nextBtn.disabled).to.be.false;
    expect(el._nextBtn.getAttribute('aria-disabled')).to.equal('true');expect(events).to.deep.equal([1]);
  });

  it('ignores modified shortcuts and maps horizontal arrows in RTL', async () => {
    const el=await mount(slidesHtml(3),{dir:'rtl'});await tick();
    el._dots[0].focus();el._dots[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',ctrlKey:true,bubbles:true}));
    expect(el.current).to.equal(0);
    el._dots[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
    expect(el.current).to.equal(1);
    el._scrollToIndex(2,'instant');el._onSettled();expect(el.current).to.equal(2);
  });

  it('retains dots and one notification through reconnection', async () => {
    const wrapper=await fixture(document.createElement('div')),el=document.createElement('au-carousel');el.innerHTML=slidesHtml(3);wrapper.append(el);await tick();
    const dot=el._dots[1],events=[];el.addEventListener('slide-change',e=>events.push(e.detail.index));
    for(let i=0;i<3;i++){el.remove();wrapper.append(el);}
    expect(el._dots[1]).to.equal(dot);dot.click();expect(events).to.deep.equal([1]);
  });

  it('upgrades current assigned before registration', async () => {
    const tag='test-carousel-'+crypto.randomUUID(),el=document.createElement(tag);el.innerHTML=slidesHtml(3);el.current=2;
    await fixture(el);customElements.define(tag,class extends customElements.get('au-carousel'){});
    expect(Object.hasOwn(el,'current')).to.be.false;expect(el.current).to.equal(2);
  });

  it('resolves replaced external names in a containing shadow root without replacing dots', async () => {
    const wrapper=await fixture(document.createElement('div')),root=wrapper.attachShadow({mode:'open'});
    root.innerHTML='<span id="gallery-label">Destinations</span><au-carousel aria-labelledby="gallery-label">'+slidesHtml(2)+'</au-carousel>';
    await tick();const el=root.lastElementChild,dot=el._dots[0];dot.focus();
    expect(el._wrapper.ariaLabelledByElements).to.deep.equal([root.firstElementChild]);
    root.firstElementChild.replaceWith(root.firstElementChild.cloneNode(true));await tick();
    expect(el._wrapper.ariaLabelledByElements).to.deep.equal([root.firstElementChild]);
    el.setAttribute('data-text-roledescription','輪播');
    expect(el._wrapper.getAttribute('aria-roledescription')).to.equal('輪播');
    expect(el.shadowRoot.activeElement).to.equal(dot);
  });
});
