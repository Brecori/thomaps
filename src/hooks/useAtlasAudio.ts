import { usePronunciation } from './usePronunciation'
import { useVoiceSearch } from './useVoiceSearch'

/** Page-level owner of speech and listening. The anthem player joins this flow in T11. */
export function useAtlasAudio(onTranscript: (text: string) => void) {
  const pronunciation = usePronunciation()
  const recognition = useVoiceSearch(onTranscript)

  return {
    voice: {
      ...recognition,
      start: () => {
        pronunciation.stop()
        recognition.start()
      },
    },
    pronunciation: {
      ...pronunciation,
      speak: (name: string) => {
        recognition.cancel()
        pronunciation.speak(name)
      },
    },
    stopAll: () => {
      recognition.cancel()
      pronunciation.stop()
    },
  }
}
