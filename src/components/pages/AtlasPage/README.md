# AtlasPage

Composição concreta da prévia da fase 1.

## Contrato

Sem props externas; dados de exemplo locais.

## Estados e variantes

consulta editável, aviso, cartão de exemplo e ajuda abertos/fechados.

## Exemplo

```tsx
<AtlasPage />
```

## Acessibilidade e responsabilidade

Coordena foco ao fechar regiões e anuncia avisos por role=status. useViewportHeight acompanha altura visível. Sem serviços de voz, busca real ou seleção geográfica.
