import { parseAtlas, type AtlasData } from '../domain/atlas/schema.ts'

export async function loadAtlas(signal: AbortSignal): Promise<AtlasData> {
  const base = import.meta.env.BASE_URL
  const responses = await Promise.all(
    ['countries.json', 'world.topo.json'].map((name) =>
      fetch(`${base}data/${name}`, { signal }),
    ),
  )
  if (responses.some((response) => !response.ok))
    throw new Error('Não foi possível carregar o atlas')
  const [catalog, topology]: unknown[] = await Promise.all(
    responses.map((response) => response.json()),
  )
  const atlas = parseAtlas(catalog, topology)
  return {
    ...atlas,
    countries: atlas.countries.map((country) => ({
      ...country,
      flagSrc: `${base}${country.flagSrc.slice(1)}`,
    })),
  }
}
