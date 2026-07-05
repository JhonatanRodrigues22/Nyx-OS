# Plugin Framework

## Objetivo

O Plugin Framework oficial permite que o Nyx OS cresça por módulos desacoplados, registrados e controlados pelo Runtime.

Esta Sprint cria apenas a infraestrutura. Memory, Scheduler, IA, Skills, Automation, Workflow Lens e integrações externas não são implementados aqui.

## Pacote

O contrato oficial vive em `@nyx-os/plugin`.

Ele expõe:

- `NyxPlugin`;
- `PluginManager`;
- `NyxPluginContext`;
- snapshots e estados de lifecycle.

## Contrato

```ts
interface NyxPlugin {
  readonly id: string
  readonly name: string
  readonly version: string
  initialize(context): Promise<void> | void
  dispose?(context): Promise<void> | void
}
```

Todo plugin deve declarar identidade estável e inicializar por meio de um contexto controlado.

## Contexto

Durante a inicialização, plugins recebem:

- `context.runtime`;
- `context.events`;
- `context.logger`;
- `context.scheduler`;
- `context.services`;
- `context.state`.

O objetivo é permitir integração com o Runtime sem acoplar plugins diretamente entre si.

## Lifecycle

```text
register
  -> plugin.registered

initialize
  -> plugin.initialized
  -> plugin.failed, se houver erro

dispose
  -> plugin.disposed
  -> plugin.failed, se houver erro

unregister
  -> plugin.unregistered
```

O Runtime inicializa plugins depois dos serviços base e descarta plugins antes de encerrar serviços. Assim, plugins podem usar contratos do Runtime durante `initialize` e `dispose`.

## Integração com Runtime

`NyxRuntime` expõe:

- `registerPlugin(plugin)`;
- `unregisterPlugin(id)`;
- `getPlugin(id)`;
- `getPlugins()`.

O `PluginManager` impede IDs duplicados, lista plugins, consulta estado e controla inicialização e descarte.

## Plugin Interno

O `RuntimeDiagnosticsPlugin` existe apenas para validar a arquitetura e tornar o framework visível no dashboard.

Ele não contém regra de produto e não implementa Memory, Scheduler, IA, Skills ou Automation.

## Dashboard

O dashboard exibe:

- card de Plugins;
- quantidade de plugins carregados;
- lista de plugins registrados.

Essa visibilidade ajuda a mostrar a evolução da plataforma sem transformar o dashboard em tela de gerenciamento.

## Boas Práticas

- Plugins devem depender de contratos.
- IDs de plugins devem ser estáveis.
- Plugins não devem acessar outros plugins diretamente.
- Tarefas recorrentes devem ser registradas por `context.scheduler`, não por timers próprios.
- Falhas devem ser refletidas no estado do plugin e no Event Bus.
- Novas capacidades devem entrar como plugins ou usar essa infraestrutura quando fizer sentido arquitetural.

## Fora do Escopo Atual

- Descoberta automática.
- Marketplace.
- Plugins externos.
- Persistência de plugins.
- Permissões e sandbox.
- Scheduler.
- Memory.
- IA.
- Skills.
- Automation.
- Workflow Lens.
