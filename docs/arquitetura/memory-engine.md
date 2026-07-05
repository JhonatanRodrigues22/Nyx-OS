# Memory Engine

## Objetivo

O Memory Engine e o servico oficial de memoria do Nyx OS.

Ele fornece infraestrutura para armazenar, consultar, atualizar, remover e recuperar memorias textuais.

Esta camada nao implementa IA, embeddings, vetores, RAG, LLM, automacoes ou persistencia em banco.

## Package

O package oficial e `@nyx-os/memory`.

Ele contem:

- `NyxMemoryService`;
- `MemoryManager`;
- `MemoryStore`;
- `InMemoryMemoryStore`;
- `MemorySearch`;
- `MemoryIndex`;
- eventos `memory.*`;
- tipos publicos de memoria.

## Modelo Inicial

Nesta fase, apenas memoria textual e suportada.

Cada memoria possui:

- `id`;
- `title`;
- `content`;
- `category`;
- `tags`;
- `createdAt`;
- `updatedAt`;
- `source`;
- `metadata`;
- `importance`.

## Categorias

As categorias iniciais sao:

- `project`;
- `knowledge`;
- `conversation`;
- `system`;
- `user`;
- `automation`;
- `temporary`;
- `custom`.

## Operacoes

O contrato `NyxMemoryService` expõe:

- criar memoria;
- atualizar memoria;
- excluir memoria;
- buscar por ID;
- buscar por categoria;
- buscar por tags;
- buscar por texto;
- listar memorias;
- consultar snapshot de indice.

## Busca

A busca atual e simples e deterministica.

Ela utiliza:

- `id`;
- texto em `title`, `content` e `tags`;
- categoria;
- tags.

Nao existe busca semantica nesta sprint.

## Persistencia

`MemoryStore` e a interface de persistencia.

`InMemoryMemoryStore` e a implementacao inicial.

Persistencia em banco, SQLite, Supabase, vetores ou mecanismos externos ficam fora do escopo atual.

## Eventos

O Memory Engine emite eventos pelo Event Bus oficial:

- `memory.created`;
- `memory.updated`;
- `memory.deleted`;
- `memory.loaded`;
- `memory.saved`;
- `memory.search`.

Os payloads devem permanecer pequenos e tecnicos.

## Runtime

`NyxRuntime` expoe:

```ts
runtime.getMemory()
```

Plugins recebem:

```ts
context.memory
```

O `MemoryPlugin` interno existe apenas para validar a arquitetura. Ele cria uma memoria tecnica de diagnostico, consulta essa memoria e lista o store durante a inicializacao.

Ele nao implementa regra de produto.

## Fora do Escopo

- IA.
- Embeddings.
- Banco de dados.
- Vetores.
- LLM.
- RAG.
- Automacoes.
- Sincronizacao.
- Nyx Local.
- Dashboard de memorias.
