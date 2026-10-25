# Contributing to Accesserty UI Kit

Use this guide to change the kit, run its tests and submit a pull request.
For application setup, start with the [README](README.md#quick-start).

The kit follows HTML-first design. Propose a new component only when it avoids
repeated accessibility mistakes that native HTML does not already handle well.
Component-level behavior does not make a complete application conform to WCAG.


## Prerequisites

- **Node.js from [`.nvmrc`](.nvmrc) and npm 11** for development and tests
- **A Chromium browser** for `@web/test-runner`
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

Open a page in `demo/` to inspect the built component. Demos load
`dist/accesserty-ui-kit.js`, not the source, and can open directly from disk.
While editing `src/`, run `npm run dev` and reload the demo after each rebuild.
That watch command rebuilds the Vite full bundles; run `npm run build` to also
update standalone components, integrations and declarations.


## Development Workflow

### Running Tests

```bash
# Run the complete unit-test suite sequentially
npm test

# Test a single component during development
npx web-test-runner test/input.test.js --node-resolve
```

Run the complete suite before submitting a PR. Tests use real Chromium fixtures;
they do not establish behavior in every browser, framework or assistive technology.

### Integration tests

Build current source before testing consumers: `npm run build`. Playwright-based
checks need Google Chrome and the separate dependencies in `test/ssr`:
`npm ci --prefix test/ssr`. Install only in these development environments, not in
a plain-HTML consumer project.

| Check | What it covers |
|---|---|
| `npm run test:docs` | Local demo asset references, source/test inventory, selected CSS defaults and build/toolchain contracts |
| `npm run test:reserve` | README `:not(:defined)` CSS against registered component heights |
| `npm run test:ssr-stream` | Streaming server-wrapper behavior |
| `npm test --prefix test/ssr` | Targeted framework rendering, hydration, bindings and types |

Update the README reservation values when a default size changes. The CSS
documentation checks cover selected defaults; they are not a full CSS parser or
theme audit. See the [SSR test guide](test/ssr/README.md) for fixture setup and
individual checks.

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

The CI job runs source tests, builds fresh bundles, then runs documentation,
Chrome integration, Firefox and SSR checks. Installing the SSR dependencies does
not run the SSR tests. Safari requires a separate macOS run. None of these checks
proves screen-reader speech or complete accessibility conformance.

### Building

```bash
npm run build
```

This produces the readable/minified full bundles, standalone component pairs,
framework/SSR modules and type declarations in `dist/`.
**Do not include `dist/` changes in your pull request** — maintainers rebuild on
release. Keep the build available locally when testing demos and consumers.


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

This is a lifecycle skeleton, not an accessible widget implementation. Define
the component's keyboard behavior, names, states, text settings and focus rules
before filling it in. The registration guard prevents duplicate definitions;
it does not make the top-level `HTMLElement` subclass safe to import in Node.js.

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

Only Accordion (including its items), Tabs and Breadcrumbs currently have
server-rendered shadow roots. All other components build their internals in the
browser. If a proposed display component needs this support, follow the shared
view/injector pattern and add tests; support does not follow from registration
alone:

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

Form-control internals stay browser-only: without JavaScript they cannot submit
their component values. Servers may still render hosts, initial attributes and
consumer content. See [Architecture](docs/ARCHITECTURE.md#declarative-shadow-dom)
for parsing and hydration boundaries.

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

<a id="5-add-to-playground"></a>

### 5. Review playground coverage

If the component has Playground controls, add a config entry in
`demo/playground-engine.js` following `COMPONENT_CONFIGS`. The local Playground
does not configure every component: Card and Carousel are not entries there.
Keep its preview, copyable example and CSS settings consistent with the demo.


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

WCAG 2.2 AA is the design target. Before submitting, check the applicable
component behavior and document remaining integration or manual-test limits:

- Keyboard navigation works without a mouse
- All interactive elements have visible focus indicators (`focus-visible`)
- ARIA roles, states, and properties are correct
- Form-associated components integrate with native form validation
- Errors and state changes are announced when needed; avoid duplicate live
  announcements when moving focus already communicates the result
- Color contrast meets 4.5:1 for normal text, 3:1 for large text

Also check focus and non-text contrast, reduced motion, narrow layouts and text
updates without losing focus. Automated checks alone do not establish complete
WCAG conformance. Report assistive-technology checks separately, with the actual
browser and screen reader used.


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
