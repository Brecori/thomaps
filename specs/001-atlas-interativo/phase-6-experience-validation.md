# T14 — Experiência infantil e mobile

Última revisão: **2026-11-05**. **T14 encerrada para esta entrega**, após correções técnicas e confirmação do usuário de que a interface está adequada no Samsung Galaxy S25+/Chrome (“agora está legal”). O usuário solicitou finalizar a fase 6. iPhone, instalação física por HTTPS, voz nativa e descoberta das ações com criança/responsável permanecem verificações não executadas, documentadas como limitações e acompanhamento posterior. Não se declara aceite físico desses fluxos. Ver [relatório final](phase-6-delivery-validation.md) para os checks e a publicação atuais. As seções abaixo preservam a cronologia e seus resultados históricos.

## Cartão cortado no S25+ / Chrome — 2026-11-05

O usuário informou corte no menu do país em **Samsung Galaxy S25+ usando Chrome**; versões do Android/Chrome e dimensões CSS não foram informadas. A investigação encontrou um erro de ancoragem: `100lvh` havia sido aplicado à camada que posiciona mapa, cartão e controles. Essa unidade considera as barras do navegador recolhidas, podendo exceder a área realmente visível. Isso é documentado em [MDN — viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) e [Chrome — visual/layout viewport](https://developer.chrome.com/blog/viewport-resize-behavior).

A reprodução automatizada confirmou o recorte antes da correção: com mapa de 844 px e VisualViewport reduzido para 744 px, o cartão ainda terminava em 844 px, ficando 100 px fora da área visível. A correção separa as camadas: mapa em `100lvh`, interface em `--visible-height` com fallback `100dvh`. useAtlasLayout mede o mapa separadamente e usa os limites visíveis ao calcular a área livre para o enquadramento. O teclado continua sem reduzir o tamanho do SVG durante a pesquisa.

Validação após a correção:

- **22/22 testes passaram em 53,6 s**, incluindo o novo caso de barras abertas e o caso de teclado preservando tamanho/câmera. Build/tipos/PWA, lint, formatação e diff passaram.
- Três cenários de Chrome mobile emulado, sem erros de página: mapa 390×844 com área visível de 744 px; 412×915 com área visível de 795 px; e paisagem 915×412 com área visível de 332 px. Cartão, pesquisa e navegação ficaram dentro da área visível; rolagem dos créditos manteve o fechamento alcançável. O SVG manteve a altura total nos três casos.
- As capturas de retrato e paisagem foram inspecionadas, com uma faixa identificando o espaço simulado das barras. [Resultados](evidence/t14/2026-11-05/visible-card-review.json). Esses tamanhos representam a diferença entre tela total e área visível; não são uma medição do S25+ do usuário. Após esta conferência, o usuário confirmou a correção no S25+/Chrome, conforme o aceite no início do relatório.

Esta seção substitui a afirmação anterior de que somente os resultados usam `--visible-height`; a medida agora posiciona toda a camada de interface, preservando a altura independente do mapa.

## Marcador gigante após fechar país pequeno — 2026-11-05

A reprodução com Mônaco isolou o contorno de foco: no zoom 32, o círculo ainda tinha raio SVG de 0,21875 e diâmetro visual de 14 px, mas o outline genérico de 3 px com offset de 4 px era ampliado pelo transform do grupo. Ao fechar o cartão e devolver foco ao marcador, o contorno podia ocupar grande parte da tela.

A correção remove o outline genérico dos marcadores e apresenta o foco por stroke de 4 px, usando o `vector-effect="non-scaling-stroke"` já aplicado ao círculo. O foco continua visível; raio, câmera e comportamento de desseleção permanecem preservados. A captura após a correção foi inspecionada em mobile emulado: Mônaco ficou com diâmetro de 14 px e uma borda de foco fina, mesmo no zoom 32.

Suíte completa: **21/21 passaram em 49,6 s**, incluindo regressão de seleção pelo marcador, fechamento com retorno de foco visível, câmera preservada, afastamento e nova seleção. Build/tipos/PWA, lint, formatação e diff passaram. A conferência foi local/emulada; as pendências físicas da T14 continuam abertas.

## Altura total do mapa com teclado sobreposto — 2026-11-05

O mapa passou a usar `100lvh`, com fallback `100vh`, sem depender de `visualViewport.height`. O teclado pode cobrir a parte inferior do mapa. `useViewportHeight` atualiza apenas `--visible-height` para limitar a rolagem dos resultados da pesquisa; a classificação de viewport compacta agora considera a altura de layout via media query.

Suíte completa: **20/20 passaram em 45,2 s**. O novo teste reduz a altura de `visualViewport` de 844 para 420 px por simulação, dispara resize e confirma que dimensões do SVG, transformação da câmera e país selecionado permanecem; a caixa de resultados cabe acima de 420 px. Restaurar a altura e fechar a busca também preservou a câmera. Build/tipos/PWA, lint, formatação e diff passaram. Esta é uma regressão automatizada do comportamento de resize; abertura de teclado nativo em Android/iPhone continua no roteiro físico.

## Pesquisa mobile sobre backdrop — 2026-11-05

A pesquisa compacta agora abre acima de um backdrop azul escuro a 15%, com desfoque de 1,5 px. Campo e resultados usam superfície branca opaca. O mapa, cartão e controles ficam inert enquanto o diálogo está aberto; Tab/Shift+Tab ficam na busca. Toque no fundo, X e Escape fecham a pesquisa e devolvem o foco à lupa após remover o bloqueio, preservando seleção e câmera. A busca permanente do desktop continua sem backdrop.

Suíte completa: **19/19 passaram em 48,2 s**. Depois do ajuste final do CSS, os dois fluxos mobile de pesquisa passaram novamente em **10,2 s**. Build/tipos/PWA, lint, formatação e diff passaram. Conferência visual em 360×800, 390×450 e 844×390 confirmou backdrop em toda a viewport, cor computada `rgba(32, 57, 75, 0.15)`, desfoque `blur(1.5px)`, interceptação dos toques ao fundo e seleção de resultado removendo o bloqueio. Desktop 1440×900 permaneceu sem backdrop. Nenhum erro de página ocorreu nesses quatro cenários locais; validação física continua pendente.

## Revisão de zoom — limites globais restaurados — 2026-11-05

O usuário pediu para desfazer a redução do limite mínimo durante a seleção. A viewport inteira volta a determinar zoom mínimo e limites de pan, incluindo a área sob os overlays. A área livre orienta somente o enquadramento do país: a câmera calcula a aproximação adicional para respeitar as bordas do mundo. Quando todo o território não cabe no mínimo global, prioriza seu centro, mantendo o máximo de 32. Desselecionar no mobile continua preservando a câmera.

- Suíte completa: **18/18 passaram em 39,7 s**. O teste de enquadramento verifica Canadá, Argentina, Noruega e Brasil, incluindo o mínimo global e as quatro bordas do mapa cobrindo a viewport após a seleção.
- Build/tipos/PWA, lint, formatação e diff passaram. Uma conferência do domínio validou **975 enquadramentos** (195 países × cinco viewports): coordenadas finitas, zoom dentro dos limites globais e cobertura da viewport. Isso verifica as invariantes da câmera, sem declarar que todo país cabe inteiro em uma tela estreita.
- Conferência adicional do Chrome: **12 seleções em cinco tamanhos** (360×800, 390×844, 844×390, 768×1024 e 1440×900), com Canadá, Argentina, Noruega, Brasil, Chile e Fiji distribuídos entre os cenários. As bordas cobriram a tela e afastar com país selecionado parou no mesmo mínimo inicial. As capturas de Canadá/Noruega/Argentina em 390×844 foram inspecionadas; países largos podem ultrapassar lateralmente a área visível quando o mínimo global impede mostrar o território inteiro.
- Evidência em [zoom-review.json](evidence/t14/2026-11-05/zoom-review.json). As evidências físicas permanecem pendentes.

## Correção das falhas da T14 — 2026-11-05

1. **Interrupção de áudio ao abrir a pesquisa:** o ramo de abertura da lupa chama `audio.stopAll()` antes de mostrar o campo. Isso encerra hino, pronúncia e captura pendentes, preservando o país selecionado. Fechar a pesquisa devolve o foco à lupa e não retoma a reprodução.
2. **Teste mobile alinhado à interface atual:** os controles de áudio ficam diretamente no cartão. O teste deixou de esperar os botões inexistentes `Sons do país`/`Fechar sons` e agora verifica seleção por toque, áudio disponível sem autoplay, avanço real do MP3, interrupção ao abrir a pesquisa, preservação da seleção e retorno de foco sem retomada automática. O teste fica em `tests/layout.spec.ts:254` e cobre também a falha encontrada na conferência complementar anterior.
3. **Contratos atualizados:** README, especificação, plano, inventário de componentes e READMEs de AtlasPage/CountryDetails/CountryAudio descrevem `FloatingSearch`, `mobileSearchOpen` e áudio no cartão. A lupa permanece no canto inferior esquerdo com visual e margens dos controles do mapa; em retrato, acompanha a altura do cartão. A preservação da câmera ao desselecionar no mobile continua documentada e testada.

Validação final no build de produção local, Chrome 156.0.8078.79/Linux:

- `npm run test:layout`: **18 passaram em 38,9 s**, sem falhas. Inclui câmera no mobile, seleção norte/sul, busca/teclado/voz simulada, pronúncia simulada, MP3 nativo, movimento reduzido e os dois testes PWA.
- `npm run build`, `npm run lint`, `npm run format:check`, `npm run check:catalog` e `git diff --check` passaram. O build inclui TypeScript e verificação PWA.
- PWA: **213 essenciais / 195 bandeiras**, nenhum hino no precache; **4.420.782 bytes de cache / 1.599.953 bytes gzip com SW** (4,22/1,53 MiB), dentro dos limites de 6/3 MiB.

Resumo verificável em [corrections.json](evidence/t14/2026-11-05/corrections.json). Os resultados e capturas anteriores foram preservados abaixo como histórico. Não houve nova conferência física, deploy, repetição de atualização A→B ou medição de rede lenta nesta correção.

## Revalidação antes das correções — 2026-11-05

Build de produção servido localmente em Linux, Chrome **156.0.8078.79**, com mobile emulado. Esta revisão confere o código atual após a correção que preserva a câmera ao desselecionar no mobile; não acrescenta validação em aparelho físico nem publicação.

### Resultados antes das correções

- `npm run build`, `npm run lint`, `npm run format:check` e `npm run check:catalog` passaram. O build inclui a checagem TypeScript e `check:pwa`. Catálogo: 195 países, 242 geometrias, 195 bandeiras, 183 hinos e as mesmas 12 exceções explícitas.
- `npm run test:layout`: **17 passaram e 1 falhou, em 44,5 s**. Passaram seleção/cartão, busca/aliases/teclado, voz e pronúncia simuladas, MP3 nativo, tratamento de erros, movimento reduzido e os dois testes PWA. O teste que falhou é `celular › abre e fecha o país por toque`, em `tests/layout.spec.ts:254`, ao procurar o botão `Sons do país` na linha 261.
- Os dois testes de regressão de câmera passaram: fechar o cartão ou tocar no oceano no mobile preserva exatamente a transformação SVG depois da saída do painel; `Ver o mundo` continua restaurando a visão geral. Escape também preservou a câmera na conferência complementar.
- Conferência complementar: **21 verificações passaram e 1 falhou**, registradas em [review.json](evidence/t14/2026-11-05/review.json). São verificações locais de UI/DOM e entrada de mouse/toque; não fazem parte dos 18 testes da suíte versionada.
- Em **360×800, 390×844, 844×390, 768×1024 e 1440×900**, não houve overflow da página. Fonte-base de 18 px e alvos dos botões renderizados de pelo menos 56×56 px; fechamento do cartão continuou alcançável após rolagem. Busca recebeu foco ao abrir no mobile; seleção por teclado e retorno de foco passaram. Em paisagem, o conteúdo longo do cartão exige rolagem interna.
- No mobile emulado, arraste e pinça via CDP alteraram a câmera sem desfazer a seleção; a seleção e o fechamento permaneceram disponíveis após mudar para paisagem. Canadá e Argentina ficaram entre os controles e o cartão. Em desktop, hover de um país vizinho mostrou o contorno sem trocar a seleção; arraste, scroll e movimento reduzido passaram. Rolagem do cartão não alterou a câmera. Nenhum erro de página foi registrado nas cinco viewports.
- Reprodução de MP3 por toque, pausa e reinício passaram no mobile emulado. Isso comprova reprodução no motor do Chrome headless, não audição em telefone. Reconhecimento e síntese da suíte continuam simulados; a indisponibilidade de voz pt-BR nativa foi exibida no ambiente local.
- Atomic Design: 26 componentes implementados, com README e exportação, distribuídos pelos cinco níveis. As restrições de importação passaram no ESLint. Há contratos documentais desatualizados sobre a interface de sons, detalhados abaixo.
- Orçamento PWA atual: **213 essenciais / 195 bandeiras**, nenhum hino no precache; **4.420.541 bytes de cache** e **1.599.936 bytes gzip com SW** (4,22/1,53 MiB), dentro dos limites de 6/3 MiB. Os testes atuais verificaram recuperação de cache incompleto, reabertura offline e instalação por evento simulado. A atualização real A→B e a medição de rede lenta do histórico abaixo não foram repetidas nesta revisão.

Capturas atuais conferidas: [360×800](evidence/t14/2026-11-05/360x800-country.png), [390×844](evidence/t14/2026-11-05/390x844-country.png), [844×390](evidence/t14/2026-11-05/844x390-country.png), [768×1024](evidence/t14/2026-11-05/768x1024-country.png) e [1440×900](evidence/t14/2026-11-05/1440x900-country.png).

### Falhas encontradas antes das correções

1. **Interface de sons divergente entre implementação, teste e contrato.** `AtlasPage` renderiza somente `FloatingSearch` nas ações compactas (`src/components/pages/AtlasPage/AtlasPage.tsx:185`) e fornece `CountryAudio` ao cartão em toda seleção (`:245`). Não existe botão `Sons do país` ou ação `Fechar sons` na implementação atual. O teste mobile espera ambos e espera que `Ouvir hino` fique inicialmente oculto. `spec.md`, `plan.md` e os READMEs de AtlasPage/CountryDetails/CountryAudio ainda descrevem `FloatingControls`, `mobilePanel` e sons recolhidos. É necessário reconciliar o comportamento pretendido, a implementação, esses contratos e o teste antes de declarar a suíte aprovada. O histórico de sons flutuantes abaixo não comprova o estado atual.
2. **Abrir a pesquisa não interrompe o hino.** No mobile emulado, foi reproduzido o hino da Nigéria, confirmado o andamento, testados pausa/reinício e aberta a lupa. O campo recebeu foco, mas `Pausar hino` continuou ativo durante a janela de verificação. O ramo que abre a pesquisa (`AtlasPage.tsx:191`) não chama `audio.stopAll()`, contrariando `spec.md:31`. O resultado está registrado como falha na conferência complementar.

### Condição histórica para concluir a T14

As duas falhas técnicas acima foram corrigidas e a suíte completa passou, conforme a seção de correção. Resta executar o roteiro físico: interface atual no Android identificado, iPhone/Safari, instalação e uso offline por HTTPS no telefone, voz/permissão nativas e observação com criança/responsável. Naquela revisão, zoom estava validado em emulação e T15/deploy ainda estavam pendentes. O aceite posterior e a publicação atual estão no relatório final da fase 6.

## Histórico da validação — 2026-11-03

Os resultados, medidas e capturas a seguir pertencem à conferência anterior. As afirmações sobre sons flutuantes e suíte inteiramente aprovada não descrevem o checkout revalidado em 2026-11-05.

## Ambiente e resultados

| Ambiente | Resultado e limite |
| --- | --- |
| Chrome 156.0.8078.79, Linux, build de produção local | Conferência em 360×800, 390×844, 844×390, 768×1024 e 1440×900. Sem overflow da página; busca, cartão, ajuda e fechamento utilizáveis. Não substitui Safari ou aparelho físico. |
| Mobile emulado, Chrome com toque | Pinça e arraste por entrada CDP preservaram a seleção. Scroll do painel não deu zoom no mapa; créditos e ajuda rolam internamente, com fechamento acessível. |
| Viewport compacta 390×450 | Busca por teclado, seleção do Japão e fechamento continuaram acessíveis. É uma simulação da área reduzida, sem afirmar comportamento de teclado nativo. |
| Android físico, pelo endereço HTTP local de desenvolvimento | O usuário relatou que os fluxos solicitados funcionaram, mas países ao norte/sul ficavam encobertos. Após a correção e recarga, confirmou “Ficou ok” ao conferir Canadá, Argentina e Noruega. Modelo, sistema e versão do navegador não foram informados nesta validação. |
| iPhone/Safari e PWA instalado em telefone | Não executados. Não há evidência de ícone/standalone, recortes, teclado, retomada ou fluidez no modo instalado. |
| Uso com criança/responsável | O roteiro foi apresentado; não houve relato específico sobre descoberta das ações ou necessidade de ajuda. Continua pendente. |

Capturas do build conferido: [mobile](evidence/t14/mobile.png) e [desktop](evidence/t14/desktop.png). São imagens do Chrome local/emulado.

## Correções realizadas

1. **País encoberto por busca/cartão:** os limites anteriores usavam a tela inteira mesmo com overlays. Com seleção, pan e zoom mínimo agora usam a área livre medida pelo layout; sem seleção, continuam usando a viewport inteira. O enquadramento calcula a translação já com o zoom mínimo aplicável. Conferidos Canadá, Argentina, Noruega, Chile e Fiji; ilhas distantes/antimeridiano continuam usando a região principal, sem tentar centralizar todos os fragmentos do país de uma vez. O usuário confirmou o resultado no Android.
2. **Fechar após rolar:** o botão do cartão agora permanece sticky também no desktop, com tamanho de 56×56 px e alinhamento à direita, inclusive após expandir os créditos e rolar até o fim.
3. **Contraste dos nomes:** o usuário escolheu atingir a meta de 4,5:1. O token mudou de #707070 para #444444, mantendo caixa alta e ausência de contorno. O contraste sobre a seleção passou de 2,33:1 para 4,59:1; sobre os seis continentes, ficou entre 5,13:1 e 6,59:1.

Um teste de regressão simples foi acrescentado: Canadá e Argentina devem permanecer entre a busca e o cartão no celular. Ele mede as caixas dos elementos acessíveis, sem reproduzir cálculos de projeção. A suíte permanece concentrada nos fluxos principais.

## Verificação técnica

- Suíte completa: **16 testes passaram em 28,2 s**, cobrindo seleção, toque, busca/teclado, falhas, voz simulada, pronúncia simulada, MP3 nativo, PWA e movimento reduzido. Após o último ajuste CSS do botão de fechar, os nove testes de layout passaram novamente em 28,1 s.
- Lint, formatação, tipos/build e integridade do catálogo passaram: 195 países, 242 geometrias, 195 bandeiras, 183 hinos e 12 exceções aceitas. Diff sem erros de whitespace.
- Os controles principais medidos têm alvos de pelo menos 56×56 px, fonte de 18 px e grupos com espaçamento de 8 px. Créditos/ajuda mantêm texto secundário menor; rótulos geográficos seguem a regra de 10–18 px conforme o zoom.
- Contraste dos pares principais: texto/superfície 12,01:1; texto secundário/superfície 5,90:1; texto do botão principal/fundo 6,56:1. Nomes dos países conforme os valores acima. Isso registra os pares medidos, sem declarar auditoria completa de acessibilidade.
- Trocas rápidas, saída/reentrada do cartão, interrupção da câmera por scroll/arraste, expansão do player após gesto, movimento reduzido alterado durante uso, orientação e limpeza GSAP passaram em desktop/mobile emulado. Hover permanece apenas um contorno decorativo, sem ser necessário para selecionar; foco por teclado e retorno ao fechar foram conferidos.
- Árvore Atomic Design revisada: 24 componentes nos cinco níveis, todos com implementação, exportação e README. As regras de direção de importações passaram no ESLint; domínio separado de React/DOM, APIs de áudio/voz/PWA em seus módulos. CA14 conferido.
- Reconhecimento e síntese da suíte são simulados. Reprodução de MP3 usa o motor nativo; isso verifica reprodução/andamento, não audição pelos alto-falantes de um telefone. Permissão, reconhecimento real e voz pt-BR local/offline ainda precisam da conferência física.

## PWA, rede lenta e atualização

O build atual mantém **213 essenciais/195 bandeiras**, sem hinos no precache: 4.416.563 bytes de conteúdo de cache e 1.598.999 bytes gzip incluindo SW, aproximadamente 4,21/1,52 MiB. Continua dentro dos limites de 6/3 MiB; gzip é a soma de arquivos comprimidos, sem cabeçalhos HTTP.

Dois builds reais locais A/B, diferenciados por conteúdo HTML, foram servidos pela mesma origem com o SW nativo do Chrome:

- Preparação completa em **46,451 s** com banda global simulada de 1,5 Mbps, atraso de 150 ms e respostas gzip; abaixo da meta de 60 s desse perfil.
- A versão A permaneceu aberta e reproduzindo o hino após B ficar disponível, sem recarga automática. Adiar preservou a seleção.
- Uma segunda janela impediu ativação; depois de fechá-la, aplicar por gesto recarregou uma vez, ativou B e removeu o cache antigo.
- A versão B reabriu sem rede, permitindo buscar Japão e mostrar Tóquio. Nenhum erro de página foi registrado.
- Os testes PWA da suíte também conferiram cache parcial, reparo, reabertura com bandeira antes não visitada e hino sem conexão. O evento de instalação é simulado; não comprova instalação no sistema operacional.

Essas medições são locais/emuladas. Não demonstram fluidez, consumo de armazenamento ou rede móvel em um celular intermediário. O HTTP pelo IP da rede local permite a conferência visual feita no Android; não conclui instalação/offline do PWA. Essa etapa precisa de um build acessível por HTTPS confiável no aparelho.

## Roteiro físico restante

Registrar aparelho, sistema, navegador/versão, URL, data e resultado. Usar o build de produção por HTTPS para a parte de PWA; nenhum deploy foi executado nesta tarefa.

1. Android/Chrome e iPhone/Safari: instalar pela ajuda/menu/Compartilhar conforme a plataforma; abrir pelo ícone e conferir nome, imagem e modo standalone.
2. Conferir busca com teclado, pinça, rolagem do cartão, fechamento, orientação, recortes/barras e ida/volta do segundo plano no navegador e no modo instalado. Incluir Canadá/Argentina e um microestado.
3. Ouvir o nome em pt-BR, tocar/pausar/reiniciar o hino e falar “Brasil” na busca; negar/cancelar o microfone e conferir que texto continua disponível. Trocar país e ir para segundo plano devem interromper o som/captura, sem retomar automaticamente.
4. Esperar prontidão, fechar, desligar rede e reabrir pelo ícone. Conferir mapa, busca, bandeira/capital de país ainda não visitado e feedback de funções que precisam de rede. Registrar voz local disponível ou indisponível.
5. Em homologação com duas publicações, conferir adiar/aplicar atualização e ausência de recarga automática, repetindo a verificação offline. Registrar fluidez em aparelho intermediário e rede lenta, sem transformar em uma matriz extensa.
6. Com o responsável presente, propor à criança: escolher um país, ouvir seu som e voltar ao mundo. Anotar quais ações reconheceu, onde precisou de ajuda e se houve toques acidentais; não pressupor leitura autônoma.

Para completar a evidência física após esta entrega, anexar os resultados restantes. Galaxy A54/Chrome e iPhone 12/Safari continuam referências planejadas, aceitando equivalentes identificados. Essa seção descreve a conferência histórica; a entrega atual está no relatório final da fase 6.

## Revisão — pesquisa e sons flutuantes no mobile

Após a conferência inicial, o usuário pediu para recolher pesquisa e áudio em botões flutuantes. Em celular/retrato e paisagem compacta, a lupa abre texto/voz; escolher um resultado recolhe a caixa. O cartão mantém bandeira/capital e abre controles/status/créditos somente pelo botão de sons. Fechar sons ou abrir pesquisa encerra reprodução, sem limpar a seleção. Abertura não toca áudio nem pede microfone automaticamente. X/Escape e os próprios botões recolhem as caixas, com retorno de foco. Os controles de áudio entram na área visível ao abrir, inclusive em paisagem.

FloatingControls e CountryAudio mantêm Atomic Design, agora com 26 componentes documentados. A página compõe os organismos por slots e continua usando um único coordenador de áudio. Busca e cartão usam AnimatedPanel/useGSAP; a medição ignora a busca recolhida e posiciona a navegação acima da altura real do cartão.

A suíte continua com 16 testes (30,8 s nesta revisão), com os casos mobile adaptados ao novo fluxo, incluindo abertura, reprodução e fechamento dos sons. Após o ajuste final de visibilidade em paisagem, os dois casos mobile passaram em 8,3 s. Build/tipos, lint e formatação passaram. No build atual, os mesmos 213 essenciais ocupam 4.421.033 bytes de cache e 1.599.975 bytes gzip com SW (4,22/1,53 MiB), dentro do orçamento.

Conferência adicional no Chrome em 360×800, 390×844, 844×390, 768×1024 e 1440×900: sem overflow ou erros de página, foco no campo ao abrir, fechamento automático após seleção, reprodução MP3 real, interrupção ao trocar de caixa e preservação do país. Os dois botões medem 56×56 px. Em 390×844, o cartão fechado mediu 217 px e o cartão com sons 430 px; em paisagem, 237/290 px. Desktop/tablet mantiveram busca e sons expostos.

Toques rápidos de abrir/fechar, cancelamento de voz ao fechar a busca, descarte de transcrição tardia, Escape, retorno de foco ao fechar país/sons e troca de breakpoint com pesquisa ativa também foram conferidos sem erros de página ou escopo GSAP.

Capturas desta revisão: [país e botões](evidence/t14/floating-country.png), [pesquisa aberta](evidence/t14/floating-search.png), [sons abertos](evidence/t14/floating-audio.png). O retorno Android registrado acima é anterior a esta mudança; a nova interface ainda precisa de conferência física, junto às demais pendências da T14.
