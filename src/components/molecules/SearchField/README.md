# SearchField

Campo e microfone da prévia visual.

## Contrato

value: string; onChange(value); onUnavailable().

## Estados e variantes

edição e envio por Enter; envio/microfone comunicam que a busca será implementada depois.

## Exemplo

```tsx
<SearchField value={query} onChange={setQuery} onUnavailable={showNotice} />
```

## Acessibilidade e responsabilidade

Form com role=search e label; ainda não é combobox e não simula resultados ou captura. Conectar APIs apenas em T08/T09.
