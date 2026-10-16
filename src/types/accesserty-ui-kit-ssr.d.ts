// Types for dist/accesserty-ui-kit-ssr.js (Node.js).
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Elements whose shadow roots are rendered on the server. */
export declare const supportedElements: readonly string[];

/** Inserts declarative shadow roots into a complete HTML string. */
export declare function injectDeclarativeShadow(html: string): string;

/** Incremental insertion for streamed HTML: send what push() returns, then flush(). */
export declare function createInjector(): {
  push(chunk: string): string;
  flush(): string;
};

/** Wraps a Node request handler (for example a custom Next.js server's) so HTML responses get declarative shadow roots. */
export declare function withDeclarativeShadow<Rest extends unknown[]>(
  handler: (req: IncomingMessage, res: ServerResponse, ...rest: Rest) => unknown,
): (req: IncomingMessage, res: ServerResponse, ...rest: Rest) => unknown;
