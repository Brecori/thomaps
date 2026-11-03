# Especificação — Atlas interativo

Status: escopo das fases 0 e 1 consolidado e executado por solicitação do usuário. Requisitos das fases seguintes permanecem como alvo de implementação. Data: 2026-11-02.

## Objetivo

Permitir que uma criança de até 5 anos explore o mundo em uma única página: selecionar um país no mapa ou pela busca e descobrir sua bandeira, capital, pronúncia do nome e hino. O fluxo principal deve funcionar sem exigir leitura autônoma.

## Decisões confirmadas com o usuário

- React com Vite, Tailwind CSS e GSAP.
- Mapa plano, estilo atlas, com interface clara, simples e cores chamativas para uma criança de até 5 anos.
- Atomic Design em toda a interface, com componentes bem separados e responsabilidades documentadas.
- PWA instalável, com experiência mobile como prioridade e validação em Android e iPhone.
- Mapa ocupa toda a tela; scroll aproxima/afasta e arraste desloca.
- Busca no topo, com entrada por texto e por voz.
- Nome do país reproduzível em português do Brasil.
- País selecionado em evidência, com container de informações e hino reproduzível.
- SDD em arquivos Markdown no repositório.

## Experiência proposta

Ao abrir, a criança vê o mapa colorido e a barra de pesquisa flutuante, com microfone em evidência. Controles grandes de zoom e de retorno à visão mundial ficam sobre o mapa. Não há seções adicionais abaixo da tela.

Selecionar um país destaca seu território e enquadra a região sem esconder o conteúdo atrás do cartão. O cartão flutua sobre o mapa no desktop; no celular, será um painel inferior que deixa parte do mapa visível. Bandeira, nome, capital, botão de pronúncia e controles do hino aparecem apenas após a seleção. Fechar o painel sempre tem botão visível; arrastar não é obrigatório para fechá-lo.

A busca mostra sugestões. Texto digitado e transcrição de voz passam pela mesma busca; escolher um resultado produz a mesma seleção que clicar no mapa. Nenhum áudio toca automaticamente.

## Experiência mobile e PWA

Projetar primeiro para celular em retrato, preservando uso em paisagem, tablet e desktop. Busca e controles respeitam recortes, barras do sistema e teclado virtual. O mapa mantém pan com um dedo e zoom com pinça; botões oferecem alternativa aos gestos. A interação com o mapa não impede rolagem do cartão nem ampliação acessível do restante da interface.

O responsável pode instalar o app na tela inicial por um acesso secundário, sem interromper a exploração da criança. O fluxo respeita as opções do navegador e orienta a instalação manual quando necessário. A versão instalada usa janela própria onde houver suporte.

Proposta offline inicial: depois de uma visita online com preparação completa do cache, abrir o app, explorar o mapa, selecionar países, ver bandeiras/capitais e pesquisar por texto funciona sem internet. Não prometer primeira abertura offline, permanência ilimitada do cache nem hinos/voz sempre disponíveis offline. Hinos exigem conexão nesta versão; pronúncia usa voz local quando disponível, e busca por voz depende do reconhecimento do navegador. Essas limitações terão mensagens simples e alternativa funcional.

Atualizações são oferecidas discretamente ao responsável e aplicadas em momento escolhido, sem recarregar automaticamente durante exploração, reprodução ou captura de voz.

## Diretrizes para até 5 anos

- Exploração direta por toque e busca por voz; digitação continua disponível. Nenhuma ação essencial depende de hover, atalho ou instrução longa.
- Fundo claro, oceano azul e países com cores vivas e contornos legíveis. As cores do mapa são decorativas, sem significado político; seleção também usa contorno para se distinguir da paleta.
- Ícones familiares acompanhados de rótulos curtos: “Falar”, “Ouvir nome”, “Ouvir hino”, “Pausar” e “Ver o mundo”. O desenho do ícone precisa permitir reconhecer a ação sem ler o rótulo.
- Botões e linhas de resultado com área de toque mínima de 56×56 CSS px e pelo menos 8 px entre ações independentes. Essa é uma meta do produto; os polígonos geográficos mantêm sua forma, com busca e zoom como alternativas para países pequenos.
- Texto de interface com tamanho-base de pelo menos 18 CSS px, títulos maiores e contraste mínimo de 4,5:1 para os textos. Bandeiras mantêm suas cores originais.
- Resultados de busca com bandeira e nome; mostrar até três por vez, com acesso claro aos demais. O cartão apresenta bandeira, nome e capital antes das ações de áudio.
- Instruções de uma frase, como “Toque em um país”. Feedback amigável: “Estou ouvindo” ou “Vamos tentar de novo?”. Detalhes técnicos de permissão e fontes ficam em ajuda secundária para o responsável.
- Animações curtas, acionadas pela interação, sem movimento decorativo contínuo. A pessoa pode interromper a transição ao tocar ou mover o mapa.

## Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF01 | Exibir mapa-múndi plano interativo ocupando a área útil da tela. |
| RF02 | Permitir zoom por scroll, gesto de pinça e botões; permitir deslocamento por arraste e retorno à visão mundial. Limitar zoom e deslocamento para não perder o mapa. |
| RF03 | Selecionar um país por clique/toque, destacando-o com preenchimento e contorno. Manter apenas um país selecionado e distinguir hover de seleção. |
| RF04 | Mostrar cartão com bandeira, nome em português, capital ou capitais e controles de áudio. Permitir fechar, limpar o destaque e selecionar outro país. |
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
| RNF10 | Usar paleta viva sobre base clara, contornos legíveis e contraste dos textos de pelo menos 4,5:1. Seleção e estados não podem depender somente da cor. |
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
| CA02 | Scroll, arraste, pinça e botões alteram a visão dentro dos limites; arrastar não seleciona um país por engano; restaurar mostra o mundo. | RF02 |
| CA03 | Selecionar Brasil destaca seu território, abre o cartão com bandeira e Brasília e enquadra a região; selecionar Japão substitui cartão e destaque. | RF03–RF05 |
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
