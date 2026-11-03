# Evidências — fase 4, T10/T11

Data: 2026-11-03. A seção inicial preserva a entrega da T10; a atualização T11/T12 está ao final. O player está implementado, com 183 gravações. A T12 está concluída com 12 exceções temporárias aceitas explicitamente pelo usuário em 2026-11-03.

## Entrega

- AudioControls recebe estado/callback e alterna Ouvir nome/Parar nome com ícone, aria-pressed e descrição ligada ao status. CountryDetails mostra preparação, reprodução, erro ou indisponibilidade sem criar a síntese dentro do botão. Mantidos os 19 componentes Atomic Design.
- services/speechSynthesis detecta a API, seleciona exclusivamente voz pt-BR (inclusive identificadores com underscore), prioriza vozes locais e cria utterance com lang pt-BR, velocidade 0,9 e volume normal. Não substitui por pt-PT ou outro idioma quando falta voz adequada.
- usePronunciation acompanha voiceschanged e reconsulta a lista após 3 segundos. Lista inicialmente vazia apresenta carregamento, depois indisponibilidade se continuar sem voz. Uma voz disponibilizada mais tarde reabilita a ação, sem autoplay.
- Uma única utterance permanece referenciada até finalizar ou ser cancelada. Cada nova operação limpa a fila anterior; callbacks obsoletos são invalidados. Início/fim/erro atualizam o estado e permitem tentar novamente. Operação sem conclusão é cancelada após 15 segundos para não deixar a ação presa.
- useAtlasAudio coordena pronúncia e reconhecimento: iniciar escuta cancela síntese; iniciar pronúncia cancela escuta. Seleção, fechamento, ajuda, retorno ao mundo, pagehide, ocultação e desmontagem encerram operações. stopAll é o ponto de integração do player em T11.
- O hino permanece desabilitado; a ajuda explica a necessidade de voz pt-BR e possível dependência de conexão conforme a voz oferecida pelo navegador.

## Verificações

| Verificação | Evidência |
| --- | --- |
| Lint | `npm run lint`, sem erros. |
| Tipos e build | `npm run build`: TypeScript e produção Vite concluídos. |
| Formatação | `npm run format:check`, sem diferenças. |
| Navegador | `npm run test:layout`: nove testes passaram em 15,8 s. Preservados os sete fluxos anteriores e acrescentados dois casos de síntese: pronúncia/interrupção/exclusão com microfone/troca/fechamento e falta de pt-BR/voiceschanged sem autoplay/erro recuperável. |
| Visual | Desktop 1440×900 e celular emulado 390×844: cartão com nome disponível e estado ativo, botão de parar acessível por toque. Capturas revisadas. |
| Sessões antigas | Script temporário simulou callbacks de fim/erro do Brasil após iniciar o Japão: a nova pronúncia continuou ativa. pagehide cancelou a operação nos dois tamanhos. |
| Motor nativo | Chrome headless deste ambiente retornou zero vozes, incluindo zero pt-BR. O cartão mostrou indisponibilidade e manteve as demais funções. |

As APIs de síntese/reconhecimento foram simuladas nos testes de reprodução/coordenação. Não houve validação auditiva nem confirmação de qualidade/precisão da voz em dispositivo físico. O motor nativo foi inspecionado para disponibilidade, sem alegar reprodução real. Os servidores temporários de preview foram encerrados.

## Limites

- CA06 foi exercitado no contrato da API e na interface com simulação; a conferência auditiva, Android/iPhone e uso com responsável/criança permanecem em T14.
- Os limites de 3 e 15 segundos estão implementados; esta entrega verificou eventos de voiceschanged/erro/cancelamento, sem testar exaustivamente temporizadores.
- A disponibilidade da voz depende do aparelho/navegador. Preferir localService não comprova funcionamento offline em todo dispositivo.
- T11/T12 seguem abertos para hinos, formatos, mídia real e cobertura editorial. PWA e polimento adicional não foram declarados concluídos. Não houve alteração de dependências ou publicação.

