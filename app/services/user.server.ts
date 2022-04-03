import { AuthProvider } from '../models/authProvider';
import { User } from '../models/user';

import { getStorage } from './storage.server';

const makeStorageKey = (key: string) => `user:${key}`;

interface SignIn {
  (params: {
    email: string,
    name: string,
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
      name: params.name,
      email: params.email,
    };
    await storage.put(userKey, JSON.stringify(user));
  }

  return user;
}
