# ADR-0024: WebSocket com envelope JSON para comunicação local

- Status: Aceita
- Data: 2026-07-13
- Sprint: 24

## Contexto

O Nyx OS precisa receber conexões persistentes de instâncias Nyx Local, descobrir as capabilities anunciadas por elas e encaminhar comandos com correlação, timeout e observabilidade. A fundação deve operar apenas em `localhost`, não pode introduzir automação de sistema operacional e precisa reutilizar o `CapabilityManager` e o `ToolManager` oficiais do Runtime.

## Decisão

Adotar WebSocket sobre TCP, com bind padrão e obrigatório nesta fase em endereço loopback, e mensagens em envelopes JSON discriminados e versionados.

Cada envelope carrega `protocolVersion` e um `type` explícito. A primeira mensagem da conexão é obrigatoriamente um handshake autenticado por token fornecido via variável de ambiente. O servidor rejeita antes do registro qualquer token inválido, versão incompatível ou payload acima do limite configurado.

O WebSocket fornece um canal bidirecional persistente adequado para heartbeat, anúncios de capabilities, requests e results. O JSON mantém os contratos inspecionáveis e simples de simular em testes e clientes técnicos. A versão no envelope permite evolução controlada sem inferência implícita de formato.

Capabilities remotas são adaptadas ao contrato `NyxCapability` e registradas no `CapabilityManager` existente. Tools técnicas correspondentes são registradas no `ToolManager` existente. O gateway não possui cópias desses registries; mantém somente o estado de conexão, correlação de requests e referências necessárias para remover os adapters ao desconectar.

## Segurança e limites

- O token é obrigatório e vem de configuração externa; não existe valor padrão, hardcoded ou emitido em logs/eventos.
- O bind aceita apenas endereços loopback nesta fase.
- Somente capabilities com prefixo `computer.` ou `local.` são aceitas.
- O tamanho máximo de payload é aplicado pelo servidor WebSocket e validado antes do parse.
- Handshake inválido recebe erro estruturado e a conexão é encerrada.
- Campos recebidos pela rede são validados em runtime, incluindo descritores, coerência de resultados e todos os campos de `LocalProtocolError`.
- Erros específicos do runtime executor são normalizados para `REMOTE_COMMAND_FAILED`; o código interno permanece em `error.details.internalCode` sem acoplar o protocolo a implementações de skills.
- Requests pendentes sempre terminam por result, timeout, parada do gateway ou desconexão.

## Alternativas rejeitadas

### gRPC

Rejeitado nesta fase por exigir toolchain de schema/code generation e por aumentar a complexidade de distribuição entre os projetos antes de os contratos estabilizarem. Continua viável se forem necessários streaming tipado de alto volume ou interoperabilidade multilíngue mais rígida.

### Named pipes ou IPC nativo

Rejeitado por diferenças relevantes entre Windows, macOS e Linux e por acoplar transporte ao sistema operacional. Também dificultaria clientes fake portáveis e execução em ambientes de desenvolvimento distintos.

### Child process

Rejeitado porque o ciclo de vida do Nyx Local não deve ser subordinado ao processo do Nyx OS. A fundação precisa aceitar instâncias já em execução e permitir reconexão independente.

### HTTP polling

Rejeitado por introduzir latência, tráfego periódico e semântica adicional de filas para entregar comandos e resultados. Heartbeat e desconexão também seriam menos diretos do que em um canal persistente.

### JSON-RPC formal

Rejeitado por adicionar um modelo completo de métodos, notifications e códigos de erro que excede as necessidades atuais. Os envelopes discriminados preservam correlação e erros estruturados sem comprometer o protocolo prematuramente; uma migração futura continua possível.

## Consequências

- Nyx OS passa a depender de uma implementação de servidor WebSocket no novo pacote `@nyx-os/local-gateway`.
- O protocolo é explícito, testável em processo e evolui por versão.
- O transporte não é exposto fora do host local nesta sprint.
- Compatibilidade binária e schemas formais ficam adiados até que o protocolo tenha uso real suficiente.
