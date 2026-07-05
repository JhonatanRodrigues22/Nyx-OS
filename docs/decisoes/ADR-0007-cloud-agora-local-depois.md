# ADR-0007 — Cloud Agora, Local Depois

## Status

Aceita.

## Contexto

A visão de longo prazo do Nyx OS inclui rodar em um mini PC ou mini servidor próprio, junto da Nyx Assistente/Nyx Local.

Porém, construir essa infraestrutura agora é inviável e desviaria foco do MVP.

## Decisão

O Nyx OS começará com uma abordagem cloud-first para viabilizar desenvolvimento, testes e uso inicial.

A migração para ambiente local próprio será tratada como fase futura.

Quando essa migração acontecer, a intenção é que o Nyx OS acompanhe a Nyx Assistente para o mini servidor, funcionando como uma casa operacional permanente e controlada pelo usuário.

## Consequências

- O MVP não deve gastar energia com deploy em mini PC.
- A arquitetura deve evitar dependência irreversível de serviços pagos.
- APIs, domínio e documentação devem facilitar substituição futura de infraestrutura.
- Segurança e privacidade continuam importantes desde o início.
