import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";

@Component({
  selector: "app-schedule-trans-grid-filter-popup",
  templateUrl: "./schedule-trans-grid-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./schedule-trans-grid-filter-popup.component.scss"],
})
export class ScheduleTransGridFilterPopupComponent implements OnInit {
  @Output() emtOutputSearchFilterData: EventEmitter<any> = new EventEmitter();
  @Input() set setDueDate(value: any) {
    if (value) {
      this.selectedDueDate = { startDate: value, endDate: value };
    }
  }

  selectedDueDate: any;
  constructor(
    public commonMethodService: CommonMethodService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    document.getElementById("txtDueDate").focus();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  searchFilter() {
    var objSearchFilter = {
      selectedDueDate: this.selectedDueDate,
      selectedWeek: "customWeek",
    };
    this.emtOutputSearchFilterData.emit(objSearchFilter);
    this.activeModal.dismiss();
  }
}
