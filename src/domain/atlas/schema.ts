import { z } from '../validation'
import { feature } from 'topojson-client'
import { anthemSchema } from '../anthem'

const position = z.tuple([z.number().finite(), z.number().finite()])
const geographicPosition = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])
const ring = z
  .array(geographicPosition)
  .min(4)
  .refine(
    (points) =>
      points[0][0] === points.at(-1)![0] && points[0][1] === points.at(-1)![1],
    'O anel precisa ser fechado',
  )
const countrySchema = z.object({
  id: z.string().regex(/^[A-Z]{3}$/),
  iso2: z.string().regex(/^[A-Z]{2}$/),
  namePtBr: z.string().min(1),
  aliases: z.array(z.string()),
  capitals: z.array(z.string().min(1)).min(1),
  capitalNote: z.string().nullable(),
  capitalLabel: z.string().min(1).optional(),
  focusPoint: geographicPosition,
  mapFeatureIds: z.array(z.string().min(1)).min(1),
  flagSrc: z.string().regex(/^\/flags\/[a-z]{2}\.svg$/),
  anthem: anthemSchema,
})
const properties = z.object({
  id: z.string(),
  iso3: z.string(),
  name: z.string(),
  continent: z.string(),
})
const arc = z.array(z.number().int())
const topologyGeometry = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Polygon'),
    id: z.string(),
    properties,
    arcs: z.array(arc).min(1),
  }),
  z.object({
    type: z.literal('MultiPolygon'),
    id: z.string(),
    properties,
    arcs: z.array(z.array(arc).min(1)).min(1),
  }),
])
const topologySchema = z.object({
  type: z.literal('Topology'),
  transform: z.object({ scale: position, translate: position }),
  arcs: z.array(z.array(position).min(2)),
  objects: z.object({
    countries: z.object({
      type: z.literal('GeometryCollection'),
      geometries: z.array(topologyGeometry),
    }),
  }),
})
const featureSchema = z.object({
  type: z.literal('Feature'),
  id: z.string(),
  properties,
  geometry: z.discriminatedUnion('type', [
    z.object({ type: z.literal('Polygon'), coordinates: z.array(ring).min(1) }),
    z.object({
      type: z.literal('MultiPolygon'),
      coordinates: z.array(z.array(ring).min(1)).min(1),
    }),
  ]),
})
export type Country = z.infer<typeof countrySchema>
export type MapFeature = z.infer<typeof featureSchema>
export type AtlasData = { countries: Country[]; features: MapFeature[] }

/** Parse unknown input, including decoded rings and the country/geometry join. */
export function parseAtlas(
  catalogInput: unknown,
  topologyInput: unknown,
): AtlasData {
  const countries = z.array(countrySchema).length(195).parse(catalogInput)
  const topology = topologySchema.parse(topologyInput)
  const decoded = feature(topology, topology.objects.countries)
  const features = z.array(featureSchema).parse(decoded.features)
  const countryIds = new Set(countries.map((country) => country.id))
  const featureIds = new Set(features.map((shape) => shape.id))
  if (
    countryIds.size !== countries.length ||
    featureIds.size !== features.length
  )
    throw new Error('Identificadores duplicados no atlas')
  const assigned = new Set<string>()
  for (const country of countries) {
    for (const id of country.mapFeatureIds) {
      if (!featureIds.has(id) || assigned.has(id))
        throw new Error('Correspondência de país inválida')
      assigned.add(id)
    }
  }
  return { countries, features }
}
