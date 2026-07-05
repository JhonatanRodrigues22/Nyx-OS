const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@nyx-os/config$": "<rootDir>/../../packages/config/src/index.ts",
    "^@nyx-os/core$": "<rootDir>/../../packages/core/src/index.ts",
    "^@nyx-os/event-bus$": "<rootDir>/../../packages/event-bus/src/index.ts",
    "^@nyx-os/events$": "<rootDir>/../../packages/events/src/index.ts",
    "^@nyx-os/logger$": "<rootDir>/../../packages/logger/src/index.ts",
    "^@nyx-os/state$": "<rootDir>/../../packages/state/src/index.ts"
  }
};

module.exports = createJestConfig(customJestConfig);
