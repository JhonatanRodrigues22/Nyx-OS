# Core Runtime

## Objetivo

O Core Runtime representa o estado inicial executavel do Nyx OS.

Nesta sprint, ele nao persiste dados e nao conecta banco real. Seu papel e estabelecer a separacao entre UI, configuracao, servicos, eventos e dados mockados.

## Componentes

- `@nyx-os/config`: configuracao central do sistema.
- `@nyx-os/events`: Event Bus em memoria.
- `@nyx-os/core`: runtime, status do sistema e servicos do dashboard.
- `apps/web`: interface visual que consome snapshots produzidos pelos servicos.

## Fluxo

```text
Dashboard UI -> DashboardService -> RuntimeService / SystemStatusService / EventService
```

A UI renderiza dados e dispara interacoes visuais. Ela nao deve concentrar regra de dominio nem acessar banco diretamente.

## Dados mockados

Dados mockados vivem nos services/providers de runtime e dashboard dentro de `packages/core`.

Componentes React recebem um snapshot pronto para renderizacao.

## Event Bus

O Event Bus inicial fica em memoria e permite:

- emitir eventos internos;
- listar eventos recentes;
- representar eventos como `runtime.started`, `module.ready` e `dashboard.loaded`.

Ele ainda nao e persistente, distribuido ou conectado a integracoes externas.

## O que ainda nao existe

- Autenticacao real.
- Banco real.
- Memoria persistente.
- IA real.
- Automacoes reais.
- Integracoes externas.
- Notificacoes reais.
- Captura de dados do computador.
