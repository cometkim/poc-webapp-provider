/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: [".*"],
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  serverBuildTarget: 'cloudflare-workers',
  assetsBuildDirectory: 'public/build',
};
