export type NyxEventMap = object;

export type NyxEventName<TEvents extends NyxEventMap> = Extract<keyof TEvents, string>;

export type NyxEventPayload = {
  timestamp: string;
  service?: string;
  plugin?: string;
  task?: string;
  status?: string;
  metadata?: Record<string, unknown>;
};

export type NyxEvent<TPayload = unknown, TName extends string = string> = {
  name: TName;
  payload?: TPayload;
  timestamp: string;
};

export type NyxEventListener<TPayload = unknown, TName extends string = string> = (event: NyxEvent<TPayload, TName>) => void;

export type NyxEventUnsubscribe = () => void;

export interface NyxEventBus<TEvents extends NyxEventMap = Record<string, NyxEventPayload>> {
  on<TName extends NyxEventName<TEvents>>(
    event: TName,
    listener: NyxEventListener<TEvents[TName], TName>
  ): NyxEventUnsubscribe;
  once<TName extends NyxEventName<TEvents>>(
    event: TName,
    listener: NyxEventListener<TEvents[TName], TName>
  ): NyxEventUnsubscribe;
  off<TName extends NyxEventName<TEvents>>(event: TName, listener: NyxEventListener<TEvents[TName], TName>): void;
  emit<TName extends NyxEventName<TEvents>>(event: TName, payload?: TEvents[TName]): NyxEvent<TEvents[TName], TName>;
  removeAllListeners<TName extends NyxEventName<TEvents>>(event?: TName): void;
}

export type NyxRuntimeEventName = "runtime.started" | "runtime.stopped" | "runtime.failed";

export type NyxServiceEventName =
  | "service.registered"
  | "service.started"
  | "service.stopped"
  | "service.failed";

export type NyxPluginEventName =
  | "plugin.registered"
  | "plugin.initialized"
  | "plugin.disposed"
  | "plugin.unregistered"
  | "plugin.failed";

export type NyxSchedulerEventName =
  | "scheduler.started"
  | "scheduler.stopped"
  | "scheduler.task.registered"
  | "scheduler.task.executed"
  | "scheduler.task.failed"
  | "scheduler.task.removed";

export type NyxMemoryEventName =
  | "memory.created"
  | "memory.updated"
  | "memory.deleted"
  | "memory.loaded"
  | "memory.saved"
  | "memory.search";

export type NyxCapabilityEventName =
  | "capability.registered"
  | "capability.removed"
  | "capability.executed"
  | "capability.failed";

export type NyxSystemEventName =
  | NyxRuntimeEventName
  | NyxServiceEventName
  | NyxPluginEventName
  | NyxSchedulerEventName
  | NyxMemoryEventName
  | NyxCapabilityEventName;

export type NyxSystemEvents = Record<NyxSystemEventName, NyxEventPayload>;

export function createNyxEventPayload(input: Omit<NyxEventPayload, "timestamp"> & { timestamp?: string } = {}) {
  return {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString()
  };
}
