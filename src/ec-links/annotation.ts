import {
  ExpressiveCodeAnnotation,
  type AnnotationRenderOptions,
  type ExpressiveCodeInlineRange,
} from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import type { Parents } from "hast";

export class LinkAnnotation extends ExpressiveCodeAnnotation {
  private readonly href: string;
  readonly name = "LinkAnnotation";

  constructor(options: {
    inlineRange: ExpressiveCodeInlineRange;
    href: string;
  }) {
    super({ inlineRange: options.inlineRange, renderPhase: "earliest" });
    this.href = options.href;
  }

  render({ nodesToTransform }: AnnotationRenderOptions): Parents[] {
    return nodesToTransform.map((node) => {
      if (node.type !== "element") {
        return node;
      }

      const anchor = h(
        "a.ec-link",
        {
          href: this.href,
          style: "color: inherit",
        },
        ...node.children,
      );

      return h(node.tagName, node.properties, anchor);
    });
  }
}
