# ADR-0011: Workflow e qualidade

## Status

Aceita.

## Contexto

O projeto sera mantido por pessoas e agentes de desenvolvimento ao longo de varias Sprints. Sem um fluxo explicito, decisoes, revisoes e alteracoes podem ficar dificeis de auditar.

Apos as primeiras Sprints, o projeto tambem identificou que branches empilhadas entre Sprints deixam o historico mais dificil de navegar quando nao existe uma dependencia tecnica real.

## Decisao

- Usar branches por tipo de trabalho.
- Criar toda branch de Sprint, hotfix, refactor ou mudanca significativa diretamente a partir de `main`.
- Abrir toda Pull Request significativa com base em `main`.
- Permitir branches empilhadas somente quando houver dependencia tecnica real e autorizacao explicita.
- Excluir branches temporarias depois do merge.
- Usar Conventional Commits.
- Usar Pull Requests para mudancas relevantes.
- Rodar lint, testes, build e audit quando aplicavel.
- Exigir Developer Experience Validation antes de considerar uma Sprint concluida.
- Usar GitHub Actions como CI inicial.
- Usar pre-commit como camada local opcional.

## Alternativas consideradas

- Fluxo livre sem convencao.
- GitFlow completo.
- Branches empilhadas como fluxo padrao entre Sprints.

## Consequencias

- O historico fica mais legivel.
- PRs ficam menores, independentes e mais faceis de revisar.
- O onboarding passa a ser parte formal da qualidade do projeto.
- A documentacao precisa ser atualizada sempre que o caminho de instalacao, validacao ou contribuicao mudar.
- O processo permanece simples o suficiente para o estagio atual.
