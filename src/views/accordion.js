// Shadow DOM markup and styles for au-accordion and au-accordion-item.
// Pure functions with no DOM access: the browser builds shadow roots from them
// and server rendering emits the same markup as declarative shadow roots.
// Ids are fixed: each shadow root is its own id scope.
import { escapeHTML } from './escape.js';

export const DEFAULT_EXCLUSIVE_HINT = 'Only one section may be expanded at a time.';

const VISUALLY_HIDDEN = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;';

export const accordionStyles = `:host([hidden]:not([hidden="until-found" i])) { display: none; }`;

/** @param { exclusive?: boolean, hint?: string } [state] */
export function renderAccordion({ exclusive = false, hint = DEFAULT_EXCLUSIVE_HINT } = {}) {
  return `<style>${accordionStyles}</style>`
    + `<span id="hint" style="${VISUALLY_HIDDEN}"${exclusive ? '' : ' hidden'}>${exclusive ? escapeHTML(hint) : ''}</span>`
    + `<div class="au-accordion"${exclusive ? ' aria-describedby="hint"' : ''}><slot></slot></div>`;
}

export const accordionItemStyles = `
  :host([hidden]:not([hidden="until-found" i])) { display: none; }
      .au-accordion-item {
        box-sizing: border-box;
        margin-bottom: var(--au-accordion-item-margin-bottom, 1rem);
      }
      :host {
        display: block;
        max-width: 100%;
        min-width: 0;
      }
      [role="heading"] { margin: 0; }
      button {
        /* behavior */
        cursor: pointer;
        -webkit-tap-highlight-color: oklch(0 0 0 / 0);
        box-sizing: border-box;

        /* spacing */
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        word-break: break-word;
        width: 100%;
        text-align: start;
        min-height: 24px;
        padding: var(--au-accordion-heading-padding-vertical, 0.625rem) var(--au-accordion-heading-padding-horizontal, 1rem);

        /* text */
        color: var(--au-accordion-heading-text-color, oklch(0.1398 0 0));
        font-size: var(--au-accordion-heading-text-size, 1rem);
        font-family: var(--au-accordion-heading-text-family, inherit);
        line-height: var(--au-accordion-heading-text-line-height, 1.5);

        /* border */
        border: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
        border-radius: var(--au-accordion-heading-border-radius, 0);

        /* others decoration */
        background-color: var(--au-accordion-heading-bg, oklch(0.994 0 0));
        transition: background-color 160ms ease-in;

        .heading {
          min-width: 0;
          flex: 1 1 0;
          max-width: 100%;
          overflow-wrap: break-word;
          overflow-wrap: anywhere;
          word-break: break-word;

          slot,
          ::slotted(*),
          * {
            display: block;
            width: 100%;
          }
        }

        .info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 0 0 auto;
          min-width: 0;
          max-width: min(50%, var(--au-accordion-info-max-width, 12rem));
          & > *:first-child  {
            flex: 1;
            min-width: 20px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;

            slot,
            ::slotted(*),
            * {
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              display: block;
              width: 100%;
            }
          }
        }

        .icon {
          transition: transform 300ms ease-in;
          display: flex;
          align-items: center;
          flex: 0 0 auto;
        }

        &[aria-expanded="true"] {
          .icon {
            transform: rotate3d(0, 0, 1, 180deg);
            transform-origin: center;
          }
        }

        &:hover {
          background-color: var(--au-accordion-heading-hover-bg, oklch(0.9466 0 0));
          border-color: var(--au-accordion-heading-hover-border-color, oklch(0.55 0 0));
        }

        &:active {
          background-color: var(--au-accordion-heading-active-bg, oklch(0.8689 0 0));
          border-color: var(--au-accordion-heading-active-border-color, oklch(0.55 0 0));
        }

        &:focus-visible {
          outline: var(--au-accordion-heading-focus-shadow-width, 3px) solid var(--au-accordion-heading-focus-shadow-color, oklch(0.4 0 0));
          outline-offset: -3px;
        }
      }

      .region {
        overflow-wrap: anywhere;
        background-color: var(--au-accordion-content-bg, oklch(0.9731 0 0));
        color: var(--au-accordion-content-text-color, oklch(0.1398 0 0));
        padding: var(--au-accordion-content-padding-top, 1rem)  var(--au-accordion-content-padding-right, 1rem)  var(--au-accordion-content-padding-bottom, 1rem)  var(--au-accordion-content-padding-left, 1rem);
        overscroll-behavior: var(--au-accordion-content-overscroll-behavior, auto);
        border-left: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
        border-right: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
        border-bottom: var(--au-accordion-heading-border-width, 1px) var(--au-accordion-heading-border-style, solid) var(--au-accordion-heading-border-color, oklch(0.55 0 0));
        border-radius: var(--au-accordion-content-border-radius, 0);
        &[hidden]:not([hidden="until-found" i]) {
          display: none !important;
        }
        /* Collapsed but searchable: find-in-page and fragment links can reveal it.
           Zero the box so no padded strip shows, even under ::part() overrides. */
        &[hidden="until-found" i] {
          content-visibility: hidden;
          padding-block: 0 !important;
          border-bottom-width: 0 !important;
        }
      }
      .exclusive-hint { position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }
      @media (forced-colors: active) { button:focus-visible { outline: 2px solid Highlight; outline-offset:-2px; } }
      @media (prefers-reduced-motion: reduce) { button, button .icon { transition: none; } }
`;

/**
 * @param {{ open?: boolean, headingLevel?: number, region?: boolean, hint?: string }} [state]
 * `hint` is the group's exclusive instruction, or empty when the group is not exclusive.
 */
export function renderAccordionItem({ open = false, headingLevel = 3, region = true, hint = '' } = {}) {
  const level = Number.isInteger(headingLevel) && headingLevel >= 1 && headingLevel <= 6 ? headingLevel : 3;
  return `<div class="au-accordion-item"><style>${accordionItemStyles}</style>`
    + `<div role="heading" aria-level="${level}">`
    + `<button type="button" id="title" aria-expanded="${open}" aria-controls="region" part="button"${hint ? ' aria-describedby="hint"' : ''}>`
    + `<div class="heading"><slot name="heading"></slot></div>`
    + `<div class="info"><div><slot name="sub"></slot></div><div class="icon" aria-hidden="true"><slot name="icon"></slot></div></div>`
    + `</button></div>`
    + `<span class="exclusive-hint" id="hint">${escapeHTML(hint)}</span>`
    + `<div class="region"${region ? ' role="region" aria-labelledby="title"' : ''} id="region"${open ? '' : ' hidden="until-found"'} part="region"><slot name="content"></slot></div>`
    + `</div>`;
}
