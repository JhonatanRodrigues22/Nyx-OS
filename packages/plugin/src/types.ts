import type { NyxCapabilityManager } from "@nyx-os/capabilities";
import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxLogger } from "@nyx-os/logger";
import type { NyxMemoryService } from "@nyx-os/memory";
import type { NyxScheduler } from "@nyx-os/scheduler";
import type { NyxStateService } from "@nyx-os/state";
import type { NyxToolManager } from "@nyx-os/tools";

export type MaybePromise<T> = T | Promise<T>;

export type NyxPluginStatus =
  | "registered"
  | "initializing"
  | "initialized"
  | "disposing"
  | "disposed"
  | "failed";

export type NyxPluginServiceRegistry<TService = unknown> = {
  list(): unknown[];
  get?(name: string): TService | undefined;
};

export type NyxPluginRuntimeHost = {
  getCapabilities(): NyxCapabilityManager;
  getEventBus(): NyxEventBus<NyxSystemEvents>;
  getMemory(): NyxMemoryService;
  getTools(): NyxToolManager;
  getRuntimeState?(): unknown;
};

export type NyxPluginContext = {
  runtime: NyxPluginRuntimeHost;
  capabilities: NyxCapabilityManager;
  events: NyxEventBus<NyxSystemEvents>;
  logger: NyxLogger;
  memory: NyxMemoryService;
  scheduler: NyxScheduler;
  tools: NyxToolManager;
  services: NyxPluginServiceRegistry;
  state: NyxStateService | null;
};

export interface NyxPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  initialize(context: NyxPluginContext): MaybePromise<void>;
  dispose?(context: NyxPluginContext): MaybePromise<void>;
}

export type NyxPluginSnapshot = {
  id: string;
  name: string;
  version: string;
  status: NyxPluginStatus;
  initializedAt: string | null;
  lastUpdated: string;
  error: string | null;
};

export type NyxPluginRecord = {
  plugin: NyxPlugin;
  snapshot: NyxPluginSnapshot;
};
