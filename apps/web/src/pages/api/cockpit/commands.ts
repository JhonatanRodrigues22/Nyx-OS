import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getCockpitRuntime, type CockpitRuntimeHandle } from "@/server/cockpitRuntime";

export type CockpitCommandsHandlerOptions = {
  getRuntime?: () => CockpitRuntimeHandle;
};

type CockpitCommandRequest = {
  toolId?: unknown;
  input?: unknown;
};

export function createCockpitCommandsHandler(options: CockpitCommandsHandlerOptions = {}): NextApiHandler {
  return async function cockpitCommandsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    const body = req.body as CockpitCommandRequest;

    if (typeof body.toolId !== "string" || body.toolId.trim().length === 0) {
      res.status(400).json({ error: "toolId is required." });
      return;
    }

    try {
      const handle = (options.getRuntime ?? getCockpitRuntime)();

      await handle.ready;

      const execution = await handle.runtime.getTools().execute(body.toolId, body.input, {
        source: "cockpit.quick-command"
      });

      res.status(200).json({
        execution: {
          toolId: execution.toolId,
          status: execution.status,
          result: execution.result,
          executedAt: execution.executedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Command failed."
      });
    }
  };
}

export default createCockpitCommandsHandler();
