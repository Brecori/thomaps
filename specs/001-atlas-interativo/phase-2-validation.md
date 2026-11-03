# Evidências — fase 2, T05–T07

Data: 2026-11-02. Escopo autorizado: mapa, navegação e seleção até T07.

## Entrega

- **T05:** catálogo e TopoJSON locais, validação de unknown com Zod, coordenadas/anéis, IDs e joins verificados antes de renderizar. Mantidas as 242 geometrias: 195 selecionáveis e 47 de contexto. Corrigido o join de AUS para excluir IOA/ATC. Carregamento, erro HTTP, dados inválidos e nova tentativa implementados com cancelamento de solicitações obsoletas.
- **T06:** SVG/D3 com scroll, pinça, arraste, limites e botões. Transformação aplicada diretamente no grupo SVG; GSAP interpola pelo mesmo controlador. Gestos não selecionam acidentalmente. Zoom máximo de 32 e mínimo responsivo para preencher a viewport; o pan para nas bordas retangulares sem revelar espaço vazio. Scroll do cartão não alcança o SVG.
- **T07:** seleção única, destaque com preenchimento/contorno, cartão real, 195 bandeiras locais e capital/capitais. Países pequenos têm marcadores e lista nativa na ajuda. Escape, fechamento, retorno de foco e retorno ao mundo funcionam. Áudio segue desabilitado.
- **Enquadramento:** área livre medida entre busca, controles e painel. A projeção equiretangular mantém o atlas retangular e fixo. Fiji foca a ilha principal sem mover o meridiano; França usa a região principal para evitar caixa envolvente dominada por territórios distantes. Todas as geometrias do país continuam destacadas. Redimensionar preserva seleção e reenquadra imediatamente.
- **Arquitetura:** 17 componentes Atomic Design com contratos locais; domínio sem React/DOM, carregamento em serviços, estado/gestos em hooks e cores em tokens compartilhados. Removidos o mapa ilustrado e os dados fixos de exemplo da fase 1.

## Verificações

Ambiente: Linux, Node 24.16.0, npm 11.13.0, Chrome 156.0.8078.79 headless e Playwright 1.64.1.

| Verificação | Evidência |
| --- | --- |
| Lint e tipos | `npm run lint` e `npm run typecheck`, sem erros. |
| Integridade | `npm run check:catalog`: 195 países, 242 geometrias, 195 bandeiras locais, hashes dos snapshots e arquivos gerados. Nenhum hino anunciado como disponível. |
| Build | `npm run build`: produção gerada com sucesso. |
| Navegador | `npm run test:layout`: quatro testes essenciais — selecionar/fechar país, zoom/retorno ao mundo, recuperação de erro e toque no celular emulado. |
| Dependências | `npm audit --omit=dev` repetido: zero avisos nas dependências de produção. A instalação mantém 12 avisos moderados de desenvolvimento já registrados na fase 1. |

A pedido do usuário, a suíte foi reduzida a um único arquivo, tests/layout.spec.ts, com ações de usuário e seletores acessíveis. Foram removidos os helpers de coordenadas, os eventos CDP de gestos, as inspeções internas do SVG, a matriz de tamanhos e a suíte unitária de geometria. O comando test:unit foi removido.

Os 15 cenários de navegador e cinco casos unitários anteriores foram executados durante a implementação, mas não fazem parte da rotina atual. Gestos, hover, enquadramento e aparência continuam como conferências manuais; a integridade do catálogo permanece em check:catalog. O teste mobile atual usa toque nativo do Playwright em emulação, sem assumir validação em aparelho físico.

## Dados e tamanho

`npm run assets:map` gera dados com arcos compartilhados e quantização 100.000, sem simplificação que remova ilhas. O manifesto registra tamanho e SHA-256. Medições desta entrega:

- Catálogo: 50.322 bytes; 12.461 bytes ao comprimir com gzip localmente.
- TopoJSON: 755.610 bytes; 231.246 bytes ao comprimir com gzip localmente.
- 195 bandeiras: 2.848.351 bytes em disco; cada cartão carrega sua imagem quando necessário.

Gzip local é uma medição, não uma afirmação sobre a configuração do futuro servidor. Orçamento de transferência/cache e preparação offline permanecem em T16/T17.

## Limites e próximos passos

- T08/T09: busca textual, sugestões e reconhecimento de voz. A lista da ajuda é somente uma alternativa nativa de seleção.
- T10/T11: pronúncia, player e coordenação de áudio. Os cinco hinos candidatos da auditoria inicial continuam sem download/reprodução confirmados.
- T12: revisão editorial integral dos países e bandeiras e expansão/liberação dos hinos. Ter arquivos locais não conclui essa tarefa.
- T13: polimento adicional de animações. A transição de enquadramento necessária a T07 já está implementada.
- T14: Android/iPhone físicos, teclado virtual real, leitor de tela e uso com responsável/criança; ainda não executados.
- T16/T17: PWA instalável, service worker, offline e atualização; não implementados nesta fase.

CA02, CA03 e a parcela de mapa de CA08/CA09/CA11 foram exercitados nesta entrega. Os critérios dependentes de busca, áudio, dispositivos físicos e PWA não foram declarados concluídos. Não houve publicação.

## Correção de contornos de hover

