import type { NyxCapability, NyxCapabilityManager } from "@nyx-os/capabilities";
import type { CapabilityContext } from "@nyx-os/capabilities";
import type { NyxTool, NyxToolManager, ToolContext } from "@nyx-os/tools";
import { randomUUID } from "node:crypto";
import {
  LOCAL_PROTOCOL_VERSION,
  type LocalCapabilityAnnouncement,
  type LocalCapabilityDescriptor,
  type LocalCommandRequest,
  type LocalCommandResult
} from "./contracts";
import { LocalGatewayError, localGatewayError } from "./errors";
import { LocalGatewayServer } from "./LocalGatewayServer";

type PendingCommand = {
  instanceId: string;
  capabilityId: string;
  timer: NodeJS.Timeout;
  resolve: (result: unknown) => void;
  reject: (error: LocalGatewayError) => void;
};

export type LocalCommandOptions = {
  timeoutMs?: number;
};

export type LocalCapabilityBridgeOptions = {
  server: LocalGatewayServer;
  capabilities: NyxCapabilityManager;
  tools: NyxToolManager;
  commandTimeoutMs?: number;
};

class RemoteLocalCapability implements NyxCapability<unknown, unknown> {
  readonly category = "custom" as const;
  readonly tags = ["local", "remote"];
  readonly enabled = true;
  readonly metadata: { remote: boolean; localInstanceId: string };

  constructor(
    private readonly bridge: LocalCapabilityBridge,
    readonly instanceId: string,
    descriptor: LocalCapabilityDescriptor
  ) {
    this.id = descriptor.id;
    this.name = descriptor.name;
    this.description = descriptor.description;
    this.version = descriptor.version;
    this.metadata = { remote: true, localInstanceId: instanceId };
  }

  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;

  execute(_context: CapabilityContext, input?: unknown): Promise<unknown> {
    return this.bridge.execute(this.instanceId, this.id, input);
  }
}

class RemoteLocalTool implements NyxTool<unknown, unknown> {
  readonly category = "custom" as const;
  readonly enabled = true;
  readonly metadata: { remote: boolean; localInstanceId: string };

  constructor(
    readonly instanceId: string,
    descriptor: LocalCapabilityDescriptor
  ) {
    this.id = descriptor.id;
    this.capabilityId = descriptor.id;
    this.name = descriptor.name;
    this.description = descriptor.description;
    this.version = descriptor.version;
    this.parameters = descriptor.parameters ?? {};
    this.result = descriptor.resultDescription ? { description: descriptor.resultDescription } : {};
    this.metadata = { remote: true, localInstanceId: instanceId };
  }

  readonly id: string;
  readonly capabilityId: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly parameters: LocalCapabilityDescriptor["parameters"] & {};
  readonly result: { description?: string };

  async execute(context: ToolContext, input?: unknown): Promise<unknown> {
    const execution = await context.capabilities.execute(this.capabilityId, input);
    return execution.result;
  }
}

export class LocalCapabilityBridge {
  private readonly server: LocalGatewayServer;
  private readonly capabilities: NyxCapabilityManager;
  private readonly tools: NyxToolManager;
  private readonly commandTimeoutMs: number;
  private readonly pending = new Map<string, PendingCommand>();
  private readonly instanceCapabilities = new Map<string, Set<string>>();
  private readonly capabilityOwners = new Map<string, string>();
  private readonly unsubscribers: Array<() => void>;

  constructor(options: LocalCapabilityBridgeOptions) {
    this.server = options.server;
    this.capabilities = options.capabilities;
    this.tools = options.tools;
    this.commandTimeoutMs = options.commandTimeoutMs ?? 10_000;
    this.unsubscribers = [
      this.server.onCapabilities((announcement) => this.updateCapabilities(announcement)),
      this.server.onCommandResult((result) => this.completeCommand(result)),
      this.server.onDisconnected((instance) => this.disconnect(instance.id))
    ];
  }

  execute(
    instanceId: string,
    capabilityId: string,
    input?: unknown,
    options: LocalCommandOptions = {}
  ): Promise<unknown> {
    const timeoutMs = options.timeoutMs ?? this.commandTimeoutMs;

    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      return Promise.reject(
        localGatewayError("INVALID_MESSAGE", "Command timeout must be a positive finite number", false)
      );
    }

