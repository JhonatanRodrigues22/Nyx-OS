# Sprint 24.5 - Dev Runtime Wiring

## Objetivo

Ligar o Local Gateway da Sprint 24 ao runtime server-side real usado pelo Nyx OS durante `npm run dev`.

## Decisao

O gateway permanece desabilitado por padrao.

Para First Boot com Nyx Local, habilitar:

```env
NYX_ENABLE_LOCAL_GATEWAY=true
NYX_LOCAL_GATEWAY_TOKEN=<token-compartilhado>
NYX_LOCAL_GATEWAY_PORT=4789
```

## Implementacao

- `apps/web/src/server/cockpitRuntime.ts` passa a habilitar `registerLocalGateway` via env.
- `/api/dev/snapshot` expoe o snapshot server-side do runtime compartilhado.
- `/dev` deixa de criar `NyxRuntime` no navegador e passa a consumir `/api/dev/snapshot`.
- O painel Nyx Local mostra enabled/disabled, instancias, heartbeat e capabilities.

## Fora do Escopo

- Sprint 25.
- Automacao de sistema operacional.
- Mudanca no protocolo 1.0.
- Alteracoes no Nyx Local.
- Superficie no `/cockpit`.
