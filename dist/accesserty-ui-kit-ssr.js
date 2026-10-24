/*! Accesserty UI Kit v3.0.2 */
// Text and attribute escaping for markup rendered on the server and in the browser.
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

// Shadow DOM markup and styles for au-accordion and au-accordion-item.
// Pure functions with no DOM access: the browser builds shadow roots from them
// and server rendering emits the same markup as declarative shadow roots.
// Ids are fixed: each shadow root is its own id scope.

const DEFAULT_EXCLUSIVE_HINT = 'Only one section may be expanded at a time.';

const VISUALLY_HIDDEN = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;padding:0;';

const accordionStyles = `:host([hidden]:not([hidden="until-found" i])) { display: none; }`;

/** @param { exclusive?: boolean, hint?: string } [state] */
function renderAccordion({ exclusive = false, hint = DEFAULT_EXCLUSIVE_HINT } = {}) {
  return `<style>${accordionStyles}</style>`
    + `<span id="hint" style="${VISUALLY_HIDDEN}"${exclusive ? '' : ' hidden'}>${exclusive ? escapeHTML(hint) : ''}</span>`
    + `<div class="au-accordion"${exclusive ? ' aria-describedby="hint"' : ''}><slot></slot></div>`;
}

const accordionItemStyles = `
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
function renderAccordionItem({ open = false, headingLevel = 3, region = true, hint = '' } = {}) {
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

// Shadow DOM markup and styles for au-tabs. Pure functions shared by the
// browser and server rendering. Tab buttons get sequential ids (tab-1, tab-2…)
// inside the shadow root; panels stay in the light DOM.

const DEFAULT_TAB_LABEL = 'Tab {index}';
const DEFAULT_BADGE_LABEL_PREFIX = 'Additional information:';

const tabsStyles = `
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
function tabLabel(label, template, index) {
  return label || String(template || DEFAULT_TAB_LABEL).replaceAll('{index}', String(index + 1));
}

/** Inner markup of a tab button. */
function renderTabContent({ label, lang, prefix, badge, affix }, badgeLabelPrefix = DEFAULT_BADGE_LABEL_PREFIX) {
  let html = '';
  if (prefix) html += `<span class="prefix">${escapeHTML(prefix)}</span>`;
  if (label) html += `<span class="label"${lang ? ` lang="${escapeHTML(lang)}"` : ''}>${escapeHTML(label)}</span>`;
  if (badge) html += `<span class="badge" aria-label="${escapeHTML(`${badgeLabelPrefix} ${badge}`)}">${escapeHTML(badge)}</span>`;
  if (affix) html += `<span class="affix">${escapeHTML(affix)}</span>`;
  return html;
}

/** One tab: list item and button. */
function renderTab(tab, { id, selected = false, badgeLabelPrefix } = {}) {
  return `<li role="presentation" class="au-tablist-item${selected ? ' au-tablist-item--selected' : ''}">`
    + `<button type="button" role="tab" id="${id}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}">${renderTabContent(tab, badgeLabelPrefix)}</button></li>`;
}

/**
 * @param {{ label?: string, tabs?: object[], selectedIndex?: number, selectedChild?: number, badgeLabelPrefix?: string }} [state]
 * `selectedChild` (1-based position among the host's element children) adds a
 * rule that shows the selected panel before the component script runs; the
 * component removes it when it takes over.
 */
function renderTabs({ label, tabs = [], selectedIndex = 0, selectedChild, badgeLabelPrefix } = {}) {
  const items = tabs.map((tab, index) => renderTab(tab, { id: `tab-${index + 1}`, selected: index === selectedIndex, badgeLabelPrefix })).join('');
  const preselect = selectedChild
    ? `<style data-preselect>::slotted(.au-tab-panel:nth-child(${selectedChild})) { display: block; }</style>`
    : '';
  return `<div class="au-tabs"><style>${tabsStyles}</style>${preselect}`
    + `<ul role="tablist" class="au-tablist" tabindex="-1" aria-orientation="horizontal"${label ? ` aria-label="${escapeHTML(label)}"` : ''}>${items}</ul>`
    + `<slot name="panel"></slot></div>`;
}

