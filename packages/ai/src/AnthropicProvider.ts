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

type AnthropicToolMapping = {
  tools: ReturnType<typeof createAnthropicTool>[];
  nameToToolId: Map<string, string>;
};

function createSafeToolName(toolId: string, usedNames: Set<string>): string {
  const normalized = toolId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "tool";
  let candidate = normalized;
  let suffix = 1;

  while (usedNames.has(candidate)) {
    const suffixText = `_${suffix}`;

    candidate = `${normalized.slice(0, 64 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function createAnthropicTool(tool: NonNullable<AiRequest["tools"]>[number], name: string) {
  return {
    name,
    description: tool.description,
    input_schema: {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(tool.parameters).map(([parameterName, parameter]) => [
          parameterName,
          {
            type: parameter.type,
            description: parameter.description
          }
        ])
      ),
      required: Object.entries(tool.parameters)
        .filter(([, parameter]) => parameter.required)
        .map(([parameterName]) => parameterName)
    }
  };
}

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

function toAnthropicTools(request: AiRequest): AnthropicToolMapping {
  const usedNames = new Set<string>();
  const nameToToolId = new Map<string, string>();
  const tools = (request.tools ?? []).map((tool) => {
    const name = createSafeToolName(tool.id, usedNames);

    nameToToolId.set(name, tool.id);
    return createAnthropicTool(tool, name);
  });

  return {
    tools,
    nameToToolId
  };
}

function getSystemPrompt(messages: AiMessage[]): string | undefined {
  return messages.find((message) => message.role === "system")?.content;
}

function parseAnthropicResponse(response: AnthropicResponse, nameToToolId: Map<string, string>): AiResponse {
  const content = response.content ?? [];
  const text = content
    .filter((block): block is Extract<AnthropicContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
  const toolCalls: AiToolCall[] = content
    .filter((block): block is Extract<AnthropicContentBlock, { type: "tool_use" }> => block.type === "tool_use")
    .map((block) => ({
      toolId: nameToToolId.get(block.name) ?? block.name,
      input: block.input,
      toolCallId: block.id
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
    const anthropicTools = toAnthropicTools(request);
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
        tools: anthropicTools.tools
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic provider request failed: ${response.status}`);
    }

    return parseAnthropicResponse((await response.json()) as AnthropicResponse, anthropicTools.nameToToolId);
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
