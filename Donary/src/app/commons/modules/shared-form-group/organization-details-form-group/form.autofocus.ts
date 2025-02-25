import { Directive, HostListener, ElementRef } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormGroup } from "@angular/forms";
declare var $: any;

@Directive({
  selector: "[focusInvalidInput]",
  exportAs: "focusInvalidInput",
  standalone: false,
})
export class FormAutoFocus {
  constructor(private el: ElementRef) {}

  public focus(): void {
    const invalidControl = this.el.nativeElement.querySelector(".ng-invalid");
    if (invalidControl) {
      //invalidControl.focus();
      $(invalidControl).attr("tabindex", -1).focus();
    }
  }
}
