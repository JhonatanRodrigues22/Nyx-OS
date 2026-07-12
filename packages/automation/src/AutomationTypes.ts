import type { NyxSystemEventName } from "@nyx-os/event-bus";
import type { ToolExecution } from "@nyx-os/tools";

export type AutomationTrigger =
  | {
      onEvent: NyxSystemEventName;
      onSchedule?: never;
    }
  | {
      onEvent?: never;
      onSchedule: string;
    };

export type AutomationAction<TInput = unknown> = {
  toolId: string;
  input?: TInput;
};

export type Automation<TInput = unknown> = {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction<TInput>;
  enabled: boolean;
};

export type AutomationTriggerSource =
  | {
      type: "event";
      eventName: NyxSystemEventName;
    }
  | {
      type: "schedule";
      schedule: string;
    };

export type AutomationExecutionStatus = "success" | "failed";

export type AutomationExecution<TResult = unknown> = {
  automationId: string;
  toolId: string;
  trigger: AutomationTriggerSource;
  status: AutomationExecutionStatus;
  toolExecution?: ToolExecution<TResult>;
  error?: string;
  executedAt: string;
};

export type AutomationSnapshot = {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled: boolean;
  lastExecutedAt: string | null;
};
