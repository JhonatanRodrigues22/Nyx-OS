import { CapabilityManager, type CapabilityContext, type NyxCapability } from "@nyx-os/capabilities";
import { NyxRuntime } from "@nyx-os/core";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import type { NyxPlugin } from "@nyx-os/plugin";
import { SchedulerManager } from "@nyx-os/scheduler";

function createCapability(id = "test.capability"): NyxCapability<{ value: number }, number> {
  return {
    id,
    name: "Test Capability",
    description: "Test capability",
    version: "0.1.0",
    category: "custom",
    tags: ["test"],
    enabled: true,
    metadata: {},
    execute: (_context, input) => input?.value ?? 0
  };
}

function createContext(events = createInMemoryEventBus<NyxSystemEvents>()): CapabilityContext {
  const logger = createConsoleLogger();
  const memory = new MemoryManager({ events });

  return {
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
      ai: {
        provider: "fake",
        model: "fake"
      },
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
    scheduler: new SchedulerManager({ events, logger })
  };
}

describe("Nyx capability engine", () => {
  it("registers, lists, finds and removes capabilities", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new CapabilityManager({ events, createContext: () => createContext(events) });

    manager.register(createCapability());

    expect(manager.isAvailable("test.capability")).toBe(true);
    expect(manager.get("test.capability")?.name).toBe("Test Capability");
    expect(manager.findByCategory("custom")).toHaveLength(1);
    expect(manager.list()).toEqual([
      expect.objectContaining({
        id: "test.capability",
        enabled: true
      })
    ]);

    manager.remove("test.capability");

    expect(manager.list()).toEqual([]);
  });

  it("executes capabilities with a standard context", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const context = createContext(events);
    const manager = new CapabilityManager({ events, createContext: () => context });

    manager.register(createCapability());

    const execution = await manager.execute<number, { value: number }>("test.capability", { value: 42 });

    expect(execution).toMatchObject({
      capabilityId: "test.capability",
      status: "success",
      result: 42
    });
  });

  it("emits capability lifecycle events", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const manager = new CapabilityManager({ events, createContext: () => createContext(events) });
    const received: string[] = [];

    events.on("capability.registered", (event) => received.push(event.name));
    events.on("capability.executed", (event) => received.push(event.name));
    events.on("capability.failed", (event) => received.push(event.name));
    events.on("capability.removed", (event) => received.push(event.name));

    manager.register(createCapability());
    await manager.execute("test.capability", { value: 1 });
    manager.register({
      ...createCapability("broken.capability"),
      execute() {
        throw new Error("broken");
      }
    });
    await expect(manager.execute("broken.capability")).rejects.toThrow("broken");
    manager.remove("test.capability");

    expect(received).toEqual([
      "capability.registered",
      "capability.executed",
      "capability.registered",
      "capability.failed",
      "capability.removed"
    ]);
  });

  it("exposes capabilities through the runtime", async () => {
    const runtime = new NyxRuntime(undefined, {
      events: createInMemoryEventBus<NyxSystemEvents>()
    });

    await runtime.start();

    expect(runtime.getCapabilities().isAvailable("diagnostics.runtime")).toBe(true);
    expect(runtime.getCapabilities().isAvailable("memory.search")).toBe(true);

    const diagnostics = await runtime.getCapabilities().execute("diagnostics.runtime");
    const memory = await runtime.getCapabilities().execute("memory.search", { text: "runtime" });

    expect(diagnostics.status).toBe("success");
    expect(memory.status).toBe("success");
    expect(runtime.getSnapshot().capabilities.map((capability) => capability.id)).toEqual(
      expect.arrayContaining(["diagnostics.runtime", "memory.search"])
    );

    await runtime.stop();
  });

  it("exposes capabilities through plugin context", async () => {
    const runtime = new NyxRuntime(undefined, {
      events: createInMemoryEventBus<NyxSystemEvents>(),
      registerBasePlugins: false
    });
    const plugin: NyxPlugin = {
      id: "capability-plugin",
      name: "Capability Plugin",
      version: "0.1.0",
      initialize(context) {
        context.capabilities.register(createCapability("plugin.capability"));
      }
    };

    runtime.registerPlugin(plugin);
    await runtime.start();

    expect(runtime.getCapabilities().isAvailable("plugin.capability")).toBe(true);

    await runtime.stop();
  });
});
