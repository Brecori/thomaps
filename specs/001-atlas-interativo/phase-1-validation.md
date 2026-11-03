# Evidências — fases 0 e 1

Data: 2026-11-02. Escopo autorizado: implementar até a fase 1 (T01–T04).

## Entrega

- Especificação consolidada a partir das decisões da conversa: até 5 anos, atlas plano colorido, React/Vite, Tailwind, GSAP, Atomic Design e prioridade mobile/PWA.
- Catálogo inicial de 195 países e snapshot Natural Earth com 242 geometrias. Auditoria e lacunas em [sources.md](sources.md).
- Base React 19, Vite 8, TypeScript 5.9, Tailwind 4 pelo plugin Vite, GSAP e @gsap/react, com versões exatas e lockfile npm. Node mínimo 24; `.nvmrc` incluído.
- Quinze componentes nos cinco níveis Atomic Design, com contratos locais. Fonte Nunito hospedada junto ao app; ícones Lucide; tokens semânticos e layout responsivo.
- Prévia estática do mapa derivada de Natural Earth; abrir/fechar cartão de exemplo e ajuda, edição de campo e aviso explícito para funcionalidades futuras.
- Ajuste à altura visual da janela, painel com rolagem interna e retorno de foco após fechamento. Não registra service worker nem chama APIs de voz/áudio.

## Verificações executadas

Ambiente: Linux, Node 24.16.0, npm 11.13.0, Google Chrome 156.0.8078.79 headless, Playwright 1.64.1.

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` / checagem TypeScript do build | Passou. |
| `npm run lint` | Passou, incluindo as restrições Atomic Design configuradas. |
| `npm run format:check` | Passou. |
| `npm run check:catalog` | 195 IDs únicos, referências para 242 geometrias, coordenadas, cinco bandeiras e candidatos a hino; hashes dos snapshots/bandeiras conferidos. |
| `npm run build` | Build de produção gerado com sucesso. |
| `npm run test:layout` | Seis testes passaram: 360×800, 390×844, 844×390, 768×1024, 1440×900 e cenário de estado/movimento reduzido. |
| Capturas de tela | Inspeção visual em desktop, mobile com/sem cartão e paisagem; corrigidos preenchimento de polígonos na ilustração e scroll do painel. |
| Dependências de produção | Consulta online `npm audit --omit=dev`: zero avisos. Consulta completa: 12 avisos moderados na cadeia de desenvolvimento do lint/minimatch; sem correções forçadas ou overrides principais. |

Os testes conferem ausência de overflow da página, carregamento da imagem, presença de busca, abertura/fechamento de cartão/ajuda, retorno de foco, fechamento com alvo mínimo de 56 px, acesso às ações por scroll no painel baixo, ausência de erros JavaScript, edição/aviso da busca e preservação de estado ao simular orientação.

Contraste calculado para os pares principais de tokens: texto/fundo branco 12,01:1; texto secundário/branco 5,90:1; texto/ação laranja 6,56:1; branco/roxo 5,69:1; texto/ação suave 7,87:1. Todos superam a meta de 4,5:1 nesses pares.

## Limites

Esta é a fundação visual. Não comprova CA02–CA07 ou os fluxos completos de seleção, busca, áudio, offline e instalação. CA01, CA12–CA14 e CA18 foram verificados apenas na parcela aplicável ao layout da fase 1; a validação integral pertence a T14.

Não houve teste em Android/iPhone físico, teclado virtual real, leitor de tela, áreas seguras reais nem uso por criança/responsável. T14 mantém esses cenários abertos. O reconhecimento de ações por uma criança não foi presumido a partir das capturas.

As cinco gravações candidatas tiveram páginas e metadados conferidos, mas o download retornou HTTP 403. Não houve reprodução, avaliação auditiva ou liberação de distribuição. Essa etapa fica em T11; auditoria de T02 concluída com a limitação registrada.

A ilustração simplificada tem aproximadamente 499 KiB sem compressão e não substitui as geometrias originais auditadas. O orçamento definitivo do PWA fica em T16. Esta fase não foi publicada.
