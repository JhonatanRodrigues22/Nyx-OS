import type { AiChunk, AiMessage, AiProvider, AiRequest, AiResponse, AiToolCall } from "./AiTypes";

type AnthropicProviderOptions = {
  apiKey: string;
  model: string;
  apiUrl?: string;
  fetchImpl?: typeof fetch;
};

type AnthropicContentBlock =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "tool_use";
      id: string;
      name: string;
      input?: unknown;
    };

type AnthropicResponse = {
  content?: AnthropicContentBlock[];
  stop_reason?: string;
};

function toAnthropicMessages(messages: AiMessage[]) {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "tool" ? "user" : message.role,
      content:
        message.role === "tool"
          ? [
              {
                type: "tool_result",
                tool_use_id: message.toolCallId ?? "tool-call",
                content: message.content
              }
            ]
          : message.content
    }));
}

function toAnthropicTools(request: AiRequest) {
  return (request.tools ?? []).map((tool) => ({
    name: tool.id,
    description: tool.description,
    input_schema: {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(tool.parameters).map(([name, parameter]) => [
          name,
          {
            type: parameter.type,
            description: parameter.description
          }
        ])
      ),
      required: Object.entries(tool.parameters)
        .filter(([, parameter]) => parameter.required)
        .map(([name]) => name)
    }
  }));
}

function getSystemPrompt(messages: AiMessage[]): string | undefined {
  return messages.find((message) => message.role === "system")?.content;
}

function parseAnthropicResponse(response: AnthropicResponse): AiResponse {
  const content = response.content ?? [];
  const text = content
    .filter((block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
  const toolCalls: AiToolCall[] = content
    .filter((block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use")
    .map((block) => ({
      toolId: block.name,
      input: block.input
    }));

  return {
    message: {
      role: "assistant",
      content: text
    },
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    stopReason: response.stop_reason === "tool_use" ? "tool_call" : "stop"
  };
}

export class AnthropicProvider implements AiProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AnthropicProviderOptions) {
    if (!options.apiKey) {
      throw new Error("Anthropic API key is required");
    }

    this.apiKey = options.apiKey;
    this.model = options.model;
    this.apiUrl = options.apiUrl ?? "https://api.anthropic.com/v1/messages";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async complete(request: AiRequest): Promise<AiResponse> {
    const response = await this.fetchImpl(this.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 1024,
        system: getSystemPrompt(request.messages),
        messages: toAnthropicMessages(request.messages),
        tools: toAnthropicTools(request)
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic provider request failed: ${response.status}`);
    }

    return parseAnthropicResponse((await response.json()) as AnthropicResponse);
  }

  async *stream(request: AiRequest): AsyncIterable<AiChunk> {
    const response = await this.complete(request);

    if (response.message.content) {
      yield {
        content: response.message.content
      };
    }

    for (const toolCall of response.toolCalls ?? []) {
      yield {
        toolCall
      };
    }

    yield {
      done: true
    };
  }
}
