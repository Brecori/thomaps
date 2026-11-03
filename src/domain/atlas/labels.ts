import { geoPath, geoStream, type GeoProjection } from 'd3-geo'
import { focusGeometry } from './geometry'
import type { Country, MapFeature } from './schema'

type Point = [number, number]
export type CountryLabel = {
  id: string
  name: string
  x: number
  y: number
  radius: number
  lines: string[]
}

function labelLines(name: string) {
  const words = name.split(' ')
  if (name.length <= 12 || words.length === 1) return [name]
  let split = 1
  let width = Infinity
  for (let i = 1; i < words.length; i++) {
    const longest = Math.max(
      words.slice(0, i).join(' ').length,
      words.slice(i).join(' ').length,
    )
    if (longest < width) {
      split = i
      width = longest
    }
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')]
}

/** Signed distance to the projected boundary, including holes and clipped islands. */
function interiorDistance([x, y]: Point, rings: Point[][]) {
  let inside = false
  let distanceSquared = Infinity
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j],
        [bx, by] = ring[i]
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax)
        inside = !inside
      const dx = bx - ax,
        dy = by - ay
      const lengthSquared = dx * dx + dy * dy
      const t = lengthSquared
        ? Math.max(
            0,
            Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
          )
        : 0
      distanceSquared = Math.min(
        distanceSquared,
        (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2,
      )
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(distanceSquared)
}

function ringArea(ring: Point[]) {
  return Math.abs(
    ring.reduce((sum, point, i) => {
      const next = ring[(i + 1) % ring.length]
      return sum + point[0] * next[1] - next[0] * point[1]
    }, 0),
  )
}

/** Compute once per projection, never during pan/zoom. */
export function countryLabels(
  countries: Country[],
  features: MapFeature[],
  projection: GeoProjection,
): CountryLabel[] {
  const path = geoPath(projection)
  return countries.flatMap((country) => {
    const region = focusGeometry(country, features)
    const main = region.features.reduce((largest, polygon) =>
      path.area(polygon) > path.area(largest) ? polygon : largest,
    )
    const rings: Point[][] = []
    let ring: Point[] = []
    geoStream(
      main,
      projection.stream({
        point: (x, y) => {
          ring.push([x, y])
        },
        lineStart: () => {
          ring = []
        },
        lineEnd: () => {
          if (ring.length >= 3) rings.push(ring)
        },
        polygonStart: () => {},
        polygonEnd: () => {},
        sphere: () => {},
      }),
    )
    if (!rings.length) return []
    const largest = rings.reduce((a, b) => (ringArea(a) > ringArea(b) ? a : b))
    const xs = largest.map((point) => point[0]),
      ys = largest.map((point) => point[1])
    const left = Math.min(...xs),
      top = Math.min(...ys)
    const width = Math.max(...xs) - left,
      height = Math.max(...ys) - top
    let best = { x: left + width / 2, y: top + height / 2, radius: 0 }
    const consider = (x: number, y: number) => {
      const radius = interiorDistance([x, y], rings)
      if (radius > best.radius) best = { x, y, radius }
    }
    const centroid = path.centroid(main)
    consider(centroid[0], centroid[1])
    // Find a central interior area rather than placing text over water in concave countries.
    for (let x = 0; x < 9; x++)
      for (let y = 0; y < 9; y++)
        consider(left + ((x + 0.5) * width) / 9, top + ((y + 0.5) * height) / 9)
    let step = Math.max(width, height) / 9
    for (let pass = 0; pass < 3; pass++) {
      const center = best
      for (let x = -1; x <= 1; x++)
        for (let y = -1; y <= 1; y++)
          consider(center.x + x * step, center.y + y * step)
      step /= 2
    }
    return best.radius > 0
      ? [
          {
            id: country.id,
            name: country.namePtBr,
            lines: labelLines(country.namePtBr),
            ...best,
          },
        ]
      : []
  })
}
