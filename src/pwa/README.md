# PWA — T16/T17

VitePWA injectManifest gera manifest e `sw.js`; registro manual no hook usePwa, somente no build de produção em contexto seguro (HTTPS ou localhost). `npm run dev` não registra SW, evitando cache de código durante desenvolvimento. Não há reload automático ao detectar uma versão nova.

`sw.ts` usa Workbox com cache de essenciais por escopo e versão derivada do manifesto. Guarda HTML, JS/CSS, WOFF2, ícones, catálogo/mapa, licenças e as 195 bandeiras. Hinos, gravações/transcrições e arquivos de auditoria não entram no precache. Rotas de navegação são restritas à raiz/index do escopo; pedidos de dados/mídia não recebem HTML como fallback.

As URLs são revisionadas e cada essencial tem SHA-256/SRI. CHECK_OFFLINE confere todas as chaves reais do cache; presença de SW não basta. REPAIR_OFFLINE baixa novamente apenas arquivos ausentes, com integridade, e trata falhas de rede/quota. Isso impede reparar uma versão antiga com dados incompatíveis de uma publicação nova. O cliente confere ao abrir ajuda, voltar à página, mudar rede e a cada minuto visível. Não promete que o sistema conservará o armazenamento permanentemente.

APPLY_UPDATE só ativa uma versão após escolha do responsável. A página bloqueia o botão durante fala/hino/microfone/gesto e chama stopAll antes de aplicar. Com mais de uma janela no escopo, a ativação pede fechar as outras para evitar misturar versões. Ativação limpa somente caches antigos deste app/escopo. Controllerchange recarrega somente a janela que solicitou atualização; primeira instalação não recarrega a página. Verificação de atualização ocorre no registro, retorno à página e por ação na ajuda.

client.ts encapsula mensagens com prazo, prompt de instalação e detecção de modo instalado/ajuda por plataforma. protocol.ts compartilha tipos/validação entre página e SW; o SW tem tsconfig próprio com WebWorker, sem DOM/React. usePwa adapta os eventos ao React e remove listeners/timers ao desmontar. Mensagens têm limites de 10 s (consulta), 20 s (ativação) e 60 s (reparo); esses limites não foram testados exaustivamente.

Orçamento: até 6 MiB de essenciais por versão em CacheStorage, 3 MiB de transferência gzip incluindo SW, pico planejado de 16 MiB para duas versões e overhead. `npm run build` executa check:pwa e gera `dist/pwa-audit.json`. Baseline: aproximadamente 4,21 MiB essenciais / 1,52 MiB gzip com SW. Só compressão HTTP no servidor entrega a economia estimada.

Ícones vêm do favicon SVG, renderizado por Sharp corrigido: `npm run assets:icons`. Instalação real Android/iPhone depende do endereço HTTPS, navegador e ação do responsável; ainda será validada em aparelhos na T14. Não houve deploy nesta tarefa.
