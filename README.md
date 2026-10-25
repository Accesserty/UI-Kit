# Accesserty UI Kit

![License: MIT](https://badgen.net/badge/license/MIT/orange)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Accesserty/UI-Kit)

A library of **15 Web Components** with reusable semantics, keyboard interaction
and focus handling. Use them in plain HTML or through the Vue/Nuxt and React
19/Next.js integrations. You still provide names, content and translations, and
test the components in your application.

Visit the [Accesserty UI Kit overview](https://accesserty.com/en/uikit/) for
getting-started guidance, or try the [online Playground](https://accesserty.com/en/uikit/playground/)
to explore component styles and copy examples. The API reference and local demos
are available in [`demo/`](demo/index.html); framework setup is covered below.

For plain HTML, copy one JavaScript file and load it with a `<script>` tag.
You do not need npm, a build step or a frontend framework.

## Find what you need

| Task | Read |
|---|---|
| Try a component in HTML | [Quick Start](#quick-start) |
| Use Vue, Nuxt, React or Next.js | [Framework Integration](#framework-integration) |
| Handle files, form values, reset or validation | [Usage reference](docs/USAGE.md#file-selection-and-native-forms) |
| Configure Breadcrumbs, Tree, Card, Carousel or Accordion | [Usage reference](docs/USAGE.md) |
| Translate labels and status messages | [Localization](#localization) |
| Change styles | [Styling](#styling) |
| Upgrade an existing project | [UPGRADING.md](UPGRADING.md) |
| Change or test the kit itself | [CONTRIBUTING.md](CONTRIBUTING.md) and [Architecture](docs/ARCHITECTURE.md) |

The [documentation index](docs/README.md) separates current references from dated
design, release and evaluation records.


## Features

- **Accessibility behavior:** WCAG 2.2 AA is the design target. Component tests
  and targeted browser checks cover semantics, keyboard use and focus handling.
- **No runtime package dependencies:** load the full bundle or self-contained
  files for the components you need.
- **Framework integrations:** Vue/Nuxt and React 19/Next.js have integration
  modules and test fixtures. Other custom-element consumers need their own checks.
- **Native forms:** seven components submit values and participate in validation
  through `ElementInternals`.
- **Form bindings:** use `v-model` in Vue/Nuxt, or `value`/`checked` and `onChange`
  in React/Next.js.
- **Server rendering:** servers render tags and initial values. Accordion, Tabs
  and Breadcrumbs can also receive server-rendered Shadow DOM. See
  [Server rendering](#server-rendering) for the setup and limits.
- **CSS customization:** use documented custom properties and exposed parts.
  Components include base styles; they are not unstyled components.

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

Save the page next to the downloaded file and open it in a browser. You should
see an email field and a checkbox. Their styles are included in the script.
To change those styles, see [Styling](#styling).

The same script works when you open the HTML directly from disk. Both full
bundles register elements when loaded, keep internal variables out of the global
scope and export no classes. Classic scripts and browser module side-effect
imports are supported. Do not import these browser bundles in Node.js.

For local file links, use relative paths such as `./index.html`, not `/index.html`
(the filesystem root). See [Breadcrumbs in local HTML and SSR](docs/USAGE.md#breadcrumbs-in-local-html-and-ssr)
for data bindings and navigation limits.

The bundle registers every component. To ship only some of them, copy single
files from [`dist/components/`](dist/components/). Each file works on its own,
also in local HTML opened from disk:

```html
<script src="components/input.js" defer></script>
<script src="components/checkbox.js" defer></script>
```

Use `components/input.min.js` for the minified file. The readable and minified
files have the same behavior.

`accordion.js` registers both `au-accordion` and `au-accordion-item`;
`dropdown.js` and `tree.js` likewise register their item elements. Loading a
file twice, or next to the full bundle, defines each element only once. Source
files in `src/components/` are not the standalone distribution files: they may
import shared modules. Use `dist/components/` for classic script tags.

### File selection and native forms

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <au-file-upload name="attachments" label="Choose attachments" accept=".txt" multiple required>
    <span slot="hint">Up to 5 files, 5MB each, 20MB total.</span>
  </au-file-upload>
  <button type="submit">Submit</button>
</form>
```

Replace `/upload` with your own server endpoint. The component selects files;
it does not send network requests. The form submits them under `attachments`.
Keep `enctype="multipart/form-data"` for a native file upload and validate files
again on the server. The [local demo](demo/file-upload.html) does not upload files.

Read [File selection and native forms](docs/USAGE.md#file-selection-and-native-forms)
for selection limits, `File[]` values, events, disabled fields, validation and
reset. The same reference covers the validity API shared by all seven form
components. Pressing Enter in `au-input` does not submit the form.

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

Configure the Vue compiler with the kit's `isCustomElement`. Do not use
`tag => tag.startsWith('au-')`: that would bypass the seven form wrappers and
prevent their `v-model` integration from working.

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

Checkboxes can share an array, as with Vue's native `v-model`:

```vue
<au-checkbox label="Search" value="search" v-model="sources"></au-checkbox>
<au-checkbox label="A friend" value="friend" v-model="sources"></au-checkbox>
<au-checkbox label="Newsletter" true-value="yes" false-value="no" v-model="newsletter"></au-checkbox>
```

Typed radio values come from `<au-radio>` elements written directly inside the
group (a `v-for` there is fine); options rendered by a child component of your
own report their string value.

Attributes, classes, listeners and slots pass through to the element. Your own
`@input` and `@change` listeners still run. A template ref forwards element
properties and methods: use `nameField.value.focus()` to focus the field, or
`nameField.value.$el` when an API needs its DOM node.

For non-form `au-*` elements, use ordinary attribute, property and event bindings.
Existing explicit `:value` / `@input` bindings on form components also work.
The adjacent `accesserty-ui-kit-vue.d.ts` types `v-model` through Vue's
`GlobalComponents`.

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

`e.target` is the custom element. `AuCheckbox` and `AuSwitch` expose their
`value` (`'on'` unless set), so you can collect checked values into an array.
`AuInput` also exposes `valueAsNumber` and `valueAsDate`:

```jsx
<AuCheckbox label="Search" value="search" checked={sources.includes('search')}
  onChange={e => { const { checked, value } = e.target; setSources(list => checked ? [...list, value] : list.filter(x => x !== value)) }} />
<AuInput label="Quantity" type="number" value={String(qty)} onChange={e => setQty(e.target.valueAsNumber)} />
```

A controlled value wins. If `onChange` does not update state, the wrapper
restores the prop value on the next animation frame. Unlike a native React
input, this moves the caret to the end of `AuInput` or `AuTextarea`.

`ref` points at the element itself. Other props, `className` and children pass
through. Call `defineElements()` once from a client effect, for example in a root
layout's client component. The integration file starts with `'use client'`, so
Next.js server components can render its exports without defining elements on
the server.

Other `au-*` elements are used directly as JSX tags: React 19 sets matching
properties and attaches `on` + event-name props as listeners, for example
`<au-accordion-item open={isOpen} onau-toggle={e => setOpen(e.detail.open)}>`.
The integration needs React 19. TypeScript declarations
(`accesserty-ui-kit-react.d.ts`) sit next to the file and type every `au-*`
tag, including event details such as `e.detail.open`.
`accesserty-ui-kit.d.ts` types the elements themselves, so
`document.querySelector('au-tabs')` knows `selectedIndex`.

### Other frameworks

The kit uses standard custom elements. Only Vue/Nuxt and React 19/Next.js have
tested integrations. Other stacks need their own checks for compilation,
properties, events, forms and hydration; rendering the tags alone does not
establish compatibility.

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
element tags and their initial values. By default it also inserts declarative
shadow roots for Accordion, Tabs and Breadcrumbs. Other components build their
internals in the browser. See [Server rendering](#server-rendering).

### Server rendering

Frameworks render the `<au-*>` tags, attributes and initial values on the server.
The kit's injector can also insert declarative shadow roots for `au-accordion`
(including its items), `au-tabs` and `au-breadcrumbs`. The browser adopts these
roots instead of rebuilding them. Other components, including the form controls,
build their internals in the browser.

No component class or browser bundle is safe to import in Node.js. Use the
server-side integration modules instead.

| Without JavaScript | `au-accordion` | `au-tabs` | `au-breadcrumbs` |
|---|---|---|---|
| Looks like the final component | yes | yes | yes |
| Works | find-in-page and links open collapsed items where `until-found` is supported | only the selected panel is shown | links navigate |

Insert roots into finished HTML after framework rendering. Do not write
`<template shadowrootmode>` inside a Vue or React template: that breaks hydration.

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

`withDeclarativeShadow` transforms `text/html` responses, removes their
`content-length`, and handles text split across streamed chunks. It removes the
request's `accept-encoding` so the transform receives uncompressed HTML. Apply
compression afterwards, for example in a reverse proxy.
Next.js documents that a custom server cannot be deployed on Vercel or combined
with `output: 'standalone'`; there, the components still work and render in the
browser as before.

**Other Node.js servers** — pass the finished HTML through
`injectDeclarativeShadow(html)` from `accesserty-ui-kit-ssr.js`, or use
`createInjector()` (`push(chunk)` / `flush()`) for streamed responses.

The injector handles well-formed server-renderer HTML; it does not repair
unbalanced markup. Repeated injection leaves existing declarative roots alone.

HTML added with `innerHTML`, `v-html` or `dangerouslySetInnerHTML` does not turn
declarative templates into shadow roots; the components then build their own and
remove the unused template.

### Tree data in plain HTML and frameworks

Tree takes data through a JavaScript property, not a JSON attribute. Read the
[Tree usage reference](docs/USAGE.md#tree-data-in-plain-html-and-frameworks) for
plain HTML, reactive updates, state retention and framework bindings.

## Localization

Your application supplies translations through attributes, slots or JavaScript
properties. The kit does not have a locale registry and does not translate
consumer content. Configure generated labels and announcements as well as visible
text. For example:

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

Many text attributes use `data-text-`. File Upload uses `msg-` for messages,
and components also have names such as `label`, `data-clear-label` and
`data-dot-template`. Use the attribute names in each demo; there is no single
prefix for every text setting.

In a framework, bind these attributes to your i18n strings. Examples are
`:label="t('upload.label')"` in Vue/Nuxt and
`data-text-page-announcement={t('pagination.announcement')}` in React/Next.js.
Keep template tokens such as `{count}` and `{fileName}` in translated messages.


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

Most components expose CSS custom properties whose names start with `--au-`.
Set a value to replace its fallback. Card instead exposes parts for layout and
uses your own selectors for assigned content.

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

The stylesheet is optional and does not replace the script. It is repository
source, not part of the package allow-list or an exported npm subpath. Do not
assume an npm import can resolve it; copy or host the folder intentionally.

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

Changing a palette token alone does not change a Web Component unless you have
connected it to a variable that component reads. For example:

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

**Check contrast whenever you change a colour.** WCAG AA requires at least 4.5:1
for normal text and 3:1 for large text. Check 3:1 contrast for visual information
needed to identify controls and their states, including focus indicators.
These requirements have exceptions; the numbers alone do not establish
conformance. Several components draw their focus outline *inside* the element,
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

Before registration, a custom element has no component styles or generated
controls. An otherwise empty host may reserve no height. If controls appear
after first paint, they can push later content down. Reserve space with
`:not(:defined)` while the script loads:

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

Card projects four named slots and adds no interactive behavior. Read
[Card content and native behavior](docs/USAGE.md#card-content-and-native-behavior)
for slot order, native forms, styling and framework limits.

## Carousel integration

Read [Carousel integration](docs/USAGE.md#carousel-integration) for slide identity,
the `current` property, events, keyboard behavior and framework bindings.

## Accordion state and accessible structure

Read [Accordion state and accessible structure](docs/USAGE.md#accordion-state-and-accessible-structure)
for named slots, heading levels, exclusive groups, state events, focus and
find-in-page behavior.

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

Tests run in a real Chromium browser through `@web/test-runner`. They exercise
the components in controlled fixtures; they do not prove every production
integration or assistive-technology behavior.

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
