# CountryDetails

Cartão não modal do país selecionado: lateral de 480 px e altura mínima de 620 px no desktop com espaço vertical; painel inferior no mobile. A altura é limitada pela viewport e o conteúdo permite rolagem interna. Telas intermediárias usam largura de 380 px.

O cartão se ancora à camada de interface medida por VisualViewport, acima das barras do navegador. A camada do mapa continua em `100lvh`, sem determinar o limite inferior do cartão. Conteúdo longo rola internamente, com o botão de fechar alcançável.

## Contrato

country: CountrySummary (incluindo capitalNote e capitalLabel opcionais); audio?: ReactNode fornecido pela página; onClose().

## Estados

País, capital/capitais e nota opcional. A página fornece CountryAudio no slot audio enquanto há país selecionado, em mobile e desktop. Os controles de mídia ficam diretamente no cartão; em telas menores, o conteúdo pode rolar internamente. Os estados de mídia e créditos pertencem a CountryAudio.

## Responsabilidade e acessibilidade

Foco na região ao abrir/trocar país; preventScroll evita deslocar a página. Página restaura foco ao acionador lógico ao fechar; uma seleção pela busca mobile retorna à lupa. Wrapper do template controla scroll; botão de fechar continua alcançável. Não cria motor de síntese ou player, nem importa CountryAudio diretamente. Página/coordenador interrompem a operação ao fechar ou trocar país, inclusive quando WorldMap solicita fechamento por clique no fundo. Desselecionar no mobile preserva a câmera; Ver o mundo restaura a visão inicial.

## Exemplo

```tsx
<CountryDetails
  key={country.id}
  country={country}
  audio={countryAudio}
  onClose={closeCountry}
/>
```

No mobile, o cartão usa capital sem caixa de fundo e omite eyebrow/rodapé decorativos. Bandeiras mantêm 112×76 px; controles de mídia/status/créditos pertencem ao conteúdo do cartão. O fechamento permanece sticky em retrato e paisagem.

O botão Fechar país permanece sticky durante a rolagem interna em desktop e mobile, com alvo de 56×56 px.
