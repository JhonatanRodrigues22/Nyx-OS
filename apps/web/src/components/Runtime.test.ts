import { getNyxConfig } from "@nyx-os/config";
import {
  BaseNyxService,
  ConfigService,
  createDashboardSnapshot,
  LoggerService,
  NyxRuntime,
  RuntimeService,
  SystemStatusService
} from "@nyx-os/core";
import { createInMemoryEventBus, type NyxSystemEventName, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createEventBus } from "@nyx-os/events";
import { ConsoleLogger, type ConsoleLoggerSink, type NyxLogEntry } from "@nyx-os/logger";
import type { NyxPlugin } from "@nyx-os/plugin";

function createMemoryLoggerService() {
  const entries: NyxLogEntry[] = [];
  const sink: ConsoleLoggerSink = {
    trace: (entry) => entries.push(entry),
    debug: (entry) => entries.push(entry),
    info: (entry) => entries.push(entry),
    warn: (entry) => entries.push(entry),
    error: (entry) => entries.push(entry)
  };

  return {
    entries,
    loggerService: new LoggerService({ logger: new ConsoleLogger(sink) })
  };
}

function createRuntimeWithMemoryLogger() {
  const { entries, loggerService } = createMemoryLoggerService();
  const runtimeEvents = createInMemoryEventBus<NyxSystemEvents>();

  return {
    entries,
    runtime: new NyxRuntime(createEventBus(), undefined, { events: runtimeEvents, loggerService }),
    runtimeEvents
  };
}

