# Text

Tipografia compartilhada com semântica explícita.

## Contrato

as: p | span | h1 | h2; variant: body | heading | label; atributos HTML.

## Estados e variantes

variantes tipográficas e foco apenas quando necessário ao conteúdo.

## Exemplo

```tsx
<Text as="h2" variant="heading">
  Brasil
</Text>
```

## Acessibilidade e responsabilidade

Escolher hierarquia semântica; a aparência não determina o nível do título.

Aceita também `as="h3"` para subtítulos de regiões dentro da ajuda, preservando a hierarquia do documento.
