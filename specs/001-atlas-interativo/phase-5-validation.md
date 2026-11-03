# Evidências — fase 5, T16/T17

Data: 2026-11-03. Escopo: configuração PWA, instalação/orientações, mapa offline e atualização por escolha. T16/T17 implementadas; instalação/uso em aparelhos físicos permanecem na T14 e publicação HTTPS na T15. Nenhum deploy ou commit foi feito nesta tarefa.

## Entrega

- VitePWA 2.0.0/Workbox 7.4.1, estratégia injectManifest e registro manual somente no build em contexto seguro. Desenvolvimento não registra SW. Manifest pt-BR com ID/escopo/start_url relativos, standalone e sem trava de orientação; ícones 192/512, maskable opaco dentro da área segura e Apple touch 180 derivados do favicon SVG com Sharp 0.35.5.
- AppOptions e ConnectionStatus acrescentam duas composições Atomic Design, total de 23 componentes. A página compõe AppOptions na ajuda; APIs de SW/instalação ficam em pwa/ e usePwa. Text aceita h3 para hierarquia da ajuda. Nenhuma nova barra permanente no mapa; ajuda tem fechamento sticky, inclusive após rolar até as opções.
- Instalar só chama prompt por clique. Evento ausente mantém instruções Android/iPhone e uso no navegador; modo standalone/iOS e appinstalled ocultam a ação redundante. O evento de instalação foi simulado no teste, sem afirmar instalação nativa real.
- Cache por escopo e versão, com HTML, código, WOFF2, ícones, catálogo/mapa, licenças e 195 bandeiras; hinos e dados de captura ficam fora. Fallback de navegação só na raiz/index, sem HTML para pedidos de mídia/dados. Subdiretório /atlas/ também validado.
- Cada essencial tem revisão e integridade SHA-256/SRI. CHECK_OFFLINE confere todas as chaves reais; perda parcial/total não anuncia prontidão. Reparo baixa apenas ausentes e verifica integridade, impedindo preencher cache antigo com dados novos incompatíveis. Falha de quota/rede tem mensagem e nova tentativa. Conferência ocorre na ajuda, retorno, mudança de rede e a cada minuto visível.
- Atualização permanece waiting, sem recarga durante exploração. Agora não preserva a sessão; aplicar fica desabilitado em voz/áudio/gesto, coordena stopAll e recarrega só a janela solicitante em controllerchange. Se outra janela do escopo estiver aberta, pede fechá-la antes de ativar. Ativação limpa apenas caches antigos deste app/escopo. Primeira instalação não recarrega a página.

## Orçamento D07

| Medida | Limite | Observado |
| --- | --- | --- |
| Essenciais por versão | 6 MiB em CacheStorage (conteúdo) | 4,414,095 bytes, 4.21 MiB, 213 URLs distintas |
| Transferência com gzip, incluindo SW | 3 MiB | 1,598,283 bytes, 1.52 MiB |
| SW final | Incluído no limite de transferência | 46,261 bytes; 20,169 bytes gzip |
| Maior arquivo essencial | 2 MiB | 755,610 bytes |
| Pico durante atualização | Planejado: 16 MiB para duas versões/overhead | Dois caches coexistiram antes da escolha; após aplicar restou apenas o atual. Não é medição de aparelho físico. |
| Preparo inicial em 1,5 Mbps / 150 ms | Meta de até 60 s nesse perfil | 46.471 s |

O build bloqueia extrapolação de conteúdo/transferência e audita ícones, integridade, cobertura e exclusão de áudio em check:pwa. Dist/pwa-audit.json guarda a medição atual reproduzível. O SW usa CacheStorage e o navegador guarda também o próprio SW; StorageManager.estimate em um contexto de teste informou 4.563.515 bytes no total (4.517.254 de cache e 46.261 de registro SW). Isso é uma observação do ambiente, não garantia permanente de espaço disponível.

A transferência gzip é estimativa pela soma de arquivos comprimidos mais SW, sem cabeçalhos. Exige compressão no servidor. Na rede lenta, o servidor de QA comprimiu respostas e limitou banda global a 187.500 bytes/s, com atraso de 150 ms. Não foi confundida emulação com uso em rede móvel/aparelho real.

