# Manual accessibility test procedures

Each row below is a separate case. Run only the steps appropriate to the named
variant and record the actual variant. `K` is a keyboard interaction, `AT` needs
real assistive-technology output, and `V` requires visual inspection. These are
procedures, not results. Use the [record template](record-template.md).

## Preparation

1. Build the revision under test with the repository's Node version and
   `npm run build`. Record the bundle SHA-256 and any local source changes.
2. Serve the repository locally, for example
   `python3 -m http.server 41803 --bind 127.0.0.1` from its root. Demo links below
   are relative to this document; the same pages can be opened through that server.
3. Use synthetic data. The form demo is local and does not send a real application.
   For uploads, use `test/browser/fixtures/upload-one.txt` and `upload-two.txt`.
4. Record browser zoom, viewport, theme, OS keyboard-navigation settings, input
   language and active assistive technology. Keyboard-only cases start with the
   screen reader off; screen-reader cases explicitly turn it on and record mode.
5. To test keyboard entry, place focus on the preceding control, then use Tab.
   A setup click on that preceding control is allowed, but record it. Do not
   directly focus the widget and claim its Tab entry was tested.
6. The small [controls fixture](../../test/browser/fixtures/controls.html?mode=bundle)
   provides Input, Textarea, Checkbox, Switch, Radio, Rating and Tabs with named
   before/after buttons. Use `mode=bundle` or `mode=min` for file URLs.

For every visual case, inspect focus while operating the widget, 200% browser
zoom and a 320 CSS-pixel viewport, then restore settings. Record each condition
separately; one screenshot cannot pass all three. Content must remain readable,
controls reachable and focus distinguishable. Record clipped text, overlap or
unexpected two-dimensional scrolling. Measure contrast separately before claiming
a numeric contrast result. Also inspect dark/custom themes used by the application.

## Accordion

Page: [Accordion](../../demo/accordion.html), Basic and Exclusive Mode variants.

| ID | Steps | Expected outcome |
|---|---|---|
| ACCORDION-K01 | Tab into a heading toggle; press Enter, then Space; Tab into an open section and onward. In Exclusive Mode, open the second section. | Toggle state and content visibility agree; closed content is skipped; focus can leave; exclusive mode closes the other section. |
| ACCORDION-AT01 | Navigate by headings; inspect a collapsed toggle; activate and explore its section; repeat in Exclusive Mode. | Heading level, toggle name and expanded/collapsed state are meaningful; revealed content is reachable; exclusive-mode guidance is understandable without duplicate announcements. |
| ACCORDION-V01 | Apply the visual conditions above with a long heading and an open section; additionally inspect reduced motion if the tested variant animates. | Labels and content remain readable; the open state and keyboard focus remain visible; motion follows the configured preference. |

## Breadcrumbs

Page: [Breadcrumbs](../../demo/breadcrumbs.html), Basic and aria-labelledby variants.

| ID | Steps | Expected outcome |
|---|---|---|
| BREADCRUMBS-K01 | Tab through the breadcrumb links; activate a local link where provided; continue past the current item. | Links work; the current non-link item adds no unnecessary Tab stop; focus can leave. Record destination behavior separately from framework routing. |
| BREADCRUMBS-AT01 | Find the navigation landmark and read its list and current item, including a custom separator. | Landmark name, hierarchy and current-page state are understandable; decorative separators do not obscure names. |
| BREADCRUMBS-V01 | Apply the visual conditions with a long hierarchy. | The trail wraps or remains usable without clipping names or hiding focus. |

## Card

Page: [Card](../../demo/card.html), Demo variant.

| ID | Steps | Expected outcome |
|---|---|---|
| CARD-K01 | Tab through the links/buttons inside the card and onward. | Only real interactive descendants receive keyboard focus; the container creates no extra control or trap. |
| CARD-AT01 | Read the card heading, content and footer in document order; inspect a link name. | Supplied semantic content remains in a meaningful order; the card does not add a misleading button role. |
| CARD-V01 | Apply the visual conditions with long heading/content text. | Text and actions remain readable; child focus indicators are not clipped by the card. |

## Carousel

Page: [Carousel](../../demo/carousel.html), an example with multiple slides.

| ID | Steps | Expected outcome |
|---|---|---|
| CAROUSEL-K01 | Tab to previous/next and pagination controls; activate them; use documented pagination arrow keys; Tab into the shown slide and out. | The expected slide changes; boundary controls behave as documented; controls and shown content are reachable without a trap. |
| CAROUSEL-AT01 | Read the carousel name and slide controls; change slides and listen; explore currently shown content. | Position and control names identify the destination; updates are useful and not duplicated; hidden content does not create confusing navigation. |
| CAROUSEL-V01 | Apply the visual conditions; inspect reduced motion and the first/last slide. | Content, controls and focus remain visible as slides-per-view changes; configured motion preferences are respected. |

