/**
 * @jest-environment jsdom
 */
import '../src/components/pagination.js';
import { html, fixture, expect } from '@open-wc/testing';

describe('AuPagination Web Component', () => {
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

    const grp1 = el.shadowRoot
      .querySelector('.au-pagination-container > .au-pagination-group');
    // 只統計直接子元素（span wrapper）數量
    expect(grp1.children.length).to.equal(3);

    const [totalPagesEl, totalItemsEl, pageSizeEl] = grp1.children;
    expect(totalPagesEl.textContent).to.contain('10');
    expect(totalItemsEl.textContent).to.contain('50');
    expect(pageSizeEl.textContent).to.contain('5');
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
    const buttons = el.shadowRoot.querySelectorAll('.pagination-buttons li button');
    // first, prev, 5 page buttons, next, last => total 9
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
    el.addEventListener('page-change', e => detail = e.detail);

    // click the 4th button: first, prev, page1, page2
    const btn = el.shadowRoot
      .querySelectorAll('.pagination-buttons li button')[3];
    btn.click();
    await el.updateComplete;

    expect(detail).to.equal(2);
    expect(el.getAttribute('data-current-page')).to.equal('2');
  });

  it('emits page-size-change and retains current page on select change', async () => {
    const el = await fixture(html`
      <au-pagination
        data-total="200"
        data-page-size="20"
        data-current-page="3"
      ></au-pagination>
    `);

    let detail;
    el.addEventListener('page-size-change', e => detail = e.detail);

    const select = el.shadowRoot.querySelector('select');
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(detail).to.equal(50);
    // 元件預設不改變 current-page，檢查仍舊是 3
    expect(el.getAttribute('data-current-page')).to.equal('3');
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
});
