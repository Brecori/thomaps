import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'

export function PreviewHelp({ onClose }: { onClose: () => void }) {
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
          Um mundo em construção
        </Text>
        <Button onClick={onClose} aria-label="Fechar ajuda">
          <Icon name="close" />
        </Button>
      </div>
      <Text>
        Esta é a base visual do Thomaps. Você já pode conhecer o cartão de
        exemplo do Brasil.
      </Text>
      <Text>
        Mapa interativo, busca, sons e instalação serão acrescentados nas
        próximas etapas.
      </Text>
      <Text>
        Fontes: Natural Earth, Flagpedia e mledoze/countries. Gravações
        candidatas: Wikimedia Commons.
      </Text>
    </section>
  )
}
import { useLayoutEffect, useRef } from 'react'
