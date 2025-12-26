import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const ignores = ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**", "**/.turbo/**"];

const nextScopedToWeb = nextCoreWebVitals.map((config) => {
  const files =
    config.files?.map((pattern) => `apps/web/${pattern}`) ??
    ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts,cts}"];

  const ignoresForWeb = config.ignores?.map((pattern) => `apps/web/${pattern}`);

  return {
    ...config,
    files,
    ...(ignoresForWeb ? { ignores: ignoresForWeb } : {})
  };
});

export default [
  { ignores },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error"
    }
  },
  ...nextScopedToWeb
];


