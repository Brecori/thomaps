import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { topology } from 'topojson-server'

const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const source = await read('data-sources/natural-earth-50m.geojson')
const catalog = await read('data-sources/catalog.json')
// Shared arcs + delta quantization. No islands or rings are removed.
const world = topology({ countries: source }, 100_000)
const countries = catalog.map((country) => ({
  id: country.id,
  iso2: country.iso2,
  namePtBr: country.namePtBr,
  aliases: country.aliases,
  capitals: country.capitals,
  capitalNote: country.id === 'PSE' ? null : country.capitalNote,
  ...(country.id === 'PSE' ? { capitalLabel: 'Sede administrativa' } : {}),
  focusPoint: country.focusPoint,
  mapFeatureIds: country.mapFeatureIds,
  flagSrc: `/flags/${country.iso2.toLowerCase()}.svg`,
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
      ],
      attribution:
        'Made with Natural Earth. Country metadata derived from mledoze/countries (ODbL-1.0).',
      metadataLicense: '/licenses/countries-ODbL-1.0.txt',
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
