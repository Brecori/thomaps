import { useId, type RefObject } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { CountryOption } from '@/components/molecules/CountryOption'
import { SearchField } from '@/components/molecules/SearchField'
import type { Country } from '@/domain/atlas/schema'
import {
  SEARCH_PAGE_SIZE,
  type useCountrySearch,
} from '@/hooks/useCountrySearch'
import type { useVoiceSearch } from '@/hooks/useVoiceSearch'

type CountrySearchProps = {
  search: ReturnType<typeof useCountrySearch>
  voice: ReturnType<typeof useVoiceSearch>
  inputRef: RefObject<HTMLInputElement | null>
  disabled: boolean
  onSelect: (id: string, origin: HTMLInputElement | null) => void
  onClose?: () => void
}

export function CountrySearch({
  search,
  voice,
  inputRef,
  disabled,
  onSelect,
  onClose,
}: CountrySearchProps) {
  const id = useId()
  const listId = `${id}-results`
  const feedbackId = `${id}-feedback`
  const showResults = search.open && Boolean(search.query.trim()) && !disabled
  const visible = search.results.slice(
    search.pageStart,
    search.pageStart + SEARCH_PAGE_SIZE,
  )
  const optionId = (country: Country) => `${id}-${country.id}`
  const active = search.open ? search.results[search.activeIndex] : undefined
  const choose = (country: Country) => {
    inputRef.current?.blur()
    onSelect(country.id, inputRef.current)
  }
  const submit = () => {
    const country = active ?? search.results[0]
    if (country) choose(country)
    else search.setOpen(true)
  }
  const feedback = showResults
    ? search.results.length
      ? `${search.results.length} ${search.results.length === 1 ? 'país encontrado' : 'países encontrados'}. Escolha um país.`
      : 'Não encontrei esse país. Vamos tentar outro nome?'
    : ''
  const showPanel = !disabled && (showResults || Boolean(voice.message))

  return (
    <div
      className="country-search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          search.setOpen(false)
      }}
    >
      <div className="country-search__bar">
        <SearchField
          inputRef={inputRef}
          disabled={disabled}
          inputProps={{
            id: `${id}-input`,
            role: 'combobox',
            value: search.query,
            'aria-autocomplete': 'list',
            'aria-expanded': showResults && search.results.length > 0,
            'aria-controls':
              showResults && search.results.length ? listId : undefined,
            'aria-activedescendant':
              showResults && active ? optionId(active) : undefined,
            'aria-describedby': showPanel ? feedbackId : undefined,
            onChange: (event) => {
              voice.cancel()
              search.setQuery(event.target.value)
            },
            onFocus: () => {
              if (!search.open) search.setOpen(true)
            },
            onKeyDown: (event) => {
              if (event.nativeEvent.isComposing) return
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                search.move(event.key === 'ArrowDown' ? 1 : -1)
              } else if (
                event.key === 'Escape' &&
                (search.open || voice.active || voice.message)
              ) {
                event.preventDefault()
                event.stopPropagation()
                voice.cancel()
                search.setOpen(false)
                onClose?.()
              }
            },
          }}
          voiceActive={voice.active}
          voiceUnavailable={voice.status === 'unavailable'}
          onVoiceToggle={() => {
            if (voice.active) voice.cancel('Busca por voz cancelada.')
            else {
              search.setOpen(false)
              voice.start()
            }
          }}
          onSubmit={submit}
        />
        {onClose && (
          <Button onClick={onClose} aria-label="Fechar pesquisa">
            <Icon name="close" />
          </Button>
        )}
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {voice.message} {feedback}
      </p>
      <div
        className={showPanel ? 'country-search__popup' : 'sr-only'}
        hidden={!showPanel}
      >
        <div id={feedbackId} className="country-search__feedback">
          {voice.message && <p>{voice.message}</p>}
          {feedback && <p>{feedback}</p>}
        </div>
        {voice.active && (
          <p className="country-search__privacy">
            O navegador pode enviar sua voz a um serviço online.
          </p>
        )}
        {showResults && search.results.length > 0 && (
          <>
            <ul
              id={listId}
              role="listbox"
              aria-label="Países encontrados"
              className="country-search__results"
            >
              {visible.map((country, index) => (
                <CountryOption
                  key={country.id}
                  id={optionId(country)}
                  country={country}
                  active={active?.id === country.id}
                  position={search.pageStart + index + 1}
                  total={search.results.length}
                  onSelect={() => choose(country)}
                />
              ))}
            </ul>
            {search.results.length > SEARCH_PAGE_SIZE && (
              <nav
                className="country-search__pages"
                aria-label="Mais países encontrados"
              >
                <Button
                  aria-disabled={search.pageStart === 0}
                  onClick={() =>
                    search.pageStart > 0 &&
                    search.setActive(
                      Math.max(0, search.pageStart - SEARCH_PAGE_SIZE),
                    )
                  }
                >
                  Anteriores
                </Button>
                <span>
                  {search.pageStart + 1}–
                  {Math.min(
                    search.pageStart + SEARCH_PAGE_SIZE,
                    search.results.length,
                  )}{' '}
                  de {search.results.length}
                </span>
                <Button
                  aria-disabled={
                    search.pageStart + SEARCH_PAGE_SIZE >= search.results.length
                  }
                  onClick={() =>
                    search.pageStart + SEARCH_PAGE_SIZE <
                      search.results.length &&
                    search.setActive(search.pageStart + SEARCH_PAGE_SIZE)
                  }
                >
                  Próximos
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
