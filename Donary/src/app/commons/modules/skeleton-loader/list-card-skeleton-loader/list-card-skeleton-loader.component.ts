import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-list-card-skeleton-loader",
  templateUrl: "./list-card-skeleton-loader.component.html",
  standalone: false,
  styleUrls: ["./list-card-skeleton-loader.component.scss"],
})
export class ListCardSkeletonLoaderComponent implements OnInit {
  @Input() isLoader = true;
  constructor() {}

  ngOnInit() {}
}
