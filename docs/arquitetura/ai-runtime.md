# AI Runtime

## Objetivo

O AI Runtime e a camada oficial de abstracao entre o Nyx OS e provedores de IA.

Ele permite conversa, streaming e tool calling sem acoplar o sistema a um fornecedor especifico.

Nenhuma parte do Runtime, das Tools ou de outros packages deve depender diretamente do formato de API de um provider externo.

## Package

O package oficial e `@nyx-os/ai`.

Ele contem:

- `AiProvider`;
- `AiProviderRegistry`;
- `AiConversationManager`;
- `AnthropicProvider`;
- `FakeAiProvider`;
- tipos publicos de mensagens, requests, responses, chunks e tool calls.

## Contratos

`AiProvider` define:

```ts
complete(request): Promise<AiResponse>
stream(request): AsyncIterable<AiChunk>
```

`AiMessage` usa roles internas do Nyx OS:

- `system`;
- `user`;
- `assistant`;
- `tool`.

`AiRequest` contem:

- `messages`;
- `tools`;
- `maxTokens`.

As `tools` vêm do `ToolRegistry` existente como `ToolSnapshot[]`.

`AiResponse` contem:

- `message`;
- `toolCalls`;
- `stopReason`.

## Provider Registry

`AiProviderRegistry` registra providers por nome e permite trocar o provider ativo sem alterar o resto do sistema.

O nome padrao documentado para producao inicial e `anthropic`, mas consumidores internos usam apenas o contrato `AiProvider`.

## Conversation Manager

`AiConversationManager` mantem o historico em memoria de uma conversa.

Ele monta `AiRequest` com:

- system prompt simples;
- historico da conversa;
- Tools disponiveis;
- limite opcional de tokens.

Quando o provider retorna `toolCalls`, o manager executa cada Tool via `tools.execute(toolId, input)`, adiciona o resultado como mensagem `role: "tool"` e chama o provider novamente.

O loop para quando:

- a resposta final nao contem tool calls; ou
- o limite maximo de iteracoes e atingido.

Se o limite for atingido, o manager lança erro explicito. Ele nao ignora loops silenciosamente.

## Anthropic Adapter

`AnthropicProvider` converte o formato interno do Nyx OS para a API de mensagens da Anthropic.

Detalhes de vendor ficam restritos ao adapter.

A chave de API deve vir de variavel de ambiente/configuracao:

```env
ANTHROPIC_API_KEY=
NYX_AI_PROVIDER=anthropic
NYX_AI_MODEL=claude-3-5-sonnet-latest
```

Chaves nunca devem ser commitadas, logadas ou copiadas para documentacao alem de placeholders.

## Fake Provider

`FakeAiProvider` existe para testes automatizados.

Nenhum teste deve chamar API real de IA, depender de rede externa ou gerar custo por execucao.

## Runtime

`NyxRuntime` pode expor:

```ts
runtime.getAi()
```

O AI Runtime fica desabilitado por padrao.

Para habilitar:

```ts
new NyxRuntime(undefined, { registerAiRuntime: true })
```

Quando habilitado sem provider injetado, o Runtime registra Anthropic apenas se houver `ANTHROPIC_API_KEY` configurada.

## Relacao Com Tools

O AI Runtime e o primeiro consumidor real do Tool Calling Engine como API publica executavel.

O modelo nao reimplementa execucao. Ele solicita tool calls e o Nyx OS executa Tools existentes por contrato.

## Fora do Escopo

- UI de chat.
- Prompt Engine formal com templates e versionamento.
- Contexto vindo de Knowledge Engine.
- Execucao com multiplos providers simultaneos em producao.
- Persistencia de historico de conversa.
- Chamadas reais de IA em testes automatizados.
