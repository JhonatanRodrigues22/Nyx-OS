import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { CapabilityExecution, CapabilitySnapshot } from "./CapabilityTypes";

export type CapabilityEventName =
  | "capability.registered"
  | "capability.removed"
  | "capability.executed"
  | "capability.failed";

export function emitCapabilityEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event: CapabilityEventName,
  input: {
    capability?: CapabilitySnapshot;
    execution?: CapabilityExecution;
    id?: string;
    error?: string;
  }
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: input.execution?.status ?? event,
      metadata: {
        capability: input.capability?.id ?? input.execution?.capabilityId ?? input.id,
        name: input.capability?.name,
        category: input.capability?.category,
        enabled: input.capability?.enabled,
        error: input.execution?.error ?? input.error
      }
    })
  );
}
