# Contributing to Accesserty UI Kit

Thank you for your interest! This project's goal is not only accessibility — it is "Design for All."

This document explains how to set up your development environment, create new components, write tests, and submit pull requests.


## Prerequisites

- **Node.js 20 or higher** — components are tested in a real Chromium instance via `@web/test-runner`
- **Git**

```bash
# Verify your Node version
node --version  # must be v20.x or higher
```


## Setup

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/UI-Kit.git
cd UI-Kit

# 2. Install dependencies
npm ci

# 3. Run tests to confirm everything works
npm test

# 4. Build dist files
npm run build
```


## Development Workflow

### Running Tests

```bash
# Run all 14 component test suites (sequential, ~12 seconds)
npm test

# Test a single component during development
npx web-test-runner test/input.test.js --node-resolve
```

Tests run in a real Chromium browser. Always use `npm test` before submitting a PR — all 174 tests must pass.

### Building

```bash
npm run build
```

This produces `dist/accesserty-ui-kit.js` and `dist/accesserty-ui-kit.min.js`.
**Do not include `dist/` changes in your pull request** — the maintainers rebuild on release.


## Adding a New Component

### 1. Create the component file

`src/components/my-component.js` — use this template:

```js
class AuMyComponent extends HTMLElement {
  // static formAssociated = true;  // add this for form-participating components

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // this.internals = this.attachInternals(); // for form-associated components

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
      }
      /* Use CSS custom properties for all themeable values:
         --au-my-component-[part]-[property] */
    `;

    this.shadowRoot.appendChild(style);
  }

  static get observedAttributes() {
    return [/* list all observed attributes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // sync attribute → shadow DOM
  }

  connectedCallback() {
    // setup after insertion into DOM
  }

  disconnectedCallback() {
    // cleanup event listeners
  }

  // formResetCallback() { }  // required for form-associated components

  generateId() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const byteArray = new Uint32Array(1);
      crypto.getRandomValues(byteArray);
      return `au-my-component-${byteArray[0].toString(36)}`;
    }
    return `au-my-component-${Math.random().toString(36).slice(2)}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-my-component')) {
  customElements.define('au-my-component', AuMyComponent);
}
```

### 2. Add to the bundle entry

```js
// src/accesserty-ui-kit.js
import './components/my-component.js';  // add this line
```

### 3. Write tests

`test/my-component.test.js` — minimum required coverage:

```js
import { html, fixture, expect, nextFrame } from '@open-wc/testing';
import '../src/components/my-component.js';

describe('AuMyComponent', () => {
  it('renders correctly', async () => {
    const el = await fixture(html`<au-my-component></au-my-component>`);
    // assert shadow DOM structure
  });

  it('reflects attributes', async () => { /* ... */ });

  it('property getters and setters work', async () => { /* ... */ });

  it('events bubble and compose across shadow DOM', async () => {
    const wrapper = await fixture(html`<div><au-my-component></au-my-component></div>`);
    const el = wrapper.querySelector('au-my-component');
    let received = false;
    wrapper.addEventListener('change', () => { received = true; });
    // trigger the event
    expect(received).to.be.true;
  });

  // For form-associated components:
  it('participates in FormData', async () => {
    const form = await fixture(html`
      <form>
        <au-my-component name="field" value="test"></au-my-component>
      </form>
    `);
    expect(new FormData(form).get('field')).to.equal('test');
  });

  it('resets correctly on form reset', async () => { /* ... */ });
});
```

### 4. Write the demo page

`demo/my-component.html` — follow this section order:

1. Usage examples (with `<h2>` headings for each variant)
2. CSS Variables table (Variable | Description | Default)
3. Properties table (Property | Type | Description)
4. Events table (Event | Detail | Description)

Add a link in `demo/index.html`.

### 5. Add to playground

Add a new config entry in `demo/playground-engine.js` following the existing `COMPONENT_CONFIGS` pattern.


## CSS Variable Naming Convention

Pattern: `--au-[component]-[part]-[property]-[state]`

```
--au-input-label-text-color           ✅
--au-switch-input-border-radius       ✅
--au-checkbox-input-checked-bg        ✅ (state: checked)
--au-tabs-selected-text-stroke-color  ✅ (state: selected)
--au-input-focus-shadow-width         ✅ (state: focus)

--input-color                         ❌ (missing au- prefix)
--au-input-color                      ❌ (missing part)
```

Every CSS variable used in a component's `style.textContent` must appear in the demo page's CSS Variables table with its exact default value.


## Accessibility Requirements

All components must meet **WCAG 2.2 AA**. Before submitting:

- Keyboard navigation works without a mouse
- All interactive elements have visible focus indicators (`focus-visible`)
- ARIA roles, states, and properties are correct
- Form-associated components integrate with native form validation
- Errors and state changes are announced via `aria-live` where appropriate
- Color contrast meets 4.5:1 for normal text, 3:1 for large text


## Pull Request Process

### Before you start

- Open an issue first for significant changes (new components, architecture changes)
- Small fixes (typos, CSS variable corrections) can go directly to a PR

### Checklist

- [ ] All 174 existing tests pass (`npm test`)
- [ ] New tests written for new behavior
- [ ] Demo page updated (new component) or corrected (bug fix)
- [ ] CSS variables table in demo matches the component source exactly
- [ ] No external dependencies added
- [ ] `dist/` changes are **not** included in the PR
- [ ] Commit messages follow the convention below

### Target branch

Always PR to the `dev` branch, not `main`.

### Commit convention

```
feat:     new component or feature
fix:      bug fix
refactor: code restructure, no behavior change
docs:     documentation only changes
test:     test additions or corrections
build:    build configuration changes
revert:   revert a previous commit
```

Example: `feat: add au-tooltip component`


## Issue Labels

When opening an issue, use these labels:

| Label | Use for |
|---|---|
| `bug` | Something is broken |
| `enhancement` | New feature or improvement |
| `accessibility` | Accessibility compliance gap |
| `documentation` | Docs missing or wrong |
| `question` | General questions |


## Release Format

Tags follow `vX.X.X` semantic versioning.
