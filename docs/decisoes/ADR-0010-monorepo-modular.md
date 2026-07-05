# ADR-0010: Monorepo modular

## Status

Aceita.

## Contexto

O Nyx OS deve crescer como ecossistema com web, domínio, memória, IA, eventos, automações, plugins e possível execução local.

## Decisão

O projeto será organizado como monorepo com:

- `apps/` para aplicações executáveis;
- `packages/` para módulos compartilhados;
- `docs/` para fonte de verdade;
- `scripts/`, `configs/`, `infrastructure/`, `docker/`, `assets/` e `tests/` para suporte.

## Alternativas consideradas

- Repositório único sem separação.
- Vários repositórios desde o começo.

## Consequências

- A navegação fica mais clara.
- Dependências entre módulos precisam ser controladas.
- Packages podem nascer como documentação antes de implementação.
- Apps não devem ser dependência de packages.
