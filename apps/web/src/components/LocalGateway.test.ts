/** @jest-environment node */

import { NyxRuntime } from "@nyx-os/core";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import {
  LOCAL_PROTOCOL_VERSION,
  LocalCapabilityBridge,
  LocalGatewayError,
  LocalGatewayServer,
  type LocalCommandRequest,
  type LocalServerMessage
} from "@nyx-os/local-gateway";
import { randomUUID } from "node:crypto";
import WebSocket, { type RawData } from "ws";

type TestHarness = {
  bridge: LocalCapabilityBridge;
  runtime: NyxRuntime;
  server: LocalGatewayServer;
};

const clients: WebSocket[] = [];
const servers: LocalGatewayServer[] = [];
const bridges: LocalCapabilityBridge[] = [];

function currentToken(): string {
  const token = process.env.NYX_LOCAL_GATEWAY_TOKEN;
  if (!token) {
    throw new Error("Test token was not initialized");
  }
  return token;
}

function nextMessage(client: WebSocket): Promise<LocalServerMessage> {
  return new Promise((resolve, reject) => {
    const onMessage = (raw: RawData) => {
      client.off("error", onError);
      resolve(JSON.parse(raw.toString()) as LocalServerMessage);
    };
    const onError = (error: Error) => {
      client.off("message", onMessage);
      reject(error);
    };
    client.once("message", onMessage);
    client.once("error", onError);
  });
}

function waitForOpen(client: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    client.once("open", resolve);
    client.once("error", reject);
  });
}

function waitForClose(client: WebSocket): Promise<void> {
  return new Promise((resolve) => client.once("close", () => resolve()));
}

async function waitFor(predicate: () => boolean, timeoutMs = 1_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error("Condition was not met before timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function createServer(options: Partial<ConstructorParameters<typeof LocalGatewayServer>[0]> = {}) {
  const events = options.events ?? createInMemoryEventBus<NyxSystemEvents>();
  const server = new LocalGatewayServer({ events, port: 0, ...options });
  servers.push(server);
  await server.start();
  return server;
}

async function openClient(server: LocalGatewayServer): Promise<WebSocket> {
  const address = server.getAddress();
  const client = new WebSocket(`ws://${address.host}:${address.port}`);
  clients.push(client);
  await waitForOpen(client);
  return client;
}

async function handshake(
  server: LocalGatewayServer,
  overrides: Partial<{
    token: string;
    protocolVersion: string;
    instanceId: string;
  }> = {}
): Promise<{ client: WebSocket; response: LocalServerMessage }> {
  const client = await openClient(server);
  const responsePromise = nextMessage(client);
  client.send(
    JSON.stringify({
      type: "local.handshake",
      protocolVersion: overrides.protocolVersion ?? LOCAL_PROTOCOL_VERSION,
      token: overrides.token ?? currentToken(),
      instanceId: overrides.instanceId ?? "local-test-instance",
      platform: "windows",
      version: "0.1.0"
    })
  );
  return { client, response: await responsePromise };
}

function announceEcho(client: WebSocket, instanceId = "local-test-instance"): void {
  client.send(
    JSON.stringify({
      type: "local.capabilities.announcement",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      instanceId,
      capabilities: [
        {
          id: "local.echo",
          name: "Local Echo",
          description: "Returns the received technical payload.",
          version: "0.1.0",
          parameters: {
            message: { type: "string", required: true, description: "Message to echo." }
          },
          resultDescription: "Echo response."
        }
      ]
    })
  );
}

async function createHarness(commandTimeoutMs = 200): Promise<TestHarness> {
  const events = createInMemoryEventBus<NyxSystemEvents>();
  const runtime = new NyxRuntime(undefined, {
    events,
    registerBaseAutomations: false,
    registerBaseCapabilities: false,
    registerBasePlugins: false,
    registerBaseServices: false,
    registerBaseTools: false
  });
  const server = await createServer({ events });
  const bridge = new LocalCapabilityBridge({
    server,
    capabilities: runtime.getCapabilities(),
    tools: runtime.getTools(),
    events,
    commandTimeoutMs
  });
  bridges.push(bridge);
  return { bridge, runtime, server };
}

beforeEach(() => {
  process.env.NYX_LOCAL_GATEWAY_TOKEN = randomUUID();
});

afterEach(async () => {
  bridges.splice(0).forEach((bridge) => bridge.dispose());
  clients.splice(0).forEach((client) => {
    if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
      client.terminate();
    }
  });
  await Promise.all(servers.splice(0).map((server) => server.stop()));
  delete process.env.NYX_LOCAL_GATEWAY_TOKEN;
});

