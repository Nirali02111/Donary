import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[appRowFormatter]",
  standalone: false,
})
export class RowFormatterDirective {
  constructor(public template: TemplateRef<any>) {}
}
