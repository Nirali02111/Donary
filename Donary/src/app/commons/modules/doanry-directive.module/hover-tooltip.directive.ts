import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "[appHoverTooltip]",
  standalone: false,
})
export class HoverTooltipDirective {
  @Input("labelText") labelText!: string;
  @HostBinding("attr.t-title") get type() {
    return this.labelText;
  }
  constructor() {}
}
