# @nyx-os/database

Responsavel por utilitarios compartilhados de persistencia e acesso a dados.

A implementacao inicial expoe um factory minimo para Supabase, lendo `SUPABASE_URL`/`SUPABASE_KEY` ou `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_KEY` do ambiente.

Nenhum valor de chave ou URL deve ser hardcoded, logado ou documentado com valor real.
