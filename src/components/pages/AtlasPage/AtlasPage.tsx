import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { Text } from '@/components/atoms/Text'
import { Brand } from '@/components/molecules/Brand'
import { SearchField } from '@/components/molecules/SearchField'
import { ZoomControls } from '@/components/molecules/ZoomControls'
import { AtlasBackdrop } from '@/components/organisms/AtlasBackdrop'
import { CountryDetails } from '@/components/organisms/CountryDetails'
import { PreviewHelp } from '@/components/organisms/PreviewHelp'
import { AtlasTemplate } from '@/components/templates/AtlasTemplate'
import { previewCountry } from '@/data/preview-country'
import { useViewportHeight } from '@/hooks/useViewportHeight'

export function AtlasPage() {
  useViewportHeight()
  const [query, setQuery] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const exampleButton = useRef<HTMLButtonElement>(null)
  const helpButton = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<'example' | 'help' | null>(null)
  useLayoutEffect(() => {
    if (returnFocus.current === 'example' && !detailsOpen) {
      exampleButton.current?.focus()
      returnFocus.current = null
    } else if (returnFocus.current === 'help' && !helpOpen) {
      helpButton.current?.focus()
      returnFocus.current = null
    }
  }, [detailsOpen, helpOpen])
  const showNotice = () =>
    setNotice(
      'Busca e microfone chegam em uma próxima etapa. Por enquanto, conheça o cartão de exemplo!',
    )

  return (
    <AtlasTemplate
      map={<AtlasBackdrop />}
      brand={<Brand />}
      search={
        <SearchField
          value={query}
          onChange={setQuery}
          onUnavailable={showNotice}
        />
      }
      navigation={<ZoomControls />}
      utility={
        <>
          <span className="preview-badge">PRÉVIA</span>
          <Button
            ref={helpButton}
            onClick={() => setHelpOpen(true)}
            aria-label="Sobre esta prévia"
            aria-expanded={helpOpen}
          >
            <Icon name="info" />
          </Button>
        </>
      }
      introduction={
        <div className="explore-invitation">
          <span className="explore-invitation__icon">
            <Icon name="hand" size={30} />
          </span>
          <div>
            <Text as="h1" variant="heading">
              Olá, pequeno explorador!
            </Text>
            <Text>O mundo inteiro espera por você.</Text>
            <Button
              ref={exampleButton}
              tone="primary"
              className="explore-invitation__button"
              aria-expanded={detailsOpen}
              onClick={() => {
                setDetailsOpen(true)
                setNotice('')
              }}
            >
              Conhecer o Brasil
              <Icon name="arrow" size={22} />
            </Button>
          </div>
        </div>
      }
      details={
        detailsOpen ? (
          <CountryDetails
            country={previewCountry}
            onClose={() => {
              returnFocus.current = 'example'
              setDetailsOpen(false)
            }}
          />
        ) : undefined
      }
      help={
        helpOpen ? (
          <PreviewHelp
            onClose={() => {
              returnFocus.current = 'help'
              setHelpOpen(false)
            }}
          />
        ) : undefined
      }
      status={
        <>
          <span className="phase-note" id="preview-search-note">
            Um primeiro olhar no nosso mundo. Interações em breve!
          </span>
          <p className="notice" role="status">
            {notice}
          </p>
          <span className="made-with">
            <Icon name="heart" size={18} />
            Feito para descobrir
          </span>
        </>
      }
    />
  )
}
