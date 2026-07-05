# Visão Geral da Arquitetura

## Objetivo arquitetural

A arquitetura do Nyx OS deve permitir que o projeto comece simples, mas cresça como uma central pessoal modular.

O sistema precisa atender o MVP sem bloquear a visão futura de Nyx Local, micro PC, integrações, automações, dashboard expandido e APIs para agentes.

## Camadas iniciais

- `apps/web/src/pages/`: rotas Pages Router do Next.js.
- `apps/web/src/pages/api/`: endpoints backend executados pelo Next.js.
- `apps/web/src/lib/`: clientes e helpers compartilhados da aplicação web.
- `apps/web/src/components/`: componentes React reutilizáveis da aplicação web.
- `apps/web/src/types.ts`: tipos centrais atuais do domínio, até migrarem para packages.
- `apps/web/public/`: assets estáticos versionáveis da aplicação web.
- `packages/`: módulos compartilhados planejados do monorepo.
- `configs/`: configurações compartilhadas.
- `tests/`: testes transversais futuros.
- `docs/`: fonte de verdade conceitual e decisões permanentes.
- `.ai/`: contexto operacional, protocolos e prompts para agentes.

## Supabase

O Supabase será usado inicialmente para banco de dados PostgreSQL e autenticação.

A configuração do client fica em `src/lib/supabase.ts` e depende das variáveis:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Credenciais reais devem ficar em `.env.local`, que não é versionado.

## Entidades iniciais

- Task
- Project
- Habit
- HabitLog
- DailyCheckin
- FinanceEntry
- Decision
- Memory
- Note
- Tag

Essas entidades estão tipadas em `src/types.ts`.

## Módulos conceituais

### Dashboard

Camada de visualização principal. Deve mostrar o estado atual do usuário, do dia e dos projetos.

### Captura

Entrada rápida de tarefas, notas, decisões e memórias.

### Projetos

Organização de projetos ativos, status, próximos passos e histórico.

### Memória e decisões

Base de contexto para a Nyx e para continuidade do projeto.

### APIs para agentes

Endpoints simples para consulta e operação futura pela Nyx Assistente e Nyx Local.

## PWA

O manifesto fica em `public/manifest.json`.

Service workers e arquivos Workbox gerados pelo build não devem ser versionados.

## Integrações futuras

A arquitetura deve deixar espaço para:

- Obsidian;
- Workflow Lens;
- Home Assistant;
- Nyx Local;
- rotinas automatizadas;
- relatórios;
- interfaces de voz;
- servidor local.

## Regra de arquitetura

Toda decisão técnica deve equilibrar três forças:

1. Entregar valor no MVP.
2. Manter simplicidade.
3. Não destruir a visão de longo prazo.
