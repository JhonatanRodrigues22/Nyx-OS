# Nyx OS

Nyx OS é um sistema operacional pessoal em fase inicial. Sua proposta é centralizar captura, organização e recuperação de informações pessoais como tarefas, projetos, hábitos, finanças, check-ins, notas, decisões e memórias, com o mínimo de atrito.

Este repositório ainda não representa um produto finalizado. Ele existe para manter a arquitetura, o workflow e a base técnica compreensíveis, versionados e seguros antes da evolução do produto.

## Quick Start

```bash
git clone https://github.com/JhonatanRodrigues22/Nyx-OS.git
cd Nyx-OS
npm install
cp apps/web/.env.local.example apps/web/.env.local
npm run dev
```

No Windows PowerShell, use este comando para criar o arquivo de ambiente local:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

Depois acesse `http://localhost:3000`.

## Requisitos

- Git
- Node.js 20 ou superior
- npm
- Um projeto Supabase para uso real de banco de dados e autenticação

O app pode iniciar localmente com valores vazios ou placeholders do Supabase, mas persistência real exige um projeto Supabase no free tier.

## Setup Do Zero

1. Clone o repositório:

```bash
git clone https://github.com/JhonatanRodrigues22/Nyx-OS.git
```

2. Entre na pasta do projeto:

```bash
cd Nyx-OS
```

3. Instale as dependências a partir da raiz do repositório:

```bash
npm install
```

4. Crie o arquivo de ambiente local:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

No Windows PowerShell:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

5. Preencha `apps/web/.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

6. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

7. Abra o app:

```text
http://localhost:3000
```

O app web vive em `apps/web`, mas os comandos principais devem ser executados pela raiz do repositório.

## Comandos Disponíveis

```bash
npm run dev
npm run lint
npm test
npm run build
npm run start
```

Use `npm run start` depois de executar `npm run build`.

## Status

- 00: Constituição do Projeto.
- 01: Arquitetura e Roadmap.
- 02: Visão do Produto e MVP.
- 03: Fundação Técnica e Setup do Projeto.
- 04: Core Runtime e Dashboard Base.
- 04.1: Developer Experience e Validação de Workflow.
- 05: Config Service e limpeza de ambiente.
- 06: Logging Service.
- 07: Runtime State Service.
- 08: Event Bus e sistema de eventos.
- 09: Plugin Framework.
- 10: Scheduler Engine.
- 11: Dev Dashboard: Estado Visual do Sistema.
- 12: Nyx Visual Overhaul.

A Sprint 04 introduziu a primeira base executável do Nyx OS: core runtime, serviços internos, event bus em memória e dashboard visual com dados mockados isolados.

A Sprint 04.1 consolidou a documentação de onboarding e o workflow oficial de Git.

A Sprint 11 transformou a tela inicial em um Dev Dashboard para visualizar saúde do sistema, Runtime, serviços, plugins, Scheduler, uptime, versão, ambiente e eventos recentes durante `npm run dev`.

A Sprint 12 redesenhou visualmente o Dev Dashboard com identidade Nyx premium, glassmorphism, neon roxo, magenta, azul elétrico, gauges, microindicadores e animações discretas, sem alterar a arquitetura do Runtime.

## Stack

- Next.js com React e TypeScript
- Supabase para banco de dados e autenticação
- Manifesto PWA e service worker gerado no build
- Jest e React Testing Library para testes
- ESLint para verificação estática
- npm workspaces para o monorepo

## Estrutura Do Projeto

```text
.ai/             Contexto operacional local e prompts.
apps/            Aplicações executáveis.
packages/        Pacotes compartilhados e módulos planejados.
configs/         Configurações compartilhadas.
docs/            Fonte de verdade conceitual do projeto.
scripts/         Scripts auxiliares do projeto.
tests/           Testes transversais futuros.
```

Arquivos gerados, caches, dependências instaladas, credenciais e saídas de build não devem ser versionados.

## Documentação

`docs/` é a fonte de verdade conceitual do Nyx OS. Use essa pasta para arquitetura, fundamentos, decisões, roadmap e registros de Sprint.

`.ai/` é apoio operacional. Prompts e protocolos de sessão podem viver ali, mas decisões arquiteturais permanentes pertencem a `docs/`.

Leitura recomendada:

1. `docs/README.md`
2. `docs/fundamentos/constituicao.md`
3. `docs/fundamentos/visao-produto.md`
4. `docs/fundamentos/mvp.md`
5. `docs/arquitetura/visao-geral.md`
6. `docs/fundamentos/glossario.md`
7. `docs/arquitetura/fundacao-tecnica.md`
8. `docs/workflow/desenvolvimento.md`
9. `docs/workflow/dx-validation.md`
10. `docs/arquitetura/dev-dashboard.md`

## Contributing

Antes de abrir uma Pull Request, garanta que você consegue seguir este README a partir de um ambiente limpo. Se o setup documentado deixou de funcionar, atualize a documentação como parte da sua contribuição.

Toda Sprint, hotfix, refactor ou mudança significativa deve usar o workflow oficial:

```text
main
  -> nova branch
  -> implementacao
  -> commit
  -> push
  -> Pull Request para main
  -> review
  -> merge
  -> exclusao da branch
```

Cada branch de Sprint deve ser criada diretamente a partir de `main`. Cada Pull Request deve apontar para `main`. Branches empilhadas só são permitidas quando houver necessidade técnica explícita e autorização prévia.

Antes de considerar uma Sprint concluída, execute a Developer Experience Validation documentada em `docs/workflow/dx-validation.md`.

## Aviso

Este repositório está em fase inicial. A prioridade atual é manter uma base limpa, compreensível e segura para evolução gradual.
