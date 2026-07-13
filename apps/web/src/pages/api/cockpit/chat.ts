import type { AiConversationManager } from "@nyx-os/ai";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createCockpitSystemPrompt, getCockpitRuntime, type CockpitRuntimeHandle } from "@/server/cockpitRuntime";

export type CockpitChatHandlerOptions = {
  getRuntime?: () => CockpitRuntimeHandle;
  systemPrompt?: string;
};

type CockpitChatRequest = {
  message?: unknown;
};

function writeSse(res: NextApiResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "AI provider request failed.";
}

async function handleStream(ai: AiConversationManager, message: string, res: NextApiResponse, systemPrompt: string) {
  writeSse(res, "status", { status: "streaming" });

  for await (const chunk of ai.streamUserMessage(message, { systemPrompt })) {
    if (chunk.content) {
      writeSse(res, "chunk", { content: chunk.content });
    }

    if (chunk.toolCall) {
      writeSse(res, "tool_call", { toolId: chunk.toolCall.toolId });
    }
  }

  writeSse(res, "done", { done: true });
}

export function createCockpitChatHandler(options: CockpitChatHandlerOptions = {}): NextApiHandler {
  return async function cockpitChatHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const body = req.body as CockpitChatRequest;

    if (typeof body.message !== "string" || body.message.trim().length === 0) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    try {
      const handle = (options.getRuntime ?? getCockpitRuntime)();

      await handle.ready;

      const ai = handle.runtime.getAi();

      if (!ai) {
        throw new Error("AI runtime is not available.");
      }

      await handleStream(ai, body.message, res, options.systemPrompt ?? createCockpitSystemPrompt());
    } catch (error) {
      writeSse(res, "error", {
        error: getErrorMessage(error)
      });
    } finally {
      res.end();
    }
  };
}

export default createCockpitChatHandler();
