# Scheduler

## Objetivo

O Scheduler oficial do Nyx OS executa tarefas recorrentes e emite eventos técnicos de agendamento.

Ele é a primeira peça que move o sistema, mas ainda não implementa Automation, Memory, IA ou Skills. Essas capacidades poderão usar o Scheduler futuramente, mas não fazem parte desta Sprint.

## Pacote

O contrato oficial vive em `@nyx-os/scheduler`.

Ele expõe:

- `NyxScheduler`;
- `ScheduledTask`;
- `SchedulerManager`;
- snapshots de tarefas;
- estados do Scheduler e das tarefas.

## Contrato

```ts
interface NyxScheduler {
  register(task)
  unregister(id)
  start()
  stop()
  pause()
  resume()
  getTasks()
}
```

Uma tarefa segue o contrato:

```ts
interface ScheduledTask {
  id
  name
  interval
  enabled
  execute(context)
}
```

`interval` é expresso em milissegundos.

## Lifecycle

```text
register
  -> scheduler.task.registered

start
  -> scheduler.started
  -> tarefas habilitadas passam a ser agendadas

execute
  -> scheduler.task.executed
  -> scheduler.task.failed, se houver erro

pause
  -> timers são suspensos

resume
  -> timers são retomados

stop
  -> scheduler.stopped
  -> timers são removidos

unregister
  -> scheduler.task.removed
```

## Integração com Runtime

`NyxRuntime` expõe `runtime.getScheduler()`.

Durante `runtime.start()`, o Runtime:

1. Inicializa serviços.
2. Inicializa plugins.
3. Inicia o Scheduler.

Durante `runtime.stop()`, o Runtime:

1. Para o Scheduler.
2. Descarta plugins.
3. Encerra serviços.

Essa ordem permite que plugins registrem tarefas durante `initialize`.

## Integração com Plugins

Plugins recebem `context.scheduler` durante a inicialização.

Exemplo:

```ts
initialize(context) {
  context.scheduler.register({
    id: "example.task",
    name: "Example Task",
    interval: 30000,
    enabled: true,
    execute(taskContext) {
      taskContext.logger.info("Task executed")
    }
  })
}
```

## Heartbeat Plugin

O `HeartbeatPlugin` é um plugin interno mínimo.

Ele registra a tarefa `scheduler.heartbeat`, executada a cada 30 segundos, que apenas escreve um log simples. O Scheduler emite o evento de execução automaticamente.

Não há regra de negócio nesse plugin.

## Dashboard

O dashboard exibe:

- card do Scheduler;
- status atual;
- quantidade de tarefas;
- lista de tarefas registradas e seus estados.

## Fora do Escopo Atual

- Automation.
- Memory.
- IA.
- Skills.
- Persistência de tarefas.
- Cron avançado.
- Fila distribuída.
- Execução em múltiplos processos.
- Retentativas configuráveis.
- Backoff.
