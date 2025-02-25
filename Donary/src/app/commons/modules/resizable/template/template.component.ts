import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  AfterViewInit,
} from "@angular/core";

@Component({
  selector: "th[resizable]",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
  standalone: false,
})
export class TemplateComponent implements OnInit, AfterViewInit {
  constructor() {}
  @HostBinding("style.width.px")
  width: number | null = null;

  onResize(width: number) {
    this.width = width;
  }

  ngOnInit() {}

  ngAfterViewInit() {}
}
