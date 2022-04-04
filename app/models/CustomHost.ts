import type * as User from './User';

export type T = {
  hostname: string,
  endpoint: string,
};

export const makeHostname = (params: {
  appName: string,
  user: User.T,
}) => WEBAPP_HOST_PATTERN.replace('*', `${params.appName}.${params.user.username}`);
