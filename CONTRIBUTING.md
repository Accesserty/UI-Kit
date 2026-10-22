# Contributing to Accesserty UI Kit

Thank you for your interest! This project's goal is not only accessibility — it is "Design for All."

This document explains how to set up your development environment, create new components, write tests, and submit pull requests.


## Prerequisites

- **Node.js from [`.nvmrc`](.nvmrc) and npm 11** — components are tested in a real Chromium instance via `@web/test-runner`
- **Git**

```bash
# Select and verify the repository's Node version (with nvm)
nvm install
nvm use
node --version
npm --version
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

The demo pages load `dist/accesserty-ui-kit.js`, so they open directly from disk
and show what consumers get. While editing `src/`, run `npm run dev` to rebuild
the bundle on every change, then reload the demo.


## Development Workflow

### Running Tests

```bash
# Run the complete unit-test suite sequentially
npm test

# Test a single component during development
npx web-test-runner test/input.test.js --node-resolve
```

Tests run in a real Chromium browser. Always use `npm test` before submitting a PR — the complete suite must pass.

### Integration tests

Install `test/ssr` dependencies (`npm ci --prefix test/ssr`) and Google Chrome
before running Playwright-based checks. Build fresh bundles with `npm run build`
before testing consumers. `npm run test:docs` also checks the audited CSS defaults
in demo tables and Playground; it is not a complete CSS parser or theme audit.
`npm run test:reserve` checks that the README's `:not(:defined)` reservation CSS
still reserves each component's registered height; update the README values when
a component's default size changes.

Use `npm run test:css -- chrome`, `npm run test:controls -- chrome`, and
`npm run test:pagination -- chrome` for Chrome-only runs. The component scripts in
`test/browser/` take the same argument, for example
`node test/browser/carousel.mjs chrome`.

Firefox and Safari run through WebDriver, using the `selenium-webdriver` installed
in `test/ssr` (set `UI_KIT_WEBDRIVER_MODULE` to use a different copy):

- `npm run test:firefox` runs every WebDriver check in headless Firefox. CI runs
  it; Selenium downloads the matching geckodriver on first use.
- `npm run test:safari` runs the same checks in Safari, which needs macOS and
  opens visible windows. Enable it once with `safaridriver --enable` and, in
  Safari, Develop → Allow Remote Automation. A failed check is run once more and
  listed as "passed on retry", because focus checks fail if the window loses
  focus while the Mac is in use.

A full check builds fresh bundles first, then runs the documentation, Chrome
integration, Firefox and SSR checks. SSR runs separately through
`npm test --prefix test/ssr`; installing its dependencies does not run it.
Passing these checks does not establish Safari behavior, actual screen-reader
speech, or complete accessibility conformance.

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
import { uid } from '../core/id.js';
import { upgradeProperties } from '../core/upgrade.js';

class AuMyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hintId = uid('au-my-component-');

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
    // Properties set before the script loaded must reach the setters.
    upgradeProperties(this, [/* public properties */]);
  }

  disconnectedCallback() {
    // cleanup event listeners
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('au-my-component')) {
  customElements.define('au-my-component', AuMyComponent);
}
```

### Shared code in `src/core/`

Use these instead of writing your own copy:

| Module | Use it for |
|---|---|
| `id.js` — `uid(prefix)` | ids inside the shadow root (label targets, ARIA references) |
| `upgrade.js` — `upgradeProperties(element, names)` | properties assigned before the element was defined |
| `form-element.js` — `AuFormElement` | form controls: extend it instead of `HTMLElement`. It adds form association, `this.internals`, `form` and the validity API (`validity`, `checkValidity()`, `setCustomValidity()`…). Report your component's own validity through `this.internals.setValidity()`; a custom error from `setCustomValidity()` is kept on top of it. Implement `formResetCallback()`, `formStateRestoreCallback()` and `formDisabledCallback()` for your kind of value. |
| `aria.js` — `forwardAria(host, control, options)` | giving the inner control the host's `aria-label`, `aria-labelledby`, `aria-describedby` and `<label for>` |
| `declarative.js` — `setupShadow()` | components rendered on the server (see below) |

Each file in `dist/components/` bundles the shared code it imports, so single
component files keep working on their own.

### Server rendering (display components only)

Most components build their Shadow DOM in the browser, as above. A component
whose content looks wrong before its script runs (accordion, tabs, breadcrumbs)
can also render on the server as a declarative shadow root:

1. Move its markup and styles to `src/views/my-component.js`: pure functions
   with no DOM access, escaping text with `escapeHTML`, and fixed ids (each
   shadow root is its own id scope).
2. In the component, call `setupShadow(this, () => renderMyComponent(), (root, adopted) => { … })`
   from `src/core/declarative.js`. The callback finds the nodes and adds
   listeners for both a built and an adopted root, then sets `this._bound`;
   lifecycle callbacks do nothing until then.
3. Add a renderer to `src/ssr/inject.js` that maps the element's attributes
   (and, if needed, its child elements) to the view's state.
4. Add a fixture to `test/browser/declarative.mjs` (adopted and built roots
   must match) and cases to `test/ssr-inject.test.js`.

Form components stay browser-only: without JavaScript they could not submit.

### 2. Add to the bundle entry

```js
// src/accesserty-ui-kit.js
import './components/my-component.js';  // add this line
```

`npm run build` also writes a self-contained `dist/components/my-component.js`
(and `my-component.min.js`)
for pages that load single components; every file in `src/components/` gets one
automatically. `test/browser/standalone.mjs` checks that each of these files
works on its own.

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

Load the bundle with `<script src="../dist/accesserty-ui-kit.js" defer></script>`
and add a link in `demo/index.html`.

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

- [ ] The complete unit-test suite passes (`npm test`)
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

Before tagging a release, run `npm run test:safari` on a Mac; CI covers Chrome
and Firefox but cannot run Safari.
