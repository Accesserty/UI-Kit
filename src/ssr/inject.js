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
import { DEFAULT_EXCLUSIVE_HINT, renderAccordion, renderAccordionItem } from '../views/accordion.js';
import { DEFAULT_BADGE_LABEL_PREFIX, renderTabs, tabLabel } from '../views/tabs.js';
import { DEFAULT_LABEL, DEFAULT_SEPARATOR, linkTitle, parseItems, renderBreadcrumbs } from '../views/breadcrumbs.js';

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

export const supportedElements = Object.freeze(Object.keys(renderers));

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
export function createInjector() {
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
export function injectDeclarativeShadow(html) {
  const injector = createInjector();
  return injector.push(html) + injector.flush();
}

/**
 * Wraps a Node request handler (such as Next.js `app.getRequestHandler()` in a
 * custom server) so HTML responses get declarative shadow roots as they stream.
 * The response is left uncompressed: the transform must see the HTML, so put
 * compression after it (a reverse proxy, or your own compression step).
 */
export function withDeclarativeShadow(handler) {
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
