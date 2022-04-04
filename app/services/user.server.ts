import type {
  AppInfo,
  AuthProvider,
  Manifest,
  User,
} from '../models';

const makePrefix = (email: string) => `User:${email}`;
const makeStorageKey = (user: User.T, ...key: string[]) => `${makePrefix(user.email)}:${key.join(':')}`;

interface SignIn {
  (params: {
    username: string,
    name: string,
    email: string,
    pictureUrl: string,
    provider: AuthProvider.T,
  }): Promise<User.T>;
}

export const signIn: SignIn = async params => {
  const userKey = makePrefix(params.email);
  let user = await DATA.get<User.T>(userKey, 'json');
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      username: params.username,
      name: params.name,
      email: params.email,
      pictureUrl: params.pictureUrl,
    };
    await DATA.put(userKey, JSON.stringify(user));
  }

  return user;
}

interface GetAllApps {
  (params: {
    user: User.T,
  }): Promise<AppInfo.T[]>;
}

export const getAllApps: GetAllApps = async params => {
  const prefix = makeStorageKey(params.user, 'App');
  const list = await DATA.list({ prefix });
  const allApps = new Map<string, AppInfo.T>();
  for (const key of list.keys) {
    const appInfo = await DATA.get<AppInfo.T>(key.name, 'json');
    if (appInfo) {
      const appName = appInfo.manifest.name;
      const currentAppInfo = allApps.get(appName);
      if (!currentAppInfo || currentAppInfo.manifest.version < appInfo.manifest.version) {
        allApps.set(appName, appInfo);
      }
    }
  }
  return [...allApps.values()];
};

interface GetManifest {
  (params: {
    user: User.T,
    appName: string,
  }): Promise<Manifest.T | null>;
}

export const getManifest: GetManifest = async params => {
  const prefix = makeStorageKey(params.user, 'App', params.appName);
  const list = await DATA.list({ prefix });
  const latestKey = list.keys.at(-1);
  if (!latestKey) {
    return null;
  }

  const appInfo = await DATA.get<AppInfo.T>(latestKey.name, 'json');
  if (!appInfo) {
    return null;
  }

  return appInfo.manifest;
};

interface UploadApp {
  (params: {
    user: User.T,
    baseDir: string,
    manifest: Manifest.T,
    bundle: Uint8Array,
  }): Promise<AppInfo.T>;
}

export const uploadApp: UploadApp = async params => {
  const storageKey = makeStorageKey(
    params.user,
    'App',
    params.manifest.name,
    params.manifest.version.toString(),
  );
  const appId = crypto.randomUUID();
  const appInfo: AppInfo.T = {
    appId,
    baseDir: params.baseDir,
    manifest: params.manifest,
  };
  await Promise.all([
    DATA.put(storageKey, JSON.stringify(appInfo)),
    APPS.put(appId, params.bundle),
  ]);
  return appInfo;
};

interface GetAppInfo {
  (params: {
    user: User.T,
    manifest: Manifest.T,
  }): Promise<AppInfo.T | null>;
}

export const getAppInfo: GetAppInfo = async params => {
  const storageKey = makeStorageKey(
    params.user,
    'App',
    params.manifest.name,
    params.manifest.version.toString(),
  );
  const appInfo = await DATA.get<AppInfo.T>(storageKey, 'json');
  return appInfo;
};
