# ADR-0014: Logging por Contrato

## Status

Aceita.

## Contexto

O Nyx OS terá cada vez mais pontos que precisam registrar eventos técnicos: Runtime, Config, Memory, APIs, Dashboard, Scheduler, plugins, Nyx Assistente e serviços futuros.

Se cada parte do sistema usar `console` diretamente, o projeto passa a depender de uma implementação concreta e perde consistência na forma de registrar informações.

## Decisão

- Criar o contrato `NyxLogger` em `@nyx-os/logger`.
- Criar `ConsoleLogger` como primeira implementação.
- Registrar `LoggerService` como serviço base do Runtime.
- Expor o logger pelo contexto de serviços.
- Serviços devem depender de `NyxLogger`, não de `console`.
- `ConfigService` deve usar logger via contexto quando precisar registrar informações.
- Arquivos, telemetria, logs remotos, JSON estruturado e rotação ficam fora do escopo atual.

## Alternativas Consideradas

- Usar `console.log`, `console.warn` e `console.error` diretamente.
- Colocar logging dentro de `@nyx-os/core`.
- Implementar arquivo de log desde já.

## Consequências

- O Runtime continua desacoplado de implementações concretas.
- Novas implementações como `FileLogger`, `JsonLogger`, `TelemetryLogger` ou `CloudLogger` poderão surgir sem alterar serviços consumidores.
- Serviços passam a falar a mesma linguagem de logging.
- A implementação inicial permanece simples e suficiente para o estágio atual.
