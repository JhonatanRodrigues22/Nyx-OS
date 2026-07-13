import { CapabilityManager, type CapabilityContext, type NyxCapability } from "@nyx-os/capabilities";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import { SchedulerManager } from "@nyx-os/scheduler";
import { ToolManager, type NyxTool, type ToolContext } from "@nyx-os/tools";
import { WorkflowExecutor, WorkflowManager, type WorkflowDefinition } from "@nyx-os/workflow";

function createCapability(): NyxCapability {
  return {
    id: "workflow.capability",
    name: "Workflow Capability",
    description: "Capability used by workflow tests",
    version: "0.1.0",
    category: "custom",
    tags: ["workflow"],
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
  const calls: Array<{ toolId: string; input: unknown }> = [];
  const failures = new Map<string, number>();
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

  capabilities.register(createCapability());

  function registerTool(id: string, execute?: NyxTool["execute"]) {
    const tool: NyxTool = {
      id,
      capabilityId: "workflow.capability",
      name: id,
      description: `${id} tool`,
      version: "0.1.0",
      category: "custom",
      enabled: true,
      parameters: {},
      result: {
        description: "Workflow test result"
      },
      metadata: {},
      execute: (context, input) => {
        calls.push({ toolId: id, input });

        if (execute) {
          return execute(context, input);
        }

        return {
          toolId: id,
          input
        };
      }
    };

    tools.register(tool);
    return tool;
  }

  function failTimes(toolId: string, times: number) {
    failures.set(toolId, times);
    registerTool(toolId, () => {
      const remaining = failures.get(toolId) ?? 0;

      if (remaining > 0) {
        failures.set(toolId, remaining - 1);
        throw new Error(`${toolId} failed`);
      }

      return `${toolId} ok`;
    });
  }

  return {
    calls,
    events,
    failTimes,
    registerTool,
    tools
  };
}

describe("Workflow Engine", () => {
  it("executes a simple sequential workflow to completion", async () => {
    const { calls, registerTool, tools, events } = createHarness();

    registerTool("step.one");
    registerTool("step.two");

    const manager = new WorkflowManager({
      events,
      tools,
      idFactory: () => "wf-1"
    });

    manager.register({
      id: "workflow.simple",
      name: "Simple Workflow",
      steps: [
        { id: "one", name: "One", toolId: "step.one", next: "two" },
        { id: "two", name: "Two", toolId: "step.two", next: null }
      ]
    });

    const instance = await manager.start("workflow.simple");

    expect(instance.status).toBe("completed");
    expect(instance.currentStepId).toBeNull();
    expect(instance.history.map((entry) => entry.stepId)).toEqual(["one", "two"]);
    expect(calls.map((call) => call.toolId)).toEqual(["step.one", "step.two"]);
  });

  it("branches to the right next step based on the step result", async () => {
    const { calls, registerTool, tools, events } = createHarness();

    registerTool("step.decide", () => ({ route: "right" }));
    registerTool("step.left");
    registerTool("step.right");

    const manager = new WorkflowManager({ events, tools });

    manager.register({
      id: "workflow.branch",
      name: "Branch Workflow",
      steps: [
        {
          id: "decide",
          name: "Decide",
          toolId: "step.decide",
          next: (execution) => ((execution.result as { route: string }).route === "right" ? "right" : "left")
        },
        { id: "left", name: "Left", toolId: "step.left", next: null },
        { id: "right", name: "Right", toolId: "step.right", next: null }
      ]
    });

    const instance = await manager.start("workflow.branch");

    expect(instance.status).toBe("completed");
    expect(calls.map((call) => call.toolId)).toEqual(["step.decide", "step.right"]);
  });

  it("retries a failing step and continues when it eventually succeeds", async () => {
    const { calls, events, failTimes, registerTool, tools } = createHarness();

    failTimes("step.unstable", 2);
    registerTool("step.done");

    const manager = new WorkflowManager({
      events,
      tools,
      executor: new WorkflowExecutor({
        events,
        tools,
        wait: async () => undefined
      })
    });

    manager.register({
      id: "workflow.retry-success",
      name: "Retry Success Workflow",
      steps: [
        {
          id: "unstable",
          name: "Unstable",
          toolId: "step.unstable",
          next: "done",
          retry: { maxAttempts: 3, backoffMs: 1 }
        },
        { id: "done", name: "Done", toolId: "step.done", next: null }
      ]
    });

    const instance = await manager.start("workflow.retry-success");

    expect(instance.status).toBe("completed");
    expect(instance.history.filter((entry) => entry.stepId === "unstable")).toHaveLength(3);
    expect(calls.map((call) => call.toolId)).toEqual(["step.unstable", "step.unstable", "step.unstable", "step.done"]);
  });

  it("fails explicitly when retries are exhausted and does not continue", async () => {
    const { calls, events, failTimes, registerTool, tools } = createHarness();

    failTimes("step.always-fails", 3);
    registerTool("step.never");

    const manager = new WorkflowManager({
      events,
      tools,
      executor: new WorkflowExecutor({
        events,
        tools,
        wait: async () => undefined
      })
    });

    manager.register({
      id: "workflow.retry-fail",
      name: "Retry Fail Workflow",
      steps: [
        {
          id: "fail",
          name: "Fail",
          toolId: "step.always-fails",
          next: "never",
          retry: { maxAttempts: 2, backoffMs: 1 }
        },
        { id: "never", name: "Never", toolId: "step.never", next: null }
      ]
    });

    const instance = await manager.start("workflow.retry-fail");

    expect(instance.status).toBe("failed");
    expect(instance.currentStepId).toBe("fail");
    expect(instance.history.filter((entry) => entry.stepId === "fail")).toHaveLength(2);
    expect(calls.map((call) => call.toolId)).toEqual(["step.always-fails", "step.always-fails"]);
  });

  it("pauses during retry backoff and resumes from the same step", async () => {
    const { calls, events, failTimes, tools } = createHarness();

    failTimes("step.pause-retry", 1);

    const manager = new WorkflowManager({
      events,
      tools,
      idFactory: () => "wf-pause",
      executor: new WorkflowExecutor({
        events,
        tools,
        wait: async () => {
          manager.pause("wf-pause");
        }
      })
    });

    manager.register({
      id: "workflow.pause",
      name: "Pause Workflow",
      steps: [
        {
          id: "pause",
          name: "Pause",
          toolId: "step.pause-retry",
          next: null,
          retry: { maxAttempts: 2, backoffMs: 1 }
        }
      ]
    });

    const paused = await manager.start("workflow.pause");

    expect(paused.status).toBe("paused");
    expect(paused.currentStepId).toBe("pause");
    expect(paused.history).toHaveLength(1);

    const resumed = await manager.resume("wf-pause");

    expect(resumed.status).toBe("completed");
    expect(resumed.history.map((entry) => entry.attempt)).toEqual([1, 1]);
    expect(calls.map((call) => call.toolId)).toEqual(["step.pause-retry", "step.pause-retry"]);
  });

  it("rejects a static next step that does not exist", () => {
    const { events, registerTool, tools } = createHarness();

    registerTool("step.one");

    const manager = new WorkflowManager({ events, tools });
    const definition: WorkflowDefinition = {
      id: "workflow.invalid-next",
      name: "Invalid Next Workflow",
      steps: [{ id: "one", name: "One", toolId: "step.one", next: "missing" }]
    };

    expect(() => manager.register(definition)).toThrow(
      "Workflow workflow.invalid-next step one points to missing next step: missing"
    );
  });
});
