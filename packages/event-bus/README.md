# @nyx-os/event-bus

Pacote oficial de eventos do Nyx OS.

Ele define o contrato `NyxEventBus` e a implementação inicial `InMemoryEventBus`, usada pelo Runtime para comunicação desacoplada entre serviços.

## Escopo

- Assinatura de eventos com `on`.
- Assinatura única com `once`.
- Remoção de listeners com `off`.
- Emissão tipada com `emit`.
- Limpeza de listeners com `removeAllListeners`.

## Fora do escopo

- Persistência.
- Plugins.
- Scheduler.
- IA.
- WebSocket.
- Logs remotos.
