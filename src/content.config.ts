import * as path from "path";

import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

import {
  NgtscProgram,
  createCompilerHost,
  type CompilerOptions,
} from "@angular/compiler-cli";
import ts from "typescript";

const reference = defineCollection({
  loader: (): { id: string }[] => {
    const config: CompilerOptions = {
      rootDir: ".",
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strictNullChecks: true,
      skipLibCheck: true,
      module: ts.ModuleKind.ES2022,
    };

    const compilerHost = createCompilerHost({ options: config });

    const program = new NgtscProgram(
      [path.resolve("src/content/docs/guides/example.component.ts")],
      config,
      compilerHost,
    );

    const { entries, symbols } = program.getApiDocumentation(
      path.resolve("src/content/docs/guides/example.component.ts"),
      new Set(),
    );

    const docEntries: { id: string; [key: string]: unknown }[] = entries.map(
      (entry) => ({
        id: "prefix/" + entry.name,
        ...entry,
      }),
    );

    const links: Record<string, string> = {};

    const angularPrefix = "@angular/";

    for (const [k, v] of symbols) {
      const baseUrl = v.startsWith(angularPrefix)
        ? "https://angular.dev/api/" + v.slice(angularPrefix.length)
        : v;

      links[k] = baseUrl + "/" + k;
    }

    docEntries.push({
      id: "__symbols",
      symbols: links,
    });

    return docEntries;
  },
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  reference,
};
