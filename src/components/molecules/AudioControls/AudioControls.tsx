import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { ProgressBar } from '@/components/atoms/ProgressBar'

type AudioControlsProps = {
  pronunciationActive: boolean
  pronunciationAvailable: boolean
  descriptionId: string
  onPronunciationToggle: () => void
  anthemAvailable: boolean
  anthemActive: boolean
  anthemStarted: boolean
  currentTime: number
  duration: number
  onAnthemToggle: () => void
  onAnthemRestart: () => void
}

export function AudioControls({
  pronunciationActive,
  pronunciationAvailable,
  descriptionId,
  onPronunciationToggle,
  anthemAvailable,
  anthemActive,
  anthemStarted,
  currentTime,
  duration,
  onAnthemToggle,
  onAnthemRestart,
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
      <Button
        disabled={!anthemAvailable}
        tone="primary"
        aria-pressed={anthemActive}
        aria-describedby={descriptionId}
        onClick={onAnthemToggle}
      >
        <Icon name={anthemActive ? 'pause' : 'music'} />
        <span>{anthemActive ? 'Pausar hino' : 'Ouvir hino'}</span>
      </Button>
      {anthemAvailable && anthemStarted && (
        <div className="audio-controls__playback">
          <ProgressBar currentTime={currentTime} duration={duration} />
          <Button
            className="audio-controls__restart"
            aria-label="Reiniciar hino"
            onClick={onAnthemRestart}
          >
            <Icon name="restart" />
          </Button>
        </div>
      )}
    </div>
  )
}
