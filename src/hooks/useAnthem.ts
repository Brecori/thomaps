import { useCallback, useEffect, useRef, useState } from 'react'
import type { AvailableAnthem } from '@/domain/anthem'
import { createAnthemAudio } from '@/services/anthemAudio'

type Playback = {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'
  currentTime: number
  duration: number
  message: string
}
const initial: Playback = {
  status: 'idle',
  currentTime: 0,
  duration: 0,
  message: '',
}

/** Owns one lazy media session. Retired sessions cannot update the current one. */
export function useAnthem() {
  const [state, setState] = useState<Playback>(initial)
  const session = useRef<{
    audio: HTMLAudioElement
    src: string
    dispose: () => void
  } | null>(null)
  const operation = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const clearTimer = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = undefined
  }, [])
  const stop = useCallback(() => {
    operation.current++
    clearTimer()
    const retired = session.current
    session.current = null
    retired?.dispose()
    setState(initial)
  }, [clearTimer])
  const pause = useCallback(() => {
    const current = session.current
    if (!current) return
    operation.current++
    clearTimer()
    current.audio.pause()
    setState((previous) =>
      previous.status === 'playing' || previous.status === 'loading'
        ? { ...previous, status: 'paused', message: 'Hino pausado.' }
        : previous,
    )
  }, [clearTimer])

  const play = (media: AvailableAnthem, restart = false) => {
    if (session.current?.src !== media.src || state.status === 'error') stop()
    const token = ++operation.current
    try {
      if (!session.current) {
        // No media element, URL assignment or request before this user action.
        const audio = createAnthemAudio()
        const controller = new AbortController()
        const current = {
          audio,
          src: media.src,
          dispose: () => {
            controller.abort()
            audio.pause()
            audio.removeAttribute('src')
            audio.load()
          },
        }
        session.current = current
        const listen = (name: string, callback: () => void) =>
          audio.addEventListener(
            name,
            () => {
              if (session.current === current) callback()
            },
            { signal: controller.signal },
          )
        const fail = () => {
          operation.current++
          clearTimer()
          audio.pause()
          setState((previous) => ({
            ...previous,
            status: 'error',
            message:
              'Não conseguimos tocar o hino. Confira a conexão e tente de novo.',
          }))
        }
        const wait = () => {
          clearTimer()
          setState((previous) => ({
            ...previous,
            status: 'loading',
            message: 'Carregando o hino…',
          }))
          timer.current = setTimeout(fail, 20_000)
        }
        listen('waiting', () => {
          if (!audio.paused) wait()
        })
        listen('playing', () => {
          if (audio.paused) return
          clearTimer()
          setState((previous) => ({
            ...previous,
            status: 'playing',
            message: 'Tocando o hino.',
          }))
        })
        listen('timeupdate', () =>
          setState((previous) => ({
            ...previous,
            currentTime: audio.currentTime,
          })),
        )
        listen('durationchange', () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0)
            setState((previous) => ({ ...previous, duration: audio.duration }))
        })
        listen('pause', () => {
          clearTimer()
          setState((previous) =>
            previous.status === 'error' || previous.status === 'ended'
              ? previous
              : { ...previous, status: 'paused', message: 'Hino pausado.' },
          )
        })
        listen('ended', () => {
          clearTimer()
          setState((previous) => ({
            ...previous,
            status: 'ended',
            currentTime: audio.duration,
            message: 'O hino terminou. Vamos ouvir de novo?',
          }))
        })
        listen('error', fail)
        audio.src = media.src
      }
      const audio = session.current.audio
      if (restart || audio.ended) audio.currentTime = 0
      setState((previous) => ({
        ...previous,
        status: 'loading',
        duration: previous.duration || media.duration,
        currentTime: audio.currentTime,
        message: 'Carregando o hino…',
      }))
      clearTimer()
      timer.current = setTimeout(() => {
        if (token !== operation.current) return
        operation.current++
        audio.pause()
        setState((previous) => ({
          ...previous,
          status: 'error',
          message: 'O hino demorou para carregar. Tente de novo.',
        }))
      }, 20_000)
      // Called synchronously within the gesture, including on mobile Safari.
      void audio.play().catch((error: unknown) => {
        if (token !== operation.current) return
        clearTimer()
        audio.pause()
        setState((previous) => ({
          ...previous,
          status: 'error',
          message:
            error instanceof DOMException && error.name === 'NotAllowedError'
              ? 'Toque em Ouvir hino para tentar novamente.'
              : 'Não conseguimos tocar o hino. Confira a conexão e tente de novo.',
        }))
      })
    } catch {
      clearTimer()
      setState({
        ...initial,
        status: 'error',
        message: 'Este aparelho não conseguiu reproduzir o hino.',
      })
    }
  }

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stop()
    }
    window.addEventListener('pagehide', stop)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', stop)
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [stop])

  return {
    ...state,
    active: state.status === 'playing' || state.status === 'loading',
    play,
    pause,
    stop,
  }
}
