# ADR-0004: Acesso aos dados pelo ecossistema Nyx

## Status

Aceita.

## Contexto

O Nyx OS existe para sustentar a Nyx como assistente pessoal. Se os dados estão no sistema, eles devem poder ser usados para ajudar o usuário.

## Decisão

Dados inseridos no Nyx OS devem ser considerados acessíveis ao ecossistema Nyx, respeitando controles técnicos, segurança e clareza de uso.

A premissa de produto é: se o usuário colocou ou conversou sobre algo dentro do ecossistema, é porque deseja que a Nyx possa usar esse contexto.

## Consequências

- A arquitetura deve favorecer consulta por agentes.
- Dados sensíveis não devem ser expostos acidentalmente fora do ambiente esperado.
- Futuramente podem existir controles de silêncio, modo privado ou escopos de acesso.
- O sistema deve registrar ações importantes para manter auditabilidade.
