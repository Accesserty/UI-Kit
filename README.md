# Accesserty UI Kit

![License: MIT](https://badgen.net/badge/license/MIT/orange)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Accesserty/UI-Kit)

A framework-agnostic library of **15 Web Components** designed to support accessible semantics, keyboard navigation and focus management. Names, content, themes and framework integration still require appropriate configuration and testing.

> **Philosophy:** Copy a single JS file, drop in a `<script>` tag, start using `<au-*>` elements. No build step, no npm install, no framework lock-in.


## Features

- **Designed with WCAG 2.2 AA as the target** — reusable semantics, keyboard support and focus behavior, with component tests and targeted integration checks
- **Zero runtime dependencies** — one self-contained JS file
- **Framework-agnostic** — works in plain HTML, Vue, React, Angular, Nuxt, or any other stack
- **Form-integrated** — form-associated components participate in native `<form>` submission and validation via the ElementInternals API
- **SSR-friendly** — register client-side in SSR frameworks (see [Nuxt 3](#nuxt-3)); the `customElements.define()` guard keeps re-importing on the client safe
- **Fully themeable** — every visual detail is a CSS Custom Property

> **On accessibility claims:** automated tests and targeted browser checks do not establish complete WCAG conformance or screen-reader compatibility. Verify your content, structure, headings, themes and interactions in the assembled application, including with assistive technologies.


## Components

| Element | Description |
|---|---|
| `<au-accordion>` | Expandable content panels with exclusive-mode support |
| `<au-breadcrumbs>` | Landmark navigation with JSON-driven items |
| `<au-card>` | Flexible content container with named slots |
| `<au-carousel>` | Accessible carousel: one pagination button per slide (named and positioned), responsive slides-per-view via `@container`, roving keyboard focus, and a polite live region |
| `<au-checkbox>` | Form-associated checkbox with customizable checkmark |
| `<au-dropdown>` | Popover-based menu with keyboard navigation |
| `<au-file-upload>` | Drag-and-drop file picker with preview, validation, and form integration |
| `<au-input>` | Text input with label, clear button, prefix/affix slots, and size variants |
| `<au-pagination>` | Configurable pagination with layout composition |
| `<au-radio-group>` | Form-associated radio group with vertical layout support |
| `<au-rating>` | Star rating with fractional fill, keyboard control, and score display |
| `<au-switch>` | Toggle switch with on/off labels and form integration |
| `<au-tabs>` | Tab panel with badge support and keyboard navigation |
| `<au-textarea>` | Textarea with label, auto-resize, and validation |
| `<au-tree>` | Hierarchical tree with checkboxes, type-ahead, and tri-state selection |

Full API reference, CSS variables, and live examples are in [`demo/`](demo/index.html).


## Quick Start

### Plain HTML

Download [`dist/accesserty-ui-kit.min.js`](dist/accesserty-ui-kit.min.js) and include it in your page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="accesserty-ui-kit.min.js" defer></script>
</head>
<body>
  <au-input label="Email" name="email" type="email" required></au-input>
  <au-checkbox name="agree" value="yes">I agree to the terms</au-checkbox>
</body>
</html>
```

That's all you need: every component already includes its own styles, so the page
looks right without any CSS. When you want to change how things look, see
[Styling](#styling).

Both bundles register components by side effect and isolate their internal
variables in a function scope. They support classic scripts and browser module
imports without exporting classes or claiming server-safe imports.

For local HTML opened directly from disk, use the ordinary script tag above.
Breadcrumbs support relative local destinations such as `./index.html`; a leading
`/` points to the filesystem root, not the folder containing the HTML. The last
breadcrumb is the current page and is intentionally not a link. See the
[standalone breadcrumb demo](demo/breadcrumbs.html) for a complete copyable example.

Breadcrumbs also accept `element.items = [{ text: 'Home', url: './index.html' },
{ text: 'Current page' }]`. Assignments to `items` and `separator` before the
deferred script registers the element are retained and use the public setters
after registration. Rendering and navigation still require JavaScript.

For SSR, serialize breadcrumb items into the HTML attribute: React
`items={JSON.stringify(items)}`, Nuxt `:items.attr="JSON.stringify(items)"`,
Angular `[attr.items]="serializedItems"`. Register the component only on the
client. The server supplies the host/data and icon slots, not the internal
navigation links. The [SSR fixtures](test/ssr/README.md) test these bindings,
translation focus and native fragment navigation; framework router interception
is not provided or verified.

Or copy individual component source files if you only need a subset (also usable
with local HTML without a module loader):

```html
<script src="components/input.js" defer></script>
<script src="components/checkbox.js" defer></script>
```

### File selection and native forms

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <au-file-upload name="attachments" label="Choose attachments" accept=".txt" multiple required>
    <span slot="hint">Up to 5 files, 5MB each, 20MB total.</span>
  </au-file-upload>
  <button type="submit">Submit</button>
</form>
```

The default picker is a native button. A custom `trigger` slot should contain a
named `<button type="button">`. Files enter `new FormData(form)` under `name`;
the component does not send network requests. Disabled fields/fieldsets prevent
selection/removal and omit submission while preserving files. Required validation
uses a visible focus target and inline message. Without `multiple`, remove the
existing file before selecting a replacement. Picker/drop restrictions are not
server validation. Replace `/upload` with your own server endpoint; the local
demo only checks the selected files and does not upload them.

Read `element.value` for a copied `File[]`; use `change` to update your framework
model. Assigning `value` is silent and bypasses picker restrictions; use
`handleFiles(files)` to apply them. Native reset silently clears the component;
synchronize an external model in the form's reset handler. SSR registration is
client-only: send host attributes and optional trigger/hint content from the server,
not File values in HTML. See [the live demo](demo/file-upload.html) and
[framework fixtures](test/ssr/README.md).

## Framework Integration

### Vue 3

Tell the Vue compiler to treat `au-*` elements as custom elements:

```js
// vite.config.js or vue.config.js
export default {
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('au-')
    }
  }
}
```

Then use components directly in templates:

```vue
<template>
  <au-input label="Email" name="email" @input="onInput"></au-input>
</template>
```

### React

React 19+ supports custom elements natively. For React 18, use refs to attach event listeners:

```jsx
import { useRef, useEffect } from 'react'

function EmailField({ onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    el.addEventListener('input', onChange)
    return () => el.removeEventListener('input', onChange)
  }, [onChange])

  return <au-input ref={ref} label="Email" name="email" />
}
```

### Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to allow `au-*` elements:

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

Load the script in `angular.json` or `index.html`:

```json
// angular.json
"scripts": ["src/assets/accesserty-ui-kit.min.js"]
```

### Nuxt 3

Copy `accesserty-ui-kit.min.js` to `public/vendors/`, then create a client-only plugin:

```ts
// plugins/accesserty.client.ts
export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.src = '/vendors/accesserty-ui-kit.min.js'
  script.defer = true
  document.head.appendChild(script)
})
```

Configure the Vue compiler in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('au-')
    }
  }
})
```

Wrap usage in `<ClientOnly>` to prevent SSR hydration mismatches:

```vue
<ClientOnly>
  <au-input label="Email" name="email"></au-input>
