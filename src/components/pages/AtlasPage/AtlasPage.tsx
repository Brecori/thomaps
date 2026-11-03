import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Brand } from '@/components/molecules/Brand'
import { CountryPicker } from '@/components/molecules/CountryPicker'
import { CountrySearch } from '@/components/organisms/CountrySearch'
import { ZoomControls } from '@/components/molecules/ZoomControls'
import { WorldMap } from '@/components/organisms/WorldMap'
import { MapFeedback } from '@/components/organisms/MapFeedback'
import { CountryDetails } from '@/components/organisms/CountryDetails'
import { PreviewHelp } from '@/components/organisms/PreviewHelp'
import { AtlasTemplate } from '@/components/templates/AtlasTemplate'
import { useAtlasData } from '@/hooks/useAtlasData'
import { useAtlasLayout } from '@/hooks/useAtlasLayout'
import { useViewportHeight } from '@/hooks/useViewportHeight'
import { useCountrySearch } from '@/hooks/useCountrySearch'
import { useAtlasAudio } from '@/hooks/useAtlasAudio'
import type { Country } from '@/domain/atlas/schema'
import type {
  NavigationRequest,
  NavigationStatus,
} from '@/hooks/useMapNavigation'
import { MAX_ZOOM } from '@/domain/atlas/geometry'

type FocusOrigin = {
  element: HTMLElement | SVGElement | null
  countryId: string
  kind: 'search' | 'map' | 'help'
}
const emptyCountries: Country[] = []

export function AtlasPage() {
  useViewportHeight()
  const container = useRef<HTMLElement>(null)
  const { state, retry } = useAtlasData()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const search = useCountrySearch(
    state.status === 'ready' ? state.data.countries : emptyCountries,
  )
  const audio = useAtlasAudio((text) => {
    search.setQuery(text)
    setHelpOpen(false)
  })
  const voice = audio.voice
  const [request, setRequest] = useState<NavigationRequest>({
    id: 0,
    action: 'world',
  })
  const [navigation, setNavigation] = useState<NavigationStatus>({
    k: 1,
    minZoom: 1,
    moving: false,
  })
  const layout = useAtlasLayout(container, selectedId !== null)
  const helpButton = useRef<HTMLButtonElement>(null)
  const origin = useRef<FocusOrigin | null>(null)
  const returnFocus = useRef<FocusOrigin | 'help' | null>(null)
  const selected =
    state.status === 'ready'
      ? state.data.countries.find((country) => country.id === selectedId)
      : undefined
  const ready = state.status === 'ready' && layout.width > 0

  useLayoutEffect(() => {
    const pending = returnFocus.current
    if (pending === 'help' && !helpOpen) {
      helpButton.current?.focus()
      returnFocus.current = null
    } else if (pending && pending !== 'help' && !selectedId) {
      const element =
        pending.kind === 'help'
          ? helpButton.current
          : pending.element?.isConnected
            ? pending.element
            : container.current?.querySelector<SVGElement>(
                `[data-country-id="${pending.countryId}"]`,
              )
      element?.focus({ preventScroll: true })
      returnFocus.current = null
    }
  }, [selectedId, helpOpen])
  const command = (action: NavigationRequest['action']) =>
    setRequest((previous) => ({ id: previous.id + 1, action }))
  const selectCountry = (
    id: string,
    element: HTMLElement | SVGElement | null,
    kind: FocusOrigin['kind'] = 'map',
  ) => {
    origin.current = { element, countryId: id, kind }
    audio.stopAll()
    search.clear()
    setSelectedId(id)
    setHelpOpen(false)
    command('focus')
  }
  const closeCountry = () => {
    audio.stopAll()
    search.clear()
    returnFocus.current = origin.current
    setSelectedId(null)
    command('world')
  }
  const closeHelp = () => {
    returnFocus.current = 'help'
    setHelpOpen(false)
  }
  const reset = () => {
    audio.stopAll()
    search.clear()
    returnFocus.current = null
    setSelectedId(null)
    command('world')
  }

  return (
    <AtlasTemplate
      containerRef={container}
      onEscape={() => {
        if (voice.active || voice.message) voice.cancel()
        else if (search.open) search.setOpen(false)
        else if (helpOpen) closeHelp()
        else if (selected) closeCountry()
      }}
      map={
        state.status === 'ready' && layout.width > 0 ? (
          <WorldMap
            data={state.data}
            selectedId={selectedId}
            layout={layout}
            request={request}
            onSelect={(id, element) => selectCountry(id, element)}
            onDeselect={reset}
            onStatus={setNavigation}
          />
        ) : (
          <MapFeedback
            status={state.status === 'error' ? 'error' : 'loading'}
            onRetry={retry}
          />
        )
      }
      brand={<Brand />}
      search={
        <CountrySearch
          search={search}
          voice={voice}
          inputRef={searchInput}
          disabled={!ready}
          onSelect={(id, element) => selectCountry(id, element, 'search')}
        />
      }
      navigation={
        <ZoomControls
          disabled={!ready}
          canZoomIn={navigation.k < MAX_ZOOM - 0.01}
          canZoomOut={navigation.k > navigation.minZoom + 0.01}
          onZoomIn={() => command('in')}
          onZoomOut={() => command('out')}
          onReset={reset}
        />
      }
      utility={
        <>
          <span className="preview-badge">EXPLORAR</span>
          <Button
            ref={helpButton}
            onClick={() => {
              audio.stopAll()
              search.clear()
              setHelpOpen(true)
            }}
            aria-label="Ajuda do mapa"
            aria-expanded={helpOpen}
          >
            <Icon name="info" />
          </Button>
        </>
      }
      details={
        selected ? (
          <CountryDetails
            key={selected.id}
            country={selected}
            pronunciation={audio.pronunciation}
            onClose={closeCountry}
          />
        ) : undefined
      }
      help={
        helpOpen ? (
          <PreviewHelp onClose={closeHelp}>
            {state.status === 'ready' && (
              <CountryPicker
                countries={state.data.countries}
                selectedId={selectedId}
                onSelect={(id) => selectCountry(id, helpButton.current, 'help')}
              />
            )}
          </PreviewHelp>
        ) : undefined
      }
      status={
        <>
          <span className="phase-note" id="preview-search-note">
            Arraste para passear. Toque para descobrir.
          </span>
          <span className="made-with">
            <Icon name="heart" size={18} />
            Feito para descobrir
          </span>
        </>
      }
    />
  )
}
