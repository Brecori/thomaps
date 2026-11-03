# Thomaps

Aplicação web de página única, com PWA previsto e prioridade para mobile, para uma criança de até 5 anos explorar países em um mapa-múndi interativo.

## Estado atual

Fases 0 a 3 e T10/T11 da fase 4 implementadas: especificação, auditoria inicial, base React/Vite/TypeScript, Tailwind, GSAP, Atomic Design, mapa interativo com seleção de países e busca por texto/voz. O cartão inicial “pequeno explorador” foi removido para liberar o mapa.

O mapa é retangular e fixo, com projeção equiretangular. O zoom mínimo é calculado pelo tamanho da tela para o mapa sempre preenchê-la, e o arraste para nas bordas. No celular em pé, arraste para explorar as regiões fora da tela. O atlas permite selecionar os 195 países por clique/toque, navegar com scroll, pinça, arraste e botões, destacar e enquadrar o país e abrir seu cartão com bandeira e capital/capitais. A ajuda oferece uma lista nativa para escolher pelo nome ou teclado; pequenos países também têm marcadores. Nomes em caixa alta, cinza médio e sem contorno aparecem no interior do território principal quando cabem, em até duas linhas e com fonte aparente de 10–18 px conforme o zoom; rótulos sem espaço suficiente ficam ocultos. Fechar o cartão, clicar no oceano/fundo sem país selecionável ou usar “Ver o mundo” limpa a seleção e restaura a visão inicial no zoom mínimo. Arraste e zoom preservam a seleção; clicar em outro país troca o cartão.

Mapa, catálogo e 195 bandeiras são locais. Carregamento e falhas de dados têm feedback e nova tentativa. A busca no topo ignora acentos/maiúsculas, aceita aliases e mostra até três sugestões com bandeiras, paginação e teclado. O microfone transcreve em pt-BR quando há suporte, sem selecionar automaticamente; silêncio, falhas, cancelamento e indisponibilidade preservam a digitação. O cartão permite ouvir/parar o nome com uma voz pt-BR do navegador, priorizando voz local. O hino, a pronúncia e o microfone se interrompem mutuamente. Carregamento e ausência de voz adequada têm feedback; não há reprodução automática. O hino tem ouvir/pausar, reinício, andamento e créditos, com carregamento só ao tocar e nova tentativa após erro. A revisão da T12 cobre os 195 países e 183 hinos locais; 12 lacunas aguardam uma fonte reutilizável ou decisão explícita de escopo. O PWA permanece nas próximas tarefas.

Decisões confirmadas: React/Vite, Tailwind CSS, GSAP, Atomic Design e PWA; experiência mobile como prioridade; mapa plano em estilo atlas claro, com países em cores pastel mais definidas por continente, seleção em cor chamativa e interface simples para uma criança de até 5 anos; mapa em tela inteira, scroll para zoom, arraste para mover e pronúncia dos nomes em português do Brasil.

Proposta offline para a fase PWA: mapa, catálogo, bandeiras e busca por texto disponíveis após preparação do cache. Hinos dependem de conexão na primeira versão; voz depende das capacidades do dispositivo/navegador. Ainda não há service worker, instalação ou garantia offline nesta entrega.

## Executar localmente

Requer Node.js 24 ou superior e npm. Ambiente verificado: Node 24.16.0 e npm 11.13.0. `.nvmrc` seleciona a linha 24.

