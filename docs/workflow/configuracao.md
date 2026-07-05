# Configuração e Ambientes

## Arquivos

- `.env.example`: variáveis compartilhadas do monorepo.
- `.env.local.example`: variáveis da aplicação web.
- `.env.local`: ambiente local real, não versionado.

## Variáveis iniciais

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NYX_ENV`
- `NYX_LOG_LEVEL`

## Perfis

Perfis conceituais:

- `development`
- `test`
- `production`
- `local`

## Secrets

Secrets reais não devem ser commitados.

Quando houver serviços Python, configuração tipada deve usar Pydantic Settings.
