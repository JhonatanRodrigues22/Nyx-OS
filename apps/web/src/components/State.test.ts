import { InMemoryNyxStateService } from "@nyx-os/state";

function createClock() {
  let currentTime = new Date("2026-01-01T00:00:00.000Z");

  return {
    advance(ms: number) {
      currentTime = new Date(currentTime.getTime() + ms);
    },
    now() {
      return currentTime;
    }
  };
}

describe("Nyx state service", () => {
  it("exposes runtime metadata, services and uptime", () => {
    const clock = createClock();
    const state = new InMemoryNyxStateService(() => clock.now());

    state.initializeRuntime({
      version: "1.2.3",
      environment: "test",
      services: [{ name: "logger", status: "created", dependencies: [] }]
    });
    state.updateRuntimeStatus("running");
    state.updateService({ name: "logger", status: "running" });
    clock.advance(2500);

    expect(state.getVersion()).toBe("1.2.3");
    expect(state.getEnvironment()).toBe("test");
    expect(state.getUptime()).toBe(2500);
    expect(state.getService("logger")).toMatchObject({
      name: "logger",
      status: "running",
      health: "healthy"
    });
    expect(state.getRuntimeState()).toMatchObject({
      status: "running",
      version: "1.2.3",
      environment: "test",
      uptimeMs: 2500
    });
  });

  it("marks failed services as unhealthy", () => {
    const state = new InMemoryNyxStateService();

    state.registerService({ name: "memory", status: "created", dependencies: ["config"] });
    state.updateService({ name: "memory", status: "failed" });

    expect(state.getService("memory")).toMatchObject({
      status: "failed",
      health: "failed",
      dependencies: ["config"]
    });
  });
});
