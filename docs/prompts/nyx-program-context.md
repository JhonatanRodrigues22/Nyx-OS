# Contexto para Nyx Programa

Use este documento quando for orientar um agente de desenvolvimento a trabalhar no Nyx OS.

## Identidade do projeto

Nyx OS não é apenas um dashboard, planner ou CRUD de tarefas.

Nyx OS é a base operacional do ecossistema Nyx: uma central pessoal que organiza dados, rotina, projetos, decisões, memórias e integrações para que a Nyx Assistente e a Nyx Local tenham contexto real para ajudar o usuário.

## O que preservar

- A visão de casa digital / sistema operacional pessoal.
- A separação entre Nyx OS, Nyx Assistente e Nyx Local.
- A modularidade.
- A simplicidade do MVP.
- A documentação como fonte de verdade.
- O foco em reduzir atrito cognitivo.
- A possibilidade futura de rodar em micro PC/servidor próprio.

## Como desenvolver

1. Leia `docs/README.md`.
2. Leia `docs/fundamentos/constituicao.md`.
3. Leia `docs/fundamentos/visao-produto.md`.
4. Leia `docs/fundamentos/mvp.md`.
5. Leia `docs/arquitetura/visao-geral.md`.
6. Consulte `docs/decisoes/` antes de propor mudanças estruturais.

## Regras para novas features

Antes de implementar, responda:

- Isso pertence ao MVP ou a uma fase futura?
- Qual problema real resolve?
- Qual módulo afeta?
- Como será usado pela Nyx agora ou no futuro?
- Precisa de ADR?
- Precisa atualizar documentação?

## Proibições importantes

- Não transformar o Nyx OS em app genérico.
- Não ignorar a documentação existente.
- Não misturar visão futura com escopo do MVP.
- Não criar complexidade sem necessidade.
- Não acoplar módulos de forma irreversível.
- Não substituir `docs/` por prompts.

## Critério de entendimento

Um agente entendeu o projeto quando consegue explicar:

- o que é o Nyx OS;
- qual é o MVP;
- qual é a visão de longo prazo;
- como ele se relaciona com Nyx Assistente e Nyx Local;
- quais decisões não deve quebrar.


## Decisões que você deve preservar

- Não transforme o Nyx OS em apenas um chatbot com plugins.
- Trate o cockpit/dashboard como a home operacional do usuário.
- Preserve a metáfora de casa: o usuário precisa se reconhecer dentro do sistema.
- Modele dados pensando em grafo de contexto, não apenas listas isoladas.
- Considere Nyx Local como visão futura, não como prioridade do MVP.
- Preserve o caminho para migração futura a ambiente local próprio, mas não antecipe essa complexidade agora.
- Trate memória como contexto persistente vivo.
