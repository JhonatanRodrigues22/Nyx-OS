export type ToolCategory =
  | "memory"
  | "system"
  | "diagnostics"
  | "filesystem"
  | "network"
  | "automation"
  | "custom";

export type ToolParameterType = "string" | "number" | "boolean" | "object" | "array";

export type ToolParameterDefinition = {
  type: ToolParameterType;
  required?: boolean;
  description?: string;
};

export type ToolParameters = Record<string, ToolParameterDefinition>;

export type ToolResultDefinition = {
  description?: string;
};

export type ToolMetadata = Record<string, string | number | boolean | null | string[]>;

export type ToolExecutionStatus = "success" | "failed";

export type ToolSnapshot = {
  id: string;
  capabilityId: string;
  name: string;
  description: string;
  version: string;
  category: ToolCategory;
  enabled: boolean;
  parameters: ToolParameters;
  result: ToolResultDefinition;
  metadata: ToolMetadata;
  lastExecutedAt: string | null;
};

export type ToolExecution<TResult = unknown> = {
  toolId: string;
  capabilityId: string;
  status: ToolExecutionStatus;
  result?: TResult;
  error?: string;
  executedAt: string;
};
