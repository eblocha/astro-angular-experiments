import { Component, signal } from "@angular/core";

@Component({
  selector: "app-example",
  template: `
    <div>
      <button (click)="visible.set(!visible())">Toggle</button>

      @if (visible()) {
        <p>Now you see me</p>
      }
    </div>
  `,
})
export class ExampleComponent {
  readonly visible = signal(false);
}
