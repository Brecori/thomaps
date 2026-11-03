import type { Country } from './schema'

export function normalizeCountryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim()
}

/** Names and catalog aliases share the same accent-insensitive search. */
export function searchCountries(countries: Country[], query: string) {
  const term = normalizeCountryName(query)
  if (!term) return []
  return countries
    .map((country) => {
      const name = normalizeCountryName(country.namePtBr)
      const aliases = country.aliases.map(normalizeCountryName)
      const score =
        name === term
          ? 0
          : aliases.includes(term)
            ? 1
            : name.startsWith(term)
              ? 2
              : aliases.some((alias) => alias.startsWith(term))
                ? 3
                : [name, ...aliases].some((value) => value.includes(term))
                  ? 4
                  : Infinity
      return { country, score }
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.country.namePtBr.localeCompare(b.country.namePtBr, 'pt-BR'),
    )
    .map(({ country }) => country)
}
