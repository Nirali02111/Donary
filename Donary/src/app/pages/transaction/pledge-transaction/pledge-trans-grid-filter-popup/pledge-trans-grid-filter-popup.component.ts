import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { CommonMethodService } from "../../../../commons/common-methods.service";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-pledge-trans-grid-filter-popup",
  templateUrl: "./pledge-trans-grid-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./pledge-trans-grid-filter-popup.component.scss"],
})
export class PledgeTransGridFilterPopupComponent implements OnInit {
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
