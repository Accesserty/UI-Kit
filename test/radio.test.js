import { html, fixture, expect } from '@open-wc/testing';
import '../src/components/radio.js';

describe('AuRadioGroup', () => {
  it('renders correct number of radios based on children', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="one">One</div>
        <div value="two">Two</div>
        <div value="three">Three</div>
      </au-radio-group>
    `);

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios.length).to.equal(3);
  });

  it('marks the correct radio as checked', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="a">A</div>
        <div value="b" checked>B</div>
      </au-radio-group>
    `);

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[1].checked).to.be.true;
    expect(radios[0].checked).to.be.false;
  });

  it('applies disabled to all radios when group is disabled', async () => {
    const el = await fixture(html`
      <au-radio-group disabled>
        <div value="x">X</div>
        <div value="y">Y</div>
      </au-radio-group>
    `);

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => expect(radio.disabled).to.be.true);
  });

  it('keyboard navigation: right/down arrow wraps forward', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement.shadowRoot.activeElement).to.equal(radios[1]);
  });

  it('keyboard navigation: left/up arrow wraps backward', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);

    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    radios[0].focus();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement.shadowRoot.activeElement).to.equal(radios[1]);
  });

  it('adds aria-label to radiogroup when attribute is present', async () => {
    const el = await fixture(html`
      <au-radio-group aria-label="Options">
        <div value="A">A</div>
      </au-radio-group>
    `);

    const group = el.shadowRoot.querySelector('.au-radio-group');
    expect(group.getAttribute('aria-label')).to.equal('Options');
  });

  it('adds vertical class when direction="vertical"', async () => {
    const el = await fixture(html`
      <au-radio-group direction="vertical">
        <div value="1">1</div>
        <div value="2">2</div>
      </au-radio-group>
    `);

    const group = el.shadowRoot.querySelector('.au-radio-group');
    expect(group.classList.contains('au-radio-group--vertical')).to.be.true;
  });

  it('respects individual radio disabled attribute', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="1">One</div>
        <div value="2" disabled>Two</div>
      </au-radio-group>
    `);
  
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    expect(radios[0].disabled).to.be.false;
    expect(radios[1].disabled).to.be.true;
  });

  it('assigns the same name to all radios for grouping', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="x">X</div>
        <div value="y">Y</div>
      </au-radio-group>
    `);
  
    const radios = el.shadowRoot.querySelectorAll('input[type="radio"]');
    const name1 = radios[0].getAttribute('name');
    const name2 = radios[1].getAttribute('name');
  
    expect(name1).to.equal(name2);
  });

  it('ensures label "for" matches input id for accessibility', async () => {
    const el = await fixture(html`
      <au-radio-group>
        <div value="a">A</div>
      </au-radio-group>
    `);
  
    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input[type="radio"]');
  
    expect(label.getAttribute('for')).to.equal(input.getAttribute('id'));
  });  
});
