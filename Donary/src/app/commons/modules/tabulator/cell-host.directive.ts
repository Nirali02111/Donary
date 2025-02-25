import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
  selector: "[appCellHost]",
  standalone: false,
})
export class CellHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
