import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal, NgbPopover } from "@ng-bootstrap/ng-bootstrap";

import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Subscription } from "rxjs";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { ScheduleService } from "src/app/services/schedule.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-edit-amountdata-popup",
  templateUrl: "./edit-amountdata-popup.component.html",
  styleUrls: ["./edit-amountdata-popup.component.scss"],
  standalone: false,
})
export class EditAmountdataPopupComponent implements OnInit {
  amount: string = "";
  strSelectedDate: any;
  minDate: any = moment(new Date());
  scheduleId: number;
  oldStartDate: any;
  isloading: boolean = false;
  isEditAmount = false;
  title: string;
  initialDatepicker = 0;
  showDatepicker: boolean = false;
  PageName: string = "EditAmountData";
  selectedDateRange: any = { startDate: new Date(), endDate: new Date() };
  isOneDate: boolean = true;
  class_id: any;
  class_hid: any;

  @Input() set EditAmount(scheduleValue: any) {
    if (scheduleValue) {
      this.scheduleId = scheduleValue.scheduleId;
      this.oldStartDate = scheduleValue.scheduleDate;
      this.isEditAmount = scheduleValue.isEditAmount;
      this.title = scheduleValue.title;

      // set min date to previous date
      const today = moment(new Date());
      const oldpaymentdate = moment(scheduleValue.scheduleDate);
      if (today.diff(oldpaymentdate, "days") > 0) {
        this.minDate = moment(scheduleValue.scheduleDate);
      }
      this.strSelectedDate = moment(scheduleValue.scheduleDate)
        .format("MM/DD/YYYY")
        .toString();
      this.EngHebCalPlaceholder = this.strSelectedDate
        ? this.strSelectedDate
        : moment(new Date()).format("MM/DD/YYYY").toString();

      this.selectedDateRange.startDate = moment(scheduleValue.scheduleDate);
    }
  }
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Output() emtEditAmtUpdate: EventEmitter<any> = new EventEmitter();
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  private calendarSubscription: Subscription;

  EngHebCalPlaceholder: string = "All Time";

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private scheduleService: ScheduleService,
    public localstoragedataService: LocalstoragedataService,
    private elementRef: ElementRef,
    private hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  isInvalidDate(date) {
    let today = moment(new Date());
    // allow only features date for next payment
    if (today.diff(date, "days") > 0) {
      return true;
    }
    return false;
  }

  OnDatePickerOpen() {
    this.showDatepicker = true;
    if (this.showDatepicker) {
      this.pickerDirective.open();
    }
    window.addEventListener("click", this.handleClick);
    $(".saveChanges").prop("disabled", true);
    this.closePicker();
  }

  closePicker() {
    $(".btn").click(function () {
      $(".saveChanges").prop("disabled", false);
    });
  }

  handleClick = (ev) => {
    if (
      this.showDatepicker &&
      !this.elementRef.nativeElement
        .querySelector("ngx-daterangepicker-material")
        .contains(ev.target)
    ) {
      this.pickerDirective.open();
    } else {
      window.removeEventListener("click", this.handleClick);
    }
  };

  OnDivClick() {
    this.showDatepicker = false;
    window.removeEventListener("click", this.handleClick);
    return;
  }

  UpdateAmountDate() {
    var objscheduleData = {};
    if (this.isEditAmount) {
      objscheduleData = {
        EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        MainScheduleId: this.scheduleId,
        EditScheduleDate: this.oldStartDate,
        NewStatusId: null,
        NewAmount: this.amount,
      };
    } else {
      objscheduleData = {
        EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        MainScheduleId: this.scheduleId,
        EditScheduleDate: this.oldStartDate,
        NewStatusId: null,
        NewScheduleDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
      };
    }

    this.isloading = true;
    this.showDatepicker = false;
    this.scheduleService.updateSingleSchedule(objscheduleData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.closePopup();
          Swal.fire({
            title: "Schedule Updated",
            text: "",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.emtEditAmtUpdate.emit(res);
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            text: "",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      },
      (err) => {
        this.isloading = false;
        Swal.fire({
          title: err?.errorMessage || "Something went wrong",
          text: "",
          icon: "error",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  isDisable() {
    if (!this.isEditAmount) {
      if (this.selectedDateRange.startDate === null) {
        return true;
      }
      if (moment(this.oldStartDate).isSame(this.selectedDateRange.startDate)) {
        return true;
      }
      return false;
    } else {
      return this.amount != "" ? false : true;
    }
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == this.PageName &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }
}
