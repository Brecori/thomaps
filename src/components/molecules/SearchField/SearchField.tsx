import type { InputHTMLAttributes, RefObject } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { TextInput } from '@/components/atoms/TextInput'

type SearchFieldProps = {
  inputRef: RefObject<HTMLInputElement | null>
  inputProps: InputHTMLAttributes<HTMLInputElement>
  disabled: boolean
  voiceActive: boolean
  voiceUnavailable: boolean
  onVoiceToggle: () => void
  onSubmit: () => void
}

export function SearchField({
  inputRef,
  inputProps,
  disabled,
  voiceActive,
  voiceUnavailable,
  onVoiceToggle,
  onSubmit,
}: SearchFieldProps) {
  return (
    <form
      className="search-field"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor={inputProps.id} className="sr-only">
        Qual país vamos conhecer?
      </label>
      <Icon name="search" className="search-field__icon" />
      <TextInput
        {...inputProps}
        ref={inputRef}
        type="search"
        disabled={disabled}
        placeholder="Qual país vamos conhecer?"
        autoComplete="off"
        enterKeyHint="search"
      />
      <Button
        tone="purple"
        className={`search-field__voice ${voiceActive ? 'is-listening' : ''}`}
        disabled={disabled}
        aria-label={
          voiceActive
            ? 'Cancelar busca por voz'
            : voiceUnavailable
              ? 'Busca por voz indisponível'
              : 'Falar o nome de um país'
        }
        aria-pressed={voiceActive}
        onClick={onVoiceToggle}
      >
        <Icon name={voiceActive ? 'close' : 'mic'} />
        <span>{voiceActive ? 'Parar' : 'Falar'}</span>
      </Button>
    </form>
  )
}
