# Architecture

This document explains the technical architecture of Accesserty UI Kit — how components are structured, how CSS is organized, and how the build and test infrastructure works.


## Overview

Accesserty UI Kit consists of 15 standalone Web Components and 18 registered
custom-element tags (compound components add child tags). Each component:

- Is implemented as one vanilla JavaScript ES module in `src/components/` that
  may import shared code from `src/core/` (and, for accordion, tabs and
  breadcrumbs, its markup from `src/views/`); Card and Tree import nothing
- Ships both inside the full bundles and as its own self-contained classic
  script in `dist/components/`
- Uses Shadow DOM for style encapsulation
- Exposes all visual properties as CSS Custom Properties
- Is defined in the browser only: component files and the browser bundles are
  not importable in Node.js. Servers render the hosts, attributes and initial
  values; `au-accordion`, `au-tabs` and `au-breadcrumbs` can additionally
  receive a server-rendered declarative shadow root
- Has no dependency on other components (except accordion-item → accordion, dropdown-item → dropdown, tree-node → tree)


## Component Architecture

### File Structure

```
src/
  accesserty-ui-kit.js   bundle entry (imports all 15 components)
  components/            one file per component
  core/                  shared browser code
    declarative.js       setupShadow(): adopt a declarative shadow root or build one
    form-element.js      AuFormElement, base class of the seven form components
    aria.js              forwardAria(): host name/description → inner control
    upgrade.js           upgradeProperties(): replay properties set before definition
    id.js                uid(): random ids inside a shadow root
  views/                 Shadow DOM markup and CSS for accordion, tabs, breadcrumbs
                         (shared by the browser components and the server injector)
  ssr/inject.js          declarative Shadow DOM injector for server HTML
  integrations/          Vue, Nuxt and React modules
  types/                 TypeScript declarations copied into dist/
  css/                   global stylesheet
```

Each component file contains one class definition (two for the compound
accordion, dropdown and tree) and a guarded `customElements.define()` call for
each element. Because of the imports, a source file is an ES module: it cannot
be loaded on its own as a classic `<script src>` and does not load from a
`file://` page. Use a bundle or a `dist/components/` file there.

### Class Structure

```
AuComponent extends HTMLElement
  │
  ├── constructor()
  │     ├── attachShadow({ mode: 'open' })   (or setupShadow() for the
  │     │                                     three declarative components)
  │     ├── attachInternals()              (in AuFormElement for form components)
  │     ├── build shadow tree (style, wrapper, ...)
  │     └── addEventListener(...)
  │
  ├── static formAssociated = true         (form-associated only)
  ├── static get observedAttributes()
  │
  ├── connectedCallback()
  ├── disconnectedCallback()
  ├── attributeChangedCallback()
  │
  ├── formResetCallback()                  (form-associated only)
  ├── formDisabledCallback()               (some form components)
  ├── formStateRestoreCallback()           (rating)
  │
  ├── Getters/setters (value, disabled, required, readonly, checked, ...)
  ├── Public methods (focus, clear, suggest, checkValidity, ...)
  └── Private methods (_syncValidity, _updateClearButton, ...)
```

Form components extend `AuFormElement` (`src/core/form-element.js`) instead of
`HTMLElement` directly. Shadow-root ids come from `uid()` in `src/core/id.js`.

### Shadow DOM Strategy

All components use `attachShadow({ mode: 'open' })`. Open mode is required because:
- Tests need to query the shadow root: `el.shadowRoot.querySelector(...)`
- DevTools accessibility tree can inspect open shadow roots
- Framework adapters (React, Vue) may need to traverse into the shadow root

Components build their shadow tree in the browser, from static markup or DOM
methods; consumer-supplied text is not interpolated as HTML. `au-accordion`,
`au-tabs` and `au-breadcrumbs` instead render through `src/views/`, whose
functions escape every value with `escapeHTML()` (`src/views/escape.js`), so the
same markup can be produced as a string on the server.

### Registration and server rendering

All `customElements.define()` calls are guarded:

```js
if (typeof customElements !== 'undefined' && !customElements.get('au-input')) {
  customElements.define('au-input', AuInput);
}
```

The `!get(...)` check prevents `NotSupportedError: "au-input" has already been
defined` when a file is loaded twice, or when several `dist/components/` files
and the full bundle overlap: each element is defined once. The guard does not
make component files importable in Node.js: the top-level
`class … extends HTMLElement` declarations still throw
`ReferenceError: HTMLElement is not defined` without a DOM. Element definition
is browser-only, and the server-side modules (`-ssr`, `-nuxt`, `-nuxt-plugin`,
`-nuxt-ssr`, `-vue`) never import the component classes.

### Declarative Shadow DOM

`au-accordion` / `au-accordion-item`, `au-tabs` and `au-breadcrumbs` can receive
their shadow root from the server as `<template shadowrootmode="open">`:

