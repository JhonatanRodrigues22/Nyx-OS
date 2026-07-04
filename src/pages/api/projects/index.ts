import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type ApiResponse = {
  message: string;
  supportedMethods?: string[];
  supabaseReady?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method ?? "")) {
    res.setHeader("Allow", ["GET", "POST", "PUT", "PATCH", "DELETE"]);
    return res.status(405).json({ message: "Method not allowed." });
  }

  // Example Supabase touchpoint for future CRUD implementation.
  const supabaseReady = supabase !== null;

  return res.status(501).json({
    message: "Projects API not implemented yet.",
    supportedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    supabaseReady
  });
}