## Checkbox

Page: [Checkbox](../../demo/checkbox.html), Basic; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| CHECKBOX-K01 | Tab from the preceding control; press Space twice; Tab onward. Separately repeat with disabled variants. | Checked state toggles once per activation and returns to its initial value; focus leaves; disabled controls cannot be changed. Record disabled coverage separately. |
| CHECKBOX-AT01 | Read unchecked, checked, required and disabled variants; activate the enabled checkbox with the screen reader. | Name, checkbox role and applicable states are conveyed; toggling is operable and understandable. |
| CHECKBOX-V01 | Apply the visual conditions and Windows contrast themes when available. | Checkmark, disabled appearance and focus are distinguishable, including when colors are replaced. |

## Dropdown

Page: [Dropdown](../../demo/dropdown.html), Basic variant.

| ID | Steps | Expected outcome |
|---|---|---|
| DROPDOWN-K01 | Tab to the trigger; open with Enter; move through items with arrows; close with Escape; reopen and activate an item. | Trigger state follows visibility; menu navigation works; Escape returns focus to the trigger; selection does not leave a hidden focus target. |
| DROPDOWN-AT01 | Inspect the trigger; open the menu, navigate items and activate one. | Trigger name, popup/expanded state and item roles/names are understandable; separators and disabled items do not masquerade as actions. |
| DROPDOWN-V01 | Apply the visual conditions with the menu open near viewport edges. | Popup items and focus remain visible and usable; text does not overlap or disappear off-screen. |

## File upload

Page: [File upload](../../demo/file-upload.html), Native form and default trigger.

| ID | Steps | Expected outcome |
|---|---|---|
| FILE-UPLOAD-K01 | Tab to Choose text attachments; press Enter; cancel the native chooser and check returned focus. Reopen, choose the synthetic text file, Tab to its remove button and activate it. | Chooser opens from the keyboard; cancellation retains usable focus; file selection/removal works; no mouse-only operation is required. |
| FILE-UPLOAD-AT01 | Read trigger/help text; add a file, cause a documented validation error and remove a file. | Filename, remove-button name, limits/error and status changes are understandable; updates are not duplicated or lost. |
| FILE-UPLOAD-V01 | Apply the visual conditions with a long filename and validation message. | Filename, error and remove action remain readable and focus is visible. |

## Input

Page: [Input](../../demo/input.html), a basic text field; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| INPUT-K01 | Tab into the field, type synthetic text, move the caret and Tab onward; separately exercise a clear-button variant. | Editing and Tab exit work; a configured clear control is keyboard reachable and preserves usable focus. Record which substeps ran. |
| INPUT-AT01 | Read a named required field with help/error text; enter invalid then valid content. | Name, type, required/invalid states and referenced description are understandable; correction updates exposed state. |
| INPUT-V01 | Apply the visual conditions with long label/help/error text and prefix/affix variants. | Text, caret, clear action and focus remain usable without overlap. |

## Pagination

Page: [Pagination](../../demo/pagination.html), Custom Style example.

| ID | Steps | Expected outcome |
|---|---|---|
| PAGINATION-K01 | Tab through page controls; activate the next/page-number controls; operate the page-size selector if shown; inspect first/last boundaries. | Current page updates; page size changes as documented; boundary controls do not navigate beyond the range; focus remains usable. |
| PAGINATION-AT01 | Find the navigation landmark; read current page and other destinations; change page and page size. | Navigation name, destination numbers, current-page state and disabled states are meaningful; updates are understandable. |
| PAGINATION-V01 | Apply the visual conditions with large page counts. | Current page and focus remain distinct; controls and ellipses remain legible and usable. |

## Radio group

Page: [Radio](../../demo/radio.html), a named group with a disabled option; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| RADIO-K01 | Tab to the selected option; press Right through the group and wrap; Tab onward. Repeat in RTL and record it separately. | A single option is checked; disabled options are skipped; one group Tab stop is used; horizontal behavior follows documented direction. |
| RADIO-AT01 | Read the group label, options and states; change selection using screen-reader interaction mode. | Group name, option names, selected state and disabled state are understandable. |
| RADIO-V01 | Apply the visual conditions with long option labels. | Labels wrap without obscuring selection or focus. |

## Rating

Page: [Rating](../../demo/rating.html), an interactive example; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| RATING-K01 | Tab to the current rating; press Right; Tab onward; separately inspect minimum/maximum and readonly variants. | Arrow selection changes the value; Tab leaves the group; limits and readonly behavior match the configured variant. |
| RATING-AT01 | Read the rating group and option names; change its value and inspect readonly output. | The group and numeric/star choices are understandable; selection is conveyed without relying on the star graphic. |
| RATING-V01 | Apply the visual conditions and contrast themes when available. | Selected/unselected stars and keyboard focus remain distinguishable. |

