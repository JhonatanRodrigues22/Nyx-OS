import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { AutomationExecution, AutomationSnapshot } from "./AutomationTypes";

export type AutomationEventPayload = {
  automation?: AutomationSnapshot;
  execution?: AutomationExecution;
};

export function emitAutomationEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event: "automation.registered" | "automation.removed" | "automation.enabled" | "automation.disabled",
  input: AutomationEventPayload
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: input.automation?.enabled === false ? "disabled" : "enabled",
      metadata: input
    })
  );
}

export function emitAutomationExecutionEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event: "automation.executed" | "automation.failed",
  execution: AutomationExecution
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: execution.status,
      metadata: {
        execution
      }
    })
  );
}
