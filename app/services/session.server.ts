import { createCloudflareKVSessionStorage } from '@remix-run/cloudflare';

declare var SessionStorage: KVNamespace;

export const {
  getSession,
  commitSession,
  destroySession,
} = createCloudflareKVSessionStorage({
  cookie: {
    name: '__session',
  },
  kv: SessionStorage,
});
