# AtlasPage

Composição concreta com mapa, busca, sons e PWA.

## Contrato e estados

Sem props externas. Nas telas compactas, mobileSearchOpen controla a caixa de pesquisa, com FloatingSearch e useCompactLayout. A lupa fica no canto inferior esquerdo e acompanha a altura do cartão em retrato. Loading/error/ready, seleção, ajuda, consulta/sugestões e voz (idle, starting, listening, processing, error, unavailable).

## Responsabilidade e acessibilidade

Compõe CountryAudio no slot de CountryDetails enquanto há país selecionado, em mobile e desktop. A lupa abre a busca com foco no campo e chama audio.stopAll(); no mobile, onCloseSearch habilita o backdrop leve e a apresentação modal no template. Escolher país recolhe a caixa. Fechar pelo fundo, X ou Escape preserva seleção/câmera; o retorno de foco ocorre após o fundo deixar de estar inert. Fechar a pesquisa devolve o foco à lupa, sem retomar áudio. Fechar um país escolhido pela busca mobile também retorna à lupa; no desktop, retorna ao campo. Abrir a busca não reproduz nem captura automaticamente. Coordena useAtlasData, useAtlasLayout, busca textual, hino/pronúncia/escuta exclusivos via useAtlasAudio e comandos de câmera. Mapa, ajuda e busca abrem o mesmo cartão. No mobile, fechar país pelo cartão, Escape ou fundo do mapa limpa seleção/áudio e preserva a câmera; Ver o mundo usa reset para restaurar a visão inicial. Restaura foco ao acionador lógico e preserva seleção ao mudar viewport. Selecionar, digitar, abrir ajuda ou restaurar a visão encerra a captura. O cartão de boas-vindas foi removido para deixar o mapa livre. Selecionar/fechar país, abrir pesquisa, restaurar a visão e abrir ajuda também interrompem pronúncia e hino. usePwa integra instalação, prontidão e atualização por escolha; AppOptions é composto no slot da ajuda. Atualizar chama stopAll e fica indisponível durante operações de áudio/voz/gesto. Estado offline e aviso de atualização usam o espaço de status existente.

## Exemplo

```tsx
<AtlasPage />
```
