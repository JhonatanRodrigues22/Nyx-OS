import type { NextApiRequest, NextApiResponse } from "next";
import { listCockpitActiveProjects } from "@/server/personalDataRuntime";

type ApiResponse = {
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

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ error: "Method not allowed." });
}