// Shadow DOM markup and styles for au-breadcrumbs. Pure functions shared by
// the browser and server rendering.

const DEFAULT_LABEL = 'Breadcrumbs';
const DEFAULT_SEPARATOR = '/';
const DEFAULT_LINK_TITLE_PREFIX = 'go to';

const breadcrumbsStyles = `
  :host([hidden]:not([hidden="until-found" i])) { display: none; }
    nav {
      background-color: var(--au-breadcrumbs-bg, transparent);
      overflow-x: auto;
      overflow-y: hidden;
      white-space: normal;
      &:focus-visible {
        outline: 2px solid var(--au-breadcrumbs-focus-shadow-color, oklch(0.45 0.15 260));
        outline-offset: -2px;
      }
      ol {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        li {
          font-size: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          >span.item {
            display: inline-block;
            box-sizing: border-box;
            max-width: 100%;
            padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
            font-size: var(--au-breadcrumbs-text-size, 1rem);
            color: var(--au-breadcrumbs-link-currentpage-color, oklch(0.1398 0 0));
          }
          >span[aria-hidden="true"] { font-size: var(--au-breadcrumbs-text-size, 1rem); }
          &:last-child {
            a {
              text-decoration: none;
            }
            >span {
              padding-left: var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
              font-size: var(--au-breadcrumbs-text-size, 1rem);
              color: var(--au-breadcrumbs-link-currentpage-color, oklch(0.1398 0 0));
            }
          }
          a {
            display: inline-block;
            box-sizing: border-box;
            max-width: 100%;
            padding: var(--au-breadcrumbs-link-padding-vertical, 0.375rem) var(--au-breadcrumbs-link-padding-horizontal, 0.625rem);
            font-size: var(--au-breadcrumbs-text-size, 1rem);
            text-decoration: var(--au-breadcrumbs-text-deco, underline);
            color: var(--au-breadcrumbs-link-color, oklch(0.429 0.2972777928415759 264.05202063805507));
            -webkit-tap-highlight-color: oklch(0 0 0 / 0);
            &:hover {
              text-decoration: underline;
            }
            &:active {
              opacity: 1;
            }
            &:visited {
              color: var(--au-breadcrumbs-link-visited-color, oklch(0.3748 0.167 303.51));
            }
            &:focus-visible {
              outline: none;
              box-shadow: inset 0 0 0 var(--au-breadcrumbs-focus-shadow-width, 3px) var(--au-breadcrumbs-focus-shadow-color, oklch(0.45 0.15 260));
              /* Forced colours drop box-shadow. Nested here so it outranks the
                 outline: none above; a top-level a:focus-visible would not. */
              @media (forced-colors: active) {
                outline: 2px solid Highlight;
                outline-offset: -2px;
              }
            }
            &+span {
              font-size: var(--au-breadcrumbs-text-size, 1rem);
            }
          }
        }
      }
    }
    @media (forced-colors: active) {
      nav:focus-visible {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }
    }
`;

/** The `items` attribute: a JSON array of objects with `text` (and `url`). */
function parseItems(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(item => item && typeof item === 'object' && !Array.isArray(item) && 'text' in item)
      : [];
  } catch {
    return [];
  }
}

/** Link title from `data-link-title-template` or `data-link-title-prefix`. */
function linkTitle(text, index, { template, prefix } = {}) {
  return template
    ? template.replaceAll('{text}', String(text ?? '')).replaceAll('{index}', String(index + 1))
    : `${prefix || DEFAULT_LINK_TITLE_PREFIX} ${text ?? ''}`;
}

/**
 * @param {{ id?: string, className?: string, label?: string, separator?: string,
 *   items?: {{ text: string, href?: string|null, title?: string }}[] }} [state]
 * The last item is the current page; items without an href render as text.
 */
