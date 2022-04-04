import type {
  AppInfo,
  AuthProvider,
  Manifest,
  User,
} from '~/models';

const StorageKey = {
  id(params: { username: string }) {
    return `User:id:${params.username}`;
  },
  appListPrefix(params: { user: User.T }) {
    return `User:AppInfo:${params.user.username}:`;
  },
  appVersionListPrefix(params: { user: User.T, manifest: Manifest.T }) {
    return `${this.appListPrefix(params)}${params.manifest.name}:`;
  },
  appVersion(params: { user: User.T, manifest: Manifest.T }) {
    return `${this.appVersionListPrefix(params)}${params.manifest.version}`;
  },
};

const PublicStorageKey = {
  appVersionListPrefix(params: { username: string, appName: string }) {
    return `User:AppInfo:${params.username}:${params.appName}:`;
  },
};

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
  const key = StorageKey.id(params);
  let user = await DATA.get<User.T>(key, 'json');
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      username: params.username,
      name: params.name,
      email: params.email,
      pictureUrl: params.pictureUrl,
    };
    await DATA.put(key, JSON.stringify(user));
  }
  return user;
}

interface GetAllApps {
  (params: {
    user: User.T,
  }): Promise<AppInfo.T[]>;
}

export const getAllApps: GetAllApps = async params => {
  const prefix = StorageKey.appListPrefix(params);
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

interface UploadApp {
  (params: {
    user: User.T,
    baseDir: string,
    manifest: Manifest.T,
    bundle: Uint8Array,
  }): Promise<AppInfo.T>;
}

export const uploadApp: UploadApp = async params => {
  const key = StorageKey.appVersion(params);
  const appId = crypto.randomUUID();
  const appInfo: AppInfo.T = {
    appId,
    baseDir: params.baseDir,
    manifest: params.manifest,
  };
  await Promise.all([
    DATA.put(key, JSON.stringify(appInfo)),
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
  const key = StorageKey.appVersion(params);
  const appInfo = await DATA.get<AppInfo.T>(key, 'json');
  return appInfo;
};

interface PublicLatestAppInfo {
  (params: {
    username: string,
    appName: string,
  }): Promise<AppInfo.T | null>;
}

export const publicLatestAppInfo: PublicLatestAppInfo = async params => {
  const prefix = PublicStorageKey.appVersionListPrefix(params);
  const list = await DATA.list({ prefix });
  const latestKey = list.keys.map(key => key.name).at(-1);
  if (!latestKey) {
    return null;
  }
  const appInfo = await DATA.get<AppInfo.T>(latestKey, 'json');
  return appInfo;
};
