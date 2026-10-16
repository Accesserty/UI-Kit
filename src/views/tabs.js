// Shadow DOM markup and styles for au-tabs. Pure functions shared by the
// browser and server rendering. Tab buttons get sequential ids (tab-1, tab-2…)
// inside the shadow root; panels stay in the light DOM.
import { escapeHTML } from './escape.js';

export const DEFAULT_TAB_LABEL = 'Tab {index}';
export const DEFAULT_BADGE_LABEL_PREFIX = 'Additional information:';

export const tabsStyles = `
  :host([hidden]:not([hidden="until-found" i])) { display: none; }
  :host { display: block; min-width: 0; }
  .au-tabs { min-width: 0; }
  .au-tablist-item { flex-shrink: 0; max-width: 100%; }
  .label, .prefix, .badge, .affix { min-width: 0; overflow-wrap: anywhere; }
  .au-tablist {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    overflow: auto;
    max-width: 100%;
  }

  .au-tablist-item{
    &:first-of-type {
      [role="tab"] {
        border-top-left-radius: var(--au-tabs-border-radius, 0);
      }
    }
    &:last-of-type {
      [role="tab"] {
        border-right: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
        border-top-right-radius: var(--au-tabs-border-radius, 0);
      }
    }
  }

  button[role="tab"] {
    /* behavior */
    cursor: pointer;
    -webkit-tap-highlight-color: oklch(0 0 0 / 0);

    /* spacing */
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
    padding: var(--au-tabs-padding-vertical, 0.625rem) var(--au-tabs-padding-horizontal, 1rem);

    /* border */
    border-top: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
    border-left: var(--au-tabs-border-width, 1px) var(--au-tabs-border-style, solid) var(--au-tabs-border-color, oklch(0.55 0 0));
    border-right: 0;
    border-bottom: 0;

    /* text */
    color: var(--au-tabs-text-color, oklch(0.1398 0 0));
    font-size: var(--au-tabs-text-size, 1rem);
    font-family: var(--au-tabs-text-family, inherit);
    line-height: var(--au-tabs-text-line-height, 1.5);
    white-space: normal;
    box-sizing: border-box;
    max-width: 100%;
    min-width: 24px;
    min-height: 24px;

    /* background */
    background-color: var(--au-tabs-bg, oklch(0.9731 0 0));
    transition: background-color 120ms ease-in;

    &:hover {
      background-color: var(--au-tabs-hover-bg, oklch(0.9466 0 0));
    }

    &:active {
      background-color: var(--au-tabs-active-bg, oklch(0.8689 0 0));
    }

    &[aria-selected="true"] {
      text-decoration: underline;
      text-underline-offset: 0.2em;
      paint-order: stroke fill;
      -webkit-text-stroke: var(--au-tabs-selected-text-stroke-width, 0.5px) var(--au-tabs-selected-text-stroke-color, oklch(0.994 0 0));
      box-shadow: inset 0 0 0 var(--au-tabs-selected-shadow-width, 1px) var(--au-tabs-selected-shadow-color, oklch(0.55 0 0));
      background-color: var(--au-tabs-selected-bg, oklch(0.1398 0 0));
      color: var(--au-tabs-selected-text-color, oklch(0.994 0 0));
    }

    /* focusd */
    &:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
    }
  }

  button[aria-selected="true"]:focus-visible {
    box-shadow: inset 0 0 0 var(--au-tabs-focus-shadow-width, 3px) var(--au-tabs-selected-focus-shadow-color, white);
  }
  @media (prefers-reduced-motion: reduce) {
    button[role="tab"] { transition: none; }
  }
  @media (forced-colors: active) {
    button[aria-selected="true"] { border-bottom: 3px solid ButtonText; }
    button[role="tab"]:focus-visible { outline: 2px solid Highlight; outline-offset: -4px; }
  }
  .au-tablist:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
  .au-tabpanels {
    border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
  }

  .au-tab-panel {
    padding: var(--au-tab-panel-padding-vertical, 0.625rem) var(--au-tab-panel-padding-horizontal, 1rem);
  }

  .badge {
    background-color: var(--au-tab-badge-bg, oklch(0.8689 0 0));
    color: var(--au-tab-badge-text-color, oklch(0.1398 0 0));
    padding: var(--au-tab-badge-padding-vertical, 0) var(--au-tab-badge-padding-horizontal, 0.625rem);
    border-radius: var(--au-tab-badge-border-radius, 0.75rem);
  }

   ::slotted(.au-tab-panel) {
    box-sizing: border-box;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: var(--au-tab-panel-padding-vertical, 0.75rem) var(--au-tab-panel-padding-horizontal, 1rem);
    display: none;
    border: var(--au-tabpanels-border-width, 1px) var(--au-tabpanels-border-style, solid) var(--au-tabpanels-border-color, oklch(0.55 0 0));
  }

  ::slotted(.au-tab-panel[aria-hidden="false"]) {
    display: block;
  }
  ::slotted(.au-tab-panel:focus-visible) {
    outline: 2px solid var(--au-tabs-focus-shadow-color, oklch(0.45 0.15 260));
    outline-offset: -2px;
  }
  @media (forced-colors: active) {
    ::slotted(.au-tab-panel:focus-visible) { outline-color: Highlight; }
  }
`;

/** Label for the tab at `index` (0-based): the panel's label or the template. */
export function tabLabel(label, template, index) {
  return label || String(template || DEFAULT_TAB_LABEL).replaceAll('{index}', String(index + 1));
}

/** Inner markup of a tab button. */
export function renderTabContent({ label, lang, prefix, badge, affix }, badgeLabelPrefix = DEFAULT_BADGE_LABEL_PREFIX) {
  let html = '';
  if (prefix) html += `<span class="prefix">${escapeHTML(prefix)}</span>`;
  if (label) html += `<span class="label"${lang ? ` lang="${escapeHTML(lang)}"` : ''}>${escapeHTML(label)}</span>`;
  if (badge) html += `<span class="badge" aria-label="${escapeHTML(`${badgeLabelPrefix} ${badge}`)}">${escapeHTML(badge)}</span>`;
  if (affix) html += `<span class="affix">${escapeHTML(affix)}</span>`;
  return html;
}

/** One tab: list item and button. */
export function renderTab(tab, { id, selected = false, badgeLabelPrefix } = {}) {
  return `<li role="presentation" class="au-tablist-item${selected ? ' au-tablist-item--selected' : ''}">`
    + `<button type="button" role="tab" id="${id}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}">${renderTabContent(tab, badgeLabelPrefix)}</button></li>`;
}

/**
 * @param {{ label?: string, tabs?: object[], selectedIndex?: number, selectedChild?: number, badgeLabelPrefix?: string }} [state]
 * `selectedChild` (1-based position among the host's element children) adds a
 * rule that shows the selected panel before the component script runs; the
 * component removes it when it takes over.
 */
export function renderTabs({ label, tabs = [], selectedIndex = 0, selectedChild, badgeLabelPrefix } = {}) {
  const items = tabs.map((tab, index) => renderTab(tab, { id: `tab-${index + 1}`, selected: index === selectedIndex, badgeLabelPrefix })).join('');
  const preselect = selectedChild
    ? `<style data-preselect>::slotted(.au-tab-panel:nth-child(${selectedChild})) { display: block; }</style>`
    : '';
  return `<div class="au-tabs"><style>${tabsStyles}</style>${preselect}`
    + `<ul role="tablist" class="au-tablist" tabindex="-1" aria-orientation="horizontal"${label ? ` aria-label="${escapeHTML(label)}"` : ''}>${items}</ul>`
    + `<slot name="panel"></slot></div>`;
}
