# ConnectionStatus

Molécula de feedback do preparo offline. Recebe `readiness` (preparing, ready, incomplete, error, unavailable) e `online` como sinal de conectividade. Não consulta cache nem deduz prontidão apenas por navigator.onLine; o hook fornece o resultado real do SW.

Anuncia texto curto em role=status/aria-live polite. Em AppOptions, distingue preparo, conjunto completo, cache ausente/incompleto e endereço sem suporte. Exemplo: `<ConnectionStatus readiness={pwa.readiness} online={pwa.online} />`.
