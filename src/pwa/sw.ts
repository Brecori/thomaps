import { PrecacheController, PrecacheRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'
import type { PwaReply, PwaRequest } from './protocol'

declare const self: ServiceWorkerGlobalScope
const manifest = self.__WB_MANIFEST
const hash = (value: string) => {
  let result = 2166136261
  for (const char of value)
    result = Math.imul(result ^ char.charCodeAt(0), 16777619)
  return (result >>> 0).toString(16)
}
const version = hash(JSON.stringify(manifest))
const prefix = `thomaps-${hash(self.registration.scope)}-essential-`
const cacheName = `${prefix}${version}`
const precache = new PrecacheController({ cacheName })
precache.precache(manifest)
registerRoute(new PrecacheRoute(precache, { cleanURLs: false }))
const indexUrl = new URL('index.html', self.registration.scope).href
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' &&
    (url.pathname === new URL(self.registration.scope).pathname ||
      url.href.split('?')[0] === indexUrl),
  async () => (await precache.matchPrecache(indexUrl)) ?? Response.error(),
)
clientsClaim()
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((name) => name.startsWith(prefix) && name !== cacheName)
          .map((name) => caches.delete(name)),
      )
    })(),
  )
})

async function checkOffline(): Promise<PwaReply> {
  if (!(await caches.has(cacheName)))
    return {
      type: 'OFFLINE_STATUS',
      ready: false,
      missing: manifest.length,
      version,
    }
  const cache = await caches.open(cacheName)
  const keys = new Set((await cache.keys()).map((request) => request.url))
  const missing = [...precache.getURLsToCacheKeys().values()].filter(
    (key) => !keys.has(key),
  ).length
  return { type: 'OFFLINE_STATUS', ready: missing === 0, missing, version }
}

async function repairOffline(): Promise<PwaReply> {
  const cache = await caches.open(cacheName)
  // Integrity prevents refilling an older cache with newer, incompatible data.
  for (const [url, key] of precache.getURLsToCacheKeys()) {
    if (await cache.match(key)) continue
    const integrity = precache.getIntegrityForCacheKey(key)
    const response = await fetch(
      new Request(url, { cache: 'reload', integrity }),
    )
    if (!response.ok) throw new Error('network')
    await cache.put(key, response)
  }
  return checkOffline()
}

self.addEventListener('message', (event) => {
  const request = event.data as Partial<PwaRequest> | null
  const port = event.ports[0]
  if (
    !port ||
    !request ||
    !['CHECK_OFFLINE', 'REPAIR_OFFLINE', 'APPLY_UPDATE'].includes(
      String(request.type),
    )
  )
    return
  event.waitUntil(
    (async () => {
      try {
        let reply: PwaReply
        if (request.type === 'APPLY_UPDATE') {
          const windows = (
            await self.clients.matchAll({
              type: 'window',
              includeUncontrolled: true,
            })
          ).filter((client) => client.url.startsWith(self.registration.scope))
          if (windows.length > 1)
            reply = { type: 'ERROR', reason: 'other-tabs' }
          else {
            port.postMessage({ type: 'UPDATE_ACCEPTED' } satisfies PwaReply)
            await self.skipWaiting()
            return
          }
        } else
          reply =
            request.type === 'REPAIR_OFFLINE'
              ? await repairOffline()
              : await checkOffline()
        port.postMessage(reply)
      } catch (error) {
        port.postMessage({
          type: 'ERROR',
          reason:
            error instanceof DOMException && error.name === 'QuotaExceededError'
              ? 'storage'
              : 'network',
        } satisfies PwaReply)
      }
    })(),
  )
})
