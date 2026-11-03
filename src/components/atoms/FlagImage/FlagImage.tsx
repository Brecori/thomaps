import { useState } from 'react'
import { Icon } from '../Icon'

export function FlagImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  return failedSource === src ? (
    <span
      role="img"
      aria-label={alt}
      className={`flag-image flag-image--fallback ${className}`}
    >
      <Icon name="earth" />
    </span>
  ) : (
    <img
      src={src}
      alt={alt}
      className={`flag-image ${className}`}
      onError={() => setFailedSource(src)}
    />
  )
}
