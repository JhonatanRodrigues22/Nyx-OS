import { timingSafeEqual } from "node:crypto";
import { createNyxEventPayload, type NyxEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import WebSocket, { type RawData, WebSocketServer } from "ws";
import {
  LOCAL_PROTOCOL_VERSION,
  hasProtocolEnvelope,
  isLocalCapabilityDescriptor,
  isLocalCapabilityAnnouncement,
  isLocalCommandResult,
  isLocalHandshake,
  isLocalHeartbeat,
  type LocalCapabilityAnnouncement,
  type LocalCommandRequest,
  type LocalCommandResult,
  type LocalErrorEnvelope,
  type LocalHeartbeat,
  type LocalProtocolError,
  type LocalServerMessage
} from "./contracts";
import { localGatewayError } from "./errors";
import { LocalGatewayError } from "./errors";
import { LocalInstanceRegistry, type LocalInstanceSnapshot } from "./LocalInstanceRegistry";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

type Listener<T> = (payload: T) => void;

export type LocalGatewayServerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  host?: string;
  port?: number;
  tokenEnvVar?: string;
  maxPayloadBytes?: number;
  handshakeTimeoutMs?: number;
  heartbeatTimeoutMs?: number;
  heartbeatCheckIntervalMs?: number;
  registry?: LocalInstanceRegistry;
  now?: () => Date;
};

export type LocalGatewayAddress = {
  host: string;
  port: number;
};

export class LocalGatewayServer {
  readonly registry: LocalInstanceRegistry;
  private readonly host: string;
  private readonly port: number;
  private readonly token: string;
  private readonly maxPayloadBytes: number;
  private readonly handshakeTimeoutMs: number;
  private readonly heartbeatTimeoutMs: number;
  private readonly heartbeatCheckIntervalMs: number;
  private readonly now: () => Date;
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly capabilityListeners = new Set<Listener<LocalCapabilityAnnouncement>>();
  private readonly resultListeners = new Set<Listener<LocalCommandResult>>();
  private readonly heartbeatListeners = new Set<Listener<LocalHeartbeat>>();
  private readonly connectedListeners = new Set<Listener<LocalInstanceSnapshot>>();
  private readonly disconnectedListeners = new Set<Listener<LocalInstanceSnapshot>>();
  private server: WebSocketServer | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(options: LocalGatewayServerOptions) {
    this.host = options.host ?? "127.0.0.1";
    this.port = options.port ?? 4789;
    this.maxPayloadBytes = options.maxPayloadBytes ?? 64 * 1024;
    this.handshakeTimeoutMs = options.handshakeTimeoutMs ?? 5_000;
    this.heartbeatTimeoutMs = options.heartbeatTimeoutMs ?? 30_000;
    this.heartbeatCheckIntervalMs = options.heartbeatCheckIntervalMs ?? Math.max(250, this.heartbeatTimeoutMs / 2);
    this.registry = options.registry ?? new LocalInstanceRegistry();
    this.now = options.now ?? (() => new Date());
    this.events = options.events;

    if (!LOOPBACK_HOSTS.has(this.host)) {
      throw new Error(`Local gateway host must be loopback: ${this.host}`);
    }

    const tokenEnvVar = options.tokenEnvVar ?? "NYX_LOCAL_GATEWAY_TOKEN";
    const token = process.env[tokenEnvVar];

    if (!token) {
      throw new Error(`Local gateway authentication token is required via ${tokenEnvVar}`);
    }

    this.token = token;
  }

  async start(): Promise<LocalGatewayAddress> {
    if (this.server) {
      return this.getAddress();
    }

    const server = new WebSocketServer({ host: this.host, port: this.port, maxPayload: this.maxPayloadBytes });
    this.server = server;
    server.on("connection", (socket) => this.handleConnection(socket));

    await new Promise<void>((resolve, reject) => {
      const onListening = () => {
        server.off("error", onError);
        resolve();
      };
      const onError = (error: Error) => {
        server.off("listening", onListening);
        this.server = null;
        reject(error);
      };
      server.once("listening", onListening);
      server.once("error", onError);
    });

    this.heartbeatTimer = setInterval(() => this.expireStaleConnections(), this.heartbeatCheckIntervalMs);
    this.heartbeatTimer.unref?.();
    return this.getAddress();
  }

