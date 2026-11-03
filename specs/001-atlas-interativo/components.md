# Arquitetura de componentes — Atomic Design

Status: Atomic Design mantido até T16/T17, incluindo player, créditos, instalação e modo offline. O inventário atual está ao final.

## Objetivo

Construir a interface infantil com cinco níveis de composição, componentes coesos e lógica de domínio separada. A experiência atende a uma criança de até 5 anos, com toque e voz como caminhos principais e linguagem visual compartilhada.

## Níveis e responsabilidades

| Nível | Responsabilidade | Componentes previstos |
| --- | --- | --- |
| Átomos | Unidades visuais básicas com semântica, acessibilidade e variantes consistentes. | Button, Icon, Text, TextInput, FlagImage, ProgressBar. |
| Moléculas | Pequenos conjuntos que executam uma ação ou apresentam uma informação. | SearchField (campo e microfone), CountryOption (bandeira e nome), AudioControls (tocar/pausar/reiniciar), ZoomControls (aproximar/afastar/restaurar), CountryHeading (bandeira e nome), ConnectionStatus (prontidão offline/limitação de conexão). |
| Organismos | Regiões completas da experiência, compostas de átomos/moléculas e subcomponentes coesos. | WorldMap, CountrySearch, CountryDetails, CreditsPanel e AppOptions (instalação, ajuda e atualização para o responsável). |
| Templates | Estrutura responsiva e posicionamento de regiões, recebidas como slots. | AtlasTemplate, mobile-first, com mapa, busca, navegação, painel inferior de detalhes e conteúdo secundário, respeitando teclado e áreas seguras. |
| Páginas | Composição concreta com dados e coordenação do estado da aplicação. | AtlasPage, que conecta catálogo, seleção, busca, voz e áudio. |

Não é necessário passar por todos os níveis para cada elemento: um organismo pode usar um átomo diretamente. A classificação segue a responsabilidade, não a quantidade de linhas ou tags.

## Dependências e separação

- Átomos usam tokens e utilitários de apresentação; não importam moléculas, organismos, templates ou páginas.
- Moléculas usam átomos e lógica local de interação; não importam organismos, templates ou páginas.
- Organismos usam átomos, moléculas e seus subcomponentes internos. Não importam templates ou páginas, nem outro organismo público para criar dependência circular; a página/template compõe regiões irmãs.
- Templates posicionam slots e tratam layout. Não carregam países nem iniciam captura/reprodução.
- Páginas compõem templates/organismos e coordenam hooks e serviços. Apenas a página concreta AtlasPage é necessária para esta SPA.
- `domain/` contém regras e tipos sem React, GSAP ou acesso ao DOM. Projeção e cálculo de enquadramento são isolados do desenho e dos gestos.
- `services/` encapsula APIs externas e do navegador; `hooks/` adapta estado e ciclo de vida ao React. Acesso a voz e ao player passa por um único coordenador, não por instâncias criadas dentro de cada botão.
- Hooks de gestos e animação podem ser usados pelo organismo correspondente. Átomos e moléculas recebem estado e callbacks; não consultam o catálogo nem decidem qual país está selecionado.
- Registro do service worker, eventos de instalação e atualização ficam em `pwa/`, expostos à página por hooks/adaptadores. AppOptions e ConnectionStatus recebem estados e callbacks; não controlam cache ou recarga diretamente.
- Evitar ciclos, estado global implícito e acesso profundo a arquivos internos de outro componente. Não duplicar componentes em diretórios por feature.

## Contratos previstos

| Componente | Entradas e eventos principais | Estados a documentar |
| --- | --- | --- |
| Button | variante semântica, ícone, rótulo, onClick, disabled, pressed quando aplicável | padrão, foco, pressionado, indisponível, carregando |
| FlagImage | src, alt, tamanho | carregando, pronta, falha com alternativa visual |
| SearchField | value, onChange, onVoiceStart/onVoiceCancel, estado de escuta | vazio, preenchido, escutando, indisponível, erro |
| CountryOption | bandeira, nome, ativo/selecionado, onSelect, IDs acessíveis | padrão, ativo por teclado, selecionado |
| AudioControls | playbackState, progresso, onPlay/onPause/onRestart | loading, playing, paused, ended, error, unavailable |
| WorldMap | geometrias, selectedCountryId, onSelect, onDeselect, pedido de enquadramento | carregando, pronto, arrastando, seleção, erro |
| CountrySearch | consulta, resultados, estado de escuta, callbacks de busca/seleção/voz | sugestões abertas, vazio, sem resultados, escutando, erro |
| CountryDetails | país, estados de áudio, callbacks de ouvir/pausar/reiniciar/fechar | aberto, troca de país, mídia indisponível, erro |
| AtlasTemplate | slots e estado de abertura do painel | desktop, mobile, painel aberto/fechado, teclado aberto, retrato/paisagem, modo instalado |
| ConnectionStatus | prontidão offline, disponibilidade efetiva do recurso, rótulo amigável | preparando, pronto offline, recurso exige rede, falha de preparação |
| AppOptions | instalação disponível, instruções, atualização disponível, callbacks de instalar/atualizar/adiar | navegador, instalado, instrução manual, atualização aguardando, aplicando, erro |

