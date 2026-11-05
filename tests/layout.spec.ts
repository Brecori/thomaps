import { expect, test } from '@playwright/test'
import type { RecognitionClient } from '../src/services/speechRecognition'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Brasil', exact: true }),
  ).toBeVisible()
})

test('seleciona um país e fecha o cartão', async ({ page }) => {
  await page.getByRole('button', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Brasília', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Bandeira: Brasil' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Fechar país' }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).not.toBeVisible()
})

test('aproxima o mapa e volta à visão mundial', async ({ page }) => {
  const afastar = page.getByRole('button', { name: 'Afastar mapa' })
  await expect(afastar).toBeDisabled()
  await page.getByRole('button', { name: 'Aproximar mapa' }).click()
  await expect(afastar).toBeEnabled()

  await afastar.click()
  await expect(afastar).toBeDisabled()
  await page.getByRole('button', { name: 'Aproximar mapa' }).click()
  await expect(afastar).toBeEnabled()

  await page.getByRole('button', { name: 'Ver o mundo' }).click()
  await expect(afastar).toBeDisabled()
})

test('clicar no oceano limpa a seleção e fecha o cartão', async ({ page }) => {
  await page.getByRole('button', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('group', { name: 'Mapa-múndi interativo', exact: true })
    .click({ position: { x: 640, y: 180 } })
  await expect(
    page.getByRole('button', { name: 'Fechar país' }),
  ).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Brasil', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
})

test('permite tentar novamente quando o mapa não carrega', async ({ page }) => {
  await page.route('**/data/countries.json', (route) =>
    route.fulfill({ status: 503, body: '' }),
  )
  await page.reload()
  await expect(page.getByText('O mapa não chegou ainda')).toBeVisible()

  await page.unroute('**/data/countries.json')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(
    page.getByRole('button', { name: 'Brasil', exact: true }),
  ).toBeVisible()
})

test('busca por nome, alias e teclado, com até três sugestões', async ({
  page,
}) => {
  const input = page.getByRole('combobox', {
    name: 'Qual país vamos conhecer?',
  })
  await input.fill('JAPAO')
  await expect(
    page.getByRole('option', { name: 'Japão', exact: true }),
  ).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Japão', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Fechar país' }).click()
  await expect(input).toBeFocused()

  await input.fill('Nippon')
  await expect(
    page.getByRole('option', { name: 'Japão', exact: true }),
  ).toBeVisible()
  await input.fill('pais-inexistente')
  await expect(page.getByRole('status')).toContainText(
    'Não encontrei esse país. Vamos tentar outro nome?',
  )

  await input.fill('guine')
  await expect(page.getByRole('option')).toHaveCount(3)
  const firstPage = await page.getByRole('option').allTextContents()
  await page.getByRole('button', { name: 'Próximos', exact: true }).click()
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Próximos', exact: true }),
  ).toBeDisabled()
  expect(await page.getByRole('option').allTextContents()).not.toEqual(
    firstPage,
  )
  await input.focus()
  await input.press('Escape')
  await expect(page.getByRole('listbox')).not.toBeVisible()
})

test('busca por voz permite erro, cancelamento e seleção da transcrição', async ({
  page,
}) => {
  await page.addInitScript(() => {
    class FakeRecognition implements RecognitionClient {
      lang = ''
      continuous = false
      interimResults = false
      maxAlternatives = 1
      onstart: RecognitionClient['onstart'] = null
      onaudioend: RecognitionClient['onaudioend'] = null
      onresult: RecognitionClient['onresult'] = null
      onerror: RecognitionClient['onerror'] = null
      onnomatch: RecognitionClient['onnomatch'] = null
      onend: RecognitionClient['onend'] = null
      start() {
        ;(window as Window & { recognition?: RecognitionClient }).recognition =
          this
        this.onstart?.()
      }
      abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      value: FakeRecognition,
      configurable: true,
    })
  })
  await page.reload()
  const microphone = page.getByRole('button', {
    name: 'Falar o nome de um país',
  })
  await microphone.click()
  await expect(page.getByRole('status')).toContainText(
    'Estou ouvindo! Fale o nome de um país.',
  )
  await page.evaluate(() => {
    const recognition = (window as Window & { recognition?: RecognitionClient })
      .recognition
    recognition?.onerror?.({ error: 'not-allowed' })
  })
  await expect(page.getByRole('status')).toContainText(
    'O microfone não foi permitido',
  )

  await microphone.click()
  await page.getByRole('button', { name: 'Cancelar busca por voz' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Busca por voz cancelada.',
  )

  await microphone.click()
  await page.evaluate(() => {
    const recognition = (window as Window & { recognition?: RecognitionClient })
      .recognition
    recognition?.onresult?.({
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: 'Brasil' } }],
    })
  })
  await expect(
    page.getByRole('combobox', { name: 'Qual país vamos conhecer?' }),
  ).toHaveValue('Brasil')
  await page.getByRole('option', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
})

