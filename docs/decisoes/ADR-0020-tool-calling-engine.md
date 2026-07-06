# ADR-0020: Tool Calling Engine Oficial

## Status

Aceita.

## Contexto

O Nyx OS possui Runtime, Plugin Framework, Event Bus, Scheduler, Memory Engine e Capability Engine.

O proximo contrato necessario e uma camada executavel para que clientes futuros, especialmente o AI Runtime, possam interagir com o sistema sem acessar Managers, Services ou implementacoes concretas diretamente.

## Decisao

- Criar `@nyx-os/tools` como pacote oficial de Tools.
- Definir `NyxTool` como contrato publico executavel.
- Criar `ToolRegistry` para registro, remocao, descoberta e garantia contra Tools orfas.
- Criar `ToolExecutor` para validacao de parametros e execucao padronizada.
- Criar `ToolManager` como fachada publica.
- Integrar Tools ao Runtime por `runtime.getTools()`.
- Disponibilizar Tools para plugins por `context.tools`.
- Exigir que toda Tool possua `capabilityId` apontando para uma Capability registrada.
- Emitir eventos oficiais:
  - `tool.registered`;
  - `tool.removed`;
  - `tool.executed`;
  - `tool.failed`.
- Criar apenas `memory.search` e `diagnostics.runtime` como Tools internas de validacao.

## Alternativas Consideradas

- Permitir que o AI Runtime acesse Managers diretamente.
- Criar Tool Calling dentro do AI Runtime.
- Permitir Tools sem Capability associada.
- Adiar Tools ate existir IA.

## Consequencias

- Tools passam a ser a API publica executavel do Nyx OS.
- O AI Runtime futuro devera usar exclusivamente `runtime.getTools()` para execucao.
- Capabilities descrevem o que existe; Tools executam como isso acontece.
- Observabilidade passa pelo Event Bus oficial.
- IA, LLM, prompts, planejamento, raciocinio, agentes e automacoes inteligentes permanecem fora do escopo atual.
