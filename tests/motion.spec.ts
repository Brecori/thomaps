import { expect, test } from '@playwright/test'

test('movimento reduzido preserva seleção, troca e retorno de foco', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const search = page.getByRole('combobox', {
    name: 'Qual país vamos conhecer?',
  })
  await search.fill('Brasil')
  await page.getByRole('option', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).toBeVisible()
  await search.fill('Japão')
  await page.getByRole('option', { name: 'Japão', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Japão', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Brasil', exact: true }),
  ).not.toBeVisible()
  await page.getByRole('button', { name: 'Fechar país', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Japão', exact: true }),
  ).not.toBeVisible()
  await expect(search).toBeFocused()
})
