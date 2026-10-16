// Shadow DOM markup and styles for au-breadcrumbs. Pure functions shared by
// the browser and server rendering.
import { escapeHTML } from './escape.js';

export const DEFAULT_LABEL = 'Breadcrumbs';
export const DEFAULT_SEPARATOR = '/';
export const DEFAULT_LINK_TITLE_PREFIX = 'go to';

export const breadcrumbsStyles = `
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
export function parseItems(value) {
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
export function linkTitle(text, index, { template, prefix } = {}) {
  return template
    ? template.replaceAll('{text}', String(text ?? '')).replaceAll('{index}', String(index + 1))
    : `${prefix || DEFAULT_LINK_TITLE_PREFIX} ${text ?? ''}`;
}

/**
 * @param {{ id?: string, className?: string, label?: string, separator?: string,
 *   items?: {{ text: string, href?: string|null, title?: string }}[] }} [state]
 * The last item is the current page; items without an href render as text.
 */
export function renderBreadcrumbs({ id, className, label, separator = DEFAULT_SEPARATOR, items = [] } = {}) {
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
