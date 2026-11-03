# AudioControls

Molécula de ações de pronúncia e hino no cartão. Usa Button, Icon e ProgressBar; não cria síntese, captura ou player.

## Contrato

Recebe `pronunciationActive`, `pronunciationAvailable`, `descriptionId`, `onPronunciationToggle`; `anthemAvailable`, `anthemActive`, `anthemStarted`, `currentTime`, `duration`, `onAnthemToggle` e `onAnthemRestart`.

## Estados e acessibilidade

Ouvir nome/Parar nome; Ouvir hino/Pausar hino; progresso e reinício depois da primeira solicitação. Carregamento permite pausar a intenção de reprodução; erro permite tentar de novo. Indisponibilidade desabilita só a ação correspondente, com explicação no cartão.

Grupo “Sons do país”, rótulos curtos, ícones decorativos, área de toque de pelo menos 56 px e progresso nativo com tempo acessível. A coordenação entre fala, escuta e mídia pertence a useAtlasAudio na página.

Exemplo: CountryDetails passa o estado do coordenador e callbacks que encaminham a gravação do país selecionado.
