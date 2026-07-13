# Knowledge Engine

## Objetivo

O Knowledge Engine e o mecanismo oficial para ingerir documentos maiores, dividir conteudo em chunks pesquisaveis e executar busca simples sobre esses chunks.

Ele e diferente do `@nyx-os/memory`: Memory guarda memoria textual curta, como notas e registros do runtime. Knowledge lida com documentos maiores, como transcricoes, manuais, arquivos de texto e referencias extensas.

Ele tambem nao e o Context Engine. A Sprint 19 nao decide o que entra no prompt; apenas indexa e busca conteudo.

## Package

O package oficial e `@nyx-os/knowledge`.

Ele contem:

- `KnowledgeDocument`;
- `KnowledgeChunk`;
- `ChunkingStrategy`;
- `KnowledgeSearch`;
- `FixedSizeChunkingStrategy`;
- `KnowledgeStore`;
- `InMemoryKnowledgeStore`;
- `KnowledgeIngestor`;
- `KeywordKnowledgeSearch`;
- `KnowledgeSearchEngine`.

## Contratos

`KnowledgeDocument` declara:

- `id`;
- `title`;
- `source`;
- `content`;
- `metadata`.

`KnowledgeChunk` declara:

- `id`;
- `documentId`;
- `index`;
- `content`.

`ChunkingStrategy` define a fronteira para dividir documentos em chunks.

`KnowledgeSearch` define a fronteira de busca. A implementacao padrao usa palavra-chave, mas o contrato permite outra estrategia futura, como embeddings, sem mudar os consumidores.

## Chunking

`FixedSizeChunkingStrategy` divide documentos por tamanho fixo de caracteres com overlap configuravel.

Os valores padrao sao:

- `chunkSize`: 500 caracteres;
- `overlap`: 50 caracteres.

O overlap deve ser menor que o tamanho do chunk.

## Store

`InMemoryKnowledgeStore` guarda documentos e chunks em memoria.

Ele rejeita documento duplicado pelo mesmo `id` com erro explicito.

Persistencia duravel fica fora do escopo desta sprint.

## Ingestao

`KnowledgeIngestor` recebe um `KnowledgeDocument`, salva o documento no store, aplica a estrategia de chunking e salva os chunks gerados.

O resultado da ingestao retorna o documento e os chunks persistidos no store.

## Busca

`KnowledgeSearchEngine` recebe uma query e usa uma estrategia `KnowledgeSearch`.

A estrategia padrao e `KeywordKnowledgeSearch`, que:

- normaliza texto para minusculas;
- divide a query em termos;
- pontua chunks por ocorrencias dos termos;
- usa ocorrencias no titulo do documento como reforco de score;
- retorna resultados ordenados por score descrescente.

Busca sem resultado retorna lista vazia.

## Decisao Sobre Embeddings

A Sprint 19 implementa busca por palavra-chave/texto, sem embeddings.

Essa decisao foi registrada em `docs/decisoes/ADR-0021-knowledge-search-keyword-first.md`.

Embeddings permanecem uma alternativa futura, mas exigem nova decisao sobre modelo, custo, privacidade, armazenamento vetorial e execucao local ou remota.

## Fora do Escopo

- Embeddings reais.
- Busca semantica.
- Context Engine.
- Decisao sobre o que entra no prompt.
- Upload de arquivos via UI.
- Persistencia duravel.
- Banco vetorial.
