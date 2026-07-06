# ADR-0018: Memory Engine Oficial

## Status

Aceita.

## Contexto

O Nyx OS precisa de uma camada oficial para armazenar e recuperar memorias antes de introduzir IA, automacoes, busca semantica ou persistencia real.

Sem um contrato central, cada modulo futuro poderia criar seu proprio store, sua propria busca e seus proprios eventos, aumentando acoplamento e dificultando evolucao.

## Decisao

- Criar `@nyx-os/memory` como pacote oficial de memoria.
- Definir `NyxMemoryService` como contrato publico.
- Implementar `MemoryManager` como primeira orquestracao.
- Definir `MemoryStore` como fronteira de persistencia.
- Implementar `InMemoryMemoryStore` como primeira implementacao.
- Implementar busca simples por ID, texto, categoria e tags.
- Integrar memoria ao Runtime por `runtime.getMemory()`.
- Disponibilizar memoria para plugins por `context.memory`.
- Emitir eventos oficiais:
  - `memory.created`;
  - `memory.updated`;
  - `memory.deleted`;
  - `memory.loaded`;
  - `memory.saved`;
  - `memory.search`.
- Criar `MemoryPlugin` apenas como validacao arquitetural.

## Alternativas Consideradas

- Implementar memoria diretamente no Runtime.
- Persistir em banco desde o inicio.
- Usar SQLite nesta sprint.
- Introduzir embeddings ou busca semantica antes do contrato base.
- Deixar cada plugin criar seu proprio mecanismo de memoria.

## Consequencias

- O Runtime passa a expor uma memoria oficial e desacoplada.
- Plugins podem criar e consultar memorias sem conhecer stores concretos.
- Persistencia futura pode substituir o store em memoria sem alterar consumidores.
- Busca semantica futura pode substituir a busca simples sem remover o contrato.
- IA, embeddings, vetores, banco de dados, RAG, LLM e automacoes permanecem fora do escopo atual.
