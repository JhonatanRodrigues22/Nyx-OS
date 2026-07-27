# Nyx Interaction Layer

## Objetivo

A Nyx Interaction Layer e a primeira experiencia real de interacao com a Nyx.

Ela cria o cockpit pessoal do Nyx OS, separado do Dev Dashboard tecnico.

## Rotas

`/cockpit` e a superficie pessoal.

Ela contem:

- chat com a Nyx;
- comandos rapidos baseados em Tools;
- feedback visual de execucao ao vivo;
- captura rapida de tarefas;
- criação rápida de projetos;
- listagem de tarefas abertas;
- listagem de projetos ativos.

`/dev` permanece como Dev Dashboard tecnico.

A raiz `/` redireciona para `/cockpit`.

## Segurança de IA

Nenhuma chamada para Anthropic acontece no navegador.

O cliente chama apenas API routes do proprio Nyx OS:

- `/api/cockpit/chat`;
- `/api/cockpit/commands`;
- `/api/cockpit/events`.

`AiConversationManager`, `AnthropicProvider` e a chave `ANTHROPIC_API_KEY` ficam restritos ao servidor Next.js.

O streaming tambem respeita essa fronteira:

- servidor Next.js conversa com o provider de IA;
- navegador conversa apenas com o servidor Next.js via streaming SSE/ReadableStream.

## Chat

`/api/cockpit/chat` recebe uma mensagem do cliente, resolve o system prompt via Prompt Engine e chama o AI Runtime no servidor.

A resposta volta ao navegador como Server-Sent Events.

Quando o provider solicita uma Tool durante o streaming, o AI Runtime executa a Tool pelo `ToolManager`, registra a resposta como mensagem `tool` e continua o loop com o provider ate chegar em resposta final ou no limite de iteracoes.

Erros de provider sao tratados e enviados como evento `error`, sem stack trace cru e sem segredos.

## Comandos Rapidos

`/api/cockpit/commands` executa uma Tool diretamente pelo `ToolManager`.

Isso e usado para acoes deterministicas que nao precisam passar pelo raciocinio da IA, como diagnostico do runtime.

As execucoes sao marcadas com `source: "cockpit.quick-command"`.

Tools de produto registradas no Cockpit:

- `task.create`;
- `task.listOpen`;
- `project.listActive`.

Essas Tools usam os contratos de `@nyx-os/personal-data` e ficam disponiveis para comandos deterministas e para o AI Runtime.

## Dados Operacionais

`/api/tasks` expõe:

- `GET` para listar tarefas abertas;
- `POST` para criar tarefa aberta.

`/api/projects` expõe:

- `GET` para listar projetos ativos;
- `POST` para criar projeto ativo.

No recorte inicial da Sprint 25, esses dados usam repositórios em memoria no servidor Next.js. Isso permite desenvolvimento local sem Supabase real, mas ainda nao e persistencia duravel.

A persistencia duravel em Supabase continua sendo a direcao oficial registrada em `docs/arquitetura/personal-data-modules.md` e ADR-0022.

## Eventos de Execucao

`/api/cockpit/events` assina o Event Bus oficial e transmite eventos relevantes para a UI.

Eventos observados:

- `tool.executed`;
- `tool.failed`;
- `automation.executed`;
- `automation.failed`;
- `workflow.*`.

## Identidade Visual

O cockpit usa composicao visual propria, cyberpunk/glassmorphism/neon, e nao reaproveita o layout do Dev Dashboard como base de produto.

## Fora do Escopo

- Nyx Local Integration.
- UI completa dos Personal Data Modules.
- Persistencia duravel dos dados operacionais do Cockpit.
- Multiplayer ou multiplos usuarios.
- Cliente Anthropic no browser.
