# ADR-0002: Modularidade como princípio estrutural

## Status

Aceita.

## Contexto

O Nyx OS possui uma visão de longo prazo ampla: dashboard, dados pessoais, Nyx Assistente, Nyx Local, integrações, automações e possível servidor próprio.

Sem modularidade, o projeto pode virar um monólito difícil de manter e impossível de expandir.

## Decisão

O Nyx OS deve ser desenvolvido de forma modular.

Módulos podem compartilhar tipos, autenticação e banco, mas devem evitar dependências rígidas entre si.

## Consequências

- Novas features devem declarar qual módulo afetam.
- O MVP deve evitar arquitetura excessivamente complexa, mas não deve misturar tudo sem critério.
- Integrações futuras devem usar contratos claros.
- Refatorações devem preservar a separação entre dados, UI, domínio e APIs.
