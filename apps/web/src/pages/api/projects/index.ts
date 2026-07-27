import type { NextApiRequest, NextApiResponse } from "next";
import { createCockpitProject, listCockpitActiveProjects } from "@/server/personalDataRuntime";

type ApiResponse = {
  project?: Awaited<ReturnType<typeof createCockpitProject>>;
  projects?: Awaited<ReturnType<typeof listCockpitActiveProjects>>["projects"];
  total?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    const result = await listCockpitActiveProjects();

    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    try {
      const project = await createCockpitProject(req.body);

      return res.status(201).json({ project });
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Project could not be created."
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