function renderBreadcrumbs({ id, className, label, separator = DEFAULT_SEPARATOR, items = [] } = {}) {
  const list = items.map((item, index) => {
    const current = index === items.length - 1;
    const content = `<slot name="icon-${index + 1}"></slot><span>${escapeHTML(item.text ?? '')}</span>`;
    const link = !current && item.href
      ? `<a class="item" href="${escapeHTML(item.href)}" title="${escapeHTML(item.title ?? '')}">${content}</a>`
      : `<span class="item"${current ? ' aria-current="page"' : ''}>${content}</span>`;
    return `<li>${link}${current ? '' : `<span aria-hidden="true">${escapeHTML(separator)}</span>`}</li>`;
  }).join('');
  const attrs = (id ? ` id="${escapeHTML(id)}"` : '') + (className ? ` class="${escapeHTML(className)}"` : '')
    + (label ? ` aria-label="${escapeHTML(label)}"` : '');
  return `<style>${breadcrumbsStyles}</style><nav tabindex="-1"${attrs}><ol>${list}</ol></nav>`;
}

// Server-side insertion of declarative shadow roots.
//
// Frameworks render `<au-*>` tags but cannot render their Shadow DOM: a
// `<template shadowrootmode>` inside a Vue or React template breaks hydration.
// So the finished HTML is post-processed instead: after each supported start
// tag, the component's shadow root is inserted as a declarative template, from
// the same render functions the browser uses.
//
// The scanner handles the well-formed HTML that server renderers produce:
// start/end tags with quoted or unquoted attributes, void elements, comments,
// and raw text in script, style, textarea and title. It does not repair
// unbalanced markup.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);
const TEMPLATE_PREFIX = '<template shadowrootmode';

const integer = value => (value == null || value === '' ? undefined : Number(value));

function renderTabsHost({ attrs, children }) {
  const panels = children.filter(child => child.attrs.slot === 'panel' && /(^|\s)au-tab-panel(\s|$)/.test(child.attrs.class || ''));
  if (!panels.length) return renderTabs({ label: attrs['aria-label'] });
  const requested = integer(attrs['selected-index']);
  const selectedIndex = Number.isInteger(requested) && requested >= 0 ? Math.min(requested, panels.length - 1) : 0;
  return renderTabs({
    label: attrs['aria-label'],
    selectedIndex,
    selectedChild: children.indexOf(panels[selectedIndex]) + 1,
    badgeLabelPrefix: attrs['data-text-badge-label-prefix'] || DEFAULT_BADGE_LABEL_PREFIX,
    tabs: panels.map((panel, index) => ({
      label: tabLabel(panel.attrs.label, attrs['data-text-tab'], index),
      lang: panel.attrs['label-lang'] || attrs['data-text-tab-lang'] || '',
      prefix: panel.attrs['data-prefix'],
      badge: panel.attrs['data-badge'],
      affix: panel.attrs['data-affix'],
    })),
  });
}
renderTabsHost.needsChildren = true;

// Links the browser component would also follow: relative or http(s). Others
// (javascript:, data:, file:…) render as text; the component resolves the kept
// links against the page when it adopts the root.
function safeHref(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    return ['http:', 'https:'].includes(new URL(value, 'https://base.invalid/').protocol) ? value : null;
  } catch {
    return null;
  }
}

function renderBreadcrumbsHost({ attrs }) {
  const titles = { template: attrs['data-link-title-template'], prefix: attrs['data-link-title-prefix'] };
  return renderBreadcrumbs({
    id: attrs.id,
    className: attrs.class,
    label: attrs['aria-label']?.trim() || attrs.label?.trim() || DEFAULT_LABEL,
    separator: attrs.separator || DEFAULT_SEPARATOR,
    items: parseItems(attrs.items).map((item, index) => ({
      text: item.text,
      href: safeHref(item.url),
      title: linkTitle(item.text, index, titles),
    })),
  });
}

// Renderers receive the element's attributes, its parent's and, when they ask
// for them, its child elements.
const renderers = {
  'au-breadcrumbs': renderBreadcrumbsHost,
  'au-tabs': renderTabsHost,
  'au-accordion': ({ attrs }) => renderAccordion({
    exclusive: 'exclusive' in attrs,
    hint: attrs['data-text-exclusive-hint'] || DEFAULT_EXCLUSIVE_HINT,
  }),
  'au-accordion-item': ({ attrs, parent }) => renderAccordionItem({
    open: 'open' in attrs,
    headingLevel: integer(attrs['heading-level']),
    region: !('no-region' in attrs),
    hint: parent?.name === 'au-accordion' && 'exclusive' in parent.attrs
      ? parent.attrs['data-text-exclusive-hint'] || DEFAULT_EXCLUSIVE_HINT
      : '',
  }),
};

