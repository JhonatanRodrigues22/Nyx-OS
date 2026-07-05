# @nyx-os/config

Responsável por configuração tipada e perfis de ambiente.

Este package expõe `getNyxConfig`, que carrega configuração mínima do Nyx OS com defaults seguros.

Variáveis suportadas:

- `NYX_APP_NAME`
- `NYX_VERSION`
- `NYX_ENV`
- `NODE_ENV`
- `NYX_ENABLED_MODULES`
- `NYX_USE_MOCK_DATA`
- `NYX_ENABLE_PERSISTENT_MEMORY`
- `NYX_ENABLE_AUTOMATION`
- `NYX_ENABLE_AI_RUNTIME`

Não deve conter secrets reais.
