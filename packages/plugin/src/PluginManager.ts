import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxPlugin, NyxPluginContext, NyxPluginRecord, NyxPluginSnapshot, NyxPluginStatus } from "./types";

export class PluginManager {
  private readonly plugins = new Map<string, NyxPluginRecord>();

  constructor(private readonly events: NyxEventBus<NyxSystemEvents>) {}

  register(plugin: NyxPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`);
    }

    const snapshot = this.createSnapshot(plugin, "registered");

    this.plugins.set(plugin.id, {
      plugin,
      snapshot
    });
    this.emitPluginEvent("plugin.registered", snapshot);
  }

  async initialize(id: string, context: NyxPluginContext): Promise<void> {
    const record = this.requirePlugin(id);

    if (record.snapshot.status === "initialized") {
      return;
    }

    this.updateStatus(record, "initializing");

    try {
      await record.plugin.initialize(context);
      this.updateStatus(record, "initialized", {
        initializedAt: new Date().toISOString(),
        error: null
      });
      this.emitPluginEvent("plugin.initialized", record.snapshot);
    } catch (error) {
      this.updateStatus(record, "failed", {
        error: error instanceof Error ? error.message : "Unknown plugin failure"
      });
      this.emitPluginEvent("plugin.failed", record.snapshot);
      throw error;
    }
  }

  async initializeAll(context: NyxPluginContext): Promise<void> {
    for (const plugin of this.list()) {
      await this.initialize(plugin.id, context);
    }
  }

  async dispose(id: string, context: NyxPluginContext): Promise<void> {
    const record = this.requirePlugin(id);

    if (record.snapshot.status === "disposed" || record.snapshot.status === "registered") {
      return;
    }

    this.updateStatus(record, "disposing");

    try {
      await record.plugin.dispose?.(context);
      this.updateStatus(record, "disposed", {
        error: null
      });
      this.emitPluginEvent("plugin.disposed", record.snapshot);
    } catch (error) {
      this.updateStatus(record, "failed", {
        error: error instanceof Error ? error.message : "Unknown plugin failure"
      });
      this.emitPluginEvent("plugin.failed", record.snapshot);
      throw error;
    }
  }

  async disposeAll(context: NyxPluginContext): Promise<void> {
    for (const plugin of [...this.list()].reverse()) {
      await this.dispose(plugin.id, context);
    }
  }

  async unregister(id: string, context: NyxPluginContext): Promise<void> {
    const record = this.requirePlugin(id);

    if (record.snapshot.status !== "registered" && record.snapshot.status !== "disposed") {
      await this.dispose(id, context);
    }

    this.plugins.delete(id);
    this.emitPluginEvent("plugin.unregistered", record.snapshot);
  }

  remove(id: string): void {
    const record = this.requirePlugin(id);

    this.plugins.delete(id);
    this.emitPluginEvent("plugin.unregistered", record.snapshot);
  }

  get(id: string): NyxPlugin | undefined {
    return this.plugins.get(id)?.plugin;
  }

  getState(id: string): NyxPluginSnapshot | undefined {
    const snapshot = this.plugins.get(id)?.snapshot;

    return snapshot ? { ...snapshot } : undefined;
  }

  list(): NyxPluginSnapshot[] {
    return Array.from(this.plugins.values()).map((record) => ({ ...record.snapshot }));
  }

  private requirePlugin(id: string): NyxPluginRecord {
    const record = this.plugins.get(id);

    if (!record) {
      throw new Error(`Plugin not registered: ${id}`);
    }

    return record;
  }

  private createSnapshot(plugin: NyxPlugin, status: NyxPluginStatus): NyxPluginSnapshot {
    const now = new Date().toISOString();

    return {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      status,
      initializedAt: null,
      lastUpdated: now,
      error: null
    };
  }

  private updateStatus(
    record: NyxPluginRecord,
    status: NyxPluginStatus,
    changes: Partial<NyxPluginSnapshot> = {}
  ): void {
    record.snapshot = {
      ...record.snapshot,
      ...changes,
      status,
      lastUpdated: new Date().toISOString()
    };
  }

  private emitPluginEvent(
    event:
      | "plugin.registered"
      | "plugin.initialized"
      | "plugin.disposed"
      | "plugin.unregistered"
      | "plugin.failed",
    snapshot: NyxPluginSnapshot
  ): void {
    this.events.emit(
      event,
      createNyxEventPayload({
        plugin: snapshot.id,
        status: snapshot.status,
        metadata: {
          name: snapshot.name,
          version: snapshot.version,
          error: snapshot.error
        }
      })
    );
  }
}
