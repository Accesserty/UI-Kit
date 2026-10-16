import { createServer } from 'node:http';
import { createInjector, injectDeclarativeShadow, withDeclarativeShadow } from './vendor/accesserty-ui-kit-ssr.js';

const html: string = injectDeclarativeShadow('<au-tabs></au-tabs>');
const injector = createInjector();
const out: string = injector.push('<au-accordion>') + injector.flush();
createServer(withDeclarativeShadow((req, res) => { res.end(req.url); }));
void [html, out];
// @ts-expect-error the injector takes HTML text
injectDeclarativeShadow(Buffer.from(''));
