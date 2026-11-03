# Plano técnico — Atlas interativo

Status: fases 0 e 1 implementadas; decisões técnicas das demais fases permanecem como propostas onde indicado. Evidências em [phase-1-validation.md](phase-1-validation.md).

## Arquitetura proposta

SPA estática e PWA mobile-first em React + TypeScript com Vite, Tailwind CSS pelo plugin oficial do Vite e GSAP com `@gsap/react`. Toda a interface segue Atomic Design conforme [arquitetura de componentes](components.md). Propor `vite-plugin-pwa` para manifest e service worker com Workbox. Fixar versões compatíveis e requisito de Node ao iniciar o projeto, registrando o lockfile.

Para o mapa plano, propor SVG com `d3-geo` para projeção e caminhos e `d3-zoom` para gestos e transformação. Começar com projeção Equal Earth e verificar leitura, ilhas e enquadramento antes de consolidar. A escolha é adequada à proposta de atlas com países destacados e dispensa um provedor de tiles para esse desenho.

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

- Geometrias: snapshot Natural Earth Admin 0 1:50m em data-sources/, com hash e origem registrados. 195/195 entradas têm join; tamanho de alvo e enquadramento ainda exigem T05–T07. A ilustração estática da fase 1 é um arquivo derivado separado, não o motor interativo.
- Catálogo: snapshot local de mledoze/countries, sob ODbL-1.0, filtrado a 195 países. Amostra de cinco entradas revisada em português; a revisão editorial completa fica em T12. Fonte, licença e hashes em data-sources/manifest.json e [sources.md](sources.md). A aplicação não consulta uma API externa a cada seleção.
- Identidade: ID interno estável, códigos ISO quando existentes e tabela explícita de correspondência com IDs das geometrias. Não ligar dados por nome exibido.
- Bandeiras: Flagpedia/FlagCDN; cinco SVGs locais auditados por ISO alpha-2, origem e hashes em data-sources/flag-audit.json. Expandir em T12; não depender de emoji como representação principal.
- Hinos: cinco candidatos do Wikimedia Commons com páginas de origem e metadados auditados. Download retornou 403; decodificação, reprodução, revisão de distribuição e cobertura completa permanecem pendentes em T11/T12. Detalhes em data-sources/anthem-audit.json; nenhum candidato foi marcado como disponível no app.
- Mídias: avaliar hospedagem local versus armazenamento estático conforme tamanho e distribuição; testar reprodução no navegador e CORS quando remoto. Não depender de links temporários.

Contrato conceitual (ainda não implementado):

```ts
type AssetSource = {
  sourceUrl: string;
  attribution: string;
  license: string;
};

type Anthem =
  | { status: 'available'; title: string;
      sources: Array<{ src: string; mimeType: string }>;
      provenance: AssetSource }
  | { status: 'unavailable'; reason: string };

type Country = {
  id: string;
  iso2?: string;
  iso3?: string;
  namePtBr: string;
  aliases: string[];
  capitals: string[];
  capitalNote?: string;
  flag: { src: string; alt: string; provenance: AssetSource };
  mapFeatureIds: string[];
  focusPoint: [number, number]; // longitude, latitude
  anthem: Anthem;
  metadataSourceUrl: string;
  reviewedAt: string;
};
```

Validar tipos e conteúdo dos arquivos, IDs únicos, referências e cobertura. Geometrias decorativas sem entrada selecionável precisam de tratamento explícito. Enquadramento deve lidar com multipolígonos e antimeridiano; não usar apenas a caixa envolvente bruta de coordenadas.

## Voz e áudio

Reconhecimento: Web Speech API, detecção de `SpeechRecognition`/alternativa prefixada e idioma pt-BR. Iniciar somente por gesto do usuário, encerrar após resultado ou cancelamento e não manter microfone contínuo. Explicar que alguns navegadores processam o áudio por serviço remoto. Texto é o caminho alternativo para incompatibilidade ou erro.

Pronúncia: `speechSynthesis`, seleção de voz pt-BR e tratamento de carregamento assíncrono das vozes. Não prometer voz pt-BR em todo dispositivo; mostrar indisponibilidade se necessário. Se pronúncia universal for exigida, avaliar arquivos gravados ou serviço dedicado em decisão separada.

