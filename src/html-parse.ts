import * as path from "path";

import {
  CombinedRecursiveAstVisitor,
  TmplAstComponent,
  TmplAstElement,
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
    console.log(checker.getDirectivesOfNode(firstComp!, element));
    return super.visitElement(element);
  }
}

const visitor = new LogComponentVisitor();

nodes!.forEach((node) => {
  node.visit(visitor);
});
