# CountryAudio

Região de sons do país, composta de AudioControls, mensagens e MediaCredits. A página a fornece ao slot audio de CountryDetails; um organismo público não importa outro organismo público.

## Contrato e estados

Recebe country, pronunciation e anthem do coordenador useAtlasAudio. Permanece no cartão enquanto há país selecionado, tanto no mobile quanto no desktop. Mantém os estados de preparação, reprodução, pausa, fim, erro, indisponibilidade, progresso e reinício.

## Responsabilidade e acessibilidade

Não cria player ou captura. Usa um ID local para as descrições dos botões, região nomeada e status aria-live. Selecionar um país não reproduz som automaticamente. No mobile, os controles ficam diretamente no cartão, com rolagem interna quando necessária, inclusive em paisagem. A página interrompe o áudio ao abrir a pesquisa, fechar ou trocar país. Fechar a pesquisa devolve o foco à lupa e não retoma a reprodução.

## Exemplo

```tsx
<CountryAudio
  country={country}
  pronunciation={audio.pronunciation}
  anthem={audio.anthem}
/>
```
