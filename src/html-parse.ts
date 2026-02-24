import * as path from "path";

import {
  SelectorMatcher,
  CssSelector,
  CombinedRecursiveAstVisitor,
  TmplAstComponent,
  TmplAstElement,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstTemplate,
} from "@angular/compiler";
import {
  createCompilerHost,
  type CompilerOptions,
  NgtscProgram,
  OptimizeFor,
} from "@angular/compiler-cli";

import ts, { isClassDeclaration } from "typescript";

const config: CompilerOptions = {
  rootDir: ".",
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strictNullChecks: true,
  skipLibCheck: true,
  strictTemplates: true,
  module: ts.ModuleKind.ES2022,
  _enableTemplateTypeChecker: true,
};

const compilerHost = createCompilerHost({ options: config });

const files = [path.resolve("./content/docs/guides/example.component.ts")];

const program = new NgtscProgram(files, config, compilerHost);

const compiler = program.compiler;

const components = compiler.getComponentsWithTemplateFile(
  "./content/docs/guides/example.component.html",
);

let firstComp = undefined;

for (const decl of components) {
  if (isClassDeclaration(decl)) {
    firstComp = decl;
  }
  break;
}

const checker = compiler.getTemplateTypeChecker();

const nodes = checker.getTemplate(firstComp!, OptimizeFor.SingleFile);

class LogComponentVisitor extends CombinedRecursiveAstVisitor {
  visitComponent(component: TmplAstComponent): void {
    console.log(component);
    return super.visitComponent(component);
  }

  visitElement(element: TmplAstElement): void {
    console.log(`--- <${element.name}> ---`);

    const directives = checker.getDirectivesOfNode(firstComp!, element);

    const inputsToLink = element.inputs.map((attribute) => {
      const dir = directives?.find((dir) =>
        dir.inputs.hasBindingPropertyName(attribute.name),
      );

      const pos = {
        line: attribute.keySpan.start.line + 1,
        colStart: attribute.keySpan.start.col,
        colEnd: attribute.keySpan.end.col,
      };

      return {
        attributeName: attribute.name,
        pos,
        directiveName: dir?.name,
        type: attribute.type,
      };
    });

    const outputsToLink = element.outputs.map((attribute) => {
      const dir = directives?.find((dir) =>
        dir.outputs.hasBindingPropertyName(attribute.name),
      );

      const pos = {
        line: attribute.keySpan.start.line + 1,
        colStart: attribute.keySpan.start.col,
        colEnd: attribute.keySpan.end.col,
      };

      return {
        attributeName: attribute.name,
        pos,
        directiveName: dir?.name,
        type: attribute.type,
      };
    });

    console.log("inputs", inputsToLink);
    console.log("outputs", outputsToLink);

    // Find attributes which refer to directives
    // Since directives can have complex queries, figure out which attribute makes the most sense per directive.
    // See https://github.com/angular/angular/blob/main/packages/language-service/src/utils/index.ts#L325
    // for an example of how the angular language service detects directives for an attribute
    const directivesToLink = element.attributes.map((attribute) => {
      const dirs = getDirectiveMatchesForAttribute(
        attribute.name,
        element,
        directives ?? [],
      );

      // We can only link one, so link the first one.
      const dir = [...dirs][0];

      const pos = {
        line: attribute.keySpan!.start.line + 1,
        colStart: attribute.keySpan!.start.col,
        colEnd: attribute.keySpan!.end.col,
      };

      return {
        attributeName: attribute.name,
        pos,
        directiveName: dir?.name,
      };
    });

    console.log("directives", directivesToLink);

    return super.visitElement(element);
  }
}

const visitor = new LogComponentVisitor();

nodes!.forEach((node) => {
  node.visit(visitor);
});

export function getDirectiveMatchesForAttribute<
  D extends { selector: string | null },
>(
  name: string,
  hostNode: TmplAstTemplate | TmplAstElement,
  directives: D[],
): Set<D> {
  const attributes = getAttributes(hostNode);
  const allAttrs = attributes.map(toAttributeCssSelector);
  const allDirectiveMatches = getDirectiveMatchesForSelector(
    directives,
    getNodeName(hostNode) + allAttrs.join(""),
  );
  const attrsExcludingName = attributes
    .filter((a) => a.name !== name)
    .map(toAttributeCssSelector);

  const matchesWithoutAttr = getDirectiveMatchesForSelector(
    directives,
    getNodeName(hostNode) + attrsExcludingName.join(""),
  );

  return allDirectiveMatches.difference(matchesWithoutAttr);
}

function getNodeName(node: TmplAstTemplate | TmplAstElement): string {
  return node instanceof TmplAstTemplate
    ? (node.tagName ?? "ng-template")
    : node.name;
}

/**
 * Given a list of directives and a text to use as a selector, returns the directives which match
 * for the selector.
 */
function getDirectiveMatchesForSelector<T extends { selector: string | null }>(
  directives: T[],
  selector: string,
): Set<T> {
  try {
    const selectors = CssSelector.parse(selector);
    if (selectors.length === 0) {
      return new Set();
    }
    return new Set(
      directives.filter((dir: T) => {
        if (dir.selector === null) {
          return false;
        }

        const matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(dir.selector));

        return selectors.some((selector) => matcher.match(selector, null));
      }),
    );
  } catch {
    // An invalid selector may throw an error. There would be no directive matches for an invalid
    // selector.
    return new Set();
  }
}

function toAttributeCssSelector(
  attribute: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent,
): string {
  let selector: string;
  if (
    attribute instanceof TmplAstBoundEvent ||
    attribute instanceof TmplAstBoundAttribute
  ) {
    selector = `[${attribute.name}]`;
  } else {
    selector = `[${attribute.name}=${attribute.valueSpan?.toString() ?? ""}]`;
  }
  // Any dollar signs that appear in the attribute name and/or value need to be escaped because they
  // need to be taken as literal characters rather than special selector behavior of dollar signs in
  // CSS.
  return selector.replace(/\$/g, "\\$");
}

function getAttributes(
  node: TmplAstTemplate | TmplAstElement,
): Array<TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent> {
  const attributes: Array<
    TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent
  > = [...node.attributes, ...node.inputs, ...node.outputs];
  if (node instanceof TmplAstTemplate) {
    attributes.push(...node.templateAttrs);
  }
  return attributes;
}
