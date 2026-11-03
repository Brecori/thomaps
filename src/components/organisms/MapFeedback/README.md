# MapFeedback

Região de carregamento e recuperação de falhas.

## Contrato

status: loading | error; onRetry().

## Estados

Carregando com aria-busy; erro com mensagem curta e botão de nova tentativa.

## Responsabilidade e acessibilidade

Não faz fetch. A página conecta useAtlasData e apresenta a região enquanto o mapa não está pronto.

## Exemplo

```tsx
<MapFeedback status="error" onRetry={retry} />
```
