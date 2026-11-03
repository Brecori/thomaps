import { readFile, writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const source = await readFile('public/favicon.svg', 'utf8')
// Full opaque canvas; the existing globe stays inside the maskable safe area.
const opaque = Buffer.from(source.replace('rx="20"', 'rx="0"'))
await mkdir('public/icons', { recursive: true })
for (const [name, size] of [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  await writeFile(
    `public/icons/${name}`,
    await sharp(opaque).resize(size, size).png().toBuffer(),
  )
}
console.log(
  'Ícones PWA 192/512, maskable e Apple touch gerados a partir do favicon.',
)
