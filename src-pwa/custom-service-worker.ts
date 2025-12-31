import { clientsClaim } from 'workbox-core';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
  SKIP_WAITING_MESSAGE,
  CACHE_MAX_ENTRIES,
  CACHE_MAX_AGE_SECONDS,
  STATIC_RESOURCES_CACHE_NAME,
} from './constants';

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

self.addEventListener('message', (event) => {
  if (event.data?.type === SKIP_WAITING_MESSAGE) {
    self.skipWaiting();
  }
});

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

const isStaticAsset = ({ request }: { request: Request }) =>
  request.method === 'GET' &&
  (request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font');

registerRoute(
  isStaticAsset,
  new StaleWhileRevalidate({
    cacheName: STATIC_RESOURCES_CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: CACHE_MAX_ENTRIES,
        maxAgeSeconds: CACHE_MAX_AGE_SECONDS,
      }),
    ],
  })
);

if (process.env.MODE !== 'ssr' && process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [
        /index\.html$/,
        /api\/(.)*/,
        /v1\/(.)*/,
        /builds\/(.)*/,
        /media\/(.)*/,
        new RegExp(process.env.PWA_SERVICE_WORKER_REGEX),
        /workbox-(.)*\.js$/,
      ],
    })
  );
}
