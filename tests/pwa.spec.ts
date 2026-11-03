import { expect, test } from '@playwright/test'

test.use({ serviceWorkers: 'allow' })

async function openOptions(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Ajuda do mapa', exact: true }).click()
}

test('prepara todos os países, recupera cache incompleto e reabre offline', async ({
  page,
  context,
}) => {
  test.setTimeout(60_000)
  const audioRequests: string[] = []
  context.on('request', (request) => {
    if (request.url().includes('/audio/anthems/'))
      audioRequests.push(request.url())
  })
  await page.goto('/')
  await openOptions(page)
  await expect(
    page.getByText('Mapa e bandeiras prontos para usar sem internet.', {
      exact: true,
    }),
  ).toBeVisible({ timeout: 30_000 })
  expect(audioRequests).toHaveLength(0)
  const cacheSummary = await page.evaluate(async () => {
    const name = (await caches.keys()).find((name) =>
      name.startsWith('thomaps-'),
    )!
    const cache = await caches.open(name)
    const keys = await cache.keys()
    await cache.delete(keys.find((key) => key.url.includes('/flags/va.svg'))!)
    return {
      flags: keys.filter((key) => key.url.includes('/flags/')).length,
      audio: keys.some((key) => key.url.includes('/audio/')),
    }
  })
  expect(cacheSummary).toEqual({ flags: 195, audio: false })
  await page.getByRole('button', { name: 'Fechar ajuda' }).click()
  await openOptions(page)
  await expect(
    page.getByText('O mapa offline ainda não está completo.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Preparar modo offline', exact: true })
    .click()
  await expect(
    page.getByText('Mapa e bandeiras prontos para usar sem internet.', {
      exact: true,
    }),
  ).toBeVisible()
  await page.close()
  await context.setOffline(true)
  const offlinePage = await context.newPage()
  await offlinePage.goto('/')
  expect(
    await offlinePage.evaluate(async () => {
      try {
        return (await fetch('./data/missing.json')).headers.get('content-type')
      } catch {
        return 'network-error'
      }
    }),
  ).toBe('network-error')
  await offlinePage.getByRole('combobox').fill('Vaticano')
  await offlinePage
    .getByRole('option', { name: 'Vaticano', exact: true })
    .click()
  await expect(
    offlinePage.getByText('Cidade do Vaticano', { exact: true }),
  ).toBeVisible()
  await expect
    .poll(() =>
      offlinePage
        .getByRole('img', { name: 'Bandeira: Vaticano' })
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true)
  await offlinePage
    .getByRole('button', { name: 'Ouvir hino', exact: true })
    .click()
  await expect(
    offlinePage.getByText('Não conseguimos tocar o hino.', { exact: false }),
  ).toBeVisible()
})

test('instala apenas por escolha e reconhece o modo instalado', async ({
  page,
}) => {
  await page.goto('/')
  await openOptions(page)
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt: async () => {
        document.documentElement.dataset.installRequested = 'true'
      },
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    })
    window.dispatchEvent(event)
  })
  await expect(
    page.getByRole('button', { name: 'Instalar Thomaps', exact: true }),
  ).toBeVisible()
  expect(
    await page.locator('html').getAttribute('data-install-requested'),
  ).toBeNull()
  await page
    .getByRole('button', { name: 'Instalar Thomaps', exact: true })
    .click()
  await expect(
    page.getByText('Você pode instalar depois pelo menu do navegador.', {
      exact: true,
    }),
  ).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
  await expect(
    page.getByText('Thomaps já está instalado neste aparelho.', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Instalar Thomaps', exact: true }),
  ).not.toBeVisible()
})
