import { lookup } from 'mrmime';
import * as zip from '@zip.js/zip.js';

export async function handleWebapp(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);
  const match = url.host.match(/(?<appId>[\w\-]+)\.webapp\.hyeseong\.kim/);

  if (match.groups) {
    const { appId } = match.groups;
    const buffer = await APPS.get(appId, 'arrayBuffer');
    const baseDir = await APPS.get(`${appId}:baseDir`, 'text') || '/';
    if (!buffer) {
      return new Response(`Unknown app id: ${appId}`, {
        status: 404,
      });
    }

    const binary = new Uint8Array(buffer);

    zip.configure({ useWebWorkers: false });
    const binaryReader = new zip.Uint8ArrayReader(binary);
    const zipReader = new zip.ZipReader(binaryReader);

    try {
      const entries = await zipReader.getEntries();
      let pathname = url.pathname;
      if (pathname.endsWith('/')) {
        pathname += 'index.html';
      }
      const target = entries.find(entry => entry.filename.replace(baseDir, '/') === pathname);
      if (!target) {
        return new Response(`Not found path: ${pathname}, baseDir: ${baseDir}`, { status: 404 });
      }
      const binary = await target.getData(
        new zip.Uint8ArrayWriter(),
        {},
      ) as Uint8Array;

      return new Response(binary, {
        status: 200,
        headers: {
          'Content-Type': lookup(target.filename) || 'application/octet-stream',
        },
      });
    } finally {
      await zipReader.close();
    }
    return new Response('Internal error', { status: 500 });
  } else {
    return new Response('Not found', { status: 404 });
  }
}
