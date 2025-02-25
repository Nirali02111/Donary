import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Subject, Subscription } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";

declare var $: any;
@Component({
  selector: "app-maketransaction-schedule-popup",
  templateUrl: "./maketransaction-schedule-popup.component.html",
  standalone: false,
  styleUrls: ["./maketransaction-schedule-popup.component.scss"],
})
export class MaketransactionSchedulePopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  donationAmount: string;
  PageName: any = "MakeTransactionSchedule";
  popTitle: any;
  selectedDate: any;
  isOneDate: any = true;
  finalAmount: string;
  count: string;
  isAlert: boolean = false;
  frequencyId: number = 0;
  frequencyName: string;
  selectedStartDate: any = { startDate: moment(new Date()) };
  amtPerPayment: string;
  showForm: boolean = false;
  isCountError: boolean = false;
  isAmtPerPaymentError: boolean = false;
  isFrequencyError: boolean = false;
  isDateError: boolean = false;
  isAmountError: boolean = false;
  isChecked: boolean = false;
  oninitialize = 1;
  minDate = moment(new Date());
  scheduleObj: any = [];
  userName: string;
  localStorageArray = {
    count: null,
    frequencyId: null,
    frequencyName: null,
  };

  isDisableCount: boolean = false;
  oldCount: string;
  uiPageSettingId = null;
  uiPageSetting: any;
  savedDefault: boolean = false;
  isEngCal: boolean = true;
  @Output() emtOutputScheduleData: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDisableButton: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDonationAmt: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputSideTabAmt: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputScheduleDataToggle: EventEmitter<any> = new EventEmitter();
  private calendarSubscription: Subscription;

  @Input() set DonationAmountData(data: any) {
    if (data) {
      this.donationAmount = data;
      //this.count ? (this.count = "12") : this.count;
      // this.oldCount = this.count;
      this.amtPerPayment = (
        Number(this.donationAmount) / Number(this.count)
      ).toFixed(2);
      this.finalAmount = this.donationAmount;
      this.ValidData();
    } else {
      this.donationAmount = "";
      this.amtPerPayment = (
        Number(this.donationAmount) / Number(this.count)
      ).toFixed(2);
    }
  }
  @Input() set ScheduleObjData(data: any) {
    if (data.length != 0) {
      this.scheduleObj = data;
      this.count = data.count;
      this.oldCount = this.count;
      if (this.donationAmount != "") {
        this.donationAmount =
          data.donationAmount == undefined ? "" : data.donationAmount;
      }
      this.isAlert = data.isAlert;
      this.frequencyId =
        data.frequency && Number(data.frequency.map((x) => x.id).toString());
      this.isFrequencyValid(data.frequency);
      this.selectedStartDate = data.startDate;
      this.EngHebCalPlaceholder = moment(this.selectedStartDate).format(
        "MM/DD/YYYY"
      );
      this.commonMethodService.selectedScheduleRepeatTypes =
        data.frequency && data.frequency.length == 1
          ? this.commonMethodService.scheduleRepatTypeList.filter(
              (x) => x.id == data.frequency.map((x) => x.id)
            )
          : this.commonMethodService.scheduleRepatTypeList.filter(
              (x) => x.id == data.frequency
            );
      this.frequencyName = this.commonMethodService.selectedScheduleRepeatTypes
        .map((x) => x.itemName)
        .toString();
      this.amtPerPayment = (
        Number(this.donationAmount) / Number(this.count)
      ).toFixed(2);
      this.isChecked = data.checked;
      $("#setschedule").attr("checked", true);
      this.showForm = true;
    } else {
      $("#setschedule").removeAttr("checked", "checked");
      this.showForm = false;
      this.ClearData();
      this.emtOutputDisableButton.emit(false);
      this.isFrequencyValid();
    }

    if (this.commonMethodService.isBackTranctionCliked) {
      this.EngHebCalPlaceholder =
        this.hebrewEngishCalendarService.EngHebCalPlaceholder;
      this.isEngCal = this.hebrewEngishCalendarService.isEngCal;
    }

    this.EngHebCalPlaceholder = this.datePipe.transform(
      this.EngHebCalPlaceholder,
      "short"
    );
  }
  EngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_id: string;
  class_hid: string;
  modalOptions: NgbModalOptions;
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal,
    public localStorageDataService: LocalstoragedataService,
    private uiPageSettingService: UIPageSettingService,
    public commonMethodService: CommonMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private datePipe: DonaryDateFormatPipe
  ) {}

  ngOnInit() {
    if (this.commonMethodService.localscheduleRepatTypeList.length == 0) {
      this.commonMethodService.getScheduleRepeatTypeList();
    }
    if (!this.isAlert) {
      this.bindData();
      this.getSavedLayoutData();
    }
    if (this.scheduleObj.length != undefined) {
      // if (this.count == undefined) {
      //   this.count = "12";
      //   this.oldCount = this.count;
      // }
      if (this.donationAmount != undefined) {
        this.amtPerPayment = (
          Number(this.donationAmount) / Number(this.count)
        ).toFixed(2);
      }
      //this.selectedStartDate = moment(new Date());
    }
    this.isDateError = false;
  }

  ngAfterViewInit() {
    if (this.isChecked) {
      $("#setschedule").attr("checked", "checked");
      this.showForm = true;
      this.oninitialize = 1;
      if (this.donationAmount != undefined) {
        this.SubmitSchedule();
      }
    } else {
      $("#setschedule").removeAttr("checked", "checked");
      this.showForm = false;
      this.ClearData();
      this.emtOutputDisableButton.emit(false);
    }
  }

  getSavedLayoutData() {
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "schedule payment",
    };
    this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
      if (res) {
        if (!this.isAlert) {
          this.savedDefault = true;
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          this.count = this.uiPageSetting.count;
          this.commonMethodService.selectedScheduleRepeatTypes =
            this.uiPageSetting.frequency;
        }
      }
    });
  }

  bindData() {
    if (this.frequencyId == 0) {
      this.commonMethodService.selectedScheduleRepeatTypes = [
        { id: 4, itemName: "Monthly" },
      ];
    } else {
      this.commonMethodService.selectedScheduleRepeatTypes = [
        { id: this.frequencyId, itemName: this.frequencyName },
      ];
    }
  }

  ChangeCount(event) {
    if (event.target.value == "") {
      this.amtPerPayment = "";
      this.emtOutputDisableButton.emit(true);
      this.isCountError = true;
    } else {
      this.isCountError = false;
      if (Number(this.donationAmount) != 0) {
        this.count = event.target.value;

        this.amtPerPayment = (
          Number(this.donationAmount) / Number(this.count)
        ).toFixed(2);
        this.ValidData();
      }
      this.savedDefault = false;
    }
  }

  ChangeDonationAmount(event) {
    this.emtOutputDonationAmt.emit(this.donationAmount);
    if (event.target.value != "") {
      if (this.count != "") {
        this.donationAmount = event.target.value;
        this.finalAmount = this.donationAmount;
        this.amtPerPayment = (
          Number(this.donationAmount) / Number(this.count)
        ).toFixed(2);
        this.isAmountError = false;
        this.ValidData();
      }
    } else {
      this.amtPerPayment = "";
      this.isAmountError = true;
      this.emtOutputDisableButton.emit(true);
    }
  }

  FormatAmt() {
    this.donationAmount = Number(this.donationAmount).toFixed(2);
    this.emtOutputSideTabAmt.emit(this.donationAmount);
  }

  ChangeAmtPerPayment(event) {
    if (event.target.value != "") {
      if (this.count != "") {
        this.amtPerPayment = event.target.value;
        this.donationAmount = (
          Number(this.amtPerPayment) * Number(this.count)
        ).toFixed(2);
        this.emtOutputDonationAmt.emit(this.donationAmount);
        this.isAmtPerPaymentError = false;
        this.ValidData();
      }
    } else {
      this.isAmtPerPaymentError = true;
      this.emtOutputDisableButton.emit(true);
    }
  }

  ChangeFrequency(event) {
    if (event.length == 0) {
      this.isFrequencyError = true;
      this.emtOutputDisableButton.emit(true);
    } else {
      this.isFrequencyError = false;
      this.ValidData();
    }
    this.savedDefault = false;
    this.commonMethodService.isFrequencyError = this.isFrequencyError;
  }
  OnItemDeSelect($event) {
    this.isFrequencyError = true;
    this.commonMethodService.isFrequencyError = this.isFrequencyError;
    //this.emtOutputDisableButton.emit(true);
  }
  datesUpdated(event) {
    if (this.oninitialize != 1) {
      var selectedDate = event;
      if (selectedDate.startDate != null) {
        this.isDateError = false;
        this.finalAmount = this.donationAmount;
        this.isDateError = false;
        this.ValidData();
      } else {
        this.isDateError = true;
        this.emtOutputDisableButton.emit(true);
      }
    }
    this.oninitialize = 2;
  }

  ClearData() {
    this.count = "12";
    this.amtPerPayment = (
      Number(this.donationAmount) / Number(this.count)
    ).toFixed(2);
    this.selectedStartDate = this.commonMethodService.isBackTranctionCliked
      ? this.selectedStartDate
      : moment(new Date());
    this.commonMethodService.selectedScheduleRepeatTypes = [
      { id: 4, itemName: "Monthly" },
    ];
  }

  ValidData() {
    if (this.showForm) {
      if (
        this.donationAmount != undefined &&
        this.count != "" &&
        this.commonMethodService.selectedScheduleRepeatTypes.length != 0 &&
        this.selectedStartDate != undefined &&
        this.amtPerPayment != ""
      ) {
        this.SubmitSchedule();
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  OnCheckboxChange(event) {
    if (event) {
      this.showForm = true;
      this.oninitialize = 1;
      if (this.donationAmount != undefined) {
        this.SubmitSchedule();
      }
      this.emtOutputScheduleDataToggle.emit(true);
    } else {
      this.showForm = false;
      this.ClearData();
      this.emtOutputScheduleDataToggle.emit(false);
      this.emtOutputDisableButton.emit(null);
      this.commonMethodService.isFrequencyError = false;
      this.isFrequencyError = this.commonMethodService.isFrequencyError;
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SubmitSchedule() {
    var objSchedule = {
      donationAmount: this.finalAmount,
      count: this.count,
      amtPerPayment: this.amtPerPayment,
      frequency: this.commonMethodService.selectedScheduleRepeatTypes,
      startDate: this.selectedStartDate,
    };

    this.emtOutputScheduleData.emit(objSchedule);
    this.changeDetectorRef.detectChanges();
  }
  disableCount(event) {
    if (this.count && parseFloat(this.count) < 1) {
      return (this.isDisableCount = true);
    }
    return (this.isDisableCount = false);
  }
  idCountZero(event) {
    if (event.target.value < 1) {
      event.target.value = "";
      $("#btnAmountTabNextId").attr("disabled", "disabled");
      $("#btnAmountTabProcessId").attr("disabled", "disabled");
      $("#btnAmountTabNextId").addClass("zero-disabled");
      $("#btnAmountTabProcessId").addClass("zero-disabled");
      return true;
    }
    $(".zero-disabled").removeAttr("disabled");
    $(".zero-disabled").removeClass("zero-disabled");
  }

  saveScheduleLayout() {
    let setting = {
      frequency: this.commonMethodService.selectedScheduleRepeatTypes,
      count: this.count,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "schedule payment",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        this.savedDefault = true;
        this.getSavedLayoutData();
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }
  isFrequencyValid(frequency: any = []) {
    if (frequency && frequency.length > 0) {
      this.commonMethodService.isFrequencyError = false;
      this.isFrequencyError = this.commonMethodService.isFrequencyError;
    } else {
      if (this.showForm) {
        this.commonMethodService.isFrequencyError = true;
        this.isFrequencyError = this.commonMethodService.isFrequencyError;
      }
    }
  }

  openHebrewCalendarPopup(p1: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.isScheduleCalendar = true;
    this.commonMethodService.isScheduleHebrewCalendar = true;

    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedStartDate,
      true,
      "transactionScheduleCalender",
      "",
      this.isEngCal
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (items && items.pageName == "MakeTransactionSchedule") {
          let selectedDate = items.obj;
          if (selectedDate.startDate != null) {
            this.selectedStartDate = moment(selectedDate.startDate);
            this.isDateError = false;
            this.finalAmount = this.donationAmount;
            this.isDateError = false;
            this.ValidData();
          } else {
            this.isDateError = true;
            this.emtOutputDisableButton.emit(true);
          }
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          p1.close();
          $("#calendar_input_make_transaction").click();
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.isEngCal = this.hebrewEngishCalendarService.isEngCal;
        }
      });
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
