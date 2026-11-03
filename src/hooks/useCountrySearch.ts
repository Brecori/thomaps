import { useMemo, useReducer } from 'react'
import type { Country } from '@/domain/atlas/schema'
import { searchCountries } from '@/domain/atlas/search'

const initial = { query: '', open: false, activeIndex: -1 }
type SearchAction =
  | { type: 'query'; value: string }
  | { type: 'open'; value: boolean }
  | { type: 'active'; index: number }
  | { type: 'clear' }

function reducer(state: typeof initial, action: SearchAction) {
  switch (action.type) {
    case 'query':
      return { query: action.value, open: true, activeIndex: -1 }
    case 'open':
      return { ...state, open: action.value, activeIndex: -1 }
    case 'active':
      return { ...state, open: true, activeIndex: action.index }
    case 'clear':
      return initial
  }
}

export const SEARCH_PAGE_SIZE = 3

export function useCountrySearch(countries: Country[]) {
  const [state, dispatch] = useReducer(reducer, initial)
  const results = useMemo(
    () => searchCountries(countries, state.query),
    [countries, state.query],
  )
  const pageStart =
    Math.floor(Math.max(0, state.activeIndex) / SEARCH_PAGE_SIZE) *
    SEARCH_PAGE_SIZE
  return {
    ...state,
    results,
    pageStart,
    setQuery: (value: string) => dispatch({ type: 'query', value }),
    setOpen: (value: boolean) => dispatch({ type: 'open', value }),
    setActive: (index: number) => dispatch({ type: 'active', index }),
    move: (direction: 1 | -1) => {
      if (!results.length) return
      const index = state.open ? state.activeIndex : -1
      dispatch({
        type: 'active',
        index:
          index < 0
            ? direction === 1
              ? 0
              : results.length - 1
            : (index + direction + results.length) % results.length,
      })
    },
    clear: () => dispatch({ type: 'clear' }),
  }
}
