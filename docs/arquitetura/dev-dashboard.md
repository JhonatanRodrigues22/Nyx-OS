# Dev Dashboard

## Objetivo

O Dev Dashboard e o painel de estado visual do Nyx OS durante o desenvolvimento.

Ele existe para que a pessoa desenvolvedora consiga abrir `npm run dev` e entender rapidamente:

- saude geral do sistema;
- estado atual do Runtime;
- ambiente;
- versao;
- tempo online;
- servicos registrados;
- plugins carregados;
- Capabilities registradas;
- Tools registradas;
- Scheduler;
- tasks registradas;
- eventos recentes.

## Escopo

O Dev Dashboard e tecnico.

Ele nao e o Cockpit do usuario final, nao e uma interface Jarvis, nao possui avatar, nao conversa com IA e nao implementa widgets pessoais.

Seu papel e expor de forma clara o estado da infraestrutura ja existente.

## Direcao visual

A partir da Sprint 12, o Dev Dashboard assume uma identidade visual propria do Nyx OS.

A direcao visual deve transmitir:

- tecnologia;
- elegancia;
- inteligencia;
- sistema vivo;
- software premium;
- IA residente como presenca conceitual, sem implementar IA conversacional.

A estetica de referencia combina interfaces HUD futuristas, glassmorphism, paineis sci-fi, neon roxo, magenta e azul eletrico.

O objetivo nao e copiar produtos especificos nem reproduzir referencia pixel por pixel. O objetivo e consolidar uma linguagem visual propria para o painel tecnico do Nyx OS.

Verdes devem ser usados apenas para estados positivos ou saudaveis.

O dashboard deve evitar aparencia de template administrativo, painel empresarial ou terminal hacker tradicional.

## Fonte de dados

O dashboard consome `DashboardSnapshot`, produzido em `@nyx-os/core`.

O snapshot reune dados vindos de:

- `NyxRuntime`;
- `RuntimeStateService`;
- `ServiceManager`;
- `PluginManager`;
- `SchedulerManager`;
- `CapabilityManager`;
- `ToolManager`;
- `EventService`;
- `ConfigService`.

A UI renderiza o snapshot. Ela nao deve concentrar regra de dominio, lifecycle ou acoplamento direto com implementacoes internas.

## Modo estatico e modo vivo

O dashboard possui dois modos:

- snapshot estatico, usado para SSR e testes;
- snapshot vivo no navegador, usado durante `npm run dev`.

No modo vivo, a pagina cria um `NyxRuntime`, inicia o ciclo do Runtime e atualiza a tela periodicamente com:

- uptime;
- status do Runtime;
- status de servicos;
- status de plugins;
- status de Capabilities;
- status de Tools;
- status do Scheduler;
- eventos oficiais observados.

Esse comportamento existe apenas para visualizacao de desenvolvimento. Ele nao altera o contrato do Runtime nem substitui futuras APIs de observabilidade.

## Metricas visuais

As barras e percentuais do dashboard devem representar informacoes reais ou derivadas de estado real.

Exemplos:

- saude geral calculada a partir de Runtime, servicos, plugins, Scheduler e modulos;
- infraestrutura calculada a partir de modulos, servicos, plugins e Scheduler;
- quantidade de servicos ativos;
- quantidade de plugins inicializados;
- quantidade de Capabilities habilitadas;
- quantidade de Tools habilitadas;
- quantidade de tasks registradas;
- quantidade de eventos recentes.

Valores aleatorios ou puramente decorativos nao devem ser usados.

Elementos visuais como gauges, trilhas, mini graficos, badges e animacoes discretas podem ser usados quando ajudarem a leitura rapida do estado do sistema.

## Idioma

Titulos, descricoes e informacoes de leitura rapida devem permanecer em Portugues do Brasil.

Identificadores tecnicos podem permanecer em ingles, por exemplo:

- `runtime.started`;
- `scheduler.task.executed`;
- `plugin.initialized`;
- `scheduler.heartbeat`.

## Fora do Escopo

- Cockpit do usuario final.
- Interface futurista.
- Avatar.
- IA conversacional.
- Widgets pessoais.
- Calendario.
- Tarefas de usuario.
- Obsidian.
- Persistencia de historico visual.
- WebSocket.
- Telemetria remota.
