# Usage reference

Use the [README](../README.md#quick-start) to load the kit. This reference covers
component behavior that matters when you connect it to application data and forms.
For attribute, property and CSS tables, open the [component demos](../demo/index.html).

## File selection and native forms

### Add a file picker

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <au-file-upload name="attachments" label="Choose attachments" accept=".txt" multiple required>
    <span slot="hint">Up to 5 files, 5MB each, 20MB total.</span>
  </au-file-upload>
  <button type="submit">Submit</button>
</form>
```

Load the kit before using this example. Replace `/upload` with your server
endpoint. The component selects files; it does not upload them. The form submits
actual `File` entries under `name`, including in `new FormData(form)`. An empty
or unnamed component contributes no entries.

The default trigger is a native button. For a custom `trigger` slot, provide a
named `<button type="button">`. Keep the visible action in its accessible name.
See the [file-upload demo](../demo/file-upload.html) for all labels and limits.

### Select and validate files

Selection adds to the existing list. Without `multiple`, remove the current file
before selecting a replacement.

Default limits are 5 files, 5MB per file and 20MB in total. Set `max-files`,
`max-size-mb` and `max-total-size-mb` to change them. Finite nonnegative values
are accepted; count is rounded down. Zero is valid. Invalid values use the
defaults. Lowering a limit does not remove existing files.

The picker and drop handler check names, MIME types, sizes and counts. Extension
and MIME comparisons ignore case. Duplicate name/size pairs are ignored. If a
batch would exceed the total size, none of that batch is added.

These checks do not inspect file contents or establish file safety. Validate
again on the server. Drag/drop handling is limited to the component, not the
whole page.

### Read or set the selection

- Read `element.value` for a copied `File[]`.
- Listen for `change` and read `event.target.value` to update application state.
- Assign a `File[]` to `value` to replace the selection. This copies valid File
  entries, removes repeated object references and emits no event. It bypasses
  picker restrictions.
- Call `handleFiles(files)` to apply the picker restrictions instead.
- Call `removeFile(file)` to remove a file. An actual removal emits
  `au-remove-file` with the removed File, then `change`. Removing an absent file
  emits nothing. The remove button uses the same behavior.

Use the public API rather than changing the internal `files` array.

### Disable or reset the field

When the component is disabled, or is inside a disabled `<fieldset>`:

- Users cannot select or remove files.
- The form omits the selected files from submission.
- The component keeps the selection for when it is enabled again.

Native form reset clears the selection, picker, errors and pending announcements.
It emits no `change`. If a framework stores a separate model, synchronize that
model in the form's reset handler. Assigning `value` is also silent.

With `required`, an empty field is invalid. Browser validation focuses a visible
trigger region, not the hidden file input, and the component shows an inline
message. Its `focus()` method focuses the trigger without opening the picker.

### Use it in a framework or on a server-rendered page

The server can render the host attributes and consumer trigger/hint content.
The component builds its controls in the browser. Do not serialize File values
into HTML.

Vue/Nuxt `v-model` holds a `File[]`; assign `[]` to clear it. React's
`AuFileUpload` takes no value prop: use `onChange` and read `e.target.value`.
See [framework setup](../README.md#framework-integration) and the
[SSR fixtures](../test/ssr/README.md) for the tested flows and limits.

### Validate the other form components

These seven components participate in native forms:
`au-input`, `au-textarea`, `au-checkbox`, `au-switch`, `au-radio-group`,
`au-rating` and `au-file-upload`.

They use `name` for submission, follow native reset and disabled-fieldset state,
and block submission when invalid. Each exposes `form`, `validity`,
`validationMessage`, `willValidate`, `checkValidity()`, `reportValidity()` and
`setCustomValidity()`.

```js
const email = document.querySelector('au-input[name="email"]');
email.setCustomValidity('This address is already registered.'); // blocks submission
email.setCustomValidity('');                                      // back to the field's own checks
```

A nonempty custom message adds a custom error without removing the component's
own checks, such as `required`. An empty message removes only that custom error.
Custom errors survive form reset, as on a native input.

For persistent inline errors, provide error text near the field, reference it
with `aria-describedby`, and set `aria-invalid` when showing an error. Browser
validation bubbles are not a substitute for those messages. See the
[application form demo](../demo/form.html) for error-summary navigation.
Pressing Enter in `au-input` does not submit the form.

## Breadcrumbs in local HTML and SSR

Use a full bundle or `dist/components/breadcrumbs.js` with an ordinary deferred
script. This works in HTML opened directly from disk.

For local links, use `./index.html` or another relative path. A leading `/`
points to the filesystem root, not the HTML file's folder. The last item is the
current page and is intentionally not a link.

The `items` property accepts data such as
`[{ text: 'Home', url: './index.html' }, { text: 'Current page' }]`.
Assignments to `items` and `separator` made before element registration are
retained and passed to their setters after registration. Without the SSR
injector, internal links appear only after JavaScript runs.

For SSR, serialize items into the HTML attribute:

- React: `items={JSON.stringify(items)}`.
- Nuxt: `:items.attr="JSON.stringify(items)"`.

With [server rendering](../README.md#server-rendering), the injector renders the
navigation links before JavaScript runs. Without it, the server supplies the
host, data and icon slots; the browser component builds the links.

The [breadcrumb demo](../demo/breadcrumbs.html) is a complete plain-HTML example.
The [SSR fixtures](../test/ssr/README.md) check these bindings, retained focus
during translation and native fragment navigation. The kit does not provide or
verify framework router interception.

## Tree data in plain HTML and frameworks

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

### Keep state when data changes

Data assigned before element registration is retained. Give each record a string
or numeric `id` that is unique among its siblings. Stable IDs let the tree keep
node identity, focus, expansion and checkbox state when you replace data, for
example during translation. Without IDs, retention needs the same object
references.

Labels are text, not HTML. Optional `lang` sets the node language. Set `checked`
on leaves or `expanded` on branches to control that state on each assignment.
Omit them to retain local interaction state. Branch check state comes from
enabled children.

`disabled` blocks checkbox changes throughout a branch, including changes from
an ancestor. Users can still navigate and expand that branch. Parent tri-state
calculation excludes disabled child branches.

Tree does not change input objects or submit native form values. Read
`event.detail.checkedNodes` in a `change` listener to update application state.
Data and text updates do not emit user change events.

### Find hidden nodes

Collapsed branches use `hidden="until-found"` where the browser supports it, so
find-in-page can match a collapsed node label and expand every ancestor branch
without moving focus; collapsed nodes stay out of the Tab order, arrow-key order
and accessibility tree. Elsewhere collapsed branches are `hidden` and `inert`.
Node labels live in Shadow DOM, which Safari's text-fragment links (`#:~:text=`)
do not search; Chrome's do.

### Connect a framework

Vue/Nuxt use `:data.prop="treeData"` and `@change`. In React/Next, assign
`ref.current.data` after client-side registration and again when data changes.
The concrete Next/Nuxt examples in `test/ssr/` verify host hydration and client-rendered
tree nodes; they do not server-render the tree's shadow content.


## Card content and native behavior

`au-card` provides layout, not interaction. Its four named slots appear in this
order: heading, media, content, footer. There is no default slot: content without
one of these slot names is not shown. Keep the source content in a logical order
too, so it makes sense before the script loads.

```html
<script src="./accesserty-ui-kit.js" defer></script>
<au-card>
  <h2 slot="heading">Reading guide</h2>
  <p slot="content">Practical steps for reviewing a page.</p>
  <a slot="footer" href="./guide.html">Read the review guide</a>
</au-card>
```

The heading slot does not create a heading. Supply a native heading, meaningful
links, control labels, media alternatives and button types. Card adds no button
role, landmark, form-control behavior, Tab stop or custom events. Native child
controls keep their form submission, reset and events. Repeated `render()` calls
keep the existing shell and slot nodes.

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

### Provide slides and a name

Load a normal deferred script and provide direct element children as slides.
Name the carousel with `aria-label` or an external `aria-labelledby`; localize
`data-text-roledescription` when needed. The continuous scroll layout leaves all
slides in DOM reading order and does not autoplay or implement tabpanels.

### Set or read the current slide

Use the zero-based `current` DOM property, not an HTML attribute. Finite numeric
strings are accepted. Fractions truncate; invalid or non-finite values become 0.
The result is clamped to the slide range, or -1 when there are no slides.

Keep stable keyed slide elements to retain selection and dot focus through
translation or reordering. A replacement node is a new slide identity. Call
`refresh()` for an immediate update; title edits also refresh automatically.

### Handle events and keyboard access

Navigation/current changes and settled scrolling emit `au-slide-change.detail`
with `{index,total,title}`. Structural refresh and translation are silent.
Boundary arrows remain focusable with `aria-disabled` and ignore repeated
activation. Tab from a dot enters the current slide's first eligible native
control; nested shadow widgets need their own focus entry. RTL movement uses
the track's right edge. Forced colors and reduced motion have explicit styles.

### Connect a framework

Next assigns `ref.current.current` after client registration; Nuxt uses
`:current.prop="index"` / `@au-slide-change`. Copy `event.detail.index` into the model. The real SSR fixtures
retain server-produced host/slide nodes but create controls only in the browser;
they do not establish full framework navigation or screen-reader behavior.


## Accordion state and accessible structure

### Supply named slots

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

Keep heading and subtitle content non-interactive: those slots sit inside a
native button. The icon is decorative. Choose `heading-level` for the surrounding
page: values are 1–6, with 3 as the default. Use `no-region` to remove the panel's
landmark role when expanded panels would create too many landmarks.

### Control open state

Exclusive mode owns direct item children only; nested accordions are independent.
On initialization, insertion or enabling exclusive mode, the first open direct
item is retained. Opening another item closes its siblings. Zero open items is
allowed. `open` and `exclusive` are Boolean properties/attributes; `open="false"`
still means open. Pre-registration property assignments are supported.

### Handle state events and focus

Every actual connected `open` attribute change emits `au-toggle.detail.open`,
including programmatic updates and sibling closures. Reassigning the same state
does not emit another event. A group-level listener should filter the originating
item when it contains nested groups; read the item's current `open` for final
state after synchronous handlers. Native Enter/Space and Tab/Shift+Tab operate
the buttons and visible content. Collapsing focused content returns focus to its
header without stealing external focus. Translation retains the button and slots.

### Find collapsed content

Collapsed panels use `hidden="until-found"` where the browser supports it
(detected through `onbeforematch`). Find-in-page, text-fragment links and `#id`
links that match collapsed slotted content open that item and any enclosing
items, emitting the usual `au-toggle` and closing siblings in exclusive mode. Until then the content stays
out of the Tab order and accessibility tree. Browsers without support keep
collapsed panels `hidden` and `inert`, so their find-in-page skips them.

### Connect a framework

The real Next/Nuxt fixtures verify host and slotted-content hydration,
reactive open state, events, keyboard interaction and a fragment link that opens a
collapsed item. React binds Boolean `open` and `onau-toggle`; Vue and Nuxt bind
`:open="isOpen"` / `@au-toggle`. Synchronize the Boolean model from
`event.detail.open`; an item's initial `open` state emits no event. With
[server rendering](../README.md#server-rendering) the accordion is already collapsed or open
before the script runs. These are not a full screen-reader/conformance result.
