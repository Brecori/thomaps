# WorldMap

Mapa SVG retangular com projeção equiretangular fixa e geometrias validadas. O zoom mínimo acompanha a viewport e impede espaço vazio fora das bordas. O arraste para nos limites da tela; a área livre entre overlays é usada para focar países.

## Contrato

data: AtlasData; selectedId; layout; request: NavigationRequest; onSelect(id, origin); onDeselect(); onStatus(status).

## Estados

Normal, hover, seleção, arraste e zoom. Países usam uma cor pastel mais definida por continente; a seleção recebe verde vivo e contorno escuro. Hover e marcadores não selecionados usam um tom neutro suave; o foco por teclado permanece visível. Geometrias de contexto não são controles. Marcadores mantêm raio visual ao ampliar.

## Responsabilidade e acessibilidade

O domínio calcula projeção/enquadramento; useMapNavigation controla a transformação via D3. React não recebe coordenadas por frame. Paths recebem nome, aria-pressed e Enter/espaço. Só o país selecionado (ou Brasil inicialmente) entra na sequência de Tab; a lista da ajuda oferece acesso aos demais. Pinça e arraste não geram seleção nem fechamento. Clique no fundo do SVG sem país selecionável emite onDeselect; o clique no país atual preserva a seleção e outro país segue por onSelect. Labels/contornos decorativos não interceptam o clique.

## Exemplo

```tsx
<WorldMap
  data={atlas}
  selectedId={selectedId}
  layout={layout}
  request={request}
  onSelect={selectCountry}
  onDeselect={clearSelection}
  onStatus={setNavigation}
/>
```

## Contornos

Seleção, hover e foco usam cópias de contorno sem preenchimento, desenhadas depois de todos os polígonos. Assim as bordas dos vizinhos não encobrem o traço. A camada é decorativa (aria-hidden e pointer-events: none), preserva espessura com vector-effect e mantém os marcadores acima dela. Hover só atualiza o país sob o mouse, não coordenadas por frame; é limpo ao iniciar gestos e ao sair do mapa.

## Nomes dos países

A camada de nomes é decorativa (aria-hidden e pointer-events: none), depois dos contornos e antes dos marcadores. Usa o nome em português do catálogo, exibido em caixa alta, cinza escuro e sem contorno, com até duas linhas para nomes longos. Países de contexto não recebem rótulo.

domain/atlas/labels escolhe uma área interna no território principal, usando a geometria já recortada pela projeção e respeitando buracos/ilhas. useMapLabels mede a caixa real de cada texto após renderizar e após carregar as fontes. Durante zoom, o controlador atualiza somente atributos/estilos SVG: fonte aparente de 14–18 px. A medição considera a caixa alta e uma margem de respiro. Se o texto não couber na área interna, o nome fica oculto, inclusive em países pequenos. Ao ampliar, nomes passam a aparecer conforme o espaço disponível.

Não há medição de layout nem atualização React por frame. Nomes não interceptam clique/toque e não repetem o nome acessível já presente no polígono.
