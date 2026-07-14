// Base Vitest settings shared by every workspace package's vitest.config.ts.
export const sharedTestConfig = {
  environment: "node" as const,
  exclude: [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.strapi/**",
    "**/.cache/**",
    "**/.tmp/**",
    "**/.next/**",
  ],
};
