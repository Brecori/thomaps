import type { Anthem } from './anthem'

/** Presentation contract shared by the details card and the validated atlas. */
export type CountrySummary = {
  id: string
  namePtBr: string
  capitals: string[]
  flagSrc: string
  capitalNote?: string | null
  capitalLabel?: string
  anthem: Anthem
}
