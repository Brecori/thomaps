import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const load = async (path) => JSON.parse(await readFile(path, 'utf8'))
const catalog = await load('data-sources/catalog.json')
const geometry = await load('data-sources/natural-earth-50m.geojson')
const manifest = await load('data-sources/manifest.json')
const anthems = await load('data-sources/anthem-audit.json')
const flags = await load('data-sources/flag-audit.json')
const featureIds = new Set(geometry.features.map((feature) => feature.id))
const sample = ['BRA', 'JPN', 'ZAF', 'MCO', 'FJI']

assert.equal(catalog.length, 195)
assert.equal(new Set(catalog.map((country) => country.id)).size, catalog.length)
assert.equal(featureIds.size, geometry.features.length)
for (const country of catalog) {
  assert.match(country.id, /^[A-Z]{3}$/)
  assert.match(country.iso2, /^[A-Z]{2}$/)
  assert.ok(
    country.namePtBr && country.capitals.length && country.mapFeatureIds.length,
    country.id,
  )
  assert.ok(
    country.mapFeatureIds.every((id) => featureIds.has(id)),
    country.id,
  )
  assert.ok(
    country.focusPoint.length === 2 &&
      country.focusPoint.every(Number.isFinite),
    country.id,
  )
  assert.equal(country.anthemAuditStatus, 'pending') // No media falsely marked playable.
}
for (const id of sample) {
  assert.ok(
    anthems.find(
      (anthem) => anthem.countryId === id && anthem.status === 'candidate',
    ),
  )
  const flag = flags.find((flag) => flag.countryId === id)
  assert.ok(flag, id)
  const bytes = await readFile(flag.path)
  assert.ok(bytes.toString().includes('<svg'))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), flag.sha256)
}
for (const source of manifest.sources) {
  const bytes = await readFile(`data-sources/${source.output}`)
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    source.sha256Output,
  )
}
console.log(
  `Catálogo íntegro: ${catalog.length} países, ${featureIds.size} geometrias, cinco bandeiras e cinco candidatos a hino. Reprodução ainda pendente.`,
)
