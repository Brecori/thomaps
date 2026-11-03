# PreviewHelp

Ajuda do atlas, fontes e explicação sobre permissão/processamento remoto de voz e disponibilidade de pronúncia pt-BR, com slot para a escolha acessível de país.

## Contrato

onClose(); children?: ReactNode.

## Estados

Aberta/fechada pela página, conteúdo rolável.

## Responsabilidade e acessibilidade

Recebe foco sem rolar a página; botão para fechar e Escape pelo template. CountryPicker é composto pela página no slot.

## Exemplo

```tsx
<PreviewHelp onClose={closeHelp}>
  <CountryPicker {...pickerProps} />
</PreviewHelp>
```
