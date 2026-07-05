import type { NyxConfig, NyxConfigEnvironment, NyxModuleId } from "@nyx-os/config";
import { getNyxConfig } from "@nyx-os/config";
import type { SystemEvent } from "@nyx-os/events";
import { createEventBus, type EventBus } from "@nyx-os/events";

type MaybePromise<T> = T | Promise<T>;

export type RuntimeStatus = "ready" | "starting" | "degraded";
export type ModuleStatus = "ready" | "planned" | "offline";
export type ServiceStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
export type NyxRuntimeStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";

export type NyxServiceContext = {
  eventBus: EventBus;
  emit: (input: Omit<Parameters<EventBus["emit"]>[0], "source"> & { source?: string }) => SystemEvent;
};

export interface NyxService {
  readonly name: string;
  readonly dependencies: readonly string[];
  status: ServiceStatus;
  setup(context: NyxServiceContext): MaybePromise<void>;
  start(): MaybePromise<void>;
  stop(): MaybePromise<void>;
}

export type RuntimeServiceSnapshot = {
  name: string;
  status: ServiceStatus;
  dependencies: readonly string[];
};

export type NyxRuntimeSnapshot = {
  status: NyxRuntimeStatus;
  services: RuntimeServiceSnapshot[];
  events: SystemEvent[];
};

export type ConfigServiceSnapshot = Pick<NyxConfig, "appName" | "version" | "environment" | "enabledModules" | "featureFlags">;

export type ConfigServiceOptions = {
  env?: NyxConfigEnvironment;
  loadConfig?: (env?: NyxConfigEnvironment) => NyxConfig;
};

export type RuntimeState = {
  name: string;
  status: RuntimeStatus;
  environment: string;
  version: string;
  modules: Array<{
    id: NyxModuleId;
    label: string;
    status: ModuleStatus;
    description: string;
  }>;
};

export type SystemStatus = {
  headline: string;
  detail: string;
  health: "online" | "attention" | "offline";
};

export type NavigationItem = {
  label: string;
  area: string;
  status: "active" | "planned";
};

export type DashboardCard = {
  title: string;
  value: string;
  description: string;
  status: "ready" | "planned" | "mocked";
};

export type DashboardSnapshot = {
  runtime: RuntimeState;
  systemStatus: SystemStatus;
  navigation: NavigationItem[];
  cards: DashboardCard[];
  recentEvents: SystemEvent[];
};

export class BaseNyxService implements NyxService {
  status: ServiceStatus = "created";

  constructor(
    readonly name: string,
    readonly dependencies: readonly string[] = []
  ) {}

  setup(context: NyxServiceContext): MaybePromise<void> {
    void context;
  }

  start(): MaybePromise<void> {
    this.status = "running";
  }

  stop(): MaybePromise<void> {
    this.status = "stopped";
  }
}

export class ConfigService extends BaseNyxService {
  private config: NyxConfig | null = null;
  private readonly loadConfig: (env?: NyxConfigEnvironment) => NyxConfig;
  private readonly env: NyxConfigEnvironment | undefined;

  constructor(options: ConfigServiceOptions = {}) {
    super("config");
    this.env = options.env;
    this.loadConfig = options.loadConfig ?? getNyxConfig;
  }

  start(): MaybePromise<void> {
    this.config = this.loadConfig(this.env);
    return super.start();
  }

  stop(): MaybePromise<void> {
    return super.stop();
  }

  getConfig(): NyxConfig {
    if (!this.config) {
      this.config = this.loadConfig(this.env);
    }

    return this.config;
  }

  getSnapshot(): ConfigServiceSnapshot {
    const config = this.getConfig();

    return {
      appName: config.appName,
      version: config.version,
      environment: config.environment,
      enabledModules: config.enabledModules,
      featureFlags: config.featureFlags
    };
  }
}

export class ServiceManager {
  private readonly services = new Map<string, NyxService>();
  private startOrder: string[] = [];

  register(service: NyxService): void {
    if (this.services.has(service.name)) {
      throw new Error(`Service already registered: ${service.name}`);
    }

    this.services.set(service.name, service);
  }

