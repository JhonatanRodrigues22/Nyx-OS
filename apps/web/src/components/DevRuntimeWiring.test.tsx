import fs from "node:fs";
import path from "node:path";
import type { DashboardSnapshot } from "@nyx-os/core";
import { createDashboardSnapshot } from "@nyx-os/core";
import { render, screen, waitFor } from "@testing-library/react";
import type { NextApiRequest, NextApiResponse } from "next";
import DevDashboard from "@/pages/dev";
import { devSnapshotHandler } from "@/pages/api/dev/snapshot";
import { register } from "@/instrumentation";
import {
  getCockpitRuntime,
  resetCockpitRuntimeForTests,
  stopCockpitRuntimeForTests
} from "@/server/cockpitRuntime";

jest.mock("ws", () => {
  class MockWebSocketServer {
    readonly clients = new Set();
    private readonly port: number;

    constructor(options: { port?: number }) {
      this.port = options.port === 0 ? 4789 : (options.port ?? 4789);
    }

    on() {
      return this;
    }

    once(event: string, listener: () => void) {
      if (event === "listening") {
        setTimeout(listener, 0);
      }

      return this;
    }

    off() {
      return this;
    }

    close(listener: () => void) {
      listener();
    }

    address() {
      return {
        address: "127.0.0.1",
        family: "IPv4",
        port: this.port
      };
    }
  }

  return {
    __esModule: true,
    default: class MockWebSocket {},
    WebSocketServer: MockWebSocketServer
  };
});

type MockResponse = NextApiResponse & {
  statusCodeValue: number;
  jsonPayload: unknown;
  headers: Record<string, string | number | readonly string[]>;
};

const originalFetch = global.fetch;
const originalEnableLocalGateway = process.env.NYX_ENABLE_LOCAL_GATEWAY;
const originalToken = process.env.NYX_LOCAL_GATEWAY_TOKEN;
const originalPort = process.env.NYX_LOCAL_GATEWAY_PORT;

function createResponse(): MockResponse {
  const response = {
    statusCodeValue: 200,
    jsonPayload: undefined,
    headers: {},
    setHeader(name: string, value: string | number | readonly string[]) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCodeValue = code;
      return this;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this;
    },
    end() {
      return this;
    }
  };

  return response as MockResponse;
}

async function resetEnvAndRuntime() {
  await stopCockpitRuntimeForTests();
  process.env.NYX_ENABLE_LOCAL_GATEWAY = originalEnableLocalGateway;
  process.env.NYX_LOCAL_GATEWAY_TOKEN = originalToken;
  process.env.NYX_LOCAL_GATEWAY_PORT = originalPort;
  global.fetch = originalFetch;
}

beforeEach(async () => {
  await resetEnvAndRuntime();
});

afterEach(async () => {
  await resetEnvAndRuntime();
});

describe("Dev Runtime Wiring", () => {
  it("keeps the Local Gateway disabled by default", async () => {
    delete process.env.NYX_ENABLE_LOCAL_GATEWAY;
    delete process.env.NYX_LOCAL_GATEWAY_TOKEN;
    delete process.env.NYX_LOCAL_GATEWAY_PORT;
    resetCockpitRuntimeForTests();

    const handle = getCockpitRuntime();

    await handle.ready;

    expect(handle.runtime.getSnapshot().localGateway).toEqual({
      enabled: false,
      instances: []
    });
    expect(handle.runtime.getLocalGateway()).toBeNull();
  });

  it("enables the Local Gateway from environment variables", async () => {
    process.env.NYX_ENABLE_LOCAL_GATEWAY = "true";
    process.env.NYX_LOCAL_GATEWAY_TOKEN = "test-token";
    process.env.NYX_LOCAL_GATEWAY_PORT = "0";
    resetCockpitRuntimeForTests();

    const handle = getCockpitRuntime();

    await handle.ready;

    expect(handle.runtime.getSnapshot().localGateway.enabled).toBe(true);
    expect(handle.runtime.getLocalGateway()?.getAddress().port).toBeGreaterThan(0);
  });

  it("starts the server runtime during Next instrumentation when enabled", async () => {
    process.env.NYX_ENABLE_LOCAL_GATEWAY = "true";
    process.env.NYX_LOCAL_GATEWAY_TOKEN = "test-token";
    process.env.NYX_LOCAL_GATEWAY_PORT = "0";
    resetCockpitRuntimeForTests();

    await register();

    const handle = getCockpitRuntime();

    await handle.ready;

    expect(handle.runtime.getSnapshot().localGateway.enabled).toBe(true);
  });

  it("fails clearly when the Local Gateway is enabled without a token", () => {
    process.env.NYX_ENABLE_LOCAL_GATEWAY = "true";
    delete process.env.NYX_LOCAL_GATEWAY_TOKEN;
    process.env.NYX_LOCAL_GATEWAY_PORT = "0";
    resetCockpitRuntimeForTests();

    expect(() => getCockpitRuntime()).toThrow("NYX_ENABLE_LOCAL_GATEWAY=true requires NYX_LOCAL_GATEWAY_TOKEN.");
  });

  it("returns a server-side dev snapshot with localGateway", async () => {
    process.env.NYX_ENABLE_LOCAL_GATEWAY = "true";
    process.env.NYX_LOCAL_GATEWAY_TOKEN = "test-token";
    process.env.NYX_LOCAL_GATEWAY_PORT = "0";
    resetCockpitRuntimeForTests();
    const response = createResponse();

    await devSnapshotHandler({ method: "GET" } as NextApiRequest, response);

    expect(response.statusCodeValue).toBe(200);
    expect(response.jsonPayload).toMatchObject({
      snapshot: {
        localGateway: {
          enabled: true,
          instances: []
        }
      }
    });
  });

  it("updates /dev from the server-side snapshot API", async () => {
    const initial = createDashboardSnapshot();
    const nextSnapshot: DashboardSnapshot = {
      ...initial,
      localGateway: {
        enabled: true,
        instances: [
          {
            id: "nyx-local-test",
            platform: "windows",
            version: "0.1.0",
            status: "connected",
            connectedAt: "2026-07-16T00:00:00.000Z",
            lastHeartbeatAt: "2026-07-16T00:00:10.000Z",
            capabilities: [
              {
                id: "local.echo",
                name: "Local Echo",
                description: "Echo capability",
                version: "0.1.0"
              }
            ]
          }
        ]
      }
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ snapshot: nextSnapshot })
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<DevDashboard snapshot={initial} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/dev/snapshot"));
    await screen.findByText("nyx-local-test");
    expect(screen.getByText("local.echo")).toBeInTheDocument();
  });

  it("does not instantiate NyxRuntime in the browser dev page", () => {
    const devPageSource = fs.readFileSync(path.join(process.cwd(), "src/pages/dev.tsx"), "utf8");

    expect(devPageSource).not.toContain("new NyxRuntime");
    expect(devPageSource).toContain("/api/dev/snapshot");
  });
});
