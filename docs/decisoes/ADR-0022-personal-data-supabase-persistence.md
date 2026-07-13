# ADR-0022: Persistencia Inicial dos Modulos de Dados Pessoais em Supabase

## Status

Aceita.

## Contexto

O Nyx OS tem uma direcao local-first registrada nos documentos de fundamentos e na visao de execucao futura em servidor local dedicado.

Ao mesmo tempo, o projeto ja usa Supabase na aplicacao web, com `@supabase/supabase-js` presente no stack e um client existente em `apps/web/src/lib/supabase.ts`.

A Sprint 22 introduz os primeiros modulos com dados pessoais reais: tarefas, habitos, projetos e financas. Diferente das engines anteriores, esses dados precisam sobreviver a restart do processo.

## Decisao

Usar Supabase como persistencia inicial dos modulos de dados pessoais da Sprint 22.

A decisao e pragmatica: o stack ja existe no projeto e permite entregar valor de produto sem reconstruir uma camada local de storage antes de validar os dominios.

O acesso deve ficar atras de uma abstracao de repositorio (`PersonalDataRepository<T>`), para que uma implementacao local futura possa substituir Supabase sem mudar os consumidores de dominio.

## Alternativas Consideradas

- Persistencia local via SQLite.
- Persistencia local via arquivos.
- Adiar os modulos pessoais ate a camada local-first estar pronta.
- Implementar uma camada propria de storage antes dos dominios de produto.

## Alternativa Rejeitada

A persistencia local via SQLite ou arquivo foi rejeitada nesta sprint por custo de entrega.

Ela continua alinhada com a visao local-first, mas exigiria decisoes adicionais sobre schema local, migracoes, backup, sincronizacao futura e operacao no ambiente dedicado.

## Consequencias

- A dependencia de nuvem permanece para estes modulos enquanto a migracao local-first nao for feita.
- Dados pessoais persistentes dependem do projeto Supabase estar configurado e do schema SQL ter sido aplicado.
- A migracao para storage local nao esta esquecida; ela foi adiada conscientemente.
- Nenhuma chave ou URL real do Supabase deve aparecer em codigo, commits, logs ou changelog.
- Testes automatizados devem usar `InMemoryRepository` e nunca chamar o Supabase real.
