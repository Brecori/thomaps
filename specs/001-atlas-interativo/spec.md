# Especificação — Atlas interativo

Status: fases 0 a 3 e T10/T11 executadas. T12 tem 195 países revisados e 183 hinos; 12 exceções temporárias foram aceitas explicitamente pelo usuário em 2026-11-03. PWA e verificações finais continuam nas próximas tarefas. Data: 2026-11-03.

## Objetivo

Permitir que uma criança de até 5 anos explore o mundo em uma única página: selecionar um país no mapa ou pela busca e descobrir sua bandeira, capital, pronúncia do nome e hino. O fluxo principal deve funcionar sem exigir leitura autônoma.

## Decisões confirmadas com o usuário

- React com Vite, Tailwind CSS e GSAP.
- Mapa plano, estilo atlas, com interface clara e simples para uma criança de até 5 anos; países em cores pastel mais definidas por continente e cor chamativa somente no país selecionado.
- Atomic Design em toda a interface, com componentes bem separados e responsabilidades documentadas.
- PWA instalável, com experiência mobile como prioridade e validação em Android e iPhone.
- Mapa ocupa toda a tela; scroll aproxima/afasta e arraste desloca.
- Busca no topo, com entrada por texto e por voz.
- Nome do país reproduzível em português do Brasil.
- País selecionado em evidência, com container de informações e hino reproduzível.
- SDD em arquivos Markdown no repositório.

## Experiência proposta

Ao abrir, a criança vê o mapa em cores pastel mais definidas por continente e a barra de pesquisa flutuante, com microfone visível e realce ao iniciar a escuta. Controles grandes de zoom e de retorno à visão mundial ficam sobre o mapa. Não há seções adicionais abaixo da tela nem cartão de boas-vindas sobre o mapa.

Selecionar um país destaca seu território e enquadra a região sem esconder o conteúdo atrás do cartão. O cartão flutua sobre o mapa no desktop; no celular, será um painel inferior que deixa parte do mapa visível. Bandeira, nome, capital, botão de pronúncia e controles do hino aparecem apenas após a seleção. Fechar o painel sempre tem botão visível; arrastar não é obrigatório para fechá-lo. Clicar/tocar no oceano ou no fundo do mapa sem país selecionável também limpa a seleção e fecha o painel; clicar no país atual mantém a seleção e clicar em outro país a substitui. Arraste/pinça/zoom não fecham o cartão.

A busca mostra sugestões. Texto digitado e transcrição de voz passam pela mesma busca; escolher um resultado produz a mesma seleção que clicar no mapa. Nenhum áudio toca automaticamente.

## Experiência mobile e PWA

No celular, manter o cabeçalho compacto: marca menor, sem selo “Explorar”, busca com texto curto e microfone sem bloco de cor forte. Botões de áudio usam fundos suaves e realçam a atividade, preservando ícones/rótulos, foco e alvos de 56 px. O cartão dispensa o texto “Vamos conhecer” e o rodapé decorativo no mobile; bandeira, nome, capital, controles e feedback continuam visíveis. O fechamento fica alcançável durante o scroll também em paisagem.

Projetar primeiro para celular em retrato, preservando uso em paisagem, tablet e desktop. Busca e controles respeitam recortes, barras do sistema e teclado virtual. O mapa mantém pan com um dedo e zoom com pinça; botões oferecem alternativa aos gestos. A interação com o mapa não impede rolagem do cartão nem ampliação acessível do restante da interface.

O responsável pode instalar o app na tela inicial por um acesso secundário, sem interromper a exploração da criança. O fluxo respeita as opções do navegador e orienta a instalação manual quando necessário. A versão instalada usa janela própria onde houver suporte.

Proposta offline inicial: depois de uma visita online com preparação completa do cache, abrir o app, explorar o mapa, selecionar países, ver bandeiras/capitais e pesquisar por texto funciona sem internet. Não prometer primeira abertura offline, permanência ilimitada do cache nem hinos/voz sempre disponíveis offline. Hinos exigem conexão nesta versão; pronúncia usa voz local quando disponível, e busca por voz depende do reconhecimento do navegador. Essas limitações terão mensagens simples e alternativa funcional.

