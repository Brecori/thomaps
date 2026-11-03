const continentTokens: Record<string, string> = {
  'North America': 'north',
  'South America': 'south',
  Europe: 'europe',
  Africa: 'africa',
  Asia: 'asia',
  Oceania: 'oceania',
  Antarctica: 'antarctica',
}

/** One soft pastel per continent; saturated color is reserved for selection. */
export function countryColor(continent: string) {
  return `var(--color-country-${continentTokens[continent] ?? 'context'})`
}
