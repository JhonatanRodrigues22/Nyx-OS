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
3. Criar branch com prefixo adequado.
4. Fazer mudanças pequenas e auditáveis.
5. Atualizar documentação/ADRs quando houver decisão permanente.
6. Rodar checks relevantes.
7. Abrir PR.
8. Fazer merge apenas após revisão.

## Regras para agentes de IA

- Não misturar sprint de documentação/setup com feature de produto.
- Não criar funcionalidades sem pedido explícito.
- Não substituir `docs/` por prompts.
- Não versionar builds, caches, secrets ou dependências instaladas.
- Registrar decisões importantes em ADRs.
- Não mencionar ferramentas, IA ou autoria auxiliar em títulos, descrições, commits ou notas de Pull Request.
