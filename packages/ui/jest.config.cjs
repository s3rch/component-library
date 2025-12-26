/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  rootDir: ".",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json", useESM: true }]
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@repo/tracking$": "<rootDir>/../tracking/src/index.ts"
  },
  testMatch: ["<rootDir>/src/**/*.test.(ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"]
};


