import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

export function ZoomControls() {
  return (
    <div
      className="zoom-controls"
      role="group"
      aria-label="Navegação do mapa disponível na próxima fase"
    >
      <Button disabled aria-label="Aproximar mapa">
        <Icon name="plus" />
      </Button>
      <Button disabled aria-label="Afastar mapa">
        <Icon name="minus" />
      </Button>
      <Button disabled aria-label="Ver o mundo">
        <Icon name="earth" />
      </Button>
    </div>
  )
}
