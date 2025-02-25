import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from "@angular/core";

@Directive({
  selector: "[appClickOutside]",
  standalone: false,
})
export class ClickOutsideDirective implements OnInit, AfterViewInit {
  @Output() clickOutside = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  @HostListener("document:click", ["$event"])
  onClick(event) {
    const targetElement = event.target;
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}
