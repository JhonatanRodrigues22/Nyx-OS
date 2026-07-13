# Context Engine

## Objetivo

O Context Engine e a camada oficial que decide o que entra no contexto de uma conversa com IA.

Ele coleta contribuicoes de estado do runtime, memoria textual e conhecimento documentado, ordena por prioridade e aplica um orcamento de caracteres antes desse conteudo virar uma secao de prompt.

Ele nao substitui `@nyx-os/memory`, `@nyx-os/knowledge` ou `@nyx-os/prompt`. Ele orquestra essas capacidades.

## Package

O package oficial e `@nyx-os/context`.

Ele contem:

- `ContextSource`;
- `ContextContribution`;
- `ContextRequest`;
- `ContextResult`;
- `RuntimeStateContextSource`;
- `MemoryContextSource`;
- `KnowledgeContextSource`;
- `ContextEngine`;
- helper opcional `toPromptSection`.

## Contratos

`ContextSource` define:

```ts
collect(query?: string): Promise<ContextContribution>
```

Cada fonte retorna:

- `sourceName`;
- `content`;
- `priority`.

`ContextRequest` define:

- `query`;
- `maxChars`.

`ContextResult` define:

- `sections`;
- `truncated`;
- `omittedSources`.

`truncated` sinaliza corte por orcamento.

`omittedSources` registra fontes omitidas por falha ou por falta de orcamento, sempre com motivo textual.

## Fontes

### Runtime State

`RuntimeStateContextSource` resume `@nyx-os/state` com:

- status do runtime;
- ambiente;
- versao;
- servicos rodando;
- servicos falhos;
- lista resumida de servicos.

### Memory

`MemoryContextSource` consulta `@nyx-os/memory`.

Quando recebe `query`, usa `memory.search({ text: query })`.

Quando nao recebe `query`, usa `memory.list()`.

### Knowledge

`KnowledgeContextSource` consulta `KnowledgeSearchEngine` de `@nyx-os/knowledge`.

Ela nao reimplementa ranking nem busca semantica. A relevancia continua sendo responsabilidade da estrategia configurada no Knowledge Engine.

## Orquestracao

`ContextEngine` registra fontes, coleta contribuicoes em paralelo, isola falhas por fonte e ordena os resultados por prioridade decrescente.

Se uma fonte falhar, as outras continuam contribuindo normalmente.

Ao aplicar `maxChars`, o engine inclui fontes de maior prioridade primeiro. Quando o orcamento acaba, ele corta ou omite fontes restantes e registra isso em `omittedSources`.

## Relacao Com Prompt Engine

`toPromptSection` converte `ContextResult` para um objeto estruturalmente compativel com `PromptSection`:

```ts
{
  name: "context",
  content: "..."
}
```

`@nyx-os/context` nao importa `@nyx-os/prompt` e nao depende de `@nyx-os/ai`.

## Fora do Escopo

- Workflow Engine.
- UI de contexto.
- Ranking sofisticado entre chunks de conhecimento.
- Busca semantica.
- Decisao final de prompt do AI Runtime.
- Persistencia de contexto montado.
