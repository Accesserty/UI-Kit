import { html, fixture, expect, oneEvent, nextFrame } from '@open-wc/testing';
import '../src/components/rating.js';

describe('AuRating', () => {
  it('mirrors horizontal keys and fractional fill in inherited RTL', async () => {
    const box=await fixture(html`<div dir="rtl"><au-rating value="2"></au-rating></div>`),el=box.querySelector('au-rating');
    const press=key=>el.shadowRoot.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,composed:true,cancelable:true}));
    el.focus();press('ArrowLeft');expect(el.value).to.equal(3);
    press('ArrowRight');expect(el.value).to.equal(2);
    press('ArrowDown');expect(el.value).to.equal(3);
    box.dir='ltr';press('ArrowRight');expect(el.value).to.equal(4);
    el.setAttribute('readonly','');el.value=3.5;
    const fill=el.shadowRoot.querySelectorAll('.star-fill')[3];
    fill.style.transition='none';
    expect(getComputedStyle(fill).clipPath).to.equal('inset(0px 50% 0px 0px)');
    box.dir='rtl';
    expect(getComputedStyle(fill).clipPath).to.equal('inset(0px 0px 0px 50%)');
  });

  it('forwards focus without changing selection and mirrors explicit invalid state', async () => {
    const form = await fixture(html`<form><button>Outside</button><au-rating name="score" value="3"></au-rating></form>`);
    const rating = form.querySelector('au-rating');
    let changes = 0; rating.addEventListener('change', () => changes++);
    rating.focus({preventScroll:true});
    expect(rating.shadowRoot.activeElement.value).to.equal('3');
    rating.setAttribute('aria-invalid', 'true');
    expect(rating.shadowRoot.querySelector('fieldset').getAttribute('aria-invalid')).to.equal('true');
    expect(rating.shadowRoot.activeElement.value).to.equal('3');
    rating.removeAttribute('aria-invalid');
    expect(rating.shadowRoot.querySelector('fieldset').hasAttribute('aria-invalid')).to.be.false;
    for (const state of ['disabled','readonly']) {
      rating.setAttribute(state, ''); form.querySelector('button').focus(); rating.focus();
      expect(document.activeElement).to.equal(form.querySelector('button'));
      rating.removeAttribute(state);
    }
    expect(new FormData(form).get('score')).to.equal('3');
    expect(changes).to.equal(0);
  });
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
    expect(score.classList.contains('visually-hidden')).to.be.true;
    expect(score.textContent).to.equal('4 / 5');
  });

  it('displays score-info when present', async () => {
    const rating = await fixture(html`<au-rating value="4" max="5" show-score score-info="(100 votes)"></au-rating>`);
    const score = rating.shadowRoot.querySelector('.score');
    expect(score.textContent).to.equal('4 / 5 (100 votes)');
  });

  it('uses localized rating label, star labels, and score text', async () => {
    const rating = await fixture(html`
      <au-rating
        value="4"
        max="5"
        show-score
        score-info="(共 128 則評價)"
        data-text-rating="滿意度評分"
        data-text-star="{value} 分，共 {max} 分"
        data-text-score="{value} / {max} 分 {scoreInfo}"
      ></au-rating>
    `);

    const fieldset = rating.shadowRoot.querySelector('fieldset');
    const radios = rating.shadowRoot.querySelectorAll('input[type="radio"]');
    const score = rating.shadowRoot.querySelector('.score');

    expect(fieldset.getAttribute('aria-label')).to.equal('滿意度評分');
    expect(radios[0].getAttribute('aria-label')).to.equal('1 分，共 5 分');
    expect(radios[4].getAttribute('aria-label')).to.equal('5 分，共 5 分');
    expect(score.textContent).to.equal('4 / 5 分 (共 128 則評價)');
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

  it('moves from the focused first star to the second with ArrowRight when unselected', async () => {
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    // Do NOT click, just focus (simulating tab in)
    
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true });
    el.shadowRoot.querySelector('fieldset').dispatchEvent(event);
    
    await new Promise(r => setTimeout(r, 50));
    expect(el.value).to.equal(2);
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

  it('supports framework name assignment and keeps form, radio and fill in sync', async () => {
    const form = await fixture(html`<form><au-rating value="1" show-score></au-rating></form>`);
    const rating = form.firstElementChild;
    rating.name = 'review';
    rating.value = 4;
    expect(rating.getAttribute('name')).to.equal('review');
    expect(new FormData(form).get('review')).to.equal('4');
    expect(rating.shadowRoot.querySelector('input:checked').value).to.equal('4');
    expect(rating.shadowRoot.querySelectorAll('.star-wrapper')[3].style.getPropertyValue('--au-rating-clip')).to.equal('0%');
    rating.name = 'updated';
    expect(new FormData(form).has('review')).to.be.false;
    expect(new FormData(form).get('updated')).to.equal('4');
  });

  it('does not round a fractional score into a different checked radio', async () => {
    el.value = 3.7;
    expect(el.shadowRoot.querySelector('input:checked')).to.be.null;
    expect(el.shadowRoot.querySelector('.score').textContent).to.include('3.7 / 5');
    const description = el.shadowRoot.getElementById(el.shadowRoot.querySelector('fieldset').getAttribute('aria-describedby'));
    expect(description?.textContent).to.include('3.7 / 5');
  });

  it('preserves a focused option when labels, name and score wording change', () => {
    const radio = el.shadowRoot.querySelectorAll('input')[2];
    radio.focus();
    el.setAttribute('labels', '一,二,三,四,五');
    el.setAttribute('name', 'localized');
    el.setAttribute('data-text-score', '{value} 分');
    expect(el.shadowRoot.activeElement).to.equal(radio);
    expect(el.shadowRoot.querySelectorAll('.label-text')[2].textContent).to.equal('三');
  });

  it('emits one change after reconnecting the same element repeatedly', async () => {
    const parent = el.parentElement;
    for (let i=0;i<3;i++) { el.remove(); parent.append(el); }
    let count = 0;
    parent.addEventListener('change', () => count++);
    el.shadowRoot.querySelectorAll('input')[3].click();
    expect(count).to.equal(1);
  });

  it('restores the initial value on reset and accepts zero in state restore', async () => {
    const form = await fixture(html`<form><au-rating name="review" value="2"></au-rating></form>`);
    const rating = form.firstElementChild;
    rating.value = 4;
    form.reset();
    expect(rating.value).to.equal(2);
    expect(rating.shadowRoot.querySelector('input:checked').value).to.equal('2');
    expect(new FormData(form).get('review')).to.equal('2');
    rating.formStateRestoreCallback('0', 'restore');
    expect(rating.value).to.equal(0);
    expect(rating.shadowRoot.querySelector('input:checked')).to.be.null;
  });

  it('respects disabled fieldsets and clears stale disabled/readonly semantics', async () => {
    const parent = await fixture(html`<fieldset disabled><au-rating value="2"></au-rating></fieldset>`);
    const rating = parent.firstElementChild;
    expect([...rating.shadowRoot.querySelectorAll('input')].every(input => input.disabled)).to.be.true;
    parent.disabled = false;
    await nextFrame();
    rating.readonly = true; rating.readonly = false;
    rating.disabled = true; rating.disabled = false;
    expect(rating.shadowRoot.querySelector('fieldset').hasAttribute('aria-disabled')).to.be.false;
    expect(rating.shadowRoot.querySelector('fieldset').hasAttribute('aria-readonly')).to.be.false;
    expect([...rating.shadowRoot.querySelectorAll('input')].some(input => input.disabled)).to.be.false;
    expect(rating.value).to.equal(2);
  });

  it('normalizes invalid/out-of-range values and follows a smaller max', () => {
    for (const value of ['NaN', 'Infinity', '-1', '3oops']) {
      el.value = value;
      expect(el.value).to.equal(0);
      expect(el.shadowRoot.querySelector('input:checked')).to.be.null;
    }
    el.value = 9;
    expect(el.value).to.equal(5);
    expect(el.shadowRoot.querySelector('input:checked').value).to.equal('5');
    el.setAttribute('max', '3');
    expect(el.value).to.equal(3);
    expect(el.shadowRoot.querySelector('input:checked').value).to.equal('3');
    el.setAttribute('max', '-10');
    expect(el.max).to.equal(5);
  });

  it('moves focus to a remaining option when max removes the focused option', () => {
    el.value = 5;
    el.shadowRoot.querySelector('input:checked').focus();
    el.max = 3;
    expect(el.shadowRoot.activeElement?.value).to.equal('3');
    el.max = 1000000;
    expect(el.max).to.equal(100);
    expect(el.shadowRoot.querySelectorAll('input')).to.have.length(100);
  });

  it('wraps ten stars and long labels without overflowing a narrow container', async () => {
    const wrapper = await fixture(html`<div style="width:280px"><au-rating max="10" show-score score-info="${'long-word'.repeat(30)}"></au-rating></div>`);
    const rating = wrapper.firstElementChild;
    rating.setAttribute('labels', 'long-label'.repeat(20));
    await nextFrame();
    expect(wrapper.scrollWidth).to.be.at.most(wrapper.clientWidth + 1);
    for (const label of rating.shadowRoot.querySelectorAll('label')) {
      expect(label.getBoundingClientRect().width).to.be.at.least(24);
      expect(label.getBoundingClientRect().height).to.be.at.least(24);
    }
  });

  it('does not emit a user change for property updates, reset or state restore', async () => {
    const form = await fixture(html`<form><au-rating name="review" value="1"></au-rating></form>`);
    const rating = form.firstElementChild;
    let changes = 0; form.addEventListener('change', () => changes++);
    rating.value = 4; form.reset(); rating.formStateRestoreCallback('2','restore');
    expect(changes).to.equal(0);
    expect(new FormData(form).get('review')).to.equal('2');
    rating.disabled = true;
    expect(new FormData(form).has('review')).to.be.false;
    rating.disabled = false; rating.readonly = true;
    expect(new FormData(form).get('review')).to.equal('2');
  });
});
