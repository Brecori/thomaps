# AnimatedPanel

Superfície de entrada/saída com `useGSAP` de `@gsap/react`. Não conhece países, áudio ou regras de seleção.

## Contrato

Recebe `children`, `contentKey?: string` e atributos de uma div. Conteúdo ausente fecha o painel; uma nova chave repete a entrada. Atualizações do conteúdo com a mesma chave não reiniciam a animação.

O atributo `inert` fornecido pelo consumidor é respeitado também com conteúdo presente, permitindo bloquear o cartão enquanto a pesquisa modal está aberta. A saída mantém o bloqueio independentemente desse atributo.

## Estados e movimento

Entrada de 260 ms, saída de 140 ms e troca de conteúdo. No painel inferior, desloca 18 px na vertical; nas demais telas, 12 px na horizontal. Anima apenas a superfície interna. O wrapper de posicionamento permanece estável para o ResizeObserver medir a área ocupada sem acompanhar a transformação.

Mantém o último conteúdo apenas durante a saída visual. A página limpa seleção e áudio imediatamente; durante a saída, o wrapper fica `inert`, `aria-hidden` e sem eventos de ponteiro. Depois remove o conteúdo. Uma nova entrada cancela a saída anterior.

`useGSAP` usa escopo, dependências e `revertOnUpdate`; `matchMedia` acompanha a preferência de movimento reduzido e a orientação. Com movimento reduzido, apresenta/remove imediatamente. Mudança de preferência ou breakpoint encerra o efeito sem repetir a entrada. A desmontagem reverte estilos e efeitos.

## Exemplo

```tsx
<AnimatedPanel className="atlas-shell__details" contentKey={selected?.id}>
  {selected ? <CountryDetails {...detailsProps} /> : undefined}
</AnimatedPanel>
```
