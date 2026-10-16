// Shadow root setup for components that support declarative Shadow DOM.
//
// A server can send a component's shadow root as
// `<au-x><template shadowrootmode="open">…</template>…</au-x>`. The browser
// turns that template into the shadow root while parsing, so the component
// must adopt it instead of building (and wiping) its own.
//
// While the document is still parsing, a host can be constructed before its
// template child has arrived: a synchronous script defined the element early,
// or streamed server rendering hydrated part of the page first. In that case
// the decision waits for DOMContentLoaded. Otherwise it happens immediately.

/**
 * @param {HTMLElement} host
 * @param {() => string} render   markup for a shadow root the component builds itself
 * @param {(root: ShadowRoot, adopted: boolean) => void} bind  look up nodes, add listeners, sync state
 */
export function setupShadow(host, render, bind) {
  const internals = host.attachInternals();
  const ready = () => {
    const adopted = !!internals.shadowRoot;
    const root = internals.shadowRoot ?? host.attachShadow({ mode: 'open' });
    if (!adopted) {
      // Declarative markup inserted without the HTML parser (innerHTML) stays an
      // inert <template> in the light DOM; the component's own root replaces it.
      host.querySelector(':scope > template[shadowrootmode]')?.remove();
      root.innerHTML = render();
    }
    bind(root, adopted);
  };
  if (internals.shadowRoot || host.ownerDocument.readyState !== 'loading') ready();
  else host.ownerDocument.addEventListener('DOMContentLoaded', ready, { once: true });
}