Referências consultadas: [getVoices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [voiceschanged — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event), [cancel — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel) e [erros de síntese — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error).


## Atualização T11 — player e mídia real

- useAtlasAudio passa a coordenar hino, síntese e microfone. Começar hino cancela fala/escuta; começar fala/escuta pausa hino, sem retomada automática. Seleção, fechamento, ajuda, retorno ao mundo, ocultação/pagehide e desmontagem liberam a fonte. Callbacks de sessões antigas e rejeições de play() antigas são descartados.
- useAnthem mantém um HTMLAudioElement lazy, criado somente por gesto. A primeira seleção não cria elemento nem atribui URL, preload é none e play() ocorre dentro da ação. Estados idle/loading/playing/paused/ended/error, timeout de 20 segundos, erro recuperável e indisponibilidade explícita sem bloquear o cartão.
- Ouvir/Pausar hino, progresso/tempo e Reiniciar; todos os controles principais usam alvos de 56 px. ProgressBar é um novo átomo; MediaCredits é uma molécula secundária com autoria/fonte/licença e aviso de conversão. CountryDetails compõe ambos; 21 componentes Atomic Design, sem player criado nos botões.
- D03/D04: MP3 local no mesmo domínio, 96 kbit/s, estéreo, 44,1 kHz, sem cortes; URLs respeitam BASE_URL. Fontes individuais Commons e licenças/avisos preservados. Arquivos não entram no futuro precache e não são solicitados na abertura. Destino de deploy continua pendente na T15.
- O validador do catálogo é importado em paralelo aos dados, dividindo o bundle inicial. Não há nova dependência de produção ou de testes.

### Verificações desta atualização

| Verificação | Evidência |
| --- | --- |
| Entrega técnica | Lint, tipos/build, format:check e diff --check passaram. Bundle dividido: aplicação 413,56 kB (139,01 kB gzip), validador 93,14 kB (26,87 kB gzip), sem aviso de tamanho do Vite. |
| Integridade | check:catalog verifica 195 IDs/ISOs, capitais/revisões, joins, 195 SVGs, 183 MP3s/hashes/créditos e 12 estados de indisponibilidade. |
| Mídias locais | 183 arquivos decodificados integralmente por FFmpeg 6.1.1, sem erros; formato/duração aferidos por FFprobe. Restauração com assets:anthems conferiu os hashes e não precisou baixar arquivos novamente. |
| Suíte essencial | 12 testes passaram em 22,2 s no build final: preservados os dez anteriores, dois novos para lazy load/reprodução real/pausa/reinício/créditos e falha/recuperação/indisponibilidade. O caso de coordenação existente também cobre mídia real alternando com síntese/microfone simulados. |
| Amostra nativa | Brasil 112,824 s; Japão 58,719 s; Mônaco 77,544 s; Fiji 86,159 s; África do Sul 122,629 s. HTMLAudioElement nativo do Chrome decodificou e avançou o tempo em todos, sem erro de mídia; pausa conferida em cada país. |
| Ciclo de vida | Script temporário conferiu fim nativo, replay, descarte de eventos antigos, liberação ao trocar país e pagehide. Nenhuma retomada automática. |
| Visual | Capturas revisadas em 1440×900 e 390×844, com áudio ativo. Ouvir/Pausar e reinício visíveis no mobile; créditos ficam no scroll secundário do cartão. 195 bandeiras conferidas em quatro folhas de contato. |

Os servidores de preview desta conferência foram encerrados. O servidor de desenvolvimento já existente do usuário foi preservado.

Reprodução nativa/decodificação automática não equivale a escuta humana. A qualidade auditiva das gravações e a experiência em aparelhos físicos continuam na T14. Não foram alegados testes nativos de voz onde o navegador não oferece vozes pt-BR. Espera/timeout e incompatibilidade não receberam uma matriz exaustiva de testes.

## Atualização T12 — cobertura e exceções aceitas

195 países com nomes/capitais revisados, aliases anteriores preservados, notas para capitais/sedes especiais e 195 bandeiras locais conferidas. Metadados e fontes em data-sources/metadata-review.json; auditoria individual e hashes de mídia em data-sources/anthems.json. O manifesto contém hashes dos snapshots/auditorias e dos arquivos gerados.

183 hinos disponíveis, totalizando 177,13 MiB no repositório; cada arquivo só é transferido ao tocar. As outras 12 entradas mantêm todas as funções de país e explicam a indisponibilidade do hino. Fontes históricas, associações erradas e arquivos fair use/domínio público apenas nos EUA não foram usados para preencher lacunas.

O [relatório de cobertura](coverage.md) lista cada país, capital, fonte, bandeira, geometria e estado/licença do hino. A especificação exige decisão explícita para exceções de cobertura. Em 2026-11-03, o usuário respondeu “Aceitar essas 12 exceções temporárias” para a lista exata de países do relatório. A decisão está registrada em coverageDecision de data-sources/anthems.json; T12 foi concluída com 183 gravações e essas 12 exceções, sem alterar o estado real das mídias. PWA, polimento final, teste físico e publicação continuam fora desta entrega.

Referências desta implementação: [HTMLMediaElement.play() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play), [Imageinfo — MediaWiki](https://www.mediawiki.org/wiki/API:Imageinfo), [TimedMediaHandler — MediaWiki](https://www.mediawiki.org/wiki/Extension:TimedMediaHandler) e páginas individuais ligadas no relatório de cobertura.
