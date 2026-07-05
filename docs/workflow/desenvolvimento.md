# Workflow de Desenvolvimento

## Objetivo

Definir um ciclo de trabalho consistente para humanos e agentes de IA.

## Branches

- `main`: linha estável.
- `docs/*`: documentação.
- `chore/*`: manutenção, organização e setup.
- `feature/*`: funcionalidades de produto.
- `fix/*`: correções.
- `experiment/*`: investigação descartável ou protótipo controlado.

Toda branch de sprint, hotfix, refactor ou mudança significativa deve nascer diretamente de `main`.

Fluxo oficial:

```text
main
  -> nova branch
  -> implementação
  -> commit
  -> push
  -> Pull Request com base em main
  -> review
  -> merge
  -> exclusão da branch
```

Branches empilhadas só podem ser usadas quando houver dependência técnica real, a sprint anterior ainda não puder ser mergeada e isso tiver sido solicitado explicitamente.

Na ausência dessa autorização, a Pull Request deve sempre ter:

- base: `main`;
- head: branch da sprint ou alteração atual.

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
chore: establish monorepo technical foundation
```

## Pull Requests

Ao concluir qualquer sprint, hotfix, refactor ou conjunto significativo de alterações, o fluxo só termina após:

- commit;
- push;
- abertura da Pull Request;
- entrega do resumo final.

Todo PR deve explicar:

- contexto;
- escopo;
- arquivos ou áreas alteradas;
- como validar;
- riscos;
- pendências.

Após o merge, a branch remota deve ser removida. A próxima sprint deve nascer novamente de `main`.

## Estrutura obrigatória da Pull Request

O título deve seguir Conventional Commits e representar a alteração realizada no projeto.

Exemplos:

```text
docs(architecture): establish technical foundation
refactor(core): simplify event routing
```

A descrição deve focar apenas a evolução técnica do Nyx OS. Não deve mencionar ferramentas, autoria auxiliar ou processo interno.

Estrutura recomendada:

```markdown
# Summary

Resumo da alteração.

## Highlights

Principais mudanças.

## Validation

- lint
- tests
- build
- audit

## Notes

Observações importantes.

## Breaking Changes

Caso existam.

## Checklist

- [x] Documentação atualizada
- [x] Testes executados
- [x] Build realizado
- [x] ADRs atualizadas (quando aplicável)
```

## Resumo final obrigatório

Depois de abrir a Pull Request, o responsável deve entregar:

- branch;
- commit;
- título, descrição e link da Pull Request;
- arquivos criados, modificados, removidos e movidos;
- validação de lint, testes, build, audit e CI quando existir;
- pendências;
- próximo passo sugerido.

## Ciclo recomendado

1. Ler `docs/README.md`.
2. Confirmar se a mudança é documentação, setup, correção ou feature.
3. Atualizar `main` localmente.
4. Criar branch com prefixo adequado a partir de `main`.
5. Fazer mudanças pequenas e auditáveis.
6. Atualizar documentação/ADRs quando houver decisão permanente.
7. Rodar checks relevantes.
8. Abrir PR com base em `main`.
9. Fazer merge apenas após revisão.
10. Excluir a branch após merge.

## Regras para agentes de IA

- Não misturar sprint de documentação/setup com feature de produto.
- Não criar funcionalidades sem pedido explícito.
- Não substituir `docs/` por prompts.
- Não versionar builds, caches, secrets ou dependências instaladas.
- Registrar decisões importantes em ADRs.
- Não mencionar ferramentas, IA ou autoria auxiliar em títulos, descrições, commits ou notas de Pull Request.
