# First Boot - Nyx OS + Nyx Local

Este documento registra o fluxo de desenvolvimento para subir o Nyx OS e conectar uma instancia Nyx Local pelo Local Gateway.

## Nyx OS

No terminal do Nyx OS:

```powershell
cd "C:\Users\Usuario\Documents\Projetos\Nyx OS\Nyx OS"
$env:NYX_ENABLE_LOCAL_GATEWAY="true"
$env:NYX_LOCAL_GATEWAY_TOKEN="dev-local-token-123"
$env:NYX_LOCAL_GATEWAY_PORT="4789"
npm run dev
```

`NYX_ENABLE_LOCAL_GATEWAY` controla a criacao do servidor WebSocket server-side.

Quando `NYX_ENABLE_LOCAL_GATEWAY` nao esta definido como `true`, o comportamento permanece igual: o gateway fica desabilitado.

Quando `NYX_ENABLE_LOCAL_GATEWAY=true`, `NYX_LOCAL_GATEWAY_TOKEN` e obrigatorio. Se o token estiver ausente, o servidor falha com erro claro.

## Verificar porta

Em outro terminal:

```powershell
Test-NetConnection 127.0.0.1 -Port 4789
```

Esperado:

```text
TcpTestSucceeded : True
```

## Nyx Local

No terminal do Nyx Local:

```powershell
cd "C:\Users\Usuario\Documents\Projetos\Nyx OS\Nyx Local"
.\.venv\Scripts\Activate.ps1
$env:NYX_LOCAL_GATEWAY_TOKEN="dev-local-token-123"
$env:NYX_LOCAL_GATEWAY_URL="ws://127.0.0.1:4789"
nyx-local-gateway
```

Esperado:

- handshake aceito;
- capabilities anunciadas;
- `local.echo` visivel no Nyx OS;
- heartbeat rodando;
- sem reconnect loop.

## Dev Dashboard

Acesse:

```text
http://localhost:3000/dev
```

O painel Nyx Local deve mostrar:

- gateway enabled/disabled;
- instancias conhecidas;
- status;
- platform;
- version;
- ultimo heartbeat;
- capabilities anunciadas, incluindo `local.echo`.

O `/dev` consome snapshot server-side em `/api/dev/snapshot`. Ele nao cria `NyxRuntime` nem WebSocket server no navegador.

## Segurança

O token nunca deve ser versionado com valor real, logado ou escrito no changelog.

O Local Gateway continua limitado a loopback nesta etapa.
