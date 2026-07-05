# Glossário do Ecossistema Nyx

Este glossário define os principais termos usados no Nyx OS. Ele existe para evitar ambiguidades entre produto, arquitetura, documentação e agentes de IA que venham a trabalhar no projeto.

## Nyx OS

Central operacional pessoal do usuário. É o lugar onde tarefas, projetos, decisões, memórias, notas, check-ins, hábitos, finanças e contexto passam a viver de forma estruturada.

O Nyx OS não é apenas um chatbot. Ele é a base operacional e informacional do ecossistema Nyx.

## Nyx Assistente

Camada de interação inteligente com o usuário. Pode conversar, interpretar dados, resumir contexto, sugerir próximos passos e futuramente operar ações no Nyx OS.

A Nyx Assistente usa o Nyx OS como base de dados e contexto. Ela não substitui o sistema.

## Nyx Local

Camada futura local/autônoma da Nyx, planejada para rodar em um ambiente próprio do usuário, como um mini PC ou mini servidor.

No momento, Nyx Local não é foco do MVP. A arquitetura deve apenas evitar decisões que impeçam essa migração futura.

## Nyx Programa

Agente ou modo de desenvolvimento responsável por ajudar a implementar, revisar ou evoluir o projeto.

A Nyx Programa deve respeitar a documentação em `docs/` como fonte de verdade.

## Dashboard / Cockpit

Tela principal do Nyx OS. Deve funcionar como a home operacional do usuário: mostrar o estado do dia, projetos vivos, pendências, decisões recentes, check-ins e contexto relevante.

O dashboard não é apenas uma tela bonita. Ele é a forma visual de o usuário sentir que o Nyx OS é sua casa.

## Casa

Metáfora central da experiência do Nyx OS.

O sistema deve ser sentido como um lugar onde o usuário se reconhece, não apenas como um banco de dados onde ele joga informações. O cockpit deve mostrar vida, continuidade, estado, histórico e identidade.

## Memória

Qualquer informação que precisa sobreviver ao tempo e pode ser usada futuramente para fornecer contexto ao usuário ou à IA.

Memória pode incluir notas, decisões, preferências, histórico, check-ins, registros importantes, aprendizados e referências.

## Grafo de Contexto

Modelo conceitual onde entidades existem de forma independente, mas podem se relacionar entre si.

Exemplo: uma nota pode estar conectada a um projeto, uma decisão, um dia específico, uma memória e uma tarefa. Nenhuma dessas entidades precisa obrigatoriamente depender da outra para existir.

## Captura Rápida

Mecanismo de registrar informação com mínimo atrito. Pode capturar tarefas, notas, decisões, ideias, memórias e informações importantes.

## Projeto

Unidade de organização para objetivos maiores que exigem continuidade, próximos passos, decisões e histórico.

## Tarefa

Ação concreta que pode ser concluída. Pode ou não estar conectada a um projeto.

## Decisão

Registro de uma escolha feita, com contexto suficiente para evitar rediscutir o mesmo assunto no futuro.

## Check-in / Diário

Registro do estado do usuário, do dia, de eventos relevantes ou de observações pessoais. Serve como fonte de continuidade e contexto.

## Fonte de Verdade

Local oficial onde decisões e definições do projeto vivem. Para o projeto, a fonte de verdade é a pasta `docs/`.

Para os dados do produto, a fonte primária inicial será o backend do Nyx OS. No futuro, essa decisão poderá ser revisada quando o projeto migrar para ambiente local.