describe("Local communication foundation", () => {
  it("accepts a valid authenticated handshake", async () => {
    const server = await createServer();
    const { response } = await handshake(server);

    expect(response).toMatchObject({
      type: "local.handshake.accepted",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      instanceId: "local-test-instance"
    });
    expect(server.registry.get("local-test-instance")?.status).toBe("connected");
  });

  it("rejects an invalid token with a structured error", async () => {
    const server = await createServer();
    const { response } = await handshake(server, { token: randomUUID() });

    expect(response).toMatchObject({
      type: "local.error",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      error: { code: "AUTHENTICATION_FAILED", retryable: false }
    });
    expect(server.registry.list()).toHaveLength(0);
  });

  it("rejects an incompatible protocol version with a structured error", async () => {
    const server = await createServer();
    const { response } = await handshake(server, { protocolVersion: "0.0" });

    expect(response).toMatchObject({
      type: "local.error",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      error: {
        code: "INCOMPATIBLE_PROTOCOL_VERSION",
        details: { supportedProtocolVersion: LOCAL_PROTOCOL_VERSION }
      }
    });
  });

  it("records heartbeat and disconnects a stale instance", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const heartbeatListener = jest.fn();
    events.on("local.heartbeat.received", heartbeatListener);
    const server = await createServer({
      events,
      heartbeatTimeoutMs: 100,
      heartbeatCheckIntervalMs: 10
    });
    const { client } = await handshake(server);
    const beforeHeartbeat = server.registry.get("local-test-instance")?.lastHeartbeatAt;

    await new Promise((resolve) => setTimeout(resolve, 20));
    client.send(
      JSON.stringify({
        type: "local.heartbeat",
        protocolVersion: LOCAL_PROTOCOL_VERSION,
        instanceId: "local-test-instance",
        sentAt: new Date().toISOString()
      })
    );
    await waitFor(() => heartbeatListener.mock.calls.length === 1);

    expect(server.registry.get("local-test-instance")?.lastHeartbeatAt).not.toBe(beforeHeartbeat);
    await waitForClose(client);
    await waitFor(() => server.registry.get("local-test-instance")?.status === "disconnected");
    expect(server.registry.get("local-test-instance")?.status).toBe("disconnected");
  });

  it.each([
    ["code", { code: "SKILL_NOT_FOUND", message: "failed", retryable: false }],
    ["message", { code: "REMOTE_COMMAND_FAILED", message: 42, retryable: false }],
    ["retryable", { code: "REMOTE_COMMAND_FAILED", message: "failed", retryable: "no" }],
    ["details", { code: "REMOTE_COMMAND_FAILED", message: "failed", retryable: false, details: [] }]
  ])("rejects a command result with invalid error.%s", async (_field, error) => {
    const server = await createServer();
    const { client } = await handshake(server);
    const responsePromise = nextMessage(client);

    client.send(JSON.stringify({
      type: "local.command.result",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      requestId: "request-invalid",
      instanceId: "local-test-instance",
      capabilityId: "local.echo",
      success: false,
      error
    }));

    await expect(responsePromise).resolves.toMatchObject({
      type: "local.error",
      error: { code: "INVALID_MESSAGE", retryable: false }
    });
  });

  it.each([
    ["failed result without error", { success: false }],
    ["successful result with error", {
      success: true,
      error: { code: "REMOTE_COMMAND_FAILED", message: "failed", retryable: false }
    }]
  ])("rejects an incoherent %s envelope", async (_name, outcome) => {
    const server = await createServer();
    const { client } = await handshake(server);
    const responsePromise = nextMessage(client);

    client.send(JSON.stringify({
      type: "local.command.result",
      protocolVersion: LOCAL_PROTOCOL_VERSION,
      requestId: "request-invalid",
      instanceId: "local-test-instance",
      capabilityId: "local.echo",
      ...outcome
    }));

    await expect(responsePromise).resolves.toMatchObject({
      type: "local.error",
      error: { code: "INVALID_MESSAGE", retryable: false }
    });
  });

  it("registers a remote capability and completes a real Tool Calling round-trip", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const runtime = new NyxRuntime(undefined, {
      events,
      registerBaseAutomations: false,
      registerBaseCapabilities: false,
      registerBasePlugins: false,
      registerBaseServices: false,
      registerBaseTools: false,
      registerLocalGateway: true,
      localGatewayOptions: { port: 0 },
      localCommandTimeoutMs: 500
    });

    await runtime.start();
    const server = runtime.getLocalGateway();
    expect(server).not.toBeNull();
    if (!server) {
      throw new Error("Gateway was not created by runtime");
    }
    servers.push(server);

    const { client } = await handshake(server);
    client.on("message", (raw) => {
      const request = JSON.parse(raw.toString()) as LocalCommandRequest;
      if (request.type === "local.command.request") {
        client.send(
          JSON.stringify({
            type: "local.command.result",
            protocolVersion: LOCAL_PROTOCOL_VERSION,
            requestId: request.requestId,
            instanceId: request.instanceId,
            capabilityId: request.capabilityId,
            success: true,
            result: { echoed: request.input }
          })
        );
      }
    });
    announceEcho(client);
    await waitFor(() => runtime.getTools().isAvailable("local.echo"));

    const execution = await runtime.getTools().execute("local.echo", { message: "health" });

    expect(execution.status).toBe("success");
    expect(execution.result).toEqual({ echoed: { message: "health" } });
    expect(runtime.getCapabilities().get("local.echo")?.metadata).toMatchObject({
      remote: true,
      localInstanceId: "local-test-instance"
    });
    await runtime.stop();
  });

  it("settles a command with a structured timeout error", async () => {
    const { bridge, runtime, server } = await createHarness();
    const { client } = await handshake(server);
    announceEcho(client);
    await waitFor(() => runtime.getCapabilities().isAvailable("local.echo"));

    await expect(
      bridge.execute("local-test-instance", "local.echo", { message: "timeout" }, { timeoutMs: 30 })
    ).rejects.toMatchObject({ code: "COMMAND_TIMEOUT", retryable: true });
  });

  it("settles a pending command on disconnect without crashing the runtime", async () => {
    const { bridge, runtime, server } = await createHarness(1_000);
    const { client } = await handshake(server);
    announceEcho(client);
    await waitFor(() => runtime.getCapabilities().isAvailable("local.echo"));

    const requestReceived = new Promise<void>((resolve) => {
      client.once("message", (raw) => {
        const message = JSON.parse(raw.toString()) as LocalCommandRequest;
        if (message.type === "local.command.request") {
          resolve();
        }
      });
    });
    const command = bridge.execute("local-test-instance", "local.echo", { message: "disconnect" });
    await requestReceived;
    client.terminate();

    await expect(command).rejects.toBeInstanceOf(LocalGatewayError);
    await expect(command).rejects.toMatchObject({ code: "CONNECTION_CLOSED", retryable: true });
    expect(runtime.getSnapshot().status).toBe("created");
  });
});
