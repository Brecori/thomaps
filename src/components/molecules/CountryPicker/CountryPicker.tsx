import { useId } from 'react'

type CountryPickerProps = {
  countries: { id: string; namePtBr: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function CountryPicker({
  countries,
  selectedId,
  onSelect,
}: CountryPickerProps) {
  const id = useId()
  return (
    <div className="country-picker">
      <label htmlFor={id}>Escolher um país pelo nome</label>
      <select
        id={id}
        value={selectedId ?? ''}
        onChange={(event) => {
          if (event.target.value) onSelect(event.target.value)
        }}
      >
        <option value="" disabled>
          Escolha um país
        </option>
        {[...countries]
          .sort((a, b) => a.namePtBr.localeCompare(b.namePtBr, 'pt-BR'))
          .map((country) => (
            <option key={country.id} value={country.id}>
              {country.namePtBr}
            </option>
          ))}
      </select>
    </div>
  )
}
