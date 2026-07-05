# @nyx-os/logger

Responsável pelo contrato centralizado de logging do Nyx OS.

Este package expõe:

- `NyxLogger`;
- `ConsoleLogger`;
- tipos de nível e contexto de log.

Serviços devem depender de `NyxLogger`, não de `console`.

A implementação atual escreve no console. Arquivos, telemetria, JSON estruturado, rotação e logs remotos ficam fora do escopo atual.
