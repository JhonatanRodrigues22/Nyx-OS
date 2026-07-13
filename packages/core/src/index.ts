import {
  AiConversationManager,
  AiProviderRegistry,
  AnthropicProvider,
  type AiProvider
} from "@nyx-os/ai";
import {
  AutomationManager,
  type AutomationSnapshot,
  type NyxAutomationManager
} from "@nyx-os/automation";
import {
  CapabilityManager,
  DiagnosticsCapability,
  MemoryCapability,
  type CapabilityContext,
  type CapabilitySnapshot,
  type NyxCapabilityManager
} from "@nyx-os/capabilities";
import type { NyxConfig, NyxConfigEnvironment, NyxEnvironment, NyxModuleId } from "@nyx-os/config";
import { getNyxConfig } from "@nyx-os/config";
import {
  createInMemoryEventBus,
  createNyxEventPayload,
  type NyxEventPayload,
  type NyxEventBus,
  type NyxSystemEventName,
  type NyxSystemEvents
} from "@nyx-os/event-bus";
import { createConsoleLogger, type NyxLogger } from "@nyx-os/logger";
import type {
  LocalCapabilityBridge,
  LocalGatewayServer,
  LocalGatewayServerOptions,
  LocalInstanceSnapshot
} from "@nyx-os/local-gateway";
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
import {
  MemorySearchTool,
  RuntimeDiagnosticsTool,
  ToolManager,
  type NyxToolManager,
  type ToolContext,
  type ToolSnapshot
} from "@nyx-os/tools";

type MaybePromise<T> = T | Promise<T>;

export type RuntimeStatus = "ready" | "starting" | "degraded";
export type ModuleStatus = "ready" | "planned" | "offline";
export type ServiceStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
export type NyxRuntimeStatus = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";

export type NyxServiceContext = {
  events: NyxEventBus<NyxSystemEvents>;
  logger: NyxLogger;
  state: NyxStateService | null;
  emit: NyxEventBus<NyxSystemEvents>["emit"];
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
  capabilities: CapabilitySnapshot[];
  tools: ToolSnapshot[];
  localGateway: NyxRuntimeSnapshot["localGateway"];
  automations: AutomationSnapshot[];
  memory: MemorySnapshot;
  localGateway: {
    enabled: boolean;
    instances: LocalInstanceSnapshot[];
  };
  events: SystemEvent[];
  state: NyxRuntimeState | null;
};

export type SystemEventLevel = "info" | "warning" | "error";

export type SystemEvent = {
  id: string;
  type: NyxSystemEventName | string;
  message: string;
  level: SystemEventLevel;
  timestamp: string;
  source: string;
};

