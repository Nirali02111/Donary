import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";

declare var $: any;
@Component({
  selector: "app-calender-modal",
  templateUrl: "./calender-modal.component.html",
  standalone: false,
  styleUrls: ["./calender-modal.component.scss"],
})
export class CalenderModalComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  isSelected = false;
  isRetrySelected = false;
  isinitialize: number = 0;
  radioVal: boolean = true;
  isPaymentDate: boolean = true;
  @Input("selectedDateRange") calenderData?: any;
  selectedDateRange: any;
  @Output() emtOutputDateRange: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputradioVal: EventEmitter<any> = new EventEmitter();
  isLoading = false;

  constructor(
    public commonMethodService: CommonMethodService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.selectedDateRange = this.calenderData;
    let tPostion = $("#dynamicsCalender").offset();
    setTimeout(() => {
      this.isLoading = false;
    }, 200);
    setTimeout(() => {
      $(".calenderModal .modal-dialog").css("left", +tPostion.left);
      $(".calenderModal .modal-dialog").css("top", +tPostion.top + 40);
    }, 100);
  }
  change(event) {
    if (this.isinitialize == 1) {
      if (event.startDate == null && event.endDate == null) {
        this.activeModal.dismiss();
      } else {
        this.pickerDirective.startDateChanged.subscribe(() => {
          this.pickerDirective.picker.applyBtn.disabled = true;
        });
        this.pickerDirective.endDateChanged.subscribe(() => {
          this.pickerDirective.picker.applyBtn.disabled = false;
          this.activeModal.dismiss(event);
          this.selectedDateRange = event;
          this.emtOutputDateRange.emit(this.selectedDateRange);
          this.emtOutputradioVal.emit(this.radioVal);
        });
      }
      this.selectedDateRange = event;
    }
    this.emtOutputDateRange.emit(this.selectedDateRange);
    this.emtOutputradioVal.emit(this.radioVal);
    this.isinitialize = 1;
  }
  setValueCustomRadio(e: any) {
    this.radioVal = e;
  }
}
