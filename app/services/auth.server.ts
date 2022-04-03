import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';
import * as session from './session.server';
import type { User } from './user.server';

export const authenticator = new Authenticator(session);

authenticator.use(
  new GitHubStrategy<User>({
    clientID: process.env.GITHUB_APP_CLIENT_ID!,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_APP_CALLBACK_URL || 'http://localhost:8788/auth/github/callback',
  }, async ({ profile }) => {
    return {
      email: profile.emails[0].value,
      name: profile.displayName,
    };
  }),
);
