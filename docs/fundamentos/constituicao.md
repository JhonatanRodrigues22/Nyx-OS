# Constituição do Nyx OS

## O que é o Nyx OS

Nyx OS é um sistema operacional pessoal construído inicialmente como uma aplicação web modular.

Ele não deve ser tratado apenas como um dashboard, um planner ou uma lista de tarefas. O Nyx OS é a base central que organiza dados, contexto, rotina, projetos, decisões, memórias, automações e integrações para sustentar a experiência da Nyx como assistente pessoal.

No longo prazo, o Nyx OS deve funcionar quase como a casa digital do usuário: um ambiente central onde a vida operacional, os projetos pessoais e a inteligência assistiva se conectam.

## Propósito

O propósito do Nyx OS é reduzir atrito cognitivo e operacional.

O sistema deve ajudar o usuário a capturar informações, recuperar contexto, acompanhar projetos, organizar tarefas, registrar decisões e alimentar outros módulos do ecossistema Nyx sem exigir esforço excessivo de manutenção manual.

## Princípios centrais

- **Casa digital:** o Nyx OS deve parecer uma central pessoal, não apenas um app comum.
- **Fonte de verdade:** dados importantes devem ter um lugar claro para viver.
- **Anti-atrito:** capturar e consultar deve ser mais fácil do que deixar para depois.
- **Modularidade:** cada parte deve poder evoluir sem quebrar o resto.
- **Escalabilidade gradual:** o MVP deve ser pequeno, mas a arquitetura deve permitir crescimento.
- **IA como operadora:** a Nyx Assistente e a Nyx Local devem conseguir consultar e operar o sistema por APIs ou interfaces bem definidas.
- **Usuário como dono dos dados:** se algo está no Nyx OS, parte-se do princípio de que foi colocado ali para ser usado pelo ecossistema Nyx.
- **Documentação como memória do projeto:** decisões importantes devem ir para `docs/`, não ficar presas apenas em conversas.

## O que o Nyx OS não deve virar

- Um app genérico sem identidade.
- Um clone de Notion, Todoist, Obsidian ou Google Calendar.
- Um painel bonito sem utilidade prática.
- Um sistema rígido que exige disciplina perfeita do usuário.
- Um projeto monolítico impossível de manter.
- Um experimento de IA que ignora produto, arquitetura e usabilidade.

## Relação com a Nyx

A Nyx é a camada de interação, personalidade, assistência e interpretação.

O Nyx OS é a base operacional e informacional que permite que a Nyx tenha contexto, consulte dados, organize rotinas e acione módulos.

A separação é importante:

- **Nyx OS:** sistema, dados, APIs, dashboard, módulos e integrações.
- **Nyx Assistente:** experiência conversacional e interpretação das necessidades do usuário.
- **Nyx Local:** possível camada local/autônoma futura, rodando em ambiente próprio.

## Visão de longo prazo

No futuro, o Nyx OS pode rodar em um micro PC ou servidor dedicado, conectado a automações locais, Home Assistant, Obsidian, dashboards, voz, avatar, sensores, rotinas e outros produtos do ecossistema.

Essa visão não pertence ao MVP, mas orienta decisões arquiteturais desde o começo.
