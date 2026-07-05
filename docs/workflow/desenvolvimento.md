# Workflow de Desenvolvimento

## Objetivo

Definir um ciclo de trabalho consistente, simples e auditavel para todas as mudancas do Nyx OS.

## Branches

- `main`: linha estavel.
- `docs/*`: documentacao.
- `chore/*`: manutencao, organizacao e setup.
- `feature/*`: funcionalidades de produto.
- `fix/*`: correcoes.
- `hotfix/*`: correcoes urgentes sobre `main`.
- `refactor/*`: reorganizacao interna sem mudanca de comportamento.
- `experiment/*`: investigacao descartavel ou prototipo controlado.

Toda branch de sprint, hotfix, refactor ou mudanca significativa deve nascer diretamente de `main`.

Fluxo oficial:

```text
main
  -> nova branch
  -> implementacao
  -> commit
  -> push
  -> Pull Request com base em main
  -> review
  -> merge
  -> exclusao da branch
```

Branches empilhadas so podem ser usadas quando houver dependencia tecnica real, a sprint anterior ainda nao puder ser mergeada e isso tiver sido solicitado explicitamente.

Na ausencia dessa autorizacao, a Pull Request deve sempre ter:

- base: `main`;
- head: branch da sprint ou alteracao atual.

## Commits

Usar Conventional Commits:

- `docs:`
- `chore:`
- `feat:`
- `fix:`
- `test:`
- `refactor:`
- `ci:`

Exemplo:

```text
docs(workflow): improve onboarding and developer experience
```

## Pull Requests

Ao concluir qualquer Sprint, hotfix, refactor ou conjunto significativo de alteracoes, o fluxo so termina apos:

- commit;
- push;
- abertura da Pull Request com base em `main`;
- review;
- merge;
- exclusao da branch temporaria;
- entrega do resumo final.

Todo PR deve explicar:

- contexto;
- escopo;
- arquivos ou areas alteradas;
- como validar;
- riscos;
- pendencias.

Apos o merge, a branch remota deve ser removida. A proxima Sprint deve nascer novamente de `main`.

## Developer Experience Validation

Toda Sprint, hotfix, refactor ou mudanca significativa deve passar pela Developer Experience Validation antes de ser considerada concluida.

O procedimento oficial esta em `docs/workflow/dx-validation.md`.

O objetivo e confirmar que um novo desenvolvedor consegue instalar, executar e validar o projeto seguindo apenas o README e a documentacao oficial.

## Idioma da documentação

A documentação oficial do Nyx OS deve ser escrita em Português do Brasil.

Exceções permitidas:

- comandos;
- código;
- nomes de arquivos e paths;
- APIs;
- nomes de pacotes;
- Conventional Commits;
- termos técnicos consolidados;
- documentos futuros explicitamente marcados como tradução.

Quando houver dúvida, o texto explicativo deve permanecer em Português do Brasil e apenas o termo técnico deve ser mantido no idioma original.

## Estrutura obrigatoria da Pull Request

O titulo deve seguir Conventional Commits e representar a alteracao realizada no projeto.

Exemplos:

```text
docs(architecture): establish technical foundation
refactor(core): simplify event routing
docs(workflow): improve onboarding and developer experience
```

A descricao deve focar apenas a evolucao tecnica do Nyx OS. Nao deve mencionar ferramentas, autoria auxiliar ou processo interno.

Estrutura recomendada:

```markdown
# Summary

Resumo da alteracao.

## Highlights

Principais mudancas.

## Validation

- lint
- tests
- build
- audit
- DX Validation

## Notes

Observacoes importantes.

## Breaking Changes

Caso existam.

## Checklist

- [x] Documentacao atualizada
- [x] Testes executados
- [x] Build realizado
- [x] DX Validation executada
- [x] ADRs atualizadas (quando aplicavel)
```

## Resumo final obrigatorio

Depois de abrir e concluir a Pull Request, o responsavel deve entregar:

- branch;
- commit;
- titulo, descricao e link da Pull Request;
- arquivos criados, modificados, removidos e movidos;
- validacao de lint, testes, build, audit, DX Validation e CI quando existir;
- pendencias;
- proximo passo sugerido.

## Ciclo recomendado

1. Ler `README.md`.
2. Ler `docs/README.md` quando precisar de contexto de produto, arquitetura ou decisoes.
3. Confirmar se a mudanca e documentacao, setup, correcao ou feature.
4. Atualizar `main` localmente.
5. Criar branch com prefixo adequado a partir de `main`.
6. Fazer mudancas pequenas e auditaveis.
7. Atualizar documentacao/ADRs quando houver decisao permanente.
8. Rodar checks relevantes.
9. Executar a Developer Experience Validation quando a mudanca afetar onboarding, setup, comandos, workflow ou estrutura.
10. Abrir PR com base em `main`.
11. Fazer merge apenas apos review.
12. Excluir a branch apos merge.

## Regras para agentes de IA

- Nao misturar sprint de documentacao/setup com feature de produto.
- Nao criar funcionalidades sem pedido explicito.
- Nao substituir `docs/` por prompts.
- Nao versionar builds, caches, secrets ou dependencias instaladas.
- Registrar decisoes importantes em ADRs.
- Nao mencionar ferramentas, IA ou autoria auxiliar em titulos, descricoes, commits ou notas de Pull Request.
