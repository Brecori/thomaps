import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

let outputDirectory = ''
let basePath = '/'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'thomaps-offline-budget',
      configResolved(config) {
        outputDirectory = resolve(config.root, config.build.outDir)
        basePath = config.base
      },
    },
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/pwa',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'prompt',
      includeAssets: [],
      includeManifestIcons: false,
      manifest: {
        id: './',
        name: 'Thomaps · Atlas interativo',
        short_name: 'Thomaps',
        description: 'Explore países, bandeiras, capitais e sons do mundo.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#dff4fb',
        background_color: '#dff4fb',
        icons: [
          {
            src: 'icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: [
          'index.html',
          'assets/**/*.{js,css,woff2}',
          'data/*.json',
          'flags/*.svg',
          'icons/*.png',
          'favicon.svg',
          'manifest.webmanifest',
          'licenses/*.txt',
        ],
        globIgnores: ['**/audio/**', '**/*.mp3', '**/*.map'],
        maximumFileSizeToCacheInBytes: 2 * 1024 ** 2,
        manifestTransforms: [
          async (entries) => {
            const assets = await Promise.all(
              entries.map(async (entry) => {
                const relative = entry.url.startsWith(basePath)
                  ? entry.url.slice(basePath.length)
                  : entry.url
                const bytes = await readFile(
                  resolve(outputDirectory, decodeURI(relative)),
                )
                if (entry.url.includes('/audio/') || entry.url.endsWith('.mp3'))
                  throw new Error('Áudio não pode entrar no precache')
                return {
                  ...entry,
                  integrity: `sha256-${createHash('sha256').update(bytes).digest('base64')}`,
                  bytes: bytes.length,
                  gzipBytes: gzipSync(bytes).length,
                }
              }),
            )
            const bytes = assets.reduce(
              (total, entry) => total + entry.bytes,
              0,
            )
            const gzipBytes = assets.reduce(
              (total, entry) => total + entry.gzipBytes,
              0,
            )
            if (bytes > 6 * 1024 ** 2 || gzipBytes > 3 * 1024 ** 2)
              throw new Error(
                'Orçamento offline excedido: 6 MiB em cache / 3 MiB com gzip',
              )
            await writeFile(
              resolve(outputDirectory, 'pwa-audit.json'),
              JSON.stringify(
                {
                  bytes,
                  gzipBytes,
                  budgetBytes: 6 * 1024 ** 2,
                  budgetGzipBytes: 3 * 1024 ** 2,
                  assets,
                },
                null,
                2,
              ),
            )
            return {
              manifest: assets.map((entry) => ({
                url: entry.url,
                revision: entry.revision,
                integrity: entry.integrity,
                size: entry.bytes,
              })),
              warnings: [],
            }
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
