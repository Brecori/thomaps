import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const load = async (path) => JSON.parse(await readFile(path, 'utf8'))
const catalog = await load('data-sources/catalog.json')
const geometry = await load('data-sources/natural-earth-50m.geojson')
const manifest = await load('data-sources/manifest.json')
const anthemAudit = await load('data-sources/anthems.json')
const anthems = anthemAudit.records
const editorial = (await load('data-sources/metadata-review.json')).countries
const flags = await load('data-sources/flag-audit.json')
const featureIds = new Set(geometry.features.map((feature) => feature.id))
const sample = ['BRA', 'JPN', 'ZAF', 'MCO', 'FJI']

assert.equal(catalog.length, 195)
assert.equal(new Set(catalog.map((country) => country.id)).size, catalog.length)
assert.equal(
  new Set(catalog.map((country) => country.iso2)).size,
  catalog.length,
)
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
  assert.equal(country.metadataReviewStatus, 'reviewed')
  const review = editorial.find((item) => item.countryId === country.id)
  assert.ok(review?.sources.length, country.id)
  assert.deepEqual(review.capitals, country.capitals)
  assert.equal(review.namePtBr, country.namePtBr)
}
for (const id of sample) {
  assert.ok(
    anthems.find(
      (anthem) => anthem.countryId === id && anthem.status === 'available',
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
const liveCountries = await load('public/data/countries.json')
const liveManifest = await load('public/data/manifest.json')
const localFlags = (await load('data-sources/phase-2-flags.json')).flags
assert.equal(localFlags.length, catalog.length)
assert.equal(
  new Set(localFlags.map((flag) => flag.countryId)).size,
  catalog.length,
)
assert.equal(liveCountries.length, catalog.length)
for (const country of catalog) {
  const live = liveCountries.find((item) => item.id === country.id)
  assert.ok(live, country.id)
  assert.deepEqual(live.mapFeatureIds, country.mapFeatureIds)
  const flag = localFlags.find((item) => item.countryId === country.id)
  assert.ok(flag, country.id)
  assert.equal(flag.editorialReview, 'reviewed-2026-11-03')
  assert.equal(live.flagSrc, `/flags/${country.iso2.toLowerCase()}.svg`)
  assert.equal(live.namePtBr, country.namePtBr)
  assert.deepEqual(live.capitals, country.capitals)
  const bytes = await readFile(flag.path)
  assert.ok(bytes.toString().includes('<svg'))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), flag.sha256)
  const recording = anthems.find((item) => item.countryId === country.id)
  assert.ok(recording, country.id)
  assert.ok(['available', 'unavailable'].includes(recording.status), country.id)
  assert.equal(country.anthemAuditStatus, recording.status)
  assert.equal(live.anthem.status, recording.status)
  if (recording.status === 'available') {
    assert.equal(
      recording.path,
      `public/audio/anthems/${country.iso2.toLowerCase()}.mp3`,
    )
    assert.equal(live.anthem.src, `/${recording.path.slice('public/'.length)}`)
    assert.equal(recording.codec, 'mp3')
    assert.ok(recording.duration > 0 && recording.duration < 900, country.id)
    assert.ok(
      recording.attribution &&
        recording.license &&
        recording.licenseUrl &&
        recording.notice,
      country.id,
    )
    assert.match(
      recording.sourcePage,
      /^https:\/\/commons.wikimedia.org\/wiki\/File:/,
    )
    const media = await readFile(recording.path)
    assert.equal(media.length, recording.bytes)
    assert.equal(
      createHash('sha256').update(media).digest('hex'),
      recording.sha256,
    )
    for (const key of [
      'title',
      'attribution',
      'license',
      'licenseUrl',
      'sourcePage',
      'notice',
      'duration',
    ])
      assert.equal(live.anthem[key], recording[key], country.id)
  } else {
    assert.ok(recording.reason && recording.auditNote, country.id)
    assert.equal(live.anthem.reason, recording.reason)
  }
}
assert.equal(anthems.length, catalog.length)
assert.equal(
  new Set(anthems.map((item) => item.countryId)).size,
  catalog.length,
)
assert.equal(editorial.length, catalog.length)
if (anthemAudit.coverageDecision.status === 'accepted-temporary-exceptions') {
  assert.ok(anthemAudit.coverageDecision.acceptedOn)
  assert.equal(anthemAudit.coverageDecision.acceptedBy, 'user')
  for (const recording of anthems.filter(
    (item) => item.status === 'unavailable',
  ))
    assert.ok(
      anthemAudit.coverageDecision.unavailableCountryIds.includes(
        recording.countryId,
      ),
      `Exceção não aceita: ${recording.countryId}`,
    )
}
const credits = (await load('public/audio/credits.json')).recordings
const playable = anthems.filter((item) => item.status === 'available')
assert.equal(credits.length, playable.length)
for (const recording of playable) {
  const credit = credits.find((item) => item.countryId === recording.countryId)
  assert.ok(credit)
  assert.equal(credit.sha256, recording.sha256)
  assert.equal(credit.license, recording.license)
  assert.equal(credit.attribution, recording.attribution)
}
for (const asset of liveManifest.assets) {
  const bytes = await readFile(`public/data/${asset.name}`)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256)
}
console.log(
  `Catálogo íntegro: ${catalog.length} países, ${featureIds.size} geometrias, ${localFlags.length} bandeiras locais, ${anthems.filter((item) => item.status === 'available').length} hinos locais e ${anthems.filter((item) => item.status === 'unavailable').length} lacunas explícitas.`,
)
