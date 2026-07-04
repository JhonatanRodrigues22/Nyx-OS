# ADR-0001: Fonte de verdade do projeto

## Status

Aceita.

## Contexto

O projeto ficou com documentos conceituais, prompts de IA e arquivos locais misturados. Isso dificultava manutencao, auditoria e entendimento do que era decisao permanente.

## Decisao

- `docs/` e a fonte de verdade conceitual do Nyx OS.
- `.ai/` e apenas apoio para agentes de IA, prompts, contexto operacional e protocolos.
- `src/` contem codigo real da aplicacao.
- `scripts/` contem automacoes auxiliares versionaveis.
- Arquivos gerados, builds, caches, dependencias instaladas e credenciais nao devem subir para o Git.

## Consequencias

- Documentos permanentes devem ser criados ou atualizados em `docs/`.
- Prompts podem referenciar `docs/`, mas nao substituem decisoes registradas.
- A pasta solta `Fundamentos/` nao deve ser usada como fonte de verdade.
- PRs devem preservar essa separacao.
