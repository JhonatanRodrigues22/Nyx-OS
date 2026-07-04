import type { NextApiRequest, NextApiResponse } from "next";
import { insertCaptureItem, parseCapturePayload } from "@/lib/capture";
import { supabase } from "@/lib/supabase";

type CaptureApiResponse =
  | {
      ok: true;
      table: string;
    }
  | {
      ok: false;
      error: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CaptureApiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  if (!supabase) {
    return res.status(500).json({
      ok: false,
      error: "Supabase is not configured."
    });
  }

  try {
    const payload = parseCapturePayload(req.body);
    const result = await insertCaptureItem(supabase, payload);

    return res.status(201).json({
      ok: true,
      table: result.table
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to capture item.";
    return res.status(400).json({
      ok: false,
      error: message
    });
  }
}
