import { createCloudflareKVSessionStorage } from '@remix-run/cloudflare';

declare const SESSION_SECRET: string;

export const {
  getSession,
  commitSession,
  destroySession,
} = createCloudflareKVSessionStorage({
  cookie: {
    name: 'SESSION_ID',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    secrets: [
      SESSION_SECRET,
    ],
  },
  kv: SESSION,
});
