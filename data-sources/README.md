# Snapshot do catálogo — fase 0

Data de revisão: 2026-11-02. Estes arquivos são insumos de auditoria, não o catálogo final integrado ao mapa.

- `catalog.json`: lista explícita de 195 países, filtrada por `unMember` mais `PSE`/`VAT` no snapshot de mledoze/countries. Nomes, aliases, capitais, coordenadas e correspondências com a geometria. A revisão editorial completa fica em T12; cinco entradas foram revisadas nesta fase.
- `natural-earth-50m.geojson`: 242 geometrias do Natural Earth 1:50m; propriedades reduzidas e coordenadas preservadas. Todos os 195 países do catálogo têm referência a uma geometria. Isso não comprova precisão, tamanho de alvo ou enquadramento, tratados em T05–T07.
- `manifest.json`: origem, licença declarada, data e SHA-256 do original e do snapshot transformado. A data representa a captura, não a data de atualização de cada informação no fornecedor.
- `flag-audit.json`: origem, licença declarada, tamanho e hash das cinco bandeiras baixadas em `public/flags/`.
- `anthem-audit.json`: cinco gravações candidatas, descrição da fonte, formato/tamanho/duração informados nas páginas e resultado da tentativa de download. HTTP 403 impediu inspecionar os binários; não se trata de verificação de reprodução.

## Licenças e atribuição

O catálogo derivado de [mledoze/countries](https://github.com/mledoze/countries) é disponibilizado sob ODbL-1.0, mantendo a atribuição ao projeto. A licença está em `public/licenses/countries-ODbL-1.0.txt`. A filtragem, a normalização e os ajustes editoriais estão descritos em [sources.md](../specs/001-atlas-interativo/sources.md); estes arquivos derivados permanecem disponíveis no repositório.

Geometrias: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), domínio público. Bandeiras: [Flagpedia](https://flagpedia.net/download), que declara domínio público e origem no Wikimedia Commons.

Hinos: os metadados registram a marcação exibida no Commons, não uma conclusão sobre todas as jurisdições. A revisão da composição, do arranjo e da gravação, o download e a reprodução real ficam em T11. Nenhum hino foi incluído na distribuição da fase 1.

## Verificação e atualização

`npm run check:catalog` confere contagem, IDs, joins, coordenadas, estados de auditoria e hashes dos snapshots e bandeiras. Não faz chamadas externas nem substitui revisão geográfica/editorial.

Uma atualização das fontes deve produzir nova captura, comparar o catálogo e as correspondências, registrar alterações editoriais e atualizar os hashes do manifesto intencionalmente. Não substituir os snapshots silenciosamente por uma consulta em tempo de execução.
