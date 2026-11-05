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
import { usePwa } from '@/hooks/usePwa'
import { AppOptions } from '@/components/organisms/AppOptions'
import { CountryAudio } from '@/components/organisms/CountryAudio'
import { FloatingSearch } from '@/components/molecules/FloatingSearch'
import { useCompactLayout } from '@/hooks/useCompactLayout'
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
  const pwa = usePwa()
  const container = useRef<HTMLElement>(null)
  const { state, retry } = useAtlasData()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const compact = useCompactLayout()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchButton = useRef<HTMLButtonElement>(null)
  const focusSearch = useRef(false)
  const returnSearchFocus = useRef(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const search = useCountrySearch(
    state.status === 'ready' ? state.data.countries : emptyCountries,
  )
  const audio = useAtlasAudio((text) => {
    search.setQuery(text)
    setHelpOpen(false)
  })
  const voice = audio.voice
  const searchOpen =
    !compact ||
    mobileSearchOpen ||
    (search.open && Boolean(search.query.trim()))
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
    if (compact && searchOpen && focusSearch.current) {
      focusSearch.current = false
      searchInput.current?.focus({ preventScroll: true })
    } else if (compact && !searchOpen && returnSearchFocus.current) {
      returnSearchFocus.current = false
      searchButton.current?.focus({ preventScroll: true })
    }
  }, [compact, searchOpen])

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
    origin.current = {
      element: compact && kind === 'search' ? searchButton.current : element,
      countryId: id,
      kind,
    }
    audio.stopAll()
    search.clear()
    setSelectedId(id)
    setHelpOpen(false)
    setMobileSearchOpen(false)
    command('focus')
  }
  const closeCountry = () => {
    audio.stopAll()
    search.clear()
    returnFocus.current = origin.current
    setSelectedId(null)
    setMobileSearchOpen(false)
    if (!compact) command('world')
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
    setMobileSearchOpen(false)
    command('world')
  }
  const closeSearch = () => {
    returnSearchFocus.current = true
    voice.cancel()
    search.clear()
    setMobileSearchOpen(false)
  }

  return (
    <AtlasTemplate
      containerRef={container}
      searchOpen={searchOpen}
      onCloseSearch={compact ? closeSearch : undefined}
      detailsKey={selected?.id}
      onEscape={() => {
        if (voice.active || voice.message) voice.cancel()
        else if (compact && searchOpen) closeSearch()
        else if (search.open) search.setOpen(false)
        else if (helpOpen) closeHelp()
        else if (selected) closeCountry()
      }}
      map={
        state.status === 'ready' && layout.width > 0 ? (
          <WorldMap
            data={state.data}
            selectedId={selectedId}
            preserveView={compact && (searchOpen || selectedId === null)}
            layout={layout}
            request={request}
            onSelect={(id, element) => selectCountry(id, element)}
            onDeselect={compact ? closeCountry : reset}
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
      actions={
        compact ? (
          <FloatingSearch
            buttonRef={searchButton}
            open={searchOpen}
            disabled={!ready}
            onToggle={() => {
              if (searchOpen) closeSearch()
              else {
                audio.stopAll()
                setHelpOpen(false)
                focusSearch.current = true
                setMobileSearchOpen(true)
              }
            }}
          />
        ) : undefined
      }
      search={
        <CountrySearch
          search={search}
          voice={voice}
          inputRef={searchInput}
          disabled={!ready}
          onClose={compact ? closeSearch : undefined}
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
            className={pwa.needUpdate ? 'has-update' : ''}
            onClick={() => {
              audio.stopAll()
              search.clear()
              setMobileSearchOpen(false)
              setHelpOpen(true)
              if (pwa.available) void pwa.auditOffline()
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
            audio={
              <CountryAudio
                country={selected}
                pronunciation={audio.pronunciation}
                anthem={audio.anthem}
              />
            }
            onClose={closeCountry}
          />
        ) : undefined
      }
      help={
        helpOpen ? (
          <PreviewHelp onClose={closeHelp}>
            <AppOptions
              pwa={pwa}
              onDeferUpdate={closeHelp}
              busy={
                voice.active ||
                audio.pronunciation.active ||
                audio.anthem.active ||
                navigation.moving
              }
              onApplyUpdate={() => {
                audio.stopAll()
                void pwa.applyUpdate()
              }}
            />
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
          <span
            className={`phase-note ${!pwa.online ? 'phase-note--offline' : ''}`}
            id="preview-search-note"
            role={!pwa.online || pwa.needUpdate ? 'status' : undefined}
          >
            {!pwa.online
              ? pwa.readiness === 'ready'
                ? 'Sem internet · mapa disponível'
                : 'Sem internet · confira o modo offline na ajuda'
              : pwa.needUpdate
                ? 'Nova versão disponível na ajuda'
                : 'Arraste para passear. Toque para descobrir.'}
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
