# Component SSR integration fixtures

## Run the suite

Use the repository's Node version (`nvm use` at the repository root), npm 11
and an installed Google Chrome. Build the kit with `npm run build` at the
repository root first. Then run from `test/ssr/`:

```sh
npm ci
npm test
```

Dependencies are isolated from the component library. Ports 41791–41794 must
be free. The runner builds the fixtures, tests them in Chrome, then stops only
the servers it started. Browser errors fail the checks.

## Choose the relevant fixture

| Fixture | Integration | Main checks |
|---|---|---|
| `next`, `nuxt` | Direct custom-element bindings with browser-only registration | `ssr-check.mjs`: all fifteen component types, server HTML, hydration and interaction |
| `nuxt-vmodel` | The kit's Nuxt module | `vmodel-check.mjs`: seven form components, `v-model`, FormData and template refs |
| `vue-spa` | The kit's Vue integration in Vite | `vue-spa-check.mjs`: setup from the root README |
| `next-react` | The kit's React integration in a Next.js App Router page | `react-check.mjs`: controlled/uncontrolled forms, FormData and element refs |

The runner copies built JavaScript and declaration files from `dist/` into
the integration fixtures' `vendor/` folders, as a consumer would. It also
type-checks the declarations with the `types` fixture.

`nuxt-vmodel` checks both binding directions, `.trim`/`.number`/`.lazy`,
checkbox arrays, `true-value`, numeric inputs and typed radio values. It checks
consumer listeners and that a model update preserves file-upload errors.
`next-react` checks rejected controlled values reverting, checked values
collected through `e.target.value`, and `valueAsNumber`.

## Understand the server-rendering boundary

Never import component classes on the server. In `next`, a client effect
defines them; in `nuxt`, a `.client` plugin does so. These fixtures render
hosts, attributes and light-DOM content on the server, not internal controls.

`nuxt-vmodel` and `next-react` additionally insert declarative shadow roots
for accordion, tabs and breadcrumbs. Nuxt uses the module's Nitro plugin;
Next uses `withDeclarativeShadow` in a custom server. `declarative-check.mjs`
checks server HTML, layout without JavaScript, adoption without hydration
warnings and later interaction. Other components still create their
internals in the browser.

## Read the binding and interaction checks

The checks compare server-produced attributes and host identity through
hydration. They exercise reactive updates, real keyboard selection/typing,
event counts, input/textarea names and descriptions, and native FormData.
The component-specific checks below define the tested scope.

### Form controls

- **Input and Textarea:** the plain `nuxt` fixture binds `:value` and `@input`.
  Vue's server compiler rejects `v-model` on a plain custom element; the kit's
  wrappers enable it in `nuxt-vmodel`. Textarea checks include newlines and
  updates to the framework model.
- **Checkbox and Switch:** the plain fixture binds checked state and
  `change.detail`. Checks cover false→true updates, boolean event details,
  Space activation back to false, native form omission and exposed
  name/role/state.
- **Radio Group:** bind `value` and `change.detail.value`, not child checked
  markers for controlled state. Checks cover reactive selection, translated
  option text with retained focus, disabled cycles, keyboard wrapping past
  disabled options, matching model/FormData and group names/descriptions.
- **File Upload:** files are client-only DOM properties, not serialized HTML.
  Change handlers read `target.value`. Form reset handlers clear the external
  model because component reset is silent. The fixtures use attribute
  name/label bindings and preserve server host/trigger/hint nodes. Chrome
  Enter/Space opens the real filechooser path with automated files, not a
  click stub. Checks compare File names/content with FormData, change/removal
  counts, translated remove-button identity/name/focus, renamed fields,
  disabled fieldsets, inline required validation, reset and reconnection.

### Navigation and selection

- **Tabs:** bind `selected-index` and `au-tab-change.detail.index`.
  Programmatic selection is silent. Checks retain server panel nodes and
  translated-button focus, and verify native Tab navigation, one user-change
  event and the accessible tab-to-panel relation.
- **Pagination:** bind `data-current-page` and `data-page-size`. Custom-event
  details are numbers. The `au-page-size-change` handler updates both size and
  page 1; no extra `au-page-change` fires. Checks cover silent reactive
  updates, navigation, translation/size-change focus, event counts and names.
- **Dropdown:** read the `au-select` event's `detail.value`. Text/value
  updates do not select an item. Checks retain both server menu-item hosts
  and translated focus, and expect one event per Enter/Space activation,
  including after reconnection.
- **Tree:** assign `data` as a DOM property: Next uses a ref after
  registration; Nuxt uses `:data.prop`. Checks cover keyed node identity,
  translated focus, retained expansion/check state, disabled checkbox actions
  and one aggregate `change`. Only the host is server-produced; nodes are
  client-rendered.
- **Breadcrumbs:** serialize `items` as JSON attributes (React `items`, Nuxt
  `:items.attr`). In the plain `next`/`nuxt` fixtures, JavaScript-disabled
  checks verify server data and the icon slot, not internal navigation links.
  Hydration retains the host/icon. Translation updates items and the external
  navigation name without losing link focus. If the focused link becomes the
  current page, focus returns to the navigation landmark. Tab skips the
  current item; Enter follows a local fragment and focuses its target.
  Checks also verify document encoding and the icon before/after hydration.
  Framework-router interception is not covered.

### Layout and disclosure

- **Accordion:** React binds Boolean `open` and `onau-toggle`; plain Nuxt uses
  `:open.attr` with an empty string or `null` for presence/absence. Handlers
  copy `detail.open` into the Boolean model; same-value writes do not repeat
  events. Checks retain group/item hosts and heading/content slots, and cover
  reactive open state, programmatic/keyboard event counts, translated-header
  focus, heading/region names, Tab into content, collapse focus and reconnect.
- **Carousel:** bind `current` as a DOM property and read
  `au-slide-change.detail.index`. Next uses a ref after registration; Nuxt
  uses `:current.prop`. Checks retain server slide nodes and cover navigation,
  translated-dot identity/focus, native Tab into content, names, reconnect
  and boundary-button focus/no-op counts. Internal controls are client-rendered.
  Framework-driven slide reordering is not covered here.
- **Card:** no model adapter is needed. Native children keep their behavior.
  Checks retain host/heading/content/footer nodes and input focus through
  translation/render, compare typed FormData, follow Tab into the footer,
  and expect one bound-button event even after reconnect. The Card form and
  component-form fixtures are separate and explicitly selected.

## Limits

These are targeted flows for all fifteen component types. They do not cover
every interaction, client-side routing, other framework versions or screen
readers. They do not establish full WCAG conformance or no-JavaScript
operation of components whose internals are browser-rendered.
