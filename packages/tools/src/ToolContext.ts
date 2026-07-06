import type { NyxCapabilityManager } from "@nyx-os/capabilities";
import type { NyxConfig } from "@nyx-os/config";
import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxLogger } from "@nyx-os/logger";
import type { NyxMemoryService } from "@nyx-os/memory";
import type { NyxScheduler } from "@nyx-os/scheduler";

export type ToolServiceRegistry<TService = unknown> = {
  list(): unknown[];
  get?(name: string): TService | undefined;
};

export type ToolRuntimeHost = {
  getCapabilities(): NyxCapabilityManager;
  getEventBus(): NyxEventBus<NyxSystemEvents>;
  getMemory(): NyxMemoryService;
  getRuntimeState?(): unknown;
};

export type ToolContext = {
  runtime: ToolRuntimeHost;
  logger: NyxLogger;
  config: NyxConfig;
  memory: NyxMemoryService;
  scheduler: NyxScheduler;
  eventBus: NyxEventBus<NyxSystemEvents>;
  services: ToolServiceRegistry;
  capabilities: NyxCapabilityManager;
};
