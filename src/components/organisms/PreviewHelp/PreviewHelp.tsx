import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'

export function PreviewHelp({
  onClose,
  children,
}: {
  onClose: () => void
  children?: ReactNode
}) {
  const region = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    region.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section
      ref={region}
      tabIndex={-1}
      className="preview-help"
      aria-label="Sobre esta prévia"
    >
      <div className="flex items-center justify-between gap-2">
        <Text as="h2" variant="heading">
          Vamos explorar o mundo
        </Text>
        <Button onClick={onClose} aria-label="Fechar ajuda">
          <Icon name="close" />
        </Button>
      </div>
      <Text>
        Toque em um país para conhecê-lo. Arraste o mapa para passear e use os
        botões ou a pinça para chegar mais perto.
      </Text>
      <Text>
        Digite ou fale o nome de um país na busca e escolha uma bandeira. Você
        também pode usar a lista aqui embaixo. No cartão, toque em Ouvir nome
        para escutar em português. Hinos e instalação chegam em outras etapas.
      </Text>
      <Text>
        A pronúncia precisa de uma voz em português do Brasil no aparelho.
        Dependendo da voz oferecida pelo navegador, pode precisar de conexão.
      </Text>
      <Text>
        Para o responsável: a busca por voz depende do navegador e pode enviar
        áudio a um serviço online. O atlas não salva áudio nem transcrições. O
        microfone só é solicitado ao tocar em Falar e pode ser cancelado.
      </Text>
      <Text>
        Fontes: Natural Earth, Flagpedia e mledoze/countries. Gravações
        candidatas: Wikimedia Commons.
      </Text>
      {children}
    </section>
  )
}
import { useLayoutEffect, useRef, type ReactNode } from 'react'
