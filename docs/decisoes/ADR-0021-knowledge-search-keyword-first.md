# ADR-0021: Busca Inicial do Knowledge Engine por Palavra-Chave

## Status

Aceita.

## Contexto

O Nyx OS passa a ter um Knowledge Engine para ingerir documentos maiores, gerar chunks pesquisaveis e permitir busca sobre esse conteudo.

Existem duas estrategias principais para a busca:

- busca por palavra-chave/texto;
- busca semantica por embeddings.

Busca por embeddings pode ser mais poderosa para recuperar conteudo semanticamente relacionado, mas exige decisoes adicionais:

- qual modelo de embeddings usar;
- se o modelo sera local ou via API externa;
- custo de API, quando houver;
- armazenamento de vetores;
- privacidade dos documentos enviados para provedores externos;
- formato de indice vetorial;
- estrategia de atualizacao e migracao de vetores.

Essas decisoes ainda nao foram tomadas pelo projeto.

## Decisao

Implementar na Sprint 19 uma busca por palavra-chave/texto como estrategia padrao do Knowledge Engine.

O contrato `KnowledgeSearch` deve permanecer plugavel para permitir uma estrategia futura baseada em embeddings sem quebrar consumidores.

## Alternativas Consideradas

- Implementar embeddings ja na Sprint 19.
- Usar uma API externa de embeddings como dependencia padrao.
- Escolher um modelo local de embeddings nesta sprint.
- Adiar a busca ate a decisao de embeddings.

## Consequencias

- A Sprint 19 permanece local, simples, sem custo e sem dependencia externa nova.
- A busca inicial e menos semantica e depende de termos presentes no conteudo.
- O projeto preserva a direcao local-first enquanto ainda permite evolucao futura.
- Embeddings continuam fora do escopo ate haver uma decisao explicita sobre modelo, custo, armazenamento e privacidade.
