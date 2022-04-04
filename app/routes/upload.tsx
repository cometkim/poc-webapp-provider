import * as React from 'react';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import * as zip from '@zip.js/zip.js';

import { User, Manifest } from '~/models';
import { authenticator } from '~/services/auth.server';
import { getManifest, uploadApp } from '~/services/user.server';

type LoaderData = {
  user: User.T,
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  return {
    user,
  };
}

type ActionData = (
  | { result: 'error', error: string }
)

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const form = await request.formData();

  const zipFile = form.get('zip');
  if (!zipFile || !(zipFile instanceof File)) {
    return json<ActionData>({
      result: 'error',
      error: 'zip file is requird',
    }, 400);
  }

  try {
    const buffer = await zipFile.arrayBuffer();
    const binary = new Uint8Array(buffer);

    zip.configure({ useWebWorkers: false });

    const result = await readZipfile(binary);
    if (!result) {
      return json<ActionData>({
        result: 'error',
        error: 'invalid zip file',
      }, 400);
    }

    const { manifest } = result;

    const currentManifest = await getManifest({ user, appName: manifest.name });
    if (!currentManifest || currentManifest.version < manifest.version) {
      await uploadApp({
        user,
        manifest: result.manifest,
        baseDir: result.baseDir,
        bundle: result.binary,
      });
      return redirect('/');
    } else if (currentManifest.version >= manifest.version) {
      return json<ActionData>({
        result: 'error',
        error: `version should be greater than ${currentManifest.version}`,
      }, 400);
    }
  } catch (e: any) {
    return json<ActionData>({
      result: 'error',
      error: e.message,
    }, 500);
  }
};

export default function Upload() {
  const actionData = useActionData<ActionData>();

  const [manifest, setManifest] = React.useState<Manifest.T | null>(null);

  type FileInputHandler = NonNullable<React.ComponentProps<'input'>['onChange']>;
  const handleFileInput = React.useCallback<FileInputHandler>(async e => {
    const [file] = e.target.files || [];
    if (!file) {
      return;
    }

    const buffer = await new Promise<ArrayBuffer>((res, rej) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = event => {
        res(event.target?.result as ArrayBuffer);
      };
      reader.onerror = event => {
        rej(event.target?.error);
      };
    });
    const binary = new Uint8Array(buffer);
    const result = await readZipfile(binary);
    if (!result) {
      return;
    }

    setManifest(result.manifest);
  }, []);

  return (
    <main>
      <Form method="post" encType="multipart/form-data">
        <input
          id="zip"
          name="zip"
          type="file"
          accept="application/zip"
          onChange={handleFileInput}
        />
        {manifest && (
          <div>
            <dl>
              <dt>name</dt>
              <dd>{manifest.name}</dd>

              <dt>version</dt>
              <dd>{manifest.version}</dd>

              <dt>entry</dt>
              <dd>{manifest.entry}</dd>

              <dt>icon</dt>
              <dd>{manifest.icon}</dd>
            </dl>
            <button type="submit">
              Upload
            </button>
          </div>
        )}
        {actionData?.result === 'error' && (
          <p style={{ color: 'red' }}>
            {actionData.error}
          </p>
        )}
      </Form>
    </main>
  );
}

type ReadZipfileResult = {
  baseDir: string,
  manifest: Manifest.T,
  binary: Uint8Array,
};

async function readZipfile(binary: Uint8Array): Promise<ReadZipfileResult | null> {
  const binaryReader = new zip.Uint8ArrayReader(binary);
  const zipReader = new zip.ZipReader(binaryReader);

  try {
    const entries = await zipReader.getEntries();
    console.log(entries);

    const manifestEtnry = entries.find(entry => entry.filename.endsWith('manifest.json'));
    if (!manifestEtnry?.getData) {
      return null;
    }
    const baseDir = manifestEtnry.filename.replace(/manifest\.json$/, '') || '/';
    const text = await manifestEtnry.getData(
      new zip.TextWriter(),
      {},
    ) as string;
    const manifest = Manifest.Schema.check(JSON.parse(text));
    return {
      binary,
      baseDir,
      manifest,
    };
  } finally {
    await zipReader.close();
  }
}
