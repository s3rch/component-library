/** @type {import("jest").Config} */
module.exports = {
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.{ts,tsx,js,jsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/.next/**",
    "!**/coverage/**"
  ]
};


