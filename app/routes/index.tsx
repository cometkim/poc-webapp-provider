import * as React from 'react';
import * as zip from '@zip.js/zip.js';

export default function Index() {
  const [content, setContent] = React.useState<ArrayBuffer | null>(null);
  const [manifest, setManifest] = React.useState<object | null>(null);

  type FileInputHandler = NonNullable<React.ComponentProps<'input'>['onChange']>;
  const handleFileInput = React.useCallback<FileInputHandler>(e => {
    const [file] = e.target.files || [];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = e => {
      setContent(e.target?.result as ArrayBuffer);
    };
  }, []);

  React.useEffect(() => {
    if (!content) {
      return;
    }
    const binaryReader = new zip.Uint8ArrayReader(new Uint8Array(content));
    const zipReader = new zip.ZipReader(binaryReader);

    async function cleanup() {
      await zipReader.close();
    }

    async function getManifest() {
      const entries = await zipReader.getEntries();
      const manifest = entries.find(entry => entry.filename.endsWith('manifest.json'));
      if (!manifest?.getData) {
        return null;
      }

      const text = await manifest.getData(
        new zip.TextWriter(),
        {},
      );

      console.log(text);

      try {
        setManifest(JSON.parse(text));
      } catch {}
    }

    void getManifest();

    return () => {
      void cleanup();
    };
  }, [content]);

  React.useEffect(() => {
    console.log(manifest);
  }, [manifest]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      <input
        id="zip"
        name="zip"
        type="file"
        accept="application/zip"
        onChange={handleFileInput}
      />
    </div>
  );
}
