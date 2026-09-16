// Tests run in the Web Test Runner environment
import '../src/components/pagination.js';
import { html, fixture, expect, nextFrame } from '@open-wc/testing';

describe('AuPagination Web Component', () => {
  it('provides a confirm button for jump and emits page-change on click', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="40"
        data-page-size="10"
        data-current-page="1"
      ></au-pagination>
    `);
      
    let detail;
    el.addEventListener('page-change', e => (detail = e.detail));

    const input = el.shadowRoot.querySelector('input[type="number"]');
    const btn = el.shadowRoot.querySelector('.au-pagination-group:nth-child(3) button');
    input.value = '3';
     
    btn.click();
    await nextFrame();

    expect(detail).to.equal(3);
    expect(el.getAttribute('data-current-page')).to.equal('3');
  });
  
  it('calculates totalPages correctly', async () => {
    const el = await fixture(html`
      <au-pagination data-total="95" data-page-size="10"></au-pagination>
    `);
    expect(el.totalPages).to.equal(10);
  });

  it('renders correct group1 info (total pages, total items, page size)', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="50"
        data-page-size="5"
        data-current-page="1"
      ></au-pagination>
    `);

    const grp1 = el.shadowRoot.querySelector(
      '.au-pagination-container > .au-pagination-group'
    );
    // Native label contains the visible prefix and visually hidden purpose text.
    expect(grp1.children.length).to.equal(5);

    const [totalPagesSpan, totalItemsSpan, preSpan, select, postSpan] = Array.from(grp1.children);
    expect(totalPagesSpan.textContent).to.contain('10');
    expect(totalItemsSpan.textContent).to.contain('50');
    expect(preSpan.textContent).to.equal(el.texts.perText + ' ' + el.texts.pageSizeText);
    // The current page size remains represented even outside the configured options.
    expect(select.tagName).to.equal('SELECT');
    expect(select.value).to.equal('5');
    expect(postSpan.textContent).to.equal(el.texts.totalItemsSuffix);
  });

  it('supports localized accessibility labels and page announcements', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="50"
        data-page-size="10"
        data-current-page="1"
        data-text-pagination-label="分頁"
        data-text-page-size="每頁顯示筆數"
        data-text-page-announcement="目前第 {page} 頁"
      ></au-pagination>
    `);

    const nav = el.shadowRoot.querySelector('nav');
    const hiddenLabel = el.shadowRoot.querySelector('.visually-hidden');
    expect(nav.getAttribute('aria-label')).to.equal('分頁');
    expect(hiddenLabel.textContent).to.equal('每頁顯示筆數');

    const pageTwoButton = el.shadowRoot.querySelectorAll('.pagination-buttons li button')[3];
    pageTwoButton.click();
    await nextFrame();
    await nextFrame();
    expect(el.liveRegion.textContent).to.include('目前第 2 頁');
  });

  it('renders correct number of pagination buttons', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="100"
        data-page-size="10"
        data-pager-count="5"
        data-current-page="1"
      ></au-pagination>
    `);
    const buttons = el.shadowRoot.querySelectorAll(
      '.pagination-buttons li button'
    );
    expect(buttons.length).to.equal(9);
  });

  it('emits page-change and updates attribute when clicking page buttons', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="30"
        data-page-size="10"
        data-pager-count="5"
        data-current-page="1"
      ></au-pagination>
    `);

    let detail;
    el.addEventListener('page-change', (e) => (detail = e.detail));

    const btn = el.shadowRoot.querySelectorAll(
      '.pagination-buttons li button'
    )[3];
    btn.click();
    await nextFrame();

    expect(detail).to.equal(2);
    expect(el.getAttribute('data-current-page')).to.equal('2');
  });

  it('emits page-size-change and resets current page on select change', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="200"
        data-page-size="20"
        data-current-page="3"
      ></au-pagination>
    `);

    let detail;
    el.addEventListener('page-size-change', (e) => (detail = e.detail));

    const select = el.shadowRoot.querySelector('select');
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await nextFrame();

    expect(detail).to.equal(50);
    expect(el.getAttribute('data-current-page')).to.equal('1');
  });

  it('renders jump input with correct value and max', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="80"
        data-page-size="10"
        data-current-page="4"
      ></au-pagination>
    `);

    const input = el.shadowRoot.querySelector('input[type="number"]');
    expect(input.value).to.equal('4');
    expect(input.max).to.equal('8');
    expect(input.min).to.equal('1');
  });

  it('preserves Next, select, jump and status nodes across navigation and translation', async () => {
    const el = await fixture(html`<au-pagination data-total="100"></au-pagination>`);
    const next = el.shadowRoot.querySelector('[data-control="next"]');
    const select = el.shadowRoot.querySelector('select');
    const input = el.shadowRoot.querySelector('input');
    const status = el.liveRegion;
    next.focus(); next.click(); await nextFrame();
    expect(el.shadowRoot.activeElement).to.equal(next);
    expect(el.currentPage).to.equal(2);
    expect(el.liveRegion).to.equal(status);
    input.focus(); input.value = '7';
    el.setAttribute('data-text-go', '跳至');
    el.setAttribute('data-text-next', '下一頁'); await nextFrame();
    expect(el.shadowRoot.querySelector('input')).to.equal(input);
    expect(el.shadowRoot.querySelector('select')).to.equal(select);
    expect(el.shadowRoot.activeElement).to.equal(input);
    expect(input.value).to.equal('7');
  });

  it('moves focus to the current page when a focused navigation control becomes disabled or removed', async () => {
    const el = await fixture(html`<au-pagination data-total="20"></au-pagination>`);
    const next = el.shadowRoot.querySelector('[data-control="next"]'); next.focus(); next.click(); await nextFrame();
    expect(el.shadowRoot.activeElement.getAttribute('aria-current')).to.equal('page');
    el.layout = ['jump']; await nextFrame();
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('nav'));
  });

  it('does not steal external focus for controlled updates and supports writable numeric properties', async () => {
    const wrapper = await fixture(html`<div><button>Outside</button><au-pagination data-total="100"></au-pagination></div>`);
    const el = wrapper.querySelector('au-pagination'), outside = wrapper.querySelector('button'); outside.focus();
    let events = 0; el.addEventListener('page-change', () => events++);
    el.total = 220; el.pageSize = 20; el.currentPage = 8; el.pagerCount = 3; await nextFrame();
    expect(el.totalPages).to.equal(11); expect(el.pagers).to.deep.equal([7,8,9]);
    expect(el.shadowRoot.querySelector('select').value).to.equal('20');
    expect(document.activeElement).to.equal(outside); expect(events).to.equal(0);
  });

  it('normalizes unsafe numeric and non-array settings without loops or render failures', async () => {
    const el = await fixture(html`<au-pagination data-total="-5" data-page-size="0" data-current-page="Infinity" data-pager-count="-2" data-page-size-options="null" data-layout="null"></au-pagination>`);
    expect(el.total).to.equal(0); expect(el.totalPages).to.equal(1);
    expect(el.pageSize).to.equal(10); expect(el.currentPage).to.equal(1);
    el.total = 10000; el.pagerCount = 999999; el.currentPage = 99999;
    el.pageSizeOptions = [0,-3,5,5,'20','3junk',null,1.5]; await nextFrame();
    expect(el.pagers.length).to.be.at.most(100);
    expect(el.currentPage).to.equal(el.totalPages);
    expect(el.pageSizeOptions).to.deep.equal([5,20]);
    for (const value of [NaN, Infinity, 1.5]) el._goto(value);
    expect(el.currentPage).to.equal(el.totalPages);
  });

  it('rejects blank, fractional and out-of-range jump entries without changing page', async () => {
    const el = await fixture(html`<au-pagination data-total="100"></au-pagination>`);
    const input = el.shadowRoot.querySelector('input');
    let events = 0; el.addEventListener('page-change', () => events++);
    input.reportValidity = () => input.checkValidity();
    for (const value of ['', '1.5', '999']) {
      input.value = value;
      input.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true, cancelable:true }));
    }
    expect(events).to.equal(0); expect(el.currentPage).to.equal(1);
    input.value = '3'; input.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true }));
    expect(events).to.equal(1); expect(el.currentPage).to.equal(3);
  });

  it('emits page-size-change only after both size and reset page are coherent, without duplicate page events', async () => {
    const el = await fixture(html`<au-pagination data-total="200" data-current-page="3"></au-pagination>`);
    const select = el.shadowRoot.querySelector('select'); select.focus();
    const states = []; let pages = 0;
    el.addEventListener('page-change', () => pages++);
    el.addEventListener('page-size-change', e => states.push([e.detail,el.pageSize,el.currentPage,e.bubbles,e.composed]));
    select.value = '50'; select.dispatchEvent(new Event('change')); await nextFrame();
    expect(states).to.deep.equal([[50,50,1,true,true]]); expect(pages).to.equal(0);
    expect(el.shadowRoot.activeElement).to.equal(select);
  });

  it('keeps navigation handlers current when total changes and coalesces announcements', async () => {
    const el = await fixture(html`<au-pagination data-total="40"></au-pagination>`);
    const last = el.shadowRoot.querySelector('[data-control="last"]');
    el.total = 100; await nextFrame(); last.click(); await nextFrame();
    expect(el.currentPage).to.equal(10);
    el._goto(2); el._goto(3); await nextFrame();
    expect(el.liveRegion.textContent).to.equal('Page 3');
    expect(el.liveRegion.children.length).to.equal(1);
  });

  it('reconnects without duplicating events and labels the size control with visible and purpose text', async () => {
    const wrapper = await fixture(html`<div><au-pagination data-total="100" data-text-per="每頁" data-text-page-size="顯示筆數"></au-pagination></div>`);
    const el = wrapper.firstElementChild; let count = 0;
    el.addEventListener('page-change', () => count++); el.remove(); wrapper.append(el); await nextFrame();
    el.shadowRoot.querySelector('[data-control="next"]').click(); await nextFrame();
    expect(count).to.equal(1);
    const select = el.shadowRoot.querySelector('select');
    expect(select.labels[0].textContent).to.equal('每頁 顯示筆數');
    expect([...el.shadowRoot.querySelectorAll('button')].every(button=>button.type==='button')).to.equal(true);
  });

  it('supports rapid navigation before a render frame and passes automated shadow accessibility checks', async () => {
    const el = await fixture(html`<au-pagination data-total="100"></au-pagination>`);
    const next = el.shadowRoot.querySelector('[data-control="next"]'); next.focus();
    next.click(); next.click(); await nextFrame();
    expect(el.currentPage).to.equal(3); expect(el.shadowRoot.activeElement).to.equal(next);
    await expect(el).shadowDom.to.be.accessible();
  });
});
