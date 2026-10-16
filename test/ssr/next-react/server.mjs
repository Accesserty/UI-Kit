// Self-hosted Next.js with declarative Shadow DOM, as the README documents.
import { createServer } from 'node:http';
import next from 'next';
import { withDeclarativeShadow } from './vendor/accesserty-ui-kit-ssr.js';

const app = next({ dev: false, dir: new URL('.', import.meta.url).pathname });
await app.prepare();
createServer(withDeclarativeShadow(app.getRequestHandler()))
  .listen(Number(process.env.PORT) || 3000, process.env.HOST || '127.0.0.1');
