import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";

@Component({
  selector: "app-report-compare-popup",
  templateUrl: "./report-compare-popup.component.html",
  standalone: false,
  styleUrls: ["./report-compare-popup.component.scss"],
})
export class ReportComparePopupComponent implements OnInit {
  columnNameList: any = [];
  columnName: string;
  compareColumn1: string = "-1";
  compareColumn2: string = "-1";
  mainArray: any = [];
  @Output() emtCompareColumnData: EventEmitter<any> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  @Input() set ColumnList(data: any) {
    if (data) {
      this.columnNameList = data;
    }
  }

  ngOnInit() {}

  CompareColumn() {
    var objCompare = {
      columnName: this.columnName,
      compareColumn1: this.compareColumn1,
      compareColumn2: this.compareColumn2,
    };
    this.emtCompareColumnData.emit(objCompare);
    this.activeModal.dismiss();
  }
  closePopup() {
    this.activeModal.dismiss();

    //this.resetSearchBox();
  }

  clearFilter() {
    this.columnName = null;
    this.compareColumn1 = "-1";
    this.compareColumn2 = "-1";
  }
}
