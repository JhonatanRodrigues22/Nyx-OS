# ADR-0015: Event Bus Oficial Tipado

## Status

Aceita.

## Contexto

O Nyx OS precisa que Runtime, Service Manager e serviços internos comuniquem mudanças sem depender diretamente uns dos outros.

O projeto tinha um stream em memória para eventos recentes exibidos pelo dashboard, mas ele misturava emissão, histórico recente e formato visual de evento. Para o lifecycle técnico do Runtime, o projeto precisa de um contrato mais genérico e tipado.

## Decisão

- Criar `@nyx-os/event-bus` como pacote oficial de comunicação desacoplada.
- Definir o contrato `NyxEventBus`.
- Criar `InMemoryEventBus` como primeira implementação.
- Registrar o Event Bus automaticamente no `NyxRuntime`.
- Expor o barramento por `runtime.getEventBus()` e pelo contexto de serviços em `context.events`.
- Fazer o Runtime emitir eventos técnicos de lifecycle:
  - `runtime.started`;
  - `runtime.stopped`;
  - `runtime.failed`;
  - `service.registered`;
  - `service.started`;
  - `service.stopped`;
  - `service.failed`.
- Derivar snapshots e eventos recentes do dashboard a partir do Event Bus oficial, sem manter um segundo barramento de runtime.

## Alternativas Consideradas

- Evoluir o stream legado para assumir também o lifecycle tipado.
- Usar diretamente `EventEmitter` do Node.js.
- Adiar o Event Bus até a chegada de Plugins ou Scheduler.

## Consequências

- O Runtime passa a ter uma linguagem oficial de eventos técnicos.
- Serviços podem reagir ao lifecycle sem acoplamento direto.
- O dashboard atual não quebra, pois o stream legado continua existindo.
- O projeto mantém espaço para futuras implementações de Event Bus sem alterar consumidores.
- Persistência, WebSocket, eventos distribuídos, Plugins, Scheduler e IA permanecem fora do escopo atual.
