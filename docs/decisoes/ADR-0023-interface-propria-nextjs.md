# ADR-0023: FORK-01 Resolvido com Interface Propria em Next.js

## Status

Aceita.

## Contexto

Desde o inicio do projeto havia um fork de produto em aberto: usar uma interface propria do Nyx OS ou apoiar a experiencia principal em Notion.

A visao original do Nyx OS descreve um cockpit pessoal proprio, cyberpunk/glassmorphism, PWA e integrado ao Runtime. O Dev Dashboard tecnico ja existe, mas ele e uma ferramenta de desenvolvimento, nao a experiencia final de interacao pessoal.

## Decisao

O FORK-01 fica resolvido em favor de interface propria em Next.js.

Notion nao entra na arquitetura como interface principal do Nyx OS.

A Sprint 23 inicia essa camada com `/cockpit` como experiencia pessoal e `/dev` como rota separada para o Dev Dashboard tecnico.

## Alternativas Consideradas

- Usar Notion como interface principal.
- Manter apenas o Dev Dashboard e evolui-lo ate virar cockpit.
- Adiar a decisao de interface para uma sprint futura.

## Consequencias

- O produto passa a ter duas superficies distintas: cockpit pessoal e dashboard tecnico.
- A identidade visual do cockpit pode seguir a visao original sem ficar presa aos componentes do Dev Dashboard.
- Integracoes com IA, Tools, automacoes e workflows devem expor APIs server-side do proprio Nyx OS, nao depender de clientes externos.
- Notion pode continuar existindo como ferramenta externa do usuario, mas nao e parte da arquitetura do Nyx OS.
