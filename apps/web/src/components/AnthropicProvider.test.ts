import { AnthropicProvider } from "@nyx-os/ai";
import type { ToolSnapshot } from "@nyx-os/tools";

function createTool(id = "diagnostics.runtime"): ToolSnapshot {
  return {
    id,
    capabilityId: "diagnostics.runtime",
    name: "Diagnostics",
    description: "Runtime diagnostics",
    version: "0.1.0",
    category: "diagnostics",
    enabled: true,
    parameters: {
      value: {
        type: "string",
        required: false,
        description: "Optional value"
      }
    },
    result: {
      description: "Diagnostics result"
    },
    metadata: {},
    lastExecutedAt: null
  };
}

function createResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body
  } as Response;
}

describe("AnthropicProvider", () => {
  it("sanitizes Nyx tool IDs for Anthropic and maps tool calls back", async () => {
    const requests: unknown[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body));

      requests.push(body);

      return createResponse({
        content: [
          {
            type: "tool_use",
            id: "toolu_123",
            name: body.tools[0].name,
            input: {
              value: "ok"
            }
          }
        ],
        stop_reason: "tool_use"
      });
    };
    const provider = new AnthropicProvider({
      apiKey: "test-key",
      model: "test-model",
      fetchImpl
    });

    const response = await provider.complete({
      messages: [{ role: "user", content: "run diagnostics" }],
      tools: [createTool("diagnostics.runtime")]
    });

    expect((requests[0] as { tools: Array<{ name: string }> }).tools[0].name).toBe("diagnostics_runtime");
    expect(response.toolCalls).toEqual([
      {
        toolId: "diagnostics.runtime",
        input: {
          value: "ok"
        },
        toolCallId: "toolu_123"
      }
    ]);
  });
});
