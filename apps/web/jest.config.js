const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@nyx-os/ai$": "<rootDir>/../../packages/ai/src/index.ts",
    "^@nyx-os/automation$": "<rootDir>/../../packages/automation/src/index.ts",
    "^@nyx-os/capabilities$": "<rootDir>/../../packages/capabilities/src/index.ts",
    "^@nyx-os/config$": "<rootDir>/../../packages/config/src/index.ts",
    "^@nyx-os/context$": "<rootDir>/../../packages/context/src/index.ts",
    "^@nyx-os/core$": "<rootDir>/../../packages/core/src/index.ts",
    "^@nyx-os/database$": "<rootDir>/../../packages/database/src/index.ts",
    "^@nyx-os/event-bus$": "<rootDir>/../../packages/event-bus/src/index.ts",
    "^@nyx-os/knowledge$": "<rootDir>/../../packages/knowledge/src/index.ts",
    "^@nyx-os/logger$": "<rootDir>/../../packages/logger/src/index.ts",
    "^@nyx-os/local-gateway$": "<rootDir>/../../packages/local-gateway/src/index.ts",
    "^@nyx-os/memory$": "<rootDir>/../../packages/memory/src/index.ts",
    "^@nyx-os/personal-data$": "<rootDir>/../../packages/personal-data/src/index.ts",
    "^@nyx-os/plugin$": "<rootDir>/../../packages/plugin/src/index.ts",
    "^@nyx-os/prompt$": "<rootDir>/../../packages/prompt/src/index.ts",
    "^@nyx-os/scheduler$": "<rootDir>/../../packages/scheduler/src/index.ts",
    "^@nyx-os/state$": "<rootDir>/../../packages/state/src/index.ts",
    "^@nyx-os/tools$": "<rootDir>/../../packages/tools/src/index.ts",
    "^@nyx-os/workflow$": "<rootDir>/../../packages/workflow/src/index.ts"
  },
  transformIgnorePatterns: ["/node_modules/(?!@nyx-os/)"]
};

module.exports = createJestConfig(customJestConfig);
