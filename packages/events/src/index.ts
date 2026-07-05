export type SystemEventLevel = "info" | "warning" | "error";

export type SystemEvent = {
  id: string;
  type: string;
  message: string;
  level: SystemEventLevel;
  timestamp: string;
  source: string;
};

export type EmitEventInput = {
  type: string;
  message: string;
  level?: SystemEventLevel;
  source?: string;
};

export class EventBus {
  private events: SystemEvent[] = [];

  emit(input: EmitEventInput): SystemEvent {
    const event: SystemEvent = {
      id: `evt_${this.events.length + 1}`,
      type: input.type,
      message: input.message,
      level: input.level ?? "info",
      source: input.source ?? "system",
      timestamp: new Date().toISOString()
    };

    this.events = [event, ...this.events].slice(0, 20);

    return event;
  }

  listRecent(limit = 8): SystemEvent[] {
    return this.events.slice(0, limit);
  }

  clear(): void {
    this.events = [];
  }
}

export function createEventBus(seedEvents: EmitEventInput[] = []): EventBus {
  const eventBus = new EventBus();

  seedEvents.forEach((event) => eventBus.emit(event));

  return eventBus;
}
