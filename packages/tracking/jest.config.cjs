/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json", useESM: true }]
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["<rootDir>/test/**/*.test.(ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"]
};