  list(): RuntimeServiceSnapshot[] {
    return Array.from(this.services.values()).map((service) => ({
      name: service.name,
      status: service.status,
      dependencies: service.dependencies
    }));
  }

  async setupAll(context: NyxServiceContext): Promise<void> {
    for (const service of Array.from(this.services.values())) {
      await service.setup(context);
    }
  }

  async startAll(): Promise<void> {
    const started = new Set<string>();
    this.startOrder = [];

    while (started.size < this.services.size) {
      let progressed = false;

      for (const [name, service] of Array.from(this.services.entries())) {
        if (started.has(name)) {
          continue;
        }

        const missingDependencies = service.dependencies.filter((dependency) => !this.services.has(dependency));

        if (missingDependencies.length > 0) {
          throw new Error(`Service ${name} has missing dependencies: ${missingDependencies.join(", ")}`);
        }

        if (service.dependencies.every((dependency) => started.has(dependency))) {
          await this.startOne(service);
          started.add(name);
          this.startOrder.push(name);
          progressed = true;
        }
      }

      if (!progressed) {
        const unresolved = Array.from(this.services.keys()).filter((name) => !started.has(name));
        throw new Error(`Circular service dependencies detected: ${unresolved.join(", ")}`);
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const name of [...this.startOrder].reverse()) {
      const service = this.services.get(name);

      if (service) {
        await this.stopOne(service);
      }
    }

    this.startOrder = [];
  }

  private async startOne(service: NyxService): Promise<void> {
    try {
      service.status = "starting";
      await service.start();
      service.status = "running";
    } catch (error) {
      service.status = "failed";
      throw error;
    }
  }

  private async stopOne(service: NyxService): Promise<void> {
    if (service.status !== "running" && service.status !== "failed") {
      return;
    }

    try {
      service.status = "stopping";
      await service.stop();
      service.status = "stopped";
    } catch (error) {
      service.status = "failed";
      throw error;
    }
  }
}

export class NyxRuntime {
  private status: NyxRuntimeStatus = "created";
  readonly configService: ConfigService | null;

  constructor(
    readonly eventBus: EventBus = createEventBus(),
    readonly serviceManager: ServiceManager = new ServiceManager(),
    options: { registerBaseServices?: boolean; configService?: ConfigService } = {}
  ) {
    this.configService =
      options.registerBaseServices === false ? null : (options.configService ?? new ConfigService());

    if (this.configService) {
      this.registerService(this.configService);
    }
  }

  registerService(service: NyxService): void {
    this.serviceManager.register(service);
  }

