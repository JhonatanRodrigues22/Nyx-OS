# Sprint 04.1 - Developer Experience & Workflow Validation

## Objetivo

Melhorar a experiencia de onboarding do projeto e consolidar oficialmente o workflow de contribuicao do Nyx OS.

Esta Sprint e de qualidade e documentacao. Ela nao implementa funcionalidades de produto.

## Entregas

- README revisado pela perspectiva de uma nova pessoa desenvolvedora.
- Secao Quick Start no inicio do README.
- Setup do zero documentado com clone, instalacao, ambiente local e execucao.
- Secao Contributing no README.
- Procedimento oficial de Developer Experience Validation.
- Workflow de Git consolidado:
  - branch nasce de `main`;
  - Pull Request aponta para `main`;
  - review antes do merge;
  - branch temporaria e removida apos merge.
- ADR-0011 atualizado com a decisao permanente.

## Fora de escopo

- Novas funcionalidades do Nyx OS.
- Mudancas no dashboard.
- Mudancas no runtime.
- Mudancas no modelo de dados.
- Mudancas em autenticacao, banco, IA ou memoria.

## Validacao esperada

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit`
- Verificacao manual de que o README permite executar o projeto sem instrucoes externas.

## Criterio de conclusao

A Sprint so e concluida apos:

- commit;
- push;
- Pull Request com base em `main`;
- CI aprovado;
- merge;
- exclusao da branch temporaria;
- resumo final entregue.
