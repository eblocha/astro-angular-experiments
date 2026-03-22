// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import analogjsangular from "@analogjs/astro-angular";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "never",
  base: 'dist',
  experimental: {
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },
  integrations: [
    starlight({
      lastUpdated: true,
      title: "My Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          autogenerate: {
            directory: "guides",
          },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
          collapsed: true,
        },
      ],
      expressiveCode: {},
      customCss: ["./src/global.css"],
      components: {
        Search: './src/components/search.astro'
      }
    }),
    analogjsangular({
      vite: {
        transformFilter: (_code, id) => {
          return (
            !id.endsWith("content.config.ts") &&
            !id.includes(".astro") &&
            id.endsWith(".ts")
          );
        },
        tsconfig: "./tsconfig.app.json",
      },
    }),
  ],
  vite: {
    plugins: [
      {
        name: 'analogjs-astro-client-ngservermode',
        configEnvironment(name) {
          if (name === 'client') {
            return {
              define: {
                ngServerMode: 'false',
              },
            };
          }

          return undefined;
        },
      },
    ]
  }
});
