# CountryHeading

Bandeira e nome no cabeçalho do cartão.

## Contrato

name: string; flagSrc: string; headingId: string.

## Estados e variantes

conteúdo de exemplo e falha de bandeira tratada pelo átomo.

## Exemplo

```tsx
<CountryHeading
  name="Brasil"
  flagSrc="/flags/br.svg"
  headingId="country-title"
/>
```

## Acessibilidade e responsabilidade

Título h2 identificado pelo pai; bandeira com alt.