```bash
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. Para conferir o build:

```bash
npm run build
npm run preview
```

## Verificar

```bash
npm run lint
npm run typecheck
npm run format:check
npm run check:catalog
npm run build
npm run test:layout
```

A suíte tem 12 testes simples de navegador, em três arquivos: seleção/fechamento, clique no oceano para limpar seleção, zoom/retorno, recuperação de erro, busca por texto/alias/teclado e paginação, voz simulada com erro/cancelamento/transcrição, alternativa sem suporte de voz, seleção por toque no celular, pronúncia/cancelamento/exclusão com o microfone e ausência/carregamento tardio de pt-BR, hino real com pausa/reinício/créditos, erro recuperável e indisponibilidade. Usa seletores acessíveis, sem verificar detalhes internos do SVG ou cálculos geográficos. Gestos, hover, enquadramento e ajustes visuais ficam para conferência manual.

O Playwright usa o build de produção e Chrome do sistema quando disponível em Linux. Em outros ambientes, instale Chromium com `npx playwright install chromium` ou configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. O caso mobile é emulado. Reconhecimento e síntese são simulados na suíte para conferir a integração; o MP3 do hino usa reprodução nativa real, com avanço de tempo verificado. O Chrome headless deste ambiente não ofereceu vozes nativas; validação auditiva, reconhecimento real, permissão nativa e uso em aparelho físico continuam na T14.

`npm run assets:map` gera `public/data/countries.json`, `world.topo.json` e o manifesto de hashes a partir dos snapshots auditados. Os contornos usam TopoJSON com arcos compartilhados e quantização; não são removidas ilhas ou geometrias. O mapa usa SVG/D3 e um único controlador para gestos, comandos e enquadramento com GSAP. Movimento reduzido aplica a câmera imediatamente.

A instalação manteve os 12 avisos moderados conhecidos na cadeia de desenvolvimento do lint/minimatch. `npm audit --omit=dev` foi executado na fase 2 e retornou zero avisos nas dependências de produção. Não foram aplicados overrides de versões principais nem correções forçadas.

## Dados e gravações

Os 195 nomes/capitais foram revisados em português do Brasil, com fontes e casos especiais registrados. Os nomes anteriores continuam como aliases da busca. Bandeiras usam SVG local por ISO; o mapa mantém os joins por ID.

Há 183 gravações em `public/audio/anthems` (177,13 MiB no total), solicitadas individualmente ao tocar. São MP3 a 96 kbit/s, 44,1 kHz, estéreo, sem cortes. Créditos e licença por arquivo ficam no cartão e em `public/audio/credits.json`; arquivos CC BY-SA mantêm a licença indicada. Não existe licença global de domínio público para todos os hinos. Nenhuma gravação entra no futuro precache.

As 12 lacunas e as fontes por país estão no [relatório de cobertura](specs/001-atlas-interativo/coverage.md). A T12 aguarda resolução das fontes ou aceitação explícita dessas exceções; a T11 está implementada e verificada na amostra. A indisponibilidade do hino preserva mapa, bandeira, capital e pronúncia.

`npm run report:catalog` atualiza o relatório e os créditos. `npm run assets:anthems` verifica/restaura os arquivos auditados (requer FFmpeg/libmp3lame), sem buscar fontes novas nem trocar licenças automaticamente. Hash alterado ou limitação da fonte interrompe a restauração para revisão. A proveniência fica em `data-sources/anthems.json`; o manifesto registra os hashes das auditorias e do catálogo.

## Documentação

1. [Especificação do produto](specs/001-atlas-interativo/spec.md): escopo, requisitos e critérios de aceite.
2. [Plano técnico](specs/001-atlas-interativo/plan.md): arquitetura proposta, dados, riscos e decisões em aberto.
3. [Tarefas](specs/001-atlas-interativo/tasks.md): sequência de implementação e validação, ligada aos requisitos.
4. [Arquitetura de componentes](specs/001-atlas-interativo/components.md): níveis de Atomic Design, responsabilidades, contratos e estados.
5. [Fontes e auditoria inicial](specs/001-atlas-interativo/sources.md): catálogo de 195 países, amostra e lacunas de mídias.
6. [Verificação da fase 1](specs/001-atlas-interativo/phase-1-validation.md): evidências e limites da entrega.
7. [Verificação da fase 2](specs/001-atlas-interativo/phase-2-validation.md): mapa, gestos, seleção, enquadramento e limitações.
8. [Verificação da fase 3](specs/001-atlas-interativo/phase-3-validation.md): busca textual, voz, acessibilidade e limitações.
9. [Verificação da fase 4 — T10/T11](specs/001-atlas-interativo/phase-4-validation.md): pronúncia, player real, coordenação com microfone e limites da validação.

## Fluxo de trabalho

Refinar a especificação juntos → resolver as decisões que afetam a próxima etapa → executar as tarefas → verificar os critérios de aceite → atualizar os documentos conforme as decisões.

Requisitos usam identificadores `RF`/`RNF`; critérios usam `CA`; tarefas usam `T`. Uma tarefa só é concluída com evidência de sua entrega. Mudanças de comportamento devem aparecer na especificação e nas tarefas correspondentes.
