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
    "^@nyx-os/events$": "<rootDir>/../../packages/events/src/index.ts"
  }
};

module.exports = createJestConfig(customJestConfig);
