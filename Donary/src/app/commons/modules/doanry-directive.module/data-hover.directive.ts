import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "[appDataHover]",
  standalone: false,
})
export class DataHoverDirective {
  @Input("labelText") labelText!: string;
  @HostBinding("attr.data-hover") get type() {
    return this.labelText;
  }
  constructor() {}
}
