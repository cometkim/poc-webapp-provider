import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';

import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = async ({ request }) => {
  return authenticator.authenticate('github', request);
};
