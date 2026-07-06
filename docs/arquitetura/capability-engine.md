# Capability Engine

## Objetivo

O Capability Engine e o mecanismo oficial para registrar, descobrir, executar e observar capacidades do Nyx OS.

Ele nao implementa IA, LLM, planejamento, automacoes ou tool calling.

Seu papel e criar um contrato estavel para que componentes futuros possam executar funcionalidades do sistema sem depender diretamente de implementacoes concretas.

## Package

O package oficial e `@nyx-os/capabilities`.

Ele contem:

- `NyxCapability`;
- `CapabilityManager`;
- `CapabilityRegistry`;
- `CapabilityExecutor`;
- `CapabilityContext`;
- `CapabilityMetadata`;
- eventos `capability.*`;
- tipos publicos de capacidades.

## Contrato

Cada Capability declara:

- `id`;
- `name`;
- `description`;
- `version`;
- `category`;
- `tags`;
- `enabled`;
- `metadata`;
- `execute()`.

O `id` deve ser estavel. Consumidores devem descobrir e executar capacidades por contrato, nao por classes concretas.

## Categorias

As categorias iniciais sao:

- `system`;
- `memory`;
- `diagnostics`;
- `filesystem`;
- `network`;
- `automation`;
- `custom`.

## Operacoes

O contrato `NyxCapabilityManager` permite:

- registrar Capability;
- remover Capability;
- buscar por ID;
- buscar por categoria;
- listar Capabilities;
- executar Capability;
- verificar disponibilidade.

## Execucao

Toda Capability recebe um `CapabilityContext` padrao com:

- `runtime`;
- `logger`;
- `config`;
- `memory`;
- `eventBus`;
- `services`;
- `scheduler`.

Esse contexto e controlado pelo Runtime. Capabilities devem depender desses contratos e evitar acesso direto a implementacoes concretas.

## Eventos

O Capability Engine emite eventos pelo Event Bus oficial:

- `capability.registered`;
- `capability.removed`;
- `capability.executed`;
- `capability.failed`.

Os payloads devem permanecer pequenos, tecnicos e suficientes para observabilidade.

## Runtime

`NyxRuntime` expoe:

```ts
runtime.getCapabilities()
```

Plugins recebem:

```ts
context.capabilities
```

Assim, plugins podem registrar capacidades durante a inicializacao sem acoplar o Runtime a funcionalidades especificas.

## Capabilities Internas

A implementacao inicial registra apenas duas capacidades internas:

- `DiagnosticsCapability`;
- `MemoryCapability`.

Elas existem para validar a arquitetura e tornar o contrato visivel no dashboard. Elas nao implementam regra de produto.

## Dashboard

O Dev Dashboard exibe um bloco simples com:

- quantidade de Capabilities registradas;
- quantidade de Capabilities habilitadas;
- lista resumida;
- status habilitado ou desabilitado.

## Fora do Escopo

- IA.
- LLM.
- Tool Calling.
- Planejamento.
- Automacoes reais.
- Skills.
- Permissoes avancadas.
- Marketplace.
- Execucao remota.
