export type NyxLogLevel = "trace" | "debug" | "info" | "warn" | "error";

export type NyxLogContext = Record<string, unknown>;

export type NyxLogEntry = {
  level: NyxLogLevel;
  message: string;
  context?: NyxLogContext;
  timestamp: string;
};

export interface NyxLogger {
  trace(message: string, context?: NyxLogContext): void;
  debug(message: string, context?: NyxLogContext): void;
  info(message: string, context?: NyxLogContext): void;
  warn(message: string, context?: NyxLogContext): void;
  error(message: string, context?: NyxLogContext): void;
}

export type ConsoleLoggerSink = Record<NyxLogLevel, (entry: NyxLogEntry) => void>;

const defaultSink: ConsoleLoggerSink = {
  trace: (entry) => console.trace(entry.message, entry.context ?? ""),
  debug: (entry) => console.debug(entry.message, entry.context ?? ""),
  info: (entry) => console.info(entry.message, entry.context ?? ""),
  warn: (entry) => console.warn(entry.message, entry.context ?? ""),
  error: (entry) => console.error(entry.message, entry.context ?? "")
};

export class ConsoleLogger implements NyxLogger {
  constructor(private readonly sink: ConsoleLoggerSink = defaultSink) {}

  trace(message: string, context?: NyxLogContext): void {
    this.write("trace", message, context);
  }

  debug(message: string, context?: NyxLogContext): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: NyxLogContext): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: NyxLogContext): void {
    this.write("warn", message, context);
  }

  error(message: string, context?: NyxLogContext): void {
    this.write("error", message, context);
  }

  private write(level: NyxLogLevel, message: string, context?: NyxLogContext): void {
    this.sink[level]({
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }
}

export function createConsoleLogger(sink?: ConsoleLoggerSink): NyxLogger {
  return new ConsoleLogger(sink);
}
