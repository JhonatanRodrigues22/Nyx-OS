# ADR-0011: Workflow e Qualidade

## Status

Aceita.

## Contexto

O projeto será mantido por pessoas e agentes de desenvolvimento ao longo de várias Sprints. Sem um fluxo explícito, decisões, revisões e alterações podem ficar difíceis de auditar.

Após as primeiras Sprints, o projeto também identificou que branches empilhadas entre Sprints deixam o histórico mais difícil de navegar quando não existe uma dependência técnica real.

Também ficou decidido que a documentação principal do Nyx OS deve permanecer em Português do Brasil para manter consistência, clareza e continuidade com a fonte de verdade já existente.

## Decisão

- Usar branches por tipo de trabalho.
- Criar toda branch de Sprint, hotfix, refactor ou mudança significativa diretamente a partir de `main`.
- Abrir toda Pull Request significativa com base em `main`.
- Permitir branches empilhadas somente quando houver dependência técnica real e autorização explícita.
- Excluir branches temporárias depois do merge.
- Usar Conventional Commits.
- Usar Pull Requests para mudanças relevantes.
- Rodar lint, testes, build e audit quando aplicável.
- Exigir Developer Experience Validation antes de considerar uma Sprint concluída.
- Escrever a documentação oficial em Português do Brasil, mantendo exceções para comandos, código, paths, APIs, pacotes, Conventional Commits, termos técnicos consolidados e documentos explicitamente marcados como tradução.
- Usar GitHub Actions como CI inicial.
- Usar pre-commit como camada local opcional.

## Alternativas Consideradas

- Fluxo livre sem convenção.
- GitFlow completo.
- Branches empilhadas como fluxo padrão entre Sprints.
- Documentação bilíngue sem regra clara de idioma.

## Consequências

- O histórico fica mais legível.
- PRs ficam menores, independentes e mais fáceis de revisar.
- O onboarding passa a ser parte formal da qualidade do projeto.
- A documentação precisa ser atualizada sempre que o caminho de instalação, validação ou contribuição mudar.
- A documentação principal mantém uma voz única e previsível.
- O processo permanece simples o suficiente para o estágio atual.
