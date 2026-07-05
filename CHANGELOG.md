# Changelog

## Sprint 12 - Nyx Visual Overhaul

### Alterado

- Dev Dashboard recebeu uma nova identidade visual premium inspirada na linguagem Nyx.
- Sidebar, topbar, hero, cards, paineis, listas, badges e indicadores foram redesenhados com glassmorphism, neon roxo, magenta e azul eletrico.
- Painel de saude passou a exibir gauge circular, barras visuais reais e microindicadores.
- Scheduler, plugins, modulos e eventos ganharam tratamentos visuais mais proximos de uma interface HUD tecnica.
- Foram adicionadas animacoes discretas de heartbeat, brilho, orbitas e transicoes de hover.
- `docs/arquitetura/dev-dashboard.md` passou a documentar a direcao visual oficial do Dev Dashboard.

### Mantido Fora do Escopo

- Cockpit do usuario final.
- IA conversacional.
- Widgets pessoais.
- Calendario.
- Tarefas pessoais.
- Integracoes externas novas.
- Mudancas na arquitetura do Runtime, Scheduler, Event Bus, Plugins ou Services.

## Sprint 11 - Dev Dashboard: Estado Visual do Sistema

### Criado

- `DashboardOverview` em `@nyx-os/core` com métricas derivadas para saúde, infraestrutura, serviços, plugins, Scheduler, eventos, uptime, versão e ambiente.
- `createDashboardSnapshotFromRuntime` para gerar snapshots a partir de um `NyxRuntime` em execução.
- Painel visual de infraestrutura no dashboard web.
- Documentação de arquitetura em `docs/arquitetura/dev-dashboard.md`.

### Alterado

- Dashboard web passou a exibir estado visual do sistema com blocos de leitura rápida, barras de progresso, uptime, saúde geral, serviços, plugins, Scheduler e eventos recentes.
- Página inicial passou a iniciar um Runtime local no navegador durante `npm run dev` para refletir estado vivo de desenvolvimento.
- Testes do dashboard passaram a validar o novo painel técnico de estado.
- `docs/arquitetura/core-runtime.md` passou a documentar o papel do Dev Dashboard.

### Mantido Fora do Escopo

- Cockpit do usuário final.
- Interface Jarvis.
- Avatar.
- IA conversacional.
- Widgets pessoais.
- Persistência de histórico visual.
- WebSocket.
- Telemetria remota.

## Sprint 10 - Scheduler Engine

### Criado

- `@nyx-os/scheduler` com contratos `NyxScheduler` e `ScheduledTask`.
- `SchedulerManager` em memória para registro, remoção, execução, pausa, retomada e listagem de tarefas.
- Integração do Scheduler ao `NyxRuntime` por `runtime.getScheduler()`.
- Integração do Scheduler ao contexto de plugins por `context.scheduler`.
- Eventos `scheduler.started`, `scheduler.stopped`, `scheduler.task.registered`, `scheduler.task.executed`, `scheduler.task.failed` e `scheduler.task.removed`.
- `HeartbeatPlugin` como plugin interno mínimo de validação.
- Painel de Scheduler no dashboard.
- Documentação de arquitetura em `docs/arquitetura/scheduler.md`.
- ADR-0017 sobre Scheduler Engine oficial.

### Alterado

- `NyxRuntime` passou a iniciar o Scheduler após inicializar plugins.
- `NyxRuntime` passou a parar o Scheduler antes de descartar plugins.
- Snapshot do Runtime e Dashboard passou a incluir estado do Scheduler e tarefas registradas.
- Plugin Context passou a expor `logger` e `scheduler`.
- Testes ampliados para Scheduler, Runtime, Plugin Context, Event Bus e Dashboard.

### Mantido Fora do Escopo

- Automation.
- Memory.
- IA.
- Skills.
- Persistência de tarefas.
- Cron avançado.
- Fila distribuída.
- Execução em múltiplos processos.

## Sprint 09 - Plugin Framework

### Criado

