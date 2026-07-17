import { createDashboardSnapshotFromRuntime } from "@nyx-os/core";
import type { NextApiHandler } from "next";
import { getCockpitRuntime } from "@/server/cockpitRuntime";

export const devSnapshotHandler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const handle = getCockpitRuntime();

  await handle.ready;

  res.status(200).json({
    snapshot: createDashboardSnapshotFromRuntime(handle.runtime)
  });
};

export default devSnapshotHandler;
