import { Authenticator } from 'remix-auth';
import { GitHubStrategy } from 'remix-auth-github';

import type { User } from '../models/user';

import * as session from './session.server';
import { signIn } from './user.server';

export const authenticator = new Authenticator(session);

declare var GITHUB_APP_CLIENT_ID: string;
declare var GITHUB_APP_CLIENT_SECRET: string;
declare var GITHUB_APP_CALLBACK_URL: string;

authenticator.use(
  new GitHubStrategy<User>({
    clientID: GITHUB_APP_CLIENT_ID,
    clientSecret: GITHUB_APP_CLIENT_SECRET,
    callbackURL: GITHUB_APP_CALLBACK_URL,
  }, async ({ accessToken, profile }) => {
    const user = await signIn({
      username: profile.id,
      name: profile.displayName,
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
