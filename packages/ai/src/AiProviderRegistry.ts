import type { AiProvider } from "./AiTypes";

export class AiProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();
  private activeProviderName: string | null = null;

  register(name: string, provider: AiProvider): void {
    if (this.providers.has(name)) {
      throw new Error(`AI provider already registered: ${name}`);
    }

    this.providers.set(name, provider);

    if (!this.activeProviderName) {
      this.activeProviderName = name;
    }
  }

  setActive(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`AI provider not registered: ${name}`);
    }

    this.activeProviderName = name;
  }

  get(name: string): AiProvider | undefined {
    return this.providers.get(name);
  }

  getActive(): AiProvider {
    if (!this.activeProviderName) {
      throw new Error("No active AI provider registered");
    }

    const provider = this.providers.get(this.activeProviderName);

    if (!provider) {
      throw new Error(`AI provider not registered: ${this.activeProviderName}`);
    }

    return provider;
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }

  getActiveName(): string | null {
    return this.activeProviderName;
  }
}
