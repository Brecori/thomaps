import { useCallback, useEffect, useRef, useState } from 'react'
import {
  countryUtterance,
  pronunciationErrorMessage,
  readSpeechVoice,
  speechSynthesisClient,
} from '@/services/speechSynthesis'

type PlaybackState = {
  status: 'idle' | 'starting' | 'speaking' | 'error'
  message: string
}
const idle: PlaybackState = { status: 'idle', message: '' }

/** Owns one utterance; cancellation invalidates callbacks before clearing the native queue. */
export function usePronunciation() {
  const [availability, setAvailability] = useState(() => readSpeechVoice())
  const [playback, setPlayback] = useState<PlaybackState>(idle)
  const session = useRef<SpeechSynthesisUtterance | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const dispose = useCallback(() => {
    clearTimeout(timeout.current)
    timeout.current = undefined
    const current = session.current
    session.current = null
    if (current) current.onstart = current.onend = current.onerror = null
    try {
      speechSynthesisClient()?.cancel()
    } catch {
      /* An unavailable engine may already have stopped. */
    }
  }, [])

  const stop = useCallback(() => {
    dispose()
    setPlayback(idle)
  }, [dispose])

  useEffect(() => {
    const client = speechSynthesisClient()
    if (!client) return
    let mounted = true
    let waiting = true
    const refresh = () => {
      if (mounted) setAvailability(readSpeechVoice(waiting))
    }
    client.addEventListener('voiceschanged', refresh)
    // Recheck after subscribing, including engines that load voices asynchronously.
    const initialRefresh = setTimeout(refresh, 0)
    const deadline = setTimeout(() => {
      waiting = false
      refresh()
    }, 3000)
    return () => {
      mounted = false
      clearTimeout(initialRefresh)
      clearTimeout(deadline)
      client.removeEventListener('voiceschanged', refresh)
    }
  }, [])

  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop()
    }
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', stop)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', stop)
      dispose()
    }
  }, [dispose, stop])

  const speak = (name: string) => {
    dispose()
    const voice = readSpeechVoice(false)
    setAvailability(voice)
    const client = speechSynthesisClient()
    if (voice.status !== 'available' || !client) {
      setPlayback(idle)
      return
    }
    try {
      const utterance = countryUtterance(name, voice.voice)
      session.current = utterance
      const fail = (error: string) => {
        if (session.current !== utterance) return
        dispose()
        setPlayback(
          error === 'canceled' || error === 'interrupted'
            ? idle
            : { status: 'error', message: pronunciationErrorMessage(error) },
        )
      }
      utterance.onstart = () => {
        if (session.current === utterance)
          setPlayback({
            status: 'speaking',
            message: `Ouvindo o nome: ${name}.`,
          })
      }
      utterance.onend = () => {
        if (session.current !== utterance) return
        clearTimeout(timeout.current)
        timeout.current = undefined
        session.current = null
        utterance.onstart = utterance.onend = utterance.onerror = null
        setPlayback(idle)
      }
      utterance.onerror = (event) => fail(event.error)
      timeout.current = setTimeout(() => fail('timeout'), 15_000)
      setPlayback({
        status: 'starting',
        message: `Preparando o nome: ${name}.`,
      })
      // Keep speak in the user gesture; do not auto-play after voiceschanged.
      client.speak(utterance)
    } catch {
      dispose()
      setPlayback({
        status: 'error',
        message: pronunciationErrorMessage('unknown'),
      })
    }
  }

  return {
    active: playback.status === 'starting' || playback.status === 'speaking',
    available: availability.status === 'available',
    status:
      playback.status !== 'idle'
        ? playback.status
        : availability.status === 'available'
          ? 'idle'
          : availability.status,
    message: playback.message || availability.message,
    speak,
    stop,
  }
}
