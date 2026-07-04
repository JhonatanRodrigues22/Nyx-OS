# Sprint 0.5 — Limpeza, Arquitetura e Controle

## Objetivo da sprint

Recuperar a clareza estrutural do Nyx OS, separando codigo, documentacao conceitual, prompts de IA, scripts auxiliares e arquivos gerados.

## Estado inicial encontrado

- Repositorio remoto com README em ingles e prompts dentro de `.ai/`.
- Ambiente local com fundacao funcional em Next.js, TypeScript, Supabase, PWA e testes.
- Pasta local `Fundamentos/` com documentos conceituais uteis, mas fora da estrutura versionavel.
- Pasta `scripts/` ignorada apesar de conter `package.py`, um script auxiliar util.
- Pastas geradas e locais como `.next/`, `.swc/`, `dist/`, `node_modules/` e service workers gerados.

## Arquivos e pastas movidos

- Conteudo conceitual de `Fundamentos/` foi migrado para `docs/fundamentos/`.
- Prompts soltos em `.ai/` foram movidos para `.ai/prompts/`.
- `scripts/package.py` foi mantido em `scripts/` e passou a ser versionavel.

## Arquivos e pastas removidos

- A pasta local solta `Fundamentos/` foi removida apos migracao do conteudo util.
- Artefatos de build/cache continuam fora do Git por `.gitignore`.

## Arquivos criados

- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/fundamentos/constituicao.md`
- `docs/fundamentos/diretrizes.md`
- `docs/arquitetura/visao-geral.md`
- `docs/roadmap/README.md`
- `docs/decisoes/ADR-0001-fonte-da-verdade.md`
- `docs/sprints/sprint-00-constituicao-fundamentos.md`
- `.ai/protocol.md`
- `.ai/context/README.md`

## Decisoes tomadas

- `docs/` e a fonte de verdade conceitual.
- `.ai/` nao substitui documentacao permanente.
- `scripts/` deve ser versionado quando contem automacoes uteis.
- `Fundamentos/` nao deve permanecer como pasta solta na raiz.
- Service workers e arquivos Workbox gerados pelo build nao devem ser versionados.

## Testes executados

- `npm install`
- `npm test -- --runInBand`
- `npm run lint`
- `npm run build`

## Resultado dos testes

- `npm install`: passou, dependencias atualizadas, `0 vulnerabilities`.
- `npm test -- --runInBand`: passou, 1 suite e 1 teste.
- `npm run lint`: passou.
- `npm run build`: passou.
- `python scripts/package.py`: passou e gerou `dist/nyx-os.zip`; `dist/` foi removido depois da validacao.
- Artefatos gerados pelo build (`.next/`, `.swc/`, `public/sw.js`, `public/workbox-*.js`) foram removidos localmente apos a validacao e permanecem ignorados.

## Pendencias

- Revisar em PR se a documentacao cobre bem a visao atual do projeto.
- Definir em sprint futura o nivel de detalhe esperado para ADRs.

## Proximo passo recomendado

Revisar e aprovar a Sprint 0.5 antes de iniciar qualquer nova sprint de produto.
