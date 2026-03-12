// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import analogjsangular from "@analogjs/astro-angular";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "never",
  experimental: {
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, handler) {
          // if (
          //   // re-exports can cause this, as well as angular decorators because they are erased by the angular compiler.
          //   warning.code === "UNUSED_EXTERNAL_IMPORT" ||
          //   // Don't care about sourcemap issues with dependencies: css-selector-parser triggers this when not hoisted :shrug:
          //   (warning.code === "SOURCEMAP_ERROR" &&
          //     warning.id?.includes("node_modules/.pnpm/"))
          // ) {
          //   return;
          // }
          handler(warning);
        },
      },
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
});
