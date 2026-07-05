# ADR-0006 — Definição de Memória

## Status

Aceita.

## Contexto

O termo memória apareceu em vários pontos do projeto e poderia significar notas, decisões, histórico, preferências, diário, embeddings ou registros importantes.

Sem definição, agentes futuros poderiam implementar memória de formas incompatíveis com a visão do Nyx OS.

## Decisão

No Nyx OS, memória é qualquer informação que precisa sobreviver ao tempo e pode ser usada futuramente para fornecer contexto ao usuário ou à IA.

Memória pode incluir:

- notas;
- decisões;
- preferências;
- registros importantes;
- check-ins;
- histórico;
- referências;
- aprendizados;
- contexto de projetos.

Tecnicamente, algumas dessas categorias podem ser entidades próprias. Conceitualmente, todas fazem parte da memória viva do sistema.

## Consequências

- Memória não será tratada apenas como embeddings ou histórico de conversa.
- Memória deve aparecer na experiência do usuário, não apenas no banco.
- O cockpit deve ajudar o usuário a se reconhecer no sistema.
- A Nyx Assistente deve consultar memória como contexto, não como verdade absoluta sem interpretação.
