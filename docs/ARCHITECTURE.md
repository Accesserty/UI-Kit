# Architecture

This document explains the technical architecture of Accesserty UI Kit — how components are structured, how CSS is organized, and how the build and test infrastructure works.


## Overview

Accesserty UI Kit consists of 14 standalone Web Components. Each component:

- Is implemented as a single vanilla JavaScript file with no imports
- Uses Shadow DOM for style encapsulation
- Exposes all visual properties as CSS Custom Properties
- Is SSR-safe (no crashes on server-side import)
- Has no dependency on other components (except accordion-item → accordion, dropdown-item → dropdown, tree-node → tree)


## Component Architecture

### File Structure

```
src/components/my-component.js
```

Each file contains exactly one (or two, for compound components) class definitions and one `customElements.define()` call.

### Class Structure

```
AuComponent extends HTMLElement
  │
  ├── constructor()
  │     ├── attachShadow({ mode: 'open' })
  │     ├── attachInternals()              (form-associated only)
  │     ├── createElement(style, wrapper, ...)
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
  ├── Private methods (_syncValidity, _updateClearButton, ...)
  └── generateId()
```

### Shadow DOM Strategy

All components use `attachShadow({ mode: 'open' })`. Open mode is required because:
- Tests need to query the shadow root: `el.shadowRoot.querySelector(...)`
- DevTools accessibility tree can inspect open shadow roots
- Framework adapters (React, Angular) may need to traverse into the shadow root

Components build their shadow tree programmatically in the constructor using `document.createElement()` rather than `innerHTML`. This avoids XSS risks and gives fine-grained control over element references.

### SSR Compatibility

All `customElements.define()` calls are guarded:

```js
if (typeof customElements !== 'undefined' && !customElements.get('au-input')) {
  customElements.define('au-input', AuInput);
}
```

The double check (`typeof` + `!get(...)`) prevents:
1. `ReferenceError` when the module is imported in a Node.js SSR environment
2. `NotSupportedError: "au-input" has already been defined` when the script is loaded twice on the same page


## Form-Associated Components

Six components participate in native form submission using the **ElementInternals API** (Custom Elements Form-Associated):

```
au-checkbox, au-radio-group, au-switch, au-input, au-textarea, au-file-upload, au-rating
```

### How it works

1. `static formAssociated = true` opts the element into form participation
2. `this.attachInternals()` returns an `ElementInternals` object
3. `internals.setFormValue(value)` contributes the value to `FormData`
4. `setFormValue(null)` removes the element's contribution (mimics unchecked checkboxes)
5. `internals.setValidity(flags, message, anchor)` mirrors the native `input.validity`

This means `new FormData(form)` works correctly without hidden `<input>` elements, and native browser validation (`required`, `pattern`, etc.) is respected.

### Form Reset

`formResetCallback()` is called by the browser when the parent `<form>` is reset. Components must restore their initial value (captured in `connectedCallback` or constructor).

For `au-input`, form reset also rebuilds the `<input>` element to clear `:user-invalid` CSS state — a browser quirk where removing the value attribute doesn't clear `:user-invalid` on the existing element.


## CSS Architecture

### Design System Layers

```
src/css/au-style.css
  └── @layer components
      ├── @import basic-variables.css    (base tokens: spacing, type scale, base colors)
      ├── @import tokens-variables.css   (semantic tokens: component color mappings)
      └── @import components.css         (native HTML element styles in layer "components")
```

CSS Cascade Layers ensure the design system tokens have predictable specificity and can be overridden by application styles without `!important`.

### Component Styles

Each component defines its styles inside `style.textContent` in the constructor using **CSS Nesting** syntax:

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
oklch(0.7894 0 0)   /* border gray */
oklch(0.8315 0.157 78)  /* focus ring amber */
oklch(0.5722 0.233 29)  /* error red */
```


## Build Pipeline

```
npm run build
  └── Vite 6
        └── Rollup
              ├── Input:  src/accesserty-ui-kit.js  (imports all 14 components)
              ├── Output: dist/accesserty-ui-kit.js      (ES module, readable)
              └── Output: dist/accesserty-ui-kit.min.js  (ES module, minified via rollup-plugin-terser)
```

Both outputs are ES modules (`format: 'es'`). There is no CommonJS output — components rely on Web APIs that don't exist in Node.js anyway.

The bundle is a single file with no external imports. End users can use it with a `<script type="module">` or `<script defer>` tag.


## Test Infrastructure

```
npm test
  └── @web/test-runner 0.18
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

### Test File Pattern

```
test/
  accordion.test.js      # Tests for au-accordion and au-accordion-item
  checkbox.test.js
  ...
  input.test.js          # Most comprehensive: 16 tests covering all API surface
```

Every test file imports from `../src/components/[name].js` directly (not the bundle).


## Known Technical Constraints

### `calc-size()` — Accordion Animation

`calc-size(auto, size)` resolves an element's intrinsic height (like `height: auto`) to an animatable length. This is required for CSS `transition: height` from zero to auto.

**Support:** Chrome 129+, Firefox 133+, Safari 18.2+

**Fallback:** In unsupported browsers, the accordion panel appears and disappears instantly (no animation). Content is fully accessible regardless of animation support.

### CSS Nesting

Used throughout all component `style.textContent` blocks. Nesting scopes rules within their parent selector without class proliferation.

**Support:** Chrome 112+, Firefox 117+, Safari 17.2+

### `:user-invalid`

Applied to `<input>` and `<textarea>` inside shadow DOM to show validation errors only after the user has interacted with the field.

**Support:** Chrome 119+, Firefox 88+, Safari 16.5+

### Anchor Positioning — Dropdown

`au-dropdown` uses CSS Anchor Positioning (`position-anchor`, `position-area`) to position the menu relative to the trigger button. This is a newer CSS feature. There is no JavaScript-based positioning fallback.

**Support:** Chrome 125+, Firefox 134+, Safari 18.2+


## Compound Components

Three components consist of a parent + child custom element:

| Parent | Child | Relationship |
|---|---|---|
| `au-accordion` | `au-accordion-item` | Parent listens for `au-toggle` events; enforces exclusive mode |
| `au-dropdown` | `au-dropdown-item` | Parent manages focus and keyboard navigation across items |
| `au-tree` | `au-tree-node` | Parent creates tree-node elements programmatically from `data` property |

For accordion and dropdown, users write both elements directly in HTML. For tree, only `<au-tree>` appears in HTML — tree-node elements are created internally.
