import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

type ZoomControlsProps = {
  disabled: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}
export function ZoomControls({
  disabled,
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div className="zoom-controls" role="group" aria-label="Navegação do mapa">
      <Button
        disabled={disabled || !canZoomIn}
        aria-label="Aproximar mapa"
        onClick={onZoomIn}
      >
        <Icon name="plus" />
      </Button>
      <Button
        disabled={disabled || !canZoomOut}
        aria-label="Afastar mapa"
        onClick={onZoomOut}
      >
        <Icon name="minus" />
      </Button>
      <Button disabled={disabled} aria-label="Ver o mundo" onClick={onReset}>
        <Icon name="earth" />
      </Button>
    </div>
  )
}
