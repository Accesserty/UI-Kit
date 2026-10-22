# Accesserty UI Kit

![License: MIT](https://badgen.net/badge/license/MIT/orange)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Accesserty/UI-Kit)

A framework-agnostic library of **15 Web Components** designed to support accessible semantics, keyboard navigation and focus management. Names, content, themes and framework integration still require appropriate configuration and testing.

Visit the [Accesserty UI Kit overview](https://accesserty.com/en/uikit/) for
getting-started guidance, or try the [online Playground](https://accesserty.com/en/uikit/playground/)
to explore component styles and copy examples. The API reference and local demos
are available in [`demo/`](demo/index.html); framework setup is covered below.

> **Philosophy:** Copy a single JS file, drop in a `<script>` tag, start using `<au-*>` elements. No build step, no npm install, no framework lock-in.


## Features

- **Designed with WCAG 2.2 AA as the target** — reusable semantics, keyboard support and focus behavior, with component tests and targeted integration checks
- **Zero runtime dependencies** — one self-contained JS file
- **Framework-agnostic** — works in plain HTML, Vue, React, Nuxt, Next or any other stack that renders custom elements
- **Form-integrated** — form-associated components participate in native `<form>` submission and validation via the ElementInternals API
- **Server rendering** — Nuxt and Next.js render the tags and initial values; accordion, tabs and breadcrumbs also render their Shadow DOM on the server, so they look right before the script runs (see [Server rendering](#server-rendering))
- **Framework-native forms** — `v-model` in Vue and Nuxt, `value`/`checked` with `onChange` in React and Next.js
- **Fully themeable** — every visual detail is a CSS Custom Property

> **On accessibility claims:** automated tests and targeted browser checks do not establish complete WCAG conformance or screen-reader compatibility. Verify your content, structure, headings, themes and interactions in the assembled application, including with assistive technologies.


Upgrading from 2.x? See [UPGRADING.md](UPGRADING.md).

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
`items={JSON.stringify(items)}`, Nuxt `:items.attr="JSON.stringify(items)"`.
With [server rendering](#server-rendering), the server also renders the
navigation links, so they work before the script runs; otherwise the server
supplies the host, data and icon slots and the links appear when the script
registers the element. The [SSR fixtures](test/ssr/README.md) test these bindings,
translation focus and native fragment navigation; framework router interception
is not provided or verified.

The bundle registers every component. To ship only some of them, copy single
files from [`dist/components/`](dist/components/). Each file works on its own,
also in local HTML opened from disk:

```html
<script src="components/input.js" defer></script>
<script src="components/checkbox.js" defer></script>
```

Each component also comes minified, used the same way:
`components/input.min.js`. Pick either; they behave identically.

`accordion.js` registers both `au-accordion` and `au-accordion-item`;
`dropdown.js` and `tree.js` likewise register their item elements. Loading a
file twice, or next to the full bundle, is harmless: each element is defined
once.

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

All form components (`au-input`, `au-textarea`, `au-checkbox`, `au-switch`,
`au-radio-group`, `au-rating`, `au-file-upload`) take part in forms like native
fields: they submit under `name`, follow `reset` and disabled fieldsets, block
submission while invalid, and offer `checkValidity()`, `reportValidity()`,
`validity`, `validationMessage`, `setCustomValidity()` and `form`. A custom
message works on top of the component's own checks, such as `required`:

```js
const email = document.querySelector('au-input[name="email"]');
email.setCustomValidity('This address is already registered.'); // blocks submission
email.setCustomValidity('');                                      // back to the field's own checks
```

Pressing Enter in an `au-input` does not submit the form.

## Framework Integration

### Vue 3

Copy the whole [`dist/`](dist/) folder into your project, for example as
`src/vendor/accesserty/`. Define the elements and install the Vue plugin:

```js
// main.js
import './vendor/accesserty/accesserty-ui-kit.js' // defines the au-* elements
import { createApp } from 'vue'
import { AccessertyVue } from './vendor/accesserty/accesserty-ui-kit-vue.js'
import App from './App.vue'

createApp(App).use(AccessertyVue).mount('#app')
```

Tell the Vue compiler which tags are custom elements. Use the kit's
`isCustomElement`, not `tag => tag.startsWith('au-')`: the form components below
are Vue components so that `v-model` works.

```js
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { isCustomElement } from './src/vendor/accesserty/accesserty-ui-kit-vue.js'

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement } } })]
}
```

Then bind form components with `v-model`, as with native fields:

```vue
<au-input label="Email" name="email" v-model.trim="email"></au-input>
<au-checkbox label="I agree" name="agree" v-model="agree"></au-checkbox>
<au-radio-group label="Size" name="size" v-model="size">
  <au-radio value="s">Small</au-radio>
  <au-radio value="m">Medium</au-radio>
</au-radio-group>
```

| Component | `v-model` value |
|---|---|
| `au-input`, `au-textarea` | string; a number for `type="number"` when the text parses as one (`.trim`, `.number` and `.lazy` work) |
| `au-checkbox`, `au-switch` | boolean; an array or `Set` of the checked boxes' `value`s; or `true-value` / `false-value` |
| `au-radio-group` | the selected `<au-radio>`'s `value` as you bound it (`:value="2"` gives `2`), or `null` |
| `au-rating` | number |
| `au-file-upload` | array of `File`; set it to `[]` to clear the selection |

These follow the rules of Vue's `v-model` on native inputs, so a group of
checkboxes can share one array:

```vue
<au-checkbox label="Search" value="search" v-model="sources"></au-checkbox>
<au-checkbox label="A friend" value="friend" v-model="sources"></au-checkbox>
<au-checkbox label="Newsletter" true-value="yes" false-value="no" v-model="newsletter"></au-checkbox>
```

Typed radio values come from `<au-radio>` elements written directly inside the
group (a `v-for` there is fine); options rendered by a child component of your
own report their string value.

Other attributes, classes and listeners pass through to the element, and your
own `@input` or `@change` still runs. A template ref gives access to the
element's properties and methods (`nameField.value.focus()`); use
`nameField.value.$el` where an API needs the DOM node itself. The other `au-*`
elements are used as before, with ordinary attribute and event bindings, and
explicit `:value` / `@input` bindings keep working. TypeScript declarations
(`accesserty-ui-kit-vue.d.ts`) sit next to the file and type `v-model` in
templates through Vue's `GlobalComponents`.

### React and Next.js

Copy the whole [`dist/`](dist/) folder into your project, for example as
`vendor/accesserty/`. The form components have React counterparts with the
usual form props, and `defineElements()` defines the `au-*` elements in the
browser (they cannot be defined during server rendering):

```jsx
'use client'
import { useEffect, useState } from 'react'
import { AuInput, AuCheckbox, defineElements } from './vendor/accesserty/accesserty-ui-kit-react.js'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  useEffect(() => { defineElements() }, [])

  return (
    <form>
      <AuInput label="Email" name="email" value={email} onChange={e => setEmail(e.target.value)} />
      <AuCheckbox label="I agree" name="agree" checked={agree} onChange={e => setAgree(e.target.checked)} />
    </form>
  )
}
```

| Component | Controlled | Uncontrolled | Read in `onChange` |
|---|---|---|---|
| `AuInput`, `AuTextarea` | `value` | `defaultValue` | `e.target.value` |
| `AuCheckbox`, `AuSwitch` | `checked` | `defaultChecked` | `e.target.checked` |
| `AuRadioGroup` | `value` | `defaultValue` | `e.target.value` |
| `AuRating` | `value` | `defaultValue` | `Number(e.target.value)` |
| `AuFileUpload` | — | — | `e.target.value` (array of `File`) |

`e.target` behaves like the native field: `AuCheckbox` and `AuSwitch` expose
their `value` (`'on'` unless set), so checked boxes can be collected into an
array, and `AuInput` has `valueAsNumber` and `valueAsDate`:

```jsx
<AuCheckbox label="Search" value="search" checked={sources.includes('search')}
  onChange={e => { const { checked, value } = e.target; setSources(list => checked ? [...list, value] : list.filter(x => x !== value)) }} />
<AuInput label="Quantity" type="number" value={String(qty)} onChange={e => setQty(e.target.valueAsNumber)} />
```

As with native inputs, a controlled value wins: if `onChange` does not update
the state, the field returns to it. One difference: when the field returns to the
state value, the caret moves to the end of `AuInput` / `AuTextarea`, where a
native React input keeps it in place. `ref` points at the element itself. Other
props, `className` and children pass through. Call `defineElements()` once, for
example in a client component of the root layout. The integration file starts
with `'use client'`, so Next.js server components can render these components.

Other `au-*` elements are used directly as JSX tags: React 19 sets matching
properties and attaches `on` + event-name props as listeners, for example
`<au-accordion-item open={isOpen} onau-toggle={e => setOpen(e.detail.open)}>`.
The integration needs React 19. TypeScript declarations
(`accesserty-ui-kit-react.d.ts`) sit next to the file and type every `au-*`
tag, including event details such as `e.detail.open`.
`accesserty-ui-kit.d.ts` types the elements themselves, so
`document.querySelector('au-tabs')` knows `selectedIndex`.

### Other frameworks

The components are standard custom elements, so any framework that renders them
can use the kit. Only Vue/Nuxt and React/Next integrations are tested; the
Angular fixtures were removed in 2.0.6.

### Nuxt

Copy the whole [`dist/`](dist/) folder into your project, for example as
`vendor/accesserty/` (not `public/`), and add one module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['./vendor/accesserty/accesserty-ui-kit-nuxt.js']
})
```

The module configures the Vue compiler, registers the `v-model` components for
server and client rendering, and defines the elements in the browser. Use the
components directly, including `v-model` on the form components listed under
[Vue 3](#vue-3); no `<ClientOnly>` wrapper is needed. The server renders the
element tags and their initial values; each component builds its internals when
the script runs in the browser.

### Server rendering

Frameworks render the `<au-*>` tags and their attributes on the server. Three
components can also render their Shadow DOM there, as declarative shadow roots:
`au-accordion`, `au-tabs` and `au-breadcrumbs`. The page then shows the final
layout before the script runs (collapsed panels, the selected tab, working
breadcrumb links) instead of the raw light-DOM content, and the components take
over that markup instead of rebuilding it.

| Without JavaScript | `au-accordion` | `au-tabs` | `au-breadcrumbs` |
|---|---|---|---|
| Looks like the final component | yes | yes | yes |
| Works | find-in-page and links open collapsed items | only the selected panel is shown | links navigate |

The roots are inserted into the finished HTML, after the framework has rendered:
never write `<template shadowrootmode>` in a Vue or React template, which breaks
hydration. The other components keep building their Shadow DOM in the browser.

**Nuxt** — the module above does it for you. Turn it off with
`modules: [['./vendor/accesserty/accesserty-ui-kit-nuxt.js', { declarativeShadowDom: false }]]`.

**Next.js** — run Next.js with a [custom server](https://nextjs.org/docs/app/building-your-application/configuring/custom-server)
and wrap its request handler:

```js
// server.mjs
import { createServer } from 'node:http'
import next from 'next'
import { withDeclarativeShadow } from './vendor/accesserty/accesserty-ui-kit-ssr.js'

const app = next({ dev: false })
await app.prepare()
createServer(withDeclarativeShadow(app.getRequestHandler())).listen(3000)
```

`withDeclarativeShadow` streams the HTML through the transform and leaves the
response uncompressed, so compress after it (in a reverse proxy, for example).
Next.js documents that a custom server cannot be deployed on Vercel or combined
with `output: 'standalone'`; there, the components still work and render in the
browser as before.

**Other Node.js servers** — pass the finished HTML through
`injectDeclarativeShadow(html)` from `accesserty-ui-kit-ssr.js`, or use
`createInjector()` (`push(chunk)` / `flush()`) for streamed responses.

HTML added with `innerHTML`, `v-html` or `dangerouslySetInnerHTML` does not turn
declarative templates into shadow roots; the components then build their own and
remove the unused template.

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

Collapsed branches use `hidden="until-found"` where the browser supports it, so
find-in-page can match a collapsed node label and expand every ancestor branch
without moving focus; collapsed nodes stay out of the Tab order, arrow-key order
and accessibility tree. Elsewhere collapsed branches are `hidden` and `inert`.
Node labels live in Shadow DOM, which Safari's text-fragment links (`#:~:text=`)
do not search; Chrome's do.

Vue/Nuxt use `:data.prop="treeData"` and `@change`. In React/Next, assign
`ref.current.data` after client-side registration and again when data changes.
The concrete Next/Nuxt examples in `test/ssr/` verify host hydration and client-rendered
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

The native control rules sit in a cascade layer named `accesserty`, so your own
unlayered CSS always overrides them, whatever its specificity. If your project
uses layers too (Tailwind CSS v4 declares `theme, base, components, utilities`),
declare where the kit goes before loading any stylesheet:

```css
@layer theme, base, accesserty, components, utilities;
```

The layer only affects these native-control styles. `<au-*>` components keep
their styles in Shadow DOM and are customised with `--au-*` variables and
`::part()` (Step 1), which layers do not change.

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

### Reserving space before registration

Until the script registers a component, its host is an empty inline element with
no height. When registration happens after first paint (a deferred or slow
bundle), the fields that appear push the content below them down: a layout shift.
Reserve each registered height while the element is `:not(:defined)`:

<!-- reserve-css: test/browser/reserve-contract.mjs checks these values -->
```css
au-input:not(:defined),
au-textarea:not(:defined),
au-file-upload:not(:defined),
au-tree:not(:defined) {
  display: block;
}

/* Labels use line-height: normal, so reserve one line in lh: it follows the font. */
au-input:not(:defined) {
  container-type: inline-size;

  &::before {
    content: "";
    display: block;
    block-size: 3.375rem;
  }
  &[data-size="small"]::before { block-size: 2.625rem; }
  &[data-size="large"]::before { block-size: 4.5rem; }

  @container (width < 768px) {
    &::before { block-size: calc(4.625rem + 1lh); }
    &[data-size="small"]::before { block-size: calc(3.125rem + 1lh); }
    &[data-size="large"]::before { font-size: 1.25rem; block-size: calc(6.5rem + 1lh); }
  }
  &[data-layout="vertical"]::before { block-size: calc(4.625rem + 1lh); }
  &[data-layout="vertical"][data-size="small"]::before { block-size: calc(3.125rem + 1lh); }
  &[data-layout="vertical"][data-size="large"]::before { font-size: 1.25rem; block-size: calc(6.5rem + 1lh); }
}

au-textarea:not(:defined) { min-block-size: calc(4.875rem + 1lh); }

/* Three 1rem lines (label, button, drop text) and one 0.875rem line (usage). */
au-file-upload:not(:defined) {
  &::before {
    content: "";
    display: block;
    block-size: calc(3.625rem + 2 * clamp(0.75rem, 4vw, 2rem) + 3lh);
  }
  &::after {
    content: "";
    display: block;
    font-size: 0.875rem;
    block-size: 1lh;
  }
}

/* One 2.5rem row per visible node; set --tree-rows on each tree. */
au-tree:not(:defined) { min-block-size: calc(var(--tree-rows, 1) * 2.5rem); }
```

The values match the default tokens with a single-line label, no description or
error message; a test keeps them in step with the components in several fonts,
including Traditional Chinese ones. Labels use `line-height: normal`, whose height
depends on the font, so each text line is reserved as `1lh` (the line height of the
current font) rather than in pixels. `au-input` sizes itself with a container query
at 768px, which the reserved `::before` mirrors. Browsers without the `lh` unit
(before Chrome 109, Firefox 120, Safari 16.4) ignore those declarations and reserve
nothing, as before.
Measure again (`element.getBoundingClientRect().height` after registration) if you
change sizes, padding, fonts or line heights, add descriptions, or use another
`rows` value. Measured on the demo pages under simulated Slow 4G with 4× CPU
slowdown, this reduced cumulative layout shift from 0.296 to 0.023 (input), 0.318
to 0.010 (form), 0.111 to 0.002 (textarea) and 0.305 to 0.036 (file-upload).
Checkboxes, switches, radios, ratings and display components shifted little or
nothing in the same measurement.


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
in SSR applications. Real Next/Nuxt fixtures preserve the host/content
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

Navigation/current changes and settled scrolling emit `au-slide-change.detail`
with `{index,total,title}`. Structural refresh and translation are silent.
Boundary arrows remain focusable with `aria-disabled` and ignore repeated
activation. Tab from a dot enters the current slide's first eligible native
control; nested shadow widgets need their own focus entry. RTL movement uses
the track's right edge. Forced colors and reduced motion have explicit styles.

Next assigns `ref.current.current` after client registration; Nuxt uses
`:current.prop="index"` / `@au-slide-change`. Copy `event.detail.index` into the model. The real SSR fixtures
retain server-produced host/slide nodes but create controls only in the browser;
they do not establish full framework navigation or screen-reader behavior.

## Accordion state and accessible structure

Plain HTML can load either bundle or `components/accordion.js` (readable or
minified) using an ordinary deferred script; the source file is an ES module:

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

Collapsed panels use `hidden="until-found"` where the browser supports it
(detected through `onbeforematch`). Find-in-page, text-fragment links and `#id`
links that match collapsed slotted content open that item and any enclosing
items, emitting the usual `au-toggle` and closing siblings in exclusive mode. Until then the content stays
out of the Tab order and accessibility tree. Browsers without support keep
collapsed panels `hidden` and `inert`, so their find-in-page skips them.

The real Next/Nuxt fixtures verify host and slotted-content hydration,
reactive open state, events, keyboard interaction and a fragment link that opens a
collapsed item. React binds Boolean `open` and `onau-toggle`; Vue and Nuxt bind
`:open="isOpen"` / `@au-toggle`. Synchronize the Boolean model from
`event.detail.open`; an item's initial `open` state emits no event. With
[server rendering](#server-rendering) the accordion is already collapsed or open
before the script runs. These are not a full screen-reader/conformance result.

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

Development and CI use the Node.js version in [`.nvmrc`](.nvmrc) and npm 11.
These are build/test requirements; using the browser bundles does not require Node.js.

```bash
# Select the repository's Node version (with nvm)
nvm install
nvm use

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

`npm test --prefix test/ssr` builds Next.js, Nuxt and Vue fixtures and checks
server rendering, hydration, the Vue and React integrations, declarative shadow
roots and the TypeScript declarations (run `npm run build` first).
`node test/browser/declarative.mjs chrome` compares adopted and browser-built
shadow roots; `npm run test:ssr-stream` checks the streaming server wrapper.

`npm run test:css` checks the shared stylesheet's token, Popover and select-direction
contracts in installed Chrome, Firefox and Safari. `npm run test:firefox` and
`npm run test:safari` run all WebDriver browser checks in one browser; see
[CONTRIBUTING.md](CONTRIBUTING.md#integration-tests) for setup.


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the development environment, add new components, and submit pull requests.


## License

[MIT](LICENSE) © Accesserty
