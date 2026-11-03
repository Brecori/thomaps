# Button

Botão semântico reutilizável.

## Contrato

ComponentProps<button>, tone: primary | purple | soft | plain, children. Encaminha ref e atributos nativos.

## Estados e variantes

padrão, foco, pressionado, disabled; aria-pressed pode representar alternância.

## Exemplo

```tsx
<Button tone="primary" onClick={onExplore}>
  Explorar
</Button>
```

## Acessibilidade e responsabilidade

Usar rótulo visível; ícones sem texto exigem aria-label. Alvo mínimo 56×56 px.
