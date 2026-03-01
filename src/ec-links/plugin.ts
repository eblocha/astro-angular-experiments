import { type ExpressiveCodePlugin } from "@expressive-code/core";
import ts from "typescript";
import { LinkAnnotation } from "./annotation.ts";

export type ApiEntries = Record<string, string>;

export interface EcLinksCodeBlockProps {
  symbolTable: ApiEntries;
}

declare module "@expressive-code/core" {
  export interface ExpressiveCodeBlockProps extends EcLinksCodeBlockProps {}
}

export function ecLinks(): ExpressiveCodePlugin {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true);

  return {
    name: "ec-links",
    hooks: {
      async performSyntaxAnalysis({ codeBlock }) {
        console.log(await import("astro:content"));

        scanner.setText(codeBlock.code);
        let token = scanner.scan();

        const symbols = codeBlock.props.symbolTable;

        if (
          !symbols ||
          Object.keys(symbols).length === 0 ||
          !["ts", "tsx"].includes(codeBlock.language)
        ) {
          return;
        }

        const sourceFile = ts.createSourceFile(
          "virtual." + codeBlock.language,
          codeBlock.code,
          ts.ScriptTarget.Latest,
        );

        const lineStarts = sourceFile.getLineStarts();

        while (token !== ts.SyntaxKind.EndOfFileToken) {
          if (token !== ts.SyntaxKind.Identifier) {
            token = scanner.scan();
            continue;
          }

          const identifier = scanner.getTokenText();

          const symbolUrl = symbols[identifier];

          if (symbolUrl === undefined) {
            token = scanner.scan();
            continue;
          }

          const tokenStart = scanner.getTokenStart();

          const { line } = sourceFile.getLineAndCharacterOfPosition(tokenStart);

          // To get the column in this line, subtract the line's start position from the token position
          const columnStart = tokenStart - lineStarts[line];
          const columnEnd = scanner.getTokenEnd() - lineStarts[line];

          codeBlock.getLine(line)?.addAnnotation(
            new LinkAnnotation({
              inlineRange: {
                columnStart,
                columnEnd,
              },
              href: symbolUrl,
            }),
          );

          token = scanner.scan();
        }
      },
    },
  };
}
