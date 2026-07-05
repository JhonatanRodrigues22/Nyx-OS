import type {
  NyxEvent,
  NyxEventBus,
  NyxEventListener,
  NyxEventMap,
  NyxEventName,
  NyxEventUnsubscribe
} from "./types";

export class InMemoryEventBus<TEvents extends NyxEventMap = Record<string, unknown>> implements NyxEventBus<TEvents> {
  private readonly listeners = new Map<string, Set<NyxEventListener<unknown>>>();

  on<TName extends NyxEventName<TEvents>>(
    event: TName,
    listener: NyxEventListener<TEvents[TName], TName>
  ): NyxEventUnsubscribe {
    const listeners = this.listeners.get(event) ?? new Set<NyxEventListener<unknown>>();

    listeners.add(listener as NyxEventListener<unknown>);
    this.listeners.set(event, listeners);

    return () => this.off(event, listener);
  }

  once<TName extends NyxEventName<TEvents>>(
    event: TName,
    listener: NyxEventListener<TEvents[TName], TName>
  ): NyxEventUnsubscribe {
    const wrappedListener: NyxEventListener<TEvents[TName], TName> = (nyxEvent) => {
      this.off(event, wrappedListener);
      listener(nyxEvent);
    };

    return this.on(event, wrappedListener);
  }

  off<TName extends NyxEventName<TEvents>>(event: TName, listener: NyxEventListener<TEvents[TName], TName>): void {
    const listeners = this.listeners.get(event);

    if (!listeners) {
      return;
    }

    listeners.delete(listener as NyxEventListener<unknown>);

    if (listeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<TName extends NyxEventName<TEvents>>(event: TName, payload?: TEvents[TName]): NyxEvent<TEvents[TName], TName> {
    const nyxEvent: NyxEvent<TEvents[TName], TName> = {
      name: event,
      payload,
      timestamp: new Date().toISOString()
    };

    const listeners = Array.from(this.listeners.get(event) ?? []);

    listeners.forEach((listener) => listener(nyxEvent));

    return nyxEvent;
  }

  removeAllListeners<TName extends NyxEventName<TEvents>>(event?: TName): void {
    if (event) {
      this.listeners.delete(event);
      return;
    }

    this.listeners.clear();
  }
}

export function createInMemoryEventBus<TEvents extends NyxEventMap = Record<string, unknown>>(): NyxEventBus<TEvents> {
  return new InMemoryEventBus<TEvents>();
}
