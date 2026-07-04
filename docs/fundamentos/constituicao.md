# Constituicao do Nyx OS

## Visao geral

Nyx OS e um sistema operacional pessoal construido como uma aplicacao web unica. O objetivo e centralizar captura, armazenamento e recuperacao de dados pessoais com o minimo de atrito.

O sistema deve apoiar tarefas, projetos, habitos, financas, check-ins diarios, notas, decisoes e memorias, sem exigir que a pessoa mantenha muitos aplicativos desconectados.

## Principios centrais

- Aplicacao unica: reduzir dependencia de multiplos programas.
- Custo zero: priorizar servicos com planos gratuitos.
- Anti-atrito: o sistema deve se adaptar a vida do usuario.
- Modular por experiencia: desenvolver pelo fluxo de uso, nao por modulos isolados.
- Offline friendly: preparar caminho para captura offline e sincronizacao futura.

## MVP conceitual

1. Captura rapida.
2. Painel do dia.
3. Projetos.
4. Diario e check-in.
5. APIs para a Nyx Assistente.

## Stack planejada

- Frontend: Next.js, React e TypeScript.
- Backend: Supabase para PostgreSQL e autenticacao.
- Deploy: Vercel para a aplicacao web e Supabase free tier para banco/auth.
- PWA: suporte para instalacao mobile.

## Fonte de verdade

Este documento substitui a antiga pasta solta `Fundamentos/` como referencia versionada. Documentos conceituais permanentes devem viver em `docs/`.
