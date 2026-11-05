import { useSyncExternalStore } from 'react'

const query =
  '(max-width: 767px), (max-height: 550px) and (orientation: landscape)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const snapshot = () => window.matchMedia(query).matches

export function useCompactLayout() {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
