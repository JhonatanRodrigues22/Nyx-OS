# @nyx-os/state

Responsável pelo contrato central de estado do Runtime do Nyx OS.

Este package expõe:

- `NyxStateService`;
- `InMemoryNyxStateService`;
- tipos de estado do Runtime;
- tipos de estado de serviços.

O estado atual é em memória. Persistência, histórico, WebSocket, API e Dashboard ficam fora do escopo atual.
