import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

// This exception is limited to one advisory with no upstream fix, in build tools.
// Re-evaluate when deepmerge publishes a fix or node-resolve removes it.
const acceptedAdvisory = 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4'
const buildChain = new Set([
  'deepmerge',
  '@rollup/plugin-node-resolve',
  'workbox-build',
  'vite-plugin-pwa',
])
for (const production of [true, false]) {
  const result = spawnSync(
    'npm',
    ['audit', '--json', ...(production ? ['--omit=dev'] : [])],
    { encoding: 'utf8' },
  )
  if (result.error) throw result.error
  const report = JSON.parse(result.stdout)
  assert.ok(
    !report.error && report.metadata,
    'Falha ao consultar a auditoria npm',
  )
  const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
  for (const [name, finding] of vulnerabilities) {
    assert.ok(
      !production && buildChain.has(name),
      `Vulnerabilidade não aceita: ${name}`,
    )
    assert.equal(finding.severity, 'low', name)
    assert.equal(finding.isDirect, name === 'vite-plugin-pwa', name)
    for (const via of finding.via)
      assert.ok(
        typeof via === 'string'
          ? buildChain.has(via)
          : via.url === acceptedAdvisory,
        `Novo alerta em ${name}`,
      )
  }
  console.log(
    production
      ? 'Produção: 0 vulnerabilidades conhecidas.'
      : `Build: ${vulnerabilities.length} pacotes na exceção de risco baixo documentada (deepmerge).`,
  )
}
