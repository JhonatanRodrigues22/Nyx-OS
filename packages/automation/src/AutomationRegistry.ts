import type { NyxToolManager } from "@nyx-os/tools";
import type { Automation, AutomationExecution, AutomationSnapshot } from "./AutomationTypes";

function toSnapshot(automation: Automation, lastExecution: AutomationExecution | null): AutomationSnapshot {
  return {
    id: automation.id,
    name: automation.name,
    trigger: { ...automation.trigger },
    action: { ...automation.action },
    enabled: automation.enabled,
    lastExecutedAt: lastExecution?.executedAt ?? null
  };
}

function validateTrigger(automation: Automation): void {
  const hasEvent = Boolean(automation.trigger.onEvent);
  const hasSchedule = Boolean(automation.trigger.onSchedule);

  if (hasEvent === hasSchedule) {
    throw new Error(`Automation ${automation.id} must define exactly one trigger`);
  }
}

export class AutomationRegistry {
  private readonly automations = new Map<string, Automation>();
  private readonly executions = new Map<string, AutomationExecution>();

  constructor(private readonly tools: NyxToolManager) {}

  register(automation: Automation): AutomationSnapshot {
    if (this.automations.has(automation.id)) {
      throw new Error(`Automation already registered: ${automation.id}`);
    }

    validateTrigger(automation);

    if (!this.tools.get(automation.action.toolId)) {
      throw new Error(`Automation ${automation.id} requires missing tool: ${automation.action.toolId}`);
    }

    this.automations.set(automation.id, automation);

    return this.snapshot(automation);
  }

  remove(id: string): AutomationSnapshot {
    const automation = this.require(id);
    const snapshot = this.snapshot(automation);

    this.automations.delete(id);
    this.executions.delete(id);

    return snapshot;
  }

  get(id: string): Automation | undefined {
    return this.automations.get(id);
  }

  list(): AutomationSnapshot[] {
    return Array.from(this.automations.values()).map((automation) => this.snapshot(automation));
  }

  findByEvent(eventName: string): Automation[] {
    return Array.from(this.automations.values()).filter((automation) => automation.trigger.onEvent === eventName);
  }

  findBySchedule(schedule: string): Automation[] {
    return Array.from(this.automations.values()).filter((automation) => automation.trigger.onSchedule === schedule);
  }

  setEnabled(id: string, enabled: boolean): AutomationSnapshot {
    const automation = this.require(id);

    this.automations.set(id, {
      ...automation,
      enabled
    });

    return this.snapshot(this.require(id));
  }

  recordExecution(execution: AutomationExecution): AutomationSnapshot {
    this.executions.set(execution.automationId, execution);

    return this.snapshot(this.require(execution.automationId));
  }

  require(id: string): Automation {
    const automation = this.automations.get(id);

    if (!automation) {
      throw new Error(`Automation not registered: ${id}`);
    }

    return automation;
  }

  private snapshot(automation: Automation): AutomationSnapshot {
    return toSnapshot(automation, this.executions.get(automation.id) ?? null);
  }
}
