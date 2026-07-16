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
  coverage: {
    provider: "v8" as const,
    reporter: ["text", "html"] as ["text", "html"],
    // `all: true` + `include` forcent le rapport à lister aussi les fichiers
    // jamais importés par un test (ex. un composant sans spec) à 0 %, plutôt
    // que de les omettre silencieusement — sans ça la couverture affichée ne
    // reflète que les fichiers déjà testés et cache les vrais trous.
    all: true,
    include: ["src/**/*.ts", "src/**/*.tsx"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.strapi/**",
      "**/.cache/**",
      "**/.tmp/**",
      "**/.next/**",
      "**/*.config.*",
      "**/*.{test,spec}.ts",
      "**/*.{test,spec}.tsx",
      "**/types/**",
      "**/types.ts",
    ],
  },
};
