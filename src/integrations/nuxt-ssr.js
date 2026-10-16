// Nitro plugin added by the Nuxt module: inserts declarative shadow roots into
// the rendered HTML, after Vue has rendered and outside what it hydrates.
import { injectDeclarativeShadow } from './accesserty-ui-kit-ssr.js';

export default function accessertyDeclarativeShadow(nitroApp) {
  nitroApp.hooks.hook('render:html', html => {
    html.body = html.body.map(chunk => injectDeclarativeShadow(chunk));
  });
}
