import type { LocalProtocolError, LocalProtocolErrorCode } from "./contracts";

export class LocalGatewayError extends Error {
  readonly code: LocalProtocolErrorCode;
  readonly retryable: boolean;
  readonly details?: Record<string, string | number | boolean | null>;

  constructor(error: LocalProtocolError) {
    super(error.message);
    this.name = "LocalGatewayError";
    this.code = error.code;
    this.retryable = error.retryable;
    this.details = error.details;
  }

  toProtocolError(): LocalProtocolError {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      ...(this.details ? { details: this.details } : {})
    };
  }
}

export function localGatewayError(
  code: LocalProtocolErrorCode,
  message: string,
  retryable: boolean,
  details?: Record<string, string | number | boolean | null>
): LocalGatewayError {
  return new LocalGatewayError({ code, message, retryable, ...(details ? { details } : {}) });
}
