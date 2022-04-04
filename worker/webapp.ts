import { lookup } from 'mrmime';
import * as zip from '@zip.js/zip.js';

import { publicLatestAppInfo } from '../app/services/user.server';

export async function handleWebapp(event: FetchEvent): Promise<Response> {
  const WEBAPP_HOST_REGEX_PATTERN = WEBAPP_HOST_PATTERN
    .replace('*', `(?<appName>[\\w-]+).(?<username>[\\w-]+)`)
    .replaceAll('.', '\\.');

  const WEBAPP_HOST_REGEX = new RegExp(WEBAPP_HOST_REGEX_PATTERN);

  const url = new URL(event.request.url);
  const match = url.host.match(WEBAPP_HOST_REGEX);

  if (match?.groups) {
    const { appName, username } = match.groups;
    const appInfo = await publicLatestAppInfo({ appName, username });
    const buffer = await APPS.get(appInfo.appId, 'arrayBuffer');
    if (!buffer) {
      return new Response(`Unknown appId: ${appInfo.appId}`, {
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
      const target = entries.find(entry => entry.filename.replace(appInfo.baseDir, '/') === pathname);
      if (!target) {
        return new Response(`Not found path: ${pathname}, baseDir: ${appInfo.baseDir}`, { status: 404 });
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
    } catch (e: any) {
      return new Response(`Internal error: ${e.message}`, { status: 500 });
    } finally {
      await zipReader.close();
    }
  } else {
    return new Response('Not found', { status: 404 });
  }
}
