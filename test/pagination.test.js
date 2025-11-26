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
    // Should have 6 direct children: hidden label, pre-span, select, post-span, plus two spans for totals
    expect(grp1.children.length).to.equal(6);

    const [totalPagesSpan, totalItemsSpan, hiddenLabel, preSpan, select, postSpan] = Array.from(grp1.children);
    expect(totalPagesSpan.textContent).to.contain('10');
    expect(totalItemsSpan.textContent).to.contain('50');
    expect(preSpan.textContent).to.equal(el.texts.perText);
    // select.value should default to first option '10'
    expect(select.tagName).to.equal('SELECT');
    expect(select.value).to.equal('10');
    expect(postSpan.textContent).to.equal(el.texts.totalItemsSuffix);
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

  
});