const supportedElements = Object.freeze(Object.keys(renderers));

const decode = value => value
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function parseAttributes(source) {
  const attrs = {};
  const pattern = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

/**
 * Incremental injector for streamed HTML. `push()` returns the output that is
 * safe to send so far; a tag split across chunks is held back until complete.
 */
function createInjector() {
  let pending = '';
  let rawText = null;           // name of the raw-text element being skipped
  const stack = [];             // open elements: { name, attrs }

  function scan(final) {
    let out = '';
    let i = 0;
    while (i < pending.length) {
      if (rawText) {
        const close = pending.toLowerCase().indexOf(`</${rawText}`, i);
        if (close < 0) {
          if (!final) { const keep = Math.max(i, pending.length - rawText.length - 2); out += pending.slice(i, keep); i = keep; break; }
          out += pending.slice(i); i = pending.length; break;
        }
        out += pending.slice(i, close); i = close; rawText = null;
        continue;
      }
      const lt = pending.indexOf('<', i);
      if (lt < 0) { out += pending.slice(i); i = pending.length; break; }
      out += pending.slice(i, lt); i = lt;
      if (pending.startsWith('<!--', i)) {
        const end = pending.indexOf('-->', i + 4);
        if (end < 0) { if (final) { out += pending.slice(i); i = pending.length; } break; }
        out += pending.slice(i, end + 3); i = end + 3; continue;
      }
      const gt = findTagEnd(pending, i);
      if (gt < 0) { if (final) { out += pending.slice(i); i = pending.length; } break; }
      const tag = pending.slice(i, gt + 1);
      const end = /^<\/([a-zA-Z][^\s/>]*)/.exec(tag);
      if (end) {
        out += tag; i = gt + 1;
        const name = end[1].toLowerCase();
        const index = stack.map(entry => entry.name).lastIndexOf(name);
        if (index >= 0) stack.length = index;
        continue;
      }
      const start = /^<([a-zA-Z][^\s/>]*)([\s\S]*?)(\/?)>$/.exec(tag);
      if (!start) { out += tag; i = gt + 1; continue; }   // <!doctype>, <?…>
      const name = start[1].toLowerCase();
      const render = renderers[name];
      const following = pending.slice(gt + 1, gt + 1 + TEMPLATE_PREFIX.length + 16).trimStart().toLowerCase();
      // Hold the start tag until enough follows to see whether a template is already there.
      if (render && !final && following.length < TEMPLATE_PREFIX.length) break;
      // Renderers that need the child elements wait for the end tag.
      const children = render?.needsChildren ? childElements(pending, gt + 1, name) : null;
      if (children && !children.complete && !final) break;
      out += tag; i = gt + 1;
      const attrs = parseAttributes(start[2]);
      const parent = stack.at(-1);
      if (!VOID.has(name) && !start[3]) stack.push({ name, attrs });
      if (RAW_TEXT.has(name)) { rawText = name; continue; }
      // A host that already has a declarative root (a repeated pass) is left alone.
      if (render && !following.startsWith(TEMPLATE_PREFIX)) {
        out += `<template shadowrootmode="open">${render({ name, attrs, parent, children: children?.list ?? [] })}</template>`;
      }
    }
    pending = pending.slice(i);
    return out;
  }

  return {
    push(chunk) { pending += chunk; return scan(false); },
    flush() { const out = scan(true); pending = ''; return out; },
  };
}

// Direct child elements of the element whose start tag ends before `from`.
function childElements(source, from, hostName) {
  const list = [];
  let depth = 0;
  let i = from;
  while (i < source.length) {
    const lt = source.indexOf('<', i);
    if (lt < 0) break;
    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt + 4);
      if (end < 0) break;
      i = end + 3; continue;
    }
    const gt = findTagEnd(source, lt);
    if (gt < 0) break;
    const tag = source.slice(lt, gt + 1);
    i = gt + 1;
    const end = /^<\/([a-zA-Z][^\s/>]*)/.exec(tag);
    if (end) {
      if (depth === 0 && end[1].toLowerCase() === hostName) return { list, complete: true };
      depth = Math.max(0, depth - 1);
      continue;
    }
    const start = /^<([a-zA-Z][^\s/>]*)([\s\S]*?)(\/?)>$/.exec(tag);
    if (!start) continue;
    const name = start[1].toLowerCase();
    if (depth === 0) list.push({ name, attrs: parseAttributes(start[2]) });
    if (RAW_TEXT.has(name)) {
      const close = source.toLowerCase().indexOf(`</${name}`, i);
      if (close < 0) break;
      i = close; depth++; continue;
    }
    if (!VOID.has(name) && !start[3]) depth++;
  }
  return { list, complete: false };
}