</ClientOnly>
```

### Tree data in plain HTML and frameworks

`au-tree` receives an array through its JavaScript `data` property, not a JSON
attribute. A normal script tag works without a framework or build tool:

```html
<script src="./accesserty-ui-kit.min.js" defer></script>
<au-tree id="files" aria-label="Project files" show-checkbox></au-tree>
<script>
  const tree = document.getElementById('files');
  tree.data = [{ id: 'project', label: 'Project', children: [
    { id: 'readme', label: 'README.md' },
    { id: 'locked', label: 'Locked file', disabled: true }
  ] }];
  tree.addEventListener('change', event => {
    console.log(event.detail.checkedNodes);
  });
</script>
```

Data assigned before element registration is retained. Use sibling-unique string
or numeric `id` values when replacing records during translations or reactive
updates; they preserve node identity, focus, expansion and checkbox state. Without
IDs, retention requires the same object references. Labels are text, not HTML.
Optional `lang` sets the node language. `checked` on leaf records and `expanded`
on branches explicitly control those states on each data assignment; omit them
to retain local interaction state. Branch checks derive from enabled children.

`disabled` prevents checkbox changes in that branch, including ancestor cascades;
disabled branches remain navigable and expandable. Parent tri-state calculation
excludes disabled child branches. The component does not mutate input objects or
submit native form values. Use `change.detail.checkedNodes` to update application
state; data and text updates do not emit user change events.

Vue/Nuxt use `:data.prop="treeData"` and `@change`; Angular uses `[data]="treeData"`
and `(change)` with `CUSTOM_ELEMENTS_SCHEMA`. In React/Next, assign `ref.current.data`
after client-side registration and again when data changes. The concrete
Next/Nuxt/Angular examples in `test/ssr/` verify host hydration and client-rendered
tree nodes; they do not server-render the tree's shadow content.

## Localization

Accesserty UI Kit components are framework-agnostic Web Components. Pass translated text through attributes, slots, or JavaScript properties from your application i18n layer.

```html
<au-file-upload
  label="上傳檔案"
  msg-drop-text="將檔案拖曳到這裡"
  msg-remove-text="刪除"
  msg-remove-file-label="刪除 {fileName}"
  msg-added="已新增 {count} 個檔案"
  msg-removed="已移除 {fileName}">
