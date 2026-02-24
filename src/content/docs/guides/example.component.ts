import { Component, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { OtherComponent } from "./other.component";
import { SomethingDirective } from "./something.directive";
import { SomethingElseDirective } from "./something-else.directive";
import { ModelDirective } from "./model.directive";

/**
 * This is a description of the component
 */
@Component({
  selector: "app-example",
  imports: [
    OtherComponent,
    SomethingDirective,
    SomethingElseDirective,
    FormsModule,
    ModelDirective,
  ],
  templateUrl: "./example.component.html",
})
export class ExampleComponent {
  readonly visible = model(false);

  value: string | null = null;

  readonly ro =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(() => {});

  handleClick(): void {
    this.visible.update((v) => !v);
    console.log(this.ro);
  }
}
