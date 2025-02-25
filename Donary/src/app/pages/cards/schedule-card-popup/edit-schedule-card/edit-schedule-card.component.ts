import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  inject,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { ScheduleService } from "src/app/services/schedule.service";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";

import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { Subscription } from "rxjs";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-edit-schedule-card",
  templateUrl: "./edit-schedule-card.component.html",
  styleUrls: ["./edit-schedule-card.component.scss"],
  standalone: false,
})
export class EditScheduleCardComponent implements OnInit {
  isloading: boolean = false;
  popTitle: any;
  donationAmount: string;
  notProcessed: string;
  originalDonationAmt: string;
  count: string;
  showBox: boolean = false;
  isGlobalList: boolean = true;
  accountId: number;
  selectedStartDate: any;
  strSelectedStartDate: any;
  amtPerPayment: string;
  scheduleId: number;
  donor: string;
  PageName: any = "EditScheduleCard";
  isOneDate: any = true;
  nonEditable: boolean = false;
  selectedDonorId: number;
  displaySearchIcon = false;
  isAmountSame: boolean = false;
  minDate = moment(new Date());
  showDatepicker: boolean = false;
  initialDatepicker = 0;
  note: string;

  EngHebCalPlaceholder: string = "";
  class_id: string;
  class_hid: string;
  modalOptions: NgbModalOptions;
  skeletonitems: any = [{}, {}, {}];
  skeletonitems2: any = [{}, {}];
  @Output() emtEditSchedule: EventEmitter<any> = new EventEmitter();
  @ViewChild("donorInput") donorInput: ElementRef;
  private calendarSubscription: Subscription;

  @Input() set ScheduleId(value: any) {
    if (value) {
      this.scheduleId = value;
    }
  }

  @Input() set ScheduleValue(data: any) {
    if (data) {
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      if (data.accountId != null) {
        this.isloading = true;
        this.nonEditable = true;
        this.note = data.note;
        this.commonAPIMethodService
          .getDonors(eventGuId, "", data.accountId)
          .subscribe((res: Array<any>) => {
            this.isloading = false;
            if (res && res.length > 0) {
              this.donor =
                res[0].fullNameJewish != ""
                  ? res[0].fullNameJewish
                  : res[0].fullName;
              this.selectedDonorId = res[0].accountId;
            }

            if (!this.donor) {
              this.nonEditable = false;
              this.donor = null;
            } else {
              this.nonEditable = true;
            }
          });
      }
      this.donationAmount = this.commonMethodService.formatAmount(data.amount);
      this.originalDonationAmt = data.amount;
      this.notProcessed = data.notProcessed;
      this.count = data.count;
      this.accountId = data.accountId;
      this.isAmountSame = data.isAmountSame;
      if (data.nextScheduleDt != null) {
        const today = moment(new Date());
        const oldpaymentdate = moment(data.nextScheduleDt);
        if (today.diff(oldpaymentdate, "days") > 0) {
          this.minDate = moment(data.nextScheduleDt);
        }
        this.strSelectedStartDate = moment(data.nextScheduleDt)
          .format("MM/DD/YYYY")
          .toString();
        this.selectedStartDate = moment(new Date());
      }
      if (this.originalDonationAmt != undefined) {
        if (this.isAmountSame) {
          this.amtPerPayment = this.commonMethodService.formatAmount(
            data.amtPerPayment
          );
        } else {
          this.amtPerPayment = "";
        }
      }
      this.commonMethodService.selectedPaymentReasons =
        this.commonMethodService.localReasonList.filter(
          (s) => s.id == data.reasonId
        );
      this.commonMethodService.selectedFromCampaignList =
        this.commonMethodService.localCampaignList.filter(
          (s) => s.id == data.campaignId
        );
      this.commonMethodService.selectedPaymentLocations =
        this.commonMethodService.localLocationList.filter(
          (s) => s.id == data.locationId
        );
      this.commonMethodService.selectedPaymentCollectors =
        this.commonMethodService.localCollectorList.filter(
          (s) => s.id == data.collectorId
        );
      this.commonMethodService.selectedScheduleRepeatTypes =
        this.commonMethodService.scheduleRepatTypeList.filter(
          (s) => s.id == data.frequencyId
        );
    }
  }
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Output() emtScheduleEdit: EventEmitter<any> = new EventEmitter();
  editingFromPage: string = "";

  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService,
    public localstoragedataService: LocalstoragedataService,
    private scheduleService: ScheduleService,
    private elementRef: ElementRef,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

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

