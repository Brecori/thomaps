# CountryOption

Sugestão com bandeira decorativa e nome de país, composta por CountrySearch.

## Contrato e estados

id, country: Country, active, position, total e onSelect(). Estados normal, hover e ativo por teclado. Linha com altura mínima de 64 px e separação de 8 px na lista.

## Responsabilidade e acessibilidade

Opção de listbox com aria-selected, aria-posinset e aria-setsize. O foco de teclado permanece no combobox; o organismo controla setas, Enter e aria-activedescendant. Não filtra países nem altera o mapa diretamente.

## Exemplo

```tsx
<CountryOption
  id="result-BRA"
  country={country}
  active={true}
  position={1}
  total={1}
  onSelect={() => selectCountry(country.id)}
/>
```
