import * as esbuild from 'esbuild';

const mode = process.env.NODE_ENV ?? 'development';

console.log(`Running esbuild in ${mode} mode`);

esbuild.build({
  entryPoints: ['./worker/index.ts'],
  bundle: true,
  minify: mode === 'production',
  format: 'esm',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.REMIX_DEV_SERVER_WS_PORT': JSON.stringify(8002),
    // Cloudflare Workers VM doesn't initialize import.meta
    'import.meta.url': JSON.stringify(''),
  },
  outfile: 'worker.mjs',
});
