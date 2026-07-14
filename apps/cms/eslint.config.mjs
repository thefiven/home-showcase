import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "build/**", ".strapi/**", ".cache/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Strapi's generated config files use a `({ env }) => ({...})` signature
      // for every config module even when `env` isn't needed by that module.
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    },
  },
);