- `@nyx-os/plugin` com contrato `NyxPlugin`.
- `PluginManager` para registro, consulta, inicialização, descarte, remoção e estado de plugins.
- Integração de plugins ao `NyxRuntime`.
- Eventos `plugin.registered`, `plugin.initialized`, `plugin.disposed`, `plugin.unregistered` e `plugin.failed`.
- `RuntimeDiagnosticsPlugin` como plugin interno mínimo de validação.
- Painel de plugins no dashboard.
- Documentação de arquitetura em `docs/arquitetura/plugin-framework.md`.
- ADR-0016 sobre Plugin Framework como mecanismo de expansão.

### Alterado

- `NyxRuntime` passou a expor `registerPlugin`, `unregisterPlugin`, `getPlugin` e `getPlugins`.
- Snapshot do Runtime e Dashboard passou a incluir plugins registrados.
- Event Bus oficial passou a tipar eventos de lifecycle de plugins.
- Testes ampliados para Plugin Manager, Runtime, Event Bus e Dashboard.

### Mantido Fora do Escopo

- Memory.
- Scheduler.
- IA.
- Skills.
- Automation.
- Workflow Lens.
- Descoberta automática de plugins.
- Plugins externos.
- Sandbox e permissões.

## Sprint 08 - Event Bus e Sistema de Eventos

### Criado

- `@nyx-os/event-bus` com contrato `NyxEventBus`.
- `InMemoryEventBus` como implementação inicial.
- Eventos internos de lifecycle para Runtime e serviços.
- Testes para subscribe, unsubscribe, once, múltiplos listeners, ordem de execução e integração com Runtime.
- Documentação de arquitetura em `docs/arquitetura/event-bus.md`.
- ADR-0015 sobre Event Bus oficial tipado.

### Alterado

- `NyxRuntime` passou a expor `getEventBus()`.
- Contexto de serviços passou a incluir `context.events`.
- `ServiceManager` continua emitindo lifecycle interno, agora refletido no Event Bus oficial.
- `@nyx-os/events` foi mantido como stream legado de eventos recentes para snapshots e dashboard.

### Mantido Fora do Escopo

- Skills.
- IA.
- Scheduler.
- Plugins.
- Memory.
- Automation.
- Observability.
- Persistência de eventos.
- WebSocket.

## Sprint 07 - Runtime State Service

### Criado

- `@nyx-os/state` com contrato `NyxStateService`.
- `InMemoryNyxStateService` para estado atual em memória.
- `RuntimeStateService` registrado como serviço base do Runtime.
- Testes para estado, uptime, serviços, lifecycle e falhas.

### Alterado

- `NyxRuntime` passou a expor `getRuntimeState()`.
- `ServiceManager` passou a emitir eventos internos de lifecycle.
- Estado de serviços passa a ser atualizado automaticamente em start, stop e falha.
- Documentação do Core Runtime atualizada para incluir State Service.

### Mantido Fora do Escopo

- Dashboard.
- API.
- Memory.
- Plugins.
- Scheduler.
- Persistência.
- Histórico.
- WebSocket.

## Sprint 06 - Logging Service

### Criado

- `@nyx-os/logger` com contrato `NyxLogger`.
- `ConsoleLogger` como primeira implementação.
- `LoggerService` registrado como serviço base do Runtime.
- Documentação de arquitetura em `docs/arquitetura/logging.md`.
- ADR-0014 sobre logging por contrato.

### Alterado

- `NyxRuntime` passou a expor logger pelo contexto de serviços.
- `ConfigService` passou a depender de `logger` e usar `NyxLogger` quando registra informações.
- Testes ampliados para níveis de log, lifecycle e integração com Runtime.
- Configuração de workspace, Jest, TypeScript e Next.js atualizada para `@nyx-os/logger`.

### Mantido Fora do Escopo

- Arquivo de log.
- SQLite.
- Dashboard de logs.
- Memory.
- API.
- Plugins.
- Rotação de logs.
- Logs remotos.

## Sprint 05 - Config Service e Limpeza de Ambiente

### Criado

