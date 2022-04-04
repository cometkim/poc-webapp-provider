import type { User } from '~/models';
import { CustomHost } from '~/models';

declare const CLOUDFLARE_ZONE_ID: string;
declare const CLOUDFLARE_ZONE_MANAGEMENT_KEY: string;

const StorageKey = {
  id(hostname: string) {
    return `CustomHost:${hostname}`;
  },
};

const APIEndpoint = {
  root() {
    return 'https://api.cloudflare.com/client/v4';
  },
  zones() {
    return `${this.root()}/zones`
  },
  zone(params: { zoneId: string }) {
    return `${this.zones()}/${params.zoneId}`;
  },
};

interface CreateCustomHost {
  (params: {
    user: User.T,
    appName: string,
  }): Promise<CustomHost.T | null>,
}

export const createCustomHost: CreateCustomHost = async params => {
  const hostname = CustomHost.makeHostname(params);
  const endpoint = `${APIEndpoint.zone({ zoneId: CLOUDFLARE_ZONE_ID })}/custom_hostnames`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLOUDFLARE_ZONE_MANAGEMENT_KEY}`,
    },
    body: JSON.stringify({
      hostname,
      ssl: {
        type: 'dv',
        method: 'http',
        settings: {
          http2: 'on',
          min_tls_version: '1.2',
          tls_1_3: 'on',
        },
      },
    }),
  });

  type ResponseData = {
    success: boolean,
    errors: [],
    messages: string[],
    result: {
      id: string,
      hostname: string,
      ssl: {
        id: string,
        status: 'pending_validation',
        method: 'http',
        type: 'dv',
      },
    },
  };
  const data = await response.json<ResponseData>();
  if (!data.success) {
    return null;
  }

  return {
    hostname,
    endpoint: `${endpoint}/${data.result.id}`,
  };
};

interface GetExistCustomHost {
  (params: {
    user: User.T,
    appName: string,
  }): Promise<CustomHost.T | null>;
}

export const getExistCustomHost: GetExistCustomHost = async params => {
  const hostname = CustomHost.makeHostname(params);
  const key = StorageKey.id(hostname);
  const customHost = await DATA.get<CustomHost.T>(key, 'json');
  return customHost;
};
