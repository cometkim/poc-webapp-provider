import { handleRemix } from './remix';
import { handleWebapp } from './webapp';

declare var FALLBACK_ORIGIN: string;

declare global {
  const SESSION: KVNamespace;
  const DATA: KVNamespace;
  const APPS: KVNamespace;
}

addEventListener('fetch', async event => {
  const url = new URL(event.request.url);
  if (url.origin === FALLBACK_ORIGIN) {
    try {
      return event.respondWith(
        handleRemix(event),
      );
    } catch {
      return event.respondWith(
        new Response('Internal Error', { status: 500 }),
      );
    }
  } else {
    try {
      return event.respondWith(
        handleWebapp(event),
      );
    } catch {
      return event.respondWith(
        new Response('Internal Error', { status: 500 }),
      );
    }
  }
});
