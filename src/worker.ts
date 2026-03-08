import {
  NgtscProgram,
  createCompilerHost,
  type CompilerOptions,
  type DocEntry,
} from "@angular/compiler-cli";
import workerpool from "workerpool";

function getApiDocumentation(config: {
  compilerOptions: CompilerOptions;
  path: string;
}): { entries: DocEntry[]; links: Record<string, string> } {
  const compilerHost = createCompilerHost({ options: config.compilerOptions });

  const program = new NgtscProgram([config.path], config, compilerHost);

  const { entries, symbols } = program.getApiDocumentation(config.path, new Set());

  const links: Record<string, string> = {};

  const angularPrefix = "@angular/";

  for (const [k, v] of symbols) {
    const baseUrl = v.startsWith(angularPrefix)
      ? "https://angular.dev/api/" + v.slice(angularPrefix.length)
      : v;

    links[k] = baseUrl + "/" + k;
  }

  return { entries, links };
}

workerpool.worker({ getApiDocumentation });
