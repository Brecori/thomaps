import { FlagImage } from '@/components/atoms/FlagImage'
import { Text } from '@/components/atoms/Text'

type CountryHeadingProps = { name: string; flagSrc: string; headingId: string }

export function CountryHeading({
  name,
  flagSrc,
  headingId,
}: CountryHeadingProps) {
  return (
    <div className="country-heading">
      <FlagImage key={flagSrc} src={flagSrc} alt={`Bandeira: ${name}`} />
      <div>
        <Text variant="label" className="eyebrow">
          VAMOS CONHECER
        </Text>
        <Text as="h2" variant="heading" id={headingId}>
          {name}
        </Text>
      </div>
    </div>
  )
}
