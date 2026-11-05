# Domínio do atlas

schema.ts valida catálogo, TopoJSON, coordenadas decodificadas, anéis, IDs e referências com Zod antes da renderização. geometry.ts contém projeção equiretangular fixa, foco na ilha principal em países que cruzam a borda, foco na região principal de territórios descontínuos, cálculo da área livre e limites de câmera. Os limites de pan e zoom mínimo usam sempre a viewport inteira, inclusive sob os overlays. A área livre entre controles e cartão serve ao enquadramento do país. targetView calcula o zoom adicional necessário para manter a região dentro dessa área sem liberar as bordas do mundo; fitBounds calcula a translação com a escala final. Quando todo o território não cabe respeitando o zoom mínimo global, prioriza o centro da região principal. O máximo continua em 32; o constrainView final mantém a câmera nas bordas da viewport.

search.ts normaliza nomes/aliases sem perder alfabetos não latinos e prioriza nome exato, alias exato, prefixos e trechos, com desempate alfabético em pt-BR.

labels.ts calcula centros visuais e raios internos na geometria projetada do território principal, considerando recorte, ilhas e buracos. A posição é reutilizada no zoom; medição de texto/visibilidade fica em useMapLabels, fora do domínio.

Não importa React, GSAP nem DOM. Dados de runtime são gerados por scripts/prepare-map-data.mjs. A integridade dos arquivos é conferida por `npm run check:catalog`. A rotina automatizada cobre os fluxos principais no navegador; os detalhes geográficos ficam para conferência manual.
