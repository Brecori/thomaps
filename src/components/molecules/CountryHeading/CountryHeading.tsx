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
      <FlagImage src={flagSrc} alt={`Bandeira do ${name}`} />
      <div>
        <Text variant="label" className="eyebrow">
          NOSSO PAÍS DE EXEMPLO
        </Text>
        <Text as="h2" variant="heading" id={headingId}>
          {name}
        </Text>
      </div>
    </div>
  )
}
