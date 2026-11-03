import { expect, test, type Page } from '@playwright/test'

async function selectCountry(page: Page, name: string) {
  await page
    .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
    .fill(name)
  await page.getByRole('option', { name, exact: true }).click()
}

test('carrega ao tocar e reproduz, pausa, reinicia e mostra créditos', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/audio/anthems/')) requests.push(request.url())
  })
  await page.goto('/')
  await selectCountry(page, 'Brasil')
  const play = page.getByRole('button', { name: 'Ouvir hino', exact: true })
  await expect(play).toBeEnabled()
  expect(requests).toHaveLength(0)

  await play.click()
  const progress = page.getByRole('progressbar', { name: 'Andamento do hino' })
  await expect
    .poll(async () => Number(await progress.getAttribute('value')))
    .toBeGreaterThan(0.5)
  expect(requests.length).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pausar hino', exact: true }).click()
  await expect(play).toBeVisible()
  await page
    .getByRole('button', { name: 'Reiniciar hino', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Pausar hino', exact: true }),
  ).toBeVisible()
  await expect
    .poll(async () => Number(await progress.getAttribute('value')))
    .toBeLessThan(0.5)

  await page.getByText('Créditos do hino', { exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Arquivo no Wikimedia Commons' }),
  ).toHaveAttribute('href', /Hino_Nacional_Brasileiro/)
  await expect(
    page.getByText('United States Navy Band', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Fechar país' }).click()
  await expect(progress).not.toBeVisible()
})

test('permite tentar novamente após erro e explica hino indisponível', async ({
  page,
}) => {
  await page.route('**/audio/anthems/br.mp3', (route) =>
    route.fulfill({ status: 503, body: '' }),
  )
  await page.goto('/')
  await selectCountry(page, 'Brasil')
  await page.getByRole('button', { name: 'Ouvir hino', exact: true }).click()
  await expect(
    page.getByText('Não conseguimos tocar o hino.', { exact: false }),
  ).toBeVisible()
  await page.unroute('**/audio/anthems/br.mp3')
  await page.getByRole('button', { name: 'Ouvir hino', exact: true }).click()
  await expect
    .poll(async () =>
      Number(await page.getByRole('progressbar').getAttribute('value')),
    )
    .toBeGreaterThan(0.2)
  await selectCountry(page, 'Afeganistão')
  await expect(
    page.getByRole('button', { name: 'Ouvir hino', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByText(
      'Ainda não temos uma gravação deste hino liberada para usar aqui.',
      { exact: false },
    ),
  ).toBeVisible()
})
