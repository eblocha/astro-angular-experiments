import { ecLinks } from "./src/ec-links/plugin.ts";
import ecTwoSlash from "expressive-code-twoslash";
import ts from "typescript";

export default {
  plugins: [
    ecLinks(),
    ecTwoSlash({
      twoslashOptions: {
        compilerOptions: {
          experimentalDecorators: true,
          lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
          moduleResolution: ts.ModuleResolutionKind.Bundler,
        },
        tsModule: ts,
      },
    }),
  ],
};
