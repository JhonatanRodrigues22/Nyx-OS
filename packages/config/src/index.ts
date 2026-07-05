export type NyxEnvironment = "development" | "test" | "production" | "local";

export type NyxModuleId = "core" | "events" | "dashboard" | "memory" | "automation" | "ai";

export type NyxConfig = {
  appName: string;
  version: string;
  environment: NyxEnvironment;
  enabledModules: NyxModuleId[];
  featureFlags: {
    useMockData: boolean;
    enablePersistentMemory: boolean;
    enableAutomation: boolean;
    enableAiRuntime: boolean;
  };
};

function resolveEnvironment(value: string | undefined): NyxEnvironment {
  if (value === "production" || value === "test" || value === "local") {
    return value;
  }

  return "development";
}

export function getNyxConfig(): NyxConfig {
  return {
    appName: "Nyx OS",
    version: "0.1.0",
    environment: resolveEnvironment(process.env.NYX_ENV ?? process.env.NODE_ENV),
    enabledModules: ["core", "events", "dashboard"],
    featureFlags: {
      useMockData: true,
      enablePersistentMemory: false,
      enableAutomation: false,
      enableAiRuntime: false
    }
  };
}
