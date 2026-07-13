# Workflow Engine

## Objetivo

O Workflow Engine e o mecanismo oficial para orquestrar fluxos multi-etapa no Nyx OS.

Cada passo invoca uma Tool existente por `toolId`. O Workflow Engine nao reimplementa execucao; ele usa o Tool Calling Engine como API executavel.

## Package

O package oficial e `@nyx-os/workflow`.

Ele contem:

- `WorkflowStep`;
- `WorkflowDefinition`;
- `WorkflowInstance`;
- `WorkflowRegistry`;
- `WorkflowExecutor`;
- `WorkflowManager`;
- eventos `workflow.*`.

## Contratos

`WorkflowStep` declara:

- `id`;
- `name`;
- `toolId`;
- `input`;
- `next`;
- `retry`.

`next` pode ser:

- `string`: proximo passo fixo;
- `null`: encerra o workflow;
- funcao que recebe o resultado da Tool e o contexto acumulado e retorna o proximo `stepId` ou `null`.

`retry` declara:

- `maxAttempts`;
- `backoffMs`.

`WorkflowDefinition` declara:

- `id`;
- `name`;
- `steps`.

`WorkflowInstance` declara:

- `id`;
- `workflowId`;
- `status`;
- `currentStepId`;
- `history`;
- `context`.

## Registry

`WorkflowRegistry` valida definicoes antes do registro.

Ele rejeita:

- workflow sem steps;
- step duplicado;
- step com `toolId` inexistente;
- retry invalido;
- `next` fixo apontando para step inexistente.

`next` dinamico tambem e validado em tempo de execucao. Se a funcao retornar um step inexistente, a instancia falha explicitamente.

## Executor

`WorkflowExecutor` roda a instancia passo a passo.

Para cada step:

1. Resolve o input.
2. Executa `tools.execute(toolId, input)`.
3. Registra a tentativa no historico.
4. Salva o resultado em `instance.context[stepId]`.
5. Resolve o proximo step.

Se a Tool falhar, o executor tenta novamente ate `retry.maxAttempts`.

Quando as tentativas esgotam, a instancia fica com status `failed` e o workflow nao continua silenciosamente.

## Pause e Resume

`WorkflowManager.pause(instanceId)` solicita pausa cooperativa.

O comportamento definido nesta sprint e:

- uma tentativa de Tool ja em andamento termina;
- se a pausa for solicitada durante o backoff entre retries, o executor suspende antes da proxima tentativa;
- se a pausa for solicitada entre steps, o executor suspende antes do proximo step;
- `resume(instanceId)` continua a partir de `currentStepId`.

## Eventos

Eventos emitidos no Event Bus oficial:

- `workflow.started`;
- `workflow.step.completed`;
- `workflow.paused`;
- `workflow.resumed`;
- `workflow.failed`;
- `workflow.completed`.

## Persistencia

`WorkflowInstance` vive em memoria nesta sprint.

Isso significa que `pause/resume` funciona apenas dentro do tempo de vida do processo atual.

Se o processo reiniciar enquanto um workflow estiver pausado, a instancia e seu historico em memoria serao perdidos. Pausar por dias, retomar apos deploy ou recuperar execucoes apos restart exige persistencia duravel, que fica fora do escopo desta sprint.

## Fora do Escopo

- Persistencia duravel de instancias.
- UI de workflows.
- Definicoes reais de produto.
- Editor visual de fluxos.
- Execucao distribuida.
- Fila externa.
