# ADR-0009: Stack técnica oficial

## Status

Aceita.

## Contexto

O Nyx OS precisa de uma fundação técnica durável para web, serviços futuros, IA, automação e Nyx Local.

## Decisão

- TypeScript será usado para web e código compartilhado de frontend.
- Python 3.13+ será usado para serviços, automações, CLI e módulos locais futuros.
- Next.js permanece como aplicação web inicial.
- FastAPI fica como direção para serviços Python quando a separação for necessária.
- Supabase/PostgreSQL permanece como banco inicial.
- SQLite pode ser usado em cenários locais futuros.
- npm workspaces será usado para o monorepo JavaScript/TypeScript.
- `uv` será adotado para módulos Python quando eles existirem.

## Alternativas consideradas

- Manter tudo em um único app Next.js.
- Migrar imediatamente para Python/FastAPI.
- Migrar imediatamente para React + Vite.

## Consequências

- A fundação atual continua útil.
- O projeto ganha caminho para serviços e Nyx Local sem reescrita imediata.
- O monorepo precisa deixar claro quais partes são atuais e quais são planejadas.
