# AudioControls

Ações de pronúncia e hino apresentadas no cartão.

## Contrato

pronunciationActive, pronunciationAvailable, descriptionId e onPronunciationToggle(). O callback inicia ou interrompe a pronúncia na página; o componente não cria utterance nem captura.

## Estados e variantes

Ouvir nome quando ocioso; Parar nome com ícone de X e aria-pressed durante preparação/reprodução. Sem voz adequada ou durante carregamento, a ação fica disabled e a nota do cartão explica o estado. Ouvir hino permanece disabled até T11.

## Exemplo

```tsx
<AudioControls
  pronunciationActive={pronunciation.active}
  pronunciationAvailable={pronunciation.available}
  descriptionId={noteId}
  onPronunciationToggle={togglePronunciation}
/>
```

## Acessibilidade e responsabilidade

Grupo Sons do país, rótulos curtos e ícones decorativos. A descrição do nome aponta para o status do cartão. Estados recebidos por props; coordenação entre fala/escuta fica em useAtlasAudio, composto pela página.
