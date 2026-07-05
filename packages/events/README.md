# @nyx-os/events

Responsável pelo stream em memória de eventos recentes usado por snapshots e dashboard.

O Event Bus oficial de comunicação tipada do Runtime vive em `@nyx-os/event-bus`.

O Event Bus inicial é em memória e permite:

- emitir eventos;
- listar eventos recentes;
- assinar eventos por tipo;
- assinar todos os eventos com `*`;
- cancelar assinaturas.

Este pacote permanece por compatibilidade com a camada visual atual. Novas responsabilidades de lifecycle técnico devem usar `@nyx-os/event-bus`.
