# Accessibility

This statement covers the Accesserty UI Kit components, demos and documentation
in this repository. It describes what the kit aims for, what has actually been
tested, what is known not to work, and how to report a barrier.

Last reviewed: 23 November 2026, for UI Kit 3.0.3.

## What the kit aims for

The kit exists so that common interface patterns do not have to rebuild the same
semantics, keyboard interaction and focus handling in every project.

- **HTML first.** Use native HTML where it already works well. The kit adds a
  component only when it avoids repeated accessibility mistakes that native
  elements do not prevent. Button, select, dialog, popover and details stay
  native elements with optional styles.
- **WCAG 2.2 level AA is the design target.** It is a target, not a conformance
  claim. No independent evaluation of the kit has been made.
- **Components are one part of a page.** Using the kit does not make a website
  accessible. Your names, content, headings, page structure, themes, error
  handling and user flows decide most of the result. Test them in your own
  application.

## Report a barrier

Tell us when a component, demo or document is hard or impossible to use. You do
not need to tell us about any disability, and screenshots or recordings are
optional.

- **GitHub:** [open an issue](https://github.com/Accesserty/UI-Kit/issues/new).
  If you can, add the `accessibility` label.
- **Without GitHub:** email service@accesserty.com or use the
  [contact form](https://accesserty.com/en/contact/).

These details help, but send what you have:

- the component and, if possible, the demo page or a small code example;
- what you tried to do and what happened instead;
- the browser, operating system and any assistive technology or setting you use,
  such as a screen reader, zoom, voice control or a high-contrast theme;
- the UI Kit version (`package.json`, or the release you downloaded).

## What happens next

1. We aim to acknowledge reports within 5 business days.
2. We reproduce the problem and record it as a GitHub issue with the
   `accessibility` label. A report sent by email is copied to an issue without
   your name or contact details, unless you ask us to credit you.
3. We prioritize by impact. A barrier that blocks a task, such as a control that
   cannot be reached or operated by keyboard or a state that assistive
   technology cannot perceive, comes before a cosmetic problem.
4. The fix ships in a release, and the release notes name the issue. If there is
   no fix yet, the problem is listed under [Known limitations](#known-limitations)
   with any workaround.

## Tested environments

Each row describes what was actually exercised. A result applies only to the
listed version, environment and scenario. Do not read the table as support for
every component in every combination.

| Method | Environment | Scope |
|---|---|---|
| Automated unit tests | Chromium, in CI (GitHub Actions and GitLab CI) | All 15 component source files: semantics, keyboard, focus, form and event contracts |
| Automated browser tests | Chrome, Firefox and Safari on macOS | Targeted keyboard and focus flows, standalone files and bundles, over HTTP and from local files |
| Framework fixtures | Nuxt 4, Vue with Vite, Next.js 16 with React 19 | Every component type renders; selected bindings, server rendering and hydration |
| Screen reader | Safari with VoiceOver on macOS, UI Kit 3.0.2, October 2026 | Only the [registration form case](demo/form-registration.html): names, required and invalid states, error summary, status messages |
| Agent-operated keyboard checks | Chrome 156 on macOS, UI Kit 3.0.2 | Selected cases recorded in [29 October 2026 results](docs/accessibility/results/2026-10-29.md) |

**Not yet tested:**

- NVDA and JAWS on Windows, VoiceOver on iOS, TalkBack on Android
- Screen-reader output for any component outside the registration form case
- Edge, and actual operating-system high-contrast modes (forced colors has been
  checked only with browser emulation)
- Voice control, switch access and other input methods
- Testing with disabled people

The [test procedures](docs/accessibility/manual-test-plan.md) list the planned
cases. Their environments are plans, not results.

## Known limitations

- **A description is read twice in Safari with VoiceOver** for `au-textarea` and
  `au-checkbox`. The component host keeps the `aria-describedby` and
  `aria-invalid` you set, so the host is also exposed with the same description.
  A fix changes the API and is being evaluated for a later minor release. See
  [Accessibility presentation of form controls](llms.txt).
- **Full-width email input fails validation without a hint.** An address typed
  in full-width characters with an East Asian input method fails the native
  email check, and the browser message does not suggest half-width characters.
  Workaround: add your own error message that mentions half-width input.
- **Most components need JavaScript.** Servers can render tags and initial
  values, but only Accordion, Tabs and Breadcrumbs also receive server-rendered
  Shadow DOM. Other components have no styles or behavior until the script
  loads. See [Reserving space before registration](README.md#reserving-space-before-registration).
- **Dropdown without the Popover API** expands inline. Keyboard access and
  actions still work, but the menu does not escape clipping containers.
- **Older browser engines** without element-reference properties get plain-text
  label fallbacks instead of the full accessible-name calculation. Give
  rich labels an explicit, localized `aria-label` there.
- **Default colors target light backgrounds.** Dark or custom themes need their
  own contrast and focus-visibility checks.
- **Text is not translated for you.** Labels, status messages and errors come
  from your attributes, slots and content. See [Localization](README.md#localization).

## Contributor expectations

These apply to people and coding agents alike.

- Follow the [accessibility requirements](CONTRIBUTING.md#accessibility-requirements)
  and keep the complete unit-test suite passing.
- Prefer a native element. Explain why a new component is needed before adding
  one.
- Report what was actually checked, with the browser and assistive technology
  used. An accessibility tree, a screenshot or an automated pass is not evidence
  of screen-reader speech.
- Do not add "accessible" badges or WCAG conformance claims to components, demos
  or release notes.

## Ownership and feedback on this statement

Accesserty maintains the kit and this statement, and reviews it with each minor
release. To suggest a change, open an issue or a pull request against this file,
or use the contact options above.
