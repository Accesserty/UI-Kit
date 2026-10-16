import { uid } from './id.js';

// Elements named by an id-reference attribute on the host (aria-labelledby,
// aria-describedby). They live in the host's tree, not in its shadow root.
export function idRefs(host, attribute) {
  const root = host.getRootNode();
  return (host.getAttribute(attribute) || '').trim().split(/\s+/).filter(Boolean)
    .map(id => root.getElementById?.(id)).filter(element => element && element !== host);
}

// Gives the control inside the shadow root the host's accessible name and
// description: aria-label as is; aria-labelledby, aria-describedby and a
// <label for> through element references where the browser has them, or as
// text (a hidden mirror for descriptions) where it does not.
// - explicit: the name to use as aria-label, if any
// - hasOwnLabel: the component shows its own label, so a <label for> is not needed
// - mirrorPrefix: id prefix for the description mirror
export function forwardAria(host, target, { explicit, hasOwnLabel, mirrorPrefix }) {
  let labels = idRefs(host, 'aria-labelledby');
  if (!labels.length && !explicit && !hasOwnLabel && host.isConnected) labels = [...(host.internals.labels || [])];
  const descriptions = idRefs(host, 'aria-describedby');
  target.removeAttribute('aria-labelledby');
  target.removeAttribute('aria-describedby');
  if (explicit) target.setAttribute('aria-label', explicit);
  else target.removeAttribute('aria-label');
  if ('ariaLabelledByElements' in target) target.ariaLabelledByElements = labels;
  else if (!explicit && labels.length) {
    target.setAttribute('aria-label', labels.map(element => element.getAttribute('aria-label') || element.textContent).join(' ').trim());
  }
  if ('ariaDescribedByElements' in target) target.ariaDescribedByElements = descriptions;
  else if (descriptions.length) {
    if (!host._descriptionMirror) {
      host._descriptionMirror = document.createElement('span');
      host._descriptionMirror.id = uid(mirrorPrefix);
      host._descriptionMirror.hidden = true;
      host.shadowRoot.append(host._descriptionMirror);
    }
    host._descriptionMirror.textContent = descriptions.map(element => element.textContent).join(' ').trim();
    target.setAttribute('aria-describedby', host._descriptionMirror.id);
  }
}
