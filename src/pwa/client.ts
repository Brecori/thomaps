import { isPwaReply, type PwaReply, type PwaRequest } from './protocol'

/** All SW messages have an answer deadline; a suspended worker cannot lock the UI. */
export function askWorker(
  worker: ServiceWorker,
  request: PwaRequest,
): Promise<PwaReply> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    const timer = window.setTimeout(
      () => {
        channel.port1.close()
        reject(new Error('O preparo demorou. Tente novamente com conexão.'))
      },
      request.type === 'REPAIR_OFFLINE' ? 60_000 : 10_000,
    )
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      window.clearTimeout(timer)
      channel.port1.close()
      if (isPwaReply(event.data)) resolve(event.data)
      else reject(new Error('Não foi possível verificar o modo offline.'))
    }
    try {
      worker.postMessage(request, [channel.port2])
    } catch (error) {
      window.clearTimeout(timer)
      channel.port1.close()
      reject(error)
    }
  })
}

export type InstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
export function installedDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  )
}
export function installInstructions() {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (ios)
    return 'No Safari, toque em Compartilhar e em Adicionar à Tela de Início. Se estiver em outro navegador, abra este endereço no Safari.'
  if (/Android/i.test(navigator.userAgent))
    return 'No menu do navegador, procure Instalar aplicativo ou Adicionar à tela inicial. A opção depende do navegador e deste endereço oferecer instalação.'
  return 'No menu ou na barra de endereço do navegador, procure Instalar Thomaps. Se essa opção não aparecer, você pode continuar usando no navegador.'
}
