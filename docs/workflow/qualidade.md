# Qualidade de Código

## Objetivo

Criar uma base de qualidade sem burocracia excessiva.

## Checks iniciais

- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit`

## Developer Experience Validation

Toda Sprint, hotfix, refactor ou mudanca significativa deve confirmar que o onboarding documentado continua funcionando.

O procedimento oficial esta em `docs/workflow/dx-validation.md` e deve ser usado principalmente quando houver mudancas em:

- README;
- setup local;
- scripts;
- estrutura do monorepo;
- workflow de Git;
- configuracao de ambiente;
- comandos de validacao.

## Python futuro

Quando módulos Python forem implementados:

- `ruff check`
- `ruff format --check`
- `mypy`
- `pytest`

## Coverage

Coverage será exigido apenas quando houver massa crítica de código de domínio.

## Static analysis

Análises estáticas devem ser adicionadas gradualmente, sem impedir o MVP por excesso de ferramenta.

## Regra

Quality gates devem proteger manutenção e segurança, não virar obstáculo para documentação ou exploração controlada.
