import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { WorkflowInstance, WorkflowStepHistoryEntry } from "./WorkflowTypes";

export type WorkflowEventPayload = {
  instance: WorkflowInstance;
  step?: WorkflowStepHistoryEntry;
};

export function emitWorkflowEvent(
  events: NyxEventBus<NyxSystemEvents>,
  event:
    | "workflow.started"
    | "workflow.step.completed"
    | "workflow.paused"
    | "workflow.resumed"
    | "workflow.failed"
    | "workflow.completed",
  payload: WorkflowEventPayload
): void {
  events.emit(
    event,
    createNyxEventPayload({
      status: payload.instance.status,
      metadata: payload
    })
  );
}
