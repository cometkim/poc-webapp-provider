import {
  Form,
} from '@remix-run/react';
import type { ActionFunction } from '@remix-run/cloudflare';

import { authenticator } from '../services/auth.server';

export default function Login() {
  return (
    <div>
      <Form method="post">
        <button type="submit" name="via" value="github">
          Sign-in with GitHub
        </button>
        <button type="submit" name="via" value="google">
          Sign-in with Google
        </button>
      </Form>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const via = form.get('via');
  switch (via) {
    case 'github':
      return authenticator.authenticate('github', request);
  }
};
