import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { ConnectionStatus } from '@/components/molecules/ConnectionStatus'
import type { usePwa } from '@/hooks/usePwa'

type Pwa = ReturnType<typeof usePwa>
export function AppOptions({
  pwa,
  busy,
  onApplyUpdate,
  onDeferUpdate,
}: {
  pwa: Pwa
  busy: boolean
  onApplyUpdate: () => void
  onDeferUpdate: () => void
}) {
  return (
    <section className="app-options" aria-label="Instalação e uso offline">
      <Text as="h3" variant="heading">
        Para o responsável
      </Text>
      <ConnectionStatus readiness={pwa.readiness} online={pwa.online} />
      {pwa.available && (
        <>
          {pwa.installed ? (
            <Text>Thomaps já está instalado neste aparelho.</Text>
          ) : pwa.canInstall ? (
            <Button
              tone="soft"
              onClick={() => void pwa.install()}
              disabled={pwa.installing}
            >
              {pwa.installing ? 'Instalando…' : 'Instalar Thomaps'}
            </Button>
          ) : (
            <Text>{pwa.instructions}</Text>
          )}
          {pwa.installMessage && (
            <Text role="status">{pwa.installMessage}</Text>
          )}
          {['incomplete', 'error'].includes(pwa.readiness) && (
            <Button
              onClick={() => void pwa.prepareOffline()}
              disabled={!pwa.online || pwa.checking}
            >
              Preparar modo offline
            </Button>
          )}
          {pwa.needUpdate ? (
            <div className="app-options__update">
              <Text>Há uma nova versão do Thomaps.</Text>
              <div className="app-options__actions">
                <div className="app-options__buttons">
                  <Button
                    tone="soft"
                    onClick={onApplyUpdate}
                    disabled={busy || pwa.applying}
                  >
                    {pwa.applying ? 'Atualizando…' : 'Atualizar agora'}
                  </Button>
                  <Button onClick={onDeferUpdate} disabled={pwa.applying}>
                    Agora não
                  </Button>
                </div>
                <Text>
                  Você pode continuar usando e atualizar depois, por aqui.
                </Text>
              </div>
              {busy && <Text>Pare o som ou o microfone para atualizar.</Text>}
            </div>
          ) : (
            <Button
              onClick={() => void pwa.checkForUpdate()}
              disabled={!pwa.online || pwa.checking}
            >
              {pwa.checking ? 'Verificando…' : 'Verificar atualizações'}
            </Button>
          )}
        </>
      )}
      {pwa.message && <Text role="status">{pwa.message}</Text>}
      <Text className="app-options__note">
        O mapa, as bandeiras e a busca escrita funcionam sem internet depois do
        preparo. Hinos e busca por voz podem precisar de conexão. A pronúncia
        offline depende da voz instalada no aparelho. O sistema pode liberar o
        espaço guardado; a prontidão é conferida novamente ao voltar ao app.
      </Text>
    </section>
  )
}