A borda aplicada no próprio polígono era parcialmente encoberta por preenchimentos/bordas desenhados depois, variando a espessura aparente. Hover, foco e seleção agora possuem camada decorativa de contornos após os preenchimentos, sem interceptar eventos. A conferência visual mostrou traço contínuo, e o cenário de regressão da implementação confirmou seleção preservada e fronteiras interativas. Na suíte simplificada, a aparência do hover fica para conferência manual.

## Mapa retangular e navegação com limites

A pedido do usuário, a projeção foi trocada para equiretangular fixa. As bordas do atlas são retas; selecionar um país não muda o meridiano. O arraste para nas bordas. O afastamento agora para no mínimo necessário para preencher a tela; o botão de afastar desabilita nesse limite. Em telas estreitas, a visão inicial exige arraste para explorar outras regiões. Mantidos zoom, pinça, seleção e contornos.

Lint, tipos pelo build, formatação e build passaram. Os quatro testes essenciais passaram novamente (10,7 s), incluindo afastar até o botão desabilitar. Conferidos visualmente o mapa mundial e o limite de arraste no desktop, o zoom, o foco de Fiji junto à borda e o mapa/cartão do Brasil em celular emulado de 390×844. Uma conferência adicional com scroll confirmou o limite de afastamento, a cobertura integral da viewport e a seleção do Brasil em 1440×900 e 390×844. Os servidores temporários de verificação foram encerrados.

## Paleta dos países em cores pastel por continente

A pedido do usuário, países e geometrias de contexto usam cores pastel mais definidas por continente; o país selecionado recebe verde vivo e contorno escuro. Hover e marcadores comuns também usam um tom neutro suave; foco por teclado permanece visível e bandeiras preservam as cores originais. Cada continente usa um único token de cor pastel; geometrias de contexto seguem a cor do continente e regiões sem continente usam um tom neutro.

Lint, tipos pelo build, formatação e build passaram. Conferidas visualmente a visão em cores pastel por continente e a seleção do Brasil no desktop (1440×900) e no celular emulado (390×844), incluindo fechamento do cartão. Nenhum teste novo foi adicionado para esta alteração visual. O servidor temporário foi encerrado.

## Nomes dos países no mapa

Ajuste de 2026-11-03: nomes em português no centro visual de uma área interna do território principal. A geometria projetada respeita recorte, ilhas e buracos; a distância às bordas define uma área segura. Nomes longos usam até duas linhas. A caixa real do texto é medida após renderizar e carregar fontes; texto e contorno precisam caber nessa área no zoom atual.

A fonte aparente varia de 14 a 18 CSS px, com contorno de 3 px. Rótulos sem espaço ficam ocultos e podem aparecer ao ampliar. A camada não recebe eventos nem repete os nomes acessíveis dos polígonos. Cálculo geográfico e medição de texto são reutilizados; durante zoom apenas estilos/atributos SVG são atualizados, sem leitura de layout ou estado React por frame.

Lint, build com tipos e formatação passaram. Os nove testes existentes passaram novamente (24,4 s), sem acrescentar uma suíte para detalhes visuais. Conferidos desktop 1440×900 e celular emulado 390×844 na visão inicial, seleção do Brasil e aproximação adicional; Mônaco permaneceu sem rótulo mesmo selecionado. Uma conferência temporária das caixas/fontes dos nomes exibidos confirmou o limite de fonte e o encaixe na área interna nos três níveis. Capturas revisadas; servidor temporário encerrado. A verificação em aparelho físico permanece em T14.

## Cartão ampliado e fechamento pelo fundo do mapa

Ajuste de 2026-11-03: cartão desktop com largura de 480 px e altura mínima de 620 px quando a viewport permite; telas intermediárias usam 380 px. Limite de altura e rolagem interna mantidos. Bandeiras de 160×108 px no desktop amplo, 128×88 px em telas intermediárias e 112×76 px no celular, preservando a imagem inteira com object-fit contain. O enquadramento continua medindo o cartão real.

Clique/toque no oceano ou fundo do SVG sem país selecionável limpa a seleção, interrompe captura/pronúncia, fecha o cartão e restaura a visão inicial sem focar programaticamente a busca. Clique no país atual preserva o cartão; outro país troca a seleção. O fechamento passa pela proteção existente contra clique após arraste/pinça. Overlays não acionam o fechamento do mapa.

Lint, build com tipos e formatação passaram. A suíte tem agora dez testes e passou em 24,7 s, incluindo um único cenário novo de clique no oceano. Conferência visual em 1440×900 e celular emulado 390×844: dimensões do cartão/bandeira, Brasil e nome longo da República Democrática do Congo, botão de fechar acessível, clique no mesmo/outro país, arraste no desktop e fechamento por clique/toque no oceano sem abrir foco na busca. Os servidores temporários foram encerrados. Gestos e teclado virtual em aparelhos físicos continuam na T14.

## Estilo dos nomes no mapa

Ajuste de 2026-11-03: rótulos em caixa alta, cinza escuro (#444444) e sem contorno, inclusive no país selecionado. Removida a atualização de espessura do contorno durante o zoom; preservada margem de respiro na medição. A caixa real considera as letras maiúsculas, mantendo ocultação quando o nome não cabe e fonte aparente de 14–18 px.

Lint, build com tipos e formatação passaram. Conferidos visualmente desktop/mobile emulado e encaixe das caixas na visão inicial, seleção do Brasil e aproximação adicional; país pequeno continuou sem rótulo. Nenhum teste novo foi adicionado para esta mudança de estilo. O servidor temporário foi encerrado.
