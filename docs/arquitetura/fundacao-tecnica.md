# Fundação Técnica do Nyx OS

Este documento define a fundação técnica oficial do Nyx OS. Ele não implementa funcionalidades de produto; apenas estabelece a base para evolução consistente do monorepo.

## Objetivos

- Sustentar crescimento modular por anos.
- Separar aplicações, domínio, infraestrutura e documentação.
- Preparar o projeto para IA, automações, Nyx Local e integrações futuras.
- Melhorar a experiência de desenvolvimento.
- Evitar reorganizações estruturais recorrentes.

## Stack oficial

### Linguagens

- TypeScript para interfaces web e código compartilhado do frontend.
- Python 3.13+ para serviços, automações, CLI e módulos locais futuros.

Justificativa: TypeScript é forte para UI e ecossistema web; Python é forte para IA, automação, serviços locais e produtividade.

### Aplicação web

- Stack atual: Next.js, React e TypeScript.
- Direção futura possível para dashboards isolados: React + Vite + TypeScript, se a separação de apps justificar.

Justificativa: Next.js já existe no projeto e atende bem a fundação inicial. Vite fica registrado como opção futura para apps puramente client-side.

### Backend e APIs

- Fase atual: APIs do próprio Next.js para simplicidade.
- Evolução planejada: FastAPI para serviços Python quando houver domínio ou automações que justifiquem separação.

Justificativa: o MVP precisa simplicidade; o longo prazo precisa contratos claros e serviços modulares.

### Banco de dados

- Fase atual: Supabase/PostgreSQL.
- Desenvolvimento local/futuro: SQLite pode ser usado em módulos locais quando fizer sentido.
- Longo prazo: preservar caminho para PostgreSQL e execução local.

Justificativa: Supabase acelera MVP; PostgreSQL é robusto; SQLite ajuda em Nyx Local e prototipação.

### Gerenciamento de dependências

- Node/npm workspaces para apps e packages JavaScript/TypeScript.
- `uv` para projetos Python quando módulos Python forem implementados.

### Qualidade

- ESLint para TypeScript/React.
- Ruff e Ruff Format para Python.
- mypy para tipagem Python.
- Jest e React Testing Library para web.
- pytest para Python.
- pre-commit para checks locais.

### Configuração

- `.env.example` documenta variáveis compartilhadas.
- `.env.local.example` documenta variáveis da aplicação web.
- Secrets reais nunca devem ser versionados.
- Configurações compartilhadas vivem em `configs/`.

### Logging e observabilidade

- Python futuro: `structlog` sobre `logging`.
- Web atual: logs mínimos, sem dados pessoais.
- Eventos de domínio e ações assistidas por IA devem ser rastreáveis no futuro.

### Automação

- GitHub Actions para CI.
- Conventional Commits para histórico.
- SemVer para versionamento quando o projeto tiver releases.

## Estrutura do monorepo

```text
apps/              Aplicações executáveis.
  web/             Aplicação web inicial.
packages/          Módulos compartilhados planejados.
docs/              Fonte de verdade conceitual e técnica.
scripts/           Automações auxiliares versionáveis.
configs/           Configurações compartilhadas.
infrastructure/    Infraestrutura futura.
docker/            Configurações Docker futuras.
assets/            Assets compartilhados.
tests/             Testes transversais futuros.
.github/           Workflows de CI e automação GitHub.
```

## Packages planejados

| Package | Responsabilidade |
| --- | --- |
| `core` | Domínio central, entidades e regras essenciais. |
| `memory` | Memória persistente e contexto vivo. |
| `ai` | Contratos com camadas de IA. |
| `events` | Eventos de domínio e barramento interno. |
| `automation` | Automações auditáveis. |
| `plugins` | Integrações conectáveis. |
| `shared` | Utilitários pequenos e desacoplados. |
| `config` | Configuração tipada e perfis. |
| `logging` | Logging, auditoria e rastreabilidade. |
| `database` | Contratos de persistência. |

Nenhum package de domínio é implementado nesta sprint.

## Arquitetura de dependências

```text
apps/*
  -> packages/core
  -> packages/memory
  -> packages/ai
  -> packages/events
  -> packages/shared
  -> packages/config
  -> packages/logging
  -> packages/database

packages/automation -> core, events, ai, logging
packages/plugins    -> core, events, config, logging
packages/memory     -> core, database, events
packages/ai         -> core, memory, events
packages/core       -> shared
```

Regras:

- Apps podem depender de packages.
- Packages não podem depender de apps.
- `core` não deve depender de infraestrutura concreta.
- `shared` não deve virar depósito de lógica de domínio.
- Dependências circulares são proibidas.
- Integrações devem depender de contratos, não de detalhes internos.

## Tratamento de erros

- Erros de usuário devem ser claros e acionáveis.
- Erros internos devem preservar contexto técnico sem expor dados sensíveis.
- APIs futuras devem usar códigos padronizados.
- Ações destrutivas ou assistidas por IA devem ser auditáveis.

## Testes

- Unitários: próximos ao código.
- Integração: em `tests/` quando cruzarem packages ou serviços.
- E2E: futura subpasta dedicada.
- Testes não devem depender de secrets reais.

## Quality gates

Pull Requests devem rodar, quando aplicável:

- instalação;
- lint;
- testes;
- build.

CI inicial está em `.github/workflows/ci.yml`.

## Regra de evolução

Esta fundação deve guiar organização técnica sem antecipar features. Quando uma decisão sair do nível conceitual para implementação permanente, deve gerar ou atualizar um ADR.
