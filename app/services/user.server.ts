import { AuthProvider } from '../models/authProvider';
import { User } from '../models/user';

import { getStorage } from './storage.server';

const makeStorageKey = (key: string) => `user:${key}`;

interface SignIn {
  (params: {
    username: string,
    name: string,
    email: string,
    pictureUrl: string,
    provider: AuthProvider,
  }): Promise<User>;
}

export const signIn: SignIn = async params => {
  const storage = getStorage();

  const userKey = makeStorageKey(params.email);
  let user = await storage.get<User>(userKey, 'json');
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      username: params.username,
      name: params.name,
      email: params.email,
      pictureUrl: params.pictureUrl,
    };
    await storage.put(userKey, JSON.stringify(user));
  }

  return user;
}
