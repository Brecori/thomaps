import type { AvailableAnthem } from '@/domain/anthem'

/** Secondary information for the adult, kept out of the child's main actions. */
export function MediaCredits({ media }: { media: AvailableAnthem }) {
  return (
    <details className="media-credits">
      <summary>Créditos do hino</summary>
      <div>
        <p>{media.title}</p>
        <p>{media.attribution}</p>
        <p>
          <a href={media.sourcePage} target="_blank" rel="noreferrer">
            Arquivo no Wikimedia Commons
          </a>
          {' · '}
          <a href={media.licenseUrl} target="_blank" rel="noreferrer">
            {media.license}
          </a>
        </p>
        <p>{media.notice}</p>
      </div>
    </details>
  )
}
