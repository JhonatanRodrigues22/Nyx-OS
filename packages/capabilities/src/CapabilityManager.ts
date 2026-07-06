import type { NyxEventBus, NyxSystemEvents } from "@nyx-os/event-bus";
import type { NyxCapability } from "./Capability";
import type { CapabilityContext } from "./CapabilityContext";
import { emitCapabilityEvent } from "./CapabilityEvents";
import { CapabilityExecutor } from "./CapabilityExecutor";
import { CapabilityRegistry } from "./CapabilityRegistry";
import type { CapabilityCategory, CapabilityExecution, CapabilitySnapshot } from "./CapabilityTypes";

export type CapabilityManagerOptions = {
  events: NyxEventBus<NyxSystemEvents>;
  createContext: () => CapabilityContext;
  registry?: CapabilityRegistry;
  executor?: CapabilityExecutor;
};

export interface NyxCapabilityManager {
  register(capability: NyxCapability): CapabilitySnapshot;
  remove(id: string): CapabilitySnapshot;
  get(id: string): NyxCapability | undefined;
  list(): CapabilitySnapshot[];
  findByCategory(category: CapabilityCategory): CapabilitySnapshot[];
  isAvailable(id: string): boolean;
  execute<TResult = unknown, TInput = unknown>(id: string, input?: TInput): Promise<CapabilityExecution<TResult>>;
}

export class CapabilityManager implements NyxCapabilityManager {
  private readonly events: NyxEventBus<NyxSystemEvents>;
  private readonly createContext: () => CapabilityContext;
  private readonly registry: CapabilityRegistry;
  private readonly executor: CapabilityExecutor;

  constructor(options: CapabilityManagerOptions) {
    this.events = options.events;
    this.createContext = options.createContext;
    this.registry = options.registry ?? new CapabilityRegistry();
    this.executor = options.executor ?? new CapabilityExecutor({ events: options.events });
  }

  register(capability: NyxCapability): CapabilitySnapshot {
    const snapshot = this.registry.register(capability);

    emitCapabilityEvent(this.events, "capability.registered", { capability: snapshot });

    return snapshot;
  }

  remove(id: string): CapabilitySnapshot {
    const snapshot = this.registry.remove(id);

    emitCapabilityEvent(this.events, "capability.removed", { capability: snapshot });

    return snapshot;
  }

  get(id: string): NyxCapability | undefined {
    return this.registry.get(id);
  }

  list(): CapabilitySnapshot[] {
    return this.registry.list();
  }

  findByCategory(category: CapabilityCategory): CapabilitySnapshot[] {
    return this.registry.findByCategory(category);
  }

  isAvailable(id: string): boolean {
    return this.registry.isAvailable(id);
  }

  execute<TResult = unknown, TInput = unknown>(id: string, input?: TInput): Promise<CapabilityExecution<TResult>> {
    const capability = this.registry.require(id) as NyxCapability<TInput, TResult>;

    return this.executor.execute(capability, this.createContext(), input);
  }
}
