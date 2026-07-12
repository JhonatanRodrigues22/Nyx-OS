# Automation Engine

## Objetivo

O Automation Engine e o mecanismo oficial para registrar, descobrir e executar automacoes no Nyx OS.

Uma automacao conecta um trigger a uma acao. O trigger pode ser um evento do Event Bus oficial ou um horario recorrente executado pelo Scheduler. A acao deve chamar uma Tool existente.

Ele nao implementa IA, LLM, planejamento, agentes, UI de automacoes ou regras de negocio pre-configuradas.

## Package

O package oficial e `@nyx-os/automation`.

Ele contem:

- `Automation`;
- `AutomationTrigger`;
- `AutomationAction`;
- `AutomationRegistry`;
- `AutomationExecutor`;
- `AutomationManager`;
- historico em memoria das execucoes recentes;
- eventos `automation.*`;
- tipos publicos de automacao.

## Contrato

Cada Automation declara:

- `id`;
- `name`;
- `trigger`;
- `action`;
- `enabled`.

O trigger deve declarar exatamente uma condicao:

- `onEvent`: nome de evento do `@nyx-os/event-bus`;
- `onSchedule`: intervalo recorrente em string, convertido para o formato de intervalo usado pelo Scheduler.

A action deve declarar:

- `toolId`;
- `input` opcional.

Toda Automation deve apontar para uma Tool existente. O `AutomationRegistry` recusa automacoes orfas no registro.

## Operacoes

O contrato `NyxAutomationManager` permite:

- registrar automacao;
- remover automacao;
- buscar por ID;
- listar automacoes;
- habilitar automacao;
- desabilitar automacao;
- executar automacoes por evento;
- executar automacoes por schedule;
- consultar historico recente de execucoes.

## Execucao

O `AutomationExecutor` nao executa regra de negocio diretamente.

Ele invoca `tools.execute(toolId, input)` no Tool Calling Engine e registra o resultado no historico em memoria.

Falhas da Tool tambem sao registradas como falhas de automacao e emitidas pelo Event Bus oficial.

## Relacao Com Event Bus

Triggers por evento usam o `@nyx-os/event-bus`.

O Automation Manager assina eventos oficiais e dispara somente as automacoes habilitadas cujo `trigger.onEvent` corresponda ao evento recebido.

Eventos emitidos:

- `automation.registered`;
- `automation.removed`;
- `automation.enabled`;
- `automation.disabled`;
- `automation.executed`;
- `automation.failed`.

## Relacao Com Scheduler

Triggers por schedule reaproveitam o `@nyx-os/scheduler`.

O Automation Manager registra uma `ScheduledTask` para cada automacao habilitada com `trigger.onSchedule`. O intervalo e derivado da string `onSchedule`.

O Scheduler continua sendo o unico responsavel por timers e recorrencia.

## Relacao Com Tools

Automacoes usam Tools como unidade de acao.

Isso preserva a cadeia:

```text
Capability -> Tool -> Automation
```

Capabilities descrevem o que o sistema pode fazer. Tools executam essas capacidades. Automations decidem quando uma Tool deve ser chamada.

## Runtime

`NyxRuntime` expoe:

```ts
runtime.getAutomations()
```

Plugins recebem:

```ts
context.automations
```

A opcao `registerBaseAutomations` existe para manter simetria com capabilities e tools. A Sprint 16 nao registra automacoes base obrigatorias.

## Historico

O historico de execucoes e mantido em memoria, limitado as execucoes recentes.

Persistencia duravel fica fora do escopo desta sprint.

## Fora do Escopo

- UI ou dashboard de automacoes.
- Automacoes pre-configuradas reais.
- Persistencia duravel do historico.
- IA.
- LLM.
- Planejamento.
- Agentes.
- Permissoes avancadas.
