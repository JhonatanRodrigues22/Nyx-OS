# Diretrizes de Desenvolvimento

## Objetivos

- Centralizar a gestao de dados pessoais.
- Minimizar atrito cognitivo.
- Permitir acesso por PC e celular.
- Preservar clareza, seguranca e auditabilidade do repositorio.

## Regras

1. Usar servicos gratuitos sempre que possivel.
2. Nao versionar credenciais, arquivos pessoais, caches ou builds.
3. Desenvolver por experiencia do usuario: capturar, encontrar, conectar.
4. Preferir prototipos pequenos antes de adicionar complexidade.
5. Registrar decisoes permanentes em `docs/decisoes/`.
6. Manter prompts e contexto de agentes em `.ai/`, sem substituir `docs/`.
7. Usar TypeScript para codigo da aplicacao.
8. Rodar testes, lint e build antes de PRs relevantes.

## Fluxo de trabalho

- Cada sprint deve ter objetivo claro.
- Mudancas devem entrar por branch e Pull Request.
- PRs devem explicar contexto, alteracoes, validacao e pendencias.
- Sprints de limpeza nao devem adicionar features.

## Integracao com a Nyx Assistente

A Nyx Assistente deve interagir com APIs simples e bem documentadas. Automacoes futuras precisam ser auditaveis, reversiveis quando possivel e registradas em decisoes de arquitetura.