```
src/views/*.js  ──►  src/ssr/inject.js   (server: inserts templates into finished HTML)
       │
       └──────────►  src/components/*.js (browser: same render functions)
                           │
                           └── setupShadow() in src/core/declarative.js
                                 adopts the parsed root via ElementInternals.shadowRoot,
                                 otherwise attaches and renders its own
```

Because both sides use the same render functions, the server output is the
component's final state: accordion items open or collapsed, the
`selected-index` tab selected with only its panel shown, and breadcrumb links.
When a host is constructed while the document is still parsing and its template
has not arrived yet, `setupShadow()` waits for `DOMContentLoaded`. Templates
inserted without the HTML parser (`innerHTML`, `v-html`,
`dangerouslySetInnerHTML`) stay inert; the component removes them and builds its
own root.

The injector runs on finished HTML, outside what a framework hydrates. It is on
by default in the Nuxt module (`declarativeShadowDom: false` turns it off). With
Next.js it runs only behind a self-hosted custom server wrapped in
`withDeclarativeShadow`; other deployments render these components in the
browser only. All other components build their Shadow DOM in the browser: form
components cannot submit without JavaScript, and Card and Tree are deliberately
excluded.


## Form-Associated Components

Seven components participate in native form submission using the **ElementInternals API** (Custom Elements Form-Associated):

```
au-checkbox, au-radio-group, au-switch, au-input, au-textarea, au-file-upload, au-rating
```

All seven extend `AuFormElement` (`src/core/form-element.js`).

### How it works

1. `static formAssociated = true` opts the element into form participation
2. `AuFormElement` calls `this.attachInternals()` and exposes the native-control
   API: `form`, `validity`, `validationMessage`, `willValidate`,
   `checkValidity()`, `reportValidity()` and `setCustomValidity()`
3. `internals.setFormValue(value)` contributes the value to `FormData`
4. `setFormValue(null)` removes the element's contribution (mimics unchecked checkboxes)
5. `internals.setValidity(flags, message, anchor)` mirrors the native `input.validity`;
   a custom message from `setCustomValidity()` sits on top of the component's own flags

This means `new FormData(form)` works correctly without hidden `<input>` elements, and native browser validation (`required`, `pattern`, etc.) is respected.

### Form Reset

`formResetCallback()` is called by the browser when the parent `<form>` is reset. Components must restore their initial value (captured in `connectedCallback` or constructor).

For `au-input`, form reset also rebuilds the `<input>` element to clear `:user-invalid` CSS state — a browser quirk where removing the value attribute doesn't clear `:user-invalid` on the existing element.


## CSS Architecture

### Design System Layers

```
src/css/au-style.css
  ├── @import basic-variables.css    (base tokens: spacing, type scale, base colors)
  ├── @import tokens-variables.css   (semantic tokens: component color mappings)
  └── @import components.css layer(accesserty) (native HTML element styles)
```

The native control rules are placed in the `accesserty` cascade layer (named
`components` before 3.0.0; renamed so it no longer merges with other libraries'
`components` layers). The base
and semantic custom-property definitions are unlayered so they remain available
as ordinary inherited tokens; consumers can override them with their own
application styles. Component Shadow DOM styles remain separate from this file.

### Component Styles

Each component defines its styles inside `style.textContent` in the constructor
(for accordion, tabs and breadcrumbs, in the `src/views/` file) using
**CSS Nesting** syntax:

```js
style.textContent = `
  .input-wrapper {
    display: flex;

    label { /* nested rule — scoped to shadow DOM */ }
    input { /* nested rule */ }

    &[data-size="large"] {
      input { font-size: var(--au-input-large-text-size, 1.25rem); }
    }
  }
`;
```

This works because Shadow DOM provides full encapsulation — nested rules in shadow styles cannot leak out.

### CSS Custom Property Naming

Pattern: `--au-[component]-[part]-[property]-[state]`

| Segment | Examples |
|---|---|
| `component` | `input`, `switch`, `tabs`, `accordion` |
| `part` | `label`, `input`, `container`, `heading`, `content` |
| `property` | `bg`, `text-color`, `border-width`, `border-radius`, `padding-vertical` |
| `state` | `hover`, `active`, `focus`, `checked`, `selected`, `disabled` |

Every CSS variable in a component's `style.textContent` has a fallback value: `var(--au-input-bg, oklch(0.994 0 0))`. This means components render correctly even with no custom properties set.

### Color System

All color values use `oklch()` — a perceptually uniform color space that produces better-looking gradients and is more predictable for accessibility contrast calculations than hex or hsl.

```css
oklch(0.1398 0 0)   /* near-black text */
oklch(0.994 0 0)    /* near-white background */
oklch(0.55 0 0)     /* functional border gray; targets 3:1 non-text contrast on white */
oklch(0.45 0.15 260)    /* keyboard focus outline */
oklch(0.8315 0.157 78)  /* decorative inset shadow, not the sole focus indicator */
oklch(0.5722 0.233 29)  /* error red */
```


## Build Pipeline

