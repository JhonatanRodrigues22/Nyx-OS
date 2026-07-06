import type { NyxTool } from "./Tool";
import type { ToolContext } from "./ToolContext";

export class RuntimeDiagnosticsTool implements NyxTool<void, { runtime: unknown; services: unknown[] }> {
  readonly id = "diagnostics.runtime";
  readonly capabilityId = "diagnostics.runtime";
  readonly name = "Runtime Diagnostics";
  readonly description = "Returns a lightweight runtime diagnostic snapshot.";
  readonly version = "0.1.0";
  readonly category = "diagnostics" as const;
  readonly enabled = true;
  readonly parameters = {};
  readonly result = {
    description: "Runtime state and registered services."
  };
  readonly metadata = {
    internal: true
  };

  execute(context: ToolContext): { runtime: unknown; services: unknown[] } {
    return {
      runtime: context.runtime.getRuntimeState?.() ?? null,
      services: context.services.list()
    };
  }
}
