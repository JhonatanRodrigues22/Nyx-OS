# ADR-0005: Nyx OS como base do ecossistema

## Status

Aceita.

## Contexto

Existem ideias e projetos conectados: Nyx Local, Workflow Lens, Obsidian, Home Assistant, dashboard, automações, voz e possível servidor local.

Essas ideias não devem competir com o Nyx OS nem duplicar responsabilidades.

## Decisão

O Nyx OS será tratado como base operacional do ecossistema Nyx.

Outros produtos e módulos devem se conectar a ele quando precisarem de dados, contexto ou coordenação.

## Consequências

- O Nyx OS deve expor APIs e contratos claros.
- Nyx Local não deve recriar toda a base de dados do Nyx OS sem necessidade.
- Workflow Lens pode futuramente alimentar o Nyx OS com eventos e padrões.
- Integrações devem ser pensadas como módulos conectáveis.
