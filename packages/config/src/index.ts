export type NyxEnvironment = "development" | "test" | "production" | "local";

export type NyxModuleId = "core" | "events" | "dashboard" | "memory" | "automation" | "ai";

export type NyxConfig = {
  appName: string;
  version: string;
  environment: NyxEnvironment;
  enabledModules: NyxModuleId[];
  ai: {
    provider: string;
    model: string;
    apiKey?: string;
  };
  featureFlags: {
    useMockData: boolean;
    enablePersistentMemory: boolean;
    enableAutomation: boolean;
    enableAiRuntime: boolean;
  };
};

export type NyxConfigEnvironment = Partial<Record<string, string | undefined>>;

function resolveEnvironment(value: string | undefined): NyxEnvironment {
  if (value === "production" || value === "test" || value === "local") {
    return value;
  }

  return "development";
}

function resolveBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallback;
}

function resolveEnabledModules(value: string | undefined): NyxModuleId[] {
  const fallback: NyxModuleId[] = ["core", "events", "dashboard"];

  if (!value) {
    return fallback;
  }

  const allowedModules: NyxModuleId[] = ["core", "events", "dashboard", "memory", "automation", "ai"];
  const modules = value
    .split(",")
    .map((module) => module.trim())
    .filter((module): module is NyxModuleId => allowedModules.includes(module as NyxModuleId));

  return modules.length > 0 ? modules : fallback;
}

export function getNyxConfig(env: NyxConfigEnvironment = process.env): NyxConfig {
  return {
    appName: env.NYX_APP_NAME || "Nyx OS",
    version: env.NYX_VERSION || "0.1.0",
    environment: resolveEnvironment(env.NYX_ENV ?? env.NODE_ENV),
    enabledModules: resolveEnabledModules(env.NYX_ENABLED_MODULES),
    ai: {
      provider: env.NYX_AI_PROVIDER || "anthropic",
      model: env.NYX_AI_MODEL || "claude-3-5-sonnet-latest",
      apiKey: env.ANTHROPIC_API_KEY
    },
    featureFlags: {
      useMockData: resolveBoolean(env.NYX_USE_MOCK_DATA, true),
      enablePersistentMemory: resolveBoolean(env.NYX_ENABLE_PERSISTENT_MEMORY, false),
      enableAutomation: resolveBoolean(env.NYX_ENABLE_AUTOMATION, false),
      enableAiRuntime: resolveBoolean(env.NYX_ENABLE_AI_RUNTIME, false)
    }
  };
}
