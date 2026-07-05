# Logging

## Objetivo

Definir uma linguagem única de logging para o Nyx OS.

O objetivo desta fase não é persistir logs em arquivo, banco ou serviço externo. O objetivo é impedir que serviços passem a depender diretamente de `console`.

## Contrato

O contrato central é `NyxLogger`, exposto por `@nyx-os/logger`.

Ele define os níveis:

- `trace`;
- `debug`;
- `info`;
- `warn`;
- `error`.

Serviços devem depender desse contrato, não de implementações concretas.

## Implementação Inicial

`ConsoleLogger` é a primeira implementação.

Ela escreve no console e serve como ponte mínima enquanto o sistema ainda não possui persistência, telemetria ou observabilidade avançada.

## Logger Service

`LoggerService` vive em `@nyx-os/core` porque é um serviço base do Runtime.

Ele:

- registra o logger no Runtime;
- expõe `NyxLogger` para o contexto de serviços;
- inicia antes de serviços que precisam registrar informações;
- não persiste logs;
- não conhece Dashboard, Memory, API, plugins ou Nyx Assistente.

## Princípio

Serviços não devem conhecer implementações concretas quando puderem depender de contratos.

Hoje:

```text
NyxLogger -> ConsoleLogger
```

No futuro, sem mudar os serviços consumidores:

```text
NyxLogger -> FileLogger
NyxLogger -> JsonLogger
NyxLogger -> TelemetryLogger
NyxLogger -> CloudLogger
```

## Fora do Escopo Atual

- Arquivo de log.
- SQLite.
- Dashboard de logs.
- Logs remotos.
- Rotação de logs.
- Telemetria.
- Formato JSON obrigatório.
