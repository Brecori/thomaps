import { useRef, type ReactNode, type Ref, type KeyboardEvent } from 'react'
import { AnimatedPanel } from '@/components/atoms/AnimatedPanel'

type AtlasTemplateProps = {
  map: ReactNode
  brand: ReactNode
  search: ReactNode
  searchOpen?: boolean
  onCloseSearch?: () => void
  actions?: ReactNode
  navigation: ReactNode
  details?: ReactNode
  detailsKey?: string
  utility: ReactNode
  help?: ReactNode
  status: ReactNode
  containerRef?: Ref<HTMLElement>
  onEscape?: () => void
}

export function AtlasTemplate({
  map,
  brand,
  search,
  searchOpen = true,
  onCloseSearch,
  actions,
  navigation,
  details,
  detailsKey,
  utility,
  help,
  status,
  containerRef,
  onEscape,
}: AtlasTemplateProps) {
  const searchRegion = useRef<HTMLDivElement>(null)
  const searchOverlayOpen = searchOpen && Boolean(onCloseSearch)
  const keepSearchFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!searchOverlayOpen || event.key !== 'Tab') return
    const controls = Array.from(
      searchRegion.current?.querySelectorAll<HTMLElement>(
        'input:not(:disabled), button:not(:disabled), [href], [tabindex="0"]',
      ) ?? [],
    ).filter((element) => element.getClientRects().length > 0)
    const first = controls[0],
      last = controls.at(-1)
    if (
      first &&
      last &&
      ((event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last))
    ) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
    }
  }
  return (
    <main
      ref={containerRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onEscape?.()
      }}
      className={`atlas-shell ${details ? 'atlas-shell--with-details' : ''} ${searchOverlayOpen ? 'atlas-shell--search-overlay' : ''}`}
    >
      <h1 className="sr-only">Atlas interativo</h1>
      <div className="atlas-shell__map" inert={searchOverlayOpen}>
        {map}
      </div>
      <header className="atlas-shell__brand" inert={searchOverlayOpen}>
        {brand}
      </header>
      {searchOverlayOpen && (
        <button
          type="button"
          className="atlas-shell__search-backdrop"
          aria-label="Fechar pesquisa pelo fundo"
          tabIndex={-1}
          onClick={onCloseSearch}
        />
      )}
      <div
        ref={searchRegion}
        id="atlas-search"
        className="atlas-shell__search"
        role={searchOverlayOpen ? 'dialog' : undefined}
        aria-modal={searchOverlayOpen || undefined}
        aria-label={searchOverlayOpen ? 'Pesquisar país' : undefined}
        onKeyDown={keepSearchFocus}
      >
        <AnimatedPanel>{searchOpen ? search : undefined}</AnimatedPanel>
      </div>
      {actions && (
        <div className="atlas-shell__actions" inert={searchOverlayOpen}>
          {actions}
        </div>
      )}
      <div className="atlas-shell__utility" inert={searchOverlayOpen}>
        {utility}
      </div>
      <div className="atlas-shell__navigation" inert={searchOverlayOpen}>
        {navigation}
      </div>
      <AnimatedPanel
        className="atlas-shell__details"
        contentKey={detailsKey}
        inert={searchOverlayOpen}
      >
        {details}
      </AnimatedPanel>
      {help && (
        <div className="atlas-shell__help" inert={searchOverlayOpen}>
          {help}
        </div>
      )}
      <div className="atlas-shell__status" inert={searchOverlayOpen}>
        {status}
      </div>
    </main>
  )
}
