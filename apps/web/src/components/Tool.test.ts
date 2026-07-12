import { CapabilityManager, type CapabilityContext, type NyxCapability } from "@nyx-os/capabilities";
import { NyxRuntime } from "@nyx-os/core";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import type { NyxPlugin } from "@nyx-os/plugin";
import { SchedulerManager } from "@nyx-os/scheduler";
import { ToolManager, type NyxTool, type ToolContext } from "@nyx-os/tools";

function createCapability(id = "test.capability"): NyxCapability {
  return {
    id,
    name: "Test Capability",
    description: "Test capability",
    version: "0.1.0",
    category: "custom",
    tags: ["test"],
    enabled: true,
    metadata: {},
    execute: () => ({ ok: true })
  };
}

function createTool(id = "test.tool", capabilityId = "test.capability"): NyxTool<{ value: string }, string> {
  return {
    id,
    capabilityId,
    name: "Test Tool",
    description: "Test tool",
    version: "0.1.0",
    category: "custom",
    enabled: true,
    parameters: {
      value: {
        type: "string",
        required: true
      }
    },
    result: {
      description: "Echo result"
    },
    metadata: {},
    execute: (_context, input) => input?.value ?? ""
  };
}

function createHarness(events = createInMemoryEventBus<NyxSystemEvents>()) {
  const logger = createConsoleLogger();
  const memory = new MemoryManager({ events });
  const scheduler = new SchedulerManager({ events, logger });
  const capabilities = new CapabilityManager({
    events,
    createContext: (): CapabilityContext => ({
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
      scheduler
    })
  });
  const tools = new ToolManager({
    events,
    capabilities,
    createContext: (): ToolContext => ({
      runtime: {
        getCapabilities: () => capabilities,
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
      scheduler,
      eventBus: events,
      services: {
        list: () => []
      },
      capabilities
    })
  });

  return { capabilities, events, tools };
}

describe("Nyx tool calling engine", () => {
  it("registers, lists and removes tools tied to capabilities", () => {
    const { capabilities, tools } = createHarness();

    capabilities.register(createCapability());
    tools.register(createTool());

    expect(tools.isAvailable("test.tool")).toBe(true);
    expect(tools.get("test.tool")?.name).toBe("Test Tool");
    expect(tools.findByCategory("custom")).toHaveLength(1);
    expect(tools.list()).toEqual([
      expect.objectContaining({
        id: "test.tool",
        capabilityId: "test.capability",
        enabled: true
      })
    ]);

    tools.remove("test.tool");

    expect(tools.list()).toEqual([]);
  });

  it("rejects orphan tools without a registered capability", () => {
    const { tools } = createHarness();

    expect(() => tools.register(createTool())).toThrow("requires missing capability");
  });

  it("executes tools and validates required parameters", async () => {
    const { capabilities, tools } = createHarness();

    capabilities.register(createCapability());
    tools.register(createTool());

    await expect(tools.execute("test.tool", {})).rejects.toThrow("Missing required parameter");

    const execution = await tools.execute<string, { value: string }>("test.tool", { value: "nyx" });

    expect(execution).toMatchObject({
      toolId: "test.tool",
      capabilityId: "test.capability",
      status: "success",
      result: "nyx"
    });
    expect(tools.list()[0]).toEqual(
      expect.objectContaining({
        lastExecutedAt: execution.executedAt
      })
    );
  });

  it("emits tool lifecycle events", async () => {
    const { capabilities, events, tools } = createHarness();
    const received: string[] = [];

    events.on("tool.registered", (event) => received.push(event.name));
    events.on("tool.executed", (event) => received.push(event.name));
    events.on("tool.failed", (event) => received.push(event.name));
    events.on("tool.removed", (event) => received.push(event.name));

    capabilities.register(createCapability());
    tools.register(createTool());
    await tools.execute("test.tool", { value: "ok" });
    await expect(tools.execute("test.tool", {})).rejects.toThrow("Missing required parameter");
    tools.remove("test.tool");

    expect(received).toEqual(["tool.registered", "tool.executed", "tool.failed", "tool.removed"]);
  });

  it("exposes base tools through the runtime", async () => {
    const runtime = new NyxRuntime(undefined, {
      events: createInMemoryEventBus<NyxSystemEvents>()
    });

    await runtime.start();

    expect(runtime.getTools().isAvailable("diagnostics.runtime")).toBe(true);
    expect(runtime.getTools().isAvailable("memory.search")).toBe(true);

    const diagnostics = await runtime.getTools().execute("diagnostics.runtime");
    const memory = await runtime.getTools().execute("memory.search", { text: "runtime" });

    expect(diagnostics.status).toBe("success");
    expect(memory.status).toBe("success");
    expect(runtime.getSnapshot().tools.map((tool) => tool.id)).toEqual(
      expect.arrayContaining(["diagnostics.runtime", "memory.search"])
    );

    await runtime.stop();
  });

  it("exposes tools through plugin context", async () => {
    const runtime = new NyxRuntime(undefined, {
      events: createInMemoryEventBus<NyxSystemEvents>(),
      registerBasePlugins: false
    });
    const plugin: NyxPlugin = {
      id: "tool-plugin",
      name: "Tool Plugin",
      version: "0.1.0",
      initialize(context) {
        context.capabilities.register(createCapability("plugin.capability"));
        context.tools.register(createTool("plugin.tool", "plugin.capability"));
      }
    };

    runtime.registerPlugin(plugin);
    await runtime.start();

    expect(runtime.getTools().isAvailable("plugin.tool")).toBe(true);

    await runtime.stop();
  });
});
