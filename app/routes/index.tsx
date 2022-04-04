import type { LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';

import type { User, AppInfo } from '~/models';
import { authenticator } from '~/services/auth.server';
import { getAllApps } from '~/services/user.server';

type LoaderData = {
  login: {
    user: User.T,
    apps: AppInfo.T[],
  } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return {
      login: null,
    };
  }
  const apps = await getAllApps({ user });
  return {
    login: {
      user,
      apps,
    },
  };
};

export default function Index() {
  const { login } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      {login ? (
        <div>
          <h1>Hello, {login.user.name}!</h1>
          <p>
            <Link to="/upload">Upload</Link> new a webapp
          </p>
          <h2>My Webapps</h2>
          <ul>
            {login.apps.map(app => (
              <li key={app.manifest.name}>
                <a href={`https://${app.appId}.webapp.hyeseong.kim`}>
                  {app.manifest.name}
                </a> (version: {app.manifest.version})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h1>Webcome to Webapp Provider Demo</h1>
          <p>
            <Link to="/login">Login </Link>
            to access Webapps
          </p>
        </div>
      )}
    </div>
  );
}
