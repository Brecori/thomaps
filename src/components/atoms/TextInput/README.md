# TextInput

Campo nativo com estilo e ref encaminhada.

## Contrato

InputHTMLAttributes<HTMLInputElement> e ref.

## Estados e variantes

vazio, preenchido, foco, disabled e inválido por atributos nativos.

## Exemplo

```tsx
<TextInput id="country" value={value} onChange={onChange} />
```

## Acessibilidade e responsabilidade

Exige label associado; placeholder não substitui label.
