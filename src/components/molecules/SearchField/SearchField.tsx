import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { TextInput } from '@/components/atoms/TextInput'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  onUnavailable: () => void
}

export function SearchField({
  value,
  onChange,
  onUnavailable,
}: SearchFieldProps) {
  return (
    <form
      className="search-field"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onUnavailable()
      }}
    >
      <label htmlFor="country-search" className="sr-only">
        Qual país vamos conhecer?
      </label>
      <Icon name="search" className="search-field__icon" />
      <TextInput
        id="country-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Qual país vamos conhecer?"
        autoComplete="off"
        enterKeyHint="search"
        aria-describedby="preview-search-note"
      />
      <Button
        tone="purple"
        className="search-field__voice"
        aria-label="Falar o nome de um país"
        onClick={onUnavailable}
      >
        <Icon name="mic" />
        <span>Falar</span>
      </Button>
    </form>
  )
}
