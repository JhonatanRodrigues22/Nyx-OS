# Tool Calling Engine

## Objetivo

O Tool Calling Engine e o mecanismo oficial para descobrir, registrar, validar e executar Tools no Nyx OS.

Ele nao implementa IA, LLM, prompts, planejamento, raciocinio, agentes ou automacoes inteligentes.

Seu papel e definir a API publica executavel do Nyx OS para clientes futuros, incluindo o AI Runtime.

## Package

O package oficial e `@nyx-os/tools`.

Ele contem:

- `NyxTool`;
- `ToolManager`;
- `ToolRegistry`;
- `ToolExecutor`;
- `ToolContext`;
- `ToolMetadata`;
- eventos `tool.*`;
- tipos publicos de Tool.

## Contrato

Cada Tool declara:

- `id`;
- `capabilityId`;
- `name`;
- `description`;
- `version`;
- `category`;
- `enabled`;
- `parameters`;
- `result`;
- `metadata`;
- `execute()`.

Toda Tool deve pertencer a uma Capability existente. O `ToolRegistry` recusa Tools orfas.

## Categorias

As categorias iniciais sao:

- `memory`;
- `system`;
- `diagnostics`;
- `filesystem`;
- `network`;
- `automation`;
- `custom`.

## Operacoes

O contrato `NyxToolManager` permite:

- registrar Tool;
- remover Tool;
- buscar por ID;
- listar Tools;
- executar Tool;
- validar parametros;
- consultar metadados e ultima execucao.

## Execucao

Toda Tool recebe um `ToolContext` padrao com:

- `runtime`;
- `logger`;
- `config`;
- `memory`;
- `scheduler`;
- `eventBus`;
- `services`;
- `capabilities`.

O contexto e controlado pelo Runtime. Tools devem depender desses contratos e nao acessar Managers ou Services concretos diretamente.

## Relacao Com Capabilities

Capabilities descrevem o que o sistema pode fazer.

Tools representam como executar essas capacidades.

Cada Tool possui `capabilityId` e so pode ser registrada se a Capability correspondente existir.

## Eventos

O Tool Calling Engine emite eventos pelo Event Bus oficial:

- `tool.registered`;
- `tool.removed`;
- `tool.executed`;
- `tool.failed`.

## Runtime

`NyxRuntime` expoe:

```ts
runtime.getTools()
```

Plugins recebem:

```ts
context.tools
```

## Tools Internas

A implementacao inicial registra apenas duas Tools internas:

- `memory.search`;
- `diagnostics.runtime`.

Elas existem para validar a arquitetura e nao implementam IA.

## Dashboard

O Dev Dashboard exibe um bloco simples com:

- quantidade de Tools registradas;
- quantidade de Tools habilitadas;
- ultima execucao;
- status.

## Fora do Escopo

- IA.
- LLM.
- Prompts.
- Planejamento.
- Raciocinio.
- Agentes.
- Automacoes inteligentes.
