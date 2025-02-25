import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-list-card-skeleton-loader",
  templateUrl: "./list-card-skeleton-loader.component.html",
  styleUrls: ["./list-card-skeleton-loader.component.scss"],
  standalone: false,
})
export class ListCardSkeletonLoaderComponent implements OnInit {
  @Input() isLoader = true;
  constructor() {}

  ngOnInit() {}
}
