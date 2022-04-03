import { createRequestHandler, handleAsset } from '@remix-run/cloudflare-workers';
import * as build from '../build/index.js';

const handleRequest = createRequestHandler({ build });

export async function handleRemix(event: FetchEvent) {
  let response = await handleAsset(event, build);

  if (!response) {
    response = await handleRequest(event);
  }

  return response;
};
