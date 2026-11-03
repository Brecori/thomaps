import { useId, useLayoutEffect, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'
import { AudioControls } from '@/components/molecules/AudioControls'
import { CountryHeading } from '@/components/molecules/CountryHeading'
import { MediaCredits } from '@/components/molecules/MediaCredits'
import type { CountrySummary } from '@/domain/country'
import type { useAtlasAudio } from '@/hooks/useAtlasAudio'

export function CountryDetails({
  country,
  onClose,
  pronunciation,
  anthem,
}: {
  country: CountrySummary
  onClose: () => void
  pronunciation: ReturnType<typeof useAtlasAudio>['pronunciation']
  anthem: ReturnType<typeof useAtlasAudio>['anthem']
}) {
  const headingId = useId()
  const noteId = useId()
  const region = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    region.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section
      ref={region}
      tabIndex={-1}
      className="country-details"
      aria-labelledby={headingId}
    >
      <div className="country-details__handle" aria-hidden="true" />
      <Button
        className="country-details__close"
        aria-label="Fechar país"
        onClick={onClose}
      >
        <Icon name="close" />
      </Button>
      <CountryHeading
        name={country.namePtBr}
        flagSrc={country.flagSrc}
        headingId={headingId}
      />
      <div className="capital">
        <span className="capital__icon">
          <Icon name="pin" />
        </span>
        <div>
          <Text variant="label">
            {country.capitalLabel ??
              (country.capitals.length > 1 ? 'As capitais são' : 'A capital é')}
          </Text>
          <Text className="capital__name">{country.capitals.join(', ')}</Text>
        </div>
      </div>
      {country.capitalNote && (
        <Text className="country-details__capital-note">
          {country.capitalNote}
        </Text>
      )}
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
      <div className="country-details__footer">
        <Icon name="heart" size={20} />
        <span>O mundo é cheio de descobertas!</span>
      </div>
    </section>
  )
}