  closePicker() {
    $(".btn").click(function () {
      $(".saveChanges").prop("disabled", false);
    });
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

  clickApply() {
    if (this.initialDatepicker == 1) {
      this.strSelectedStartDate = moment(this.selectedStartDate.startDate)
        .format("MM/DD/YYYY")
        .toString();
      this.initialDatepicker = 0;
    } else {
      this.initialDatepicker = 1;
    }
  }

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SearchDonor(event) {
    this.showBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globallist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.showBox = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    }
  }

  FormatDonationAmount(event) {
    this.donationAmount = this.commonMethodService.formatAmount(
      event.target.value
    );
  }

  FormatNotProcessedAmount(event) {
    this.notProcessed = this.commonMethodService.formatAmount(
      event.target.value
    );
  }

  FormatAmountPerPayment(event) {
    //this.amtPerPayment=this.commonMethodService.formatAmount(event.target.value);//for issue
  }

  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.accountId = -1;
    this.donorInput.nativeElement.focus();
  }

  search(keyword) {
    var record = this.commonMethodService.localDonorList.filter(
      (x) => x.donorStatus == "Active"
    );
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phoneLabels &&
              obj.phoneLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phonenumbers &&
              obj.phonenumbers.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailLabels &&
              obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        if (filterdRecord.length > 0) {
          for (var i = 0; i < filterdRecord.length; i++) {
            filterdRecord[i].id = filterdRecord[i].accountId;
            filterdRecord[i].displayText = filterdRecord[i].fullName;
          }
        }
        this.commonMethodService.donorList = filterdRecord;
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  SearchGlobalDonor() {
    this.isGlobalList = true;
    var text = $("#donorText").val();
    this.showBox = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  onClickedOutside() {
    this.showBox = false;
  }

  SelectDonor(accountId, isAddedFromCard, resValue = null) {
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.selectedDonorId = accountId;
    this.accountId = accountId;
    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
    }
    this.donor = this.commonMethodService.donorList[0].fullNameJewish
      ? this.commonMethodService.donorList[0].fullNameJewish
      : this.commonMethodService.donorList[0].displayText;
  }

  OnGlobalCheckboxChange(event) {
    if (event.target.checked) {
      this.displaySearchIcon = true;
    } else {
      this.displaySearchIcon = false;
    }
  }

  ChangeDonationAmount(event) {
    if (event.target.value != "") {
      if (this.count != "") {
        this.originalDonationAmt = event.target.value
          .replace("$", "")
          .replace(",", "");
        this.donationAmount = event.target.value
          .replace("$", "")
          .replace(",", "");
        this.amtPerPayment =
          "$" +
          (
            parseFloat(this.originalDonationAmt) / parseFloat(this.count)
          ).toFixed(2);
      }
    } else {
      this.amtPerPayment = "";
    }
  }

  ChangeCount(event) {
    if (event.target.value == "") {
      this.amtPerPayment = "";
    } else {
      if (Number(this.originalDonationAmt) != 0) {
        this.count = event.target.value;
        this.amtPerPayment =
          "$" +
          (
            parseFloat(this.originalDonationAmt) / parseFloat(this.count)
          ).toFixed(2);
        this.updateCalculation();
      }
    }
  }

  isInvalidDate(date) {
    let today = moment(new Date());
    // allow only features date for next payment
    if (today.diff(date, "days") > 0) {
      return true;
    }
    return false;
  }

  ChangeAmtPerPayment(event) {
    if (event.target.value != "") {
      if (this.count != "") {
        this.amtPerPayment = event.target.value;
        var app = this.amtPerPayment.replace("$", ""); //added new
        //this.originalDonationAmt=(Number(this.amtPerPayment) * Number(this.count)).toFixed(2);
        this.originalDonationAmt = (Number(app) * Number(this.count)).toFixed(
          2
        );
      }
    }
  }

  deleteSchedule() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.cancelAPI();
      }
    });
  }

  cancelAPI() {
    var objWalletData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ScheduleId: this.scheduleId,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      StatusId: 3,
    };
    this.isloading = true;
    this.scheduleService.cancelSchedule(objWalletData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          Swal.fire({
            title: "Schedule Updated",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.closePopup();
            this.emtScheduleEdit.emit(true);
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            text: "",
            icon: "error",
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
          title: err.error,
          text: "",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  SubmitEditSchedule() {
    this.isloading = true;
    this.showDatepicker = false;
    var objUpdateScheduleData: any = {};
    objUpdateScheduleData = {
      EventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      ScheduleId: this.scheduleId,
      PaymentRecurringModel: {
        RecurrenceAmount: Number(this.amtPerPayment.replace("$", "")),
        RecurrenceCount: this.count,
        ScheduleDateTime:
          this.selectedStartDate.startDate != null
            ? moment(this.selectedStartDate.startDate).format("YYYY-MM-DD")
            : null,
        RecurrenceFrequency:
          this.commonMethodService.selectedScheduleRepeatTypes.length != 0
            ? this.commonMethodService.selectedScheduleRepeatTypes.reduce(
                (s) => s.id
              ).id
            : null,
      },
      CollectorId:
        this.commonMethodService.selectedPaymentCollectors.length != 0
          ? this.commonMethodService.selectedPaymentCollectors.reduce(
              (s) => s.id
            ).id
          : null,
      LocationId:
        this.commonMethodService.selectedPaymentLocations.length != 0
          ? this.commonMethodService.selectedPaymentLocations.reduce(
              (s) => s.id
            ).id
          : null,
      CampaignId:
        this.commonMethodService.selectedFromCampaignList.length != 0
          ? this.commonMethodService.selectedFromCampaignList.reduce(
              (s) => s.id
            ).id
          : null,
      paymentReasonId:
        this.commonMethodService.selectedPaymentReasons.length != 0
          ? this.commonMethodService.selectedPaymentReasons.reduce((s) => s.id)
              .id
          : null,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      AccountId: this.accountId,
      note: this.note,
    };
    this.scheduleService.updateFullSchedule(objUpdateScheduleData).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          if (this.editingFromPage == "schedulePledge")
            this.analytics.editedSchedulePledge();
          if (this.editingFromPage == "schedulePayment")
            this.analytics.editedSchedulePayment();

          this.activeModal.dismiss();
          Swal.fire({
            title: "",
            text: "Updated schedule",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.emtEditSchedule.emit(res);
          });
        }
      },
      (error) => {
        Swal.fire({
          title: "",
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.isloading = false;
      }
    );
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  updateCalculation() {
    var amtpp = this.amtPerPayment.replace("$", "");
    var result = parseFloat(this.count) * parseFloat(amtpp);
    this.donationAmount = result.toFixed(2).toString();
  }

  openHebrewCalendarPopup() {
    this.clickApply();
    this.commonMethodService.featureName = null;
    this.commonMethodService.isScheduleCalendar = true;
    this.commonMethodService.isScheduleHebrewCalendar = true;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedStartDate,
      true,
      "editScheduleDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "EditScheduleCard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedStartDate = items.obj;
          this.clickApply();
        }
      });
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_reason";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  AddNewDonor() {
    this.commonMethodService.AddNewDonor().then((value) => {
      if (value) {
        this.SelectDonor(value.accountId, true, value);
      }
    });
  }
}
