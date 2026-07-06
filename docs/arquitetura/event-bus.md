# Event Bus

## Objetivo

O Event Bus oficial do Nyx OS permite que componentes do sistema comuniquem mudanças sem depender diretamente uns dos outros.

Ele é infraestrutura de Runtime. Não implementa Skills, IA, Automation, Observability ou integrações externas.

## Pacote

O contrato oficial vive em `@nyx-os/event-bus`.

Ele expõe:

- `NyxEventBus`;
- `InMemoryEventBus`;
- `createInMemoryEventBus`;
- tipos de eventos e payloads do Runtime.

## Contrato

O contrato público é:

```ts
interface NyxEventBus {
  on(event, listener)
  once(event, listener)
  off(event, listener)
  emit(event, payload?)
  removeAllListeners(event?)
}
```

O payload padrão de eventos internos segue uma estrutura pequena e extensível:

```ts
{
  timestamp,
  service,
  status,
  metadata
}
```

## Eventos Internos

O Runtime emite automaticamente:

- `runtime.started`;
- `runtime.stopped`;
- `runtime.failed`;
- `service.registered`;
- `service.started`;
- `service.stopped`;
- `service.failed`.
- `plugin.registered`;
- `plugin.initialized`;
- `plugin.disposed`;
- `plugin.unregistered`;
- `plugin.failed`.
- `scheduler.started`;
- `scheduler.stopped`;
- `scheduler.task.registered`;
- `scheduler.task.executed`;
- `scheduler.task.failed`;
- `scheduler.task.removed`.
- `memory.created`;
- `memory.updated`;
- `memory.deleted`;
- `memory.loaded`;
- `memory.saved`;
- `memory.search`.
- `capability.registered`;
- `capability.removed`;
- `capability.executed`;
- `capability.failed`.

Esses eventos descrevem lifecycle técnico e mudanças de infraestrutura. Eventos específicos de IA continuam fora do escopo atual.

## Ciclo

```text
NyxRuntime
  -> registra serviço
  -> emite service.registered

NyxRuntime.start()
  -> ServiceManager.startAll()
  -> service.started / service.failed
  -> runtime.started / runtime.failed

NyxRuntime.stop()
  -> ServiceManager.stopAll()
  -> service.stopped / service.failed
  -> runtime.stopped / runtime.failed
```

## Uso

Serviços podem receber o barramento pelo contexto:

```ts
setup(context) {
  context.events.on("service.started", (event) => {
    // reagir ao lifecycle sem acoplamento direto ao serviço emissor
  });
}
```

Clientes do Runtime também podem consultar o barramento:

```ts
const events = runtime.getEventBus();

events.once("runtime.started", (event) => {
  // runtime disponível
});
```

## Boas Práticas

- Eventos devem representar fatos já ocorridos.
- Payloads devem permanecer pequenos.
- Serviços devem depender do contrato `NyxEventBus`, não da implementação concreta.
- Eventos internos não devem carregar regra de produto.
- O Event Bus não substitui o State Service; eventos comunicam mudanças, estado representa a situação atual.

## Relação com `@nyx-os/events`

`@nyx-os/event-bus` é o barramento oficial de comunicação tipada.

`@nyx-os/events` permanece como stream em memória de eventos recentes usado pelo dashboard e por snapshots legados. Ele não deve receber novas responsabilidades de lifecycle do Runtime.
