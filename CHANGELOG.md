# Changelog

## Sprint 0.5 — Limpeza, Arquitetura e Controle

### Estado herdado

- O repositorio remoto continha documentacao inicial em ingles, prompts dentro de `.ai/` e pouca separacao entre arquitetura, contexto de agente e roadmap.
- O ambiente local tinha uma fundacao funcional em Next.js, TypeScript, Supabase, PWA e testes.
- Tambem havia pastas locais e geradas como `Fundamentos/`, `.next/`, `dist/`, `node_modules/` e service workers gerados.

### Reorganizado

- `docs/` passou a ser a fonte de verdade conceitual do projeto.
- `.ai/` foi reorganizada para conter apenas prompts, contexto operacional e protocolo de agentes.
- `README.md` foi reescrito em portugues.
- `ROADMAP.md` foi criado com as fases previstas.
- `scripts/` passou a ser versionado quando contem automacoes uteis.
- `.gitignore` foi corrigido para ignorar builds, caches, logs, credenciais e artefatos gerados.

### Removido ou deixado fora do Git

- A pasta solta `Fundamentos/` deixou de ser a fonte de verdade e seu conteudo util foi migrado para `docs/fundamentos/`.
- Artefatos gerados por build e PWA continuam fora do Git.
- Dependencias instaladas e caches locais continuam fora do Git.

### Mantido

- Fundacao funcional da aplicacao em `src/`.
- Configuracoes de teste, lint, build, Supabase e PWA.
- Script auxiliar `scripts/package.py`, agora versionavel.

### Proximos passos

- Revisar e aprovar a nova organizacao.
- Usar PRs separados para sprints de produto.
- Evitar novas features dentro de sprints de saneamento estrutural.
