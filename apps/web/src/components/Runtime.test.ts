import { getNyxConfig } from "@nyx-os/config";
import {
  BaseNyxService,
  createDashboardSnapshot,
  NyxRuntime,
  RuntimeService,
  SystemStatusService
} from "@nyx-os/core";
import { createEventBus } from "@nyx-os/events";

describe("Nyx runtime foundation", () => {
  it("exposes central configuration for the enabled runtime modules", () => {
    const config = getNyxConfig();

    expect(config.appName).toBe("Nyx OS");
    expect(config.version).toBe("0.1.0");
    expect(config.enabledModules).toEqual(["core", "events", "dashboard"]);
    expect(config.featureFlags.useMockData).toBe(true);
  });

  it("stores recent events in memory", () => {
    const eventBus = createEventBus();
    const receivedTypes: string[] = [];

    const unsubscribe = eventBus.subscribe("runtime.started", (event) => {
      receivedTypes.push(event.type);
    });

    const event = eventBus.emit({
      type: "runtime.started",
      message: "Runtime started.",
      source: "runtime"
    });

    expect(eventBus.listRecent()).toEqual([event]);
    expect(receivedTypes).toEqual(["runtime.started"]);

    unsubscribe();

    eventBus.emit({
      type: "runtime.started",
      message: "Runtime started again.",
      source: "runtime"
    });

    expect(receivedTypes).toEqual(["runtime.started"]);
  });

  it("returns runtime and system status through services", () => {
    const runtimeService = new RuntimeService(getNyxConfig());
    const runtime = runtimeService.getState();
    const status = new SystemStatusService().getStatus(runtime);

    expect(runtime.status).toBe("ready");
    expect(runtime.modules.some((module) => module.id === "memory" && module.status === "planned")).toBe(true);
    expect(status.health).toBe("online");
  });

  it("creates a dashboard snapshot without UI-owned mock data", () => {
    const snapshot = createDashboardSnapshot();

    expect(snapshot.runtime.name).toBe("Nyx OS");
    expect(snapshot.cards).toHaveLength(3);
    expect(snapshot.navigation.map((item) => item.label)).toContain("Memória");
    expect(snapshot.recentEvents.map((event) => event.type)).toContain("dashboard.loaded");
  });

  it("starts generic runtime services respecting dependencies", async () => {
    const started: string[] = [];
    const stopped: string[] = [];

    class TestService extends BaseNyxService {
      async start() {
        started.push(this.name);
        await super.start();
      }

      async stop() {
        stopped.push(this.name);
        await super.stop();
      }
    }

    const runtime = new NyxRuntime();

    runtime.registerService(new TestService("storage"));
    runtime.registerService(new TestService("memory", ["storage"]));

    await runtime.start();

    expect(started).toEqual(["storage", "memory"]);
    expect(runtime.getSnapshot().status).toBe("running");
    expect(runtime.getSnapshot().services.map((service) => service.status)).toEqual(["running", "running"]);

    await runtime.stop();

    expect(stopped).toEqual(["memory", "storage"]);
    expect(runtime.getSnapshot().status).toBe("stopped");
    expect(runtime.getSnapshot().events.map((event) => event.type)).toContain("runtime.stopped");
  });

  it("rejects services with missing dependencies", async () => {
    const runtime = new NyxRuntime();

    runtime.registerService(new BaseNyxService("memory", ["storage"]));

    await expect(runtime.start()).rejects.toThrow("missing dependencies");
    expect(runtime.getSnapshot().status).toBe("failed");
    expect(runtime.getSnapshot().events[0].type).toBe("runtime.failed");
  });
});
