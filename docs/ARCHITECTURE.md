# Architecture

Use this reference when changing component internals, shared code, server
rendering or the build. For consumer setup, read the [README](../README.md).
For data, events and forms, read the [usage reference](USAGE.md).


## Overview

Accesserty UI Kit consists of 15 standalone Web Components and 18 registered
custom-element tags. Compound components register child tags too. Each component:

- Is implemented as one vanilla JavaScript ES module in `src/components/` that
  may import shared code from `src/core/` (and, for accordion, tabs and
  breadcrumbs, its markup from `src/views/`); Card and Tree import nothing
- Ships both inside the full bundles and as its own self-contained classic
  script in `dist/components/`
- Uses Shadow DOM for style encapsulation
- Exposes documented CSS custom properties or parts for customization; Card
  uses parts and consumer selectors rather than its own CSS variables
- Is defined in the browser only: component files and the browser bundles are
  not importable in Node.js. Servers render the hosts, attributes and initial
  values; `au-accordion`, `au-tabs` and `au-breadcrumbs` can additionally
  receive a server-rendered declarative shadow root
- Has no runtime package dependency. Compound elements coordinate with their
  parent or child elements; see [Compound Components](#compound-components).


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

Each component file defines one class, or two for Accordion, Dropdown and Tree.
Registration uses a guarded `customElements.define()` call for each tag.

Most source files import shared modules and must load as ES modules over HTTP,
not classic scripts or modules from `file://`. Card and Tree currently import
nothing, but consumers should still use the distribution files. Full bundles and
`dist/components/` files support ordinary script tags, including local HTML.

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
`HTMLElement` directly. Components that need generated IDs use `uid()` from
`src/core/id.js`. Shared server/browser views use fixed IDs within each root.

### Shadow DOM Strategy

Components create open shadow roots, or adopt open declarative roots. Open roots
let tests and maintainers inspect nodes through `element.shadowRoot`. Framework
form adapters use public element properties and methods rather than requiring
consumer code to traverse internal controls.

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

The browser collects values through `new FormData(form)` without hidden proxy
inputs. Each component supplies its own value and applicable validity flags;
`formAssociated` alone does not implement those contracts.

A custom error survives reset. Clearing `setCustomValidity('')` removes that
error but leaves the component's own checks in place. This API controls native
validation; applications still provide inline error text and host `aria-invalid`
where needed. See [form validation](USAGE.md#validate-the-other-form-components).

### Form Reset

The browser calls `formResetCallback()` when the associated form resets.
Components restore their captured initial value or checked state; File Upload
clears its files. Reset does not emit ordinary user-change events. Applications
that store separate models must synchronize them in the form's reset handler.

For `au-input`, form reset also rebuilds the `<input>` element to clear `:user-invalid` CSS state — a browser quirk where removing the value attribute doesn't clear `:user-invalid` on the existing element.


## CSS Architecture

### Design System Layers

```
src/css/au-style.css
  ├── @import basic-variables.css    (base tokens: spacing, type scale, base colors)
  ├── @import tokens-variables.css   (semantic tokens: component color mappings)
  └── @import components.css layer(accesserty) (native HTML element styles)
```

Native-control rules use the `accesserty` cascade layer. Unlayered application
rules override those normal declarations. Palette and semantic tokens remain
unlayered inherited custom properties. Components' Shadow DOM styles are
separate from this stylesheet.

The stylesheet is optional repository source. The package allow-list contains
`dist` and `README.md`, and no CSS subpath is exported. Consumers must copy or
host the whole `src/css/` folder so relative imports resolve. Loading the browser
bundle does not load this global stylesheet.

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

Rules target nodes inside the shadow root rather than unrelated page elements.
Inherited properties, custom properties and exposed parts still let consumers
affect appearance. Shadow DOM is not a substitute for testing the assembled page.

### CSS Custom Property Naming

Pattern: `--au-[component]-[part]-[property]-[state]`

| Segment | Examples |
|---|---|
| `component` | `input`, `switch`, `tabs`, `accordion` |
| `part` | `label`, `input`, `container`, `heading`, `content` |
| `property` | `bg`, `text-color`, `border-width`, `border-radius`, `padding-vertical` |
| `state` | `hover`, `active`, `focus`, `checked`, `selected`, `disabled` |

Component settings use fallback values, for example
`var(--au-input-bg, oklch(0.994 0 0))`, so custom themes are optional. Keep
documented names and defaults aligned with the component or shared view.

### Color System

Default colors commonly use `oklch()`. The notation does not guarantee contrast:
check the actual foreground/background combination, including focus, hover and
active states. Most component variables accept complete CSS colors. The three
native Popover overrides `--au-popover-bg`, `--au-popover-text-color` and
`--au-popover-border-color` instead accept OKLCH channels such as `0.994 0 0`,
because the stylesheet wraps them in `oklch(...)`.

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
them by relative path, so framework consumers copy the whole `dist/` folder. The optional
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

Component tests exercise real browser DOM, Shadow DOM and FormData in controlled
fixtures. Fixtures can simulate selected conditions; a passing run is not proof
of every production integration or assistive-technology interaction.

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

Vue/Nuxt and React 19/Next.js have framework fixtures. No other framework's
compiler, form handling or hydration is established by these checks. See
[the SSR test guide](../test/ssr/README.md) for the fixture inventory and limits.

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

Component styles use native CSS nesting. Browser support is feature-dependent;
the configured browser runners establish specific scenarios, not a universal
minimum engine version for the whole kit.

Feature-reference versions are Chrome 112+, Firefox 117+ and Safari 17.2+.
These are not a complete kit support baseline or a record of tested versions.

### `:user-invalid`

Used on internal input and textarea controls to style user-invalid states. This
CSS state is distinct from application error text and host `aria-invalid`.
Input reset rebuilds its internal input to clear that state. Test custom themes,
error announcements and reset behavior separately in the target browsers.

Feature-reference versions for `:user-invalid` are Chrome 119+, Firefox 88+ and
Safari 16.5+. Supporting this selector does not establish support for all other
component APIs and CSS.

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