  async start(): Promise<void> {
    if (this.status === "running" || this.status === "starting") {
      return;
    }

    this.status = "starting";
    this.eventBus.emit({
      type: "runtime.starting",
      message: "Nyx runtime is starting.",
      source: "runtime"
    });

    try {
      await this.serviceManager.setupAll(this.createServiceContext());
      await this.serviceManager.startAll();
      this.status = "running";
      this.eventBus.emit({
        type: "runtime.started",
        message: "Nyx runtime started.",
        source: "runtime"
      });
    } catch (error) {
      this.status = "failed";
      this.eventBus.emit({
        type: "runtime.failed",
        message: error instanceof Error ? error.message : "Nyx runtime failed.",
        level: "error",
        source: "runtime"
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.status === "stopped" || this.status === "created") {
      this.status = "stopped";
      return;
    }

    this.status = "stopping";
    this.eventBus.emit({
      type: "runtime.stopping",
      message: "Nyx runtime is stopping.",
      source: "runtime"
    });

    await this.serviceManager.stopAll();
    this.status = "stopped";
    this.eventBus.emit({
      type: "runtime.stopped",
      message: "Nyx runtime stopped.",
      source: "runtime"
    });
  }

  getSnapshot(): NyxRuntimeSnapshot {
    return {
      status: this.status,
      services: this.serviceManager.list(),
      events: this.eventBus.listRecent()
    };
  }

  private createServiceContext(): NyxServiceContext {
    return {
      eventBus: this.eventBus,
      emit: (input) =>
        this.eventBus.emit({
          ...input,
          source: input.source ?? "service"
        })
    };
  }
}

const plannedModules: RuntimeState["modules"] = [
  {
    id: "core",
    label: "Core",
    status: "ready",
    description: "Runtime base and service boundaries."
  },
  {
    id: "events",
    label: "Events",
    status: "ready",
    description: "In-memory system event stream."
  },
  {
    id: "dashboard",
    label: "Dashboard",
    status: "ready",
    description: "Visible cockpit for system state."
  },
  {
    id: "memory",
    label: "Memory",
    status: "planned",
    description: "Persistent context layer."
  },
  {
    id: "automation",
    label: "Automation",
    status: "planned",
    description: "Auditable automation engine."
  },
  {
    id: "ai",
    label: "AI",
    status: "planned",
    description: "Assistant contracts and interpretation layer."
  }
];

export class RuntimeService {
  constructor(private readonly config: NyxConfig) {}

  getState(): RuntimeState {
    return {
      name: this.config.appName,
      status: "ready",
      environment: this.config.environment,
      version: this.config.version,
      modules: plannedModules.map((module) => ({
        ...module,
        status: this.config.enabledModules.includes(module.id) ? "ready" : module.status
      }))
    };
  }
}

export class SystemStatusService {
  getStatus(runtime: RuntimeState): SystemStatus {
    const readyModules = runtime.modules.filter((module) => module.status === "ready").length;

    return {
      headline: "Runtime Ready",
      detail: `${readyModules} core modules online. Mock providers active.`,
      health: "online"
    };
  }
}

export class EventService {
  constructor(private readonly eventBus: EventBus) {}

  startRuntime(): void {
    this.eventBus.emit({
      type: "runtime.started",
      message: "Nyx runtime initialized.",
      source: "runtime"
    });
    this.eventBus.emit({
      type: "module.ready",
      message: "Core, events and dashboard modules are ready.",
      source: "runtime"
    });
    this.eventBus.emit({
      type: "dashboard.loaded",
      message: "Dashboard snapshot prepared from mock services.",
      source: "dashboard"
    });
  }

  listRecent(): SystemEvent[] {
    return this.eventBus.listRecent();
  }
}

export class DashboardService {
  constructor(
    private readonly runtimeService: RuntimeService,
    private readonly systemStatusService: SystemStatusService,
    private readonly eventService: EventService
  ) {}

  getSnapshot(): DashboardSnapshot {
    const runtime = this.runtimeService.getState();

    return {
      runtime,
      systemStatus: this.systemStatusService.getStatus(runtime),
      navigation: [
        { label: "Home", area: "home", status: "active" },
        { label: "Projetos", area: "projects", status: "planned" },
        { label: "Memória", area: "memory", status: "planned" },
        { label: "Agenda", area: "calendar", status: "planned" },
        { label: "Automações", area: "automation", status: "planned" },
        { label: "IA", area: "ai", status: "planned" },
        { label: "Sistema", area: "system", status: "planned" },
        { label: "Configurações", area: "settings", status: "planned" }
      ],
      cards: [
        {
          title: "Runtime",
          value: "Ready",
          description: "Core services are available for the dashboard.",
          status: "ready"
        },
        {
          title: "Providers",
          value: "Mocked",
          description: "No real database or integrations are connected.",
          status: "mocked"
        },
        {
          title: "Modules",
          value: `${runtime.modules.filter((module) => module.status === "ready").length}/${
            runtime.modules.length
          }`,
          description: "Only foundation modules are online.",
          status: "ready"
        }
      ],
      recentEvents: this.eventService.listRecent()
    };
  }
}

export function createDashboardSnapshot(): DashboardSnapshot {
  const config = getNyxConfig();
  const eventBus = createEventBus();
  const eventService = new EventService(eventBus);
  const runtimeService = new RuntimeService(config);
  const systemStatusService = new SystemStatusService();
  const dashboardService = new DashboardService(runtimeService, systemStatusService, eventService);

  eventService.startRuntime();

  return dashboardService.getSnapshot();
}
