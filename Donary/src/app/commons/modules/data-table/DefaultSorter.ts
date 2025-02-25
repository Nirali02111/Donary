import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { DataTable, SortEvent } from "./DataTable";

@Component({
  selector: "sv-default-sorter",
  standalone: false,
  template: `
    <a style="cursor: pointer" (click)="sort()" class="text-nowrap">
      <ng-content></ng-content>
      <span
        *ngIf="isSortedByMeAsc"
        class="glyphicon glyphicon-triangle-top fa fa-sort-up"
        aria-hidden="true"
      ></span>
      <span
        *ngIf="isSortedByMeDesc"
        class="glyphicon glyphicon-triangle-bottom fa fa-sort-down"
        aria-hidden="true"
      ></span>
    </a>
  `,
})
export class DefaultSorter implements OnInit {
  @Input("by") sortBy: string;
  @Input("order") sortOrder: string;
  @Output("updateSortOrder") updateSortOrder: EventEmitter<any> =
    new EventEmitter<any>();
  public isSortedByMeAsc: boolean = false;
  public isSortedByMeDesc: boolean = false;

  public constructor(private svTable: DataTable) {}

  public ngOnInit(): void {
    this.svTable.onSortChange.subscribe((event: SortEvent) => {
      this.isSortedByMeAsc =
        event.sortBy == this.sortBy && event.sortOrder == "asc";
      this.isSortedByMeDesc =
        event.sortBy == this.sortBy && event.sortOrder == "desc";
    });
    if (this.sortOrder) {
      if (this.sortOrder == "asc") this.isSortedByMeDesc = true;
      if (this.sortOrder == "desc") this.isSortedByMeAsc = true;
      this.sort();
    }
  }

  public sort() {
    let sortObj = {};
    if (this.isSortedByMeAsc) {
      this.svTable.setSort(this.sortBy, "desc");
      sortObj = { sortBy: this.sortBy, sortOrder: "desc" };
    } else {
      this.svTable.setSort(this.sortBy, "asc");
      sortObj = { sortBy: this.sortBy, sortOrder: "asc" };
    }
    this.updateSortOrder.emit(sortObj);
  }
}
