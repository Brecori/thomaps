# Plano técnico — Atlas interativo

Status: fases 0 a 3 e T10/T11 da fase 4 implementadas. T12 concluída com catálogo revisado, 183 hinos e 12 exceções temporárias aceitas pelo usuário em 2026-11-03. Evidências em [phase-1-validation.md](phase-1-validation.md), [phase-2-validation.md](phase-2-validation.md), [phase-3-validation.md](phase-3-validation.md) e [phase-4-validation.md](phase-4-validation.md). Demais fases permanecem abertas.

## Arquitetura proposta

SPA estática e PWA mobile-first em React + TypeScript com Vite, Tailwind CSS pelo plugin oficial do Vite e GSAP com `@gsap/react`. Toda a interface segue Atomic Design conforme [arquitetura de componentes](components.md). Propor `vite-plugin-pwa` para manifest e service worker com Workbox. Fixar versões compatíveis e requisito de Node ao iniciar o projeto, registrando o lockfile.

Mapa plano implementado em SVG com `d3-geo`, projeção equiretangular retangular e fixa, `d3-selection` e `d3-zoom`. Dados locais em TopoJSON são decodificados por `topojson-client` e validados com Zod antes de renderizar. Dispensa provedor de tiles e preserva as geometrias de origem. D01 consolidada na fase 2.

React será dono dos elementos e do estado de seleção. D3 calculará geometrias e controlará a transformação do grupo do mapa. GSAP animará entrada/saída do cartão e transições visuais. Nenhum atributo terá dois controladores concorrentes: o zoom programático passa pelo mesmo controlador do zoom por gesto, inclusive quando interpolado por GSAP. Uma interação nova interrompe a transição em andamento.

Scroll movimenta o zoom do mapa; não há necessidade inicial de ScrollTrigger. Respeitar o scroll interno do cartão e das sugestões sem acionar zoom do mapa.

Estado local com hooks e, onde útil, reducer: país selecionado, consulta e sugestões, estados de mídia e voz. Evitar store global ou roteador até existir necessidade.

## Estrutura de implementação com Atomic Design

```text
src/
  app/                  # inicialização e providers necessários
  components/
    atoms/              # Button, Icon, Text, FlagImage, TextInput
    molecules/          # SearchField, CountryOption, AudioControls, ZoomControls
    organisms/          # WorldMap, CountrySearch, CountryDetails
    templates/          # AtlasTemplate: regiões e layout responsivo
    pages/              # AtlasPage: dados e coordenação da experiência
  hooks/                # adaptadores React: busca, voz, áudio e gestos
  services/             # acesso às APIs de voz, áudio e carregamento
  pwa/                  # registro, instalação, atualização e política de cache
  domain/               # tipos, busca normalizada, joins e projeção/enquadramento
  data/                 # catálogo normalizado e relações com geometrias
  styles/               # tokens semânticos e estilos globais/Tailwind
public/
  data/                 # geometrias otimizadas
  flags/                # bandeiras com origem registrada
  audio/                # gravações, caso hospedadas junto à aplicação
  icons/                # ícones PWA, maskable e Apple touch icon
specs/001-atlas-interativo/
```

Criar diretórios conforme surgirem arquivos reais. A classificação dos componentes e as regras de importação são obrigatórias; os exemplos de nomes podem ser refinados durante a implementação. Não criar uma segunda árvore de componentes por feature.

## Dados e mídias

