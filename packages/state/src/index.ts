export type NyxRuntimeStateStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
export type NyxServiceStateStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
export type NyxServiceHealth = "unknown" | "healthy" | "degraded" | "failed";

export type NyxServiceState = {
  name: string;
  status: NyxServiceStateStatus;
  dependencies: readonly string[];
  startedAt: string | null;
  lastUpdated: string;
  health: NyxServiceHealth;
};

export type NyxRuntimeState = {
  status: NyxRuntimeStateStatus;
  startedAt: string | null;
  stoppedAt: string | null;
  lastUpdated: string;
  uptimeMs: number;
  version: string;
  environment: string;
  services: NyxServiceState[];
};

export type InitializeRuntimeStateInput = {
  status?: NyxRuntimeStateStatus;
  version: string;
  environment: string;
  services?: Array<{
    name: string;
    status: NyxServiceStateStatus;
    dependencies: readonly string[];
  }>;
};

export type RegisterServiceStateInput = {
  name: string;
  status: NyxServiceStateStatus;
  dependencies: readonly string[];
};

export type UpdateServiceStateInput = {
  name: string;
  status: NyxServiceStateStatus;
  dependencies?: readonly string[];
};

export interface NyxStateService {
  initializeRuntime(input: InitializeRuntimeStateInput): void;
  updateRuntimeStatus(status: NyxRuntimeStateStatus): void;
  registerService(input: RegisterServiceStateInput): void;
  updateService(input: UpdateServiceStateInput): void;
  getRuntimeState(): NyxRuntimeState;
  getServices(): NyxServiceState[];
  getService(name: string): NyxServiceState | undefined;
  getUptime(): number;
  getVersion(): string;
  getEnvironment(): string;
}

type Clock = () => Date;

export class InMemoryNyxStateService implements NyxStateService {
  private runtimeState: NyxRuntimeState;
  private readonly services = new Map<string, NyxServiceState>();

  constructor(private readonly now: Clock = () => new Date()) {
    const timestamp = this.timestamp();

    this.runtimeState = {
      status: "created",
      startedAt: null,
      stoppedAt: null,
      lastUpdated: timestamp,
      uptimeMs: 0,
      version: "0.0.0",
      environment: "development",
      services: []
    };
  }

  initializeRuntime(input: InitializeRuntimeStateInput): void {
    const timestamp = this.timestamp();
    this.services.clear();
    input.services?.forEach((service) => this.registerService(service));

    this.runtimeState = {
      status: input.status ?? "created",
      startedAt: null,
      stoppedAt: null,
      lastUpdated: timestamp,
      uptimeMs: 0,
      version: input.version,
      environment: input.environment,
      services: this.getServices()
    };
  }

  updateRuntimeStatus(status: NyxRuntimeStateStatus): void {
    const timestamp = this.timestamp();
    const startedAt =
      status === "running" && !this.runtimeState.startedAt ? timestamp : this.runtimeState.startedAt;
    const stoppedAt = status === "stopped" || status === "failed" ? timestamp : this.runtimeState.stoppedAt;

    this.runtimeState = {
      ...this.runtimeState,
      status,
      startedAt,
      stoppedAt,
      lastUpdated: timestamp,
      uptimeMs: this.calculateUptime(startedAt, status)
    };
  }

  registerService(input: RegisterServiceStateInput): void {
    const timestamp = this.timestamp();
    const existingService = this.services.get(input.name);

    this.services.set(input.name, {
      name: input.name,
      status: input.status,
      dependencies: input.dependencies,
      startedAt: existingService?.startedAt ?? null,
      lastUpdated: timestamp,
      health: this.resolveHealth(input.status)
    });

    this.syncServices();
  }

  updateService(input: UpdateServiceStateInput): void {
    const timestamp = this.timestamp();
    const existingService = this.services.get(input.name);
    const startedAt =
      input.status === "running" && !existingService?.startedAt ? timestamp : (existingService?.startedAt ?? null);

    this.services.set(input.name, {
      name: input.name,
      status: input.status,
      dependencies: input.dependencies ?? existingService?.dependencies ?? [],
      startedAt,
      lastUpdated: timestamp,
      health: this.resolveHealth(input.status)
    });

    this.syncServices();
  }

  getRuntimeState(): NyxRuntimeState {
    return {
      ...this.runtimeState,
      uptimeMs: this.getUptime(),
      services: this.getServices()
    };
  }

  getServices(): NyxServiceState[] {
    return Array.from(this.services.values()).map((service) => ({ ...service }));
  }

  getService(name: string): NyxServiceState | undefined {
    const service = this.services.get(name);

    return service ? { ...service } : undefined;
  }

  getUptime(): number {
    return this.calculateUptime(this.runtimeState.startedAt, this.runtimeState.status);
  }

  getVersion(): string {
    return this.runtimeState.version;
  }

  getEnvironment(): string {
    return this.runtimeState.environment;
  }

  private timestamp(): string {
    return this.now().toISOString();
  }

  private calculateUptime(startedAt: string | null, status: NyxRuntimeStateStatus): number {
    if (!startedAt || status === "created" || status === "starting") {
      return 0;
    }

    const endTime =
      status === "stopped" || status === "failed"
        ? Date.parse(this.runtimeState.stoppedAt ?? this.timestamp())
        : this.now().getTime();

    return Math.max(0, endTime - Date.parse(startedAt));
  }

  private resolveHealth(status: NyxServiceStateStatus): NyxServiceHealth {
    if (status === "running") {
      return "healthy";
    }

    if (status === "failed") {
      return "failed";
    }

    if (status === "starting" || status === "stopping") {
      return "degraded";
    }

    return "unknown";
  }

  private syncServices(): void {
    this.runtimeState = {
      ...this.runtimeState,
      services: this.getServices()
    };
  }
}