Referências planejadas para T14: Samsung Galaxy A54/Chrome e iPhone 12/Safari, ou equivalentes intermediários registrados no roteiro final. Não estão disponíveis neste ambiente; instalação, aparência do ícone no sistema, fluidez real, voz offline e retorno do segundo plano ainda precisam de conferência física.

## Verificações

| Verificação | Evidência |
| --- | --- |
| Suíte existente + PWA | 14 testes passaram em 28,7 s. Dois novos casos: SW real/preparo completo/perda parcial/reparo/reabertura offline/bandeira antes não visitada/hino sem rede/fallback de dados; e instalação por escolha com evento simulado/adiamento/reconhecimento de conclusão. |
| Isolamento da suíte | Casos antigos bloqueiam SW para preservar os mocks de rede; os dois PWA habilitam SW real. Não foi criada matriz exaustiva por navegador. |
| Cache ausente | CacheStorage do app inteiro foi removido com a página aberta: prontidão passou a incompleta e o reparo restabeleceu todos os essenciais. |
| Quota | Cache.put no SW real foi temporariamente configurado para lançar QuotaExceededError. A ajuda mostrou falta de espaço, não declarou pronta; restaurar escrita e tentar de novo recuperou o conjunto. Trata-se de simulação de falha, sem preencher o disco do aparelho. |
| Duas versões | Dois builds reais A/B com conteúdo HTML distinto, servidos pela mesma origem. A continuou aberta e reproduzindo o hino após B ficar waiting; Agora não preservou seleção; aplicar em duas janelas foi adiado; após fechar a outra, uma recarga levou a B, removeu cache A e reabriu B offline com busca/seleção. Nenhum pageerror. O ciclo A/B e subdiretório foi repetido após o ajuste final de consentimento de recarga, também sem erros. |
| Escopo | Build adicional com base /atlas/: manifest/worker/arquivos sob o prefixo, preparação completa e reabertura offline com Fiji/Suva. |
| UI mobile | Captura em 390×844 revisada; ajuda rolável, opções acessíveis e fechar ainda visível. Orientação para iPhone foi exercitada com user agent emulado em Chrome; isso não substitui Safari nativo. |
| Segurança das dependências | npm audit --omit=dev: zero alertas. Tooling: 21 alertas (2 baixos, 19 moderados), sem altos após atualizar Sharp. Sem overrides principais/force. |

Build/tipos, lint, format:check, integridade de catálogo e diff --check conferidos ao encerrar. O plugin emite aviso de obsolescência de inlineDynamicImports na compilação interna do SW; build e verificações passam. Servidores temporários encerrados; servidor de desenvolvimento do usuário preservado.

## Roteiro físico restante (T14/T15)

1. Publicar o build em HTTPS com revalidação de HTML/sw.js, compressão e 404 reais para dados/mídia ausentes. Não usar servidor de desenvolvimento ou HTTP pelo IP do computador para concluir teste de instalação.
2. Android: abrir ajuda, instalar se o navegador permitir ou usar o menu; iPhone: seguir Compartilhar/Adicionar à Tela de Início pelo Safari. Conferir nome/ícone/mode standalone.
3. Esperar prontidão, fechar app, desligar rede e abrir pela tela inicial. Conferir mapa, país, bandeira/capital, busca escrita, orientação/teclado e retomada; observar voz local sem prometer suporte universal.
4. Publicar outra versão, observar que a sessão não recarrega/para áudio por conta própria; adiar, depois aplicar quando seguro. Registrar modelo, sistema/navegador, rede, fluidez e limitações.

Referências: [Vite PWA injectManifest](https://vite-pwa-org.netlify.app/guide/inject-manifest), [atualização por confirmação](https://vite-pwa-org.netlify.app/guide/prompt-for-update), [Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching), [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) e [StorageManager.estimate](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate). As declarações locais da versão instalada foram consultadas para compatibilidade com Vite 8 e integridade dos recursos.