- Geometrias: snapshot Natural Earth Admin 0 1:50m em data-sources/, com hash e origem registrados. O gerador de T05 produz TopoJSON quantizado a 100.000, com arcos compartilhados e 242 geometrias, sem remoção de ilhas. 195/195 países possuem join; 47 geometrias ficam como contexto. A ilustração estática da fase 1 foi substituída pelo motor interativo.
- Catálogo: snapshot local de mledoze/countries, sob ODbL-1.0, filtrado a 195 países. 195 entradas revisadas em pt-BR com Unicode CLDR, entidades de capital do Wikidata e notas para casos especiais; auditoria em data-sources/metadata-review.json. Fonte, licença e hashes em data-sources/manifest.json e [sources.md](sources.md). A aplicação não consulta uma API externa a cada seleção.
- Identidade: ID interno estável, códigos ISO quando existentes e tabela explícita de correspondência com IDs das geometrias. Não ligar dados por nome exibido.
- Bandeiras: Flagpedia/FlagCDN; 195 SVGs locais com integridade e origem em data-sources/phase-2-flags.json. As 195 foram conferidas por ISO, hash, decodificação no navegador e revisão visual em folhas de contato; a amostra original permanece em flag-audit.json. Não depende de emoji nem de requisição ao CDN durante uso.
- Hinos: 183 MP3s locais, com fonte, autoria/licença individual, hashes e duração em data-sources/anthems.json. As 12 exceções temporárias estão explícitas em coverage.md e foram aceitas pelo usuário em 2026-11-03. O antigo anthem-audit.json preserva a auditoria inicial da amostra.
- Mídias: hospedagem no mesmo domínio em public/audio/anthems, sem CORS/hotlink em runtime. MP3 a 96 kbit/s, estéreo, 44,1 kHz, sem cortes: 177,13 MiB totais, carregados individualmente por ação, fora do futuro precache. Downloads de preparação usam as versões MP3 oficiais do Commons; assets:anthems restaura apenas arquivos auditados, valida hashes e interrompe em erro/limitação.

Contrato implementado e validado com Zod em domain/atlas/schema.ts e domain/anthem.ts. Country tem ID/ISO, nome pt-BR, aliases, capitais/nota/rótulo opcional, bandeira, joins, ponto de foco e anthem. Anthem é uma união discriminada: disponível com src MP3 local, título, duração, autoria, página da fonte, licença/link e aviso de conversão; indisponível com motivo. A auditoria completa permanece fora do payload de runtime. loadAtlas prefixa bandeira e MP3 com BASE_URL e importa o validador em paralelo aos dados para dividir o bundle.

Validar tipos e conteúdo dos arquivos, IDs únicos, referências e cobertura. Geometrias decorativas sem entrada selecionável precisam de tratamento explícito. Enquadramento deve lidar com multipolígonos e antimeridiano; não usar apenas a caixa envolvente bruta de coordenadas.

Implementação de T05–T07: schema.ts valida unknown, incluindo TopoJSON, anéis decodificados, IDs e joins. loadAtlas usa AbortSignal; useAtlasData mantém loading/error/ready e nova tentativa. Países pequenos têm marcadores e escolha nativa pela ajuda. Geometrias de contexto não são selecionáveis; Austrália corresponde apenas a AUS, mantendo IOA/ATC como contexto.

O enquadramento usa a área medida entre busca, controles e painel. Países com ilhas nos dois lados da borda focam a ilha principal, sem mover o meridiano; países com territórios distantes focam a região principal e próxima ao ponto de foco, preservando o destaque de todas as suas geometrias. Pan/zoom alteram somente o grupo SVG, com zoom máximo de 32 e mínimo calculado para preencher toda a viewport, incluindo sob os overlays. Scroll, pinça e botões usam esse mesmo mínimo; o botão de afastar fica desabilitado no limite. O arraste para nas bordas. A visão inicial usa o zoom mínimo; telas estreitas exigem arraste para explorar o restante do mundo. Redimensionar reenquadra a seleção sem transição para evitar usar coordenadas da viewport anterior.

