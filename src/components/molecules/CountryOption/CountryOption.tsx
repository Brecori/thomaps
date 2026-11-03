import { FlagImage } from '@/components/atoms/FlagImage'
import type { Country } from '@/domain/atlas/schema'

type CountryOptionProps = {
  id: string
  country: Country
  active: boolean
  position: number
  total: number
  onSelect: () => void
}

export function CountryOption({
  id,
  country,
  active,
  position,
  total,
  onSelect,
}: CountryOptionProps) {
  return (
    <li
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={active}
      aria-posinset={position}
      aria-setsize={total}
      className={`country-option ${active ? 'is-active' : ''}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
    >
      <FlagImage src={country.flagSrc} alt="" />
      <span>{country.namePtBr}</span>
    </li>
  )
}
