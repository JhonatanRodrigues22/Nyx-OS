import type { NyxStateService } from "@nyx-os/state";
import type { ContextContribution, ContextSource } from "./ContextTypes";

export type RuntimeStateContextSourceOptions = {
  state: NyxStateService;
  priority?: number;
};

export class RuntimeStateContextSource implements ContextSource {
  readonly name = "runtime-state";
  private readonly state: NyxStateService;
  private readonly priority: number;

  constructor(options: RuntimeStateContextSourceOptions) {
    this.state = options.state;
    this.priority = options.priority ?? 100;
  }

  async collect(): Promise<ContextContribution> {
    const runtime = this.state.getRuntimeState();
    const runningServices = runtime.services.filter((service) => service.status === "running").length;
    const failedServices = runtime.services.filter((service) => service.status === "failed").length;
    const services = runtime.services
      .map((service) => `${service.name}:${service.status}:${service.health}`)
      .join(", ");

    return {
      sourceName: this.name,
      priority: this.priority,
      content: [
        `Runtime status: ${runtime.status}`,
        `Environment: ${runtime.environment}`,
        `Version: ${runtime.version}`,
        `Services running: ${runningServices}/${runtime.services.length}`,
        `Services failed: ${failedServices}`,
        `Services: ${services || "none"}`
      ].join("\n")
    };
  }
}
