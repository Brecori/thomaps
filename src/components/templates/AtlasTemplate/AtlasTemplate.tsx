import type { ReactNode } from 'react'

type AtlasTemplateProps = {
  map: ReactNode
  brand: ReactNode
  search: ReactNode
  navigation: ReactNode
  introduction: ReactNode
  details?: ReactNode
  utility: ReactNode
  help?: ReactNode
  status: ReactNode
}

export function AtlasTemplate({
  map,
  brand,
  search,
  navigation,
  introduction,
  details,
  utility,
  help,
  status,
}: AtlasTemplateProps) {
  return (
    <main
      className={`atlas-shell ${details ? 'atlas-shell--with-details' : ''}`}
    >
      <div className="atlas-shell__map">{map}</div>
      <header className="atlas-shell__brand">{brand}</header>
      <div className="atlas-shell__search">{search}</div>
      <div className="atlas-shell__utility">{utility}</div>
      <div className="atlas-shell__introduction">{introduction}</div>
      <div className="atlas-shell__navigation">{navigation}</div>
      {details && <div className="atlas-shell__details">{details}</div>}
      {help && <div className="atlas-shell__help">{help}</div>}
      <div className="atlas-shell__status">{status}</div>
    </main>
  )
}
