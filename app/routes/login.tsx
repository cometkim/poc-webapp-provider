import {
  Form,
} from '@remix-run/react';
import type { ActionFunction } from '@remix-run/cloudflare';

import { authenticator } from '../services/auth.server';

export default function Login() {
  return (
    <div>
      <Form method="post">
        <input type="submit" name="via" value="github" />
        <input type="submit" name="via" value="google" />
      </Form>
    </div>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const a = form.get('via');
};
