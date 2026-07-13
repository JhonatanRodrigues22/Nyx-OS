import type WebSocket from "ws";
import type { LocalCapabilityDescriptor, LocalHandshake } from "./contracts";

export type LocalInstanceStatus = "connected" | "stale" | "disconnected";

export type LocalInstanceSnapshot = {
  id: string;
  platform: LocalHandshake["platform"];
  version: string;
  capabilities: LocalCapabilityDescriptor[];
  status: LocalInstanceStatus;
  connectedAt: string;
  lastHeartbeatAt: string;
};

type LocalInstanceRecord = LocalInstanceSnapshot & {
  socket: WebSocket;
};

export class LocalInstanceRegistry {
  private readonly instances = new Map<string, LocalInstanceRecord>();

  connect(handshake: LocalHandshake, socket: WebSocket, now = new Date().toISOString()): LocalInstanceSnapshot {
    const record: LocalInstanceRecord = {
      id: handshake.instanceId,
      platform: handshake.platform,
      version: handshake.version,
      capabilities: [],
      status: "connected",
      connectedAt: now,
      lastHeartbeatAt: now,
      socket
    };

    this.instances.set(record.id, record);
    return this.snapshot(record);
  }

  updateCapabilities(instanceId: string, capabilities: LocalCapabilityDescriptor[]): LocalInstanceSnapshot {
    const instance = this.require(instanceId);
    instance.capabilities = capabilities.map((capability) => ({
      ...capability,
      parameters: capability.parameters ? { ...capability.parameters } : undefined
    }));
    return this.snapshot(instance);
  }

  heartbeat(instanceId: string, now = new Date().toISOString()): LocalInstanceSnapshot {
    const instance = this.require(instanceId);
    instance.lastHeartbeatAt = now;
    instance.status = "connected";
    return this.snapshot(instance);
  }

  markStale(instanceId: string): LocalInstanceSnapshot {
    const instance = this.require(instanceId);
    instance.status = "stale";
    return this.snapshot(instance);
  }

  disconnect(instanceId: string): LocalInstanceSnapshot | undefined {
    const instance = this.instances.get(instanceId);

    if (!instance) {
      return undefined;
    }

    instance.status = "disconnected";
    return this.snapshot(instance);
  }

  get(instanceId: string): LocalInstanceSnapshot | undefined {
    const instance = this.instances.get(instanceId);
    return instance ? this.snapshot(instance) : undefined;
  }

  getSocket(instanceId: string): WebSocket | undefined {
    return this.instances.get(instanceId)?.socket;
  }

  list(): LocalInstanceSnapshot[] {
    return Array.from(this.instances.values()).map((instance) => this.snapshot(instance));
  }

  listConnected(): LocalInstanceSnapshot[] {
    return this.list().filter((instance) => instance.status === "connected");
  }

  private require(instanceId: string): LocalInstanceRecord {
    const instance = this.instances.get(instanceId);

    if (!instance) {
      throw new Error(`Local instance not registered: ${instanceId}`);
    }

    return instance;
  }

  private snapshot(instance: LocalInstanceRecord): LocalInstanceSnapshot {
    return {
      id: instance.id,
      platform: instance.platform,
      version: instance.version,
      capabilities: instance.capabilities.map((capability) => ({
        ...capability,
        parameters: capability.parameters ? { ...capability.parameters } : undefined
      })),
      status: instance.status,
      connectedAt: instance.connectedAt,
      lastHeartbeatAt: instance.lastHeartbeatAt
    };
  }
}
