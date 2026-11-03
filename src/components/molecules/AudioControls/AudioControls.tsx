import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

export function AudioControls() {
  return (
    <div
      className="audio-controls"
      aria-label="Áudios disponíveis em uma próxima fase"
    >
      <Button disabled tone="soft">
        <Icon name="volume" />
        <span>Ouvir nome</span>
      </Button>
      <Button disabled tone="primary">
        <Icon name="music" />
        <span>Ouvir hino</span>
      </Button>
    </div>
  )
}
