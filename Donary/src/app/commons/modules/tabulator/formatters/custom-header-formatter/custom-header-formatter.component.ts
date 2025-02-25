import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "[app-custom-header-formatter]",
  templateUrl: "./custom-header-formatter.component.html",
  styleUrls: ["./custom-header-formatter.component.scss"],
  standalone: false,
})
export class CustomHeaderFormatterComponent implements OnInit {
  @Input() cell: any;

  constructor() {}

  ngOnInit() {}
}
