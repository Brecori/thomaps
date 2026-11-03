export type SpeechVoiceAvailability =
  | { status: 'available'; voice: SpeechSynthesisVoice; message: '' }
  | { status: 'loading' | 'unavailable'; voice: null; message: string }

export function speechSynthesisClient() {
  return typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance === 'function'
    ? window.speechSynthesis
    : undefined
}

/** Explicit Brazilian Portuguese only; prefer local voices without changing language. */
export function readSpeechVoice(allowLoading = true): SpeechVoiceAvailability {
  const client = speechSynthesisClient()
  if (!client)
    return {
      status: 'unavailable',
      voice: null,
      message: 'Não é possível ouvir o nome neste navegador.',
    }
  try {
    const voices = client.getVoices()
    const voice = voices
      .filter((item) => /^pt-br(?:-|$)/i.test(item.lang.replaceAll('_', '-')))
      .sort(
        (a, b) =>
          Number(b.localService) - Number(a.localService) ||
          Number(b.default) - Number(a.default),
      )[0]
    if (voice) return { status: 'available', voice, message: '' }
    if (!voices.length && allowLoading)
      return {
        status: 'loading',
        voice: null,
        message: 'Carregando a voz em português…',
      }
    return {
      status: 'unavailable',
      voice: null,
      message:
        'Este aparelho não tem uma voz em português do Brasil disponível.',
    }
  } catch {
    return {
      status: 'unavailable',
      voice: null,
      message: 'Não consegui carregar a voz deste aparelho.',
    }
  }
}

export function countryUtterance(name: string, voice: SpeechSynthesisVoice) {
  const utterance = new SpeechSynthesisUtterance(name)
  utterance.voice = voice
  utterance.lang = 'pt-BR'
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1
  return utterance
}

export function pronunciationErrorMessage(error: string) {
  switch (error) {
    case 'not-allowed':
      return 'O som não foi permitido. Tente tocar em Ouvir nome de novo.'
    case 'voice-unavailable':
    case 'language-unavailable':
      return 'A voz em português do Brasil não está disponível agora.'
    case 'network':
      return 'A voz não conseguiu se conectar. Tente de novo.'
    default:
      return 'Não consegui falar o nome agora. Vamos tentar de novo?'
  }
}
