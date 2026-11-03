import type { AtlasData } from '../domain/atlas/schema.ts'

export async function loadAtlas(signal: AbortSignal): Promise<AtlasData> {
  const base = import.meta.env.BASE_URL
  const responsesPromise = Promise.all(
    ['countries.json', 'world.topo.json'].map((name) =>
      fetch(`${base}data/${name}`, { signal }),
    ),
  )
  const [{ parseAtlas }, responses] = await Promise.all([
    import('../domain/atlas/schema.ts'),
    responsesPromise,
  ])
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
      anthem:
        country.anthem.status === 'available'
          ? { ...country.anthem, src: `${base}${country.anthem.src.slice(1)}` }
          : country.anthem,
    })),
  }
}