  async stop(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    const server = this.server;
    this.server = null;

    if (!server) {
      return;
    }

    for (const client of Array.from(server.clients)) {
      client.close(1001, "Gateway stopped");
    }

    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  getAddress(): LocalGatewayAddress {
    const address = this.server?.address();

    if (!address || typeof address === "string") {
      throw new Error("Local gateway is not listening");
    }

    return { host: this.host, port: address.port };
  }

  sendCommand(request: LocalCommandRequest): void {
    const instance = this.registry.get(request.instanceId);
    const socket = this.registry.getSocket(request.instanceId);

    if (!instance || instance.status !== "connected" || !socket || socket.readyState !== WebSocket.OPEN) {
      throw localGatewayError(
        "INSTANCE_NOT_CONNECTED",
        `Local instance is not connected: ${request.instanceId}`,
        true,
        { instanceId: request.instanceId }
      );
    }

    this.send(socket, request);
  }

  onCapabilities(listener: Listener<LocalCapabilityAnnouncement>): () => void {
    this.capabilityListeners.add(listener);
    return () => this.capabilityListeners.delete(listener);
  }

  onCommandResult(listener: Listener<LocalCommandResult>): () => void {
    this.resultListeners.add(listener);
    return () => this.resultListeners.delete(listener);
  }

  onHeartbeat(listener: Listener<LocalHeartbeat>): () => void {
    this.heartbeatListeners.add(listener);
    return () => this.heartbeatListeners.delete(listener);
  }

  onConnected(listener: Listener<LocalInstanceSnapshot>): () => void {
    this.connectedListeners.add(listener);
    return () => this.connectedListeners.delete(listener);
  }

  onDisconnected(listener: Listener<LocalInstanceSnapshot>): () => void {
    this.disconnectedListeners.add(listener);
    return () => this.disconnectedListeners.delete(listener);
  }

  private handleConnection(socket: WebSocket): void {
    let instanceId: string | null = null;
    let authenticated = false;
    const handshakeTimer = setTimeout(() => {
      if (!authenticated) {
        this.reject(socket, {
          code: "HANDSHAKE_REQUIRED",
          message: "Handshake was not received before the deadline",
          retryable: true
        }, true);
      }
    }, this.handshakeTimeoutMs);
    handshakeTimer.unref?.();

    socket.on("message", (raw, isBinary) => {
      if (isBinary || this.payloadLength(raw) > this.maxPayloadBytes) {
        this.reject(socket, {
          code: "PAYLOAD_TOO_LARGE",
          message: "Payload exceeds the configured limit",
          retryable: false,
          details: { maxPayloadBytes: this.maxPayloadBytes }
        }, !authenticated);
        return;
      }

      let message: unknown;

      try {
        message = JSON.parse(raw.toString());
      } catch {
        this.sendError(socket, { code: "INVALID_MESSAGE", message: "Message must be valid JSON", retryable: false });
        return;
      }

      if (!authenticated) {
        if (!isLocalHandshake(message)) {
          this.reject(socket, {
            code: "HANDSHAKE_REQUIRED",
            message: "The first message must be a valid handshake",
            retryable: false
          }, true);
          return;
        }

        if (message.protocolVersion !== LOCAL_PROTOCOL_VERSION) {
          this.reject(socket, {
            code: "INCOMPATIBLE_PROTOCOL_VERSION",
            message: `Unsupported local protocol version: ${message.protocolVersion}`,
            retryable: false,
            details: { supportedProtocolVersion: LOCAL_PROTOCOL_VERSION }
          }, true);
          return;
        }

        if (!this.tokensMatch(message.token)) {
          this.reject(socket, {
            code: "AUTHENTICATION_FAILED",
            message: "Local gateway authentication failed",
            retryable: false
          }, true);
          return;
        }

        clearTimeout(handshakeTimer);
        authenticated = true;
        instanceId = message.instanceId;
        const existingSocket = this.registry.getSocket(instanceId);

        if (existingSocket && existingSocket !== socket && existingSocket.readyState === WebSocket.OPEN) {
          existingSocket.close(1008, "Instance reconnected");
        }

        const instance = this.registry.connect(message, socket, this.now().toISOString());
        this.send(socket, {
          type: "local.handshake.accepted",
          protocolVersion: LOCAL_PROTOCOL_VERSION,
          instanceId
        });
        this.connectedListeners.forEach((listener) => listener(instance));
        this.events.emit(
          "local.handshake.completed",
          createNyxEventPayload({
            source: "local-gateway",
            status: "completed",
            metadata: { instanceId, platform: message.platform, version: message.version }
          })
        );
        this.events.emit(
          "local.connected",
          createNyxEventPayload({ source: "local-gateway", status: "connected", metadata: { instanceId } })
        );
        return;
      }

      if (!hasProtocolEnvelope(message) || message.protocolVersion !== LOCAL_PROTOCOL_VERSION) {
        this.sendError(socket, {
          code: "INCOMPATIBLE_PROTOCOL_VERSION",
          message: "Message protocol version is missing or incompatible",
          retryable: false,
          details: { supportedProtocolVersion: LOCAL_PROTOCOL_VERSION }
        });
        return;
      }

      if (!this.belongsToInstance(message, instanceId)) {
        this.sendError(socket, {
          code: "INVALID_MESSAGE",
          message: "Message instanceId does not match the authenticated connection",
          retryable: false
        });
        return;
      }

      if (isLocalCapabilityAnnouncement(message)) {
        const invalidCapability = message.capabilities.find((capability) => !isLocalCapabilityDescriptor(capability));
        const disallowedCapability = message.capabilities.find(
          (capability) =>
            isLocalCapabilityDescriptor(capability) &&
            !capability.id.startsWith("computer.") &&
            !capability.id.startsWith("local.")
        );

        if (invalidCapability) {
          this.sendError(socket, {
            code: "INVALID_MESSAGE",
            message: "Capability announcement contains an invalid descriptor",
            retryable: false
          });
          return;
        }

        if (disallowedCapability && isLocalCapabilityDescriptor(disallowedCapability)) {
          this.sendError(socket, {
            code: "CAPABILITY_NOT_ALLOWED",
            message: `Capability prefix is not allowed: ${disallowedCapability.id}`,
            retryable: false,
            details: { capabilityId: disallowedCapability.id }
          });
          return;
        }

        try {
          this.capabilityListeners.forEach((listener) => listener(message));
          this.registry.updateCapabilities(message.instanceId, message.capabilities);
          this.events.emit(
            "local.capabilities.updated",
            createNyxEventPayload({
              source: "local-gateway",
              status: "updated",
              metadata: {
                instanceId: message.instanceId,
                capabilityIds: message.capabilities.map((capability) => capability.id)
              }
            })
          );
        } catch (error) {
          this.sendError(
            socket,
            error instanceof LocalGatewayError
              ? error.toProtocolError()
              : { code: "INVALID_MESSAGE", message: "Capability announcement was rejected", retryable: false }
          );
        }
      } else if (isLocalCommandResult(message)) {
        this.resultListeners.forEach((listener) => listener(message));
      } else if (isLocalHeartbeat(message)) {
        this.registry.heartbeat(message.instanceId, this.now().toISOString());
        this.heartbeatListeners.forEach((listener) => listener(message));
        this.events.emit(
          "local.heartbeat.received",
          createNyxEventPayload({
            source: "local-gateway",
            status: "received",
            metadata: { instanceId: message.instanceId, sentAt: message.sentAt }
          })
        );
      } else {
        this.sendError(socket, { code: "INVALID_MESSAGE", message: "Unsupported message type", retryable: false });
      }
    });

    socket.on("close", () => {
      clearTimeout(handshakeTimer);

      if (!instanceId || this.registry.getSocket(instanceId) !== socket) {
        return;
      }

      const instance = this.registry.disconnect(instanceId);
      if (instance) {
        this.disconnectedListeners.forEach((listener) => listener(instance));
        this.events.emit(
          "local.disconnected",
          createNyxEventPayload({ source: "local-gateway", status: instance.status, metadata: { instanceId } })
        );
      }
    });

    socket.on("error", () => {
      // The close handler performs cleanup; socket errors must never escape into the runtime.
    });
  }

  private expireStaleConnections(): void {
    const now = this.now().getTime();

    for (const instance of this.registry.listConnected()) {
      if (now - new Date(instance.lastHeartbeatAt).getTime() <= this.heartbeatTimeoutMs) {
        continue;
      }

      this.registry.markStale(instance.id);
      const socket = this.registry.getSocket(instance.id);
      socket?.close(4000, "Heartbeat timeout");
    }
  }

  private belongsToInstance(message: unknown, instanceId: string | null): boolean {
    return (
      typeof message === "object" &&
      message !== null &&
      "instanceId" in message &&
      typeof message.instanceId === "string" &&
      message.instanceId === instanceId
    );
  }

  private tokensMatch(candidate: string): boolean {
    const expected = Buffer.from(this.token);
    const received = Buffer.from(candidate);
    return expected.length === received.length && timingSafeEqual(expected, received);
  }

  private payloadLength(raw: RawData): number {
    if (Array.isArray(raw)) {
      return raw.reduce((size, chunk) => size + chunk.byteLength, 0);
    }
    return raw.byteLength;
  }

  private send(socket: WebSocket, message: LocalServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private sendError(socket: WebSocket, error: LocalProtocolError): void {
    const envelope: LocalErrorEnvelope = {
      type: "local.error",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      error
    };
    this.send(socket, envelope);
  }

  private reject(socket: WebSocket, error: LocalProtocolError, handshakeFailure: boolean): void {
    this.sendError(socket, error);
    if (handshakeFailure) {
      this.events.emit(
        "local.handshake.failed",
        createNyxEventPayload({
          source: "local-gateway",
          status: "failed",
          metadata: { errorCode: error.code, retryable: error.retryable }
        })
      );
    }
    socket.close(1008, error.code);
  }
}
