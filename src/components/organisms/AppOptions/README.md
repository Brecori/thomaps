# AppOptions

Organismo secundário para o responsável, composto pela página dentro do slot da ajuda. Usa Text, Button e ConnectionStatus, sem importar outro organismo ou chamar APIs diretamente.

Recebe `pwa` (estado/callbacks de usePwa), `busy`, `onApplyUpdate` e `onDeferUpdate`. Mostra instalação por gesto quando há evento, instruções por plataforma quando não há prompt, estado instalado, prontidão/reparo offline e verificar/aplicar/adiar atualização. Erros mantêm ações de recuperação. Uso no navegador continua disponível.

Área de toque de 56 px, h3 sob o h2 da ajuda, status anunciados e botões com nome explícito. Aplicação de versão fica desabilitada durante áudio/escuta/gesto ou ativação; “Agora não” fecha a ajuda preservando a seleção e a versão corrente. O fechamento da ajuda permanece sticky no scroll.

Exemplo: `<AppOptions pwa={pwa} busy={audioActive} onApplyUpdate={apply} onDeferUpdate={closeHelp} />`.
