# AtlasTemplate

Layout por slots, mobile-first e mensurável pela página.

## Contrato

map, brand, search, navigation, utility, status; searchOpen controla a visibilidade da busca (padrão true); onCloseSearch ativa a apresentação modal da pesquisa e trata o fechamento pelo fundo nas telas compactas; actions recebe os botões flutuantes. details e help opcionais; detailsKey identifica a troca do conteúdo; containerRef e onEscape opcionais.

## Estados

Mobile, tablet, desktop, paisagem, painel aberto e viewport compacta.

## Responsabilidade e acessibilidade

O mapa ocupa `100lvh` (com fallback `100vh`), mantendo a altura total da tela ao abrir o teclado. A camada de interface usa `--visible-height` (fallback `100dvh`) para ancorar cartão, controles, ajuda e backdrop na área realmente visível, acima das barras do navegador. A lista de resultados também limita sua rolagem por essa medida. useAtlasLayout mede a camada do mapa separadamente da interface; o tamanho do SVG permanece estável quando as barras ou o teclado reduzem a área visível. Na pesquisa mobile, abrir/fechar o teclado também preserva a câmera. O estado de viewport compacta considera a altura de layout.

Organiza regiões e expõe ref para medir áreas ocupadas. Compõe AnimatedPanel para entrada/saída de search e details, mantendo wrappers de medição estáveis. Busca fechada não participa de foco nem captura toques. Não carrega países nem controla D3. Gestos ficam na superfície do mapa; overlays têm sua própria rolagem. O slot actions ocupa o canto inferior esquerdo nas telas compactas, com margens equivalentes às da navegação à direita. Em retrato, ambos se posicionam acima da altura real do cartão medida em --details-height. A pesquisa continua disponível mesmo quando os controles de zoom são ocultados em viewport compacta com cartão aberto.

Com pesquisa modal aberta, um backdrop azul escuro a 15% e desfoque de 1,5 px cobre o fundo; a busca fica acima de todas as outras regiões. Mapa, cartão e controles ficam inert. Tab/Shift+Tab permanecem na busca, e o toque no backdrop chama onCloseSearch sem selecionar ou mover o mapa. A página devolve o foco à lupa. No desktop, onCloseSearch não é fornecido e a busca permanece integrada ao mapa, sem backdrop.

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