```
npm run build
  ├── vite build
  │     ├── Input:  src/accesserty-ui-kit.js  (imports all 15 components)
  │     ├── Output: dist/accesserty-ui-kit.js      (IIFE, readable)
  │     └── Output: dist/accesserty-ui-kit.min.js  (IIFE, minified via @rollup/plugin-terser)
  ├── scripts/build-integrations.mjs   (Rollup)
  │     ├── Output: dist/accesserty-ui-kit-{vue,nuxt,react,ssr}.js and the Nuxt plugin files (ES modules)
  │     └── Copies src/types/*.d.ts into dist/
  └── scripts/build-components.mjs     (Rollup)
        └── Output: dist/components/<name>.js and <name>.min.js (IIFE, one per component file)
```

The full bundles and `dist/components/` files are browser IIFE scripts
(`format: 'iife'`) with side-effect registration. Each is self-contained: it
inlines the `src/core/` and `src/views/` code it needs and has no external
imports, so end users can use it with a normal `<script defer>` tag, including
from `file://` pages. A component file registers every element of its source
(`accordion.js` defines both accordion elements). These scripts are not
Node-importable. The integration modules are ES modules that import `vue` /
`react` / `#app` (and `node:*` built-ins on the server side) from the consumer
project and the bundle or SSR module next to
them by relative path, so consumers copy the whole `dist/` folder. The optional
global stylesheet lives at
`src/css/au-style.css`; it imports its sibling files by relative path, so the
whole `src/css/` folder is copied together.


## Test Infrastructure

```
npm test
  └── @web/test-runner 1
        ├── Launches a real Chromium browser instance
        ├── Serves test files via a dev server
        ├── --concurrency 1 (prevents Chrome from throttling rAF in background tabs)
        ├── Timeout: 10 seconds per test
        └── Uses @open-wc/testing helpers:
              ├── fixture(html`...`) — creates element in a real document
              ├── expect() — Chai assertions
              └── nextFrame() — await one requestAnimationFrame cycle
```

Tests are true integration tests: components run in a real browser with real Shadow DOM, real `FormData`, and real ARIA. Nothing is mocked.

`npm run test:docs` checks that every demo HTML file resolves its local script
and stylesheet references and that each of the 15 component source files has a
matching unit-test file. `npm run test:controls -- firefox` (or chrome,
safari; omit to run all three) exercises seven standalone control types across
source/readable/minified scripts on file and HTTP pages. Firefox/Safari require
UI_KIT_WEBDRIVER_MODULE. These runners do not capture screen-reader speech.

`npm run test:pagination` covers the Pagination source, readable bundle and
minified bundle over both file and HTTP URLs in Chrome, Firefox and Safari.

`test/ssr-inject.test.js` and `npm run test:ssr-stream` cover the declarative
Shadow DOM injector. `test/browser/declarative.mjs` compares accordion, tabs and
breadcrumbs with and without server-rendered roots, and
`test/browser/standalone.mjs` loads every `dist/components/` file as a classic
script. These are targeted browser checks, not screen-reader results.

Angular fixtures (`test/angular-aot/`, `test/ssr/angular/`) were removed in 2.0.6;
Next and Nuxt are the tested framework integrations.

### Test File Pattern

```
test/
  accordion.test.js      # Tests for au-accordion and au-accordion-item
  checkbox.test.js
  ...
  input.test.js          # Input API and interaction tests
```

Component test files import from `../src/components/[name].js` directly (not
the bundle); cross-component contract tests such as
`visibility-contract.test.js` import the source entry `src/accesserty-ui-kit.js`,
and `ssr-inject.test.js` imports the injector from `src/ssr/`.


## Known Technical Constraints

### CSS Nesting

Used throughout all component `style.textContent` blocks. Nesting scopes rules within their parent selector without class proliferation.

**Support:** Chrome 112+, Firefox 117+, Safari 17.2+

### `:user-invalid`

Applied to `<input>` and `<textarea>` inside shadow DOM to show validation errors only after the user has interacted with the field.

**Support:** Chrome 119+, Firefox 88+, Safari 16.5+

### Popover and inline fallback — Dropdown

`au-dropdown` feature-detects native Popover methods. Native menus use the top
layer and one JavaScript geometry path with LTR/RTL alignment, viewport clamping,
available-height scrolling and above/below placement. Position tracking exists
only while open and is removed on close/disconnect. CSS Anchor Positioning is
not required.

Without Popover, the menu is an inline disclosure with keyboard/selection and
outside-focus/pointer dismissal. It is not an overlay polyfill and cannot escape
ancestor clipping. A simulated missing-API test does not certify an older engine.


## Compound Components

Three components consist of a parent + child custom element:

| Parent | Child | Relationship |
|---|---|---|
| `au-accordion` | `au-accordion-item` | Parent listens for `au-toggle` events; enforces exclusive mode |
| `au-dropdown` | `au-dropdown-item` | Parent manages focus and keyboard navigation across items |
| `au-tree` | `au-tree-node` | Parent creates tree-node elements programmatically from `data` property |

For accordion and dropdown, users write both elements directly in HTML. For tree, only `<au-tree>` appears in HTML — tree-node elements are created internally.