</au-file-upload>

<au-pagination
  data-text-pagination-label="分頁"
  data-text-page-size="每頁顯示筆數"
  data-text-page-announcement="目前第 {page} 頁">
</au-pagination>

<au-tabs
  data-text-tab="頁籤 {index}"
  data-text-tab-lang="zh-Hant-TW"
  data-text-badge-label-prefix="補充資訊：">
  <div class="au-tab-panel" slot="panel" label="Settings" label-lang="en"></div>
</au-tabs>

<au-carousel
  aria-label="推薦景點"
  data-text-roledescription="輪播"
  data-text-prev="上一張"
  data-text-next="下一張"
  data-text-pagination="選擇投影片"
  data-text-instructions="用方向鍵切換投影片"
  data-dot-template="{title}，第 {current} / 共 {total}"
  data-live-template="{title}，第 {current} / 共 {total} 張">
  <div data-title="海岸"><h3>海岸</h3></div>
  <div data-title="城市"><h3>城市</h3></div>
</au-carousel>

<au-tree
  aria-label="專案檔案"
  data-text-node="節點"
  data-text-toggle="展開或收合 {label}">
</au-tree>

<au-accordion
  exclusive
  data-text-exclusive-hint="一次只能展開一個區塊">
</au-accordion>

<au-breadcrumbs
  label="網站導覽"
  data-link-title-template="前往{text}">
</au-breadcrumbs>

<au-dropdown data-text-trigger="更多操作"></au-dropdown>

<au-rating
  data-text-rating="滿意度評分"
  data-text-star="{value} 分，共 {max} 分"
  data-text-score="{value} / {max} 分 {scoreInfo}">
</au-rating>

<au-input label="電子信箱" placeholder="請輸入電子信箱" data-clear-label="清除內容"></au-input>

<au-textarea label="意見內容" placeholder="請輸入你的意見"></au-textarea>

<au-checkbox label="我同意服務條款"></au-checkbox>

<au-radio-group label="付款方式">
  <au-radio value="card" label="信用卡"></au-radio>
  <au-radio value="transfer" label="轉帳"></au-radio>
</au-radio-group>

