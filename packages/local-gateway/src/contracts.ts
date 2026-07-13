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

const LOCAL_PROTOCOL_ERROR_CODES: ReadonlySet<string> = new Set([
  "AUTHENTICATION_FAILED",
  "INCOMPATIBLE_PROTOCOL_VERSION",
  "HANDSHAKE_REQUIRED",
  "INVALID_MESSAGE",
  "PAYLOAD_TOO_LARGE",
  "CAPABILITY_NOT_ALLOWED",
  "INSTANCE_NOT_CONNECTED",
  "COMMAND_TIMEOUT",
  "CONNECTION_CLOSED",
  "GATEWAY_STOPPED",
  "REMOTE_COMMAND_FAILED"
]);

const LOCAL_PLATFORMS: ReadonlySet<string> = new Set(["windows", "macos", "linux", "unknown"]);
const LOCAL_PARAMETER_TYPES: ReadonlySet<string> = new Set(["string", "number", "boolean", "object", "array"]);

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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isProtocolDetail(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function hasProtocolEnvelope(
  value: unknown
): value is Record<string, unknown> & { type: string; protocolVersion: string } {
  return isRecord(value) && typeof value.type === "string" && typeof value.protocolVersion === "string";
}

export function isLocalHandshake(value: unknown): value is LocalHandshake {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.handshake" &&
    isNonEmptyString(value.token) &&
    isNonEmptyString(value.instanceId) &&
    isNonEmptyString(value.platform) &&
    LOCAL_PLATFORMS.has(value.platform) &&
    isNonEmptyString(value.version)
  );
}

export function isLocalCapabilityAnnouncement(value: unknown): value is LocalCapabilityAnnouncement {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.capabilities.announcement" &&
    isNonEmptyString(value.instanceId) &&
    Array.isArray(value.capabilities)
  );
}

export function isLocalCapabilityParameter(value: unknown): value is LocalCapabilityParameter {
  return (
    isRecord(value) &&
    isNonEmptyString(value.type) &&
    LOCAL_PARAMETER_TYPES.has(value.type) &&
    (value.required === undefined || typeof value.required === "boolean") &&
    (value.description === undefined || typeof value.description === "string")
  );
}

export function isLocalCapabilityDescriptor(value: unknown): value is LocalCapabilityDescriptor {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.version) &&
    (value.parameters === undefined ||
      (isRecord(value.parameters) &&
        Object.entries(value.parameters).every(
          ([name, parameter]) => isNonEmptyString(name) && isLocalCapabilityParameter(parameter)
        ))) &&
    (value.resultDescription === undefined || typeof value.resultDescription === "string")
  );
}

export function isLocalProtocolError(value: unknown): value is LocalProtocolError {
  return (
    isRecord(value) &&
    isNonEmptyString(value.code) &&
    LOCAL_PROTOCOL_ERROR_CODES.has(value.code) &&
    isNonEmptyString(value.message) &&
    typeof value.retryable === "boolean" &&
    (value.details === undefined ||
      (isRecord(value.details) && Object.values(value.details).every(isProtocolDetail)))
  );
}

export function isLocalCommandResult(value: unknown): value is LocalCommandResult {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.command.result" &&
    isNonEmptyString(value.requestId) &&
    isNonEmptyString(value.instanceId) &&
    isNonEmptyString(value.capabilityId) &&
    typeof value.success === "boolean" &&
    (value.success
      ? value.error === undefined
      : value.result === undefined && isLocalProtocolError(value.error))
  );
}

export function isLocalHeartbeat(value: unknown): value is LocalHeartbeat {
  return (
    hasProtocolEnvelope(value) &&
    value.type === "local.heartbeat" &&
    isNonEmptyString(value.instanceId) &&
    isNonEmptyString(value.sentAt) &&
    !Number.isNaN(Date.parse(value.sentAt))
  );
}
