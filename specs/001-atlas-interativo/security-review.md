# Revisão de segurança para produção

Data: 2026-11-05. Destino: https://thomaps.vercel.app. Revisão do código, dependências, build e configuração HTTP; não é um pentest de infraestrutura ou da conta Vercel/GitHub.

## Superfície examinada

SPA estática React/Vite, sem backend, autenticação, banco de dados, cookies de sessão ou chaves de API necessárias ao cliente. Catálogo, SVG, fontes e MP3 são locais. A busca não envia texto para um backend da aplicação; reconhecimento de voz pode usar o serviço do navegador, apenas após gesto e permissão. Não são guardadas gravações/transcrições pelo app. Permissão nativa e instalação física não foram testadas nesta auditoria.

Foram revisados entrada de dados, renderização, links externos, mídia, APIs de voz, mensagens/cache do service worker, arquivos publicados, padrões de segredos nos arquivos rastreados e dependências npm. Não foram encontrados usos de `dangerouslySetInnerHTML`, `eval`, credenciais no código cliente ou SVG com script/handlers/recursos externos. Isso descreve a inspeção realizada, sem garantir ausência de falhas desconhecidas ou segredos nas contas de hospedagem.

## Achados e tratamento

| Achado | Exposição / decisão | Tratamento |
| --- | --- | --- |
| Sem CSP e proteção contra enquadramento | O GET inicial em produção tinha HTTPS/HSTS, mas não CSP, X-Frame-Options, nosniff ou Permissions-Policy. Faltava defesa contra injeção e clickjacking; não foi encontrado um vetor de XSS no app. | `vercel.json` limita scripts, imagens, fontes, mídia, fetch e workers à origem; bloqueia frames, objetos, base e formulários. `frame-ancestors 'none'` + DENY impedem incorporação. nosniff, política de referência, COOP/CORP e permissões mínimas complementam a configuração. |
| `licenseUrl` aceitava protocolos executáveis | Dados vêm de snapshot local revisado, sem edição pública; defesa insuficiente caso o catálogo fosse alterado. Não foi demonstrado XSS remoto. | Schema Zod aceita somente HTTPS. Dois links HTTP Creative Commons foram normalizados para HTTPS na fonte, regenerando catálogo, créditos e hashes. Caminhos locais de áudio/bandeira e origem Commons já eram restritos. Teste rejeita javascript/data/HTTP, mídia externa e hostname falso. |
| `minimatch` e `glob` vulneráveis nas ferramentas | Auditoria inicial: 15 pacotes afetados (13 moderados e 2 baixos), todos de desenvolvimento. Podiam atingir lint/build em cenários descritos nos avisos. | Overrides limitados às faixas afetadas: minimatch 11.0.4 e glob 14.0.3. Node 24 atende os engines. Lint, build/manifest e testes verificam os consumidores; minimatch 5 fora da faixa não foi substituído. Remover overrides quando as dependências diretas adotarem versões corrigidas. |
| Cache HTTP dependia dos defaults | Dados de URL fixa ou SW antigos podem dificultar atualização consistente. | HTML, SW e manifest revalidam; assets com hash têm cache immutable de um ano; dados/bandeiras revalidam. Sem rewrite genérico de mídia/dados para HTML. Precache mantém SHA-256 e hinos sob demanda. |
| Falta de verificação contínua | Novos alertas ou alterações de headers poderiam passar despercebidos. | CI com permissões somente leitura, ações fixadas por SHA, instalação pelo lockfile, auditoria, lint/tipos/formatação/catálogo/build e suíte Playwright sob CSP. |

A CSP não permite scripts inline nem `unsafe-eval`. Zod usa configuração compartilhada `jitless`, sem tentar compilação dinâmica ou seu probe; isso evita violações capturadas no smoke de produção, mantendo a validação interpretada. A exceção `style-src-attr 'unsafe-inline'` é restrita aos atributos de estilo necessários a React, GSAP e layout SVG; folhas de estilo continuam locais. Microfone é permitido somente à própria origem para manter a busca por voz; câmera, geolocalização, pagamento e USB são desabilitados. Não foi ativado COEP, que acrescentaria restrições sem necessidade atual.

## Exceção residual de build

A auditoria final tem **zero vulnerabilidades nas dependências de produção**, zero moderadas/altas/críticas no conjunto completo e **quatro avisos baixos** propagados pela mesma vulnerabilidade de `deepmerge` 4.3.1, via `@rollup/plugin-node-resolve` → `workbox-build` → `vite-plugin-pwa`. Não há versão corrigida publicada no aviso consultado; o comando automático sugeria regressões grandes de versões.

O consumidor instalado em `@rollup/plugin-node-resolve/dist/es/index.js` chama `deepMerge({}, defaults)` apenas para clonar constantes próprias do plugin. Essa chamada não processa dados do visitante; o pacote não integra o bundle servido ao usuário. Assim, a exceção é documentada como risco residual baixo de ferramenta de build, com revisão necessária se esse uso ou dependência mudar. Não foi aplicado downgrade nem criado fork só para zerar o contador. Builds/CI devem continuar usando código revisado e lockfile.

`npm run check:security` consulta as auditorias de produção e completa, aceita somente esse advisory, severidade baixa e os quatro nomes conhecidos da cadeia. Qualquer novo alerta, mudança de severidade ou vulnerabilidade de produção falha a verificação. Rever/remover a exceção quando upstream corrigir ou retirar `deepmerge`.

## Verificação e limites

A suíte inclui tentativas reais de script inline e fetch externo bloqueadas pela CSP, rejeição de URLs maliciosas e uso normal de mapa/cartão sob os mesmos headers globais da Vercel. Reprodução MP3 e service worker/offline são exercitados pelos demais testes. O preview carrega a política de `vercel.json`; regras de cache por caminho, headers e 404 foram conferidos em nove caminhos do domínio publicado, com resultados no relatório final da fase 6. O smoke final de produção passou com áudio, cache/offline e zero erros de página/violações CSP durante o uso normal.

O SW instala recursos locais com integridade, restringe navegação offline à raiz/index e não guarda áudio/transcrições. A atualização permanece por escolha: visitantes com SW antigo precisam aceitar a nova versão para usar o HTML/cache atual; a política nova não é aplicada retroativamente a documentos já abertos. Os hashes verificam consistência dos recursos, não substituem proteção da conta ou revisão do código.

Não foram inspecionados controles das contas Vercel/GitHub, MFA, regras de branch ou logs privados. Não há endpoints de usuário para avaliar autorização, SQL injection ou CSRF. Recursos futuros de conta, upload ou backend exigem nova análise.

## Referências

- [Configuração de headers na Vercel](https://vercel.com/docs/project-configuration/vercel-json#headers) e [cache HTTP](https://vercel.com/docs/caching/cache-control-headers).
- [CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) e [Permissions-Policy microphone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone).
- [Aviso minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [aviso glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) e [aviso deepmerge sem patch](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