<au-switch label="接收通知" on="開啟" off="關閉"></au-switch>
```

Text attributes use the `data-text-` prefix, except on `au-file-upload`, whose
text attributes use `msg-` (for example `msg-drop-text`).

For framework use, bind these attributes to your normal i18n strings, such as `:label="t('upload.label')"`, `data-text-page-announcement={t('pagination.announcement')}`, or `[attr.data-text-toggle]="treeToggleLabel"`.


## Styling

You don't need any CSS to use these components. Reach for CSS only when you want
to change how something looks, and pick the step that matches your goal:

| I want to… | Do this |
|---|---|
| Use the components as they are | Nothing. The script already includes their styles. |
| Change how a component looks | [Step 1: Change a component](#step-1-change-a-component) |
| Make native `button`, `select`, `dialog`… match the kit | [Step 2: Style native controls](#step-2-style-native-controls) |
| Use one brand colour across many components | [Step 3: Apply brand colours with tokens](#step-3-apply-brand-colours-with-tokens) |

### Step 1: Change a component

Every component has settings you can change with CSS custom properties. Their
names start with `--au-`. Give one a value and the component uses it instead of
its default.

Set them on `:root` to change every instance on the page, or on a container to
change only the components inside it:

```css
/* Every au-input and au-checkbox on the page */
:root {
  --au-input-border-color: oklch(0.6 0.15 250);
  --au-checkbox-input-checked-bg: oklch(0.4 0.2 250);
}

/* Only the components inside .signup-form */
.signup-form {
  --au-input-border-color: oklch(0.45 0.15 150);
}
```

**Where to find the names.** Open a component's demo page, for example
[`demo/input.html`](demo/input.html), and scroll to **CSS Variables**: every
setting is listed with its default value. To experiment first, use the
[Playground](demo/playground.html). Change values, watch the component update,
then copy the generated CSS. It uses a placeholder selector such as
`.your-custom-button-classname`; replace it with your own class.

### Step 2: Style native controls

The script only styles the `<au-*>` components. If the same page also uses native
controls such as `button`, `select`, `dialog`, `details` or `popover`, add the
shared stylesheet so they match.

Copy the whole [`src/css/`](src/css/) folder next to your page. `au-style.css`
loads its sibling files by relative path, so copying that one file on its own
does not work. Then link it alongside the script:

```html
<link rel="stylesheet" href="css/au-style.css">
<script src="accesserty-ui-kit.min.js" defer></script>
```

The stylesheet is optional and does not replace the script.

### Step 3: Apply brand colours with tokens

Step 1 sets colours one component at a time. To keep a brand colour in a single
place, use **tokens**. Two kinds of variables are involved:

- **Component variables** (`--au-*`) are what each component actually reads.
- **Tokens** (`--color-*`) are your colour palette, defined in
  [`tokens-variables.css`](src/css/tokens-variables.css). Components never read
  tokens directly.

That means **changing a token on its own changes nothing on screen.** You choose
which components use a token by connecting it to their variables:

```css
:root {
  --au-checkbox-input-checked-bg: var(--color-primary-500);
  --au-switch-input-checked-bg:   var(--color-primary-500);
  --au-tabs-selected-bg:          var(--color-primary-500);
}
```

Each connection forms a chain:

```text
au-checkbox reads  --au-checkbox-input-checked-bg
                     → points to --color-primary-500
                         → whose colour you set in tokens-variables.css