describe("Nyx runtime foundation", () => {
  it("exposes central configuration for the enabled runtime modules", () => {
    const config = getNyxConfig();

    expect(config.appName).toBe("Nyx OS");
    expect(config.version).toBe("0.1.0");
    expect(config.enabledModules).toEqual(["core", "events", "dashboard"]);
    expect(config.featureFlags.useMockData).toBe(true);
  });

  it("loads runtime configuration from a safe injected environment", () => {
    const configService = new ConfigService({
      env: {
        NODE_ENV: "production",
        NYX_APP_NAME: "Nyx Test",
        NYX_VERSION: "5.0.0",
        NYX_ENABLED_MODULES: "core,events,unknown",
        NYX_USE_MOCK_DATA: "false",
        NYX_ENABLE_AUTOMATION: "yes"
      }
    });

    const config = configService.getConfig();

    expect(config.appName).toBe("Nyx Test");
    expect(config.version).toBe("5.0.0");
    expect(config.environment).toBe("production");
    expect(config.enabledModules).toEqual(["core", "events"]);
    expect(config.featureFlags.useMockData).toBe(false);
    expect(config.featureFlags.enableAutomation).toBe(true);
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
    expect(snapshot.cards).toHaveLength(4);
    expect(snapshot.plugins.map((plugin) => plugin.id)).toContain("runtime-diagnostics");
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

    const { runtime } = createRuntimeWithMemoryLogger();

    runtime.registerService(new TestService("storage"));
    runtime.registerService(new TestService("memory", ["storage"]));

    await runtime.start();

    expect(started).toEqual(["storage", "memory"]);
    expect(runtime.getSnapshot().status).toBe("running");
    expect(runtime.getSnapshot().services.map((service) => service.name)).toEqual([
      "logger",
      "config",
      "state",
      "storage",
      "memory"
    ]);
    expect(runtime.getSnapshot().services.map((service) => service.status)).toEqual([
      "running",
      "running",
      "running",
      "running",
      "running"
    ]);

    await runtime.stop();

    expect(stopped).toEqual(["memory", "storage"]);
    expect(runtime.getSnapshot().status).toBe("stopped");
    expect(runtime.getSnapshot().events.map((event) => event.type)).toContain("runtime.stopped");
  });

  it("emits official runtime and service lifecycle events", async () => {
    const { runtime, runtimeEvents } = createRuntimeWithMemoryLogger();
    const received: Array<{ name: NyxSystemEventName; service?: string; status?: string }> = [];

    runtimeEvents.on("service.registered", (event) => {
      received.push({
        name: event.name,
        service: event.payload?.service,
        status: event.payload?.status
      });
    });
    runtimeEvents.on("service.started", (event) => {
      received.push({
        name: event.name,
        service: event.payload?.service,
        status: event.payload?.status
      });
    });
    runtimeEvents.on("service.stopped", (event) => {
      received.push({
        name: event.name,
        service: event.payload?.service,
        status: event.payload?.status
      });
    });
    runtimeEvents.on("runtime.started", (event) => {
      received.push({
        name: event.name,
        status: event.payload?.status
      });
    });
    runtimeEvents.on("runtime.stopped", (event) => {
      received.push({
        name: event.name,
        status: event.payload?.status
      });
    });

    runtime.registerService(new BaseNyxService("memory", ["config"]));

    await runtime.start();
    await runtime.stop();

    expect(runtime.getEventBus()).toBe(runtimeEvents);
    expect(received).toContainEqual({
      name: "service.registered",
      service: "memory",
      status: "created"
    });
    expect(received).toContainEqual({
      name: "service.started",
      service: "memory",
      status: "running"
    });
    expect(received).toContainEqual({
      name: "service.stopped",
      service: "memory",
      status: "stopped"
    });
    expect(received).toContainEqual({
      name: "runtime.started",
      status: "running"
    });
    expect(received).toContainEqual({
      name: "runtime.stopped",
      status: "stopped"
    });
  });

  it("emits service and runtime failure events", async () => {
    class FailingService extends BaseNyxService {
      start() {
        throw new Error("service failed");
      }
    }

    const { runtime, runtimeEvents } = createRuntimeWithMemoryLogger();
    const received: Array<{ name: NyxSystemEventName; service?: string; status?: string }> = [];

    runtimeEvents.on("service.failed", (event) => {
      received.push({
        name: event.name,
        service: event.payload?.service,
        status: event.payload?.status
      });
    });
    runtimeEvents.on("runtime.failed", (event) => {
      received.push({
        name: event.name,
        status: event.payload?.status
      });
    });

    runtime.registerService(new FailingService("memory", ["config"]));

    await expect(runtime.start()).rejects.toThrow("service failed");

    expect(received).toContainEqual({
      name: "service.failed",
      service: "memory",
      status: "failed"
    });
    expect(received).toContainEqual({
      name: "runtime.failed",
      status: "failed"
    });
  });

  it("registers, initializes, disposes and unregisters runtime plugins", async () => {
    const { runtime, runtimeEvents } = createRuntimeWithMemoryLogger();
    const received: string[] = [];
    const plugin: NyxPlugin & { initialized: boolean; disposed: boolean } = {
      id: "example-plugin",
      name: "Example Plugin",
      version: "0.1.0",
      initialized: false,
      disposed: false,
      initialize(context) {
        this.initialized = true;
        expect(context.events).toBe(runtimeEvents);
        expect(context.runtime).toBe(runtime);
        expect(context.services.list().length).toBeGreaterThan(0);
      },
      dispose() {
        this.disposed = true;
      }
    };

    runtimeEvents.on("plugin.registered", (event) => received.push(event.name));
    runtimeEvents.on("plugin.initialized", (event) => received.push(event.name));
    runtimeEvents.on("plugin.disposed", (event) => received.push(event.name));
    runtimeEvents.on("plugin.unregistered", (event) => received.push(event.name));

    runtime.registerPlugin(plugin);

    await runtime.start();

    expect(plugin.initialized).toBe(true);
    expect(runtime.getPlugin("example-plugin")).toBe(plugin);
    expect(runtime.getPlugins()).toContainEqual(
      expect.objectContaining({
        id: "example-plugin",
        status: "initialized"
      })
    );

    await runtime.unregisterPlugin("example-plugin");

    expect(plugin.disposed).toBe(true);
    expect(runtime.getPlugin("example-plugin")).toBeUndefined();
    expect(received).toEqual(
      expect.arrayContaining([
        "plugin.registered",
        "plugin.initialized",
        "plugin.disposed",
        "plugin.unregistered"
      ])
    );
  });

  it("starts and stops base services through the runtime service manager", async () => {
    const { entries, runtime } = createRuntimeWithMemoryLogger();

    await runtime.start();

    expect(runtime.loggerService?.getLogger()).toBeDefined();
    expect(runtime.configService?.getSnapshot().appName).toBe("Nyx OS");
    expect(runtime.stateService?.getRuntimeState().status).toBe("running");
    expect(runtime.getSnapshot().services).toEqual([
      {
        name: "logger",
        status: "running",
        dependencies: []
      },
      {
        name: "config",
        status: "running",
        dependencies: ["logger"]
      },
      {
        name: "state",
        status: "running",
        dependencies: ["logger"]
      }
    ]);
    expect(entries.map((entry) => entry.message)).toContain("Runtime started");
    expect(entries.map((entry) => entry.message)).toContain("Config service loaded configuration");

    await runtime.stop();

    expect(runtime.getSnapshot().services.map((service) => service.status)).toEqual(["stopped", "stopped", "stopped"]);
    expect(runtime.getRuntimeState()?.status).toBe("stopped");
    expect(entries.map((entry) => entry.message)).toContain("Runtime stopped");
  });

  it("exposes runtime state with service health and metadata", async () => {
    const { runtime } = createRuntimeWithMemoryLogger();

    runtime.registerService(new BaseNyxService("memory", ["config"]));

    await runtime.start();

    expect(runtime.getRuntimeState()).toMatchObject({
      status: "running",
      version: "0.1.0",
      environment: "test"
    });
    expect(runtime.stateService?.getService("memory")).toMatchObject({
      name: "memory",
      status: "running",
      health: "healthy",
      dependencies: ["config"]
    });
    expect(runtime.stateService?.getServices().map((service) => service.name)).toEqual([
      "logger",
      "config",
      "state",
      "memory"
    ]);

    await runtime.stop();

    expect(runtime.stateService?.getService("memory")).toMatchObject({
      status: "stopped",
      health: "unknown"
    });
  });

  it("rejects services with missing dependencies and records the failure through logger and state", async () => {
    const { entries, runtime } = createRuntimeWithMemoryLogger();

    runtime.registerService(new BaseNyxService("memory", ["storage"]));

    await expect(runtime.start()).rejects.toThrow("missing dependencies");
    expect(runtime.getSnapshot().status).toBe("failed");
    expect(runtime.getRuntimeState()?.status).toBe("failed");
    expect(runtime.stateService?.getService("memory")).toMatchObject({
      status: "created",
      health: "unknown"
    });
    expect(runtime.getSnapshot().events[0].type).toBe("runtime.failed");
    expect(entries.map((entry) => entry.level)).toContain("error");
    expect(entries.map((entry) => entry.message)).toContain("Runtime failed");
  });
});
