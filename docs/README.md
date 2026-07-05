# Documentacao do Nyx OS

Esta pasta e a fonte de verdade conceitual do Nyx OS.

Ela existe para que qualquer pessoa consiga entender o projeto sem depender do historico de conversas.

A documentação oficial do Nyx OS é escrita em Português do Brasil. Comandos, código, nomes de arquivos, APIs, pacotes, Conventional Commits e termos técnicos consolidados podem permanecer no idioma original quando isso preservar clareza técnica.

## Como ler

1. Comece pelo `README.md` da raiz para instalar e executar o projeto.
2. Leia `fundamentos/constituicao.md`.
3. Leia `fundamentos/visao-produto.md` para entender o produto.
4. Leia `fundamentos/mvp.md` para entender o primeiro recorte funcional.
5. Leia `arquitetura/visao-geral.md` para entender como o sistema deve crescer.
6. Leia `arquitetura/fundacao-tecnica.md` para entender a stack e o monorepo.
7. Leia `workflow/desenvolvimento.md` para entender o fluxo oficial de contribuicao.
8. Leia `workflow/dx-validation.md` para entender a validacao obrigatoria de onboarding.
9. Consulte `decisoes/` para decisoes permanentes.
10. Use `prompts/nyx-program-context.md` quando for orientar agentes de desenvolvimento.

## Papel de cada pasta

- `fundamentos/`: identidade, visao, principios, MVP e direcao do produto.
- `arquitetura/`: visao tecnica e organizacao modular.
- `decisoes/`: ADRs e decisoes que nao devem ser perdidas.
- `roadmap/`: fases de evolucao.
- `sprints/`: historico de execucao.
- `workflow/`: processo de engenharia, qualidade, DX Validation e configuracao.
- `prompts/`: orientacoes canonicas para agentes quando fizerem parte da documentacao do projeto.

## Regra principal

Prompts, conversas e arquivos auxiliares podem ajudar, mas nao substituem esta documentacao.

`.ai/` pode guardar historico local de prompts, protocolo operacional e contexto de sessao, mas decisoes permanentes devem viver em `docs/`.

## Documentos de workflow

- `workflow/desenvolvimento.md`: ciclo oficial de branches, commits e Pull Requests.
- `workflow/qualidade.md`: checks de qualidade e criterios gerais.
- `workflow/dx-validation.md`: procedimento obrigatorio para validar onboarding.
- `workflow/configuracao.md`: configuracao inicial do ambiente.
- `workflow/engineering-manifesto.md`: principios de engenharia.

## Documentos adicionados nas Sprints recentes

- `fundamentos/glossario.md`: vocabulario oficial do ecossistema Nyx.
- `arquitetura/modelo-de-dados.md`: modelo conceitual baseado em grafo de contexto.
- `arquitetura/apis.md`: filosofia das APIs e fronteiras de acesso aos dados.
- `arquitetura/nyx-local.md`: papel futuro da Nyx Local e decisao de nao implementar agora.
- `seguranca/dados-e-privacidade.md`: principios iniciais de seguranca, privacidade e acesso da IA.
- `sprints/plano-sprint-01.md`: ordem oficial para a proxima sprint.
- `arquitetura/fundacao-tecnica.md`: stack oficial, monorepo, packages, dependencias e qualidade.
- `arquitetura/core-runtime.md`: runtime base, event bus, services e dashboard executavel.
- `arquitetura/event-bus.md`: contrato oficial de eventos, lifecycle e boas praticas.
- `arquitetura/logging.md`: contrato central de logging e Logger Service.
- `packages/state/README.md`: contrato central de estado do Runtime.
- `workflow/desenvolvimento.md`: ciclo oficial de branches, commits e Pull Requests.
- `workflow/dx-validation.md`: validacao oficial de experiencia de desenvolvimento.
- `decisoes/ADR-0013-runtime-generico-servicos.md`: decisão de runtime genérico e serviços desacoplados.
- `decisoes/ADR-0014-logging-por-contrato.md`: decisão de logging por contrato.
- `decisoes/ADR-0015-event-bus-oficial.md`: decisão de Event Bus oficial tipado.

## Decisoes recentes

- O Nyx OS comeca em nuvem por viabilidade, mas deve preservar caminho para migracao futura a ambiente local proprio.
- A experiencia deve fazer o usuario sentir que o Nyx OS e sua casa, nao apenas um banco de dados.
- O dominio segue a ideia de grafo de contexto: entidades independentes, mas conectaveis.
- Memoria e contexto persistente vivo, nao apenas historico de conversa ou embeddings.
- Toda Sprint deve nascer diretamente de `main`, abrir Pull Request para `main`, passar por DX Validation e remover a branch depois do merge.
- A documentação oficial deve permanecer em Português do Brasil, com exceções técnicas documentadas no workflow.
- O Runtime deve ser genérico, conhecer apenas serviços registrados e manter integrações futuras desacopladas.
- `ConfigService` é o primeiro serviço base oficial registrado pelo Runtime.
- Serviços devem depender de contratos como `NyxLogger`, não de implementações concretas como `console`.
- `RuntimeStateService` é a fonte de verdade interna sobre o estado atual do Runtime e dos serviços registrados.
- `@nyx-os/event-bus` é o contrato oficial de comunicação por eventos do Runtime.