Hino: um único elemento/controlador de áudio, carregamento sob demanda, tratamento de rejeição de `play()`, erro de rede e formatos incompatíveis. Estados: idle, loading, playing, paused, ended, error e unavailable. Uma solicitação nova invalida eventos pendentes da seleção anterior.

Coordenar reprodução e escuta em um único fluxo: começar hino cancela fala; começar fala pausa hino; começar escuta interrompe ambos. Trocar país, fechar cartão ou desmontar encerra operações em andamento.

## Interface e acessibilidade

Atlas infantil claro, colorido e simples para até 5 anos: oceano azul, países com cores vivas, bandeiras reconhecíveis e tipografia ampla. Seleção combina cor e contorno. Tokens semânticos centralizam paleta, contraste, tamanho de toque, espaços e movimento. O mínimo de 56×56 px para controles, separação de 8 px, texto-base de 18 px e contraste textual de 4,5:1 são metas deste produto.

Priorizar toque e voz; microfone, ouvir nome e ouvir/pausar hino usam ícone com rótulo curto. Busca exibe até três sugestões por vez, com bandeiras e acesso explícito às demais. As geometrias pequenas continuam acessíveis por busca/zoom sem distorcer fronteiras para ampliar o alvo.

Usar cartão lateral no desktop e painel inferior no celular; refinar dimensões durante a validação visual. A busca permanece utilizável com o cartão aberto. Manter fluxo principal sem menus aninhados e tratar a apresentação de créditos/ajuda como conteúdo secundário. As mensagens principais usam linguagem infantil; informações sobre permissões e processamento remoto ficam acessíveis ao responsável.

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

- Verificações focadas: normalização e busca, integridade/joins do catálogo, enquadramento de casos geográficos difíceis e exclusão entre áudio/voz.
- Integração: seleção por mapa/busca e recuperação de erros. Simular APIs de voz para estados determinísticos.
- Navegador real: fluxo principal em Chromium, Firefox e WebKit; voz manual em navegadores/dispositivos que efetivamente ofereçam o recurso. Simulação não comprova reconhecimento nem voz pt-BR reais.
- Conferência visual em desktop/mobile, teclado, toque e movimento reduzido; validar memória/listeners ao trocar países repetidamente.
- Conferir alvos de toque, espaçamento, contraste, texto e reconhecimento das ações por ícones. Revisar um roteiro de exploração para até 5 anos com o responsável; registrar o que foi efetivamente observado, sem presumir validação com criança.
- Revisar dependências entre os níveis de Atomic Design, contratos, estados e exemplos dos componentes conforme components.md.
- Validar Chrome em Android e Safari em iPhone em aparelhos reais, registrando SO, navegador e versão; repetir o fluxo no modo instalado. Incluir retrato/paisagem, teclado, áreas seguras, suspensão/retorno e áudio/voz. Na ausência de aparelho, registrar a lacuna; emulação não equivale a essa validação.
- Exercitar instalação, primeira preparação online, reabertura offline, cache limpo/incompleto, rede lenta e atualização entre duas versões. Inspecionar manifest/service worker e tamanho dos caches no build de produção.
- Entrega: lint, checagem de tipos, verificações relevantes e build de produção, seguidos de smoke test do build servido. Registrar resultados nas tarefas.

## Decisões pendentes

| ID | Decisão | Proposta / próximo passo |
| --- | --- | --- |
| D01 | SVG/D3 e projeção definitiva | Validar proposta com geometrias representativas na T05. |
| D02 | Definida para a primeira versão | 195 países no catálogo, territórios extras como contexto cartográfico; fronteiras da fonte e divergências registradas por ID. Ver sources.md. |
| D03 | Encaminhada; reprodução e cobertura pendentes | Cinco candidatos Commons auditados documentalmente; download 403. Revisar distribuição e testar reprodução em T11, expandir em T12. |
| D04 | Distribuição das mídias e publicação | Escolher após medir tamanho e reprodução; destino de deploy ainda não definido. |
| D05 | Base visual definida em T04 | Cartão lateral desktop, painel inferior mobile e scroll interno, conferidos nos cinco tamanhos. Teclado real e áreas seguras em aparelhos ficam em T14. |
| D06 | Tokens definidos em T04; uso infantil pendente | Oceano claro, países coloridos, texto escuro, ações laranja/roxo e ícones Lucide. Contraste medido; descoberta das ações com responsável fica em T14. |
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
