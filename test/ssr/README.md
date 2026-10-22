# Component SSR integration fixtures

Use the repository's Node version (`nvm use` at the repository root), npm 11
and an installed Google Chrome. Run from this directory:

```sh
npm ci
npm test
```

Dependencies are isolated from the component library. The runner builds Next and
Nuxt production servers, tests through Chrome, then stops its servers. Ports
41791–41794 must be free; it never terminates unrelated servers.

Two more fixtures use the built Vue integration the way a project does, by
copying `dist/` into their `vendor/` folder: `nuxt-vmodel` (the Nuxt module,
checked by `vmodel-check.mjs`: server-rendered values, hydration, `v-model` in
both directions for the seven form components, `.trim`/`.number`/`.lazy`,
bindings shaped like native controls (checkbox arrays, `true-value`, a number
input, typed radio values), consumer listeners, file-upload errors surviving the model update, FormData and
template refs), `vue-spa` (a Vite build configured exactly as the README
shows, checked by `vue-spa-check.mjs`) and `next-react` (the React integration
in a Next.js App Router page, checked by `react-check.mjs`: server-rendered
values, hydration, controlled and uncontrolled use, a rejected controlled value
reverting, checked boxes collected into an array through `e.target.value`,
`valueAsNumber`, FormData and element refs). Run `npm run build` at the repository
root first.

The check covers rating, input, textarea, checkbox, switch, radio-group, tabs, pagination, dropdown, tree, accordion, carousel, card, breadcrumbs and file-upload. It verifies server-produced
attributes, preservation of the SSR
hosts through hydration, reactive name/value updates, actual keyboard selection
and typing (including textarea newlines), single event notifications, input/textarea
names/descriptions and FormData. Textarea input also updates the framework model.
Checkbox/switch checks cover false→true reactive updates, boolean change payloads,
Space activation back to false, native form omission and accessible name/role/state.
Browser errors fail the test.
Radio-group checks cover reactive value binding, translated option text with stable
focus, disabled cycles that retain selection, keyboard wrapping past disabled
options, matching model/FormData and resolved group names/descriptions.
Tabs checks preserve the actual server-produced panel nodes, update labels/languages
without losing button focus, verify native Tab navigation, selected-index bindings,
single user change events and the accessible tab-to-panel relation.

In the `next` and `nuxt` fixtures registration is client-only: Next uses an
effect, Nuxt a `.client` plugin, and the server emits the custom-element hosts,
not their shadow controls. The `nuxt-vmodel` and `next-react` fixtures also
insert declarative shadow roots for accordion, tabs and breadcrumbs (the Nuxt
module's Nitro plugin, and `withDeclarativeShadow` in a custom Next server);
`declarative-check.mjs` verifies the server HTML, the layout without
JavaScript, adoption without hydration warnings and later interaction. Never
import the component classes on the server.

The `nuxt` fixture uses the elements without the Vue integration, so it binds
explicitly: `:value` / `@input` for input and textarea, checked/change-detail for
checkbox and switch. Vue's server compiler rejects `v-model` on a plain custom
element; with the integration (the `nuxt-vmodel` fixture) `v-model` works.
Radio-group uses value/change-detail.value binding, not child checked markers for controlled state.
Tabs uses selected-index/au-tab-change.detail.index; programmatic selection is silent.
Pagination binds data-current-page/data-page-size and numeric custom-event details.
Its au-page-size-change handler updates both size and page 1; there is no extra au-page-change event.
Checks cover server host identity, silent reactive updates, keyboard navigation,
focus retention during translations and size changes, event counts and accessible names.
Dropdown checks preserve both server-produced menu-item hosts, update translated
trigger/item text and the item value without losing focus, and receive exactly
one selected event for Enter or Space, including after reconnecting an item.
Consumers bind `selected.detail.value`; changing text/value does not select an item.
Tree uses DOM-property data binding, preserved keyed node identity during
translations, retained expansion/check/focus state, disabled checkbox actions and
one aggregate change event. Next assigns the ref after client registration;
Nuxt uses :data.prop. Only the host is server-produced;
the tree nodes themselves are client-rendered and do not claim SSR shadow content.
Accordion preserves server-produced group/item hosts and heading/content slot
nodes. It checks reactive open state, programmatic and keyboard event counts,
translated header focus, heading/region names, Tab into content, collapse focus
and reconnection. React uses Boolean open/onau-toggle; Nuxt uses :open.attr with
empty string/null for presence/absence. Handlers copy
detail.open into the Boolean model; same-value writes do not repeat events.
Carousel preserves the host and server-produced slide nodes, binds current as a
DOM property and synchronizes au-slide-change.detail.index. Next uses a ref after
registration; Nuxt :current.prop. Tests cover navigation,
translated dot identity/focus, native Tab into content, names, reconnection and
boundary-button focus/no-op event counts. Internal controls are client-rendered;
framework-driven slide reordering is not covered here.
Card preserves host/heading/content/footer nodes, native input focus during
translation/render, typed FormData and native Tab order into the footer action.
Its framework-bound button event fires once, including after reconnecting the
card. It needs no component model adapter; native child behavior is retained.
The Card form and component-form fixtures are separate and explicitly selected.
Breadcrumbs serialize items as JSON attributes (React items, Nuxt :items.attr). A JavaScript-disabled page verifies server data and the
icon slot without claiming server-rendered navigation links. Hydration preserves
the host/icon, updates translated items and the external landmark name without
losing link focus, and recovers focus to nav when the focused link becomes the
current page. Native Tab skips the current item; Enter follows a local fragment
and focuses its target. Framework-router interception is not covered.
Checks verify document encoding and the server-produced icon before and after hydration.
File Upload preserves server host/trigger/hint nodes and client-registers the picker.
Chrome Enter/Space opens the real filechooser path with automated files, not a click stub.
Checks compare File names/content with native FormData, framework change/removal
counts, translated remove-button identity/name/focus, renamed fields, disabled
fieldsets, inline required validation, reset and reconnection. Files are client-only
DOM property values, not serialized HTML. Change handlers read target.value;
form reset handlers clear the framework model because component reset is silent.
These fixtures use attribute name/label bindings.
This suite covers targeted flows for all fifteen component types, not all possible interactions, client-side routing,
framework versions other than those installed, or screen readers.
