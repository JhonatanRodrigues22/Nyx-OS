import type { NyxToolManager, ToolSnapshot } from "@nyx-os/tools";
import { AiProviderRegistry } from "./AiProviderRegistry";
import type {
  AiConversationOptions,
  AiConversationResult,
  AiMessage,
  AiResponse,
  AiSystemPromptReference,
  AiSystemPromptResolver
} from "./AiTypes";

export type AiConversationManagerOptions = {
  providers: AiProviderRegistry;
  tools: NyxToolManager;
  systemPrompt?: string;
  systemPromptTemplate?: AiSystemPromptReference;
  systemPromptResolver?: AiSystemPromptResolver;
  maxIterations?: number;
};

export class AiConversationManager {
  private readonly providers: AiProviderRegistry;
  private readonly tools: NyxToolManager;
  private readonly defaultSystemPrompt: string;
  private readonly defaultSystemPromptTemplate: AiSystemPromptReference | undefined;
  private readonly systemPromptResolver: AiSystemPromptResolver | undefined;
  private readonly defaultMaxIterations: number;
  private readonly history: AiMessage[] = [];

  constructor(options: AiConversationManagerOptions) {
    this.providers = options.providers;
    this.tools = options.tools;
    this.defaultSystemPrompt = options.systemPrompt ?? "You are Nyx OS. Use available tools only when needed.";
    this.defaultSystemPromptTemplate = options.systemPromptTemplate;
    this.systemPromptResolver = options.systemPromptResolver;
    this.defaultMaxIterations = options.maxIterations ?? 10;
  }

  getHistory(): AiMessage[] {
    return this.history.map((message) => ({ ...message }));
  }

  clearHistory(): void {
    this.history.splice(0);
  }

  async sendUserMessage(content: string, options: AiConversationOptions = {}): Promise<AiConversationResult> {
    const userMessage: AiMessage = {
      role: "user",
      content
    };

    this.history.push(userMessage);

    return this.run(options);
  }

  async run(options: AiConversationOptions = {}): Promise<AiConversationResult> {
    const provider = this.providers.getActive();
    const maxIterations = options.maxIterations ?? this.defaultMaxIterations;
    const systemPrompt = this.resolveSystemPrompt(options);
    const tools = options.tools ?? this.tools.list();
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations += 1;
      const response = await provider.complete({
        messages: this.buildMessages(systemPrompt),
        tools,
        maxTokens: options.maxTokens
      });

      this.history.push(response.message);

      if (!response.toolCalls || response.toolCalls.length === 0) {
        return {
          response,
          messages: this.getHistory(),
          iterations
        };
      }

      for (let index = 0; index < response.toolCalls.length; index += 1) {
        const toolCall = response.toolCalls[index];
        const result = await this.tools.execute(toolCall.toolId, toolCall.input, {
          source: "ai"
        });
        const toolMessage: AiMessage = {
          role: "tool",
          toolCallId: toolCall.toolCallId ?? `${toolCall.toolId}:${iterations}:${index}`,
          content: JSON.stringify(result.result ?? null)
        };

        this.history.push(toolMessage);
      }
    }

    throw new Error(`AI tool loop exceeded max iterations: ${maxIterations}`);
  }

  private buildMessages(systemPrompt: string): AiMessage[] {
    return [
      {
        role: "system",
        content: systemPrompt
      },
      ...this.history
    ];
  }

  private resolveSystemPrompt(options: AiConversationOptions): string {
    if (options.systemPrompt !== undefined) {
      return options.systemPrompt;
    }

    const templateReference = options.systemPromptTemplate ?? this.defaultSystemPromptTemplate;

    if (templateReference) {
      if (!this.systemPromptResolver) {
        throw new Error("AI system prompt template requires a system prompt resolver");
      }

      return this.systemPromptResolver.renderSystemPrompt(templateReference);
    }

    return this.defaultSystemPrompt;
  }
}
