import type { ReactNode, Ref } from 'react'
import { AnimatedPanel } from '@/components/atoms/AnimatedPanel'

type AtlasTemplateProps = {
  map: ReactNode
  brand: ReactNode
  search: ReactNode
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
  navigation,
  details,
  detailsKey,
  utility,
  help,
  status,
  containerRef,
  onEscape,
}: AtlasTemplateProps) {
  return (
    <main
      ref={containerRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onEscape?.()
      }}
      className={`atlas-shell ${details ? 'atlas-shell--with-details' : ''}`}
    >
      <h1 className="sr-only">Atlas interativo</h1>
      <div className="atlas-shell__map">{map}</div>
      <header className="atlas-shell__brand">{brand}</header>
      <div className="atlas-shell__search">{search}</div>
      <div className="atlas-shell__utility">{utility}</div>
      <div className="atlas-shell__navigation">{navigation}</div>
      <AnimatedPanel className="atlas-shell__details" contentKey={detailsKey}>
        {details}
      </AnimatedPanel>
      {help && <div className="atlas-shell__help">{help}</div>}
      <div className="atlas-shell__status">{status}</div>
    </main>
  )
}
