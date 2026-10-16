# Upgrading to 3.0

3.0 adds framework-native form bindings and server rendering of Shadow DOM. The
component tags, attributes and properties stay the same; component events now
start with `au-`. Check the breaking changes below before you upgrade.

## Breaking changes

### The native-control cascade layer is now `accesserty`

`au-style.css` puts its native-control rules (`button`, `select`, `dialog`…) in a
cascade layer named `accesserty` instead of `components`. The old name merged
with other libraries' layers of the same name, such as Tailwind CSS v4's.

If you declared a layer order that mentions the kit, rename it:

```css
/* before */
@layer base, components, utilities;
/* after */
@layer base, accesserty, components, utilities;
```

### Component events start with `au-`

Every custom event now carries the kit's prefix, like `au-toggle` already did.
Rename your listeners; the old names are no longer sent. Native `change` and
`input` on form components keep their names.

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

The files in `src/components/` now import shared code from `src/core/` (and,
for accordion, tabs and breadcrumbs, the markup they share with server rendering
from `src/views/`), so a single source file no longer works as a classic
`<script src>`. If you copied single component files from `src/`, copy them from
`dist/components/` instead: every component has a self-contained file there,
used the same way, plus a minified copy (`tabs.min.js`).

### No `au-toggle` for an accordion item's initial state

An `au-accordion-item` that already has `open` when its script loads no longer
emits `au-toggle` during the upgrade; nothing changed. Real changes still emit
it. If you relied on that event to learn the initial state, read `item.open`
instead.

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
- **Form controls have `setCustomValidity()` and `form`,** as native controls do:
  a custom message ("This address is already registered.") blocks submission
  and shows in the browser's validation message, alongside the component's own
  checks such as `required`.
- **React and Next.js:** `AuInput`, `AuCheckbox`… with `value` / `checked`,
  `defaultValue` / `defaultChecked`, `onChange` and refs to the element. See
  [React and Next.js](README.md#react-and-nextjs).
- **Server rendering:** `au-accordion`, `au-tabs` and `au-breadcrumbs` render
  their Shadow DOM on the server and look final before the script runs. On by
  default in the Nuxt module; one wrapper for a self-hosted Next.js server. See
  [Server rendering](README.md#server-rendering).
- **TypeScript:** declaration files in `dist/`: `accesserty-ui-kit.d.ts` types
  every element (`document.querySelector('au-tabs')`), the React file adds
  every `au-*` tag to JSX with typed event details, and the Vue, Nuxt and SSR
  files sit next to their modules.

## Changed look

- **Disabled state:** every component and native button now dims to the same
  opacity, 0.6, which keeps dark text at about 5:1 on white. It was 0.35–0.65
  before, and `au-input` did not change at all when disabled. Each component
  has a `--au-…-disabled-opacity` variable (`--au-btn-disabled-opacity` for
  native buttons and pagination); the demo pages list them.

## Steps

1. Replace your copy of the kit with the whole new `dist/` folder: the
   integration files import each other and the component bundle by relative
   path.
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
6. **Angular:** no longer tested or documented since 2.0.6. The components are
   standard custom elements and keep working with `CUSTOM_ELEMENTS_SCHEMA`.
