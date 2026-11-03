# AtlasPage

Composição concreta até T11, com catálogo revisado na T12.

## Contrato e estados

Sem props externas. Loading/error/ready, seleção, ajuda, consulta/sugestões e voz (idle, starting, listening, processing, error, unavailable).

## Responsabilidade e acessibilidade

Coordena useAtlasData, useAtlasLayout, busca textual, hino/pronúncia/escuta exclusivos via useAtlasAudio e comandos de câmera. Mapa, ajuda e busca abrem o mesmo cartão. Clique no fundo do mapa sem país selecionável usa reset para limpar seleção e áudio, voltar à visão inicial e evitar foco programático na busca; botão de fechar/Escape mantêm o retorno de foco ao acionador. Restaura foco ao acionador, trata Escape e preserva seleção ao mudar viewport. Selecionar, digitar, abrir ajuda ou restaurar a visão encerra a captura. O cartão de boas-vindas foi removido para deixar o mapa livre. Selecionar/fechar país, restaurar a visão e abrir ajuda também interrompem a pronúncia. O hino participa do mesmo coordenador e é interrompido nesses fluxos. usePwa integra instalação, prontidão e atualização por escolha; AppOptions é composto no slot da ajuda. Atualizar chama stopAll e fica indisponível durante operações de áudio/voz/gesto. Estado offline e aviso de atualização usam o espaço de status existente.

## Exemplo

```tsx
<AtlasPage />
```
