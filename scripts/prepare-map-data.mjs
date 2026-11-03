import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { topology } from 'topojson-server'

const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const source = await read('data-sources/natural-earth-50m.geojson')
const catalog = await read('data-sources/catalog.json')
const anthems = (await read('data-sources/anthems.json')).records
// Shared arcs + delta quantization. No islands or rings are removed.
const world = topology({ countries: source }, 100_000)
const countries = catalog.map((country) => ({
  id: country.id,
  iso2: country.iso2,
  namePtBr: country.namePtBr,
  aliases: country.aliases,
  capitals: country.capitals,
  capitalNote: country.capitalNote,
  ...(country.capitalLabel ? { capitalLabel: country.capitalLabel } : {}),
  focusPoint: country.focusPoint,
  mapFeatureIds: country.mapFeatureIds,
  flagSrc: `/flags/${country.iso2.toLowerCase()}.svg`,
  anthem: (() => {
    const recording = anthems.find((item) => item.countryId === country.id)
    if (!recording) throw new Error(`Hino não auditado: ${country.id}`)
    if (!['available', 'unavailable'].includes(recording.status))
      throw new Error(`Auditoria de hino incompleta: ${country.id}`)
    return recording.status === 'available'
      ? {
          status: 'available',
          src: `/${recording.path.replace(/^public\//, '')}`,
          title: recording.title,
          duration: recording.duration,
          attribution: recording.attribution,
          sourcePage: recording.sourcePage,
          license: recording.license,
          licenseUrl: recording.licenseUrl,
          notice: recording.notice,
        }
      : {
          status: 'unavailable',
          reason:
            recording.reason ??
            'Este hino ainda não está disponível. Tente outro país.',
        }
  })(),
}))
await mkdir('public/data', { recursive: true })
const assets = []
for (const [name, data] of [
  ['countries.json', countries],
  ['world.topo.json', world],
]) {
  const content = JSON.stringify(data)
  await writeFile(`public/data/${name}`, content)
  assets.push({
    name,
    bytes: Buffer.byteLength(content),
    sha256: createHash('sha256').update(content).digest('hex'),
  })
}
await writeFile(
  'public/data/manifest.json',
  JSON.stringify(
    {
      version: 1,
      sources: [
        'https://github.com/nvkelso/natural-earth-vector',
        'https://github.com/mledoze/countries',
        'https://www.wikidata.org/',
        'https://github.com/unicode-org/cldr-json',
        'https://commons.wikimedia.org/',
      ],
      attribution:
        'Made with Natural Earth. Country metadata derived from mledoze/countries (ODbL-1.0), reviewed with Wikidata (CC0) and Unicode CLDR (Unicode-3.0). Anthem credits and licenses are individual.',
      metadataLicense: '/licenses/countries-ODbL-1.0.txt',
      nameLicense: '/licenses/unicode-cldr.txt',
      audioCredits: '/audio/credits.json',
      quantization: 100_000,
      assets,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `${countries.length} países; ${world.objects.countries.geometries.length} geometrias.`,
  assets.map((a) => `${a.name}: ${(a.bytes / 1024).toFixed(0)} KiB`).join('; '),
)
