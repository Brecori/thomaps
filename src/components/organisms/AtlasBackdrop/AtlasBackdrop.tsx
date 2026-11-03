import { Icon } from '@/components/atoms/Icon'

export function AtlasBackdrop() {
  return (
    <div
      className="atlas-backdrop"
      aria-label="Prévia ilustrada do mapa-múndi; interação prevista na fase 2"
      role="img"
    >
      <img
        className="atlas-backdrop__map"
        src="/illustrations/world-preview.svg"
        alt=""
        draggable={false}
      />
      <span className="map-caption map-caption--atlantic" aria-hidden="true">
        OCEANO
        <br />
        ATLÂNTICO
      </span>
      <span className="map-caption map-caption--pacific" aria-hidden="true">
        OCEANO
        <br />
        PACÍFICO
      </span>
      <span className="map-caption map-caption--indian" aria-hidden="true">
        OCEANO
        <br />
        ÍNDICO
      </span>
      <div className="compass" aria-hidden="true">
        <span>N</span>
        <Icon name="compass" size={38} />
      </div>
    </div>
  )
}
