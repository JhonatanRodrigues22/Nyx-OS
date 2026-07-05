# Nyx OS

Nyx OS is a personal operating system in its early foundation stage. Its purpose is to centralize capture, organization and retrieval of personal information such as tasks, projects, habits, finances, check-ins, notes, decisions and memories with minimal friction.

This repository is not a finished product yet. It exists to keep the architecture, workflow and technical base understandable, versioned and safe before the product grows.

## Quick Start

```bash
git clone https://github.com/JhonatanRodrigues22/Nyx-OS.git
cd Nyx-OS
npm install
cp apps/web/.env.local.example apps/web/.env.local
npm run dev
```

On Windows PowerShell, use this command to create the local environment file:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

Then open `http://localhost:3000`.

## Requirements

- Git
- Node.js 20 or newer
- npm
- A Supabase project for real database and authentication usage

The app can start locally with placeholder Supabase values, but real persistence requires a Supabase free tier project.

## Setup From Scratch

1. Clone the repository:

```bash
git clone https://github.com/JhonatanRodrigues22/Nyx-OS.git
```

2. Enter the project folder:

```bash
cd Nyx-OS
```

3. Install dependencies from the repository root:

```bash
npm install
```

4. Create the local environment file:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

On Windows PowerShell:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

5. Fill `apps/web/.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

6. Start the development server:

```bash
npm run dev
```

7. Open the app:

```text
http://localhost:3000
```

The web app lives in `apps/web`, but the main commands should be executed from the repository root.

## Available Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm run start
```

`npm run start` should be used after `npm run build`.

## Status

- 00: Project Constitution.
- 01: Architecture and Roadmap.
- 02: Product Vision and MVP.
- 03: Technical Foundation and Project Setup.
- 04: Core Runtime and Dashboard Base.
- 04.1: Developer Experience and Workflow Validation.

Sprint 04 introduced the first executable base of Nyx OS: core runtime, internal services, in-memory event bus and a visual dashboard with isolated mock data.

Sprint 04.1 consolidates onboarding documentation and the official Git workflow.

## Stack

- Next.js with React and TypeScript
- Supabase for database and authentication
- PWA manifest and generated service worker
- Jest and React Testing Library for tests
- ESLint for static checks
- npm workspaces for the monorepo

## Project Structure

```text
.ai/             Local operational context and prompts.
apps/            Executable applications.
packages/        Shared packages and planned modules.
configs/         Shared configuration.
docs/            Conceptual source of truth for the project.
scripts/         Auxiliary project scripts.
tests/           Future cross-project tests.
```

Generated files, caches, installed dependencies, secrets and build outputs must not be committed.

## Documentation

`docs/` is the conceptual source of truth for Nyx OS. Use it for architecture, fundamentals, decisions, roadmap and sprint records.

`.ai/` is operational support. Prompts and session protocols may live there, but permanent architectural decisions belong in `docs/`.

Recommended reading:

1. `docs/README.md`
2. `docs/fundamentos/constituicao.md`
3. `docs/fundamentos/visao-produto.md`
4. `docs/fundamentos/mvp.md`
5. `docs/arquitetura/visao-geral.md`
6. `docs/fundamentos/glossario.md`
7. `docs/arquitetura/fundacao-tecnica.md`
8. `docs/workflow/desenvolvimento.md`
9. `docs/workflow/dx-validation.md`

## Contributing

Before opening a Pull Request, make sure you can follow this README from a clean environment. If the documented setup no longer works, update the documentation as part of your contribution.

Every Sprint, hotfix, refactor or significant change must use the official workflow:

```text
main
  -> new branch
  -> implementation
  -> commit
  -> push
  -> Pull Request to main
  -> review
  -> merge
  -> delete branch
```

Each Sprint branch must be created directly from `main`. Each Pull Request must target `main`. Stacked branches are allowed only when there is an explicit technical need and prior authorization.

Before considering a Sprint complete, run the Developer Experience Validation documented in `docs/workflow/dx-validation.md`.

## Notice

This repository is in an early stage. The current priority is to keep a clean, understandable and safe base for gradual evolution.