- `ConfigService` em `packages/core`.
- Parsing seguro de configuração em `@nyx-os/config`.
- Testes para leitura de configuração e lifecycle do Config Service via Runtime.

### Alterado

- `NyxRuntime` passou a registrar o Config Service como serviço base.
- Documentação do Core Runtime atualizada para incluir Config Service.
- ADR-0013 atualizado para registrar serviços base genéricos.
- READMEs de `packages/core` e `packages/config` atualizados.

### Ambiente

- Removido `C:\Users\Usuario\package-lock.json`, lockfile externo vazio que fazia o Next.js inferir a raiz errada do workspace.

## Runtime Genérico e Serviços de Base

### Criado

- `NyxRuntime` genérico em `packages/core`.
- `ServiceManager` com validação de dependências explícitas.
- `BaseNyxService` e contratos de serviço.
- Assinaturas por tipo no Event Bus em `packages/events`.
- ADR-0013 sobre runtime genérico e serviços desacoplados.

### Alterado

- Documentação do Core Runtime atualizada para separar runtime, dashboard, serviços e eventos.
- Testes de runtime ampliados para lifecycle, dependências e falhas.
- READMEs de `packages/core` e `packages/events` atualizados.

### Decisão

- Scheduler e plugin loader permanecem fora do núcleo por enquanto.
- Nyx Assistente e integrações futuras devem consumir o Nyx OS como clientes, serviços ou plugins desacoplados.

## Padronização de Idioma da Documentação

### Alterado

- README traduzido para Português do Brasil.
- Regra oficial de idioma adicionada ao workflow de desenvolvimento.
- ADR-0011 atualizado para registrar Português do Brasil como idioma oficial da documentação principal.
- Documentos de workflow revisados para consistência de idioma.

### Mantido

- Comandos, paths, nomes técnicos, Conventional Commits, APIs e nomes de pacotes podem permanecer em inglês quando fizer sentido técnico.

## Sprint 04.1 - Developer Experience & Workflow Validation

### Criado

- Procedimento oficial de Developer Experience Validation em `docs/workflow/dx-validation.md`.
- Plano da Sprint 04.1 em `docs/sprints/plano-sprint-04-1-dx-workflow.md`.

### Alterado

- README reorganizado com Quick Start, setup do zero, comandos disponiveis e contribuicao.
- Workflow oficial consolidado em `docs/workflow/desenvolvimento.md`.
- Qualidade atualizada para incluir `npm audit` e DX Validation.
- ADR-0011 atualizado com a decisao de branches sempre partirem de `main`, PRs sempre mirarem `main` e branches temporarias serem removidas apos merge.
- Indice de documentacao atualizado para apontar o fluxo de onboarding e contribuicao.

### Mantido fora do escopo

- Funcionalidades de produto.
- Mudancas no runtime.
- Mudancas no dashboard.
- Mudancas no modelo de dados.

## Sprint 04 — Core Runtime e Dashboard Base

### Criado

- Runtime base em `packages/core`.
- Configuracao central em `packages/config`.
- Event Bus em memoria em `packages/events`.
- Dashboard visual em `apps/web`.
- Documentacao de runtime em `docs/arquitetura/core-runtime.md`.
- Plano da sprint em `docs/sprints/plano-sprint-04-core-runtime-dashboard.md`.

### Alterado

- README atualizado para o caminho correto de `.env.local` no monorepo.
- App web passou a consumir snapshots de services em vez de manter dados mockados nos componentes.

### Mantido fora do escopo

- Autenticacao real.
- Banco real.
- IA real.
- Automacoes reais.
- Integracoes externas.

## Sprint 03 — Fundação Técnica e Setup do Projeto

### Reorganizado

- Aplicação web movida para `apps/web`.
- Raiz do projeto preparada como monorepo com npm workspaces.
- Estrutura planejada criada para `packages/`, `configs/`, `infrastructure/`, `docker/`, `assets/` e `tests/`.

### Criado