Atualizações são oferecidas discretamente ao responsável e aplicadas em momento escolhido, sem recarregar automaticamente durante exploração, reprodução ou captura de voz.

## Comportamento implementado até T10

Mapa SVG retangular com projeção equiretangular fixa com 195 países selecionáveis; toque/clique destaca e abre o cartão. Scroll, pinça, arraste e botões compartilham a câmera, com máximo de 32 e mínimo responsivo para preencher a tela sem espaço vazio além das bordas. O arraste para nos limites; scroll, pinça e botões respeitam o mesmo zoom mínimo. Arraste e pinça não disparam seleção. Fechar o cartão, clicar no fundo sem país selecionável ou usar “Ver o mundo” limpa a seleção e restaura a visão inicial no zoom mínimo. No celular em pé, a criança arrasta para explorar as regiões fora da tela.

A ajuda oferece escolha por lista nativa para teclado e países pequenos; polígonos também aceitam Enter/espaço. Pequenos países recebem marcadores. Os nomes são centralizados em uma área interna do território principal, em caixa alta, cinza médio e sem contorno, com até duas linhas. A fonte aparente varia de 10 a 18 px conforme o zoom; o nome só aparece quando o texto e uma margem de respiro cabem dentro do território. Omitir um rótulo não afeta seleção, busca ou cartão. Países com ilhas nos dois lados da borda focam a ilha principal, mantendo o mapa fixo; territórios distantes mantêm destaque, com enquadramento na região principal. A área livre é medida considerando busca, navegação e painel inferior/lateral. Não há alteração de fronteiras para ampliar alvos.

A busca textual normaliza acentos, caixa e pontuação, consulta nome/aliases e ordena correspondências exatas antes de prefixos e trechos. São exibidas até três sugestões com bandeira/nome, botões Anteriores/Próximos, setas/Enter e Escape. A seleção passa pelo mesmo fluxo do mapa e, ao fechar o cartão, devolve foco à busca. Consulta vazia não abre sugestões.

A voz usa uma sessão explícita pt-BR, apresenta a transcrição para escolha e encerra após resultado, cancelamento, falha ou 20 segundos sem conclusão. Seleção, digitação, ajuda, retorno ao mundo, saída/segundo plano e desmontagem encerram a captura. O navegador pode usar um serviço online; o atlas não persiste áudio/transcrições. Sem suporte, a ação do microfone explica a limitação e a busca textual continua disponível.

A pronúncia é acionada no cartão por Ouvir nome e interrompida por Parar nome. Usa exclusivamente uma voz identificada como pt-BR, priorizando voz local, sem fila acumulada. A lista de vozes pode carregar depois; até 3 segundos de lista vazia exibem carregamento, depois indisponibilidade, com recuperação por voiceschanged. Eventos antigos não alteram uma operação nova. Uma operação sem conclusão é cancelada após 15 segundos.

useAtlasAudio coordena fala e escuta: iniciar uma interrompe a outra; selecionar/fechar país, restaurar visão, abrir ajuda, sair/ocultar página ou desmontar encerra operações. Hino permanece desabilitado e será integrado a esse coordenador em T11. Instalação e cache PWA ficam em T16/T17.

## Diretrizes para até 5 anos

- Exploração direta por toque e busca por voz; digitação continua disponível. Nenhuma ação essencial depende de hover, atalho ou instrução longa.
- Fundo claro, oceano azul e países em uma cor pastel mais definida por continente e contornos legíveis. O país selecionado recebe verde vivo e contorno escuro; hover e marcadores comuns usam um tom neutro suave. As cores do mapa são decorativas, sem significado político.
- Ícones familiares acompanhados de rótulos curtos: “Falar”, “Ouvir nome”, “Ouvir hino”, “Pausar” e “Ver o mundo”. O desenho do ícone precisa permitir reconhecer a ação sem ler o rótulo.
- Botões e linhas de resultado com área de toque mínima de 56×56 CSS px e pelo menos 8 px entre ações independentes. Essa é uma meta do produto; os polígonos geográficos mantêm sua forma, com busca e zoom como alternativas para países pequenos.
- Texto de interface com tamanho-base de pelo menos 18 CSS px, títulos maiores e contraste mínimo de 4,5:1 para os textos. Bandeiras mantêm suas cores originais.
- Resultados de busca com bandeira e nome; mostrar até três por vez, com acesso claro aos demais. O cartão apresenta bandeira, nome e capital antes das ações de áudio.
- Instruções de uma frase, como “Toque em um país”. Feedback amigável: “Estou ouvindo” ou “Vamos tentar de novo?”. Detalhes técnicos de permissão e fontes ficam em ajuda secundária para o responsável.
- Animações curtas, acionadas pela interação, sem movimento decorativo contínuo. A pessoa pode interromper a transição ao tocar ou mover o mapa.

## Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF01 | Exibir mapa-múndi plano interativo ocupando a área útil da tela, com nomes no interior dos países quando houver espaço legível no zoom atual. |
| RF02 | Permitir zoom por scroll, gesto de pinça e botões; permitir deslocamento por arraste e retorno à visão mundial. Limitar o afastamento para o mapa preencher a tela e o deslocamento às bordas, sem revelar espaço vazio. |
| RF03 | Selecionar um país por clique/toque, destacando-o com preenchimento e contorno. Manter apenas um país selecionado e distinguir hover de seleção. |
| RF04 | Mostrar cartão com bandeira, nome em português, capital ou capitais e controles de áudio. Permitir fechar pelo botão ou pelo fundo do mapa sem país selecionável, limpar o destaque e selecionar outro país. |
| RF05 | Enquadrar o país selecionado com transição suave, considerando o espaço do cartão, regiões descontínuas e países próximos à borda do mapa. |
| RF06 | Buscar países por nome em português e aliases definidos no catálogo, ignorando acentos e maiúsculas. Mostrar sugestões e estado sem resultados. |
| RF07 | Acionar busca por voz explicitamente pelo microfone, no idioma pt-BR; mostrar escuta, transcrição e erros. Após transcrever, apresentar os resultados para escolha. |
| RF08 | Pronunciar o nome em português do Brasil por ação explícita, com estado de reprodução e tratamento de indisponibilidade da voz. |
| RF09 | Reproduzir e pausar o hino, mostrar andamento e permitir reiniciar. Exibir carregamento, indisponibilidade e falha de reprodução sem bloquear o cartão. |
| RF10 | Evitar sobreposição de hino, pronúncia e captura de voz. Trocar de país ou fechar o cartão interrompe áudios anteriores; iniciar a escuta interrompe reprodução. |
| RF11 | Exibir estados de carregamento e falha do mapa/dados, com opção de tentar novamente. |
| RF12 | Disponibilizar fontes e créditos dos dados e mídias em um acesso discreto sobre o mapa ou no cartão. |
| RF13 | Oferecer instalação PWA conforme o suporte da plataforma e orientações manuais quando necessárias, sem bloquear uso no navegador. |
| RF14 | Disponibilizar mapa, catálogo, bandeiras e busca textual offline após preparação completa do cache; indicar prontidão e tratar cache ausente/incompleto e funções que exigem conexão. |
| RF15 | Detectar atualização disponível, permitir adiar e aplicar por ação explícita em momento seguro, sem interromper interações ou áudio em andamento. |

## Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF01 | Layout mobile-first, verificado em 360×800, 390×844, paisagem de celular, tablet 768×1024 e desktop 1440×900, sem rolagem acidental da página; conteúdo longo do cartão pode rolar internamente. |
| RNF02 | Busca, sugestões, cartão e controles utilizáveis por teclado, com foco visível, rótulos acessíveis e anúncio de estados. A busca oferece acesso aos países sem depender de apontar para o mapa. |
| RNF03 | Respeitar prefers-reduced-motion; seleção, zoom e cartão continuam funcionais com transições reduzidas ou instantâneas. |
| RNF04 | Carregar hinos sob demanda; não baixar todas as gravações na abertura. Pan/zoom não deve reconstruir toda a árvore React a cada movimento. |
| RNF05 | Detectar suporte às APIs de voz em execução. Se reconhecimento não estiver disponível ou a permissão for negada, manter busca por texto e explicar o estado. |
| RNF06 | Pedir acesso ao microfone apenas ao acioná-lo; indicar captura ativa, permitir cancelamento e explicar que o navegador pode usar serviço remoto para reconhecimento. Não persistir gravações ou transcrições na aplicação. |
| RNF07 | Usar identificadores estáveis para ligar geometrias, países e mídias. Registrar fonte e data de revisão; validar integridade do catálogo antes da entrega. |
| RNF08 | Desmontagem e troca de seleção cancelam listeners, animações e operações pendentes, evitando efeitos duplicados e respostas de áudio de um país anterior. |
| RNF09 | Interface apropriada a até 5 anos: fluxo principal por toque/ícones/voz, linguagem curta, controles e tipografia conforme as diretrizes infantis, sem depender de leitura autônoma. |
| RNF10 | Usar países em cores pastel mais definidas por continente sobre base clara, seleção em cor viva, contornos legíveis e contraste dos textos de pelo menos 4,5:1. Seleção e estados não podem depender somente da cor. |
| RNF11 | Toda a interface deve seguir Atomic Design: átomos, moléculas, organismos, templates e páginas; regras de domínio, dados e APIs ficam em módulos próprios. Contratos e dependências seguem components.md. |
| RNF12 | Componentes com responsabilidade única, props tipadas, estados explícitos e tokens compartilhados de cor, tipografia, espaçamento e movimento. Documentar variantes e exemplos dos componentes reutilizáveis. |
| RNF13 | PWA com manifest, ícones adequados, service worker e publicação por HTTPS. Tratar diferenças de instalação entre plataformas e validar o build de produção. |
| RNF14 | Layout respeita áreas seguras, viewport dinâmica, abertura/fechamento do teclado e mudança de orientação, preservando seleção e ações acessíveis no navegador e no modo instalado. |
| RNF15 | Gestos do mapa ficam restritos à sua superfície. Não bloquear zoom acessível da página; evitar conflito com scroll de overlays e não exigir precisão fina ou gesto de arraste para ações essenciais. |
| RNF16 | Cache versionado para recursos essenciais, sem gravações/transcrições; prever limpeza de versões antigas e falhas de armazenamento. Arquivos de hino ficam fora do precache inicial. |
| RNF17 | Definir e registrar orçamento de transferência/cache dos recursos essenciais na T16 antes de consolidar a política offline. Verificar fluidez em celular de capacidade intermediária, com rede lenta e offline, registrando aparelho, condições e resultados. |

## Critérios de aceite