Combobox, lista e opções pertencem a uma composição coordenada de CountrySearch. IDs, foco e atributos ARIA precisam funcionar entre SearchField e CountryOption; separar arquivos não deve romper a acessibilidade.

## Qualidade dos componentes

- Cada componente tem um diretório com implementação, tipos quando necessário e exportação pública explícita. Subcomponentes usados só ali ficam no mesmo diretório.
- Props em TypeScript, nomes que expressem intenção e uniões discriminadas quando estados forem mutuamente exclusivos. Evitar combinações de booleanos que permitam estados impossíveis.
- Criar variantes orientadas a uso real, sem componentes universais com dezenas de props. Extrair unidades com responsabilidade ou reutilização clara; evitar wrappers sem função.
- Cores, tipografia, tamanhos, bordas, espaçamentos e movimento usam tokens compartilhados. Cores originais de bandeiras são exceção intencional.
- Documentar propósito, props, variantes, estados, acessibilidade e exemplo de uso dos componentes públicos. Exemplos podem ficar em Markdown junto ao componente; ferramenta de catálogo visual não é requisito inicial.
- Animações ficam encapsuladas na região que animam, com refs e limpeza. Eventos de áudio/voz carregam identidade da operação para impedir atualizações de um país anterior.
- Manter poucos testes dos fluxos principais, com seletores acessíveis. Estados visuais, gestos detalhados e variações de layout ficam para conferência manual. Não criar testes que apenas confirmem estrutura, atributos internos ou reproduzam a implementação.

## Tokens e linguagem infantil

Definir tokens para oceano, países, seleção, foco, superfície, texto e estados. A cor de estado não deve depender da cor de um país.

Botões desabilitados usam opacidade de 20%, inclusive os controles com aria-disabled, para distinguir sua indisponibilidade. Os estados desabilitados não recebem efeitos de hover/pressionamento.

Controles têm alvo mínimo de 56×56 CSS px, separação mínima de 8 px, ícones legíveis e rótulos curtos. Texto-base mínimo de 18 px e contraste textual mínimo de 4,5:1. Os limites se aplicam aos controles/resultados, não ao tamanho dos polígonos do mapa.

Conferir os componentes tanto isoladamente quanto no contexto de AtlasPage. Um botão com tamanho correto isolado ainda pode ficar encoberto pelo painel ou difícil de reconhecer na tela completa.

## Comportamento mobile e PWA

AtlasTemplate organiza a superfície útil sem embutir regras de cache ou negócio. Mudança de orientação, teclado e áreas seguras atualizam o layout; a página preserva seleção e coordena novo enquadramento quando necessário.

WorldMap captura gestos apenas na própria superfície. CountryDetails permite scroll interno e tem botão visível para fechar o painel. WorldMap emite onDeselect ao clicar no fundo sem país selecionável, após a proteção contra gestos. A página limpa seleção/captura/pronúncia sem forçar foco à busca nesse fechamento por ponteiro. Inputs, resultados e botões continuam utilizáveis com teclado aberto e em paisagem.

Instalação e atualização aparecem em AppOptions, como conteúdo secundário para o responsável. A detecção de rede é apenas um sinal: estado offline/prontidão e disponibilidade de mídia precisam refletir o resultado real de cache/requisição. Atualização exige ação explícita e coordenação da página com áudio/voz antes de recarregar.

## Revisão de arquitetura

T03 estabelece estrutura e regras; T04 define tokens e componentes básicos; T05–T13 compõem os organismos e a página; T16/T17 integram PWA e seus estados sem romper Atomic Design; T14 verifica CA14 e a experiência completa, inclusive CA15–CA19 de PWA/mobile. Registrar alterações de classificação e contrato aqui antes de consolidar a entrega.

Referência da metodologia: [Atomic Design, de Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/). As regras de diretórios, importação e documentação acima são decisões deste projeto.

