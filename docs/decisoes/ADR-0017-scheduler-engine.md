# ADR-0017: Scheduler Engine Oficial

## Status

Aceita.

## Contexto

O Nyx OS precisa de uma base para executar tarefas recorrentes e disparar eventos agendados sem misturar essa responsabilidade com Automation, Memory, IA ou Plugins específicos.

Após Runtime, State Service, Event Bus e Plugin Framework, o projeto já possui contratos suficientes para introduzir um Scheduler genérico e observável.

## Decisão

- Criar `@nyx-os/scheduler` como pacote oficial de agendamento.
- Definir os contratos `NyxScheduler` e `ScheduledTask`.
- Criar `SchedulerManager` como primeira implementação em memória.
- Integrar o Scheduler ao `NyxRuntime` por `runtime.getScheduler()`.
- Disponibilizar `context.scheduler` para plugins.
- Emitir eventos oficiais:
  - `scheduler.started`;
  - `scheduler.stopped`;
  - `scheduler.task.registered`;
  - `scheduler.task.executed`;
  - `scheduler.task.failed`;
  - `scheduler.task.removed`.
- Criar `HeartbeatPlugin` apenas como validação arquitetural.

## Alternativas Consideradas

- Implementar automações diretamente.
- Usar timers soltos dentro de plugins.
- Adiar o Scheduler até existir Memory ou Automation.
- Implementar cron avançado desde o início.

## Consequências

- O Runtime ganha uma base oficial para tarefas recorrentes.
- Plugins podem registrar tarefas sem depender de timers próprios.
- O Event Bus passa a registrar lifecycle técnico de agendamento.
- O dashboard passa a mostrar a infraestrutura em execução.
- Persistência, automações reais, filas, cron avançado, Memory, IA e Skills permanecem fora do escopo atual.
