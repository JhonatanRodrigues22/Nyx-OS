# Documentação do Nyx OS

Esta pasta é a fonte de verdade conceitual do Nyx OS.

Ela existe para que qualquer pessoa ou agente de IA consiga entender o projeto sem depender do histórico de conversas.

## Como ler

1. Comece por `fundamentos/constituicao.md`.
2. Leia `fundamentos/visao-produto.md` para entender o produto.
3. Leia `fundamentos/mvp.md` para entender o primeiro recorte funcional.
4. Leia `arquitetura/visao-geral.md` para entender como o sistema deve crescer.
5. Leia `arquitetura/fundacao-tecnica.md` para entender a stack e o monorepo.
6. Consulte `decisoes/` para decisões permanentes.
7. Use `prompts/nyx-program-context.md` quando for orientar agentes de desenvolvimento.

## Papel de cada pasta

- `fundamentos/`: identidade, visão, princípios, MVP e direção do produto.
- `arquitetura/`: visão técnica e organização modular.
- `decisoes/`: ADRs e decisões que não devem ser perdidas.
- `roadmap/`: fases de evolução.
- `sprints/`: histórico de execução.
- `workflow/`: processo de engenharia, qualidade e configuração.
- `prompts/`: orientações canônicas para agentes quando fizerem parte da documentação do projeto.

## Regra principal

Prompts, conversas e arquivos auxiliares podem ajudar, mas não substituem esta documentação.

`.ai/` pode guardar histórico local de prompts, protocolo operacional e contexto de sessão, mas decisões permanentes devem viver em `docs/`.


## Documentos adicionados na Sprint de Documentação 2

- `fundamentos/glossario.md` — vocabulário oficial do ecossistema Nyx.
- `arquitetura/modelo-de-dados.md` — modelo conceitual baseado em grafo de contexto.
- `arquitetura/apis.md` — filosofia das APIs e fronteiras de acesso aos dados.
- `arquitetura/nyx-local.md` — papel futuro da Nyx Local e decisão de não implementar agora.
- `seguranca/dados-e-privacidade.md` — princípios iniciais de segurança, privacidade e acesso da IA.
- `sprints/plano-sprint-01.md` — ordem oficial para a próxima sprint.
- `arquitetura/fundacao-tecnica.md` — stack oficial, monorepo, packages, dependências e qualidade.
- `arquitetura/core-runtime.md` — runtime base, event bus, services e dashboard executável.
- `workflow/desenvolvimento.md` — ciclo oficial de branches, commits e Pull Requests.

## Decisões recentes

- O Nyx OS começa em nuvem por viabilidade, mas deve preservar caminho para migração futura a ambiente local próprio.
- A experiência deve fazer o usuário sentir que o Nyx OS é sua casa, não apenas um banco de dados.
- O domínio seguirá a ideia de grafo de contexto: entidades independentes, mas conectáveis.
- Memória é contexto persistente vivo, não apenas histórico de conversa ou embeddings.
