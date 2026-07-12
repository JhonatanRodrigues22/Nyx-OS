import type { AiChunk, AiProvider, AiRequest, AiResponse } from "./AiTypes";

export class FakeAiProvider implements AiProvider {
  private readonly responses: AiResponse[];
  readonly requests: AiRequest[] = [];

  constructor(responses: AiResponse[]) {
    this.responses = [...responses];
  }

  async complete(request: AiRequest): Promise<AiResponse> {
    this.requests.push(request);
    const response = this.responses.shift();

    if (!response) {
      throw new Error("Fake AI provider has no response queued");
    }

    return response;
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