- `docs/arquitetura/fundacao-tecnica.md`
- `docs/workflow/desenvolvimento.md`
- `docs/workflow/qualidade.md`
- `docs/workflow/configuracao.md`
- `docs/sprints/plano-sprint-03-fundacao-tecnica.md`
- `docs/decisoes/ADR-0009-stack-tecnica-oficial.md`
- `docs/decisoes/ADR-0010-monorepo-modular.md`
- `docs/decisoes/ADR-0011-workflow-e-qualidade.md`
- `docs/decisoes/ADR-0012-observabilidade-erros.md`
- CI inicial em `.github/workflows/ci.yml`
- Workflow obrigatório de Pull Requests documentado em `docs/workflow/desenvolvimento.md`

### Mantido

- Nenhuma funcionalidade nova do Nyx OS foi implementada.
- O app web existente foi apenas reposicionado dentro da estrutura do monorepo.

## Sprint de Documentacao 2 — Consolidacao da Fonte de Verdade

### Reorganizado

- Documentacao de produto, MVP, experiencia, arquitetura e roadmap consolidada em `docs/`.
- Roadmap detalhado centralizado em `docs/roadmap/README.md`, com `ROADMAP.md` mantido apenas como atalho de raiz.
- `TODO.md` reduzido a pendencias e guardrails para evitar duplicacao de roadmap.
- Relacao entre `.ai/` e `docs/prompts/` esclarecida: `.ai/` e apoio operacional/local; `docs/prompts/` guarda orientacoes canonicas quando fizerem parte da documentacao do projeto.

### Criado

- `docs/fundamentos/glossario.md`
- `docs/arquitetura/apis.md`
- `docs/arquitetura/modelo-de-dados.md`
- `docs/arquitetura/nyx-local.md`
- `docs/seguranca/dados-e-privacidade.md`
- `docs/sprints/plano-sprint-01.md`
- `docs/decisoes/ADR-0006-memoria.md`
- `docs/decisoes/ADR-0007-cloud-agora-local-depois.md`
- `docs/decisoes/ADR-0008-grafo-de-contexto.md`

### Decisoes consolidadas

- Memoria e contexto persistente vivo, nao apenas historico de conversa ou embeddings.
- O Nyx OS comeca cloud-first por viabilidade, preservando caminho para execucao local futura.
- O dominio deve evoluir como grafo de contexto.
- Captura rapida faz parte do MVP, mas sera implementada em camadas.

## Sprint 0.5 — Limpeza, Arquitetura e Controle

### Estado herdado

- O repositorio remoto continha documentacao inicial em ingles, prompts dentro de `.ai/` e pouca separacao entre arquitetura, contexto de agente e roadmap.
- O ambiente local tinha uma fundacao funcional em Next.js, TypeScript, Supabase, PWA e testes.
- Tambem havia pastas locais e geradas como `Fundamentos/`, `.next/`, `dist/`, `node_modules/` e service workers gerados.

### Reorganizado

- `docs/` passou a ser a fonte de verdade conceitual do projeto.
- `.ai/` foi reorganizada para conter apenas prompts, contexto operacional e protocolo de agentes.
- `README.md` foi reescrito em portugues.
- `ROADMAP.md` foi criado com as fases previstas.
- `scripts/` passou a ser versionado quando contem automacoes uteis.
- `.gitignore` foi corrigido para ignorar builds, caches, logs, credenciais e artefatos gerados.

### Removido ou deixado fora do Git

- A pasta solta `Fundamentos/` deixou de ser a fonte de verdade e seu conteudo util foi migrado para `docs/fundamentos/`.
- Artefatos gerados por build e PWA continuam fora do Git.
- Dependencias instaladas e caches locais continuam fora do Git.

### Mantido

- Fundacao funcional da aplicacao em `src/`.
- Configuracoes de teste, lint, build, Supabase e PWA.
- Script auxiliar `scripts/package.py`, agora versionavel.

### Proximos passos

- Revisar e aprovar a nova organizacao.
- Usar PRs separados para sprints de produto.
- Evitar novas features dentro de sprints de saneamento estrutural.
