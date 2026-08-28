/* App Shell Service Worker
 * Generated for the existing application.
 * Strategy:
 *  - First install: cache the current app shell.
 *  - Subsequent loads: serve the shell from cache immediately.
 *  - Database/API requests are NOT cached by this worker.
 *  - HTML navigation uses network fallback when possible.
 *  - A version bump in CACHE_VERSION refreshes the shell.
 */
'use strict';

const CACHE_VERSION = 'app-shell-v1';
const SHELL_CACHE = CACHE_VERSION;

// Keep this list intentionally small: the current index.html contains the
// application's embedded CSS/JS/images. External dependencies are allowed to
// continue through the browser/network and are not rewritten here.
const APP_SHELL = [
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== SHELL_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept API/database traffic. This keeps existing database logic
  // and live updates intact.
  const looksDynamic =
    url.pathname.includes('/api/') ||
    url.pathname.includes('/rest/') ||
    url.pathname.includes('/graphql') ||
    url.searchParams.has('firebase') ||
    url.searchParams.has('supabase');

  if (looksDynamic) return;

  // Only handle same-origin app-shell requests.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Cache successful same-origin static responses for repeat visits.
        if (response && response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
