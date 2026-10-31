# Upgrading to 3.0

Use this guide when moving from 2.x to 3.x. The component tags, attributes and
properties stay the same. Rename the affected custom-event listeners and update
copied component files before testing your application.

3.x also provides framework form bindings and optional server-rendered Shadow
DOM for Accordion, Tabs and Breadcrumbs. Those integrations do not make component
classes safe to import in Node.js.

Start with [Steps](#steps). The sections below explain each change.

## Breaking changes

### The native-control cascade layer is now `accesserty`

`au-style.css` puts its native-control rules (`button`, `select`, `dialog`…) in a
cascade layer named `accesserty` instead of `components`. The old name merged
with other libraries' layers of the same name, such as Tailwind CSS v4's.

If your layer order included the kit's old `components` layer, add `accesserty`
at the intended position. Keep `components` if another library still uses it:

```css
/* before */
@layer base, components, utilities;
/* after */
@layer base, accesserty, components, utilities;
```

### Component events start with `au-`

Rename the listeners in this table. The old names are no longer dispatched.
`au-toggle` keeps its name. Form components keep native-named `change` and
`input`; Tree keeps `change` with `detail.checkedNodes`.

| Component | Before | After |
|---|---|---|
| `au-tabs` | `tab-change` | `au-tab-change` |
| `au-carousel` | `slide-change` | `au-slide-change` |
| `au-pagination` | `page-change`, `page-size-change` | `au-page-change`, `au-page-size-change` |
| `au-dropdown-item` | `selected` | `au-select` |
| `au-file-upload` | `remove-file` | `au-remove-file` |

In React, `ontab-change` becomes `onau-tab-change`; in Vue, `@tab-change` becomes
`@au-tab-change`.

### Single component files move to `dist/components/`

Use `dist/components/` for standalone scripts, not `src/components/`. Component
source files may import `src/core/`; Accordion, Tabs and Breadcrumbs also share
markup through `src/views/`. A classic `<script src>` cannot resolve those
module imports.

Each component has a self-contained readable file and a minified file in
`dist/components/`, such as `tabs.js` and `tabs.min.js`. Load either with the same
script tag you used for the old standalone file. Compound component files also
register their child elements.

### No `au-toggle` for an accordion item's initial state

An `au-accordion-item` with `open` already set does not emit `au-toggle` when the
script registers it. Read `item.open` for the initial state. Later connected
state changes, including programmatic changes and exclusive-mode sibling
closures, still emit the event. Writing the same state again emits nothing.

### Fixed ids inside some shadow roots

`au-accordion`, `au-accordion-item` and `au-tabs` use fixed ids inside their
Shadow DOM (`title`, `region`, `hint`, `tab-1`, `tab-2`…) instead of random
ones. Each shadow root is its own id scope, so nothing collides. This only
matters if your code read those internal ids.

## New

- **Vue and Nuxt:** `v-model` on `au-input`, `au-textarea`, `au-checkbox`,
  `au-switch`, `au-radio-group`, `au-rating` and `au-file-upload`, including in
  server rendering. See [Vue 3](README.md#vue-3) and [Nuxt](README.md#nuxt).
- **Vue `v-model` follows Vue's native rules:** checkbox groups share an
  array or `Set`, `true-value` / `false-value` work, `type="number"` inputs
  give numbers, and `<au-radio :value="2">` gives `2`.
- **`au-input` has `valueAsNumber` and `valueAsDate`,** as a native input does.
- **Form controls expose `setCustomValidity()` and `form`.** A nonempty custom
  message blocks submission without removing checks such as `required`. An empty
  message removes the custom error. This API does not create inline error text
  or set host `aria-invalid`; supply those in the application.
- **React and Next.js:** `AuInput`, `AuCheckbox`… with `value` / `checked`,
  `defaultValue` / `defaultChecked`, `onChange` and refs to the element. See
  [React and Next.js](README.md#react-and-nextjs).
- **Server rendering:** the injector renders Shadow DOM for `au-accordion`
  (including its items), `au-tabs` and `au-breadcrumbs`. It is on by default in
  the Nuxt module. Next.js requires a self-hosted custom server. Other components
  still build their internals in the browser. See
  [Server rendering](README.md#server-rendering).
- **TypeScript:** declaration files in `dist/`: `accesserty-ui-kit.d.ts` types
  every element (`document.querySelector('au-tabs')`), the React file adds
  every `au-*` tag to JSX with typed event details, and the Vue, Nuxt and SSR
  files sit next to their modules.

## Changed look

- **Disabled state:** controls with disabled-state styling use opacity 0.6 by
  default. Previously values varied from 0.35–0.65, and `au-input` did not dim.
  Use the documented `--au-…-disabled-opacity` variables to override the value;
  native buttons and pagination use `--au-btn-disabled-opacity`. Check contrast
  in your theme rather than assuming one opacity produces a fixed contrast ratio.

- **Radio group label (3.0.3, visible change):** `au-radio-group`'s `label` is now drawn as a
  visible group label, like `au-input`'s, and names the group. Before 3.0.3 it was
  only an accessible name, so sighted users saw no group name. If you added your
  own visible label next to a `label` attribute, remove one of them, or switch to
  `aria-labelledby` pointing at yours. `aria-label` alone still draws nothing.

## Steps

1. Replace copied distribution files. Framework users need the whole `dist/`
   folder: integration modules import sibling files by relative path. Plain HTML
   can keep using one full bundle or selected `dist/components/` files.
2. If you use `au-style.css`, copy the new `src/css/` folder and rename any
   `components` layer reference to `accesserty`.
3. **Vue:** replace `isCustomElement: tag => tag.startsWith('au-')` with the
   kit's `isCustomElement` and add `app.use(AccessertyVue)`. Existing
   `:value` / `@input` bindings keep working; switch to `v-model` when you like.
4. **Nuxt:** replace your client plugin, the `isCustomElement` setting and any
   `<ClientOnly>` wrappers with the module:
   `modules: ['./vendor/accesserty/accesserty-ui-kit-nuxt.js']`.
5. **React / Next.js:** optionally switch form fields to the React components
   and call `defineElements()` once in a client effect. For server rendering of
   accordion, tabs and breadcrumbs, run a custom server with
   `withDeclarativeShadow` (not available on Vercel).
6. **Other frameworks:** no integration is tested beyond Vue/Nuxt and React
   19/Next.js. Standard custom-element support does not establish compatibility
   with a particular compiler, form system or hydration flow.
7. Test event listeners, submitted values, reset, keyboard use and focus in your
   application. Review copied CSS and translations too. Repository test results
   do not establish your application's accessibility conformance.
