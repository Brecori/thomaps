import { expect, test } from '@playwright/test'

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`prévia e cartão permanecem acessíveis em ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.locator('.atlas-backdrop__map')).toHaveJSProperty(
      'complete',
      true,
    )
    await expect(page.locator('.atlas-backdrop__map')).not.toHaveJSProperty(
      'naturalWidth',
      0,
    )
    await expect(
      page.getByRole('heading', { name: 'Olá, pequeno explorador!' }),
    ).toBeVisible()
    await expect(page.getByRole('searchbox')).toBeInViewport()
    const overflow = await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth > innerWidth,
      vertical: document.documentElement.scrollHeight > innerHeight,
    }))
    expect(overflow).toEqual({ horizontal: false, vertical: false })
    const open = page.getByRole('button', { name: 'Conhecer o Brasil' })
    await open.click()
    await expect(
      page.getByRole('heading', { name: 'Brasil', exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Brasília', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Ouvir hino' }),
    ).toBeDisabled()
    const close = page.getByRole('button', { name: 'Fechar cartão de exemplo' })
    await expect(close).toBeInViewport()
    await expect(page.getByRole('searchbox')).toBeInViewport()
    await page
      .getByRole('button', { name: 'Ouvir hino' })
      .scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('button', { name: 'Ouvir hino' }),
    ).toBeInViewport()
    await close.scrollIntoViewIfNeeded()
    const size = await close.boundingBox()
    expect(size!.width).toBeGreaterThanOrEqual(56)
    expect(size!.height).toBeGreaterThanOrEqual(56)
    await close.click()
    await expect(open).toBeFocused()
    await page.getByRole('button', { name: 'Sobre esta prévia' }).click()
    await expect(
      page.getByRole('heading', { name: 'Um mundo em construção' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Fechar ajuda' }).click()
    await expect(
      page.getByRole('button', { name: 'Sobre esta prévia' }),
    ).toBeFocused()
    expect(errors).toEqual([])
  })
}

test('busca comunica o escopo e orientação não perde o estado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('searchbox').fill('Japão')
  await page.getByRole('searchbox').press('Enter')
  await expect(page.getByRole('status')).toContainText('próxima etapa')
  await page.getByRole('button', { name: 'Conhecer o Brasil' }).click()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toHaveValue('Japão')
  await expect(
    page.getByRole('button', { name: 'Fechar cartão de exemplo' }),
  ).toBeInViewport()
  const transition = await page
    .getByRole('button', { name: 'Ouvir hino' })
    .evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(transition).toBe('0s')
})
