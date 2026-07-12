import { CapabilityManager, type CapabilityContext, type NyxCapability } from "@nyx-os/capabilities";
import { AutomationManager, type Automation } from "@nyx-os/automation";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import { SchedulerManager } from "@nyx-os/scheduler";
import { ToolManager, type NyxTool, type ToolContext } from "@nyx-os/tools";

function createCapability(id = "automation.test"): NyxCapability {
  return {
    id,
    name: "Automation Test Capability",
    description: "Capability used by automation tests",
    version: "0.1.0",
    category: "automation",
    tags: ["automation"],
    enabled: true,
    metadata: {},
    execute: () => ({ ok: true })
  };
}

function createHarness() {
  const events = createInMemoryEventBus<NyxSystemEvents>();
  const logger = createConsoleLogger();
  const memory = new MemoryManager({ events });
  const scheduler = new SchedulerManager({ events, logger });
  const executions: unknown[] = [];
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
  const tool: NyxTool = {
    id: "automation.test.tool",
    capabilityId: "automation.test",
    name: "Automation Test Tool",
    description: "Tool used by automation tests",
    version: "0.1.0",
    category: "automation",
    enabled: true,
    parameters: {},
    result: {
      description: "Execution count"
    },
    metadata: {},
    execute: (_context, input) => {
      executions.push(input ?? {});
      return {
        executions: executions.length
      };
    }
  };

  capabilities.register(createCapability());
  tools.register(tool);

  return {
    automations: new AutomationManager({ events, scheduler, tools }),
    events,
    executions,
    scheduler,
    tools
  };
}

function createAutomation(input: Partial<Automation> = {}): Automation {
  return {
    id: "automation.test",
    name: "Automation Test",
    trigger: {
      onEvent: "runtime.started"
    },
    action: {
      toolId: "automation.test.tool"
    },
    enabled: true,
    ...input
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("Nyx automation engine", () => {
  it("registers a valid automation tied to an existing tool", () => {
    const { automations } = createHarness();

    automations.register(createAutomation());

    expect(automations.list()).toEqual([
      expect.objectContaining({
        id: "automation.test",
        enabled: true,
        action: {
          toolId: "automation.test.tool"
        }
      })
    ]);
  });

  it("rejects automations with missing tools", () => {
    const { automations } = createHarness();

    expect(() =>
      automations.register(
        createAutomation({
          action: {
            toolId: "missing.tool"
          }
        })
      )
    ).toThrow("requires missing tool");
  });

  it("executes an automation when its event trigger is emitted", async () => {
    const { automations, events, executions } = createHarness();

    automations.register(createAutomation());
    events.emit("runtime.started");
    await flushPromises();

    expect(executions).toHaveLength(1);
    expect(automations.getHistory()).toEqual([
      expect.objectContaining({
        automationId: "automation.test",
        status: "success",
        trigger: {
          type: "event",
          eventName: "runtime.started"
        }
      })
    ]);
  });

  it("does not retrigger itself from tool executions originated by automation", async () => {
    const { automations, executions, tools } = createHarness();

    automations.register(
      createAutomation({
        trigger: {
          onEvent: "tool.executed"
        }
      })
    );

    await tools.execute("automation.test.tool");
    await flushPromises();

    expect(executions).toHaveLength(2);
    expect(automations.getHistory()).toEqual([
      expect.objectContaining({
        automationId: "automation.test",
        status: "success",
        toolExecution: expect.objectContaining({
          source: "automation",
          automationId: "automation.test"
        })
      })
    ]);
  });

  it("executes an automation when its schedule ticks", async () => {
    jest.useFakeTimers();
    const { automations, executions, scheduler } = createHarness();

    automations.register(
      createAutomation({
        trigger: {
          onSchedule: "1000"
        }
      })
    );
    scheduler.start();

    jest.advanceTimersByTime(1000);
    await flushPromises();

    expect(executions).toHaveLength(1);
    expect(automations.getHistory()[0]).toEqual(
      expect.objectContaining({
        automationId: "automation.test",
        trigger: {
          type: "schedule",
          schedule: "1000"
        }
      })
    );

    scheduler.stop();
    jest.useRealTimers();
  });

  it("rolls back registration when schedule attachment fails", () => {
    const { automations } = createHarness();

    expect(() =>
      automations.register(
        createAutomation({
          trigger: {
            onSchedule: "not-a-number"
          }
        })
      )
    ).toThrow("Invalid automation schedule interval");

    expect(automations.list()).toEqual([]);
    expect(() =>
      automations.register(
        createAutomation({
          trigger: {
            onSchedule: "1000"
          }
        })
      )
    ).not.toThrow();
  });

  it("does not execute disabled automations", async () => {
    const { automations, events, executions } = createHarness();

    automations.register(
      createAutomation({
        enabled: false
      })
    );
    events.emit("runtime.started");
    await flushPromises();

    expect(executions).toHaveLength(0);
    expect(automations.getHistory()).toEqual([]);
  });
});
