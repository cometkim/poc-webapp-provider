import { createCloudflareKVSessionStorage } from '@remix-run/cloudflare';

declare var SESSION: KVNamespace;

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
  },
  kv: SESSION,
});
