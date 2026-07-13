import type { NextApiRequest, NextApiResponse } from "next";
import { createCockpitChatHandler } from "@/pages/api/cockpit/chat";
import { createCockpitCommandsHandler } from "@/pages/api/cockpit/commands";

type MockResponse = NextApiResponse & {
  statusCodeValue: number;
  headers: Record<string, string | number | readonly string[]>;
  chunks: string[];
  jsonPayload: unknown;
};

function createResponse(): MockResponse {
  const response = {
    statusCodeValue: 200,
    headers: {},
    chunks: [],
    jsonPayload: undefined,
    setHeader(name: string, value: string | number | readonly string[]) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCodeValue = code;
      return this;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this;
    },
    write(chunk: string) {
      this.chunks.push(chunk);
      return true;
    },
    end() {
      return this;
    }
  };

  return response as MockResponse;
}

function createRequest(body: unknown, method = "POST"): NextApiRequest {
  return {
    method,
    body
  } as NextApiRequest;
}

describe("Nyx Interaction Layer API", () => {
  it("streams chat through the server-side AI runtime without leaking provider secrets", async () => {
    const secret = "anthropic-secret-that-must-not-leak";
    const requests: Array<{ message: string; systemPrompt?: string }> = [];
    const ai = {
      async *streamUserMessage(message: string, options: { systemPrompt?: string }) {
        requests.push({ message, systemPrompt: options.systemPrompt });
        yield { content: "Resposta " };
        yield { content: "segura." };
        yield { done: true };
      }
    };
    const handler = createCockpitChatHandler({
      systemPrompt: `Prompt seguro sem ${secret.replace("secret", "valor")}`,
      getRuntime: () => ({
        ready: Promise.resolve(),
        runtime: {
          getAi: () => ai
        } as never
      })
    });
    const response = createResponse();

    await handler(createRequest({ message: "Oi Nyx" }), response);

    const output = response.chunks.join("");

    expect(requests).toEqual([
      {
        message: "Oi Nyx",
        systemPrompt: "Prompt seguro sem anthropic-valor-that-must-not-leak"
      }
    ]);
    expect(output).toContain("event: chunk");
    expect(output).toContain("Resposta ");
    expect(output).not.toContain(secret);
  });

  it("returns provider errors as treated SSE errors without raw stack traces", async () => {
    const handler = createCockpitChatHandler({
      getRuntime: () => ({
        ready: Promise.resolve(),
        runtime: {
          getAi: () => ({
            async *streamUserMessage() {
              throw new Error("Provider unavailable");
            }
          })
        } as never
      })
    });
    const response = createResponse();

    await handler(createRequest({ message: "Teste" }), response);

    const output = response.chunks.join("");

    expect(output).toContain("event: error");
    expect(output).toContain("Provider unavailable");
    expect(output).not.toContain("at ");
    expect(output).not.toContain("ANTHROPIC_API_KEY");
  });

  it("runs quick commands through the requested tool", async () => {
    const execute = jest.fn().mockResolvedValue({
      toolId: "diagnostics.runtime",
      capabilityId: "diagnostics.runtime",
      status: "success",
      result: { ok: true },
      executedAt: "2026-07-13T00:00:00.000Z"
    });
    const handler = createCockpitCommandsHandler({
      getRuntime: () => ({
        ready: Promise.resolve(),
        runtime: {
          getTools: () => ({
            execute
          })
        } as never
      })
    });
    const response = createResponse();

    await handler(createRequest({ toolId: "diagnostics.runtime" }), response);

    expect(execute).toHaveBeenCalledWith("diagnostics.runtime", undefined, {
      source: "cockpit.quick-command"
    });
    expect(response.statusCodeValue).toBe(200);
    expect(response.jsonPayload).toEqual({
      execution: {
        toolId: "diagnostics.runtime",
        status: "success",
        result: { ok: true },
        executedAt: "2026-07-13T00:00:00.000Z"
      }
    });
  });
});
