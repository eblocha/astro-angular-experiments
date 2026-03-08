import * as path from "path";

import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

import workerpool from "workerpool";
import { type DocEntry, type CompilerOptions } from "@angular/compiler-cli";
import ts from "typescript";

const reference = defineCollection({
  loader: async (): Promise<{ id: string }[]> => {
    const config: CompilerOptions = {
      rootDir: ".",
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strictNullChecks: true,
      skipLibCheck: true,
      module: ts.ModuleKind.ES2022,
    };

    const entryPoints = [
      path.resolve("src/content/docs/guides/example.component.ts"),
      path.resolve("src/content/docs/guides/other.component.ts"),
    ];

    const pool = workerpool.pool("./src/worker.ts", { maxWorkers: 4 });

    const promises: Promise<{
      entries: DocEntry[];
      links: Record<string, string>;
    }>[] = [];

    for (const entry of entryPoints) {
      promises.push(
        pool.proxy().then((worker) =>
          worker.getApiDocumentation({
            path: entry,
            compilerOptions: config,
          }),
        ),
      );
    }

    const results = await Promise.all(promises);

    await pool.terminate();

    const docEntries: { id: string; [key: string]: unknown }[] =
      results.flatMap((result) =>
        result.entries.map((entry) => ({
          id: "prefix/" + entry.name,
          ...entry,
        })),
      );

    // TODO merge links
    docEntries.push({
      id: "__symbols",
      symbols: results[0].links,
    });

    return docEntries;
  },
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  reference,
};
