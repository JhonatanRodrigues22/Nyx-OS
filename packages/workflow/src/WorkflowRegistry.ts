import type { NyxToolManager } from "@nyx-os/tools";
import type { WorkflowDefinition, WorkflowStep } from "./WorkflowTypes";

function cloneDefinition(definition: WorkflowDefinition): WorkflowDefinition {
  return {
    ...definition,
    steps: definition.steps.map((step) => ({ ...step, retry: step.retry ? { ...step.retry } : undefined }))
  };
}

function validateSteps(definition: WorkflowDefinition, tools: NyxToolManager): void {
  if (definition.steps.length === 0) {
    throw new Error(`Workflow ${definition.id} must define at least one step`);
  }

  const stepIds = new Set<string>();

  for (const step of definition.steps) {
    if (stepIds.has(step.id)) {
      throw new Error(`Workflow ${definition.id} has duplicate step: ${step.id}`);
    }

    stepIds.add(step.id);

    if (!tools.get(step.toolId)) {
      throw new Error(`Workflow ${definition.id} step ${step.id} requires missing tool: ${step.toolId}`);
    }

    if (step.retry) {
      if (!Number.isInteger(step.retry.maxAttempts) || step.retry.maxAttempts <= 0) {
        throw new Error(`Workflow ${definition.id} step ${step.id} has invalid retry maxAttempts`);
      }

      if (!Number.isInteger(step.retry.backoffMs) || step.retry.backoffMs < 0) {
        throw new Error(`Workflow ${definition.id} step ${step.id} has invalid retry backoffMs`);
      }
    }
  }

  for (const step of definition.steps) {
    if (typeof step.next === "string" && !stepIds.has(step.next)) {
      throw new Error(`Workflow ${definition.id} step ${step.id} points to missing next step: ${step.next}`);
    }
  }
}

export class WorkflowRegistry {
  private readonly definitions = new Map<string, WorkflowDefinition>();

  constructor(private readonly tools: NyxToolManager) {}

  register(definition: WorkflowDefinition): WorkflowDefinition {
    if (this.definitions.has(definition.id)) {
      throw new Error(`Workflow already registered: ${definition.id}`);
    }

    validateSteps(definition, this.tools);
    this.definitions.set(definition.id, cloneDefinition(definition));

    return this.require(definition.id);
  }

  get(id: string): WorkflowDefinition | undefined {
    const definition = this.definitions.get(id);

    return definition ? cloneDefinition(definition) : undefined;
  }

  list(): WorkflowDefinition[] {
    return Array.from(this.definitions.values()).map((definition) => cloneDefinition(definition));
  }

  require(id: string): WorkflowDefinition {
    const definition = this.get(id);

    if (!definition) {
      throw new Error(`Workflow not registered: ${id}`);
    }

    return definition;
  }

  getStep(definition: WorkflowDefinition, stepId: string): WorkflowStep {
    const step = definition.steps.find((candidate) => candidate.id === stepId);

    if (!step) {
      throw new Error(`Workflow ${definition.id} step not found: ${stepId}`);
    }

    return step;
  }
}
