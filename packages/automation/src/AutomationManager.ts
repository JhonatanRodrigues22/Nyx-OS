import type { NyxEventBus, NyxSystemEventName, NyxSystemEvents, NyxEventUnsubscribe } from "@nyx-os/event-bus";
import type { NyxScheduler, ScheduledTask } from "@nyx-os/scheduler";
import type { NyxToolManager } from "@nyx-os/tools";
import { emitAutomationEvent } from "./AutomationEvents";
import { AutomationExecutor } from "./AutomationExecutor";
import { AutomationRegistry } from "./AutomationRegistry";
import type { Automation, AutomationExecution, AutomationSnapshot, AutomationTriggerSource } from "./AutomationTypes";

export type AutomationManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  scheduler: NyxScheduler;
  tools: NyxToolManager;
  registry?: AutomationRegistry;
  executor?: AutomationExecutor;
};

export interface NyxAutomationManager {
  register(automation: Automation): AutomationSnapshot;
  remove(id: string): AutomationSnapshot;
  get(id: string): Automation | undefined;
  list(): AutomationSnapshot[];
  enable(id: string): AutomationSnapshot;
  disable(id: string): AutomationSnapshot;
  executeEvent(eventName: NyxSystemEventName): Promise<AutomationExecution[]>;
  executeSchedule(schedule: string): Promise<AutomationExecution[]>;
  getHistory(): AutomationExecution[];
}

function parseScheduleInterval(schedule: string): number {
  const interval = Number(schedule);

  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error(`Invalid automation schedule interval: ${schedule}`);
  }

  return interval;
}

export class AutomationManager implements NyxAutomationManager {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly scheduler: NyxScheduler;
  private readonly registry: AutomationRegistry;
  private readonly executor: AutomationExecutor;
  private readonly eventUnsubscribers = new Map<NyxSystemEventName, NyxEventUnsubscribe>();
  private readonly scheduledTaskIds = new Map<string, string>();

  constructor(options: AutomationManagerOptions) {
    this.events = options.events;
    this.scheduler = options.scheduler;
    this.registry = options.registry ?? new AutomationRegistry(options.tools);
    this.executor = options.executor ?? new AutomationExecutor({ events: options.events, tools: options.tools });
  }

  register(automation: Automation): AutomationSnapshot {
    const snapshot = this.registry.register(automation);

    try {
      this.attach(automation);
    } catch (error) {
      this.detach(automation.id);
      this.registry.remove(automation.id);
      throw error;
    }

    emitAutomationEvent(this.events, "automation.registered", { automation: snapshot });

    return snapshot;
  }

  remove(id: string): AutomationSnapshot {
    this.detach(id);
    const snapshot = this.registry.remove(id);

    emitAutomationEvent(this.events, "automation.removed", { automation: snapshot });

    return snapshot;
  }

  get(id: string): Automation | undefined {
    return this.registry.get(id);
  }

  list(): AutomationSnapshot[] {
    return this.registry.list();
  }

  enable(id: string): AutomationSnapshot {
    const snapshot = this.registry.setEnabled(id, true);

    this.attach(this.registry.require(id));
    emitAutomationEvent(this.events, "automation.enabled", { automation: snapshot });

    return snapshot;
  }

  disable(id: string): AutomationSnapshot {
    this.detach(id);
    const snapshot = this.registry.setEnabled(id, false);

    emitAutomationEvent(this.events, "automation.disabled", { automation: snapshot });

    return snapshot;
  }

  async executeEvent(eventName: NyxSystemEventName): Promise<AutomationExecution[]> {
    const executions = this.registry
      .findByEvent(eventName)
      .filter((automation) => automation.enabled)
      .map((automation) =>
        this.executeAutomation(automation, {
          type: "event",
          eventName
        })
      );

    return Promise.all(executions);
  }

  async executeSchedule(schedule: string): Promise<AutomationExecution[]> {
    const executions = this.registry
      .findBySchedule(schedule)
      .filter((automation) => automation.enabled)
      .map((automation) =>
        this.executeAutomation(automation, {
          type: "schedule",
          schedule
        })
      );

    return Promise.all(executions);
  }

  getHistory(): AutomationExecution[] {
    return this.executor.listHistory();
  }

  private attach(automation: Automation): void {
    if (!automation.enabled) {
      return;
    }

    if (automation.trigger.onEvent) {
      this.attachEvent(automation);
    }

    if (automation.trigger.onSchedule) {
      this.attachSchedule(automation);
    }
  }

  private attachEvent(automation: Automation): void {
    if (!automation.trigger.onEvent || this.eventUnsubscribers.has(automation.trigger.onEvent)) {
      return;
    }

    const eventName = automation.trigger.onEvent;
    const unsubscribe = this.events.on(eventName, (event) => {
      if (event.payload?.source === "automation") {
        return;
      }

      void this.executeEvent(eventName).catch(() => undefined);
    });

    this.eventUnsubscribers.set(eventName, unsubscribe);
  }

  private attachSchedule(automation: Automation): void {
    if (this.scheduledTaskIds.has(automation.id) || !automation.trigger.onSchedule) {
      return;
    }

    const schedule = automation.trigger.onSchedule;
    const taskId = `automation.${automation.id}`;
    const task: ScheduledTask = {
      id: taskId,
      name: automation.name,
      interval: parseScheduleInterval(schedule),
      enabled: automation.enabled,
      execute: async () => {
        await this.executeAutomation(automation, {
          type: "schedule",
          schedule
        });
      }
    };

    this.scheduler.register(task);
    this.scheduledTaskIds.set(automation.id, taskId);
  }

  private detach(id: string): void {
    const automation = this.registry.get(id);
    const eventName = automation?.trigger.onEvent;

    if (eventName) {
      const hasOtherAutomation = this.registry
        .findByEvent(eventName)
        .some((candidate) => candidate.id !== id && candidate.enabled);
      const unsubscribe = this.eventUnsubscribers.get(eventName);

      if (unsubscribe && !hasOtherAutomation) {
        unsubscribe();
        this.eventUnsubscribers.delete(eventName);
      }
    }

    const taskId = this.scheduledTaskIds.get(id);

    if (taskId) {
      this.scheduler.unregister(taskId);
      this.scheduledTaskIds.delete(id);
    }
  }

  private async executeAutomation(automation: Automation, trigger: AutomationTriggerSource) {
    const execution = await this.executor.execute(automation, trigger);

    this.registry.recordExecution(execution);
    return execution;
  }
}
