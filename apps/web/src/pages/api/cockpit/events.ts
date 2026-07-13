import type { NextApiHandler } from "next";
import {
  cockpitObservedEvents,
  createCockpitEventPayload,
  getCockpitRuntime
} from "@/server/cockpitRuntime";

export const cockpitEventsHandler: NextApiHandler = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const handle = getCockpitRuntime();
  await handle.ready;

  const writeEvent = (data: unknown) => {
    res.write(`event: nyx\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  const unsubscribers = cockpitObservedEvents.map((eventName) =>
    handle.runtime.getEventBus().on(eventName, (event) => {
      writeEvent(createCockpitEventPayload(eventName, event.payload));
    })
  );

  writeEvent({
    id: "cockpit.connected",
    name: "cockpit.connected",
    timestamp: new Date().toISOString(),
    source: "cockpit",
    status: "connected",
    metadata: {}
  });

  req.on("close", () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    res.end();
  });
};

export default cockpitEventsHandler;