```

Now change `--color-primary-500` once, and every component you connected follows.

`tokens-variables.css` is loaded by the shared stylesheet from Step 2. Without that
stylesheet, define the same tokens in your own CSS; the connections work the same
way.

**Check contrast whenever you change a colour.** Text needs at least 4.5:1
against its background; focus outlines and control borders need at least 3:1
(WCAG 2.2). Several components draw their focus outline *inside* the element,
on top of its background, so a darker or more saturated background also needs a
new focus colour — for example `--au-accordion-heading-focus-shadow-color`.
Check the hover and active backgrounds too, not only the resting state.

**See a complete example.** [`demo/demo.css`](demo/demo.css) connects tokens to a
themed button under `.custom-btn--primary-flat`. The result is on
[`demo/button.html`](demo/button.html).

### Styling details

Registered elements honor the ordinary HTML `hidden` attribute without rebuilding
their contents. `hidden="false"` is still hidden: remove the attribute to show an
element. `hidden="until-found"` is not forced to `display:none`; discovery support
depends on the browser and is not guaranteed for Shadow DOM content.

The shared native-control stylesheet provides visible focus outlines in addition
to shadows. Override `--au-btn-focus-outline-color` / `--au-btn-focus-outline-width`
and `--au-summary-focus-outline-color` / `--au-summary-focus-outline-width` when
the application theme needs it; forced-colors uses a system Highlight outline.
Custom themes and clipping containers still require focus visibility checks.

The design system CSS (`src/css/au-style.css`) uses CSS Cascade Layers and includes:

`--color-pure-black` and `--color-pure-white` are literal black and white.
The native Popover overrides `--au-popover-bg`, `--au-popover-text-color` and
`--au-popover-border-color` accept **OKLCH channels**, e.g. `0.994 0 0`, because
the stylesheet wraps them in `oklch(...)`. Do not supply `#fff` or another
`oklch(...)` expression to those three variables. To use complete CSS colors,
set `background-color`, `color` and `border-color` directly on your popover.

Single selects without `::picker-icon` use a CSS background arrow with reserved
inline-end padding, including inherited RTL and `dir="auto"`. Forced colors
restores the native select appearance.

The shared stylesheet also provides visible focus outlines for native controls,
an RTL-aware select fallback, and disables its own transitions and animations
when `prefers-reduced-motion: reduce` is active. Application styles and custom
component themes still need their own contrast, focus, and motion review.


## Card content and native behavior

`au-card` is a layout primitive with four named slots, projected in heading,
media, content, footer order. It has no default slot: unassigned content is not
projected. Give your source content a logical order as well, before scripts load.

```html
<script src="./accesserty-ui-kit.js" defer></script>
<au-card>
  <h2 slot="heading">Reading guide</h2>
  <p slot="content">Practical steps for reviewing a page.</p>
  <a slot="footer" href="./guide.html">Read the review guide</a>
</au-card>
```

The heading slot does not create a heading, and the card is not automatically a
button, landmark or form control. Supply native headings, meaningful links,
labels, media alternatives and action-button types. Native child controls retain
form submission, reset and event behavior. The card adds no host Tab stop or
custom events. Repeated `render()` calls keep its existing shell and slot nodes.

Basic styles make the card shrinkable, wrap long text and respect `hidden`.
Use `::part(au-card-container)` for the layout; the four other parts target the
slot elements, not their assigned content. Style actual light-DOM content using
your own selectors. Images, embedded widgets, themes and visual reordering need
application-level checks; CSS reordering is not a reading-order guarantee.

No special framework state adapter is needed for Card: use the framework's
normal content and native event bindings, with client-only component registration
in SSR applications. Real Next/Nuxt/Angular fixtures preserve the host/content
nodes, translated heading focus and native form values. Internal slots are built
on the client; this is not server-rendered Shadow DOM or screen-reader verification.

## Carousel integration

Load a normal deferred script and provide direct element children as slides.
Name the carousel with `aria-label` or an external `aria-labelledby`; localize
`data-text-roledescription` when needed. The continuous scroll layout leaves all
slides in DOM reading order and does not autoplay or implement tabpanels.

`current` is a zero-based DOM property, not an HTML attribute. Finite numeric
strings are accepted, fractions truncate and invalid/non-finite inputs become 0;
the result clamps to range (-1 when empty). Keep stable keyed slide elements to
retain selection and dot focus across translations/reordering. A new slide node
is a new identity. `refresh()` updates immediately; title edits also auto-refresh.

Navigation/current changes and settled scrolling emit `slide-change.detail`
with `{index,total,title}`. Structural refresh and translation are silent.
Boundary arrows remain focusable with `aria-disabled` and ignore repeated
activation. Tab from a dot enters the current slide's first eligible native
control; nested shadow widgets need their own focus entry. RTL movement uses
the track's right edge. Forced colors and reduced motion have explicit styles.

