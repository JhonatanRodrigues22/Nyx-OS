# Personal Data Modules

## Objetivo

Os Personal Data Modules sao os primeiros modulos de dado pessoal persistente do Nyx OS.

Eles cobrem tarefas, habitos, projetos e financas com CRUD simples, validacao explicita e persistencia via repositorios.

## Package

O package oficial e `@nyx-os/personal-data`.

Ele expoe:

- `PersonalDataRepository<T>`;
- `InMemoryRepository<T>`;
- `SupabaseRepository<T>`;
- `TaskRepository`;
- `HabitRepository`;
- `ProjectRepository`;
- `FinanceRepository`;
- tipos `Task`, `Habit`, `Project` e `FinanceEntry`.

## Persistencia

A persistencia real inicial usa Supabase, conforme `docs/decisoes/ADR-0022-personal-data-supabase-persistence.md`.

O schema versionado esta em `supabase/migrations/20260713000000_create_personal_data_modules.sql`.

Esse SQL precisa ser aplicado manualmente pelo JJ no painel do Supabase ou via Supabase CLI antes dos endpoints reais usarem esses dados.

O Codex nao presume acesso administrativo ao projeto Supabase real e nao executa essa migracao automaticamente.

## Repositorios

`PersonalDataRepository<T>` define a fronteira comum:

- `create`;
- `list`;
- `get`;
- `update`;
- `delete`.

`SupabaseRepository<T>` implementa essa fronteira usando um client Supabase injetado e nome de tabela.

`InMemoryRepository<T>` existe para testes e desenvolvimento sem rede. Testes automatizados nao devem chamar Supabase real.

## Dominios

`Task` declara:

- `id`;
- `title`;
- `done`;
- `dueDate`;
- `projectId`.

`Habit` declara:

- `id`;
- `name`;
- `frequency`;
- `createdAt`.

`Project` declara:

- `id`;
- `name`;
- `status`;
- `description`.

`FinanceEntry` declara:

- `id`;
- `description`;
- `amount`;
- `type`;
- `date`;
- `category`.

## Validacao

Cada repositorio tipado aplica validacao explicita antes de persistir criacoes ou atualizacoes.

Exemplos:

- `Task.title` nao pode ser vazio;
- `Habit.frequency` nao pode ser vazia;
- `Project.status` precisa ser um status conhecido;
- `FinanceEntry.amount` nao pode ser negativo;
- `FinanceEntry.type` precisa ser `income` ou `expense`.

Falhas de validacao lancam erro explicito.

## Dados Sensiveis

Dados financeiros reais nao devem aparecer em logs, commits ou changelog.

Commits e documentacao devem falar da estrutura e do comportamento, nunca de valores financeiros pessoais.

## Fora do Escopo

- UI.
- Streaks de habito.
- Recorrencia de tarefa.
- Relatorios financeiros.
- Multiplos usuarios.
- Migracao para persistencia local.
