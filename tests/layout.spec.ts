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

  test('abre e fecha o país por toque', async ({ page }) => {
    await page.getByRole('button', { name: 'Nigéria', exact: true }).tap()
    await expect(
      page.getByRole('heading', { name: 'Nigéria', exact: true }),
    ).toBeInViewport()
    await expect(
      page.getByRole('combobox', { name: 'Qual país vamos conhecer?' }),
    ).toBeInViewport()

    await page.getByRole('button', { name: 'Fechar país' }).tap()
    await expect(
      page.getByRole('heading', { name: 'Nigéria', exact: true }),
    ).not.toBeVisible()
    await page
      .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
      .fill('Brasil')
    await page.getByRole('option', { name: 'Brasil', exact: true }).tap()
    await expect(
      page.getByRole('heading', { name: 'Brasil', exact: true }),
    ).toBeInViewport()
  })
})
