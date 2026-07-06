import type { NyxConfig } from "@nyx-os/config";
import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxLogger } from "@nyx-os/logger";
import type { NyxMemoryService } from "@nyx-os/memory";
import type { NyxScheduler } from "@nyx-os/scheduler";

export type CapabilityServiceRegistry<TService = unknown> = {
  list(): unknown[];
  get?(name: string): TService | undefined;
};

export type CapabilityRuntimeHost = {
  getEventBus(): NyxEventBus<NyxSystemEvents>;
  getMemory(): NyxMemoryService;
  getRuntimeState?(): unknown;
};

export type CapabilityContext = {
  runtime: CapabilityRuntimeHost;
  logger: NyxLogger;
  config: NyxConfig;
  memory: NyxMemoryService;
  eventBus: NyxEventBus<NyxSystemEvents>;
  services: CapabilityServiceRegistry;
  scheduler: NyxScheduler;
};
