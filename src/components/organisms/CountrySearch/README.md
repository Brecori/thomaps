# CountrySearch

Busca por texto e voz, composta de SearchField e CountryOption. A página fornece estado e callbacks; o organismo não cria uma sessão de voz por botão.

## Contrato

search: retorno de useCountrySearch; voice: retorno de useVoiceSearch; inputRef; disabled; onSelect(id, origin); onClose opcional para a caixa mobile.

## Estados e responsabilidade

Consulta vazia, sugestões abertas/fechadas, sem resultados, página de até três sugestões, escuta, processamento, erro e indisponibilidade. A transcrição alimenta a mesma consulta; a escolha passa pelo fluxo único de seleção da página. O popup permite rolagem própria em telas pequenas, sem capturar o zoom do SVG.

## Acessibilidade

Combobox/listbox com IDs locais, label, anúncio persistente de estados, aria-activedescendant, setas, Enter e Escape. Anteriores/Próximos dão acesso aos demais países. Esses botões usam aria-disabled e guardas de ação para manter o foco quando o botão atingido passa a estar indisponível. No mobile, a lupa abre a caixa com foco no campo; X/Escape a fecham e a escolha de país a recolhe. Fechar o cartão restaura foco à lupa no mobile ou ao campo no desktop. Sem suporte de voz, tocar no microfone explica a limitação; a digitação permanece disponível.

No mobile, o template apresenta a busca sobre um backdrop leve, com semântica de diálogo e foco contido. Tocar no fundo, X ou Escape fecha a pesquisa e devolve o foco à lupa, preservando seleção e câmera. O backdrop não aparece na busca permanente do desktop.

## Exemplo

```tsx
<CountrySearch
  search={search}
  voice={voice}
  inputRef={input}
  disabled={!ready}
  onSelect={selectCountry}
/>
```
