# Nyx OS

Nyx OS e um sistema operacional pessoal em fase inicial. A proposta e centralizar captura, organizacao e recuperacao de dados pessoais como tarefas, projetos, habitos, financas, check-ins, notas, decisoes e memorias, com o minimo de atrito.

O projeto ainda nao e um produto pronto. Esta base existe para tornar a arquitetura compreensivel, versionavel e segura antes de avancar para novas funcionalidades.

## Status atual

- 00 — Constituicao do Projeto.
- 01 — Arquitetura e Roadmap.
- 02 — Visao do Produto e MVP.
- 03 — Fundacao Tecnica e Setup do Projeto.
- 04 — Core Runtime e Dashboard Base.

A Sprint 04 inicia a primeira fase executavel do Nyx OS: runtime base, servicos internos, event bus em memoria e dashboard visual com dados mockados isolados.

## Stack

- Next.js com React e TypeScript
- Supabase para banco de dados e autenticacao
- PWA com manifesto e service worker gerado no build
- Jest e React Testing Library para testes
- ESLint para verificacao estatica

## Instalacao

```bash
npm install
```

Crie um projeto no Supabase free tier e copie o arquivo de exemplo:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

No Windows PowerShell:

```powershell
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

Preencha `apps/web/.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

## Como rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`.

O app web vive em `apps/web`, mas os comandos principais devem ser executados pela raiz do monorepo.

## Como testar

```bash
npm test
npm run lint
npm run build
```

## Estrutura de pastas

```text
.ai/             Contexto, prompts e protocolo para agentes de IA.
apps/            Aplicações executáveis.
packages/        Packages compartilhados e módulos planejados.
configs/         Configurações compartilhadas.
docs/            Fonte de verdade conceitual do projeto.
scripts/         Automacoes auxiliares versionaveis.
tests/           Testes transversais futuros.
```

Arquivos gerados, caches, dependencias instaladas, credenciais e builds nao devem ser versionados.

## Documentacao

`docs/` e a fonte de verdade conceitual do Nyx OS. Use essa pasta para arquitetura, fundamentos, decisoes, roadmap e relatorios de sprint.

`.ai/` e apenas apoio operacional para agentes de IA. Prompts e protocolos podem ficar ali, mas decisoes arquiteturais permanentes devem ser registradas em `docs/`.

Leitura recomendada:

1. `docs/README.md`
2. `docs/fundamentos/constituicao.md`
3. `docs/fundamentos/visao-produto.md`
4. `docs/fundamentos/mvp.md`
5. `docs/arquitetura/visao-geral.md`
6. `docs/fundamentos/glossario.md`
7. `docs/arquitetura/fundacao-tecnica.md`

## Fluxo de contribuicao

1. Crie uma branch a partir de `main`.
2. Faca mudancas pequenas e auditaveis.
3. Rode testes, lint e build quando aplicavel.
4. Abra um Pull Request para `main`.
5. Descreva contexto, alteracoes, como testar e pendencias conhecidas.

Evite commits diretos em `main`. Toda sprint deve ter um PR claro.

## Aviso

Este repositorio esta em fase inicial. A prioridade atual e manter uma base limpa, compreensivel e segura para evolucao gradual.
