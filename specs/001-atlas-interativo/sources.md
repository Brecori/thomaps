# Fontes e auditoria inicial — T02

Revisão: 2026-11-02. Auditoria documental e de dados concluída para a fase 0; disponibilidade de reprodução dos hinos permanece pendente em T11.

## Escopo inicial do catálogo

195 entradas selecionáveis: os 193 registros com `unMember=true` no snapshot de mledoze/countries, mais Palestina (`PSE`) e Vaticano/Santa Sé (`VAT`). Territórios dependentes e outras entidades não entram como seleções na primeira versão. A lista explícita está em [catalog.json](../../data-sources/catalog.json).

As geometrias do Natural Earth incluem outras entidades e a Antártida. A inclusão visual de uma geometria não a transforma em entrada selecionável. T05 deverá marcar essas geometrias como contexto e não devolver dados de um país incorreto ao tocá-las.

As fronteiras seguem a representação de facto da fonte Natural Earth. Não unir regiões pelo nome ou pela soberania, nem alterar a lista de países para acompanhar diferenças de geometria. Divergências ficam registradas no mapeamento por identificadores.

## Fontes escolhidas

| Recurso | Fonte e captura | Tratamento |
| --- | --- | --- |
| Geometrias | [Natural Earth, Admin 0 Countries, 1:50m](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson) | Snapshot com 242 geometrias, reduzido a propriedades relevantes; coordenadas preservadas. SHA-256 no manifesto. Domínio público. |
| Metadados | [mledoze/countries](https://github.com/mledoze/countries) | Snapshot local, filtrado a 195 entradas. Nomes portugueses são uma base a revisar em pt-BR; capitais e nomes da amostra foram ajustados editorialmente. ODbL-1.0, licença preservada e atribuição documentada. |
| Bandeiras | [Flagpedia / FlagCDN](https://flagpedia.net/download) | Cinco SVGs locais verificados; associação por ISO alpha-2. A fonte declara domínio público. Demais bandeiras ficam para T12. |
| Hinos | [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Audio_files_of_national_anthems) | Cinco candidatos documentados abaixo. Verificar gravações individualmente, sem inferir licença pela categoria. |

A consulta REST Countries v3.1 retornou HTTP 403 neste ambiente; nenhuma dependência dessa API foi adicionada. Os snapshots efetivamente obtidos e seus hashes são registrados em [manifest.json](../../data-sources/manifest.json).

## Amostra auditada

| País | Metadados revisados | Bandeira e geometria | Hino candidato |
| --- | --- | --- | --- |
| Brasil — BRA | Brasil; Brasília | `br.svg`; geometria BRA | [Hino Nacional Brasileiro instrumental](https://commons.wikimedia.org/wiki/File:Hino_Nacional_Brasileiro_instrumental.ogg), U.S. Navy Band, Ogg Vorbis, aproximadamente 1min53s conforme a página. |
| Japão — JPN | Japão; Tóquio | `jp.svg`; geometria JPN, arquipélago | [Kimi ga Yo instrumental](https://commons.wikimedia.org/wiki/File:Kimi_ga_Yo_instrumental.ogg), U.S. Navy Ceremonial Band, Ogg Vorbis, aproximadamente 59s conforme a página. |
| África do Sul — ZAF | Pretória, Bloemfontein e Cidade do Cabo; funções administrativa, judicial e legislativa | `za.svg`; geometria ZAF | [South African national anthem](https://commons.wikimedia.org/wiki/File:South_African_national_anthem.oga), U.S. Navy Band, Ogg Vorbis, aproximadamente 2min03s conforme a página. Preservar notas sobre composição/arranjo na revisão de distribuição. |
| Mônaco — MCO | Mônaco; Mônaco | `mc.svg`; geometria MCO; microestado exige busca/zoom para acesso confortável | [Monaco National Anthem](https://commons.wikimedia.org/wiki/File:Monaco_National_Anthem.ogg), U.S. Navy Band, Ogg Vorbis, aproximadamente 1min18s conforme a página. |
| Fiji — FJI | Fiji; Suva | `fj.svg`; geometria FJI, ilhas nos dois lados do antimeridiano | [Fiji National Anthem](https://commons.wikimedia.org/wiki/File:Fiji_National_Anthem.ogg), U.S. Navy Band, Ogg Vorbis, aproximadamente 1min26s conforme a página. |

As cinco páginas apresentam marcações de domínio público com condições e notas próprias. As tentativas de obter os binários retornaram HTTP 403: não houve decodificação, avaliação auditiva ou teste de reprodução. Essa limitação está registrada por candidato em [anthem-audit.json](../../data-sources/anthem-audit.json). O catálogo mantém `anthemAuditStatus=pending`; nenhum candidato é anunciado como mídia pronta.

## Correspondências e ajustes

- O join testa ISO alpha-3 da fonte e mantém `ADM0_A3` como ID da geometria, com correspondências explícitas em cada país. Palestina é `PSE` no catálogo e `PSX` no Natural Earth; não pressupor igualdade entre esses códigos.
- Nomes localizados na amostra: Mônaco, Japão e Vaticano; Tóquio e as três capitais da África do Sul receberam grafias em português. Os aliases da fonte foram preservados.
- Palestina mantém Ramallah como sede administrativa no snapshot, com nota explícita para revisar a apresentação da reivindicação de Jerusalém Oriental no catálogo final. Não apresentar essa entrada como uma questão resolvida pelo campo `capital` do fornecedor.
- Geometria presente não comprova hit area adequada: microestados, territórios descontínuos e o antimeridiano exigem validação no motor de mapa em T05–T07.

## Cobertura e próxima etapa

Cobertura técnica inicial: 195/195 entradas com nome-base, capital, ponto de foco e join; 5/195 bandeiras locais; 5/195 candidatos a hino com revisão documental; 0/195 hinos liberados e testados para reprodução. A revisão editorial completa das 195 entradas e a expansão de bandeiras/hinos pertencem a T12.

T11 deverá obter as gravações, preservar créditos e notas, resolver as condições de distribuição, escolher formatos compatíveis com Android/iPhone e verificar áudio real. Não prometer cobertura mundial dos hinos a partir desta amostra. D02 fica definido para o catálogo inicial; D03 fica encaminhado com candidatos e lacunas explícitas.

## Atualização da fase 2 — T05–T07

Os 195 SVGs de bandeiras foram preparados localmente para os cartões; origem e hashes estão em data-sources/phase-2-flags.json. A checagem técnica não equivale à revisão editorial completa de T12. Os cinco hinos continuam somente como candidatos.

Foi corrigida a correspondência da Austrália para AUS. O join inicial também incluía IOA e ATC pelo campo ISO alternativo da fonte; essas geometrias pertencem ao contexto de territórios dependentes e não devem selecionar a Austrália. O manifesto registra o novo hash do catálogo derivado, sem mudar o hash da captura original.

O runtime usa 242 geometrias, sendo 195 selecionáveis e 47 de contexto. TopoJSON mantém os contornos e as ilhas com arcos compartilhados e quantização, sem simplificação que remova pequenos países. Marcadores e a lista nativa da ajuda oferecem alternativa aos polígonos pequenos. Ramallah é apresentada como sede administrativa no cartão de Palestina; notas internas de revisão do fornecedor não são exibidas.
