# Accessibility testing

This directory contains repeatable manual procedures and published results for
Accesserty UI Kit. It covers plain HTML, Vue/Nuxt and React 19/Next.js. Angular
is outside this test plan.

## Start here

- [Test procedures](manual-test-plan.md): keyboard, assistive-technology and visual
  checks for all 15 component types, plus forms and framework integration.
- [Record template](record-template.md): copy for each environment and test run.
- [29 October 2026 results](results/2026-10-29.md): scoped agent-operated UI
  observations, automated checks and untested areas.

## What counts as evidence

Record the exact kit version, an available source revision, tested bundle hash, operating
system, browser and assistive-technology versions. A result applies only to the
scenario and environment actually exercised. Attach steps, expected behavior,
observed behavior and supporting screenshots or transcripts where available.
For published results, use repository-relative fixture paths and selected evidence
that contains no personal information or local machine paths. Public summaries
retain failures, untested areas and the operator/method; editing for publication
must not turn partial coverage into a component-wide pass.

Keep these methods separate:

| Method | What it establishes |
|---|---|
| Human-operated UI | A named person's observations of the recorded interaction |
| Agent-operated UI | The agent's step-by-step keyboard/pointer actions and visible or accessibility-tree observations |
| Automated browser test | The assertions executed by the named script |
| Screen-reader session | Actual navigation/output observed using the named screen reader; record who listened or inspected its output and how |

An accessibility tree shows exposed semantics, not what a screen reader actually
announces. A screenshot shows one visual state, not every interaction or measured
contrast. Automated emulation of reduced motion or forced colors must be labelled
as emulation, rather than an actual operating-system configuration.

## Result vocabulary

- `PASS`: every expected outcome of this case was observed in this environment.
- `FAIL`: an expected outcome was not met; include reproduction steps and impact.
- `NOT RUN`: not attempted. Never infer a pass from source code or another suite.
- `BLOCKED`: attempted or assessed, but the required environment/output is not
  available; describe what is missing.
- `N/A`: inapplicable to this specific variant, with a reason.

Do not use a component-wide “accessible” badge or infer WCAG conformance from
these records. Do not copy passes across browsers, framework versions, themes,
variants or later releases. Keep past records; add a new run after fixes.

## Suggested release coverage

Exercise keyboard and visual cases in Chrome, Firefox and Safari. Record actual
versions and keyboard settings. For screen-reader coverage, plan separate runs
with VoiceOver/Safari on macOS, NVDA/Firefox and JAWS/Chrome on Windows, and
VoiceOver/Safari on iOS and TalkBack/Chrome on Android where mobile use is in scope.
These are planned environments, not claims that the kit has passed them.

Use the ordinary screen-reader navigation mode as well as keyboard interaction
mode. Record Quick Nav, browse/focus mode, verbosity, language and other settings
that affect the result. Compare meaning, focus and state; do not require identical
word order across screen readers.

Before release, review every `FAIL`, `BLOCKED` and `NOT RUN` result and document
the release decision. Running a script or generating a checklist does not
complete the remaining checks.
