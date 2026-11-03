import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

type AudioControlsProps = {
  pronunciationActive: boolean
  pronunciationAvailable: boolean
  descriptionId: string
  onPronunciationToggle: () => void
}

export function AudioControls({
  pronunciationActive,
  pronunciationAvailable,
  descriptionId,
  onPronunciationToggle,
}: AudioControlsProps) {
  return (
    <div className="audio-controls" role="group" aria-label="Sons do país">
      <Button
        disabled={!pronunciationActive && !pronunciationAvailable}
        tone="soft"
        aria-pressed={pronunciationActive}
        aria-describedby={descriptionId}
        onClick={onPronunciationToggle}
      >
        <Icon name={pronunciationActive ? 'close' : 'volume'} />
        <span>{pronunciationActive ? 'Parar nome' : 'Ouvir nome'}</span>
      </Button>
      <Button disabled tone="primary">
        <Icon name="music" />
        <span>Ouvir hino</span>
      </Button>
    </div>
  )
}
