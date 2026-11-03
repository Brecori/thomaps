import { useId, useLayoutEffect, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'
import { AudioControls } from '@/components/molecules/AudioControls'
import { CountryHeading } from '@/components/molecules/CountryHeading'
import type { CountrySummary } from '@/domain/country'

export function CountryDetails({
  country,
  onClose,
}: {
  country: CountrySummary
  onClose: () => void
}) {
  const headingId = useId()
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
        aria-label="Fechar cartão de exemplo"
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
          <Text variant="label">A capital é</Text>
          <Text className="capital__name">{country.capitals.join(', ')}</Text>
        </div>
      </div>
      <AudioControls />
      <Text className="country-details__note">
        Os sons chegam em uma próxima etapa.
      </Text>
      <div className="country-details__footer">
        <Icon name="heart" size={20} />
        <span>O mundo é cheio de descobertas!</span>
      </div>
    </section>
  )
}
