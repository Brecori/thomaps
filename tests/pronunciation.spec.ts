import { expect, test } from '@playwright/test'

type MockSynthesis = SpeechSynthesis & {
  voices: SpeechSynthesisVoice[]
  utterances: SpeechSynthesisUtterance[]
  current: SpeechSynthesisUtterance | null
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class Synthesis extends EventTarget {
      voices = [
        {
          name: 'Português do Brasil',
          lang: 'pt-BR',
          voiceURI: 'test-pt-BR',
          localService: true,
          default: true,
        },
      ]
      utterances: SpeechSynthesisUtterance[] = []
      current: SpeechSynthesisUtterance | null = null
      getVoices() {
        return this.voices
      }
      speak(utterance: SpeechSynthesisUtterance) {
        this.current = utterance
        this.utterances.push(utterance)
        utterance.onstart?.call(
          utterance,
          new Event('start') as SpeechSynthesisEvent,
        )
      }
      cancel() {
        this.current = null
      }
    }
    class Utterance {
      text: string
      constructor(text: string) {
        this.text = text
      }
    }
    class Recognition {
      onstart: (() => void) | null = null
      start() {
        this.onstart?.()
      }
      abort() {}
    }
    Object.defineProperty(window, 'speechSynthesis', {
      value: new Synthesis(),
      configurable: true,
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: Utterance,
      configurable: true,
    })
    Object.defineProperty(window, 'SpeechRecognition', {
      value: Recognition,
      configurable: true,
    })
  })
  await page.goto('/')
  await page
    .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
    .fill('Brasil')
  await page.getByRole('option', { name: 'Brasil', exact: true }).click()
})

test('pronuncia o nome em pt-BR, interrompe e alterna com o microfone', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Ouvir nome', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Parar nome', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => {
      const utterance = (window.speechSynthesis as MockSynthesis).current
      return {
        text: utterance?.text,
        lang: utterance?.lang,
        voice: utterance?.voice?.lang,
      }
    }),
  ).toEqual({ text: 'Brasil', lang: 'pt-BR', voice: 'pt-BR' })

  await page.getByRole('button', { name: 'Parar nome', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Ouvir nome', exact: true }),
  ).toBeEnabled()
  expect(
    await page.evaluate(
      () => (window.speechSynthesis as MockSynthesis).current,
    ),
  ).toBeNull()

  await page.getByRole('button', { name: 'Ouvir nome', exact: true }).click()
  await page.getByRole('button', { name: 'Falar o nome de um país' }).click()
  await expect(
    page.getByRole('button', { name: 'Cancelar busca por voz' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => (window.speechSynthesis as MockSynthesis).current,
    ),
  ).toBeNull()
  await page.getByRole('button', { name: 'Ouvir nome', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Falar o nome de um país' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Parar nome', exact: true }),
  ).toBeVisible()

  await page
    .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
    .fill('japao')
  await page.getByRole('option', { name: 'Japão', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Japão', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => (window.speechSynthesis as MockSynthesis).current,
    ),
  ).toBeNull()
  await page.getByRole('button', { name: 'Ouvir nome', exact: true }).click()
  await page.getByRole('button', { name: 'Fechar país' }).click()
  expect(
    await page.evaluate(
      () => (window.speechSynthesis as MockSynthesis).current,
    ),
  ).toBeNull()
})

test('explica ausência de pt-BR e aceita vozes carregadas depois, sem autoplay', async ({
  page,
}) => {
  await page.evaluate(() => {
    const synth = window.speechSynthesis as MockSynthesis
    synth.voices = [
      {
        name: 'Português de Portugal',
        lang: 'pt-PT',
        voiceURI: 'test-pt-PT',
        localService: true,
        default: true,
      },
    ]
    synth.dispatchEvent(new Event('voiceschanged'))
  })
  await expect(
    page.getByRole('button', { name: 'Ouvir nome', exact: true }),
  ).toBeDisabled()
  await expect(
    page
      .getByRole('region', { name: 'Brasil', exact: true })
      .getByRole('status'),
  ).toContainText(
    'Este aparelho não tem uma voz em português do Brasil disponível.',
  )

  await page.evaluate(() => {
    const synth = window.speechSynthesis as MockSynthesis
    synth.voices = [
      {
        name: 'Português do Brasil',
        lang: 'pt-BR',
        voiceURI: 'test-pt-BR',
        localService: true,
        default: true,
      },
    ]
    synth.dispatchEvent(new Event('voiceschanged'))
  })
  await expect(
    page.getByRole('button', { name: 'Ouvir nome', exact: true }),
  ).toBeEnabled()
  expect(
    await page.evaluate(
      () => (window.speechSynthesis as MockSynthesis).utterances.length,
    ),
  ).toBe(0)
  await page.getByRole('button', { name: 'Ouvir nome', exact: true }).click()
  await page.evaluate(() => {
    const utterance = (window.speechSynthesis as MockSynthesis).current
    utterance?.onerror?.call(utterance, {
      error: 'network',
    } as SpeechSynthesisErrorEvent)
  })
  await expect(
    page
      .getByRole('region', { name: 'Brasil', exact: true })
      .getByRole('status'),
  ).toContainText('A voz não conseguiu se conectar.')
  await expect(
    page.getByRole('button', { name: 'Ouvir nome', exact: true }),
  ).toBeEnabled()
})
