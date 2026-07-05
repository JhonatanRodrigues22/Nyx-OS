# @nyx-os/core

Responsável pelo núcleo central do Nyx OS.

Este package contém:

- `NyxRuntime`;
- `ServiceManager`;
- `BaseNyxService`;
- `LoggerService`;
- `ConfigService`;
- contratos de serviços;
- serviços de estado do runtime;
- serviços de dashboard.

O core deve permanecer independente de UI, banco, provedores externos, clientes específicos e projetos futuros.
