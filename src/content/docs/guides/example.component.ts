import { Component, forwardRef, model } from "@angular/core";
import { OtherComponent } from "./other.component";
import { SomethingDirective } from "./something.directive";

/**
 * This is a description of the component
 */
@Component({
  selector: "app-example",
  imports: [OtherComponent, SomethingDirective],
  templateUrl: "./example.component.html",
})
export class ExampleComponent {
  readonly visible = model(false);

  readonly ro =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(() => {});

  handleClick(): void {
    this.visible.update((v) => !v);
    console.log(this.ro);
  }
}
