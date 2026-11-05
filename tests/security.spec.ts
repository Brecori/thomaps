import { expect, test } from '@playwright/test'
import { anthemSchema } from '../src/domain/anthem'
import { readFileSync } from 'node:fs'

const countries = JSON.parse(readFileSync('public/data/countries.json', 'utf8'))
const anthem = countries.find(
  (country: { id: string }) => country.id === 'BRA',
).anthem

test('recusa protocolos executáveis, mídia externa e origem falsa nos créditos', () => {
  expect(anthemSchema.safeParse(anthem).success).toBe(true)
  for (const licenseUrl of [
    'javascript:alert(1)',
    'data:text/html,test',
    'http://example.com',
  ])
    expect(anthemSchema.safeParse({ ...anthem, licenseUrl }).success).toBe(
      false,
    )
  for (const src of [
    'https://example.com/br.mp3',
    '//example.com/br.mp3',
    '/audio/anthems/../../x.mp3',
  ])
    expect(anthemSchema.safeParse({ ...anthem, src }).success).toBe(false)
  expect(
    anthemSchema.safeParse({
      ...anthem,
      sourcePage: 'https://commons.wikimedia.org.evil.test/file',
    }).success,
  ).toBe(false)
  for (const country of countries)
    expect(anthemSchema.safeParse(country.anthem).success).toBe(true)
})

test('política HTTP bloqueia script inline e conexão externa sem impedir o atlas', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto('/')
  const headers = response!.headers()
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['permissions-policy']).toContain('microphone=(self)')
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
  await page
    .getByRole('combobox', { name: 'Qual país vamos conhecer?' })
    .fill('Brasil')
  await page.getByRole('option', { name: 'Brasil', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Ouvir hino', exact: true }),
  ).toBeEnabled()

  const result = await page.evaluate(async () => {
    const violations: string[] = []
    document.addEventListener('securitypolicyviolation', (event) =>
      violations.push(event.effectiveDirective),
    )
    const script = document.createElement('script')
    script.textContent = 'document.body.dataset.injected = "yes"'
    document.body.append(script)
    let blocked = false
    try {
      await fetch('https://example.com/security-probe')
    } catch {
      blocked = true
    }
    // securitypolicyviolation is queued by the browser after the blocked operation.
    await new Promise((resolve) => window.setTimeout(resolve, 100))
    return { injected: document.body.dataset.injected, blocked, violations }
  })
  expect(result.injected).toBeUndefined()
  expect(result.blocked).toBe(true)
  expect(result.violations).toContain('script-src-elem')
  expect(result.violations).toContain('connect-src')
  expect(errors).toEqual([])
})
