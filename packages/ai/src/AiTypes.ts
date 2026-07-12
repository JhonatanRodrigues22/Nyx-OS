import type { ToolSnapshot } from "@nyx-os/tools";

export type AiMessageRole = "system" | "user" | "assistant" | "tool";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
  toolCallId?: string;
};

export type AiToolCall<TInput = unknown> = {
  toolId: string;
  input?: TInput;
  toolCallId?: string;
};

export type AiRequest = {
  messages: AiMessage[];
  tools?: ToolSnapshot[];
  maxTokens?: number;
};

export type AiStopReason = "stop" | "tool_call" | "max_tokens" | "error";

export type AiResponse = {
  message: AiMessage;
  toolCalls?: AiToolCall[];
  stopReason: AiStopReason;
};

export type AiChunk = {
  content?: string;
  toolCall?: AiToolCall;
  done?: boolean;
};

export interface AiProvider {
  complete(request: AiRequest): Promise<AiResponse>;
  stream(request: AiRequest): AsyncIterable<AiChunk>;
}

export type AiSystemPromptReference = {
  id: string;
  version?: string;
  variables?: Record<string, string | number | boolean | null>;
};

export interface AiSystemPromptResolver {
  renderSystemPrompt(reference: AiSystemPromptReference): string;
}

export type AiConversationOptions = {
  systemPrompt?: string;
  systemPromptTemplate?: AiSystemPromptReference;
  maxIterations?: number;
  maxTokens?: number;
  tools?: ToolSnapshot[];
};

export type AiConversationResult = {
  response: AiResponse;
  messages: AiMessage[];
  iterations: number;
};
