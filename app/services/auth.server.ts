import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';

import type { User } from '../models';

import * as session from './session.server';
import { signIn } from './user.server';

export const authenticator = new Authenticator<User.T>(session);

declare const GITHUB_APP_CLIENT_ID: string;
declare const GITHUB_APP_CLIENT_SECRET: string;
declare const GITHUB_APP_CALLBACK_URL: string;

authenticator.use(
  new GitHubStrategy({
    clientID: GITHUB_APP_CLIENT_ID,
    clientSecret: GITHUB_APP_CLIENT_SECRET,
    callbackURL: GITHUB_APP_CALLBACK_URL,
  }, async ({ accessToken, profile }) => {
    const user = await signIn({
      username: profile.displayName,
      name: profile.name.givenName,
      email: profile.emails[0].value,
      pictureUrl: profile.photos[0].value,
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