Nomes no mapa: domain/atlas/labels calcula uma área interna no componente principal de cada país, respeitando o recorte da projeção, ilhas e buracos. useMapLabels mede a caixa real do texto após renderização e carregamento das fontes e guarda proporções reutilizáveis. Nomes usam caixa alta, cinza médio e nenhum contorno; nomes longos usam até duas linhas. Cada evento de zoom atualiza diretamente tamanho/visibilidade no SVG, com fonte aparente de 10–18 px; texto e margem de respiro precisam caber na área interna. Não há medição de layout ou estado React por frame. A camada é decorativa e não intercepta interação. Referência: [streams geográficos do D3](https://d3js.org/d3-geo/stream).

## Voz e áudio

Reconhecimento: Web Speech API, detecção de `SpeechRecognition`/alternativa prefixada e idioma pt-BR. Iniciar somente por gesto do usuário, encerrar após resultado ou cancelamento e não manter microfone contínuo. Explicar que alguns navegadores processam o áudio por serviço remoto. Texto é o caminho alternativo para incompatibilidade ou erro. Implementado em T09: services/speechRecognition encapsula suporte e erros; useVoiceSearch mantém uma única sessão, ignora callbacks obsoletos, limita a operação a 20 segundos e cancela em pagehide/visibilitychange. Não há reinício automático nem persistência de áudio/transcrições. A exclusão com a pronúncia foi implementada em T10; o player foi integrado em T11.

Implementado em T08: domain/atlas/search normaliza e ordena nome/aliases; useCountrySearch coordena consulta, abertura e índice ativo. CountrySearch compõe SearchField e CountryOption em combobox/listbox, pagina em grupos de três e preserva foco ao chegar à última página. O cartão de boas-vindas e seu slot/estilos/medição foram removidos. Apenas a área livre entre busca, navegação e detalhes é medida.

Referências da implementação: [SpeechRecognition — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [erros de reconhecimento — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionErrorEvent/error) e [combobox — W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

Pronúncia: `speechSynthesis`, seleção de voz pt-BR e tratamento de carregamento assíncrono das vozes. Não prometer voz pt-BR em todo dispositivo; mostrar indisponibilidade se necessário. Se pronúncia universal for exigida, avaliar arquivos gravados ou serviço dedicado em decisão separada. Implementado em T10: services/speechSynthesis verifica suporte, seleciona exclusivamente pt-BR e prioriza localService; usePronunciation observa voiceschanged, reconsulta após 3 segundos de carregamento e controla uma única utterance com referência, cancelamento, eventos de início/fim/erro e limite de 15 segundos. Carregar vozes nunca dispara áudio. useAtlasAudio compõe reconhecimento e pronúncia na página, aplica exclusão em ambos os sentidos e expõe stopAll para seleção, fechamento, ajuda e retorno. useAnthem integra o player nesse mesmo ponto.

Referências de síntese: [getVoices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [cancel — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel) e [erros de síntese — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error).

Hino implementado em T11: um único elemento/controlador de áudio, carregamento sob demanda, tratamento de rejeição de `play()`, erro de rede e formatos incompatíveis. Estados: idle, loading, playing, paused, ended, error e unavailable. Uma solicitação nova invalida eventos pendentes da seleção anterior. O elemento nasce ao tocar; play() é síncrono no gesto com rejeição tratada. Espera limitada a 20 segundos; cancelamento, fim e erro permitem novas ações. Reiniciar volta a zero e toca por gesto. Pagehide/ocultação/desmontagem liberam a fonte, sem retomada automática. ProgressBar é um átomo nativo e MediaCredits uma molécula secundária.

Coordenar reprodução e escuta em um único fluxo: começar hino cancela fala; começar fala pausa hino; começar escuta interrompe ambos. Trocar país, fechar cartão ou desmontar encerra operações em andamento.

## Interface e acessibilidade

Atlas infantil claro, colorido e simples para até 5 anos: oceano azul, países em cores pastel mais definidas por continente, seleção em verde vivo, bandeiras reconhecíveis e tipografia ampla. Seleção combina cor e contorno. Tokens semânticos centralizam paleta, contraste, tamanho de toque, espaços e movimento. O mínimo de 56×56 px para controles, separação de 8 px, texto-base de 18 px e contraste textual de 4,5:1 são metas deste produto.

Priorizar toque e voz; microfone, ouvir nome e ouvir/pausar hino usam ícone com rótulo curto. Busca exibe até três sugestões por vez, com bandeiras e acesso explícito às demais. As geometrias pequenas continuam acessíveis por busca/zoom sem distorcer fronteiras para ampliar o alvo.

Cartão lateral no desktop com largura de 480 px e altura mínima de 620 px quando há espaço vertical; largura de 380 px em telas intermediárias. O limite de altura e a rolagem interna preservam o uso em janelas menores. Bandeira de 160×108 px no desktop amplo, 128×88 px em telas intermediárias e 112×76 px no celular, com object-fit contain para preservar a imagem inteira. O mobile mantém painel inferior. ResizeObserver reenquadra o país conforme a área real do cartão. Clicar no fundo do SVG sem data-country-id usa o mesmo fluxo de limpeza da visão inicial, sem forçar foco à busca; o gesto precisa passar pela proteção de clique após arraste/pinça. A busca permanece utilizável com o cartão aberto. Manter fluxo principal sem menus aninhados e tratar a apresentação de créditos/ajuda como conteúdo secundário. As mensagens principais usam linguagem infantil; informações sobre permissões e processamento remoto ficam acessíveis ao responsável.

Busca com padrão de combobox/listbox, navegação por setas e Enter, Escape e foco previsível. Países acessíveis pela busca mesmo quando sua área no mapa for pequena. Card como região não modal na proposta inicial; não prender foco sem necessidade. Estados anunciados e botões com nomes acessíveis.

GSAP usa escopo e limpeza via `useGSAP`; movimento reduzido via `matchMedia`. SVG com caminhos calculados quando dados/tamanho mudarem e transformação por referência durante gestos, sem atualização React por frame.

## Mobile como prioridade

Implementar layout primeiro em retrato a partir de 360 CSS px; conferir também 390×844, paisagem, tablet 768×1024 e desktop 1440×900. AtlasTemplate calcula as regiões úteis para busca, mapa e painel; o enquadramento do país considera esses espaços e suas mudanças.

Usar viewport dinâmica (`dvh` com fallback) e insets de área segura (`env(safe-area-inset-*)`), incluindo configuração apropriada de viewport. Reagir ao teclado virtual e ao redimensionamento sem redefinir seleção ou foco; usar VisualViewport somente se necessário após verificar os navegadores-alvo. Não depender apenas de 100vh.

Restringir manipulação de gestos e `touch-action` à superfície do mapa. Permitir scroll dos resultados/painel e não definir `user-scalable=no` ou `maximum-scale=1`. Botões oferecem alternativa a pinça e ao deslocamento/enquadramento; fechar painel não exige swipe.

Ao ir para segundo plano, encerrar escuta e pausar reprodução; ao voltar, sincronizar estado sem retomar áudio automaticamente. Verificar recuperação após suspensão pelo sistema e após troca de orientação. Não assumir que APIs de voz terão o mesmo suporte no navegador e no modo instalado.

## PWA, instalação e atualizações

Manifest com id estável, name/short_name, lang pt-BR, start_url/scope coerentes com a hospedagem, display standalone, cores de tema/fundo e ícones 192/512, incluindo variante maskable. Incluir Apple touch icon e testar o resultado instalado. Não travar a orientação.

Propor `vite-plugin-pwa` com registro do tipo `prompt` e integração React. O responsável acessa instalação/ajuda em uma área secundária. Usar evento de instalação quando disponível; caso contrário, oferecer instruções adequadas à plataforma, sem prometer prompt em todo navegador. Ocultar ação redundante no modo instalado.

O service worker novo aguarda aplicação explícita; não usar recarga automática durante exploração. Antes de aplicar atualização, interromper operações de voz/áudio de forma coordenada. Adiar mantém a versão atual consistente. Validar duas versões reais de produção, limpeza de caches antigos após ativação e fallback de navegação restrito ao escopo da aplicação, sem devolver HTML em requisições de mídia/dados.

### Política offline inicial proposta

| Recurso | Estratégia e limite de disponibilidade |
| --- | --- |
| HTML, JS, CSS, fontes e ícones essenciais | Precache versionado de recursos locais; offline após instalação completa do service worker/cache. Evitar fontes remotas obrigatórias. |
| Geometrias, catálogo e bandeiras de todo o catálogo aprovado | Incluir no conjunto essencial versionado e compatível com o código; otimizar arquivos e medir orçamento antes de fechar a configuração. |
| Busca por texto e seleção | Locais; funcionam sem rede quando os recursos essenciais estão preparados. |
| Hinos | Rede sob demanda, fora do precache e sem garantia offline na primeira versão. Não baixar catálogo completo de áudios nem adicionar cache ilimitado. |
| Pronúncia | Voz do sistema disponível no dispositivo; verificar voz local pt-BR e não prometer funcionamento offline universal. |
| Reconhecimento de voz | Depende do navegador/serviço; tratar falha de rede e manter mapa/busca textual acessíveis. |

Indicar prontidão offline apenas após verificar o conjunto essencial completo, não somente pela presença do service worker. Tratar falha de instalação, falta de espaço e perda/remoção do cache; não prometer persistência permanente do armazenamento. Não colocar gravações ou transcrições no cache.

T16 define orçamento mensurável de transferência/cache após medir a amostra e estimar o catálogo final; T17 aplica a política e T14 verifica o catálogo completo. Pacotes opcionais de hinos offline ficam fora desta versão e podem ser especificados depois.

Publicação precisa de HTTPS e configuração de cache HTTP compatível com atualização do manifest/service worker e assets versionados. Testes locais de service worker usam ambiente permitido pelo navegador; validação de instalação em aparelhos reais exige build acessível por HTTPS. O destino ainda será definido, sem iniciar deploy nesta etapa de planejamento.

## Verificação planejada

Manter uma suíte pequena, proporcional à aplicação:

- Quatro testes de navegador para os fluxos essenciais: seleção/fechamento, zoom/retorno ao mundo, recuperação de carregamento e uso por toque no celular.
- Seletores acessíveis e ações de usuário; evitar helpers de coordenadas, inspeção de atributos internos do SVG, matriz extensa de viewports e testes matemáticos de projeção.
- Integridade dos dados por `npm run check:catalog`; lint, tipos e build continuam como verificações de entrega.
- Conferência manual curta de arraste/pinça, hover, enquadramento, teclado, movimento reduzido e apresentação em desktop/celular. Voz, áudio, instalação, offline e atualização serão conferidos quando implementados, incluindo Android/iPhone reais.
- Ao adicionar funcionalidade, automatizar somente o fluxo principal se trouxer proteção útil. Não exigir nova suíte unitária ou cobertura exaustiva por padrão. Registrar o que foi conferido, distinguindo emulação de aparelho real e uso com criança/responsável.

## Decisões pendentes

| ID | Decisão | Proposta / próximo passo |
| --- | --- | --- |
| D01 | Definida em T05 | SVG/D3, projeção equiretangular fixa, dados TopoJSON locais e validação Zod; casos BRA/JPN/ZAF/MCO/FJI e territórios distantes verificados. |
| D02 | Definida para a primeira versão | 195 países no catálogo, territórios extras como contexto cartográfico; fronteiras da fonte e divergências registradas por ID. Ver sources.md. |
| D03 | Formato/fontes definidos em T11; exceções aceitas em T12 | MP3 local, proveniência e licença individual preservadas; amostra real reproduzida no Chrome. 183 gravações disponíveis; 12 exceções temporárias aceitas explicitamente pelo usuário em 2026-11-03, registradas no relatório e na auditoria. |
| D04 | Mídias locais definidas; destino de publicação pendente | public/audio no mesmo domínio; 177,13 MiB sob demanda, sem precache. Publicação HTTPS e cache HTTP dependem do destino, na T15; nenhum deploy executado. |
| D05 | Base visual definida em T04 | Cartão lateral desktop, painel inferior mobile e scroll interno, conferidos nos cinco tamanhos. Teclado real e áreas seguras em aparelhos ficam em T14. |
| D06 | Tokens definidos em T04; uso infantil pendente | Oceano claro, países em cores pastel por continente, seleção em verde vivo, texto escuro, ações laranja/roxo e ícones Lucide. Contraste medido; descoberta das ações com responsável fica em T14. |
| D07 | Orçamento PWA e dispositivos de referência | Medir recursos essenciais e fixar orçamento de transferência/cache na T16; registrar Android/iPhone de referência para a T14. |

Uma decisão pendente impede apenas as tarefas que dependem dela. Não declarar cobertura completa nem publicação enquanto esses resultados não existirem.

## Referências técnicas consultadas

- [Vite — início e templates React/TypeScript](https://vite.dev/guide/)
- [Tailwind — plugin Vite](https://tailwindcss.com/docs/installation/using-vite)
- [GSAP em React](https://gsap.com/resources/React/) e [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)
- [D3 — projeções](https://d3js.org/d3-geo) e [zoom](https://d3js.org/d3-zoom)
- [Natural Earth — dados e política de fronteiras](https://www.naturalearthdata.com/about/)
- [MDN — reconhecimento de voz e limitações](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [MDN — síntese de voz](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Wikimedia Commons — reutilização e créditos por arquivo](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)
- [Atomic Design — cinco níveis da metodologia](https://atomicdesign.bradfrost.com/chapter-2/)
- [W3C — tamanho dos alvos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) e [contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). O alvo de 56 px é uma decisão do produto, superior ao mínimo descrito nessa referência.
- [Vite PWA — integração React](https://vite-pwa-org.netlify.app/frameworks/react) e [atualização por confirmação](https://vite-pwa-org.netlify.app/guide/prompt-for-update)
- [MDN — instalação PWA e diferenças entre plataformas](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [Apple — adicionar app web à tela inicial do iPhone](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios)
- [MDN — unidades de viewport dinâmica](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)
