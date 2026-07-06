import type { NyxCapability } from "./Capability";
import type { CapabilityCategory, CapabilitySnapshot } from "./CapabilityTypes";

function toSnapshot(capability: NyxCapability): CapabilitySnapshot {
  return {
    id: capability.id,
    name: capability.name,
    description: capability.description,
    version: capability.version,
    category: capability.category,
    tags: [...capability.tags],
    enabled: capability.enabled,
    metadata: { ...capability.metadata }
  };
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, NyxCapability>();

  register(capability: NyxCapability): CapabilitySnapshot {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability already registered: ${capability.id}`);
    }

    this.capabilities.set(capability.id, capability);

    return toSnapshot(capability);
  }

  remove(id: string): CapabilitySnapshot {
    const capability = this.require(id);
    const snapshot = toSnapshot(capability);

    this.capabilities.delete(id);

    return snapshot;
  }

  get(id: string): NyxCapability | undefined {
    return this.capabilities.get(id);
  }

  list(): CapabilitySnapshot[] {
    return Array.from(this.capabilities.values()).map(toSnapshot);
  }

  findByCategory(category: CapabilityCategory): CapabilitySnapshot[] {
    return this.list().filter((capability) => capability.category === category);
  }

  isAvailable(id: string): boolean {
    return this.capabilities.get(id)?.enabled ?? false;
  }

  require(id: string): NyxCapability {
    const capability = this.capabilities.get(id);

    if (!capability) {
      throw new Error(`Capability not registered: ${id}`);
    }

    return capability;
  }
}
