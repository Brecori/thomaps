# Snapshot do catálogo — fase 0

Data de revisão: 2026-11-02. Estes arquivos são insumos de auditoria, não o catálogo final integrado ao mapa.

- `catalog.json`: lista explícita de 195 países, filtrada por `unMember` mais `PSE`/`VAT` no snapshot de mledoze/countries. Nomes, aliases, capitais, coordenadas e correspondências com a geometria. A revisão editorial completa fica em T12; cinco entradas foram revisadas nesta fase.
- `natural-earth-50m.geojson`: 242 geometrias do Natural Earth 1:50m; propriedades reduzidas e coordenadas preservadas. Todos os 195 países do catálogo têm referência a uma geometria. Isso não comprova precisão, tamanho de alvo ou enquadramento, tratados em T05–T07.
- `manifest.json`: origem, licença declarada, data e SHA-256 do original e do snapshot transformado. A data representa a captura, não a data de atualização de cada informação no fornecedor.
- `flag-audit.json`: origem, licença declarada, tamanho e hash das cinco bandeiras baixadas em `public/flags/`.
- `anthem-audit.json`: cinco gravações candidatas, descrição da fonte, formato/tamanho/duração informados nas páginas e resultado da tentativa de download. HTTP 403 impediu inspecionar os binários; não se trata de verificação de reprodução.
- `phase-2-flags.json`: origem, integridade e estado de revisão editorial das 195 bandeiras locais preparadas para os cartões em T07. As demais 190 ainda aguardam revisão editorial em T12.

Na fase 2, o join da Austrália foi corrigido para apenas AUS: IOA e ATC são geometrias de territórios dependentes que permanecem como contexto, conforme o escopo inicial. O hash do catálogo derivado foi atualizado intencionalmente; o hash do arquivo original do fornecedor foi preservado.

`npm run assets:map` deriva os arquivos de runtime em public/data/ com TopoJSON quantizado, mantendo todas as 242 geometrias. O contrato de runtime valida os 195 países e seus joins antes de desenhar. Para Palestina, o cartão rotula Ramallah como sede administrativa, sem expor notas internas de revisão editorial como texto do produto.

## Licenças e atribuição

O catálogo derivado de [mledoze/countries](https://github.com/mledoze/countries) é disponibilizado sob ODbL-1.0, mantendo a atribuição ao projeto. A licença está em `public/licenses/countries-ODbL-1.0.txt`. A filtragem, a normalização e os ajustes editoriais estão descritos em [sources.md](../specs/001-atlas-interativo/sources.md); estes arquivos derivados permanecem disponíveis no repositório.

Geometrias: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), domínio público. Bandeiras: [Flagpedia](https://flagpedia.net/download), que declara domínio público e origem no Wikimedia Commons.

Hinos: os metadados registram a marcação exibida no Commons, não uma conclusão sobre todas as jurisdições. A revisão da composição, do arranjo e da gravação, o download e a reprodução real ficam em T11. Nenhum hino foi incluído na distribuição da fase 1.

## Verificação e atualização

`npm run check:catalog` confere contagem, IDs, joins, coordenadas, estados de auditoria, hashes dos snapshots, dos arquivos gerados e das 195 bandeiras. Não faz chamadas externas nem substitui revisão geográfica/editorial.

Uma atualização das fontes deve produzir nova captura, comparar o catálogo e as correspondências, registrar alterações editoriais e atualizar os hashes do manifesto intencionalmente. Não substituir os snapshots silenciosamente por uma consulta em tempo de execução.

## Atualização T11/T12

`metadata-review.json` documenta a revisão dos 195 nomes/capitais por ISO, fontes e casos especiais. `cldr-pt-territories.json` é o snapshot do Unicode CLDR em português do Brasil; aviso em `public/licenses/unicode-cldr.txt`. Nomes anteriores permanecem como aliases. `phase-2-flags.json` contém a revisão visual e integridade das 195 bandeiras.

`anthems.json` é a auditoria vigente das 195 entradas: 183 gravações locais e 12 lacunas explícitas. Registra autoria/licença individual, original/derivado oficial, hashes, conversão e estado de cobertura. `anthem-audit.json` preserva a análise inicial de cinco candidatos; seu erro de download não descreve mais o estado atual.

`npm run assets:anthems` confere/restaura arquivos disponíveis a partir das URLs e hashes auditados (requer FFmpeg com libmp3lame; ambiente usado: FFmpeg 6.1.1-3ubuntu5). Não descobre fontes automaticamente nem muda licenças/estados. Interrompe em falha ou limitação da fonte, sem repetir downloads em lote. Diferença de hash exige revisão antes de atualizar a auditoria. `npm run assets:map` gera o runtime e `npm run report:catalog` gera o relatório por país e os créditos distribuídos.

A licença individual dos áudios não é substituída pela licença dos metadados ou do código. As cópias MP3 CC BY-SA mantêm a licença declarada; fontes/licenças estão no cartão e em public/audio/credits.json. Cobertura atual e decisão pendente: specs/001-atlas-interativo/coverage.md.
