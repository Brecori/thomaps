# CountryPicker

Alternativa nativa e acessível para localizar um país na ajuda, sem antecipar a busca de T08.

## Contrato

countries: { id, namePtBr }[]; selectedId; onSelect(id).

## Estados

Valor vazio ou país escolhido; opções ordenadas em português.

## Responsabilidade e acessibilidade

Label associado por useId; select nativo de 56 px. Funciona por teclado e não filtra nem captura voz.

## Exemplo

```tsx
<CountryPicker
  countries={countries}
  selectedId={selectedId}
  onSelect={selectCountry}
/>
```
