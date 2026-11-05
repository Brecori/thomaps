# Fase 6 — Entrega e verificação final

Data: 2026-11-05. T13, T14 e T15 concluídas no escopo desta entrega. O usuário aceitou o ajuste mobile no Samsung Galaxy S25+/Chrome e pediu o encerramento, revisão de segurança, correções, commits por funcionalidade e push. Destino: **https://thomaps.vercel.app**, Vercel, raiz `/`.

## Resultado técnico

- `npm ci`: instalação reproduzida pelo lockfile, Node 24.16.0 / npm 11.13.0.
- Lint, tipos, formatação e integridade do catálogo aprovados.
- Build de produção e `check:pwa` aprovados: 213 essenciais, 195 bandeiras, nenhum hino no precache; aproximadamente 4,22 MiB de cache e 1,53 MiB gzip com SW, dentro de 6/3 MiB.
- **24/24 testes passaram em 52,5 s** no Chrome de produção local, sob os headers CSP/permissões de produção. Cobrem mapa, mobile, foco, teclado/viewport, áudio MP3 nativo, voz simulada, movimento reduzido, cache/offline, instalação por evento simulado e novas proteções de segurança.
- Auditoria: **0 vulnerabilidades de produção**, 0 moderadas/altas/críticas no conjunto completo; quatro avisos baixos na cadeia de build `deepmerge`, sem patch upstream e sem entrada do visitante na chamada inspecionada. Exceção restrita e guardada por `check:security`; detalhes em [security-review.md](security-review.md).
- Pipeline versionado em `.github/workflows/verify.yml`: permissões somente leitura, ações por SHA e os mesmos checks/build/testes.

## Configuração de publicação

D04 concluída: mídia local sob demanda no mesmo domínio, HTTPS na Vercel, `vercel.json` com framework/build/output, CSP e cabeçalhos de segurança. HTML, SW e manifest revalidam; recursos com hash usam um ano/immutable; dados e bandeiras revalidam. Não há fallback genérico de arquivos ausentes para HTML. HSTS já estava ativo na hospedagem antes desta revisão.

O push para `main` entrega os commits ao remoto configurado. A conferência HTTP do domínio e o smoke pós-publicação devem ser registrados na seção abaixo; uma execução local não substitui a verificação do deploy.

## Publicação e smoke no domínio

A versão de código `7619b4c` foi publicada com sucesso pela Vercel em https://thomaps.vercel.app. O smoke final foi executado em **2026-11-05 às 20:52 UTC**, Chrome 156.0.8078.79, mobile emulado 390×844:

- Pesquisa pela lupa, seleção do Brasil, reprodução MP3 com avanço e pausa, fechamento do cartão.
- Service worker ativo, cache real com os **213 essenciais**; rede desligada no contexto e reabertura com pesquisa do Japão e exibição de Tóquio.
- **Nenhum erro de página e nenhuma violação CSP** durante o fluxo normal. Zod usa modo interpretado sem probes de compilação dinâmica.
- Nove caminhos HTTP conferidos: raiz/index/SW/manifest/JS/dados/bandeira e dois arquivos ausentes. Todos com CSP, nosniff e DENY. Raiz com `max-age=0, must-revalidate`; index/SW/manifest com `no-cache`; JS com hash e `immutable`; dados/bandeiras revalidam. Dados e áudio ausentes retornam **404 text/plain**, sem HTML.
- Manifesto de integridades publicado idêntico ao build local. A verificação online não inclui uma auditoria de disponibilidade ou medição contínua da rede.

Evidências: [smoke de produção](evidence/t15/2026-11-05/production-smoke.json), [headers/cache/404](evidence/t15/2026-11-05/production-headers.json) e [resumo da auditoria](evidence/t15/2026-11-05/security.json). O [primeiro CI remoto](https://github.com/Brecori/thomaps/actions/runs/42106270911) passou; o [CI do ajuste final 7619b4c](https://github.com/Brecori/thomaps/actions/runs/42107047100) também foi aprovado, incluindo a suíte completa.

## Commits por funcionalidade

| Commit | Entrega |
| --- | --- |
| cf63b87 | Câmera, enquadramento, contraste e foco dos marcadores. |
| 692743a | Pesquisa flutuante, backdrop, foco e composição de áudio mobile. |
| 8073565 | Viewport estável, cartão na área visível e regressões mobile. |
| 9db1c96 | Dependências corrigidas e auditoria com exceção restrita. |
| 2467914 | Headers/CSP/cache, URLs HTTPS e testes de segurança. |
| 922657c | CI com permissões mínimas e checks de entrega. |
| 7619b4c | Validador sem compilação dinâmica sob CSP. |

A documentação de encerramento, aceite, evidências e limitações fica em commit próprio, após a conferência do domínio. Os commits de implementação foram enviados a `origin/main`; a publicação ocorre pela integração Git da Vercel.

## Limitações e acompanhamento

O aceite físico disponível é do usuário no **Samsung Galaxy S25+ / Chrome**, para a interface/correção de recorte. Versões do Android/Chrome não foram informadas. Emulação inclui 360×800, 390×844, paisagem, tablet, desktop, teclado e barras do navegador simulados, conforme [histórico T14](phase-6-experience-validation.md).

Não foram executados iPhone/Safari físico, permissão/reconhecimento/síntese nativos de voz, instalação pelo sistema operacional nem observação com criança/responsável. O fechamento técnico da fase não transforma esses itens em testes aprovados. O roteiro físico preservado na T14 continua disponível para acompanhamento. A instalação e o offline do navegador foram automatizados com SW real, sem afirmar instalação no aparelho.

Continuam as 12 indisponibilidades temporárias de hino aceitas na T12. Voz depende do navegador/serviço e hinos exigem rede; o cache pode ser removido pelo sistema. Atualizações permanecem por escolha do responsável, sem recarga forçada. Visitantes com versão antiga em cache precisam aceitar a atualização para receber o documento com a nova política.
