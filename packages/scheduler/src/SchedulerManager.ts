import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger, type NyxLogger } from "@nyx-os/logger";
import type {
  NyxScheduler,
  ScheduledTask,
  ScheduledTaskSnapshot,
  ScheduledTaskStatus,
  SchedulerContext,
  SchedulerStatus,
  SchedulerTaskRecord
} from "./types";

export type SchedulerManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  logger?: NyxLogger;
};

export class SchedulerManager implements NyxScheduler {
  private readonly tasks = new Map<string, SchedulerTaskRecord>();
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly logger: NyxLogger;
  private status: SchedulerStatus = "idle";

  constructor(options: SchedulerManagerOptions) {
    this.events = options.events;
    this.logger = options.logger ?? createConsoleLogger();
  }

  register(task: ScheduledTask): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Scheduled task already registered: ${task.id}`);
    }

    const snapshot = this.createSnapshot(task, task.enabled ? "registered" : "disabled");

    this.tasks.set(task.id, {
      task,
      snapshot,
      timer: null
    });
    this.emitTaskEvent("scheduler.task.registered", snapshot);

    if (this.status === "running" && task.enabled) {
      this.schedule(task.id);
    }
  }

  unregister(id: string): void {
    const record = this.requireTask(id);

    this.clearTimer(record);
    this.tasks.delete(id);
    this.emitTaskEvent("scheduler.task.removed", record.snapshot);
  }

  start(): void {
    if (this.status === "running") {
      return;
    }

    this.status = "running";
    this.tasks.forEach((record) => {
      if (record.task.enabled) {
        this.schedule(record.task.id);
      }
    });
    this.events.emit(
      "scheduler.started",
      createNyxEventPayload({
        status: this.status,
        metadata: {
          tasks: this.tasks.size
        }
      })
    );
  }

  stop(): void {
    if (this.status === "stopped" || this.status === "idle") {
      this.status = "stopped";
      return;
    }

    this.tasks.forEach((record) => {
      this.clearTimer(record);
      this.updateTaskStatus(record, record.task.enabled ? "registered" : "disabled");
    });
    this.status = "stopped";
    this.events.emit(
      "scheduler.stopped",
      createNyxEventPayload({
        status: this.status,
        metadata: {
          tasks: this.tasks.size
        }
      })
    );
  }

  pause(): void {
    if (this.status !== "running") {
      return;
    }

    this.tasks.forEach((record) => {
      this.clearTimer(record);
      this.updateTaskStatus(record, record.task.enabled ? "paused" : "disabled");
    });
    this.status = "paused";
  }

  resume(): void {
    if (this.status !== "paused") {
      return;
    }

    this.status = "running";
    this.tasks.forEach((record) => {
      if (record.task.enabled) {
        this.schedule(record.task.id);
      }
    });
  }

  getTasks(): ScheduledTaskSnapshot[] {
    return Array.from(this.tasks.values()).map((record) => ({ ...record.snapshot }));
  }

  getStatus(): SchedulerStatus {
    return this.status;
  }

  private schedule(id: string): void {
    const record = this.requireTask(id);

    this.clearTimer(record);
    this.updateTaskStatus(record, "scheduled");
    record.timer = setInterval(() => {
      void this.executeTask(id);
    }, record.task.interval);
  }

  private async executeTask(id: string): Promise<void> {
    const record = this.tasks.get(id);

    if (!record || this.status !== "running" || !record.task.enabled) {
      return;
    }

    this.updateTaskStatus(record, "executing");

    try {
      await record.task.execute(this.createContext());
      record.snapshot = {
        ...record.snapshot,
        status: "scheduled",
        lastRunAt: new Date().toISOString(),
        lastError: null
      };
      this.emitTaskEvent("scheduler.task.executed", record.snapshot);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown scheduler task failure";

      record.snapshot = {
        ...record.snapshot,
        status: "failed",
        lastRunAt: new Date().toISOString(),
        lastError: message
      };
      this.logger.error("Scheduled task failed", {
        task: record.task.id,
        error: message
      });
      this.emitTaskEvent("scheduler.task.failed", record.snapshot);
    }
  }

  private createContext(): SchedulerContext {
    return {
      events: this.events,
      logger: this.logger,
      scheduler: this
    };
  }

  private requireTask(id: string): SchedulerTaskRecord {
    const record = this.tasks.get(id);

    if (!record) {
      throw new Error(`Scheduled task not registered: ${id}`);
    }

    return record;
  }

  private clearTimer(record: SchedulerTaskRecord): void {
    if (record.timer) {
      clearInterval(record.timer);
      record.timer = null;
    }
  }

  private createSnapshot(task: ScheduledTask, status: ScheduledTaskStatus): ScheduledTaskSnapshot {
    return {
      id: task.id,
      name: task.name,
      interval: task.interval,
      enabled: task.enabled,
      status,
      lastRunAt: null,
      lastError: null
    };
  }

  private updateTaskStatus(record: SchedulerTaskRecord, status: ScheduledTaskStatus): void {
    record.snapshot = {
      ...record.snapshot,
      status
    };
  }

  private emitTaskEvent(
    event:
      | "scheduler.task.registered"
      | "scheduler.task.executed"
      | "scheduler.task.failed"
      | "scheduler.task.removed",
    snapshot: ScheduledTaskSnapshot
  ): void {
    this.events.emit(
      event,
      createNyxEventPayload({
        task: snapshot.id,
        status: snapshot.status,
        metadata: {
          name: snapshot.name,
          interval: snapshot.interval,
          enabled: snapshot.enabled,
          lastError: snapshot.lastError
        }
      })
    );
  }
}
