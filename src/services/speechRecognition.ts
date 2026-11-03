type RecognitionResult = {
  isFinal: boolean
  [index: number]: { transcript: string }
}
export type RecognitionClient = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onaudioend: (() => void) | null
  onresult:
    | ((event: {
        resultIndex: number
        results: ArrayLike<RecognitionResult>
      }) => void)
    | null
  onerror: ((event: { error: string }) => void) | null
  onnomatch: (() => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}
type RecognitionConstructor = new () => RecognitionClient

export function recognitionConstructor(): RecognitionConstructor | undefined {
  const browser = window as Window & {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return window.isSecureContext
    ? (browser.SpeechRecognition ?? browser.webkitSpeechRecognition)
    : undefined
}

export function recognitionErrorMessage(error: string) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'O microfone não foi permitido. Peça ajuda a um adulto ou digite o país.'
    case 'audio-capture':
      return 'Não encontrei o microfone. Você pode digitar o país.'
    case 'network':
      return 'A voz não conseguiu se conectar. Tente de novo ou digite o país.'
    case 'no-speech':
      return 'Não ouvi o nome. Tente falar de novo ou digite o país.'
    case 'language-not-supported':
      return 'A voz em português não está disponível aqui. Digite o país.'
    default:
      return 'Não consegui ouvir agora. Tente de novo ou digite o país.'
  }
}
