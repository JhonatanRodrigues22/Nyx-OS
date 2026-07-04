# Visao Geral da Arquitetura

## Camadas

- `src/pages/`: rotas Pages Router do Next.js.
- `src/pages/api/`: endpoints backend executados pelo Next.js.
- `src/lib/`: clientes e helpers compartilhados.
- `src/components/`: componentes React reutilizaveis.
- `src/types.ts`: tipos centrais do dominio.
- `public/`: assets estaticos versionaveis.

## Supabase

O Supabase sera usado para banco de dados PostgreSQL e autenticacao. A configuracao do client fica em `src/lib/supabase.ts` e depende das variaveis:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Credenciais reais devem ficar em `.env.local`, que nao e versionado.

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

Essas entidades estao tipadas em `src/types.ts`.

## PWA

O manifesto fica em `public/manifest.json`. Service workers e arquivos Workbox gerados pelo build nao devem ser versionados.
