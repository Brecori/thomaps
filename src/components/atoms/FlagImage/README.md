# FlagImage

Imagem de bandeira com alternativa para falha.

## Contrato

src: string, alt: string, className?: string.

## Estados e variantes

imagem carregada e fallback quando o src falha; novo src permite nova tentativa.

## Exemplo

```tsx
<FlagImage src="/flags/br.svg" alt="Bandeira do Brasil" />
```

## Acessibilidade e responsabilidade

Preserva texto alternativo também no fallback. Não altera cores da bandeira.
