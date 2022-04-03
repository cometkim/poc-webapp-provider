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
  },
  outfile: 'worker.mjs',
});
