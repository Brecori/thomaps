import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'

export function MapFeedback({
  status,
  onRetry,
}: {
  status: 'loading' | 'error'
  onRetry: () => void
}) {
  return (
    <section
      className="map-feedback"
      aria-label="Carregamento do mapa"
      aria-busy={status === 'loading'}
    >
      <span className="map-feedback__icon">
        <Icon name="earth" size={42} />
      </span>
      <Text as="h2" variant="heading">
        {status === 'loading'
          ? 'Preparando nosso mundo…'
          : 'O mapa não chegou ainda'}
      </Text>
      {status === 'error' && (
        <>
          <Text>Vamos tentar de novo?</Text>
          <Button tone="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </>
      )}
    </section>
  )
}
