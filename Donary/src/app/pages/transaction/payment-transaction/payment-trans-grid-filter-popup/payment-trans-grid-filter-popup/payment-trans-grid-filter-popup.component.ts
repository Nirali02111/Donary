import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
declare var $: any;
@Component({
  selector: "app-payment-trans-grid-filter-popup",
  templateUrl: "./payment-trans-grid-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./payment-trans-grid-filter-popup.component.scss"],
})
export class PaymentTransGridFilterPopupComponent implements OnInit {
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
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
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
