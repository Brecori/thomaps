# Thomaps

Aplicação web de página única, instalável como PWA e com prioridade para mobile, para uma criança de até 5 anos explorar países em um mapa-múndi interativo.

## Estado atual

Fases 0 e 1 implementadas: especificação consolidada para esta entrega, auditoria inicial das fontes, base React/Vite/TypeScript, Tailwind, GSAP e layout infantil com Atomic Design.

A prévia mostra uma ilustração estática do mapa, permite abrir/fechar o cartão de exemplo do Brasil e consultar a ajuda. O campo aceita edição e informa que busca e microfone chegam depois. Zoom e áudio estão desabilitados. Seleção geográfica, busca real, reprodução e PWA pertencem às próximas fases.

Decisões confirmadas: React/Vite, Tailwind CSS, GSAP, Atomic Design e PWA; experiência mobile como prioridade; mapa plano em estilo atlas claro, com cores chamativas e interface simples para uma criança de até 5 anos; mapa em tela inteira, scroll para zoom, arraste para mover e pronúncia dos nomes em português do Brasil.

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

Os seis testes Playwright usam o build de produção em cinco tamanhos de tela, incluindo paisagem, e verificam foco, cartão rolável, edição e aviso de busca, rotação simulada e movimento reduzido. Usam Chrome do sistema quando disponível em Linux; em outros ambientes, instale Chromium com `npx playwright install chromium` ou configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Essas verificações não substituem Android/iPhone reais ou teclado virtual real.

`npm run assets:map-preview` regenera a ilustração a partir do snapshot auditado. D3 é dependência de desenvolvimento desse gerador; o motor interativo será implementado em T05.

A consulta online de auditoria apontou 12 avisos moderados na cadeia de desenvolvimento do lint, relacionados a minimatch. `npm audit --omit=dev` retornou zero avisos nas dependências de produção. Não foram aplicados overrides de versões principais nem correções forçadas.

## Documentação

1. [Especificação do produto](specs/001-atlas-interativo/spec.md): escopo, requisitos e critérios de aceite.
2. [Plano técnico](specs/001-atlas-interativo/plan.md): arquitetura proposta, dados, riscos e decisões em aberto.
3. [Tarefas](specs/001-atlas-interativo/tasks.md): sequência de implementação e validação, ligada aos requisitos.
4. [Arquitetura de componentes](specs/001-atlas-interativo/components.md): níveis de Atomic Design, responsabilidades, contratos e estados.
5. [Fontes e auditoria inicial](specs/001-atlas-interativo/sources.md): catálogo de 195 países, amostra e lacunas de mídias.
6. [Verificação da fase 1](specs/001-atlas-interativo/phase-1-validation.md): evidências e limites da entrega.

## Fluxo de trabalho

Refinar a especificação juntos → resolver as decisões que afetam a próxima etapa → executar as tarefas → verificar os critérios de aceite → atualizar os documentos conforme as decisões.

Requisitos usam identificadores `RF`/`RNF`; critérios usam `CA`; tarefas usam `T`. Uma tarefa só é concluída com evidência de sua entrega. Mudanças de comportamento devem aparecer na especificação e nas tarefas correspondentes.
