import * as CustomHost from './CustomHost';
import * as Manifest from './Manifest';

export type T = {
  baseDir: string,
  appId: string,
  customHost: CustomHost.T,
  manifest: Manifest.T,
};
