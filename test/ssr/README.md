# Component SSR integration fixtures

Run from this directory with a Node version supported by all three frameworks
and an installed Google Chrome:

```sh
npm install
npm test
```

Dependencies are isolated from the component library. The runner builds Next and
Nuxt production servers, starts an Angular `renderApplication` server with
`provideClientHydration`, tests through Chrome, then stops its servers. Ports
41791–41793 must be free; it never terminates unrelated servers.

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

Registration is client-only: Next uses an effect, Nuxt a `.client` plugin, Angular
a separate client entry. The server emits the custom-element host, not its shadow
controls. JavaScript is required to render and operate them. Do not import
the component class on the server or call this declarative-shadow-DOM SSR.

Angular uses the real SSR/hydration runtime with a JIT fixture, not an Angular CLI
AOT production build. Its template uses attribute binding so name/value appear
in server HTML; this is separate from the component's DOM-property binding tests.
Nuxt uses explicit `:value` / `@input` binding. Direct `v-model` on `au-input`
works in the client-only Vue fixture but is rejected by the tested SSR compiler.
Textarea also uses explicit value/input binding in the Nuxt fixture.
Checkbox/switch use checked/change-detail binding, not direct text-style v-model.
Radio-group uses value/change-detail.value binding, not child checked markers for controlled state.
Tabs uses selected-index/tab-change.detail.index; programmatic selection is silent.
Pagination binds data-current-page/data-page-size and numeric custom-event details.
Its page-size-change handler updates both size and page 1; there is no extra page-change event.
Checks cover server host identity, silent reactive updates, keyboard navigation,
focus retention during translations and size changes, event counts and accessible names.
Dropdown checks preserve both server-produced menu-item hosts, update translated
trigger/item text and the item value without losing focus, and receive exactly
one selected event for Enter or Space, including after reconnecting an item.
Consumers bind `selected.detail.value`; changing text/value does not select an item.
Tree uses DOM-property data binding, preserved keyed node identity during
translations, retained expansion/check/focus state, disabled checkbox actions and
one aggregate change event. Next assigns the ref after client registration;
Nuxt uses :data.prop and Angular uses [data]. Only the host is server-produced;
the tree nodes themselves are client-rendered and do not claim SSR shadow content.
Accordion preserves server-produced group/item hosts and heading/content slot
nodes. It checks reactive open state, programmatic and keyboard event counts,
translated header focus, heading/region names, Tab into content, collapse focus
and reconnection. React uses Boolean open/onau-toggle; Nuxt uses :open.attr and
Angular [attr.open] with empty string/null for presence/absence. Handlers copy
detail.open into the Boolean model; same-value writes do not repeat events.
Carousel preserves the host and server-produced slide nodes, binds current as a
DOM property and synchronizes slide-change.detail.index. Next uses a ref after
registration; Nuxt :current.prop and Angular [current]. Tests cover navigation,
translated dot identity/focus, native Tab into content, names, reconnection and
boundary-button focus/no-op event counts. Internal controls are client-rendered;
framework-driven slide reordering is not covered here.
Card preserves host/heading/content/footer nodes, native input focus during
translation/render, typed FormData and native Tab order into the footer action.
Its framework-bound button event fires once, including after reconnecting the
card. It needs no component model adapter; native child behavior is retained.
The Card form and component-form fixtures are separate and explicitly selected.
Breadcrumbs serialize items as JSON attributes (React items, Nuxt :items.attr,
Angular [attr.items]). A JavaScript-disabled page verifies server data and the
icon slot without claiming server-rendered navigation links. Hydration preserves
the host/icon, updates translated items and the external landmark name without
losing link focus, and recovers focus to nav when the focused link becomes the
current page. Native Tab skips the current item; Enter follows a local fragment
and focuses its target. Framework-router interception is not covered.
The Angular fixture declares UTF-8 for HTML and JavaScript; checks verify document
encoding and the server-produced icon before and after hydration.
File Upload preserves server host/trigger/hint nodes and client-registers the picker.
Chrome Enter/Space opens the real filechooser path with automated files, not a click stub.
Checks compare File names/content with native FormData, framework change/removal
counts, translated remove-button identity/name/focus, renamed fields, disabled
fieldsets, inline required validation, reset and reconnection. Files are client-only
DOM property values, not serialized HTML. Change handlers read target.value;
form reset handlers clear the framework model because component reset is silent.
These fixtures use attribute name/label bindings and no Angular form directive.
This suite covers targeted flows for all fifteen component types, not all possible interactions, client-side routing, Angular
form adapters, framework versions other than those installed, or screen readers.
