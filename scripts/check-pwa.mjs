import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'

const read = async (file) => JSON.parse(await readFile(file, 'utf8'))
const audit = await read('dist/pwa-audit.json')
const manifest = await read('dist/manifest.webmanifest')
const sw = await readFile('dist/sw.js')
assert.equal(manifest.display, 'standalone')
assert.equal(manifest.lang, 'pt-BR')
assert.equal(manifest.start_url, './')
assert.equal(manifest.scope, './')
assert.ok(manifest.id)
assert.equal(
  audit.assets.filter((entry) => entry.url.startsWith('flags/')).length,
  195,
)
assert.equal(
  new Set(audit.assets.map((entry) => entry.url)).size,
  audit.assets.length,
)
for (const entry of audit.assets) {
  assert.ok(
    !entry.url.includes('audio/') && !entry.url.endsWith('.mp3'),
    entry.url,
  )
  const bytes = await readFile(`dist/${entry.url}`)
  assert.equal(entry.bytes, bytes.length)
  assert.equal(
    entry.integrity,
    `sha256-${createHash('sha256').update(bytes).digest('base64')}`,
  )
  assert.ok(sw.toString().includes(entry.integrity), entry.url)
}
for (const name of [
  'index.html',
  'data/countries.json',
  'data/world.topo.json',
  'data/manifest.json',
  'manifest.webmanifest',
])
  assert.ok(
    audit.assets.some((entry) => entry.url === name),
    name,
  )
for (const [file, size] of [
  ['icons/pwa-192.png', 192],
  ['icons/pwa-512.png', 512],
  ['icons/maskable-512.png', 512],
  ['icons/apple-touch-icon.png', 180],
]) {
  const image = await readFile(`dist/${file}`)
  assert.equal(image.readUInt32BE(16), size)
  assert.equal(image.readUInt32BE(20), size)
}
assert.ok(
  manifest.icons.some(
    (icon) => icon.sizes === '512x512' && icon.purpose === 'maskable',
  ),
)
const workerGzipBytes = gzipSync(sw).length
const measured = {
  ...audit,
  workerBytes: sw.length,
  workerGzipBytes,
  totalTransferGzipBytes: audit.gzipBytes + workerGzipBytes,
}
assert.ok(measured.bytes <= measured.budgetBytes)
assert.ok(measured.totalTransferGzipBytes <= measured.budgetGzipBytes)
await writeFile('dist/pwa-audit.json', JSON.stringify(measured, null, 2) + '\n')
console.log(
  `PWA verificado: ${audit.assets.length} arquivos essenciais, 195 bandeiras, nenhum hino. Cache ${(audit.bytes / 1024 ** 2).toFixed(2)} MiB; transferência gzip com SW ${(measured.totalTransferGzipBytes / 1024 ** 2).toFixed(2)} MiB.`,
)
