# CountryHeading

Bandeira e nome do país selecionado.

## Contrato

name; flagSrc; headingId.

## Estados

Conteúdo real do catálogo; fallback de imagem tratado por FlagImage.

## Responsabilidade e acessibilidade

Título h2 e bandeira com alt. Bandeira inteira com object-fit contain: 160×108 px no desktop amplo, 128×88 px em telas intermediárias e 112×76 px no celular (incluindo paisagem compacta). Novo src reinicia a tentativa de carregar; nenhum texto de país de exemplo permanece.

## Exemplo

```tsx
<CountryHeading
  name="Brasil"
  flagSrc="/flags/br.svg"
  headingId="country-title"
/>
```