    const requestId = randomUUID();
    const request: LocalCommandRequest = {
      type: "local.command.request",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      requestId,
      instanceId,
      capabilityId,
      input
    };

    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(
          localGatewayError("COMMAND_TIMEOUT", `Local command timed out: ${capabilityId}`, true, {
            requestId,
            instanceId,
            capabilityId,
            timeoutMs
          })
        );
      }, timeoutMs);
      timer.unref?.();

      this.pending.set(requestId, { instanceId, capabilityId, timer, resolve, reject });

      try {
        this.server.sendCommand(request);
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(
          error instanceof LocalGatewayError
            ? error
            : localGatewayError("INSTANCE_NOT_CONNECTED", `Unable to send command: ${capabilityId}`, true)
        );
      }
    });
  }

  dispose(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());

    for (const requestId of Array.from(this.pending.keys())) {
      this.rejectPending(requestId, "GATEWAY_STOPPED", "Local gateway bridge was disposed", true);
    }

    for (const instanceId of Array.from(this.instanceCapabilities.keys())) {
      this.removeCapabilities(instanceId);
    }
  }

  private updateCapabilities(announcement: LocalCapabilityAnnouncement): void {
    const nextIds = new Set<string>();

    for (const descriptor of announcement.capabilities) {
      if (!descriptor.id.startsWith("computer.") && !descriptor.id.startsWith("local.")) {
        throw localGatewayError(
          "CAPABILITY_NOT_ALLOWED",
          `Capability prefix is not allowed: ${descriptor.id}`,
          false,
          { capabilityId: descriptor.id }
        );
      }

      if (nextIds.has(descriptor.id)) {
        throw localGatewayError("INVALID_MESSAGE", `Duplicate capability announcement: ${descriptor.id}`, false);
      }

      const owner = this.capabilityOwners.get(descriptor.id);
      if ((!owner && (this.capabilities.get(descriptor.id) || this.tools.get(descriptor.id))) || (owner && owner !== announcement.instanceId)) {
        throw localGatewayError(
          "INVALID_MESSAGE",
          `Capability id is already registered: ${descriptor.id}`,
          false,
          { capabilityId: descriptor.id }
        );
      }

      nextIds.add(descriptor.id);
    }

    this.removeCapabilities(announcement.instanceId);

    for (const descriptor of announcement.capabilities) {
      this.capabilities.register(new RemoteLocalCapability(this, announcement.instanceId, descriptor));
      this.tools.register(new RemoteLocalTool(announcement.instanceId, descriptor));
      this.capabilityOwners.set(descriptor.id, announcement.instanceId);
    }

    this.instanceCapabilities.set(announcement.instanceId, nextIds);
  }

  private completeCommand(result: LocalCommandResult): void {
    const pending = this.pending.get(result.requestId);

    if (
      !pending ||
      pending.instanceId !== result.instanceId ||
      pending.capabilityId !== result.capabilityId
    ) {
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(result.requestId);

    if (result.success) {
      pending.resolve(result.result);
      return;
    }

    pending.reject(
      result.error
        ? new LocalGatewayError(result.error)
        : localGatewayError("REMOTE_COMMAND_FAILED", `Remote command failed: ${result.capabilityId}`, true)
    );
  }

  private disconnect(instanceId: string): void {
    for (const [requestId, pending] of this.pending) {
      if (pending.instanceId === instanceId) {
        this.rejectPending(
          requestId,
          "CONNECTION_CLOSED",
          `Local instance disconnected during command: ${pending.capabilityId}`,
          true
        );
      }
    }

    this.removeCapabilities(instanceId);
  }

  private rejectPending(
    requestId: string,
    code: "CONNECTION_CLOSED" | "GATEWAY_STOPPED",
    message: string,
    retryable: boolean
  ): void {
    const pending = this.pending.get(requestId);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(requestId);
    pending.reject(localGatewayError(code, message, retryable, { requestId, instanceId: pending.instanceId }));
  }

  private removeCapabilities(instanceId: string): void {
    const capabilityIds = this.instanceCapabilities.get(instanceId);

    if (!capabilityIds) {
      return;
    }

    for (const capabilityId of capabilityIds) {
      if (this.tools.get(capabilityId)) {
        this.tools.remove(capabilityId);
      }
      if (this.capabilities.get(capabilityId)) {
        this.capabilities.remove(capabilityId);
      }
      this.capabilityOwners.delete(capabilityId);
    }

    this.instanceCapabilities.delete(instanceId);
  }
}
