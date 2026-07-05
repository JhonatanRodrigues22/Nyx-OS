import type { NyxEvent, NyxEventBus, NyxEventMap, NyxEventName } from "./types";

export class EventEmitter<TEvents extends NyxEventMap = Record<string, unknown>> {
  constructor(private readonly eventBus: NyxEventBus<TEvents>) {}

  protected emit<TName extends NyxEventName<TEvents>>(
    event: TName,
    payload: TEvents[TName]
  ): NyxEvent<TEvents[TName], TName> {
    return this.eventBus.emit(event, payload);
  }
}
