# AtlasTemplate

Layout mobile-first por slots.

## Contrato

map, brand, search, navigation, introduction, utility, status: ReactNode; details e help opcionais.

## Estados e variantes

mobile, tablet, desktop, paisagem, painel aberto/fechado e viewport compacta.

## Exemplo

```tsx
<AtlasTemplate
  map={map}
  brand={brand}
  search={search}
  navigation={navigation}
  introduction={intro}
  utility={utility}
  status={status}
/>
```

## Acessibilidade e responsabilidade

Organiza regiões sem carregar dados ou executar APIs; respeita áreas seguras e altura visível.
