# CLAUDE.md — Accesserty UI Kit

This file is the authoritative guide for AI assistants working on this codebase.
Read it fully before making any changes.


## Project Overview

Accesserty UI Kit is a library of **14 Web Components** built with vanilla Custom Elements v1 and the ElementInternals API. There are **zero runtime dependencies**. The design philosophy is "copy one JS file and use `<au-*>` tags" — no npm install required by end users.

**Accessibility standard:** WCAG 2.2 AA (proactively preparing for WCAG 3.0 AA).


## Directory Map

```
src/
  components/       # One .js file per web component (source of truth)
  css/              # Design system CSS (au-style.css aggregates all layers)
  accesserty-ui-kit.js  # Bundle entry — imports all components

demo/               # Human-readable documentation (HTML files)
  *.html            # One file per component: usage + API + CSS variables
  playground.html   # Interactive CSS variable playground
  form.html         # Full form demo using all form-associated components

test/               # Browser-based unit tests (@web/test-runner)
  *.test.js         # One file per component

dist/               # BUILD OUTPUT — never manually edit
  accesserty-ui-kit.js
  accesserty-ui-kit.min.js

docs/               # Technical documentation for developers
```


## Component Patterns

### Every component must follow these rules:

**1. SSR Guard on `customElements.define()`**
```js
if (typeof customElements !== 'undefined' && !customElements.get('au-xxx')) {
  customElements.define('au-xxx', AuXxx);
}
```

**2. `crypto.getRandomValues()` fallback in `generateId()`**
```js
generateId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const byteArray = new Uint32Array(1);
    crypto.getRandomValues(byteArray);
    return `au-xxx-${byteArray[0].toString(36)}`;
  }
  return `au-xxx-${Math.random().toString(36).slice(2)}`;
}
```

**3. All dispatched events must cross Shadow DOM boundaries**
```js
this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: value }));
```

**4. Shadow DOM is always open mode**
```js
this.attachShadow({ mode: 'open' });
```

**5. Rendering: rebuild vs. patch — pick by whether internal state must survive an update**

A component is updated whenever an observed attribute changes or a framework re-renders and pushes new props/attributes. Choose the render strategy accordingly — this is why the codebase has two rendering styles, and it is deliberate, not inconsistent:

- **Pure data projection → rebuild is fine.** If the component only projects its data/attributes and holds no internal live control or interactive state to preserve (e.g. `card`, `breadcrumbs`, `pagination`, `tree`), it may re-render its whole Shadow DOM from data inside `attributeChangedCallback`. Always escape interpolated values before assigning `innerHTML` (see `escapeHTML` in `breadcrumbs.js`). Expose complex data through a **property setter that reflects to an attribute** (see `set items()` in `breadcrumbs.js`) so React/Vue can pass an array or object, not only a JSON string.
- **Wraps a live native control or holds interactive state → build once, then patch.** If the component wraps a native `<input>`/`<textarea>`/etc., or manages focus / selection / expanded / active state (every form-associated component, plus `accordion`, `dropdown`, `tabs`), build the tree once with `createElement`, keep references, and patch individual attributes in `attributeChangedCallback`. **Never re-assign `innerHTML` on update** — it destroys focus, caret position, current value, validity, event listeners, and the ElementInternals wiring, which corrupts data mid-edit under a framework re-render.


## Form-Associated Components

These components participate in native `<form>` submission and validation:

| Component | Tag |
|---|---|
| Checkbox | `<au-checkbox>` |
| Radio Group | `<au-radio-group>` |
| Switch | `<au-switch>` |
| Input | `<au-input>` |
| Textarea | `<au-textarea>` |
| File Upload | `<au-file-upload>` |
| Rating | `<au-rating>` |

### Every form-associated component must:

```js
class AuFoo extends HTMLElement {
  static formAssociated = true;

  constructor() {
    super();
    this.internals = this.attachInternals();
    // ...
  }

  // Called on every value change:
  // this.internals.setFormValue(value);        // when checked/filled
  // this.internals.setFormValue(null);         // when unchecked/empty (excludes from FormData)

  // Called when parent form resets:
  formResetCallback() {
    // Restore component to its initial value
  }

  // Validity must stay in sync:
  _syncValidity() {
    if (this.input.validity.valid) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(this.input.validity, this.input.validationMessage, this.input);
    }
  }
}
```


