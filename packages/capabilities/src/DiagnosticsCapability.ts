import type { NyxCapability } from "./Capability";
import type { CapabilityContext } from "./CapabilityContext";

export class DiagnosticsCapability implements NyxCapability<void, { runtime: unknown; services: unknown[] }> {
  readonly id = "diagnostics.runtime";
  readonly name = "Runtime Diagnostics";
  readonly description = "Returns a lightweight diagnostic snapshot from the runtime context.";
  readonly version = "0.1.0";
  readonly category = "diagnostics" as const;
  readonly tags = ["runtime", "diagnostics", "system"];
  readonly enabled = true;
  readonly metadata = {
    internal: true
  };

  execute(context: CapabilityContext): { runtime: unknown; services: unknown[] } {
    return {
      runtime: context.runtime.getRuntimeState?.() ?? null,
      services: context.services.list()
    };
  }
}
