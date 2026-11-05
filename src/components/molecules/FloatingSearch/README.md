# FloatingSearch

Botão de pesquisa para telas compactas, composto com Button e Icon. Aparece no canto inferior esquerdo, com o mesmo visual dos controles de zoom à direita.

## Contrato e estados

Recebe open, disabled, buttonRef e onToggle. Mede 56×56 px, com margens equivalentes às dos controles de navegação e respeito às áreas seguras. Em retrato, acompanha a altura do cartão para manter o botão alcançável.

Nas telas compactas, pesquisa e navegação ficam 16 px acima das posições inferiores calculadas, mantendo o alinhamento e o afastamento da borda ou do cartão.

## Responsabilidade e acessibilidade

Expõe o nome Pesquisar país, aria-expanded e aria-controls. A página controla a abertura da busca e o retorno de foco. A molécula não consulta o catálogo, não abre microfone e não cria áudio.

## Exemplo

```tsx
<FloatingSearch
  open={searchOpen}
  disabled={!ready}
  buttonRef={searchButton}
  onToggle={toggleSearch}
/>
```
