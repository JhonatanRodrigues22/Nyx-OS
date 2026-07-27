import type { NextApiRequest, NextApiResponse } from "next";
import { createCockpitTask, listCockpitOpenTasks } from "@/server/personalDataRuntime";

type ApiResponse = {
  task?: Awaited<ReturnType<typeof createCockpitTask>>;
  tasks?: Awaited<ReturnType<typeof listCockpitOpenTasks>>["tasks"];
  total?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    const result = await listCockpitOpenTasks();

    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    try {
      const task = await createCockpitTask(req.body);

      return res.status(201).json({ task });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Task could not be created."
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