## Switch

Page: [Switch](../../demo/switch.html), Basic; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| SWITCH-K01 | Tab to the switch; press Space; Tab onward; separately attempt disabled activation. | State toggles once, Tab exits and a disabled switch cannot be changed. |
| SWITCH-AT01 | Read off/on and disabled variants; toggle with the screen reader. | Stable accessible name, switch role and on/off state are understandable. |
| SWITCH-V01 | Apply the visual conditions and contrast themes when available. | On/off state and focus remain distinguishable beyond color alone. |

## Tabs

Page: [Tabs](../../demo/tabs.html), a basic example; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| TABS-K01 | Tab from the preceding control; press Right, Home and End; Tab into the selected panel and onward. | Selection and displayed panel agree; Home/End reach the endpoints; only the active tab is a tab-list stop; focus can leave. A text-only panel may itself be a stop. |
| TABS-AT01 | Read the tab-list name, selected/unselected tabs and selected panel; switch tabs and explore content. | Roles, names and selection are understandable; the panel is associated with its tab; hidden panels do not confuse navigation. |
| TABS-V01 | Apply the visual conditions with long tab labels and badges. | Labels remain usable; selected state and keyboard focus are visually distinct and unclipped. |

## Textarea

Page: [Textarea](../../demo/textarea.html), a basic field; or controls fixture.

| ID | Steps | Expected outcome |
|---|---|---|
| TEXTAREA-K01 | Tab into the field; type two lines using Enter; move the caret; Tab onward. | Enter inserts a newline; editing works; Tab exits the field. |
| TEXTAREA-AT01 | Read a named required textarea with help/error text; edit multiple lines. | Multiline purpose, name and applicable states/descriptions are understandable; editing does not unexpectedly move focus. |
| TEXTAREA-V01 | Apply the visual conditions with long content and auto-resize enabled where offered. | Lines and caret remain reachable; growth does not obscure adjacent actions or focus. |

## Tree

Page: [Tree](../../demo/tree.html), a checkbox tree example.

| ID | Steps | Expected outcome |
|---|---|---|
| TREE-K01 | Tab into the tree; use Up/Down, Right/Left and Home/End; type a visible label prefix; toggle a checkbox and Tab onward. | Focus follows the documented tree model; expansion and selection remain distinct; type-ahead finds a node; Tab can leave. |
| TREE-AT01 | Explore parent/child nodes; expand/collapse; toggle a parent with partially selected children. | Node names, levels, expansion and checked/mixed/disabled states are understandable. |
| TREE-V01 | Apply the visual conditions with deep nesting and long labels. | Hierarchy, selected/checked states and keyboard focus remain readable and usable. |

## Forms and application integration

| ID | Steps | Expected outcome |
|---|---|---|
| FORM-K01 | In the controls fixture, edit Input/Textarea, toggle Switch, change Rating and activate the native Reset button with Enter. | Values return to their initial states; focus remains on Reset. This case does not test upload reset or framework model reset. |
| FORM-K02 | On [the application form](../../demo/form.html), submit invalid data; follow error-summary links; correct all required fields using synthetic values/files; submit again. | Errors identify the fields and focus reaches real controls; successful local output contains the named values/files. No real application is transmitted. |
| FORM-K03 | On a plain form with an explicit submit button, press Enter in an `au-input`; compare with an equivalent native input. | Record actual implicit-submission behavior. The current documented limitation is that `au-input` does not implicitly submit; do not record native-equivalent behavior as passing. |
| FORM-AT01 | Repeat invalid submission/correction with a screen reader. | Summary, field names, errors and successful outcome are perceivable without duplicate or missing announcements. |
| VUE-K01 | Use the [Vue integration fixture](../../test/ssr/README.md); edit fields bound with `v-model` and modifiers; update the model; reset using the application's model reset handler. | UI, model and native FormData agree in both directions; focus survives updates. Record Vue/Nuxt versions, fixture and modifier subcases. |
| REACT-K01 | Use the [React integration fixture](../../test/ssr/README.md); edit controlled/uncontrolled fields, reject a controlled value, update props and reset application state. | Documented value/checked/default semantics hold; event targets and FormData match; focus remains usable. Record React/Next versions and subcases. |
| FRAMEWORK-AT01 | In each framework separately, change translated labels/errors while focused and trigger an application validation update. | Name/state/error updates remain understandable and focus stays on a usable control. Record each framework as a separate execution. |

## Recording partial coverage

Use a subcase suffix when only part of a row ran, for example
`CHECKBOX-K01/basic` and `CHECKBOX-K01/disabled`. A pass for `/basic` does not
pass `/disabled`, the AT case, the visual case, another environment or the entire
component. If the fixture does not expose a requested state, prepare that variant
and identify it before executing the case; otherwise record `NOT RUN`.
