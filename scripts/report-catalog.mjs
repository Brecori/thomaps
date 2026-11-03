import { readFile, writeFile, mkdir } from 'node:fs/promises'

const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const catalog = await read('data-sources/catalog.json')
const audit = await read('data-sources/anthems.json')
const available = audit.records.filter((item) => item.status === 'available')
const gaps = audit.records.filter((item) => item.status === 'unavailable')
const totalBytes = available.reduce((total, item) => total + item.bytes, 0)
const link = (label, url) =>
  `[${label}](<${url.startsWith('https://') ? new URL(url).href : url}>)`
const rows = catalog.map((country) => {
  const media = audit.records.find((item) => item.countryId === country.id)
  const audio =
    media.status === 'available'
      ? `${link('MP3', `../../${media.path}`)} · ${link(media.license, media.sourcePage)}`
      : 'Indisponível; fonte/licença pendente'
  return `| ${country.id} | ${country.namePtBr} | ${country.capitals.join(', ')} | ${link('Fonte', country.metadataSources[0])} | ${link('SVG', `../../public/flags/${country.iso2.toLowerCase()}.svg`)} · ${country.mapFeatureIds.join(', ')} | ${audio} |`
})
const missing = gaps.map((item) => {
  const country = catalog.find((entry) => entry.id === item.countryId)
  return `- **${country.namePtBr} (${country.id})**: ${item.auditNote}`
})
const report = `# Cobertura mundial — T12\n\nRevisão: ${audit.reviewedAt}. Gerado por \`npm run report:catalog\`.\n\n- ${catalog.length}/195 países com metadados revisados, bandeira local e join de geometria validável.\n- ${available.length}/195 hinos locais MP3 com origem, autoria/licença declarada na fonte, hash e duração registrados.\n- ${gaps.length}/195 hinos indisponíveis. A T12 permanece aberta até resolver as lacunas ou registrar uma decisão explícita de escopo.\n- Áudio total: ${(totalBytes / 1024 ** 2).toFixed(2)} MiB; menor ${(Math.min(...available.map((item) => item.bytes)) / 1024).toFixed(0)} KiB, maior ${(Math.max(...available.map((item) => item.bytes)) / 1024 ** 2).toFixed(2)} MiB. Nada é baixado antes de tocar.\n\n## Como foi revisado\n\nNomes em pt-BR comparados ao Unicode CLDR, preservando aliases anteriores e a lista de países acordada. Capitais comparadas às entidades Wikidata por ISO; casos com múltiplas capitais/sedes receberam notas e referências adicionais em [metadata-review.json](../../data-sources/metadata-review.json). As 195 bandeiras foram decodificadas em navegador e conferidas visualmente em quatro folhas de contato; integridade/origem em [phase-2-flags.json](../../data-sources/phase-2-flags.json). A bandeira tricolor afegã do fornecedor foi mantida; ela difere da usada pelas autoridades de facto. Fronteiras e símbolos não expressam reconhecimento político.\n\nAs gravações foram selecionadas pela página individual do Commons, com comparação entre país e descrição/título, incluindo hinos recentes de Mauritânia, Níger e Nigéria. Foram rejeitados candidatos históricos e associações incorretas do índice de descoberta (Angola/São Tomé, Dominica/República Dominicana, Mauritânia/Maurício, Omã/Romênia e Estados Unidos/Hungria). O índice não é a autoridade da licença. Downloads usam as versões MP3 oficiais do Commons, com hash da transferência e conversão local para 96 kbit/s, 44,1 kHz, estéreo e sem cortes. As licenças continuam individuais, inclusive CC BY-SA; não há licença global de domínio público para a coleção.\n\nFFprobe verifica o formato/duração dos arquivos. A reprodução nativa de navegador foi verificada na amostra de T11, e não declarada para cada gravação nem como escuta auditiva das ${available.length}. A qualidade auditiva e aparelhos físicos continuam em T14.\n\n## Lacunas e decisão pendente\n\nEstado registrado: \`${audit.coverageDecision.status}\`. Arquivos de uso não livre da Wikipedia e hinos anteriores não foram usados como substitutos. A pesquisa não comprova inexistência de outras gravações licenciadas. As opções são obter uma fonte reutilizável por país ou aceitar temporariamente a indisponibilidade destes países. Nenhuma exceção é presumida.\n\n${missing.join('\n')}\n\n## Por país\n\nOs links de licença abrem a página individual da gravação; créditos e licença também aparecem no cartão. Evidências completas e hashes: [anthems.json](../../data-sources/anthems.json).\n\n| ID | País | Capital/sede exibida | Metadados | Bandeira · geometria | Hino · fonte/licença |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`
await writeFile('specs/001-atlas-interativo/coverage.md', report)
await mkdir('public/audio', { recursive: true })
await writeFile(
  'public/audio/credits.json',
  JSON.stringify(
    {
      reviewedAt: audit.reviewedAt,
      recordings: available.map(
        ({
          countryId,
          title,
          attribution,
          sourcePage,
          license,
          licenseUrl,
          notice,
          path,
          sha256,
        }) => ({
          countryId,
          title,
          attribution,
          sourcePage,
          license,
          licenseUrl,
          notice,
          src: `/${path.slice('public/'.length)}`,
          sha256,
        }),
      ),
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `${catalog.length} países; ${available.length} gravações; ${gaps.length} lacunas; ${(totalBytes / 1024 ** 2).toFixed(2)} MiB de áudio sob demanda.`,
)
