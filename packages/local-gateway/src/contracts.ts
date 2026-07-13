export const LOCAL_PROTOCOL_VERSION = "1.0" as const;

export type LocalProtocolVersion = typeof LOCAL_PROTOCOL_VERSION;

export type LocalPlatform = "windows" | "macos" | "linux" | "unknown";

export type LocalCapabilityParameterType = "string" | "number" | "boolean" | "object" | "array";

export type LocalCapabilityParameter = {
  type: LocalCapabilityParameterType;
  required?: boolean;
  description?: string;
};

export type LocalCapabilityDescriptor = {
  id: string;
  name: string;
  description: string;
  version: string;
  parameters?: Record<string, LocalCapabilityParameter>;
  resultDescription?: string;
};

export type LocalHandshake = {
  type: "local.handshake";
  protocolVersion: string;
  token: string;
  instanceId: string;
  platform: LocalPlatform;
  version: string;
};

export type LocalCapabilityAnnouncement = {
  type: "local.capabilities.announcement";
  protocolVersion: string;
  instanceId: string;
  capabilities: LocalCapabilityDescriptor[];
};

export type LocalCommandRequest = {
  type: "local.command.request";
  protocolVersion: string;
  requestId: string;
  instanceId: string;
  capabilityId: string;
  input?: unknown;
};

export type LocalCommandResult = {
  type: "local.command.result";
  protocolVersion: string;
  requestId: string;
  instanceId: string;
  capabilityId: string;
  success: boolean;
  result?: unknown;
  error?: LocalProtocolError;
};

export type LocalHeartbeat = {
  type: "local.heartbeat";
  protocolVersion: string;
  instanceId: string;
  sentAt: string;
};

export type LocalHandshakeAccepted = {
  type: "local.handshake.accepted";
  protocolVersion: string;
  instanceId: string;
};

export type LocalProtocolErrorCode =
  | "AUTHENTICATION_FAILED"
  | "INCOMPATIBLE_PROTOCOL_VERSION"
  | "HANDSHAKE_REQUIRED"
  | "INVALID_MESSAGE"
  | "PAYLOAD_TOO_LARGE"
  | "CAPABILITY_NOT_ALLOWED"
  | "INSTANCE_NOT_CONNECTED"
  | "COMMAND_TIMEOUT"
  | "CONNECTION_CLOSED"
  | "GATEWAY_STOPPED"
  | "REMOTE_COMMAND_FAILED";

export type LocalProtocolError = {
  code: LocalProtocolErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, string | number | boolean | null>;
};

export type LocalErrorEnvelope = {
  type: "local.error";
  protocolVersion: string;
  requestId?: string;
  error: LocalProtocolError;
};

export type LocalClientMessage =
  | LocalHandshake
  | LocalCapabilityAnnouncement
  | LocalCommandResult
  | LocalHeartbeat;

export type LocalServerMessage = LocalHandshakeAccepted | LocalCommandRequest | LocalErrorEnvelope;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasProtocolEnvelope(value: unknown): value is { type: string; protocolVersion: string } {
  return isRecord(value) && typeof value.type === "string" && typeof value.protocolVersion === "string";
}

export function isLocalHandshake(value: unknown): value is LocalHandshake {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.handshake" &&
    typeof value.token === "string" &&
    typeof value.instanceId === "string" &&
    typeof value.platform === "string" &&
    typeof value.version === "string"
  );
}

export function isLocalCapabilityAnnouncement(value: unknown): value is LocalCapabilityAnnouncement {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.capabilities.announcement" &&
    typeof value.instanceId === "string" &&
    Array.isArray(value.capabilities)
  );
}

export function isLocalCommandResult(value: unknown): value is LocalCommandResult {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.command.result" &&
    typeof value.requestId === "string" &&
    typeof value.instanceId === "string" &&
    typeof value.capabilityId === "string" &&
    typeof value.success === "boolean"
  );
}

export function isLocalHeartbeat(value: unknown): value is LocalHeartbeat {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.heartbeat" &&
    typeof value.instanceId === "string" &&
    typeof value.sentAt === "string"
  );
}
