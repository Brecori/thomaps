# CountryDetails

Cartão não modal do país selecionado: lateral de 480 px e altura mínima de 620 px no desktop com espaço vertical; painel inferior no mobile. A altura é limitada pela viewport e o conteúdo permite rolagem interna. Telas intermediárias usam largura de 380 px.

## Contrato

country: CountrySummary (incluindo anthem, capitalNote e capitalLabel opcionais); pronunciation e anthem: estado/ações do coordenador useAtlasAudio; onClose().

## Estados

País, capital/capitais, nota opcional e pronúncia ociosa/preparando/falando/erro/indisponível. Hino tem preparação, reprodução, pausa, fim, erro, indisponibilidade, progresso e reinício; MediaCredits apresenta autoria/fonte/licença como informação secundária.

## Responsabilidade e acessibilidade

Foco na região ao abrir/trocar país; preventScroll evita deslocar a página. Página restaura foco ao fechar pelo botão/Escape; fechamento pelo fundo do mapa não força foco à busca. Wrapper do template controla scroll; botão de fechar continua alcançável no mobile. Compõe AudioControls com callbacks e anuncia voz/áudio em role=status/aria-live; não cria motor de síntese ou player. Página/coordenador interrompem a operação ao fechar ou trocar país, inclusive quando WorldMap solicita fechamento por clique no fundo.

## Exemplo

```tsx
<CountryDetails
  key={country.id}
  country={country}
  pronunciation={audio.pronunciation}
  anthem={audio.anthem}
  onClose={closeCountry}
/>
```

No mobile, o cartão usa capital sem caixa de fundo, botões de áudio suaves e omite eyebrow/rodapé decorativos. Bandeiras mantêm 112×76 px e controles de pelo menos 56 px. O fechamento permanece sticky em retrato e paisagem; status e créditos continuam acessíveis.
