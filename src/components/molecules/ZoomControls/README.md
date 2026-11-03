# ZoomControls

Ações do controlador único do mapa.

## Contrato

disabled; canZoomIn; canZoomOut; onZoomIn(); onZoomOut(); onReset().

## Estados

Carregamento/erro desabilitam todos; limites desabilitam apenas a direção correspondente.

## Responsabilidade e acessibilidade

Não importa D3 ou decide transformação. Botões com nome acessível e alvo de 56 px; Ver o mundo também limpa a seleção pela página.

## Exemplo

```tsx
<ZoomControls
  disabled={!ready}
  canZoomIn={canZoomIn}
  canZoomOut={canZoomOut}
  onZoomIn={zoomIn}
  onZoomOut={zoomOut}
  onReset={reset}
/>
```
