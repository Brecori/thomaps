import { usePronunciation } from './usePronunciation'
import { useVoiceSearch } from './useVoiceSearch'
import { useAnthem } from './useAnthem'
import type { AvailableAnthem } from '@/domain/anthem'

/** Page-level owner of the three mutually exclusive audio operations. */
export function useAtlasAudio(onTranscript: (text: string) => void) {
  const pronunciation = usePronunciation()
  const recognition = useVoiceSearch(onTranscript)
  const anthem = useAnthem()

  return {
    voice: {
      ...recognition,
      start: () => {
        pronunciation.stop()
        anthem.pause()
        recognition.start()
      },
    },
    pronunciation: {
      ...pronunciation,
      speak: (name: string) => {
        recognition.cancel()
        anthem.pause()
        pronunciation.speak(name)
      },
    },
    anthem: {
      ...anthem,
      play: (media: AvailableAnthem, restart = false) => {
        recognition.cancel()
        pronunciation.stop()
        anthem.play(media, restart)
      },
    },
    stopAll: () => {
      recognition.cancel()
      pronunciation.stop()
      anthem.stop()
    },
  }
}
