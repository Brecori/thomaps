import { useEffect, useState } from 'react'
import { loadAtlas } from '@/services/loadAtlas'
import type { AtlasData } from '@/domain/atlas/schema'

type AtlasState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: AtlasData }

export function useAtlasData() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<AtlasState>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    loadAtlas(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [attempt])
  const retry = () => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }
  return { state, retry }
}
