import type { NyxConfig, NyxModuleId } from "@nyx-os/config";
import { getNyxConfig } from "@nyx-os/config";
import type { SystemEvent } from "@nyx-os/events";
import { createEventBus, type EventBus } from "@nyx-os/events";

export type RuntimeStatus = "ready" | "starting" | "degraded";
export type ModuleStatus = "ready" | "planned" | "offline";

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