export type ConfigServiceSnapshot = Pick<NyxConfig, "appName" | "version" | "environment" | "enabledModules" | "ai" | "featureFlags">;

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
  capabilities: {
    total: number;
    enabled: number;
  };
  tools: {
    total: number;
    enabled: number;
    lastExecutedAt: string | null;
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
  capabilities: CapabilitySnapshot[];
  tools: ToolSnapshot[];
  automations: AutomationSnapshot[];
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
      ai: config.ai,
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

const recordedSystemEventNames: NyxSystemEventName[] = [
  "runtime.started",
  "runtime.stopped",
  "runtime.failed",
  "service.registered",
  "service.started",
  "service.stopped",
  "service.failed",
  "plugin.registered",
  "plugin.initialized",
  "plugin.disposed",
  "plugin.unregistered",
  "plugin.failed",
  "scheduler.started",
  "scheduler.stopped",
  "scheduler.task.registered",
  "scheduler.task.executed",
  "scheduler.task.failed",
  "scheduler.task.removed",
  "memory.created",
  "memory.updated",
  "memory.deleted",
  "memory.loaded",
  "memory.saved",
  "memory.search",
  "capability.registered",
  "capability.removed",
  "capability.executed",
  "capability.failed",
  "tool.registered",
  "tool.removed",
  "tool.executed",
  "tool.failed",
  "automation.registered",
  "automation.removed",
  "automation.enabled",
  "automation.disabled",
  "automation.executed",
  "automation.failed",
  "local.connected",
  "local.disconnected",
  "local.handshake.completed",
  "local.handshake.failed",
  "local.capabilities.updated",
  "local.command.requested",
  "local.command.started",
  "local.command.completed",
  "local.command.failed",
  "local.command.timed_out",
  "local.heartbeat.received"
];

export type NyxRuntimeOptions = {
  registerBaseServices?: boolean;
  registerBaseCapabilities?: boolean;
  registerBaseTools?: boolean;
  registerBaseAutomations?: boolean;
  registerAiRuntime?: boolean;
  registerLocalGateway?: boolean;
  registerBasePlugins?: boolean;
  events?: NyxEventBus<NyxSystemEvents>;
  loggerService?: LoggerService;
  configService?: ConfigService;
  stateService?: RuntimeStateService;
  pluginManager?: PluginManager;
  capabilities?: NyxCapabilityManager;
  tools?: NyxToolManager;
  automations?: NyxAutomationManager;
  ai?: AiConversationManager | null;
  aiProviders?: AiProviderRegistry;
  aiProvider?: AiProvider;
  localGateway?: LocalGatewayServer | null;
  localGatewayOptions?: Omit<LocalGatewayServerOptions, "events">;
  localCommandTimeoutMs?: number;
  scheduler?: NyxScheduler;
  memory?: NyxMemoryService;
};

export class NyxRuntime {
  private status: NyxRuntimeStatus = "created";
  private eventSequence = 0;
  private readonly recentEvents: SystemEvent[] = [];
  private readonly eventUnsubscribers: Array<() => void>;
  readonly loggerService: LoggerService | null;
  readonly configService: ConfigService | null;
  readonly stateService: RuntimeStateService | null;
  readonly pluginManager: PluginManager;
  readonly capabilities: NyxCapabilityManager;
  readonly tools: NyxToolManager;
  readonly automations: NyxAutomationManager;
  readonly ai: AiConversationManager | null;
  private localGateway: LocalGatewayServer | null;
  private localCapabilityBridge: LocalCapabilityBridge | null = null;
  private readonly registerLocalGateway: boolean;
  private readonly localGatewayOptions?: Omit<LocalGatewayServerOptions, "events">;
  private readonly localCommandTimeoutMs?: number;
  readonly scheduler: NyxScheduler;
  readonly memory: NyxMemoryService;

  constructor(
    readonly serviceManager: ServiceManager = new ServiceManager(),
    options: NyxRuntimeOptions = {}
  ) {
    this.events = options.events ?? createInMemoryEventBus<NyxSystemEvents>();
    this.eventUnsubscribers = recordedSystemEventNames.map((eventName) =>
      this.events.on(eventName, (event) => {
        this.recordEvent(event.name, event.payload);
      })
    );
    this.pluginManager = options.pluginManager ?? new PluginManager(this.events);
    this.memory =
      options.memory ??
      new MemoryManager({
        events: this.events
      });
    this.capabilities =
      options.capabilities ??
      new CapabilityManager({
        events: this.events,
        createContext: () => this.createCapabilityContext()
      });
    this.tools =
      options.tools ??
      new ToolManager({
        events: this.events,
        capabilities: this.capabilities,
        createContext: () => this.createToolContext()
      });
    this.scheduler =
      options.scheduler ??
      new SchedulerManager({
        events: this.events,
        logger: options.loggerService?.getLogger()
      });
    this.automations =
      options.automations ??
      new AutomationManager({
        events: this.events,
        scheduler: this.scheduler,
        tools: this.tools
      });
    this.ai =
      options.registerAiRuntime === true
        ? (options.ai ?? this.createAiRuntime(options))
        : (options.ai ?? null);
    this.localGateway = options.localGateway ?? null;
    this.registerLocalGateway = options.registerLocalGateway === true || options.localGateway != null;
    this.localGatewayOptions = options.localGatewayOptions;
    this.localCommandTimeoutMs = options.localCommandTimeoutMs;
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

    if (options.registerBaseCapabilities !== false) {
      this.capabilities.register(new DiagnosticsCapability());
      this.capabilities.register(new MemoryCapability());
    }

    if (options.registerBaseTools !== false) {
      if (this.capabilities.get("diagnostics.runtime")) {
        this.tools.register(new RuntimeDiagnosticsTool());
      }

      if (this.capabilities.get("memory.search")) {
        this.tools.register(new MemorySearchTool());
      }
    }

    if (options.registerBaseAutomations !== false) {
      // Base automation infrastructure is registered here; product automations remain out of scope for Sprint 16.
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

  getCapabilities(): NyxCapabilityManager {
    return this.capabilities;
  }

  getTools(): NyxToolManager {
    return this.tools;
  }

  getAutomations(): NyxAutomationManager {
    return this.automations;
  }

  getAi(): AiConversationManager | null {
    return this.ai;
  }

  getLocalGateway(): LocalGatewayServer | null {
    return this.localGateway;
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

    try {
      await this.ensureLocalGateway();
      await this.localGateway?.start();
      await this.serviceManager.setupAll(this.createServiceContext());
      await this.serviceManager.startAll();
      await this.pluginManager.initializeAll(this.createPluginContext());
      this.scheduler.start();
      this.status = "running";
      this.stateService?.getStateStore().updateRuntimeStatus("running");
      logger.info("Runtime started", { status: this.status });
      this.emitRuntimeEvent("runtime.started", "running");
    } catch (error) {
      this.status = "failed";
      this.stateService?.getStateStore().updateRuntimeStatus("failed");
      logger.error("Runtime failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
      this.emitRuntimeEvent("runtime.failed", "failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
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

    try {
      await this.localGateway?.stop();
      this.scheduler.stop();
      await this.pluginManager.disposeAll(this.createPluginContext());
      await this.serviceManager.stopAll();
      this.status = "stopped";
      this.stateService?.getStateStore().updateRuntimeStatus("stopped");
      this.getLogger().info("Runtime stopped", { status: this.status });
      this.emitRuntimeEvent("runtime.stopped", "stopped");
    } catch (error) {
      this.status = "failed";
      this.stateService?.getStateStore().updateRuntimeStatus("failed");
      this.getLogger().error("Runtime failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
      });
      this.emitRuntimeEvent("runtime.failed", "failed", {
        error: error instanceof Error ? error.message : "Unknown runtime failure"
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
      capabilities: this.capabilities.list(),
      tools: this.tools.list(),
      automations: this.automations.list(),
      memory: this.memory.snapshot(),
      localGateway: {
        enabled: this.localGateway !== null,
        instances: this.localGateway?.registry.list() ?? []
      },
      events: this.recentEvents,
      state: this.stateService?.getRuntimeState() ?? null
    };
  }

  getRuntimeState(): NyxRuntimeState | null {
    return this.stateService?.getRuntimeState() ?? null;
  }

  getEventBus(): NyxEventBus<NyxSystemEvents> {
    return this.events;
  }

  private async ensureLocalGateway(): Promise<void> {
    if (!this.registerLocalGateway || this.localCapabilityBridge) {
      return;
    }

    const { LocalCapabilityBridge, LocalGatewayServer } = await import("@nyx-os/local-gateway");
    this.localGateway ??= new LocalGatewayServer({ ...this.localGatewayOptions, events: this.events });
    this.localCapabilityBridge = new LocalCapabilityBridge({
      server: this.localGateway,
      capabilities: this.capabilities,
      tools: this.tools,
      commandTimeoutMs: this.localCommandTimeoutMs,
      events: this.events
    });
  }

  private createServiceContext(): NyxServiceContext {
    return {
      events: this.events,
      logger: this.getLogger(),
      state: this.stateService?.getStateStore() ?? null,
      emit: (event, payload) => this.events.emit(event, payload)
    };
  }

  private createPluginContext(): NyxPluginContext {
    return {
      runtime: this,
      automations: this.automations,
      capabilities: this.capabilities,
      events: this.events,
      logger: this.getLogger(),
      memory: this.memory,
      scheduler: this.scheduler,
      tools: this.tools,
      services: {
        list: () => this.serviceManager.list(),
        get: (name) => this.serviceManager.get(name)
      },
      state: this.stateService?.getStateStore() ?? null
    };
  }

  private createCapabilityContext(): CapabilityContext {
    return {
      runtime: this,
      logger: this.getLogger(),
      config: this.configService?.getConfig() ?? getNyxConfig(),
      memory: this.memory,
      eventBus: this.events,
      services: {
        list: () => this.serviceManager.list(),
        get: (name) => this.serviceManager.get(name)
      },
      scheduler: this.scheduler
    };
  }

  private createToolContext(): ToolContext {
    return {
      runtime: this,
      logger: this.getLogger(),
      config: this.configService?.getConfig() ?? getNyxConfig(),
      memory: this.memory,
      scheduler: this.scheduler,
      eventBus: this.events,
      services: {
        list: () => this.serviceManager.list(),
        get: (name) => this.serviceManager.get(name)
      },
      capabilities: this.capabilities
    };
  }

  private getLogger(): NyxLogger {
    return this.loggerService?.getLogger() ?? createConsoleLogger();
  }

  private createAiRuntime(options: NyxRuntimeOptions): AiConversationManager {
    const providers = options.aiProviders ?? new AiProviderRegistry();
    const config = this.configService?.getConfig() ?? getNyxConfig();

    if (options.aiProvider) {
      providers.register(config.ai.provider, options.aiProvider);
    } else if (config.ai.provider === "anthropic" && config.ai.apiKey) {
      providers.register(
        "anthropic",
        new AnthropicProvider({
          apiKey: config.ai.apiKey,
          model: config.ai.model
        })
      );
    }

    return new AiConversationManager({
      providers,
      tools: this.tools
    });
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

  private recordEvent(type: NyxSystemEventName, payload?: NyxEventPayload): void {
    this.eventSequence += 1;
    const event = createDisplayEvent(type, this.eventSequence, payload);

    this.recentEvents.unshift(event);
    this.recentEvents.splice(20);
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
  private events: SystemEvent[] = [];

  startRuntime(): void {
    this.events = [
      createDisplayEvent("dashboard.loaded", 3, undefined, "Dashboard snapshot prepared from runtime services."),
      createDisplayEvent("module.ready", 2, undefined, "Core, events and dashboard modules are ready."),
      createDisplayEvent("runtime.started", 1, undefined, "Nyx runtime initialized.")
    ];
  }

  listRecent(): SystemEvent[] {
    return this.events;
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

function createDisplayEvent(
  type: string,
  sequence: number,
  payload?: NyxEventPayload,
  message = "Evento emitido pelo barramento oficial do Runtime."
): SystemEvent {
  const source = payload?.service ?? payload?.plugin ?? payload?.task ?? type.split(".")[0] ?? "runtime";

  return {
    id: `system-${sequence}-${type}`,
    type,
    message,
    level: type.endsWith(".failed") ? "error" : "info",
    source,
    timestamp: payload?.timestamp ?? new Date().toISOString()
  };
}

function mergeRecentEvents(runtimeEvents: SystemEvent[], officialEventTypes: readonly string[] = []): SystemEvent[] {
  const officialEvents = officialEventTypes.map((type, index) => createDisplayEvent(type, index));
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
  const enabledCapabilities = runtimeSnapshot.capabilities.filter((capability) => capability.enabled).length;
  const enabledTools = runtimeSnapshot.tools.filter((tool) => tool.enabled).length;
  const lastToolExecution =
    runtimeSnapshot.tools
      .map((tool) => tool.lastExecutedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;
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
    capabilities: {
      total: runtimeSnapshot.capabilities.length,
      enabled: enabledCapabilities
    },
    tools: {
      total: runtimeSnapshot.tools.length,
      enabled: enabledTools,
      lastExecutedAt: lastToolExecution
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
        capabilities: [],
        tools: [],
        automations: [],
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
        localGateway: {
          enabled: false,
          instances: []
        },
        events: this.eventService.listRecent(),
        state: null
      } satisfies NyxRuntimeSnapshot);
    const runtimeEvents = [...this.eventService.listRecent(), ...runtimeSnapshot.events];
    const recentEvents = mergeRecentEvents(runtimeEvents, this.officialEventTypes);
    const config =
      this.configSnapshot ??
      ({
        appName: "Nyx OS",
        version: runtime.version,
        environment: resolveDashboardEnvironment(runtime.environment),
        enabledModules: [],
        ai: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-latest"
        },
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
        },
        {
          title: "Capabilities",
          value: `${overview.capabilities.enabled}/${overview.capabilities.total}`,
          description: "Capacidades registradas no Runtime.",
          status: "ready"
        },
        {
          title: "Tools",
          value: `${overview.tools.enabled}/${overview.tools.total}`,
          description: "Tools executaveis registradas por Capability.",
          status: "ready"
        }
      ],
      plugins: runtimeSnapshot.plugins,
      scheduler: runtimeSnapshot.scheduler,
      capabilities: runtimeSnapshot.capabilities,
      tools: runtimeSnapshot.tools,
      localGateway: runtimeSnapshot.localGateway,
      automations: runtimeSnapshot.automations,
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
  const eventService = new EventService();
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
  const eventService = new EventService();
  const runtime = new NyxRuntime();
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
