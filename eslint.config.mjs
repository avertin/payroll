import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    rules: {
      // Prevent functional errors: unused variables
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Prevent accidental equality with null/undefined
      "no-eq-null": "error",
      eqeqeq: ["error", "always"],
      // Prevent unreachable code
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
      // Prevent constant conditions (likely bugs)
      "no-constant-condition": "warn",
      // Prevent duplicate keys in objects
      "no-dupe-keys": "error",
      // Prevent invalid typeof comparison
      "valid-typeof": "error",
      // Prefer const when variable is not reassigned
      "prefer-const": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
