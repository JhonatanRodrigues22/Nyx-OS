# Continuidade do Projeto

## Objetivo

Definir como o Nyx OS deve continuar evoluindo sem deixar pontas soltas entre implementacao, documentacao, validacao e publicacao no GitHub.

Este documento complementa `docs/workflow/desenvolvimento.md`, `docs/workflow/qualidade.md` e `docs/workflow/dx-validation.md`.

## Regra central

Toda mudanca concluida com sucesso deve terminar com:

- documentacao atualizada quando houver impacto em produto, arquitetura, workflow, setup ou decisao permanente;
- checks relevantes executados;
- commit local com Conventional Commit;
- push da branch para o GitHub;
- Pull Request com base em `main`;
- pendencias explicitas, quando existirem.

Uma mudanca nao deve ser tratada como concluida apenas porque o codigo foi editado.

## Definicao de sucesso

Uma alteracao e considerada bem-sucedida quando:

- o escopo implementado corresponde ao plano ou ao pedido atual;
- nao ha arquivos relacionados sem documentacao necessaria;
- testes, lint e build relevantes foram executados ou tiveram bloqueio registrado;
- a arvore Git foi revisada antes do commit;
- somente arquivos do escopo foram versionados;
- a branch foi publicada no GitHub;
- o PR explica contexto, escopo, validacao, riscos e pendencias.

## Cadencia recomendada

1. Confirmar estado da branch e da arvore de trabalho.
2. Ler a documentacao canonica relacionada ao escopo.
3. Criar ou confirmar uma branch propria a partir de `main`.
4. Planejar uma entrega pequena e verificavel.
5. Implementar a mudanca.
6. Atualizar documentacao, ADRs ou registros de sprint quando necessario.
7. Executar checks proporcionais ao risco.
8. Revisar `git diff` e `git status`.
9. Commitar apenas os arquivos do escopo.
10. Publicar a branch no GitHub.
11. Abrir Pull Request para `main`.
12. Registrar pendencias e proximo passo.

## Escopo e documentacao

Atualize documentacao quando a mudanca:

- altera setup, comandos, variaveis de ambiente ou onboarding;
- muda contrato entre packages;
- adiciona ou remove uma rota, API, Tool, Capability, Automation ou Workflow;
- muda comportamento do Cockpit, Dev Dashboard ou Nyx Local;
- toma uma decisao permanente;
- cria uma limitacao nova que precisa ser conhecida por contribuidores futuros.

Use ADR quando a decisao for duradoura, estrutural ou dificil de reverter.

Use registro de sprint quando a mudanca faz parte de uma entrega planejada.

Use README quando a mudanca afeta descoberta, instalacao, execucao ou uso basico.

## Publicacao no GitHub

O fluxo padrao e:

```text
main
  -> branch curta e descritiva
  -> implementacao e documentacao
  -> validacao local
  -> commit
  -> push
  -> Pull Request para main
```

Se o ambiente local estiver sem credencial, sem GitHub CLI ou sem acesso de rede, a alteracao pode ficar commitada localmente, mas o bloqueio deve ser registrado no resumo final.

Nao misture arquivos fora do escopo para "aproveitar" um push.

## Pendencias

Toda entrega deve terminar com uma das tres situacoes:

- `Sem pendencias conhecidas`;
- uma lista curta de pendencias tecnicas;
- um bloqueio externo claro, com o comando ou dependencia que falhou.

Pendencias nao devem ficar apenas em conversa. Se forem relevantes para o projeto, registre em `docs/sprints/`, `ROADMAP.md`, `TODO.md` ou no PR.

## Proxima entrega padrao

Quando nao houver pedido mais especifico, priorize o menor incremento que aproxima o Nyx OS de uso diario real no Cockpit.

A ordem preferencial e:

1. captura rapida;
2. tarefas e projetos persistentes;
3. memories e decisoes pesquisaveis;
4. Tools de produto usadas pelo chat;
5. integracao Nyx Local apenas para casos concretos.

## Guardrails

- Nao expandir infraestrutura sem um caso de uso claro no Cockpit.
- Nao transformar o Nyx OS em apenas um chatbot.
- Nao deixar documentacao permanente em prompts ou conversas.
- Nao publicar alteracoes sem checks ou sem registrar por que os checks nao rodaram.
- Nao versionar secrets, caches, builds ou dependencias instaladas.
- Nao incluir mudancas nao rastreadas sem revisar se pertencem ao escopo.
