import {
  geoArea,
  geoBounds,
  geoCentroid,
  geoContains,
  geoDistance,
  geoEquirectangular,
  geoPath,
} from 'd3-geo'
import type { Feature, Polygon } from 'geojson'
import type { Country, MapFeature } from './schema.ts'

export type Frame = { x: number; y: number; width: number; height: number }
export type ViewTransform = { x: number; y: number; k: number }
export const MIN_ZOOM = 1
export const MAX_ZOOM = 32

/** The map must cover the viewport, including on a portrait screen. */
export function minimumZoom(
  bounds: [[number, number], [number, number]],
  viewport: Frame,
) {
  return Math.max(
    MIN_ZOOM,
    viewport.width / Math.max(1, bounds[1][0] - bounds[0][0]),
    viewport.height / Math.max(1, bounds[1][1] - bounds[0][1]),
  )
}

export function selectedFeatures(country: Country, features: MapFeature[]) {
  return features.filter((shape) => country.mapFeatureIds.includes(shape.id))
}

export function createProjection(frame: Frame) {
  return geoEquirectangular().fitExtent(
    [
      [frame.x, frame.y],
      [
        frame.x + Math.max(32, frame.width),
        frame.y + Math.max(32, frame.height),
      ],
    ],
    { type: 'Sphere' },
  )
}

/** Focus the home region when distant overseas polygons would dominate the bounds. */
export function focusGeometry(country: Country, features: MapFeature[]) {
  const shapes = selectedFeatures(country, features)
  const polygons: Feature<Polygon>[] = shapes.flatMap((shape) => {
    const coordinates =
      shape.geometry.type === 'Polygon'
        ? [shape.geometry.coordinates]
        : shape.geometry.coordinates
    return coordinates.map((rings) => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Polygon' as const, coordinates: rings },
    }))
  })
  const main =
    polygons.find((polygon) => geoContains(polygon, country.focusPoint)) ??
    [...polygons].sort(
      (a, b) =>
        geoDistance(geoCentroid(a), country.focusPoint) -
        geoDistance(geoCentroid(b), country.focusPoint),
    )[0]
  const maximumDistance = Math.max(0.3, Math.sqrt(geoArea(main)) * 2)
  const nearby = polygons.filter(
    (polygon) =>
      polygon === main ||
      geoDistance(geoCentroid(polygon), geoCentroid(main)) <= maximumDistance,
  )
  const region = { type: 'FeatureCollection' as const, features: nearby }
  const bounds = geoBounds(region)
  // Keep the map fixed: focus the main island when islands straddle its edges.
  return bounds[0][0] > bounds[1][0]
    ? { type: 'FeatureCollection' as const, features: [main] }
    : region
}

export function fitBounds(
  bounds: [[number, number], [number, number]],
  frame: Frame,
  maximumZoom = MAX_ZOOM,
): ViewTransform {
  const dx = Math.max(1, bounds[1][0] - bounds[0][0])
  const dy = Math.max(1, bounds[1][1] - bounds[0][1])
  const k = Math.max(
    MIN_ZOOM,
    Math.min(maximumZoom, Math.min(frame.width / dx, frame.height / dy) * 0.78),
  )
  return {
    k,
    x: frame.x + frame.width / 2 - ((bounds[0][0] + bounds[1][0]) / 2) * k,
    y: frame.y + frame.height / 2 - ((bounds[0][1] + bounds[1][1]) / 2) * k,
  }
}

export function targetView(
  country: Country | undefined,
  features: MapFeature[],
  projection: ReturnType<typeof createProjection>,
  frame: Frame,
  viewport: Frame,
) {
  const path = geoPath(projection)
  if (!country) {
    const bounds = path.bounds({ type: 'Sphere' })
    const k = minimumZoom(bounds, viewport)
    return {
      k,
      x: viewport.width / 2 - ((bounds[0][0] + bounds[1][0]) / 2) * k,
      y: viewport.height / 2 - ((bounds[0][1] + bounds[1][1]) / 2) * k,
    }
  }
  return fitBounds(path.bounds(focusGeometry(country, features)), frame)
}

/** Stop zoom and pan at the viewport edges without exposing empty space. */
export function constrainView(
  view: ViewTransform,
  bounds: [[number, number], [number, number]],
  frame: Frame,
): ViewTransform {
  const k = Math.max(minimumZoom(bounds, frame), Math.min(MAX_ZOOM, view.k))
  const limit = (offset: number, start: number, end: number, axis: 0 | 1) => {
    const minimum = bounds[0][axis] * k
    const maximum = bounds[1][axis] * k
    if (maximum - minimum <= end - start)
      return (start + end - minimum - maximum) / 2
    return Math.max(end - maximum, Math.min(start - minimum, offset))
  }
  return {
    k,
    x: limit(view.x, frame.x, frame.x + frame.width, 0),
    y: limit(view.y, frame.y, frame.y + frame.height, 1),
  }
}
