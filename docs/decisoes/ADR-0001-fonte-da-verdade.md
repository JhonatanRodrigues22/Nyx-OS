# ADR-0001: Fonte de verdade do projeto

## Status

Aceita.

## Contexto

O projeto ficou com documentos conceituais, prompts de IA e arquivos locais misturados. Isso dificultava manutenção, auditoria e entendimento do que era decisão permanente.

## Decisão

- `docs/` é a fonte de verdade conceitual do Nyx OS.
- `.ai/` é apoio operacional para agentes de IA, histórico de prompts, contexto local e protocolos de sessão.
- `docs/prompts/` pode conter orientações canônicas para agentes quando essas orientações fizerem parte da documentação do projeto.
- `src/` contém código real da aplicação.
- `scripts/` contém automações auxiliares versionáveis.
- Arquivos gerados, builds, caches, dependências instaladas e credenciais não devem subir para o Git.

## Consequências

- Documentos permanentes devem ser criados ou atualizados em `docs/`.
- Prompts podem referenciar `docs/`, mas não substituem decisões registradas.
- Se uma orientação de agente for permanente, ela deve estar em `docs/prompts/` ou em outro documento dentro de `docs/`.
- A pasta solta `Fundamentos/` não deve ser usada como fonte de verdade.
- PRs devem preservar essa separação.