## CSS Variable Naming Convention

Pattern: `--au-[component]-[part]-[property]-[state]`

```
--au-input-label-text-color          ✅ component=input, part=label, property=text-color
--au-switch-input-border-radius      ✅ component=switch, part=input, property=border-radius
--au-checkbox-input-checked-bg       ✅ ...state=checked
--au-tabs-selected-text-stroke-color ✅ ...state=selected
--au-input-focus-shadow-width        ✅ ...state=focus
```

Components: `accordion`, `breadcrumbs`, `checkbox`, `dropdown`, `file-upload`, `input`, `pagination`, `radio`, `rating`, `switch`, `tabs`, `textarea`, `tree`

Every CSS variable used inside a component's `style.textContent` **must** be documented in that component's `demo/*.html` file with: variable name, description, and default value.


## Demo Page Structure

Each `demo/*.html` must follow this exact section order:

1. **Usage examples** — `<h2>` sections showing different configurations
2. **CSS Variables** — `<table>` with columns: Variable | Description | Default
3. **Properties** — `<table>` with columns: Property | Type | Description (+ code example)
4. **Events** — `<table>` with columns: Event | Detail | Description (+ multi-framework code example)

CSS Variables table format:
```html
<table>
  <tr>
    <th scope="col">Variable</th>
    <th scope="col">Description</th>
    <th scope="col">Default</th>
  </tr>
  <tr>
    <td>--au-input-bg</td>
    <td>Background color of the input field</td>
    <td>oklch(0.994 0 0)</td>
  </tr>
</table>
```


## Testing Rules

- **Runner:** `@web/test-runner` + `@open-wc/testing`
- **Environment:** Real Chromium browser — no DOM mocking
- **Concurrency:** Always run with `--concurrency 1` (already set in `package.json`) to prevent Chrome tab throttling of `requestAnimationFrame`
- **Commands:**
  ```bash
  npm test                                            # all files
  npx web-test-runner test/input.test.js --node-resolve  # single file
  ```

### What to test for every component:
- Attribute reflection to shadow DOM
- JS property getters and setters
- Public methods (`.clear()`, `.focus()`, `.suggest()`, etc.)
- Events: verify `bubbles: true` and `composed: true` by listening on a wrapper `<div>`
- For form-associated: `new FormData(form).get('name')` returns the correct value
- `formResetCallback()` restores initial value


## Build Rules

- Entry: `src/accesserty-ui-kit.js` (imports all 14 components)
- Output: `dist/accesserty-ui-kit.js` (ES module) and `dist/accesserty-ui-kit.min.js` (minified)
- Command: `npm run build`
- **Always rebuild after changing any `src/components/*.js` file**
- **Never manually edit `dist/`**


## Known Browser Constraints

| Feature | Chrome | Firefox | Safari | Used in |
|---|---|---|---|---|
| `calc-size()` | 129+ | 133+ | 18.2+ | accordion animation |
| `:has()` | 105+ | 121+ | 15.4+ | switch, radio |
| CSS nesting | 112+ | 117+ | 17.2+ | all components |
| `oklch()` | 111+ | 113+ | 15.4+ | all components |
| `:user-invalid` | 119+ | 88+ | 16.5+ | input, textarea |
| ElementInternals | 77+ | 93+ | 16.4+ | all form components |

`calc-size()` and `:has()` are **progressive enhancements** — components remain functional without them.


## Forbidden Actions

- **Do NOT add external runtime dependencies.** The entire kit must work from a single JS file with no imports.
- **Do NOT manually edit `dist/`.** Always go through `npm run build`.
- **Do NOT remove the SSR guard** from `customElements.define()`.
- **Do NOT use `innerHTML` with unsanitized user input.** Use `textContent` or `createElement`.
- **Do NOT use `--no-verify`** to skip git hooks.
- **Do NOT use framework-specific APIs** (React JSX, Vue directives, etc.) inside component source files.
- **Do NOT commit dist files in PRs** (per CONTRIBUTING.md).


## Commit Convention

```
feat:     new component or feature
fix:      bug fix
refactor: code restructure without behavior change
docs:     documentation only
test:     test additions or fixes
build:    build config changes
```
