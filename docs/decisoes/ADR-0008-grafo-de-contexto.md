# ADR-0008 — Grafo de Contexto

## Status

Aceita.

## Contexto

O Nyx OS precisa organizar tarefas, projetos, notas, decisões, memórias, check-ins, hábitos e registros financeiros.

Uma estrutura rígida demais faria uma entidade depender artificialmente da outra. Isso reduziria a capacidade do sistema de representar a vida real do usuário.

## Decisão

O modelo conceitual do Nyx OS seguirá a ideia de grafo de contexto.

Entidades podem existir de forma independente, mas devem poder ser conectadas por relações explícitas.

Exemplo:

- uma tarefa pode estar relacionada a um projeto;
- uma nota pode estar relacionada a uma decisão;
- um check-in pode gerar uma memória;
- uma decisão pode afetar vários projetos;
- um registro financeiro pode estar relacionado a um plano ou evento.

## Consequências

- O modelo de dados deve prever relações flexíveis.
- A experiência deve permitir recuperar contexto transversal.
- A Nyx Assistente poderá interpretar conexões, não apenas listas isoladas.
- O MVP pode começar simples, mas não deve bloquear relações futuras.
