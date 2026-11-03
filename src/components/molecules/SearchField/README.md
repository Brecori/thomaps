# SearchField

Campo e microfone, apresentados por CountrySearch.

## Contrato

inputRef, inputProps (valor, IDs, atributos ARIA e eventos), disabled, voiceActive, voiceUnavailable, onVoiceToggle() e onSubmit().

## Estados e responsabilidade

Vazio/preenchido, indisponível durante carregamento, microfone ocioso, escutando/processando e voz sem suporte. Durante a operação, o botão troca o microfone por um X e recebe o nome “Cancelar busca por voz”. O componente recebe estado e callbacks; não consulta o catálogo nem cria captura.

## Acessibilidade

Form com role=search e label associado ao input. CountrySearch fornece a semântica de combobox e coordena o listbox. O botão de voz usa aria-pressed e nome conforme o estado; quando sem suporte, continua acionável para explicar a indisponibilidade.

## Exemplo

```tsx
<SearchField
  inputRef={input}
  inputProps={comboboxProps}
  disabled={!ready}
  voiceActive={voice.active}
  voiceUnavailable={voice.status === 'unavailable'}
  onVoiceToggle={toggleVoice}
  onSubmit={submit}
/>
```
