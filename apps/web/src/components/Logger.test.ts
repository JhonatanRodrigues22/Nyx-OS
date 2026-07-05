import { ConsoleLogger, type ConsoleLoggerSink, type NyxLogEntry } from "@nyx-os/logger";

function createMemorySink() {
  const entries: NyxLogEntry[] = [];
  const sink: ConsoleLoggerSink = {
    trace: (entry) => entries.push(entry),
    debug: (entry) => entries.push(entry),
    info: (entry) => entries.push(entry),
    warn: (entry) => entries.push(entry),
    error: (entry) => entries.push(entry)
  };

  return { entries, sink };
}

describe("Nyx logger", () => {
  it("writes every supported log level through one logger interface", () => {
    const { entries, sink } = createMemorySink();
    const logger = new ConsoleLogger(sink);

    logger.trace("Trace message", { scope: "test" });
    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warn message");
    logger.error("Error message");

    expect(entries.map((entry) => entry.level)).toEqual(["trace", "debug", "info", "warn", "error"]);
    expect(entries[0]).toMatchObject({
      level: "trace",
      message: "Trace message",
      context: { scope: "test" }
    });
    expect(entries.every((entry) => typeof entry.timestamp === "string")).toBe(true);
  });
});
