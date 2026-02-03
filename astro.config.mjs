// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import analogjsangular from "@analogjs/astro-angular";

// https://astro.build/config
export default defineConfig({
  integrations: [
    analogjsangular({
      vite: {
        transformFilter: (_code, id) => {
          return id.endsWith("component.ts");
        },
      },
    }),
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
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
