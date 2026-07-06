import type { NyxConfig, NyxConfigEnvironment, NyxEnvironment, NyxModuleId } from "@nyx-os/config";
import { getNyxConfig } from "@nyx-os/config";
import {
  createInMemoryEventBus,
  createNyxEventPayload,
  type NyxEventBus,
  type NyxSystemEvents
} from "@nyx-os/event-bus";
import type { SystemEvent } from "@nyx-os/events";
import { createEventBus, type EventBus } from "@nyx-os/events";
import { createConsoleLogger, type NyxLogger } from "@nyx-os/logger";
import { MemoryManager, type MemorySnapshot, type NyxMemoryService } from "@nyx-os/memory";
import {
  PluginManager,
  type NyxPlugin,
  type NyxPluginContext,
  type NyxPluginSnapshot
} from "@nyx-os/plugin";
import { SchedulerManager, type NyxScheduler, type ScheduledTaskSnapshot } from "@nyx-os/scheduler";
import {
  InMemoryNyxStateService,
  type NyxRuntimeState,
  type NyxStateService
} from "@nyx-os/state";

type MaybePromise<T> = T | Promise<T>;

export type RuntimeStatus = "ready" | "starting" | "degraded";
export type ModuleStatus = "ready" | "planned" | "offline";
export type ServiceStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
export type NyxRuntimeStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";

export type NyxServiceContext = {
  eventBus: EventBus;
  events: NyxEventBus<NyxSystemEvents>;
  logger: NyxLogger;
  state: NyxStateService | null;
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
  plugins: NyxPluginSnapshot[];
  scheduler: {
    status: ReturnType<NyxScheduler["getStatus"]>;
    tasks: ScheduledTaskSnapshot[];
  };
  memory: MemorySnapshot;
  events: SystemEvent[];
  state: NyxRuntimeState | null;
};

export type ConfigServiceSnapshot = Pick<NyxConfig, "appName" | "version" | "environment" | "enabledModules" | "featureFlags">;

export type ConfigServiceOptions = {
  env?: NyxConfigEnvironment;
  loadConfig?: (env?: NyxConfigEnvironment) => NyxConfig;
};

export type LoggerServiceOptions = {
  logger?: NyxLogger;
};

export type StateServiceOptions = {
  state?: NyxStateService;
};

export type ServiceLifecycleEvent = {
  service: NyxService;
  status: ServiceStatus;
};

export type ServiceLifecycleHandler = (event: ServiceLifecycleEvent) => void;

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

export type DashboardOverview = {
  statusLabel: string;
  runtimeStatus: NyxRuntimeStatus;
  uptimeMs: number;
  uptimeLabel: string;
  version: string;
  environment: NyxEnvironment;
  healthScore: number;
  healthBar: string;
  infrastructureScore: number;
  infrastructureBar: string;
  services: {
    total: number;
    running: number;
  };
  plugins: {
    total: number;
    initialized: number;
  };
  scheduler: {
    status: ReturnType<NyxScheduler["getStatus"]>;
    taskCount: number;
    activeTasks: number;
    lastHeartbeatLabel: string;
  };
  events: {
    total: number;
    recent: number;
  };
};

