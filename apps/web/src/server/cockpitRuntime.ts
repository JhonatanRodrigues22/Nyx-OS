import { PromptRegistry, PromptRenderer } from "@nyx-os/prompt";
import { createNyxEventPayload, type NyxEventPayload, type NyxSystemEventName } from "@nyx-os/event-bus";
import { NyxRuntime } from "@nyx-os/core";

export type CockpitRuntimeHandle = {
  runtime: NyxRuntime;
  ready: Promise<void>;
};

let cockpitRuntime: CockpitRuntimeHandle | null = null;

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
  if (!cockpitRuntime) {
    const runtime = new NyxRuntime(undefined, {
      registerAiRuntime: true
    });

    cockpitRuntime = {
      runtime,
      ready: runtime.start()
    };
  }

  return cockpitRuntime;
}

export function resetCockpitRuntimeForTests(): void {
  cockpitRuntime = null;
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
