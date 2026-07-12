import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { ToolExecution, ToolSnapshot } from "./ToolTypes";

export type ToolEventName = "tool.registered" | "tool.removed" | "tool.executed" | "tool.failed";

export function emitToolEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event: ToolEventName,
  input: {
    tool?: ToolSnapshot;
    execution?: ToolExecution;
    id?: string;
    capabilityId?: string;
    error?: string;
  }
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: input.execution?.status ?? event,
      metadata: {
        tool: input.tool?.id ?? input.execution?.toolId ?? input.id,
        capability: input.tool?.capabilityId ?? input.execution?.capabilityId ?? input.capabilityId,
        name: input.tool?.name,
        category: input.tool?.category,
        enabled: input.tool?.enabled,
        error: input.execution?.error ?? input.error
      }
    })
  );
}
