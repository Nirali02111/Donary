import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-skeleton-loader-component",
  templateUrl: "./skeleton-loader-component.component.html",
  standalone: false,
  styleUrls: ["./skeleton-loader-component.component.scss"],

  encapsulation: ViewEncapsulation.None,
})
export class SkeletonLoaderComponentComponent implements OnInit {
  @Input() count: number = 1;

  @Input() theme: { [k: string]: string } = {
    width: "100%",
    height: "40px",
  };

  @Input() appearance = "";
  constructor() {}

  @Input() isLoading = true;

  ngOnInit() {}
}
