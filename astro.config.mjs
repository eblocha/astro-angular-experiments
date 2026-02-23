// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import analogjsangular from "@analogjs/astro-angular";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "never",
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
          return !id.endsWith("content.config.ts") && id.endsWith(".ts");
        },
      },
    }),
  ],
});