export type DashboardSnapshot = {
  runtime: RuntimeState;
  systemStatus: SystemStatus;
  overview: DashboardOverview;
  navigation: NavigationItem[];
  cards: DashboardCard[];
  plugins: NyxPluginSnapshot[];
  scheduler: {
    status: ReturnType<NyxScheduler["getStatus"]>;
    tasks: ScheduledTaskSnapshot[];
  };
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

export class LoggerService extends BaseNyxService {
  private readonly logger: NyxLogger;

  constructor(options: LoggerServiceOptions = {}) {
    super("logger");
    this.logger = options.logger ?? createConsoleLogger();
  }

  start(): MaybePromise<void> {
    this.logger.debug("Logger service started", { service: this.name });
    return super.start();
  }

  stop(): MaybePromise<void> {
    this.logger.debug("Logger service stopped", { service: this.name });
    return super.stop();
  }

  getLogger(): NyxLogger {
    return this.logger;
  }
}

export class RuntimeStateService extends BaseNyxService {
  private readonly state: NyxStateService;

  constructor(options: StateServiceOptions = {}) {
    super("state", ["logger"]);
    this.state = options.state ?? new InMemoryNyxStateService();
  }

  getRuntimeState(): NyxRuntimeState {
    return this.state.getRuntimeState();
  }

  getServices() {
    return this.state.getServices();
  }

  getService(name: string) {
    return this.state.getService(name);
  }

  getUptime(): number {
    return this.state.getUptime();
  }

  getVersion(): string {
    return this.state.getVersion();
  }

  getEnvironment(): string {
    return this.state.getEnvironment();
  }

  getStateStore(): NyxStateService {
    return this.state;
  }
}

export class ConfigService extends BaseNyxService {
  private config: NyxConfig | null = null;
  private logger: NyxLogger | null = null;
  private readonly loadConfig: (env?: NyxConfigEnvironment) => NyxConfig;
  private readonly env: NyxConfigEnvironment | undefined;

  constructor(options: ConfigServiceOptions = {}) {
    super("config", ["logger"]);
    this.env = options.env;
    this.loadConfig = options.loadConfig ?? getNyxConfig;
  }

  setup(context: NyxServiceContext): MaybePromise<void> {
    this.logger = context.logger;
  }

  start(): MaybePromise<void> {
    this.config = this.loadConfig(this.env);
    this.logger?.debug("Config service loaded configuration", {
      service: this.name,
      environment: this.config.environment,
      enabledModules: this.config.enabledModules
    });

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
  private readonly lifecycleHandlers = new Set<ServiceLifecycleHandler>();
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

  get(name: string): NyxService | undefined {
    return this.services.get(name);
  }

  onLifecycle(handler: ServiceLifecycleHandler): () => void {
    this.lifecycleHandlers.add(handler);

    return () => {
      this.lifecycleHandlers.delete(handler);
    };
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
      this.emitLifecycle(service);
      await service.start();
      service.status = "running";
      this.emitLifecycle(service);
    } catch (error) {
      service.status = "failed";
      this.emitLifecycle(service);
      throw error;
    }
  }

  private async stopOne(service: NyxService): Promise<void> {
    if (service.status !== "running" && service.status !== "failed") {
      return;
    }

    try {
      service.status = "stopping";
      this.emitLifecycle(service);
      await service.stop();
      service.status = "stopped";
      this.emitLifecycle(service);
    } catch (error) {
      service.status = "failed";
      this.emitLifecycle(service);
      throw error;
    }
  }

  private emitLifecycle(service: NyxService): void {
    const event: ServiceLifecycleEvent = {
      service,
      status: service.status
    };

    this.lifecycleHandlers.forEach((handler) => handler(event));
  }
}

export class NyxRuntime {
  private status: NyxRuntimeStatus = "created";
  readonly loggerService: LoggerService | null;
  readonly configService: ConfigService | null;
  readonly stateService: RuntimeStateService | null;
  readonly pluginManager: PluginManager;
  readonly scheduler: NyxScheduler;
  readonly memory: NyxMemoryService;

  constructor(
    readonly eventBus: EventBus = createEventBus(),
    readonly serviceManager: ServiceManager = new ServiceManager(),
    options: {
      registerBaseServices?: boolean;
      registerBasePlugins?: boolean;
      events?: NyxEventBus<NyxSystemEvents>;
      loggerService?: LoggerService;
      configService?: ConfigService;
      stateService?: RuntimeStateService;
      pluginManager?: PluginManager;
      scheduler?: NyxScheduler;
      memory?: NyxMemoryService;
    } = {}
  ) {
    this.events = options.events ?? createInMemoryEventBus<NyxSystemEvents>();
    this.pluginManager = options.pluginManager ?? new PluginManager(this.events);
    this.memory =
      options.memory ??
      new MemoryManager({
        events: this.events
      });
    this.scheduler =
      options.scheduler ??
      new SchedulerManager({
        events: this.events,
        logger: options.loggerService?.getLogger()
      });
    this.loggerService =
      options.registerBaseServices === false ? null : (options.loggerService ?? new LoggerService());
    this.configService =
      options.registerBaseServices === false ? null : (options.configService ?? new ConfigService());
    this.stateService =
      options.registerBaseServices === false ? null : (options.stateService ?? new RuntimeStateService());

    this.serviceManager.onLifecycle((event) => {
      this.stateService?.getStateStore().updateService({
        name: event.service.name,
        status: event.status,
        dependencies: event.service.dependencies
      });
      this.emitServiceLifecycleEvent(event);
    });

    if (this.loggerService) {
      this.registerService(this.loggerService);
    }

    if (this.configService) {
      this.registerService(this.configService);
    }

    if (this.stateService) {
      this.registerService(this.stateService);
    }

    if (options.registerBasePlugins !== false) {
      this.registerPlugin(new RuntimeDiagnosticsPlugin());
      this.registerPlugin(new MemoryPlugin());
      this.registerPlugin(new HeartbeatPlugin());
    }
  }

  readonly events: NyxEventBus<NyxSystemEvents>;

  registerService(service: NyxService): void {
    this.serviceManager.register(service);
    this.stateService?.getStateStore().registerService({
      name: service.name,
      status: service.status,
      dependencies: service.dependencies
    });
    this.events.emit(
      "service.registered",
      createNyxEventPayload({
        service: service.name,
        status: service.status,
        metadata: {
          dependencies: service.dependencies
        }
      })
    );
  }

  registerPlugin(plugin: NyxPlugin): void {
    this.pluginManager.register(plugin);
  }

  async unregisterPlugin(id: string): Promise<void> {
    await this.pluginManager.unregister(id, this.createPluginContext());
  }

  getPlugin(id: string): NyxPlugin | undefined {
    return this.pluginManager.get(id);
  }

  getPlugins(): NyxPluginSnapshot[] {
    return this.pluginManager.list();
  }

  getScheduler(): NyxScheduler {
    return this.scheduler;
  }

  getMemory(): NyxMemoryService {
    return this.memory;
  }

  async start(): Promise<void> {
    if (this.status === "running" || this.status === "starting") {
      return;
    }

    this.status = "starting";
    const logger = this.getLogger();
    this.initializeRuntimeState();
    this.stateService?.getStateStore().updateRuntimeStatus("starting");
    logger.info("Runtime starting", { status: this.status });
    this.eventBus.emit({
      type: "runtime.starting",
      message: "Nyx runtime is starting.",
      source: "runtime"
    });

    try {
      await this.serviceManager.setupAll(this.createServiceContext());
      await this.serviceManager.startAll();
      await this.pluginManager.initializeAll(this.createPluginContext());
      this.scheduler.start();
      this.status = "running";
      this.stateService?.getStateStore().updateRuntimeStatus("running");
      logger.info("Runtime started", { status: this.status });
      this.emitRuntimeEvent("runtime.started", "running");
      this.eventBus.emit({
        type: "runtime.started",
        message: "Nyx runtime started.",
        source: "runtime"
      });
    } catch (error) {
      this.status = "failed";
      this.stateService?.getStateStore().updateRuntimeStatus("failed");
      logger.error("Runtime failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
      this.emitRuntimeEvent("runtime.failed", "failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
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
    this.stateService?.getStateStore().updateRuntimeStatus("stopping");
    this.getLogger().info("Runtime stopping", { status: this.status });
    this.eventBus.emit({
      type: "runtime.stopping",
      message: "Nyx runtime is stopping.",
      source: "runtime"
    });

    try {
      this.scheduler.stop();
      await this.pluginManager.disposeAll(this.createPluginContext());
      await this.serviceManager.stopAll();
      this.status = "stopped";
      this.stateService?.getStateStore().updateRuntimeStatus("stopped");
      this.getLogger().info("Runtime stopped", { status: this.status });
      this.emitRuntimeEvent("runtime.stopped", "stopped");
      this.eventBus.emit({
        type: "runtime.stopped",
        message: "Nyx runtime stopped.",
        source: "runtime"
      });
    } catch (error) {
      this.status = "failed";
      this.stateService?.getStateStore().updateRuntimeStatus("failed");
      this.getLogger().error("Runtime failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
      this.emitRuntimeEvent("runtime.failed", "failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
      this.eventBus.emit({
        type: "runtime.failed",
        message: error instanceof Error ? error.message : "Nyx runtime failed.",
        level: "error",
        source: "runtime"
      });
      throw error;
    }
  }

  getSnapshot(): NyxRuntimeSnapshot {
    return {
      status: this.status,
      services: this.serviceManager.list(),
      plugins: this.pluginManager.list(),
      scheduler: {
        status: this.scheduler.getStatus(),
        tasks: this.scheduler.getTasks()
      },
      memory: this.memory.snapshot(),
      events: this.eventBus.listRecent(),
      state: this.stateService?.getRuntimeState() ?? null
    };
  }

  getRuntimeState(): NyxRuntimeState | null {
    return this.stateService?.getRuntimeState() ?? null;
  }

  getEventBus(): NyxEventBus<NyxSystemEvents> {
    return this.events;
  }

  private createServiceContext(): NyxServiceContext {
    return {
      eventBus: this.eventBus,
      events: this.events,
      logger: this.getLogger(),
      state: this.stateService?.getStateStore() ?? null,
      emit: (input) =>
        this.eventBus.emit({
          ...input,
          source: input.source ?? "service"
        })
    };
  }

  private createPluginContext(): NyxPluginContext {
    return {
      runtime: this,
      events: this.events,
      logger: this.getLogger(),
      memory: this.memory,
      scheduler: this.scheduler,
      services: {
        list: () => this.serviceManager.list(),
        get: (name) => this.serviceManager.get(name)
      },
      state: this.stateService?.getStateStore() ?? null
    };
  }

  private getLogger(): NyxLogger {
    return this.loggerService?.getLogger() ?? createConsoleLogger();
  }

  private initializeRuntimeState(): void {
    const config = this.configService?.getConfig() ?? getNyxConfig();

    this.stateService?.getStateStore().initializeRuntime({
      status: "starting",
      version: config.version,
      environment: config.environment,
      services: this.serviceManager.list()
    });
  }

  private emitRuntimeEvent(event: "runtime.started" | "runtime.stopped" | "runtime.failed", status: string, metadata = {}) {
    this.events.emit(
      event,
      createNyxEventPayload({
        status,
        metadata
      })
    );
  }

  private emitServiceLifecycleEvent(event: ServiceLifecycleEvent): void {
    if (event.status === "running") {
      this.events.emit(
        "service.started",
        createNyxEventPayload({
          service: event.service.name,
          status: event.status,
          metadata: {
            dependencies: event.service.dependencies
          }
        })
      );
    }

    if (event.status === "stopped") {
      this.events.emit(
        "service.stopped",
        createNyxEventPayload({
          service: event.service.name,
          status: event.status,
          metadata: {
            dependencies: event.service.dependencies
          }
        })
      );
    }

    if (event.status === "failed") {
      this.events.emit(
        "service.failed",
        createNyxEventPayload({
          service: event.service.name,
          status: event.status,
          metadata: {
            dependencies: event.service.dependencies
          }
        })
      );
    }
  }
}

export class RuntimeDiagnosticsPlugin implements NyxPlugin {
  readonly id = "runtime-diagnostics";
  readonly name = "Runtime Diagnostics";
  readonly version = "0.1.0";

  initialize(context: NyxPluginContext): MaybePromise<void> {
    void context;
  }

  dispose(): MaybePromise<void> {
    return undefined;
  }
}

export class MemoryPlugin implements NyxPlugin {
  readonly id = "memory-plugin";
  readonly name = "Memory Plugin";
  readonly version = "0.1.0";

  initialize(context: NyxPluginContext): MaybePromise<void> {
    const existingMemory = context.memory.get("memory.runtime.diagnostics");

    if (!existingMemory) {
      context.memory.create({
        id: "memory.runtime.diagnostics",
        title: "Runtime memory diagnostics",
        content: "Memory service initialized and available through the Nyx Runtime plugin context.",
        category: "system",
        tags: ["runtime", "memory", "diagnostics"],
        source: {
          type: "plugin",
          id: this.id,
          label: this.name
        },
        metadata: {
          plugin: this.id
        },
        importance: 4
      });
    }

    context.memory.search({ tags: ["memory"] });
    context.memory.list();
  }

  dispose(): MaybePromise<void> {
    return undefined;
  }
}

export class HeartbeatPlugin implements NyxPlugin {
  readonly id = "heartbeat";
  readonly name = "Heartbeat";
  readonly version = "0.1.0";

  initialize(context: NyxPluginContext): MaybePromise<void> {
    context.scheduler.register({
      id: "scheduler.heartbeat",
      name: "Scheduler Heartbeat",
      interval: 30000,
      enabled: true,
      execute: (taskContext) => {
        taskContext.logger.info("Heartbeat task executed", {
          task: "scheduler.heartbeat"
        });
      }
    });
  }

  dispose(context: NyxPluginContext): MaybePromise<void> {
    const taskExists = context.scheduler.getTasks().some((task) => task.id === "scheduler.heartbeat");

    if (taskExists) {
      context.scheduler.unregister("scheduler.heartbeat");
    }
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

function clampPercentage(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratioToPercentage(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return clampPercentage(value * 100);
}

function createProgressBar(value: number, size = 16): string {
  const percentage = clampPercentage(value);
  const filled = Math.round((percentage / 100) * size);

  return `${"█".repeat(filled)}${"░".repeat(size - filled)}`;
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function resolveDashboardEnvironment(value: string): NyxEnvironment {
  if (value === "development" || value === "test" || value === "production" || value === "local") {
    return value;
  }

  return "development";
}

function getRuntimeUptime(runtimeSnapshot: NyxRuntimeSnapshot, runtime: RuntimeState): number {
  void runtime;

  if (runtimeSnapshot.state) {
    return runtimeSnapshot.state.uptimeMs;
  }

  return 0;
}

function createSyntheticEvent(type: string, index: number): SystemEvent {
  return {
    id: `system-${index}-${type}`,
    type,
    message: "Evento emitido pelo barramento oficial do Runtime.",
    level: type.endsWith(".failed") ? "error" : "info",
    source: type.split(".")[0] ?? "runtime",
    timestamp: new Date().toISOString()
  };
}

function mergeRecentEvents(runtimeEvents: SystemEvent[], officialEventTypes: readonly string[] = []): SystemEvent[] {
  const officialEvents = officialEventTypes.map((type, index) => createSyntheticEvent(type, index));
  const events = [...officialEvents, ...runtimeEvents];
  const seen = new Set<string>();

  return events
    .filter((event) => {
      const key = `${event.type}:${event.source}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

function createDashboardOverview(
  config: ConfigServiceSnapshot,
  runtime: RuntimeState,
  runtimeSnapshot: NyxRuntimeSnapshot,
  recentEvents: SystemEvent[]
): DashboardOverview {
  const services = runtimeSnapshot.services;
  const runningServices = services.filter((service) => service.status === "running").length;
  const plugins = runtimeSnapshot.plugins;
  const initializedPlugins = plugins.filter((plugin) => plugin.status === "initialized").length;
  const schedulerTasks = runtimeSnapshot.scheduler.tasks;
  const activeTasks = schedulerTasks.filter((task) => task.status === "scheduled" || task.status === "executing").length;
  const readyModules = runtime.modules.filter((module) => module.status === "ready").length;
  const runtimeScore = runtimeSnapshot.status === "running" ? 100 : runtime.status === "ready" ? 70 : 45;
  const serviceScore = services.length > 0 ? ratioToPercentage(runningServices / services.length) : 70;
  const pluginScore = plugins.length > 0 ? ratioToPercentage(initializedPlugins / plugins.length) : 70;
  const schedulerScore =
    runtimeSnapshot.scheduler.status === "running" ? 100 : runtimeSnapshot.scheduler.status === "paused" ? 65 : 50;
  const moduleScore = runtime.modules.length > 0 ? ratioToPercentage(readyModules / runtime.modules.length) : 0;
  const healthScore = clampPercentage((runtimeScore + serviceScore + pluginScore + schedulerScore + moduleScore) / 5);
  const infrastructureScore = clampPercentage(
    (moduleScore + serviceScore + pluginScore + (schedulerTasks.length > 0 ? 100 : 60)) / 4
  );
  const uptimeMs = getRuntimeUptime(runtimeSnapshot, runtime);
  const heartbeatTask = schedulerTasks.find((task) => task.id === "scheduler.heartbeat");

  return {
    statusLabel: runtimeSnapshot.status === "running" ? "ONLINE" : runtime.status === "ready" ? "PRONTO" : "INICIAL",
    runtimeStatus: runtimeSnapshot.status,
    uptimeMs,
    uptimeLabel: formatDuration(uptimeMs),
    version: config.version,
    environment: config.environment,
    healthScore,
    healthBar: createProgressBar(healthScore),
    infrastructureScore,
    infrastructureBar: createProgressBar(infrastructureScore),
    services: {
      total: services.length,
      running: runningServices
    },
    plugins: {
      total: plugins.length,
      initialized: initializedPlugins
    },
    scheduler: {
      status: runtimeSnapshot.scheduler.status,
      taskCount: schedulerTasks.length,
      activeTasks,
      lastHeartbeatLabel: heartbeatTask ? "aguardando ciclo" : "indisponível"
    },
    events: {
      total: recentEvents.length,
      recent: recentEvents.length
    }
  };
}

export class DashboardService {
  constructor(
    private readonly runtimeService: RuntimeService,
    private readonly systemStatusService: SystemStatusService,
    private readonly eventService: EventService,
    private readonly plugins: NyxPluginSnapshot[] = [],
    private readonly scheduler: DashboardSnapshot["scheduler"] = {
      status: "idle",
      tasks: []
    },
    private readonly runtimeSnapshot: NyxRuntimeSnapshot | null = null,
    private readonly configSnapshot: ConfigServiceSnapshot | null = null,
    private readonly officialEventTypes: readonly string[] = []
  ) {}

  getSnapshot(): DashboardSnapshot {
    const runtime = this.runtimeService.getState();
    const runtimeSnapshot =
      this.runtimeSnapshot ??
      ({
        status: runtime.status === "ready" ? "created" : "failed",
        services: [],
        plugins: this.plugins,
        scheduler: this.scheduler,
        memory: {
          total: 0,
          categories: {
            project: 0,
            knowledge: 0,
            conversation: 0,
            system: 0,
            user: 0,
            automation: 0,
            temporary: 0,
            custom: 0
          },
          tags: {}
        },
        events: this.eventService.listRecent(),
        state: null
      } satisfies NyxRuntimeSnapshot);
    const runtimeEvents = runtimeSnapshot.events.length > 0 ? runtimeSnapshot.events : this.eventService.listRecent();
    const recentEvents = mergeRecentEvents(runtimeEvents, this.officialEventTypes);
    const config =
      this.configSnapshot ??
      ({
        appName: "Nyx OS",
        version: runtime.version,
        environment: resolveDashboardEnvironment(runtime.environment),
        enabledModules: [],
        featureFlags: {
          useMockData: true,
          enablePersistentMemory: false,
          enableAutomation: false,
          enableAiRuntime: false
        }
      } satisfies ConfigServiceSnapshot);
    const overview = createDashboardOverview(config, runtime, runtimeSnapshot, recentEvents);

    return {
      runtime,
      systemStatus: this.systemStatusService.getStatus(runtime),
      overview,
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
          value: overview.statusLabel,
          description: `Status interno: ${overview.runtimeStatus}.`,
          status: "ready"
        },
        {
          title: "Serviços",
          value: `${overview.services.running}/${overview.services.total}`,
          description: "Serviços internos registrados no Runtime.",
          status: "ready"
        },
        {
          title: "Infraestrutura",
          value: `${overview.infrastructureScore}%`,
          description: "Progresso técnico da fundação disponível.",
          status: "ready"
        },
        {
          title: "Plugins",
          value: `${overview.plugins.initialized}/${overview.plugins.total}`,
          description: "Plugins carregados pelo Runtime.",
          status: "ready"
        },
        {
          title: "Scheduler",
          value: overview.scheduler.status,
          description: `Tasks registradas: ${overview.scheduler.taskCount}.`,
          status: "ready"
        }
      ],
      plugins: runtimeSnapshot.plugins,
      scheduler: runtimeSnapshot.scheduler,
      recentEvents
    };
  }
}

export function createDashboardSnapshotFromRuntime(
  runtime: NyxRuntime,
  officialEventTypes: readonly string[] = []
): DashboardSnapshot {
  const config = runtime.configService?.getSnapshot() ?? getNyxConfig();
  const runtimeSnapshot = runtime.getSnapshot();
  const runtimeService = new RuntimeService(config);
  const systemStatusService = new SystemStatusService();
  const eventService = new EventService(runtime.eventBus);
  const dashboardService = new DashboardService(
    runtimeService,
    systemStatusService,
    eventService,
    runtimeSnapshot.plugins,
    runtimeSnapshot.scheduler,
    runtimeSnapshot,
    config,
    officialEventTypes
  );

  return dashboardService.getSnapshot();
}

export function createDashboardSnapshot(): DashboardSnapshot {
  const config = getNyxConfig();
  const eventBus = createEventBus();
  const eventService = new EventService(eventBus);
  const runtime = new NyxRuntime(eventBus);
  const runtimeService = new RuntimeService(config);
  const systemStatusService = new SystemStatusService();
  const dashboardService = new DashboardService(
    runtimeService,
    systemStatusService,
    eventService,
    runtime.getPlugins(),
    {
      status: runtime.getScheduler().getStatus(),
      tasks: runtime.getScheduler().getTasks()
    },
    runtime.getSnapshot(),
    config
  );

  eventService.startRuntime();

  return dashboardService.getSnapshot();
}
