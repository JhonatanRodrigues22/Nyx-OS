# Roadmap

Este documento é o roadmap detalhado do Nyx OS.

O arquivo [`../../ROADMAP.md`](../../ROADMAP.md) existe apenas como atalho na raiz do repositório.

## Fases conceituais

### MVP

Objetivo: provar valor diário com captura, dashboard, projetos, diário/check-in e APIs simples para a Nyx.

### v1

Objetivo: tornar o uso diário consistente, melhorar UX, busca, tags, hábitos, finanças simples e confiabilidade.

### v2

Objetivo: aprofundar integrações, automações, relatórios, Obsidian, Workflow Lens e recursos assistidos por IA.

### Dream Vision

Objetivo: evoluir para uma central pessoal rodando em ambiente próprio, conectada a Nyx Local, Home Assistant, voz, avatar e automações locais.

## Regra

O roadmap deve proteger o MVP da ansiedade de construir tudo ao mesmo tempo.


## Ordem oficial das próximas sprints

### Sprint 01 — Fundação Operacional

Criar a base técnica e de domínio do Nyx OS. Pode incluir captura mínima, mas o objetivo principal é deixar o projeto de pé com entidades centrais, banco, autenticação e esqueleto do cockpit.

### Sprint 02 — Cockpit e Dia Operacional

Amadurecer a experiência do dashboard: visão do dia, pendências, projetos vivos, check-in e continuidade.

### Sprint 03 — Captura e Organização Profunda

Aprofundar captura rápida, relações entre entidades, organização por contexto e primeiros sinais do grafo de contexto.

### Sprint técnica paralela — Fundação Técnica e Setup

Organizar monorepo, stack oficial, configs, ADRs, CI e workflow sem implementar funcionalidades de produto.

## Nota sobre captura rápida

Captura rápida faz parte do MVP desde o começo. A decisão oficial é implementá-la em camadas: mínima na Sprint 01, mais útil na Sprint 02 e mais conectada ao grafo na Sprint 03.
