import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'
import { CountryHeading } from '@/components/molecules/CountryHeading'
import type { CountrySummary } from '@/domain/country'

export function CountryDetails({
  country,
  onClose,
  audio,
}: {
  country: CountrySummary
  onClose: () => void
  audio?: ReactNode
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
      {audio}
      <div className="country-details__footer">
        <Icon name="heart" size={20} />
        <span>O mundo é cheio de descobertas!</span>
      </div>
    </section>
  )
}
