import { Directive, HostListener, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[specialIsAlphaNumeric]",
  standalone: false,
})
export class SpecialCharacterDirective {
  // regexStr = '^[a-zA-Z0-9 _]*$';
  regexStr = "/[().-]/";

  @Input() isAlphaNumeric: boolean;

  constructor(private el: ElementRef) {}

  @HostListener("keypress", ["$event"]) onKeyPress(event) {
    return /[().-]/.test(event.key);
  }

  @HostListener("paste", ["$event"]) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value
        .replace(/[().-]/g, "")
        .replace(/\s/g, "");
      event.preventDefault();
    }, 100);
  }
}
