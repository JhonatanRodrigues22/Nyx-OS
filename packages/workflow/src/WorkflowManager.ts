import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxToolManager } from "@nyx-os/tools";
import { emitWorkflowEvent } from "./WorkflowEvents";
import { WorkflowExecutor } from "./WorkflowExecutor";
import { WorkflowRegistry } from "./WorkflowRegistry";
import type { WorkflowContext, WorkflowDefinition, WorkflowInstance } from "./WorkflowTypes";

export type WorkflowManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  tools: NyxToolManager;
  registry?: WorkflowRegistry;
  executor?: WorkflowExecutor;
  idFactory?: () => string;
};

let nextWorkflowInstanceId = 1;

function createDefaultId(): string {
  const id = `workflow_${nextWorkflowInstanceId}`;

  nextWorkflowInstanceId += 1;
  return id;
}

function cloneInstance(instance: WorkflowInstance): WorkflowInstance {
  return {
    ...instance,
    history: instance.history.map((entry) => ({ ...entry })),
    context: { ...instance.context }
  };
}

export class WorkflowManager {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly registry: WorkflowRegistry;
  private readonly executor: WorkflowExecutor;
  private readonly idFactory: () => string;
  private readonly instances = new Map<string, WorkflowInstance>();
  private readonly pauseRequests = new Set<string>();

  constructor(options: WorkflowManagerOptions) {
    this.events = options.events;
    this.registry = options.registry ?? new WorkflowRegistry(options.tools);
    this.executor = options.executor ?? new WorkflowExecutor({ events: options.events, tools: options.tools });
    this.idFactory = options.idFactory ?? createDefaultId;
  }

  register(definition: WorkflowDefinition): WorkflowDefinition {
    return this.registry.register(definition);
  }

  getDefinition(id: string): WorkflowDefinition | undefined {
    return this.registry.get(id);
  }

  listDefinitions(): WorkflowDefinition[] {
    return this.registry.list();
  }

  start(workflowId: string, context: WorkflowContext = {}): Promise<WorkflowInstance> {
    const definition = this.registry.require(workflowId);
    const firstStep = definition.steps[0];
    const instance: WorkflowInstance = {
      id: this.idFactory(),
      workflowId,
      status: "running",
      currentStepId: firstStep.id,
      history: [],
      context: { ...context }
    };

    this.instances.set(instance.id, instance);
    emitWorkflowEvent(this.events, "workflow.started", { instance: cloneInstance(instance) });

    return this.run(instance, definition);
  }

  pause(instanceId: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);

    if (instance.status === "running") {
      this.pauseRequests.add(instanceId);
    }

    if (instance.status === "paused") {
      emitWorkflowEvent(this.events, "workflow.paused", { instance: cloneInstance(instance) });
    }

    return cloneInstance(instance);
  }

  resume(instanceId: string): Promise<WorkflowInstance> {
    const instance = this.requireInstance(instanceId);

    if (instance.status !== "paused") {
      throw new Error(`Workflow instance is not paused: ${instanceId}`);
    }

    instance.status = "running";
    this.pauseRequests.delete(instanceId);
    emitWorkflowEvent(this.events, "workflow.resumed", { instance: cloneInstance(instance) });

    return this.run(instance, this.registry.require(instance.workflowId));
  }

  getInstance(id: string): WorkflowInstance | undefined {
    const instance = this.instances.get(id);

    return instance ? cloneInstance(instance) : undefined;
  }

  listInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values()).map((instance) => cloneInstance(instance));
  }

  private async run(instance: WorkflowInstance, definition: WorkflowDefinition): Promise<WorkflowInstance> {
    const result = await this.executor.run(definition, instance, {
      shouldPause: () => this.pauseRequests.has(instance.id)
    });

    this.instances.set(instance.id, result);
    this.pauseRequests.delete(instance.id);

    return cloneInstance(result);
  }

  private requireInstance(id: string): WorkflowInstance {
    const instance = this.instances.get(id);

    if (!instance) {
      throw new Error(`Workflow instance not found: ${id}`);
    }

    return instance;
  }
}
