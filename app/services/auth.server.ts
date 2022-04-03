import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';

import type { User } from '../models/user';

import * as session from './session.server';
import { signIn } from './user.server';

export const authenticator = new Authenticator(session);

authenticator.use(
  new GitHubStrategy<User>({
    clientID: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_APP_CALLBACK_URL || 'http://localhost:8788/auth/github/callback',
  }, async ({ accessToken, profile }) => {
    const user = await signIn({
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: {
        type: 'github',
        data: {
          accessToken,
        },
      },
    });
    return user;
  }),
);
