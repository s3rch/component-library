/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }]
  },
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"]
};


