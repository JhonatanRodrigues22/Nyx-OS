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

export type EventHandler = (event: SystemEvent) => void;
export type Unsubscribe = () => void;

export class EventBus {
  private events: SystemEvent[] = [];
  private handlers = new Map<string, Set<EventHandler>>();

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
    this.notify(event);

    return event;
  }

  subscribe(type: string, handler: EventHandler): Unsubscribe {
    const handlers = this.handlers.get(type) ?? new Set<EventHandler>();

    handlers.add(handler);
    this.handlers.set(type, handlers);

    return () => {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  listRecent(limit = 8): SystemEvent[] {
    return this.events.slice(0, limit);
  }

  clear(): void {
    this.events = [];
  }

  private notify(event: SystemEvent): void {
    const handlers = [
      ...Array.from(this.handlers.get(event.type) ?? []),
      ...Array.from(this.handlers.get("*") ?? [])
    ];

    handlers.forEach((handler) => handler(event));
  }
}

export function createEventBus(seedEvents: EmitEventInput[] = []): EventBus {
  const eventBus = new EventBus();

  seedEvents.forEach((event) => eventBus.emit(event));

  return eventBus;
}
