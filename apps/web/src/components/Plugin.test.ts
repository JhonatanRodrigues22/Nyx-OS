import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { CapabilityManager } from "@nyx-os/capabilities";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import { PluginManager, type NyxPlugin, type NyxPluginContext } from "@nyx-os/plugin";
import { SchedulerManager } from "@nyx-os/scheduler";

function createPlugin(id = "test-plugin"): NyxPlugin & { initialized: boolean; disposed: boolean } {
  return {
    id,
    name: "Test Plugin",
    version: "0.1.0",
    initialized: false,
    disposed: false,
    initialize() {
      this.initialized = true;
    },
    dispose() {
      this.disposed = true;
    }
  };
}

function createContext(events = createInMemoryEventBus<NyxSystemEvents>()): NyxPluginContext {
  const logger = createConsoleLogger();
  const memory = new MemoryManager({ events });
  const scheduler = new SchedulerManager({ events, logger });
  const capabilities = new CapabilityManager({
    events,
    createContext: () => ({
      runtime: {
        getEventBus: () => events,
        getMemory: () => memory
      },
      logger,
      config: {
        appName: "Nyx OS",
        version: "0.1.0",
        environment: "test",
        enabledModules: ["core", "events", "dashboard"],
        featureFlags: {
          useMockData: true,
          enablePersistentMemory: false,
          enableAutomation: false,
          enableAiRuntime: false
        }
      },
      memory,
      eventBus: events,
      services: {
        list: () => []
      },
      scheduler
    })
  });

  return {
    runtime: {
      getCapabilities: () => capabilities,
      getEventBus: () => events,
      getMemory: () => memory
    },
    capabilities,
    events,
    logger,
    memory,
    scheduler,
    services: {
      list: () => []
    },
    state: null
  };
}

describe("Nyx plugin framework", () => {
  it("registers and lists plugins", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);

    manager.register(createPlugin());

    expect(manager.list()).toEqual([
      expect.objectContaining({
        id: "test-plugin",
        name: "Test Plugin",
        status: "registered"
      })
    ]);
    expect(manager.get("test-plugin")?.name).toBe("Test Plugin");
    expect(manager.getState("test-plugin")?.status).toBe("registered");
  });

  it("prevents duplicate plugin IDs", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);

    manager.register(createPlugin());

    expect(() => manager.register(createPlugin())).toThrow("already registered");
  });

  it("initializes and disposes plugins", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);
    const plugin = createPlugin();
    const context = createContext(events);

    manager.register(plugin);

    await manager.initialize("test-plugin", context);
    await manager.dispose("test-plugin", context);

    expect(plugin.initialized).toBe(true);
    expect(plugin.disposed).toBe(true);
    expect(manager.getState("test-plugin")?.status).toBe("disposed");
  });

  it("unregisters plugins", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);
    const context = createContext(events);

    manager.register(createPlugin());

    await manager.unregister("test-plugin", context);

    expect(manager.get("test-plugin")).toBeUndefined();
    expect(manager.list()).toEqual([]);
  });

  it("emits plugin lifecycle events", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);
    const context = createContext(events);
    const received: string[] = [];

    events.on("plugin.registered", (event) => received.push(event.name));
    events.on("plugin.initialized", (event) => received.push(event.name));
    events.on("plugin.disposed", (event) => received.push(event.name));
    events.on("plugin.unregistered", (event) => received.push(event.name));

    manager.register(createPlugin());
    await manager.initialize("test-plugin", context);
    await manager.unregister("test-plugin", context);

    expect(received).toEqual([
      "plugin.registered",
      "plugin.initialized",
      "plugin.disposed",
      "plugin.unregistered"
    ]);
  });

  it("marks plugin failures", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new PluginManager(events);
    const context = createContext(events);
    const failed: string[] = [];

    events.on("plugin.failed", (event) => failed.push(event.payload?.plugin ?? ""));
    manager.register({
      id: "broken-plugin",
      name: "Broken Plugin",
      version: "0.1.0",
      initialize() {
        throw new Error("broken");
      }
    });

    await expect(manager.initialize("broken-plugin", context)).rejects.toThrow("broken");

    expect(manager.getState("broken-plugin")).toMatchObject({
      status: "failed",
      error: "broken"
    });
    expect(failed).toEqual(["broken-plugin"]);
  });
});
