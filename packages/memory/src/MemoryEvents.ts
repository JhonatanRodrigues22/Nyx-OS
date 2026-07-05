import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { MemorySearchQuery, NyxMemory } from "./MemoryTypes";

export type MemoryEventName =
  | "memory.created"
  | "memory.updated"
  | "memory.deleted"
  | "memory.loaded"
  | "memory.saved"
  | "memory.search";

export function emitMemoryEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event: MemoryEventName,
  input: {
    memory?: NyxMemory;
    id?: string;
    query?: MemorySearchQuery;
    resultCount?: number;
  } = {}
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: event,
      metadata: {
        memory: input.memory?.id ?? input.id,
        title: input.memory?.title,
        category: input.memory?.category,
        tags: input.memory?.tags,
        query: input.query,
        resultCount: input.resultCount
      }
    })
  );
}
