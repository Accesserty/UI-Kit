import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../src/components/rating.js';

describe('AuRating', () => {
  let el;
  
  beforeEach(async () => {
    el = await fixture(html`
      <au-rating 
        aria-label="Test rating"
        labels="Bad,OK,Good,Great,Excellent"
      ></au-rating>
    `);
  });

  // --- Initial State ---
  it('renders with correct initial attributes', () => {
    const fieldset = el.shadowRoot.querySelector('fieldset');
    expect(fieldset.getAttribute('role')).to.equal('radiogroup');
    expect(fieldset.getAttribute('aria-label')).to.equal('Test rating');
  });

  it('renders 5 stars by default', () => {
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios.length).to.equal(5);
  });

  it('renders labels for each star', () => {
    const labels = el.shadowRoot.querySelectorAll('.label-text');
    expect(labels[0].textContent).to.equal('Bad');
    expect(labels[4].textContent).to.equal('Excellent');
  });

  // --- Custom max attribute ---
  it('respects max attribute', async () => {
    const rating = await fixture(html`<au-rating max="10"></au-rating>`);
    const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios.length).to.equal(10);
  });

  // --- Value attribute ---
  it('selects correct radio based on value attribute', async () => {
    const rating = await fixture(html`<au-rating value="3"></au-rating>`);
    const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[2].checked).to.be.true;
  });

  // --- Score Display ---
  it('shows score when show-score attribute is present', async () => {
    const rating = await fixture(html`<au-rating value="4" max="5" show-score></au-rating>`);
    const score = rating.shadowRoot.querySelector('.score');
    expect(score.textContent).to.equal('4 / 5');
  });

  it('hides score when show-score attribute is not present', async () => {
    const rating = await fixture(html`<au-rating value="4" max="5"></au-rating>`);
    const score = rating.shadowRoot.querySelector('.score');
    expect(score.textContent).to.equal('');
  });

  it('displays score-info when present', async () => {
    const rating = await fixture(html`<au-rating value="4" max="5" show-score score-info="(100 votes)"></au-rating>`);
    const score = rating.shadowRoot.querySelector('.score');
    expect(score.textContent).to.equal('4 / 5 (100 votes)');
  });

  // --- Keyboard Navigation ---
  it('navigates with ArrowRight key', async () => {
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    radios[0].click();
    
    // Dispatch keydown on the fieldset or active element
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true });
    el.shadowRoot.querySelector('fieldset').dispatchEvent(event);
    
    await new Promise(r => setTimeout(r, 50));
    expect(el.value).to.equal(2);
  });

  it('selects first star with ArrowRight when value is 0', async () => {
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    // Do NOT click, just focus (simulating tab in)
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true });
    el.shadowRoot.querySelector('fieldset').dispatchEvent(event);
    
    await new Promise(r => setTimeout(r, 50));
    expect(el.value).to.equal(1);
  });

  it('cycles from last to first with ArrowRight', async () => {
    const rating = await fixture(html`<au-rating value="5"></au-rating>`);
    const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[4].focus();
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true });
    rating.shadowRoot.querySelector('fieldset').dispatchEvent(event);
    
    await new Promise(r => setTimeout(r, 50));
    expect(rating.value).to.equal(1);
  });

  // --- Change event ---
  it('dispatches change event when rating is selected', async () => {
    setTimeout(() => {
        const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
        radios[3].click();
    });
    const { detail } = await oneEvent(el, 'change');
    expect(detail.value).to.equal(4);
  });

  // --- Focus retention ---
  it('maintains focus on selected star after selection', async () => {
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[2].click();
    radios[2].focus();
    
    await new Promise(r => setTimeout(r, 50));
    expect(el.shadowRoot.activeElement).to.equal(radios[2]);
  });

  // --- Star Fill States ---
  it('fills stars correctly based on integer value', async () => {
    const rating = await fixture(html`<au-rating value="3" max="5"></au-rating>`);
    const wrappers = rating.shadowRoot.querySelectorAll('.star-wrapper');
    
    expect(wrappers[0].style.getPropertyValue('--au-rating-clip')).to.equal('0%');
    expect(wrappers[3].style.getPropertyValue('--au-rating-clip')).to.equal('100%');
  });

  it('fills stars correctly based on fractional value', async () => {
    const rating = await fixture(html`<au-rating value="3.5" max="5"></au-rating>`);
    const wrappers = rating.shadowRoot.querySelectorAll('.star-wrapper');
    
    expect(wrappers[2].style.getPropertyValue('--au-rating-clip')).to.equal('0%');
    expect(wrappers[3].style.getPropertyValue('--au-rating-clip')).to.equal('50%');
    expect(wrappers[4].style.getPropertyValue('--au-rating-clip')).to.equal('100%');
  });

  // --- Form Participation ---
  it('participates in form submission', async () => {
    const form = await fixture(html`
      <form>
        <au-rating name="rating" value="4"></au-rating>
      </form>
    `);
    const formData = new FormData(form);
    expect(formData.get('rating')).to.equal('4');
  });

  // --- Disabled State ---
  it('disables inputs when disabled attribute is present', async () => {
    const rating = await fixture(html`<au-rating disabled></au-rating>`);
    const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[0].disabled).to.be.true;
    expect(radios[4].disabled).to.be.true;
  });

  // --- Readonly State ---
  it('disables inputs when readonly attribute is present', async () => {
      const rating = await fixture(html`<au-rating readonly value="3"></au-rating>`);
      const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
      expect(radios[0].disabled).to.be.true;
      
      // Attempt generic click (should theoretically not change value if disabled)
      radios[4].click();
      await new Promise(r => setTimeout(r, 50));
      expect(rating.value).to.equal(3);
  });
});
