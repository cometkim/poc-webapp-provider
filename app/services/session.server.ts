import { createCloudflareKVSessionStorage } from '@remix-run/cloudflare';

declare var SESSION: KVNamespace;
declare var SESSION_SECRET: string;

export const {
  getSession,
  commitSession,
  destroySession,
} = createCloudflareKVSessionStorage({
  cookie: {
    name: 'SESSION_ID',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    secrets: [
      SESSION_SECRET,
    ],
  },
  kv: SESSION,
});
