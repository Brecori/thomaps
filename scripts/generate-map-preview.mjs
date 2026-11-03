import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { geoArea, geoEqualEarth, geoPath, geoGraticule10 } from 'd3-geo'

// A noninteractive illustration for T04, not the map engine delivered in T05.
const data = JSON.parse(
  await readFile('data-sources/natural-earth-50m.geojson', 'utf8'),
)
const width = 1440,
  height = 760
// Simplification applies only to the illustration; keep the audited source intact.
function simplifyLine(points, tolerance = 0.08) {
  if (points.length < 5) return points
  const first = points[0],
    last = points.at(-1)
  const dx = last[0] - first[0],
    dy = last[1] - first[1]
  const length = dx * dx + dy * dy
  let furthest = 0,
    index = 0
  for (let i = 1; i < points.length - 1; i++) {
    const t = length
      ? Math.max(
          0,
          Math.min(
            1,
            ((points[i][0] - first[0]) * dx + (points[i][1] - first[1]) * dy) /
              length,
          ),
        )
      : 0
    const distance =
      (points[i][0] - first[0] - t * dx) ** 2 +
      (points[i][1] - first[1] - t * dy) ** 2
    if (distance > furthest) {
      furthest = distance
      index = i
    }
  }
  if (furthest <= tolerance * tolerance) return [first, last]
  return [
    ...simplifyLine(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplifyLine(points.slice(index), tolerance),
  ]
}
function simplifyRing(ring) {
  const simplified = simplifyLine(ring)
  return simplified.length >= 4 ? simplified : ring
}
const features = data.features
  .filter((f) => f.properties.continent !== 'Antarctica')
  .map((f) => {
    const simplified = {
      ...f,
      geometry: {
        ...f.geometry,
        coordinates:
          f.geometry.type === 'Polygon'
            ? f.geometry.coordinates.map(simplifyRing)
            : f.geometry.coordinates.map((polygon) =>
                polygon.map(simplifyRing),
              ),
      },
    }
    // Avoid reversing small rings or changing the spherical interior near the seam.
    const area = geoArea(f)
    return Math.abs(geoArea(simplified) - area) > Math.max(0.0001, area * 0.1)
      ? f
      : simplified
  })
const projection = geoEqualEarth().fitExtent(
  [
    [12, 24],
    [width - 12, height - 24],
  ],
  { type: 'FeatureCollection', features },
)
const path = geoPath(projection).digits(1)
const palettes = {
  'North America': ['#f8c65c', '#f3b566', '#ffd782'],
  'South America': ['#6fc6a0', '#8dd6aa', '#a4d485'],
  Europe: ['#b69bdf', '#c5aae8', '#d4b6eb'],
  Africa: ['#efab88', '#f6bc83', '#f4cf82'],
  Asia: ['#f3b2bc', '#efc58c', '#eecf82'],
  Oceania: ['#82bdde', '#97cce0', '#a5c9e9'],
}
const countries = features
  .map((f, i) => {
    const palette = palettes[f.properties.continent] ?? ['#c6d9d3']
    return `<path d="${path(f)}" fill="${palette[i % palette.length]}"/>`
  })
  .join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><title>Mapa-múndi ilustrado</title><desc>Prévia estática com dados Natural Earth, projeção Equal Earth. Cores decorativas.</desc><path d="${path({ type: 'Sphere' })}" fill="#d7f0f8"/><path d="${path(geoGraticule10())}" fill="none" stroke="#add8e6" stroke-width=".65" stroke-dasharray="3 5" opacity=".65"/><g stroke="#ffffff" stroke-width="1" stroke-linejoin="round">${countries}</g></svg>`
await mkdir('public/illustrations', { recursive: true })
await writeFile('public/illustrations/world-preview.svg', svg)
console.log(
  `Prévia estática: ${features.length} geometrias, ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KiB.`,
)
