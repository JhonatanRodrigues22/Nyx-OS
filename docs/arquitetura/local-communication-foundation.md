# Fundação de Comunicação Local

## Objetivo

A Sprint 24 introduz `@nyx-os/local-gateway`, a fundação de comunicação bidirecional entre o Nyx OS e instâncias Nyx Local. O pacote aceita conexões WebSocket locais, autentica e acompanha instâncias, descobre capabilities remotas e as adapta aos managers oficiais do Runtime.

Esta fundação não executa automação de sistema operacional. A capability técnica `local.echo` usada nos testes valida somente transporte, correlação e integração com o Tool Calling Engine.

## Arquitetura

O fluxo é composto por quatro elementos:

1. `LocalGatewayServer` mantém o listener WebSocket, exige handshake, limita payload e acompanha heartbeat.
2. `LocalInstanceRegistry` mantém o estado das instâncias conhecidas: ID, plataforma, versão, capabilities, status e último heartbeat.
3. `LocalCapabilityBridge` adapta anúncios remotos aos contratos `NyxCapability` e `NyxTool`, correlaciona requests e encerra promises por result, timeout ou desconexão.
4. `NyxRuntime` fornece o `CapabilityManager`, o `ToolManager` e o Event Bus oficiais usados pelo gateway.

Não existe um registry alternativo de capabilities ou tools. O registry local contém apenas estado de conexão. Quando uma instância desconecta, seus adapters são removidos dos managers oficiais e a instância permanece no snapshot com status `disconnected` para diagnóstico.

## Transporte e protocolo

O transporte oficial é WebSocket com envelopes JSON, conforme a [ADR-0024](../decisoes/ADR-0024-websocket-envelope-json-local.md). A versão inicial do protocolo é `1.0`.

Todos os contratos carregam `protocolVersion` e um discriminante `type`:

- `LocalHandshake` (`local.handshake`)
- `LocalCapabilityAnnouncement` (`local.capabilities.announcement`)
- `LocalCommandRequest` (`local.command.request`)
- `LocalCommandResult` (`local.command.result`)
- `LocalHeartbeat` (`local.heartbeat`)

O servidor também responde com `local.handshake.accepted` e `local.error`. Erros carregam `code`, `message`, `retryable` e detalhes técnicos opcionais. O token nunca é incluído em respostas, eventos ou snapshots.

### Sequência

1. O cliente abre o WebSocket.
2. A primeira mensagem deve ser `local.handshake` com token, versão de protocolo e identidade da instância.
3. O servidor valida formato, versão e autenticação antes de registrar a instância.
4. O cliente anuncia as capabilities permitidas.
5. O bridge registra adapters no `CapabilityManager` e no `ToolManager` existentes.
6. Uma execução de Tool percorre Tool Calling Engine → CapabilityManager → bridge → WebSocket.
7. O `requestId` correlaciona `local.command.request` ao `local.command.result`.
8. Heartbeats atualizam `lastHeartbeatAt`; a ausência além do limite encerra a conexão.

## Configuração

O gateway é opt-in no Runtime:

```ts
const runtime = new NyxRuntime(undefined, {
  registerLocalGateway: true,
  localGatewayOptions: {
    port: 4789
  }
});

await runtime.start();
const gateway = runtime.getLocalGateway();
```

`registerLocalGateway` é `false` por padrão, seguindo o padrão de `registerAiRuntime`. Quando habilitado, `start()` cria e inicia o servidor; `stop()` encerra as conexões sem derrubar o Runtime.

Opções relevantes:

- `host`: `127.0.0.1` por padrão; somente `127.0.0.1`, `::1` ou `localhost` são aceitos nesta fase.
- `port`: `4789` por padrão; `0` pode ser usado em testes para porta dinâmica.
- `tokenEnvVar`: `NYX_LOCAL_GATEWAY_TOKEN` por padrão.
- `maxPayloadBytes`: 64 KiB por padrão.
- `handshakeTimeoutMs`: 5 segundos por padrão.
- `heartbeatTimeoutMs`: 30 segundos por padrão.
- `localCommandTimeoutMs`: 10 segundos por padrão no bridge.

Antes de habilitar o gateway, defina `NYX_LOCAL_GATEWAY_TOKEN` no ambiente do processo. A inicialização falha de forma explícita quando a variável está ausente ou vazia. Não há token padrão.

## Segurança

- Bind exclusivamente em loopback.
- Token obrigatório e lido apenas do ambiente.
- Comparação de token com `timingSafeEqual` após validação de tamanho.
- Handshake inválido ou incompatível recebe `local.error` estruturado e fechamento da conexão.
- Payload binário ou acima do limite é rejeitado.
- Apenas IDs iniciados por `computer.` ou `local.` podem ser anunciados.
- Nenhum input, result ou token é copiado para eventos de observabilidade.
- Colisões com capabilities/tools existentes são rejeitadas; o bridge não sobrescreve registros do Runtime.

## Lifecycle de comando

Cada execução cria um `requestId` único e registra uma promise pendente antes do envio. O timer é configurável por chamada em `LocalCapabilityBridge.execute(..., { timeoutMs })` e possui default do bridge.

Toda promise pendente termina em um destes caminhos:

- result bem-sucedido: resolve com o payload remoto;
- result de falha: rejeita com `LocalGatewayError`;
- timeout: rejeita com código `COMMAND_TIMEOUT`;
- desconexão: rejeita com código `CONNECTION_CLOSED`;
- descarte do bridge: rejeita com código `GATEWAY_STOPPED`.

Timers e entradas de correlação são removidos em todos os caminhos. Resultados desconhecidos, duplicados ou incompatíveis com a instância/capability esperada são ignorados.

## Eventos oficiais

O gateway publica no `@nyx-os/event-bus`:

- `local.connected`
- `local.disconnected`
- `local.handshake.completed`
- `local.handshake.failed`
- `local.capabilities.updated`
- `local.command.requested`
- `local.command.started`
- `local.command.completed`
- `local.command.failed`
- `local.command.timed_out`
- `local.heartbeat.received`

Os eventos registram somente metadados operacionais seguros, como `instanceId`, `capabilityId`, `requestId`, status, timeout e código de erro.

## Dev Dashboard

O `/dev` possui o painel **Nyx Local**, alimentado por `DashboardSnapshot.localGateway`. Ele exibe número de instâncias conectadas e conhecidas, ID, plataforma, versão, status, último heartbeat e capabilities anunciadas.

Não existe superfície correspondente no `/cockpit` nesta sprint.

## Validação

A suíte cobre handshake válido, token inválido, protocolo incompatível, heartbeat e expiração, registro remoto, round-trip real pelo Tool Calling Engine, timeout por comando e desconexão durante comando pendente. O teste de integração sobe um servidor real e um cliente WebSocket fake no mesmo processo.

## Fora do escopo

- Automação de sistema operacional.
- Intelligence Pipeline do Nyx Local.
- Memória compartilhada entre projetos.
- Bind fora de loopback.
- Superfície no cockpit.
- Persistência durável do registry.
- JSON-RPC formal, gRPC ou IPC nativo.
