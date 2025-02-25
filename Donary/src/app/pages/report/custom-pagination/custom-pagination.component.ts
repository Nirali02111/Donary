import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
//ng buildimport paginate from 'jw-paginate'

@Component({
  //moduleId: module.id,
  selector: "jw-pagination",
  templateUrl: "./custom-pagination.component.html",
  styleUrls: ["./custom-pagination.component.scss"],
  standalone: false,
})
export class CustomPaginationComponent implements OnInit, OnChanges {
  @Input() items: Array<any>;
  @Output() changePage = new EventEmitter<any>(true);
  @Input() initialPage = 1;
  @Input() pageSize: number;
  @Input() maxPages = 5;

  pager: any = {};

  constructor(public commonMethodService: CommonMethodService) {}

  ngOnInit() {
    // set page if items array isn't empty
    if (this.items && this.items.length) {
      this.setPage(this.initialPage);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.pageSize &&
      changes.pageSize.previousValue &&
      changes.pageSize.currentValue !== changes.pageSize.previousValue
    ) {
      this.pageSize = changes.pageSize.currentValue;
      this.setPage(this.initialPage);
    }
    // reset page if items array has changed
    if (
      changes.items &&
      changes.items.currentValue !== changes.items.previousValue
    ) {
      //this.commonMethodService.sendPageNumber(this.initialPage,this.pageSize);
      this.setPage(this.initialPage);
    }
  }

  public setPage(page: number) {
    // get new pager object for specified page
    this.pager = this.paginate(
      this.items.length,
      page,
      this.pageSize,
      this.maxPages
    );
    this.commonMethodService.sendPageNumber(this.pager);
    // get new page of items from items array
    var pageOfItems = this.items.slice(
      this.pager.startIndex,
      this.pager.endIndex + 1
    );

    // call change page function in parent component
    this.changePage.emit(pageOfItems);
  }

  paginate(
    totalItems: number,
    currentPage: number = 1,
    pageSize: number = this.pageSize,
    maxPages: number = 10
  ) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= maxPages) {
      // total pages less than max so show all pages
      startPage = 1;
      endPage = totalPages;
    } else {
      // total pages more than max so calculate start and end pages
      let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
      let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        // current page near the start
        startPage = 1;
        endPage = maxPages;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        // current page near the end
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } else {
        // current page somewhere in the middle
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
      (i) => startPage + i
    );

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    };
  }
}
