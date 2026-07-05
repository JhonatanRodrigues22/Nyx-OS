import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxLogger } from "@nyx-os/logger";

export type MaybePromise<T> = T | Promise<T>;

export type SchedulerStatus = "idle" | "running" | "paused" | "stopped";

export type ScheduledTaskStatus = "registered" | "scheduled" | "paused" | "executing" | "failed" | "disabled";

export type SchedulerContext = {
  events: NyxEventBus<NyxSystemEvents>;
  logger: NyxLogger;
  scheduler: NyxScheduler;
};

export interface ScheduledTask {
  readonly id: string;
  readonly name: string;
  readonly interval: number;
  readonly enabled: boolean;
  execute(context: SchedulerContext): MaybePromise<void>;
}

export type ScheduledTaskSnapshot = {
  id: string;
  name: string;
  interval: number;
  enabled: boolean;
  status: ScheduledTaskStatus;
  lastRunAt: string | null;
  lastError: string | null;
};

export interface NyxScheduler {
  register(task: ScheduledTask): void;
  unregister(id: string): void;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  getTasks(): ScheduledTaskSnapshot[];
  getStatus(): SchedulerStatus;
}

export type SchedulerTaskRecord = {
  task: ScheduledTask;
  snapshot: ScheduledTaskSnapshot;
  timer: ReturnType<typeof setInterval> | null;
};
