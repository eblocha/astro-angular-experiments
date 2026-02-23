import { Directive, input } from "@angular/core";

@Directive({
  selector: "[appSomething]",
})
export class SomethingDirective {
  readonly appSomething = input<number>();
}
