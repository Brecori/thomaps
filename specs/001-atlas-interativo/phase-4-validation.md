# Evidências — fase 4, T10

Data: 2026-11-03. Escopo autorizado: pronúncia do nome do país e coordenação com a busca por voz. Hinos não foram incluídos nesta entrega.

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
