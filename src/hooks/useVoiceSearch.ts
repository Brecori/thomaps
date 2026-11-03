import { useCallback, useEffect, useRef, useState } from 'react'
import {
  recognitionConstructor,
  recognitionErrorMessage,
  type RecognitionClient,
} from '@/services/speechRecognition'

export type VoiceState = {
  status:
    'idle' | 'starting' | 'listening' | 'processing' | 'error' | 'unavailable'
  message: string
}

/** A single, explicit session. Clearing handlers invalidates late browser events. */
export function useVoiceSearch(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceState>(() =>
    recognitionConstructor()
      ? { status: 'idle', message: '' }
      : { status: 'unavailable', message: '' },
  )
  const session = useRef<RecognitionClient | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const transcript = useRef(onTranscript)
  useEffect(() => {
    transcript.current = onTranscript
  }, [onTranscript])

  const dispose = useCallback(() => {
    clearTimeout(timeout.current)
    timeout.current = undefined
    const current = session.current
    session.current = null
    if (!current) return
    current.onstart =
      current.onaudioend =
      current.onresult =
      current.onerror =
      current.onnomatch =
      current.onend =
        null
    try {
      current.abort()
    } catch {
      /* The browser may already have ended capture. */
    }
  }, [])

  const cancel = useCallback(
    (message = '') => {
      if (session.current) {
        dispose()
        setState({ status: 'idle', message })
      } else {
        setState((previous) =>
          previous.status === 'unavailable'
            ? { ...previous, message: '' }
            : { status: 'idle', message: '' },
        )
      }
    },
    [dispose],
  )

  useEffect(() => {
    const hide = () => {
      if (document.hidden) cancel('A escuta foi encerrada.')
    }
    const leave = () => cancel('A escuta foi encerrada.')
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', leave)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', leave)
      dispose()
    }
  }, [cancel, dispose])

  const start = () => {
    if (session.current) return
    const Recognition = recognitionConstructor()
    if (!Recognition) {
      setState({
        status: 'unavailable',
        message:
          'A voz não está disponível neste navegador. Você pode digitar o país.',
      })
      return
    }
    try {
      const current = new Recognition()
      session.current = current
      current.lang = 'pt-BR'
      current.continuous = false
      current.interimResults = false
      current.maxAlternatives = 1
      const fail = (error: string) => {
        if (session.current !== current) return
        dispose()
        setState({
          status: error === 'aborted' ? 'idle' : 'error',
          message:
            error === 'aborted'
              ? 'Busca por voz cancelada.'
              : recognitionErrorMessage(error),
        })
      }
      current.onstart = () => {
        if (session.current === current)
          setState({
            status: 'listening',
            message: 'Estou ouvindo! Fale o nome de um país.',
          })
      }
      current.onaudioend = () => {
        if (session.current === current)
          setState({
            status: 'processing',
            message: 'Procurando o país que você falou…',
          })
      }
      current.onresult = (event) => {
        if (session.current !== current) return
        const result = Array.from(event.results)
          .slice(event.resultIndex)
          .find((item) => item.isFinal)
        if (!result) return
        const text = result[0]?.transcript.trim()
        if (!text) {
          fail('no-speech')
          return
        }
        dispose()
        setState({
          status: 'idle',
          message: `Ouvi “${text}”. Escolha um país.`,
        })
        transcript.current(text)
      }
      current.onerror = (event) => fail(event.error)
      current.onnomatch = () => fail('no-speech')
      current.onend = () => fail('no-speech')
      timeout.current = setTimeout(() => fail('no-speech'), 20_000)
      setState({ status: 'starting', message: 'Preparando o microfone…' })
      current.start()
    } catch (error) {
      dispose()
      setState({
        status: 'error',
        message: recognitionErrorMessage(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'not-allowed'
            : 'unknown',
        ),
      })
    }
  }
  return {
    ...state,
    active: ['starting', 'listening', 'processing'].includes(state.status),
    start,
    cancel,
  }
}
