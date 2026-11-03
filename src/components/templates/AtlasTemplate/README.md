# AtlasTemplate

Layout por slots, mobile-first e mensurável pela página.

## Contrato

map, brand, search, navigation, utility, status; details e help opcionais; detailsKey identifica a troca do conteúdo; containerRef e onEscape opcionais.

## Estados

Mobile, tablet, desktop, paisagem, painel aberto e viewport compacta.

## Responsabilidade e acessibilidade

Organiza regiões e expõe ref para medir áreas ocupadas. Compõe AnimatedPanel para a entrada/saída do slot details, mantendo o wrapper de medição estável. Não carrega países nem controla D3. Gestos ficam na superfície do mapa; overlays têm sua própria rolagem.

## Exemplo

```tsx
<AtlasTemplate
  containerRef={container}
  map={map}
  brand={brand}
  search={search}
  navigation={navigation}
  utility={utility}
  status={status}
/>
```
