import { useId } from 'react'
import { Text } from '@/components/atoms/Text'
import { AudioControls } from '@/components/molecules/AudioControls'
import { MediaCredits } from '@/components/molecules/MediaCredits'
import type { CountrySummary } from '@/domain/country'
import type { useAtlasAudio } from '@/hooks/useAtlasAudio'

export function CountryAudio({
  country,
  pronunciation,
  anthem,
}: {
  country: CountrySummary
  pronunciation: ReturnType<typeof useAtlasAudio>['pronunciation']
  anthem: ReturnType<typeof useAtlasAudio>['anthem']
}) {
  const noteId = useId()
  return (
    <section
      id="atlas-country-audio"
      className="country-audio"
      aria-label={`Sons de ${country.namePtBr}`}
    >
      <AudioControls
        pronunciationActive={pronunciation.active}
        pronunciationAvailable={pronunciation.available}
        descriptionId={noteId}
        onPronunciationToggle={() =>
          pronunciation.active
            ? pronunciation.stop()
            : pronunciation.speak(country.namePtBr)
        }
        anthemAvailable={country.anthem.status === 'available'}
        anthemActive={anthem.active}
        anthemStarted={anthem.status !== 'idle'}
        currentTime={anthem.currentTime}
        duration={anthem.duration}
        onAnthemToggle={() => {
          if (anthem.active) anthem.pause()
          else if (country.anthem.status === 'available')
            anthem.play(country.anthem)
        }}
        onAnthemRestart={() => {
          if (country.anthem.status === 'available')
            anthem.play(country.anthem, true)
        }}
      />
      <Text
        id={noteId}
        className="country-details__note"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {[
          pronunciation.message,
          country.anthem.status === 'unavailable'
            ? country.anthem.reason
            : anthem.message,
        ]
          .filter(Boolean)
          .join(' ')}
      </Text>
      {country.anthem.status === 'available' && (
        <MediaCredits media={country.anthem} />
      )}
    </section>
  )
}
