import { PromptRegistry, PromptRenderer } from "@nyx-os/prompt";
import { createNyxEventPayload, type NyxEventPayload, type NyxSystemEventName } from "@nyx-os/event-bus";
import { NyxRuntime } from "@nyx-os/core";

export type CockpitRuntimeHandle = {
  runtime: NyxRuntime;
  ready: Promise<void>;
};

let cockpitRuntime: CockpitRuntimeHandle | null = null;
const globalForCockpitRuntime = globalThis as typeof globalThis & {
  __nyxCockpitRuntime?: CockpitRuntimeHandle | null;
};

function isEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function resolveLocalGatewayOptions() {
  if (!isEnabled(process.env.NYX_ENABLE_LOCAL_GATEWAY)) {
    return {
      registerLocalGateway: false
    };
  }

  if (!process.env.NYX_LOCAL_GATEWAY_TOKEN) {
    throw new Error("NYX_ENABLE_LOCAL_GATEWAY=true requires NYX_LOCAL_GATEWAY_TOKEN.");
  }

  const port = process.env.NYX_LOCAL_GATEWAY_PORT ? Number(process.env.NYX_LOCAL_GATEWAY_PORT) : 4789;

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("NYX_LOCAL_GATEWAY_PORT must be a valid TCP port.");
  }

  return {
    registerLocalGateway: true,
    localGatewayOptions: {
      port
    }
  };
}

export const cockpitObservedEvents: NyxSystemEventName[] = [
  "tool.executed",
  "tool.failed",
  "automation.executed",
  "automation.failed",
  "workflow.started",
  "workflow.step.completed",
  "workflow.paused",
  "workflow.resumed",
  "workflow.failed",
  "workflow.completed"
];

export function getCockpitRuntime(): CockpitRuntimeHandle {
  cockpitRuntime = globalForCockpitRuntime.__nyxCockpitRuntime ?? cockpitRuntime;

  if (!cockpitRuntime) {
    const runtime = new NyxRuntime(undefined, {
      registerAiRuntime: true,
      ...resolveLocalGatewayOptions()
    });

    cockpitRuntime = {
      runtime,
      ready: runtime.start()
    };
    globalForCockpitRuntime.__nyxCockpitRuntime = cockpitRuntime;
  }

  return cockpitRuntime;
}

export function resetCockpitRuntimeForTests(): void {
  cockpitRuntime = null;
  globalForCockpitRuntime.__nyxCockpitRuntime = null;
}

export async function stopCockpitRuntimeForTests(): Promise<void> {
  const handle = globalForCockpitRuntime.__nyxCockpitRuntime ?? cockpitRuntime;
  cockpitRuntime = null;
  globalForCockpitRuntime.__nyxCockpitRuntime = null;

  if (handle) {
    await handle.runtime.stop();
  }
}

export function createCockpitSystemPrompt(): string {
  const registry = new PromptRegistry();
  const renderer = new PromptRenderer();

  registry.register({
    id: "nyx.cockpit.system",
    version: "1.0.0",
    description: "System prompt for the Nyx personal cockpit interaction layer.",
    template:
      "Voce e Nyx OS no cockpit pessoal do JJ. Responda em portugues do Brasil, seja direta, cuidadosa com dados pessoais e use Tools apenas quando elas forem necessarias. Nunca exponha segredos, chaves de API ou detalhes internos de stack trace.",
    variables: []
  });

  return renderer.render(registry.require("nyx.cockpit.system"));
}

export function createCockpitEventPayload(eventName: NyxSystemEventName, payload?: NyxEventPayload) {
  return {
    id: `${eventName}:${payload?.timestamp ?? new Date().toISOString()}`,
    name: eventName,
    timestamp: payload?.timestamp ?? new Date().toISOString(),
    source: payload?.source ?? payload?.service ?? payload?.task ?? eventName.split(".")[0],
    status: payload?.status ?? "observed",
    metadata: payload?.metadata ?? {}
  };
}

export function emitCockpitSyntheticEvent(runtime: NyxRuntime, name: NyxSystemEventName, metadata: Record<string, unknown>) {
  runtime.getEventBus().emit(
    name,
    createNyxEventPayload({
      source: "cockpit",
      metadata
    })
  );
}
