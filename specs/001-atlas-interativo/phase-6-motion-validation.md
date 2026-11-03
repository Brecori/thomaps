# Fase 6 — Movimento (T13)

Data: 2026-11-03. T13 concluída. T14 e T15 permanecem abertas, incluindo aparelhos reais, avaliação com o responsável e entrega/publicação.

## Implementação

As três regiões usam `useGSAP` de `@gsap/react` 2.1.2 com GSAP 3.15.0, já presentes no projeto. Registro do hook em App; sem nova dependência.

| Região | Movimento por interação | Ciclo de vida |
| --- | --- | --- |
| Cartão | Entrada de 260 ms com opacidade e deslocamento de 12 px lateral/18 px no painel inferior; saída de 140 ms. | Átomo AnimatedPanel com escopo, chave do conteúdo e revertOnUpdate. Atualizações de áudio/status não repetem a entrada. |
| País selecionado | Destaque único de 280 ms na opacidade/espessura do contorno ou marcador. | useCountryHighlight com escopo SVG e reversão ao trocar seleção. Sem deformação do território ou alteração de alvo. |
| Câmera | Interpolação de 440 ms a partir da posição atual. | useMapNavigation aplica cada passo exclusivamente pelo D3; novo comando/gesto cancela o tween anterior. |

Não há animação decorativa contínua. O wrapper do cartão não é transformado: a medição da área livre não acompanha a animação da superfície interna. Fechar limpa a seleção e interrompe o áudio imediatamente; o conteúdo visual retido por 140 ms fica inert, aria-hidden e sem eventos de ponteiro.

A interpolação da câmera usa `context.ignore` e cancelamento explícito no cleanup de useGSAP. Isso evita que o revert automático do objeto de coordenadas execute onUpdate com uma posição antiga. A posição do D3 permanece válida entre comandos e após um gesto. O filtro D3 também cancela movimento quando o gesto chega a um limite de zoom e não produz start/end.

Após navegação manual, uma mudança de altura do player/mensagem não restaura um enquadramento antigo. Novo comando ou mudança de viewport podem reenquadrar. Resize aplica o novo destino sem transição. Não há atualização React de coordenadas por frame; apenas status de início/fim.

`gsap.matchMedia` acompanha movimento reduzido durante o uso. Cartão/destaque passam ao estado final; a câmera conclui somente uma interpolação ainda ativa, sem recuperar um comando já interrompido por gesto. Preferência ativa desde a abertura mantém as ações imediatas. Mudança de breakpoint do cartão encerra o efeito sem repetir a entrada.

## Verificação

- `npm run lint`: passou.
- `npm run format:check`: passou.
- `npm run build`: TypeScript, Vite e auditoria PWA passaram; 213 essenciais, 195 bandeiras, nenhum hino no precache, aproximadamente 4,21 MiB de cache/1,52 MiB gzip com SW.
- `npm run test:layout`: **15 testes passaram em 24,7 s**, em cinco arquivos. Um cenário novo verifica seleção, troca, fechamento e retorno de foco com movimento reduzido; os fluxos existentes de busca, áudio e PWA continuam passando.
- `git diff --check`: passou.

Conferência adicional no Chrome local headless, servindo o build de produção, em desktop 1440×900 e mobile emulado 390×844, com alteração para 1366×768/844×390:

- Brasil → Japão → fechar → Fiji em intervalos menores que as transições: somente o conteúdo atual permanece; entrada/saída antigas são canceladas.
- Scroll e arraste durante comando de zoom: transformação permanece na posição resultante do gesto, sem retomada do destino anterior.
- Abrir o hino após navegação manual: a mudança no painel não restaura o enquadramento anterior.
- Ativar movimento reduzido durante a câmera: estado final aplicado; fechar remove o cartão imediatamente. Desativar a preferência não repete a transição antiga.
- Repetir seleções rápidas e mudar orientação com o cartão aberto: seleção preservada e estilos temporários de opacidade/transformação removidos ao concluir.
- Nenhum erro de página ou escopo GSAP. Capturas desktop/mobile conferidas. O SW foi bloqueado apenas nessa inspeção de movimento; os dois testes PWA continuam usando o SW real.

Esses resultados são de emulação e navegador local, sem afirmar desempenho, reconhecimento de voz ou instalação nativa em um telefone físico. Conferência física e descoberta das ações com a criança/responsável continuam na T14.

## Referências técnicas

- [GSAP em React e useGSAP](https://gsap.com/resources/React/).
- [matchMedia e limpeza por preferência](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
- [Context: cleanup e ignore](https://gsap.com/docs/v3/GSAP/gsap.context()/).
