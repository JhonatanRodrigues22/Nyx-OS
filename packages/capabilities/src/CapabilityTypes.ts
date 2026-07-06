export type CapabilityCategory =
  | "system"
  | "memory"
  | "diagnostics"
  | "filesystem"
  | "network"
  | "automation"
  | "custom";

export type CapabilityMetadata = Record<string, string | number | boolean | null | string[]>;

export type CapabilityExecutionStatus = "success" | "failed";

export type CapabilitySnapshot = {
  id: string;
  name: string;
  description: string;
  version: string;
  category: CapabilityCategory;
  tags: string[];
  enabled: boolean;
  metadata: CapabilityMetadata;
};

export type CapabilityExecution<TResult = unknown> = {
  capabilityId: string;
  status: CapabilityExecutionStatus;
  result?: TResult;
  error?: string;
  executedAt: string;
};
