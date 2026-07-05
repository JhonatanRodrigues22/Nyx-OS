# Nyx Local

## Definição

Nyx Local é a camada futura local/autônoma do ecossistema Nyx.

A visão de longo prazo é que o Nyx OS e a Nyx Assistente possam rodar em um ambiente próprio do usuário, como um mini PC ou mini servidor, reduzindo dependência de serviços pagos e diminuindo exposição de dados pessoais em nuvem.

## Decisão atual

Nyx Local **não é foco do MVP**.

No momento, o projeto deve focar em uma versão viável, simples e local no sentido de produto pessoal, mas não necessariamente hospedada em hardware próprio.

A migração para mini PC/servidor será reavaliada no futuro.

## Direção de longo prazo

Quando o usuário decidir levar a Nyx Assistente para um micro PC, o Nyx OS deve acompanhar essa migração.

A visão final não é ter a Nyx Local separada e desconectada do Nyx OS. A visão é ter uma casa operacional completa rodando em ambiente controlado pelo usuário.

## Papel esperado

Nyx Local poderá futuramente:

- executar serviços locais;
- integrar com Home Assistant;
- operar automações;
- processar dados sensíveis localmente;
- reduzir dependência de nuvem;
- hospedar o Nyx OS ou partes dele;
- servir como presença contínua da Nyx no ambiente físico do usuário.

## O que não decidir agora

Este documento não define ainda:

- hardware;
- sistema operacional;
- estratégia de deploy;
- sincronização nuvem/local;
- conflitos offline;
- banco local final;
- modelo de backup;
- arquitetura de alta disponibilidade.

Essas decisões ficam fora do MVP para evitar arquitetura prematura.

## Regra arquitetural para agora

Mesmo sem implementar Nyx Local, o Nyx OS não deve tomar decisões que bloqueiem essa possibilidade.

Evitar:

- acoplamento extremo a fornecedor específico;
- lógica de negócio presa ao frontend;
- acesso direto e espalhado ao banco;
- ausência total de contratos de API;
- dependência de serviços impossíveis de substituir.
