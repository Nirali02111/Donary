import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-input-error",
  templateUrl: "./input-error.component.html",
  styleUrls: ["./input-error.component.scss"],
  standalone: false,
})
export class InputErrorComponent implements OnInit {
  @Input() errors: any;
  @Input() firstOnly = true;
  constructor() {}

  ngOnInit() {}
}