## Inventário atual — até T16/T17

- Átomos: Button, Icon, Text, TextInput, FlagImage e ProgressBar.
- Moléculas: Brand, SearchField, ZoomControls, CountryHeading, AudioControls, CountryPicker, CountryOption, MediaCredits e ConnectionStatus.
- Organismos: WorldMap, MapFeedback, CountryDetails, PreviewHelp, CountrySearch e AppOptions.
- Template: AtlasTemplate, com slots e regras responsivas.
- Página: AtlasPage, com carregamento, seleção, comandos de câmera, busca, coordenação de hino/pronúncia/escuta e ajuda.

São 23 componentes, cada um com implementação, exportação pública e README de contrato/estados/acessibilidade/exemplo. domain/atlas contém Zod, tipos e cálculo geográfico sem React/DOM; services/loadAtlas carrega arquivos com AbortSignal; hooks/ adapta carregamento, área livre, gestos e câmera. pwa/ contém cliente/protocolo e SW Workbox com tsconfig WebWorker próprio; usePwa adapta instalação/cache/atualização para a página. Os arquivos de runtime são gerados em public/data/; a ilustração e os dados fixos do Brasil da fase 1 foram removidos.

ZoomControls funciona por callbacks da página para o controlador único de WorldMap. D3 controla gestos e todas as transformações; GSAP interpola comandos pelo mesmo caminho, sem atualizar coordenadas em estado React por frame. ResizeObserver mede busca, navegação e painel para enquadramento; mudanças de viewport reenquadram sem transição. Tokens de cores, incluindo países, ficam em styles/index.css; map-palette.ts associa cada continente a um token pastel, inclusive nas geometrias de contexto. América do Norte usa pêssego; América do Sul, verde; Europa, lilás; África, amarelo; Ásia, rosa; Oceania, azul; Antártida, cinza claro. País selecionado usa verde vivo com contorno escuro; hover e marcadores comuns usam um tom neutro suave, preservando foco visível por teclado.

CountryPicker continua como select nativo secundário na ajuda. CountrySearch implementa a busca principal com combobox/listbox; SearchField recebe props do input e callbacks, CountryOption recebe país, índice e estado ativo. useCountrySearch coordena consulta/paginação e useVoiceSearch coordena uma única captura, ambos compostos pela página. O domínio normaliza/rankeia os países; services/speechRecognition concentra o acesso à API. O slot de introdução foi removido do template. Os polígonos selecionáveis têm nome, aria-pressed e Enter/espaço. A sequência de Tab inclui o país selecionado (Brasil inicialmente), evitando 195 paradas; os demais são alcançáveis pela lista. Marcadores de países pequenos mantêm tamanho visual durante o zoom. WorldMap também contém uma camada decorativa de nomes: posições/áreas internas calculadas no domínio; useMapLabels mede texto e fontes uma vez e adapta diretamente fonte/visibilidade durante zoom, sem interceptar eventos ou adicionar paradas de Tab.

CountryDetails recebe o país real, capitais múltiplas, nota e rótulo administrativo opcional. A página restaura foco ao fechar pelo botão/Escape; fechamento pelo fundo do mapa não força foco à busca. AudioControls recebe disponibilidade, atividade, progresso e callbacks de voz/hino; alterna Ouvir nome/Parar nome e Ouvir hino/Pausar hino, com ProgressBar e reinício. MediaCredits é uma molécula de detalhes secundários com autoria, fonte, licença e alterações; não exige um organismo separado de créditos. CountryDetails apresenta estados de voz/áudio em região de status. useAnthem mantém um HTMLAudioElement criado sob demanda, com limpeza, eventos protegidos e tratamento de falha. useAtlasAudio é o coordenador único de reprodução/escuta na página; usePronunciation controla a utterance e services/speechSynthesis encapsula vozes/erros. Nenhuma captura ou reprodução é criada nos botões; SearchField participa da busca textual/voz real e não cria sessões dentro dos botões. O polimento adicional de movimento continua em T13.

ESLint verifica direção de importações pelos aliases dos níveis Atomic Design e impede importação de React/componentes em domain/. A revisão da árvore atual confirmou os contratos; a validação completa de CA14 continua em T14.

AppOptions é composto como conteúdo secundário na ajuda pela página; PreviewHelp recebe ReactNode e não importa outro organismo. ConnectionStatus recebe estado verificado, sem acesso a CacheStorage. Text aceita h3 para o subtítulo do responsável. Ícones PWA são assets derivados do favicon existente, sem alterar o sistema de ícones da interface.
