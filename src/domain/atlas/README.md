# Domínio do atlas

schema.ts valida catálogo, TopoJSON, coordenadas decodificadas, anéis, IDs e referências com Zod antes da renderização. geometry.ts contém projeção equiretangular fixa, foco na ilha principal em países que cruzam a borda, foco na região principal de territórios descontínuos, cálculo da área livre e limites de câmera.

search.ts normaliza nomes/aliases sem perder alfabetos não latinos e prioriza nome exato, alias exato, prefixos e trechos, com desempate alfabético em pt-BR.

labels.ts calcula centros visuais e raios internos na geometria projetada do território principal, considerando recorte, ilhas e buracos. A posição é reutilizada no zoom; medição de texto/visibilidade fica em useMapLabels, fora do domínio.

Não importa React, GSAP nem DOM. Dados de runtime são gerados por scripts/prepare-map-data.mjs. A integridade dos arquivos é conferida por `npm run check:catalog`. A rotina automatizada cobre os fluxos principais no navegador; os detalhes geográficos ficam para conferência manual.
