# ADR-0011: Workflow e qualidade

## Status

Aceita.

## Contexto

O projeto será mantido por humanos e agentes de IA. Sem fluxo explícito, decisões e alterações podem ficar difíceis de auditar.

## Decisão

- Usar branches por tipo de trabalho.
- Usar Conventional Commits.
- Usar Pull Requests para mudanças relevantes.
- Rodar lint, testes e build quando houver código afetado.
- Usar GitHub Actions como CI inicial.
- Usar pre-commit como camada local opcional.

## Alternativas consideradas

- Fluxo livre sem convenção.
- GitFlow completo.

## Consequências

- O histórico fica mais legível.
- PRs ficam auditáveis.
- O processo permanece simples o suficiente para o estágio atual.