| ID | Cenário verificável | Requisitos |
| --- | --- | --- |
| CA01 | Ao abrir em desktop ou celular, mapa e busca estão disponíveis, sem conteúdo abaixo nem overflow horizontal da página. | RF01, RNF01 |
| CA02 | Scroll, arraste, pinça e botões alteram a visão dentro dos limites; arrastar não seleciona um país por engano; restaurar retorna à visão inicial no zoom mínimo que preenche a tela; regiões fora da tela continuam acessíveis por arraste. | RF02 |
| CA03 | Selecionar Brasil destaca seu território, abre o cartão com bandeira e Brasília e enquadra a região; selecionar Japão substitui cartão e destaque. Clicar no oceano limpa seleção/cartão; arrastar ou dar zoom preserva a seleção. | RF03–RF05 |
| CA04 | Buscar “japao” encontra Japão; aliases cadastrados funcionam; texto inexistente mostra ausência de resultados; setas e Enter permitem escolher, Escape fecha as sugestões. | RF06, RNF02 |
| CA05 | Em navegador compatível, acionar microfone e falar “Brasil” apresenta resultado selecionável. Negação de permissão, silêncio, cancelamento, erro e ausência de suporte têm feedback e preservam a busca textual. | RF07, RNF05–RNF06 |
| CA06 | Acionar pronúncia fala o nome em pt-BR quando há voz adequada; sem voz adequada, apresenta indisponibilidade. Cliques repetidos não acumulam uma fila de falas. | RF08, RF10 |
| CA07 | Um hino verificado toca, pausa e reinicia; falha de mídia ou mídia ausente tem feedback. Trocar de país, fechar cartão ou iniciar outro áudio interrompe o anterior. | RF09–RF10 |
| CA08 | Cartão funciona por teclado; fechar devolve foco ao acionador lógico. Com movimento reduzido, todas as ações essenciais continuam funcionando. | RF04, RNF02–RNF03 |
| CA09 | Falha no carregamento inicial tem mensagem e nova tentativa; erro no hino não impede selecionar outro país. | RF09, RF11 |
| CA10 | Nenhum hino é baixado antes de solicitação. Catálogo não tem IDs duplicados, referências quebradas ou países sem estado explícito de mídia. Fontes e créditos ficam acessíveis. | RF12, RNF04, RNF07 |
| CA11 | Ilhas pequenas continuam acessíveis por busca; países com várias capitais, territórios descontínuos e geometrias que cruzam a borda não quebram seleção ou enquadramento. | RF04–RF06 |
| CA12 | Em tela de toque, abrir país, ouvir nome, tocar/pausar hino e voltar ao mundo são possíveis por ícones visíveis, sem digitar, hover ou menus aninhados. Controles e resultados atendem à área de toque de 56×56 px e separação de 8 px. | RNF09 |
| CA13 | Conferir paleta, tamanho-base de texto de 18 px e contraste de 4,5:1; destaque permanece identificável por contorno; busca mostra até três resultados por vez e permite alcançar os demais. Validar descoberta das ações com o responsável usando um roteiro adequado à faixa etária. | RNF09–RNF10 |
| CA14 | Revisão da árvore de componentes confirma os cinco níveis de Atomic Design, ausência de importações invertidas, lógica de domínio fora dos componentes visuais e contratos/estados documentados conforme components.md. | RNF11–RNF12 |
| CA15 | No build servido por HTTPS, instalar e abrir pela tela inicial em Android e iPhone compatíveis. Conferir nome, ícone e modo de exibição; sem prompt programático, a orientação manual está disponível; uso normal no navegador permanece funcional. | RF13, RNF13 |
| CA16 | Após confirmar preparação offline, fechar, desligar a rede e reabrir: mapa, seleção, bandeiras, capitais e busca textual funcionam. Hino e voz sem suporte/conexão exibem estado adequado. Cache limpo/incompleto não exibe prontidão falsa; retorno à rede permite recuperação. | RF14, RNF16 |
| CA17 | Com uma versão nova publicada, a versão aberta não recarrega sozinha. Adiar mantém uso e áudio; aplicar em momento seguro ativa a versão nova sem misturar arquivos de versões incompatíveis. | RF15, RNF16 |
| CA18 | Em celular real, busca com teclado aberto, toque, pinça, rolagem do painel, troca de orientação e retorno do segundo plano mantêm seleção coerente e controles acessíveis, respeitando barras/recortes; captura não fica ativa indevidamente. Validar no navegador e no modo instalado. | RNF01, RNF14–RNF15 |
| CA19 | Relatório registra tamanho transferido/cache frente ao orçamento definido, uso em rede lenta e fluidez de pan/zoom em celular intermediário. Emulação e inspeção de manifest/service worker não substituem evidência de instalação e uso em aparelhos reais. | RNF04, RNF17 |

## Escopo e conclusão

O catálogo inicial foi fechado na T02 em 195 países: 193 membros da ONU mais Palestina e Vaticano/Santa Sé, sem territórios dependentes como seleções na primeira versão. A lista e as correspondências estão em data-sources/catalog.json; a auditoria está em [sources.md](sources.md). Não presumir que a lista de geometrias é a lista completa de países.

Um protótipo pode validar o fluxo com uma amostra de países, mas não representa a entrega do catálogo mundial. A entrega exige reconciliar cada entrada do catálogo com nome, capital, bandeira, localização/geometria e estado do hino. Ausência de mídia deve ficar explícita; aceitar exceções de cobertura exige decisão registrada, sem substituir silenciosamente o requisito de hino reproduzível.

Ficam fora da primeira versão: login, favoritos, quizzes, rotas entre países, páginas individuais e globo 3D. Backend e serviço próprio de reconhecimento só entram se uma necessidade confirmada exigir.

## Decisão de cobertura T12 — 2026-11-03

O usuário aceitou explicitamente a indisponibilidade temporária do hino em AFG, BIH, BTN, CMR, COD, GNB, MKD, MNG, PRK, SLB, TGO e WSM. A entrega acordada inclui 195 países com mapa, bandeira, capital e pronúncia conforme suporte do aparelho; 183 têm hino local e os 12 listados mostram indisponibilidade. T12 concluída nesse escopo. A aceitação não se estende a novos países sem hino e não autoriza usar gravações sem licença confirmada.
