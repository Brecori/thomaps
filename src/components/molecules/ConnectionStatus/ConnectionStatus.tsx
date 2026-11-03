import type { OfflineReadiness } from '@/pwa/protocol'

export function ConnectionStatus({
  readiness,
  online,
}: {
  readiness: OfflineReadiness
  online: boolean
}) {
  const text =
    readiness === 'ready'
      ? online
        ? 'Mapa e bandeiras prontos para usar sem internet.'
        : 'Sem internet. Mapa e bandeiras disponíveis.'
      : readiness === 'preparing'
        ? 'Guardando mapa e bandeiras para usar sem internet…'
        : readiness === 'unavailable'
          ? 'Instalação e modo offline ficam disponíveis na versão publicada por HTTPS.'
          : online
            ? 'O mapa offline ainda não está completo.'
            : 'Sem internet. O mapa offline está incompleto.'
  return (
    <p
      className={`connection-status connection-status--${readiness}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </p>
  )
}
