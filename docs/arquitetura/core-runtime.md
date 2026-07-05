# Core Runtime

## Objetivo

O Core Runtime representa a base executável e genérica do Nyx OS.

Ele inicializa, coordena e encerra serviços internos sem conhecer clientes específicos, produtos futuros ou integrações externas. Seu papel é manter fronteiras claras entre UI, configuração, serviços, eventos e estado do sistema.

## Princípios

- O runtime deve ser pequeno.
- O runtime não concentra regra de produto.
- Serviços declaram dependências explicitamente.
- Serviços sobem respeitando dependências e descem na ordem inversa.
- Comunicação entre serviços deve priorizar eventos.
- Integrações futuras entram por serviços ou plugins desacoplados.
- A Nyx Assistente é um cliente previsto do Nyx OS, mas não faz parte do runtime.
- Projetos futuros não devem virar dependência do núcleo antes de existir.

## Componentes

- `@nyx-os/config`: configuração central do sistema.
- `@nyx-os/event-bus`: Event Bus oficial e tipado para comunicação desacoplada entre Runtime e serviços.
- `@nyx-os/events`: stream em memória de eventos recentes usado por snapshots e dashboard.
- `@nyx-os/logger`: contrato central de logging e implementação inicial em console.
- `@nyx-os/plugin`: contrato oficial de plugins e manager de lifecycle.
- `@nyx-os/state`: contrato central de estado do Runtime e serviços.
- `@nyx-os/core`: runtime genérico, service manager, contratos de serviço, Logger Service, Config Service, State Service, status do sistema e serviços do dashboard.
- `apps/web`: interface visual que consome snapshots produzidos pelos serviços.

## Runtime Genérico

`NyxRuntime` é o núcleo de execução genérico. Ele oferece:

- registro de serviços;
- ciclo `start` e `stop`;
- emissão de eventos de lifecycle;
- snapshot do runtime;
- integração com `ServiceManager`;
- acesso compartilhado ao `NyxEventBus`.
- registro automático dos serviços base do núcleo.

O runtime não descobre serviços automaticamente e não conhece módulos futuros por nome.

Por padrão, `NyxRuntime` registra `LoggerService`, `ConfigService` e `RuntimeStateService` como serviços base. Usos avançados podem desativar esse registro quando precisarem testar o runtime sem serviços iniciais.

## Serviços

Serviços implementam o contrato `NyxService` ou estendem `BaseNyxService`.

Cada serviço possui:

- `name`;
- `dependencies`;
- `status`;
- `setup`;
- `start`;
- `stop`.

O `ServiceManager` valida dependências ausentes, detecta dependências circulares e preserva a ordem de inicialização para desligamento reverso.

O `ServiceManager` também emite eventos internos de lifecycle para que o State Service acompanhe mudanças de status sem exigir que cada serviço atualize o estado manualmente.

O Runtime traduz esses eventos de lifecycle para o Event Bus oficial quando um serviço é registrado, iniciado, parado ou falha.

## Logger Service

`LoggerService` é o serviço base responsável por expor `NyxLogger` ao Runtime e aos demais serviços.

Ele é responsável por:

- registrar uma interface única de logging;
- evitar acoplamento direto entre serviços e `console`;
- permitir que serviços recebam logger pelo contexto;
- iniciar antes de serviços que precisam registrar informações.

`ConsoleLogger` é a implementação inicial. Arquivos, telemetria, logs remotos, rotação e persistência ficam fora do escopo atual.

## Config Service

`ConfigService` é o primeiro serviço base oficial do Runtime.

Ele é responsável por:

- carregar a configuração mínima do Nyx OS;
- expor `appName`, `version`, `environment`, `enabledModules` e `featureFlags`;
- aceitar ambiente injetado para testes e execução controlada;
- aplicar defaults seguros quando variáveis não existem ou possuem valores inválidos;
- iniciar e encerrar pelo mesmo lifecycle dos demais serviços.

O Config Service não conhece Dashboard, Nyx Assistente, integrações externas ou projetos futuros.

Quando precisa registrar informações, ele usa `NyxLogger` recebido pelo contexto do Runtime.

## State Service

`RuntimeStateService` é o serviço base responsável por expor o estado atual do Runtime e dos serviços registrados.

Ele é responsável por:

- registrar versão e ambiente do Runtime;
- registrar horário de inicialização;
- expor uptime;
- listar serviços carregados;
- consultar um serviço por nome;
- acompanhar status e saúde de cada serviço;
- refletir mudanças de lifecycle como `starting`, `running`, `stopping`, `stopped` e `failed`.

O estado atual é mantido em memória por `@nyx-os/state`.

O State Service não implementa Dashboard, API, histórico, persistência ou WebSocket. Ele apenas oferece uma fonte de verdade interna para clientes futuros.

## Fluxo

```text
Dashboard UI
  -> DashboardService
  -> RuntimeService / SystemStatusService / EventService
  -> EventBus

Serviços internos
  -> NyxRuntime
  -> ServiceManager
  -> LoggerService
  -> ConfigService
  -> RuntimeStateService
  -> EventBus
```

A UI renderiza dados e dispara interações visuais. Ela não deve concentrar regra de domínio nem acessar banco diretamente.

## Event Bus

O Event Bus oficial vive em `@nyx-os/event-bus` e fica disponível por `runtime.getEventBus()` e por `context.events` dentro dos serviços.

Ele permite:

- emitir eventos internos;
- assinar eventos com `on`;
- assinar eventos uma única vez com `once`;
- remover listeners com `off`;
- remover listeners em lote com `removeAllListeners`;
- representar eventos de lifecycle como `runtime.started`, `runtime.stopped`, `runtime.failed`, `service.registered`, `service.started`, `service.stopped` e `service.failed`.

Os payloads são pequenos e tipados, com `timestamp`, `service`, `status` e `metadata`.

O stream em `@nyx-os/events` continua existindo para eventos recentes do dashboard e snapshots legados, mas não é o contrato oficial de comunicação entre serviços.

Ele ainda não é persistente, distribuído ou conectado a integrações externas.

## Plugin Framework

O Plugin Framework vive em `@nyx-os/plugin` e é orquestrado pelo `NyxRuntime`.

O Runtime expõe:

- `registerPlugin(plugin)`;
- `unregisterPlugin(id)`;
- `getPlugin(id)`;
- `getPlugins()`.

Plugins são inicializados depois dos serviços base e descartados antes do encerramento dos serviços. O lifecycle emite eventos `plugin.registered`, `plugin.initialized`, `plugin.disposed`, `plugin.unregistered` e `plugin.failed` pelo Event Bus oficial.

O `RuntimeDiagnosticsPlugin` é um plugin interno mínimo para validar a arquitetura e tornar o framework visível no dashboard. Ele não implementa regra de produto.

## Dados Mockados

Dados mockados vivem nos services/providers de runtime e dashboard dentro de `packages/core`.

Componentes React recebem um snapshot pronto para renderização.

## Fora do Núcleo Agora

- Scheduler recorrente.
- Descoberta automática de plugins.
- Autenticação real.
- Banco real.
- Memória persistente.
- IA real.
- Automações reais.
- Integrações externas.
- Notificações reais.
- Persistência de estado.
- Histórico de estado.
- WebSocket.
- Captura de dados do computador.

Scheduler, descoberta automática de plugins e plugins externos continuam ideias válidas, mas exigem contratos próprios e um ambiente de execução adequado. Eles não devem ser adicionados ao núcleo apenas por expectativa futura.