test('mantém busca textual quando a voz não é suportada', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', { value: undefined })
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
    })
  })
  await page.reload()
  await page.getByRole('button', { name: 'Busca por voz indisponível' }).click()
  await expect(page.getByRole('status')).toContainText(
    'A voz não está disponível neste navegador',
  )
  await page
    .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
    .fill('Brasil')
  await page.getByRole('option', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
})

test.describe('celular', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })

  test('cartão permanece na área visível com as barras do navegador abertas', async ({
    page,
  }) => {
    const map = page.locator('.world-map svg')
    const card = page.locator('.atlas-shell__details')
    await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
    await expect(map).toHaveAttribute('data-animating', 'false')
    const initialSize = await map.boundingBox()

    // Browser chrome takes part of the screen while 100lvh remains unchanged.
    await page.evaluate(() => {
      const viewport = window.visualViewport!
      Object.defineProperty(viewport, 'height', {
        configurable: true,
        value: 744,
      })
      viewport.dispatchEvent(new Event('resize'))
    })
    await expect(async () => {
      const bounds = await card.boundingBox()
      const close = await page
        .getByRole('button', { name: 'Fechar país' })
        .boundingBox()
      const size = await map.boundingBox()
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(744)
      expect(close!.y + close!.height).toBeLessThanOrEqual(744)
      expect(size!.height).toBe(initialSize!.height)
      expect(size!.width).toBe(initialSize!.width)
    }).toPass({ timeout: 5000 })
    await page.getByText('Créditos do hino', { exact: true }).tap()
    await card.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect(
      page.getByRole('button', { name: 'Fechar país' }),
    ).toBeInViewport({ ratio: 1 })
    await expect(
      page.getByRole('button', { name: 'Nigéria', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('marcador de país pequeno mantém tamanho ao selecionar, fechar e afastar', async ({
    page,
  }) => {
    const map = page.locator('.world-map svg')
    const marker = page.getByRole('button', {
      name: 'Mônaco — marcador',
      exact: true,
    })
    const expectMarkerSize = async () => {
      await expect(async () => {
        const box = await marker.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return { width: rect.width, height: rect.height }
        })
        expect(box.width).toBeCloseTo(14, 1)
        expect(box.height).toBeCloseTo(14, 1)
      }).toPass()
    }
    await expectMarkerSize()
    await marker.tap()
    await expect(
      page.getByRole('heading', { name: 'Mônaco', exact: true }),
    ).toBeVisible()
    await expect(map).toHaveAttribute('data-animating', 'false')
    await expectMarkerSize()
    const camera = await map
      .locator('.world-map__layer')
      .getAttribute('transform')

    await page
      .getByRole('button', { name: 'Fechar país', exact: true })
      .press('Enter')
    await expect(
      page.getByRole('heading', { name: 'Mônaco', exact: true }),
    ).not.toBeVisible()
    await expect(marker).toHaveAttribute('aria-pressed', 'false')
    await expect(marker).toBeFocused()
    expect(
      await marker.evaluate((element) => element.matches(':focus-visible')),
    ).toBe(true)
    await expect(marker).toHaveCSS('outline-style', 'none')
    await expect(marker).toHaveCSS('vector-effect', 'non-scaling-stroke')
    await expect(map.locator('.world-map__layer')).toHaveAttribute(
      'transform',
      camera!,
    )
    await expectMarkerSize()

    await page.getByRole('button', { name: 'Afastar mapa', exact: true }).tap()
    await expect(map).toHaveAttribute('data-animating', 'false')
    await expectMarkerSize()
    await marker.tap()
    await expect(map).toHaveAttribute('data-animating', 'false')
    await expectMarkerSize()
    await page.getByRole('button', { name: 'Fechar país', exact: true }).tap()
    await expectMarkerSize()
  })

  test('teclado sobrepõe o mapa sem redimensionar ou mover a câmera', async ({
    page,
  }) => {
    const map = page.locator('.world-map svg')
    await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
    await expect(map).toHaveAttribute('data-animating', 'false')
    const size = await map.boundingBox()
    const camera = await map
      .locator('.world-map__layer')
      .getAttribute('transform')
    await page
      .getByRole('button', { name: 'Pesquisar país', exact: true })
      .tap()
    const input = page.getByRole('combobox')
    await expect(input).toBeFocused()
    await input.fill('guine')

    // Simulate the keyboard reducing only the visual viewport, as on mobile.
    await page.evaluate(() => {
      const viewport = window.visualViewport!
      Object.defineProperty(viewport, 'height', {
        configurable: true,
        value: 420,
      })
      viewport.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
    })
    await expect(async () => {
      const current = await map.boundingBox()
      expect(current!.height).toBe(size!.height)
      expect(current!.width).toBe(size!.width)
      expect(
        await map.locator('.world-map__layer').getAttribute('transform'),
      ).toBe(camera)
      const results = await page.locator('.country-search__popup').boundingBox()
      expect(results!.y + results!.height).toBeLessThanOrEqual(420)
    }).toPass()

    await page.evaluate(() => {
      const viewport = window.visualViewport!
      Reflect.deleteProperty(viewport, 'height')
      viewport.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
    })
    await input.press('Escape')
    await expect(map).toHaveAttribute('height', String(size!.height))
    await expect(map.locator('.world-map__layer')).toHaveAttribute(
      'transform',
      camera!,
    )
    await expect(
      page.getByRole('button', { name: 'Nigéria', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('pesquisa abre sobre o mapa e fecha pelo backdrop sem perder a seleção', async ({
    page,
  }) => {
    const map = page.getByRole('group', {
      name: 'Mapa-múndi interativo',
      exact: true,
    })
    await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
    await expect(map).toHaveAttribute('data-animating', 'false')
    const camera = await map
      .locator('.world-map__layer')
      .getAttribute('transform')
    const searchButton = page.getByRole('button', {
      name: 'Pesquisar país',
      exact: true,
    })
    await searchButton.tap()
    await expect(
      page.getByRole('dialog', { name: 'Pesquisar país' }),
    ).toBeVisible()
    const input = page.getByRole('combobox')
    await expect(input).toBeFocused()
    await input.press('Shift+Tab')
    await expect(
      page.getByRole('button', { name: 'Fechar pesquisa', exact: true }),
    ).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
    await expect(page.locator('.atlas-shell__map')).toHaveAttribute('inert', '')

    await page
      .getByRole('button', { name: 'Fechar pesquisa pelo fundo' })
      .tap({ position: { x: 200, y: 500 } })
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(searchButton).toBeFocused()
    await expect(
      page.getByRole('button', { name: 'Nigéria', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(map.locator('.world-map__layer')).toHaveAttribute(
      'transform',
      camera!,
    )

    await searchButton.tap()
    await page.getByRole('combobox').press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(searchButton).toBeFocused()
  })

  for (const dismiss of ['cartão', 'oceano'] as const) {
    test(`mantém a câmera ao desselecionar pelo ${dismiss}`, async ({
      page,
    }) => {
      const map = page.getByRole('group', {
        name: 'Mapa-múndi interativo',
        exact: true,
      })
      await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
      await expect(map).toHaveAttribute('data-animating', 'false')
      const camera = await map
        .locator('.world-map__layer')
        .getAttribute('transform')

      if (dismiss === 'cartão')
        await page.getByRole('button', { name: 'Fechar país' }).tap()
      else await map.tap({ position: { x: 10, y: 400 } })

      await expect(
        page.getByRole('button', { name: 'Fechar país' }),
      ).not.toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Nigéria', exact: true }),
      ).toHaveAttribute('aria-pressed', 'false')
      // Include the panel exit, layout measurement and camera transition window.
      await page.waitForTimeout(600)
      await expect(map.locator('.world-map__layer')).toHaveAttribute(
        'transform',
        camera!,
      )
      await expect(map).toHaveAttribute('data-animating', 'false')

      await page.getByRole('button', { name: 'Ver o mundo' }).tap()
      await expect(
        page.getByRole('button', { name: 'Afastar mapa' }),
      ).toBeDisabled()
      await expect(map.locator('.world-map__layer')).not.toHaveAttribute(
        'transform',
        camera!,
      )
    })
  }

  test('seleciona por toque e interrompe o hino ao abrir a pesquisa', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
    await expect(
      page.getByRole('heading', { name: 'Nigéria', exact: true }),
    ).toBeInViewport()
    await expect(page.getByRole('combobox')).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Ouvir hino', exact: true }),
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Fechar país' }).tap()
    await expect(
      page.getByRole('heading', { name: 'Nigéria', exact: true }),
    ).not.toBeVisible()
    await page
      .getByRole('button', { name: 'Pesquisar país', exact: true })
      .tap()
    await page
      .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
      .fill('Brasil')
    await page.getByRole('option', { name: 'Brasil', exact: true }).tap()
    await expect(
      page.getByRole('heading', { name: 'Brasil', exact: true }),
    ).toBeInViewport()
    await expect(page.getByRole('combobox')).not.toBeVisible()
    const play = page.getByRole('button', { name: 'Ouvir hino', exact: true })
    const progress = page.getByRole('progressbar', {
      name: 'Andamento do hino',
    })
    await expect(play).toBeInViewport({ ratio: 1 })
    await expect(progress).not.toBeVisible()
    await play.tap()
    await expect
      .poll(async () => Number(await progress.getAttribute('value')))
      .toBeGreaterThan(0.2)

    const searchButton = page.getByRole('button', {
      name: 'Pesquisar país',
      exact: true,
    })
    await searchButton.tap()
    await expect(page.getByRole('combobox')).toBeFocused()
    await expect(
      page.getByRole('button', { name: 'Pausar hino', exact: true }),
    ).not.toBeVisible()
    await expect(progress).not.toBeVisible()
    await page
      .getByRole('button', { name: 'Fechar pesquisa', exact: true })
      .tap()
    await expect(
      page.getByRole('button', { name: 'Brasil', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(searchButton).toBeFocused()
    await expect(play).toBeEnabled()
    await expect(progress).not.toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Brasil', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Fechar país' }).tap()
    await expect(searchButton).toBeFocused()
    await expect(
      page.getByRole('heading', { name: 'Brasil', exact: true }),
    ).not.toBeVisible()
  })

  test('enquadra países sem liberar os limites do mapa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const search = page.getByRole('combobox')
    const map = page.getByRole('group', {
      name: 'Mapa-múndi interativo',
      exact: true,
    })
    const minimum = Number(await map.getAttribute('data-zoom'))
    for (const name of ['Canadá', 'Argentina', 'Noruega', 'Brasil']) {
      await page
        .getByRole('button', { name: 'Pesquisar país', exact: true })
        .tap()
      await search.fill(name)
      await page.getByRole('option', { name, exact: true }).tap()
      await expect(async () => {
        const country = await page
          .getByRole('button', { name, exact: true })
          .boundingBox()
        const brand = await page.locator('.atlas-shell__brand').boundingBox()
        const card = await page
          .getByRole('region', { name, exact: true })
          .boundingBox()
        const world = await map.locator('.world-map__ocean').boundingBox()
        const viewport = await map.boundingBox()
        expect(
          Number(await map.getAttribute('data-zoom')),
        ).toBeGreaterThanOrEqual(minimum - 0.0001)
        expect(world!.x).toBeLessThanOrEqual(viewport!.x + 0.5)
        expect(world!.y).toBeLessThanOrEqual(viewport!.y + 0.5)
        expect(world!.x + world!.width).toBeGreaterThanOrEqual(
          viewport!.x + viewport!.width - 0.5,
        )
        expect(world!.y + world!.height).toBeGreaterThanOrEqual(
          viewport!.y + viewport!.height - 0.5,
        )
        expect(country!.y).toBeGreaterThan(brand!.y + brand!.height + 8)
        expect(country!.y + country!.height).toBeLessThan(card!.y - 8)
      }).toPass()
    }
  })
})
