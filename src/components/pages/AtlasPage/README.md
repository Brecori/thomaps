# AtlasPage

Composição concreta até T10, início da fase 4.

## Contrato e estados

Sem props externas. Loading/error/ready, seleção, ajuda, consulta/sugestões e voz (idle, starting, listening, processing, error, unavailable).

## Responsabilidade e acessibilidade

Coordena useAtlasData, useAtlasLayout, busca textual, pronúncia/escuta exclusivas via useAtlasAudio e comandos de câmera. Mapa, ajuda e busca abrem o mesmo cartão. Clique no fundo do mapa sem país selecionável usa reset para limpar seleção e áudio, voltar à visão inicial e evitar foco programático na busca; botão de fechar/Escape mantêm o retorno de foco ao acionador. Restaura foco ao acionador, trata Escape e preserva seleção ao mudar viewport. Selecionar, digitar, abrir ajuda ou restaurar a visão encerra a captura. O cartão de boas-vindas foi removido para deixar o mapa livre. Selecionar/fechar país, restaurar a visão e abrir ajuda também interrompem a pronúncia. O player e o service worker ficam para as próximas tarefas.

## Exemplo

```tsx
<AtlasPage />
```