function findTagEnd(source, from) {
  let quote = null;
  for (let i = from + 1; i < source.length; i++) {
    const c = source[i];
    if (quote) { if (c === quote) quote = null; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '>') return i;
  }
  return -1;
}

/** Inserts declarative shadow roots into a complete HTML string. */
function injectDeclarativeShadow(html) {
  const injector = createInjector();
  return injector.push(html) + injector.flush();
}

/**
 * Wraps a Node request handler (such as Next.js `app.getRequestHandler()` in a
 * custom server) so HTML responses get declarative shadow roots as they stream.
 * The response is left uncompressed: the transform must see the HTML, so put
 * compression after it (a reverse proxy, or your own compression step).
 */
function withDeclarativeShadow(handler) {
  return (req, res, ...rest) => {
    delete req.headers['accept-encoding'];
    const write = res.write.bind(res);
    const end = res.end.bind(res);
    const writeHead = res.writeHead.bind(res);
    let injector;
    let contentType;
    // Headers passed straight to writeHead() are not visible through getHeader().
    res.writeHead = (status, ...args) => {
      const headers = args.find(arg => arg && typeof arg === 'object');
      if (Array.isArray(headers)) {
        for (let i = 0; i < headers.length; i += 2) {
          if (String(headers[i]).toLowerCase() === 'content-type') contentType = String(headers[i + 1]);
        }
      } else if (headers) {
        for (const [name, value] of Object.entries(headers)) {
          if (name.toLowerCase() === 'content-type') contentType = String(value);
        }
        if (String(contentType).includes('text/html')) {
          for (const name of Object.keys(headers)) if (name.toLowerCase() === 'content-length') delete headers[name];
        }
      }
      if (String(contentType ?? res.getHeader('content-type')).includes('text/html')) res.removeHeader('content-length');
      return writeHead(status, ...args);
    };
    // One streaming decoder per response: a character can be split across chunks.
    const decoder = new TextDecoder();
    const html = () => {
      if (injector === undefined) {
        injector = String(contentType ?? res.getHeader('content-type') ?? '').includes('text/html') ? createInjector() : null;
        // The injected markup changes the length; once headers are out it is chunked anyway.
        if (injector && !res.headersSent) res.removeHeader('content-length');
      }
      return injector;
    };
    const text = chunk => (typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true }));
    res.write = (chunk, encoding, callback) => {
      if (!html() || chunk == null) return write(chunk, encoding, callback);
      return write(injector.push(text(chunk)), 'utf8', typeof encoding === 'function' ? encoding : callback);
    };
    res.end = (chunk, encoding, callback) => {
      if (!html()) return end(chunk, encoding, callback);
      const out = (chunk == null || typeof chunk === 'function' ? '' : injector.push(text(chunk))) + injector.push(decoder.decode()) + injector.flush();
      return end(out, 'utf8', [chunk, encoding, callback].find(value => typeof value === 'function'));
    };
    return handler(req, res, ...rest);
  };
}

export { createInjector, injectDeclarativeShadow, supportedElements, withDeclarativeShadow };
