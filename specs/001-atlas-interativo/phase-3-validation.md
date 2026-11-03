# Evidências — fase 3, T08–T09

Data: 2026-11-03. Escopo autorizado: remover o cartão “pequeno explorador” e implementar a fase de busca.

## Entrega

- Removidos o cartão inicial, o botão de exemplo, o slot de introdução, sua medição e seus estilos responsivos. A navegação mobile foi reposicionada, inclusive em viewport compacta, para aproveitar o espaço livre.
- **T08:** busca local nos nomes/aliases, ignorando caixa, acentos e pontuação e preservando alfabetos não latinos. Correspondências exatas precedem prefixos e trechos. CountrySearch compõe SearchField e CountryOption, mostrando até três sugestões com bandeiras e acesso aos demais resultados por Anteriores/Próximos.
- Combobox/listbox com setas, Enter, Escape, estado sem resultados, anúncios persistentes e retorno de foco. Ao chegar à última página, os controles mantêm o foco e impedem a ação indisponível com aria-disabled/guardas. Seleção por busca, mapa e ajuda compartilha o cartão e o controlador de enquadramento.
- **T09:** detecção de SpeechRecognition/webkitSpeechRecognition em contexto seguro; sessão pt-BR por ação explícita, sem captura contínua ou reinício automático. Estados de preparação, escuta, processamento, transcrição, erro e ausência de suporte. Resultado é apresentado para escolha, sem selecionar automaticamente.
- Captura encerra após resultado, falha, cancelamento, 20 segundos sem conclusão, seleção, digitação, ajuda, fechamento do cartão, retorno à visão inicial, pagehide/segundo plano ou desmontagem. Callbacks de sessões antigas são ignorados. Não há persistência de áudio ou transcrição no atlas. Ajuda e feedback explicam que o navegador pode usar um serviço online.
- Atomic Design preservado: 19 componentes, com contratos locais. Domínio filtra/ordena; serviços encapsulam a API de voz; hooks coordenam busca/captura; a página integra seleção, cancelamento e foco.

## Verificações

Ambiente: Linux, Node 24, Chrome headless do sistema e Playwright.

| Verificação | Resultado |
| --- | --- |
| Lint | `npm run lint`, sem erros. |
| Tipos e produção | `npm run build`, TypeScript e Vite concluídos. |
| Formatação | `npm run format:check`, sem diferenças. |
| Integridade | `npm run check:catalog`: 195 países, 242 geometrias e 195 bandeiras locais íntegros. |
| Busca no catálogo | Conferência pontual por script: 195 nomes retornaram o país correto como primeiro resultado; todos os 992 aliases encontraram o país correspondente, incluindo alfabetos não latinos. Não foi criada uma suíte adicional para repetir esse cálculo. |
| Navegador | `npm run test:layout`: sete testes passaram, em 15,3 s. Seleção/fechamento, zoom, recuperação de erro, texto/alias/teclado/paginação, voz simulada com erro/cancelamento/transcrição, alternativa sem voz e toque no celular. |
| Visual | Capturas revisadas de desktop 1440×900 e celular emulado 390×844: mapa sem cartão inicial, sugestões, paginação até a última página e seleção. Viewport 390×400 conferida como aproximação de teclado aberto, com rolagem própria das sugestões. |
| Voz simulada adicional | Prefixo webkit, idioma pt-BR, silêncio, erro de rede, microfone ausente, resultado tardio após cancelamento e pagehide conferidos por script temporário. |

Mantida uma única suíte simples, sem testes matemáticos de projeção, helpers de coordenadas ou matriz exaustiva. Os servidores temporários de preview foram encerrados.

## Limites e próximos passos

- O reconhecimento real da fala e o diálogo nativo de permissão não foram exercitados com microfone físico. A API foi simulada para validar o comportamento da aplicação; isso não comprova precisão de transcrição, disponibilidade do serviço remoto nem compatibilidade em Android/iPhone reais.
- O limite de 20 segundos está implementado; a verificação de voz desta entrega usou eventos simulados, sem esperar uma captura real expirar.
- T14 mantém a conferência em aparelhos físicos, teclado virtual real, leitor de tela e uso com responsável/criança. A emulação de altura reduzida não substitui teclado real.
- T10/T11 continuam responsáveis por pronúncia, hinos e exclusão entre reprodução e escuta. Os controles de áudio permanecem desabilitados nesta fase.
- T12 e T16/T17 continuam abertas. Não houve instalação PWA, preparação offline, publicação ou alteração de dependências.

Referências técnicas consultadas: [SpeechRecognition — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [erros de reconhecimento — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionErrorEvent/error) e [combobox — W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
