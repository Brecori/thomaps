function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

export function ProgressBar({
  currentTime,
  duration,
}: {
  currentTime: number
  duration: number
}) {
  const current = Math.min(currentTime, duration)
  return (
    <div className="progress-bar">
      <progress
        aria-label="Andamento do hino"
        aria-valuetext={`${formatTime(current)} de ${formatTime(duration)}`}
        value={current}
        max={duration || 1}
      />
      <span aria-hidden="true">
        {formatTime(current)} / {formatTime(duration)}
      </span>
    </div>
  )
}
