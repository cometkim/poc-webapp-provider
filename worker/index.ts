import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers';
import * as build from '../build/index.js';

declare global {
  const SESSION: KVNamespace;
  const DATA: KVNamespace;
}

const handleRequest = createRequestHandler({ build });

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build);

  if (!response) {
    response = await handleRequest(event);
  }

  return response;
};

addEventListener('fetch', async event => {
  const url = new URL(event.request.url);
  if (url.origin === 'https://webapp-provider.hyeseong.kim') {
    try {
      return event.respondWith(handleEvent(event));
    } catch (e: any) {
      return event.respondWith(new Response('Internal Error', { status: 500 }));
    }
  }

  const match = url.host.match(/(?<appname>[\w\-]+)\.(?<username>[\w\-]+)\.webapp\.hyeseong\.kim/)
  if (match.groups) {
    const { appname, username } = match.groups;
    return event.respondWith(
      new Response(JSON.stringify({ appname, username }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  } else {
    return event.respondWith(new Response('Not found', { status: 404 }));
  }
});
