import { Component, Input, OnChanges } from "@angular/core";

import { DataTable } from "./DataTable";

import * as _ from "lodash";

@Component({
  selector: "sv-bootstrap-paginator",
  standalone: false,
  template: `
    <sv-paginator #p [svTable]="svTable">
      <div class="row">
        <div class="col-md-10">
          <ul class="pagination" *ngIf="p.dataLength > p.rowsOnPage">
            <li
              class="page-item"
              [class.disabled]="p.activePage <= 1"
              (click)="p.setPage(1)"
            >
              <a class="page-link" style="cursor: pointer">&laquo;</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage > 4 && p.activePage + 1 > p.lastPage"
              (click)="p.setPage(p.activePage - 4)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage - 4
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage > 3 && p.activePage + 2 > p.lastPage"
              (click)="p.setPage(p.activePage - 3)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage - 3
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage > 2"
              (click)="p.setPage(p.activePage - 2)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage - 2
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage > 1"
              (click)="p.setPage(p.activePage - 1)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage - 1
              }}</a>
            </li>
            <li class="page-item active">
              <a class="page-link" style="cursor: pointer">{{
                p.activePage
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage + 1 <= p.lastPage"
              (click)="p.setPage(p.activePage + 1)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage + 1
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage + 2 <= p.lastPage"
              (click)="p.setPage(p.activePage + 2)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage + 2
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage + 3 <= p.lastPage && p.activePage < 3"
              (click)="p.setPage(p.activePage + 3)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage + 3
              }}</a>
            </li>
            <li
              class="page-item"
              *ngIf="p.activePage + 4 <= p.lastPage && p.activePage < 2"
              (click)="p.setPage(p.activePage + 4)"
            >
              <a class="page-link" style="cursor: pointer">{{
                p.activePage + 4
              }}</a>
            </li>
            <li
              class="page-item"
              [class.disabled]="p.activePage >= p.lastPage"
              (click)="p.setPage(p.lastPage)"
            >
              <a class="page-link" style="cursor: pointer">&raquo;</a>
            </li>
          </ul>
        </div>

        <div class="col-md-2 pull-right float-sm-right">
          <ul
            class="pagination pull-right float-sm-right"
            *ngIf="p.dataLength > minRowsOnPage"
          >
            <li
              class="page-item"
              *ngFor="let rows of rowsOnPageSet"
              [class.active]="p.rowsOnPage === rows"
              (click)="p.setRowsOnPage(rows)"
            >
              <a class="page-link" style="cursor: pointer">{{ rows }}</a>
            </li>
          </ul>
        </div>
      </div>
    </sv-paginator>
  `,
})
export class BootstrapPaginator implements OnChanges {
  @Input("rowsOnPageSet") rowsOnPageSet = [];
  @Input("svTable") svTable: DataTable;

  public minRowsOnPage = 0;

  ngOnChanges(changes: any): any {
    if (changes.rowsOnPageSet) {
      this.minRowsOnPage = _.min(this.rowsOnPageSet);
    }
  }
}
