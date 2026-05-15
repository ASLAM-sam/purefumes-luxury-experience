export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  setupFiles: ["<rootDir>/tests/env.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
