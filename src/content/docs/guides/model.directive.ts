import { Directive, model } from "@angular/core";

@Directive({
  selector: "[appModel]",
})
export class ModelDirective {
  readonly appModel = model<string | null>();
}
