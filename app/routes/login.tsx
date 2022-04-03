import {
  Form,
} from '@remix-run/react';

export default function Login() {
  return (
    <div>
      <Form method="post">
        <button type="submit" formAction="/auth/github">
          Sign-in with GitHub
        </button>
        <button type="submit" formAction="/auth/google">
          Sign-in with Google
        </button>
      </Form>
    </div>
  );
}