Next assigns `ref.current.current` after client registration; Nuxt uses
`:current.prop="index"` / `@slide-change`; Angular uses `[current]="index"` /
`(slide-change)`. Copy `event.detail.index` into the model. The real SSR fixtures
retain server-produced host/slide nodes but create controls only in the browser;
they do not establish full framework navigation or screen-reader behavior.

## Accordion state and accessible structure

Plain HTML can load the source or either bundle using an ordinary deferred script:

```html
<script src="./accesserty-ui-kit.js" defer></script>
<au-accordion exclusive data-text-exclusive-hint="One answer at a time.">
  <au-accordion-item heading-level="2">
    <span slot="heading">How do I get started?</span>
    <span slot="icon">▼</span>
    <div slot="content"><p>Read the getting-started guide.</p></div>
  </au-accordion-item>
</au-accordion>
```

Use non-interactive heading/subtitle content: these slots are inside the native
button. The icon is decorative. `heading-level` accepts 1–6 (default 3); choose
the level appropriate to the surrounding page. `no-region` removes the panel's
landmark role when many expanded panels would create too many landmarks.

Exclusive mode owns direct item children only; nested accordions are independent.
On initialization, insertion or enabling exclusive mode, the first open direct
item is retained. Opening another item closes its siblings. Zero open items is
allowed. `open` and `exclusive` are Boolean properties/attributes; `open="false"`
still means open. Pre-registration property assignments are supported.

Every actual connected `open` attribute change emits `au-toggle.detail.open`,
including programmatic updates and sibling closures. Reassigning the same state
does not emit another event. A group-level listener should filter the originating
item when it contains nested groups; read the item's current `open` for final
state after synchronous handlers. Native Enter/Space and Tab/Shift+Tab operate
the buttons and visible content. Collapsing focused content returns focus to its
header without stealing external focus. Translation retains the button and slots.

The real Next/Nuxt/Angular fixtures verify host and slotted-content hydration,
reactive open state, events and keyboard interaction with client-only registration.
React binds Boolean `open` and `onau-toggle`; Nuxt uses
`:open.attr="isOpen ? '' : null"` / `@au-toggle`; Angular uses
`[attr.open]="isOpen ? '' : null"` / `(au-toggle)`. Synchronize the Boolean model
from `event.detail.open`. This is not server-rendered Shadow DOM or a full
screen-reader/conformance result.

## Browser Support

Support is component- and feature-dependent; a single minimum browser version
does not establish support for every component or native stylesheet enhancement.
The browser runners record the tested scenarios. Untested engine versions,
framework combinations and assistive technologies are not implied to pass.

Dropdown detects native Popover methods. Where available it uses the browser's
top layer with viewport-clamped JavaScript positioning, not CSS Anchor Positioning.
Without Popover it expands an inline menu in document flow; this preserves action
and keyboard access but does not escape clipping ancestors or provide top-layer
overlay behavior. This fallback still requires the kit's Web Component and CSS
capabilities; it is not a polyfill for arbitrary legacy browsers.

Accordion panels show/hide immediately, without `calc-size()` or a delayed
display transition. Reduced-motion preferences disable the remaining header/icon
transitions. Verify custom themes and application-level accessibility separately.


## Development

Requires **Node.js 22 or higher** (the version CI runs).

```bash
# Install dependencies
npm ci

# Run all component tests
npm test

# Test a single component
npx web-test-runner test/input.test.js --node-resolve

# Build dist files
npm run build
```

Tests run in a real Chromium browser via `@web/test-runner`. No mocking — components are tested as they behave in production.

`npm run test:css` checks the shared stylesheet's token, Popover and select-direction
contracts in installed Chrome, Firefox and Safari; Firefox and Safari require
`UI_KIT_WEBDRIVER_MODULE`.


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the development environment, add new components, and submit pull requests.


## License

[MIT](LICENSE) © Accesserty
