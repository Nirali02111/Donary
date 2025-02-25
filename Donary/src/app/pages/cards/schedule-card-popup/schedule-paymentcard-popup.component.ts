import {
  Component,
  Input,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { DonorService } from "src/app/services/donor.service";
import { ScheduleService } from "./../../../services/schedule.service";
import Swal from "sweetalert2";
import * as moment from "moment";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { PaymentCardPopupComponent } from "../payment-card-popup/payment-card-popup.component";
import { DismissPaymentPopupComponent } from "./dismiss-payment-popup/dismiss-payment-popup.component";
import { EditAmountdataPopupComponent } from "./edit-amountdata-popup/edit-amountdata-popup.component";
import { EditScheduleCardComponent } from "./edit-schedule-card/edit-schedule-card.component";
import { WalletlistPopupComponent } from "./walletlist-popup/walletlist-popup.component";

import { NextScheduleEditPopupComponent } from "./next-schedule-edit-popup/next-schedule-edit-popup.component";
import { Guid } from "guid-typescript";
import { MapViewCardPopupComponent } from "../map-view-card-popup/map-view-card-popup.component";

import { ReminderPopupComponent } from "../../notifications/reminder-popup/reminder-popup.component";
import { PledgeCardPopupComponent } from "../pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";

declare var $: any;
@Component({
  selector: "app-schedule-paymentcard-popup",
  templateUrl: "./schedule-paymentcard-popup.component.html",
  styleUrls: ["./schedule-paymentcard-popup.component.scss"],
  standalone: false,
})
export class SchedulePaymentCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Output() emtScheduleUpdate: EventEmitter<any> = new EventEmitter();

  selectedDateRange: any;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  scheduleNum: number;
  scheduleStatus: string;
  frequencyId: number;
  frequency: string;
  repeatTimes: number;
  accountName: string;
  accountNameJewish: string;
  campaignName: string;
  reasonName: string;
  locationName: string;
  collectorName: string;
  userName: string;
  scheduleAmount: number;
  createdDate: string;
  nextScheduleDt: string;
  nextScheduleDtJewish: string;

  deviceName: string;
  pastSchedules: any;
  upcomingSchedules: any;

  appliedToPledgeSchedules: Array<any> = [];
  totalAmount: number;
  openAmount: number = 0;
  paidAmount: number = 0;
  paidCount: number = 0;
  totalNotProcessed: number = 0;
  upcomingCount: number = 0;
  appliedToPledgeCount: number = 0;
  recentCount: number = 0;
  walletDescription: string;
  isCancelled: boolean = false;
  isFailed: boolean = false;
  cancelCount: number;
  cancelAmount: number;
  accountId: number = 0;
  totalCanceled: number;
  totalFailed: number;
  scheduleId: number;
  walletId: number;
  reasonId: number;
  locationId: number;
  campaignId: number;
  collectorId: number;
  count: number;
  status_class: string;
  originalTotal: number = 0;
  isAmountSame: boolean = false;
  latitude: string;
  longitude: string;
  // properties for edit next payment input datepicker
  nextDateEnable: boolean = false;
  selectedStartDate: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  minDate: any = moment(new Date());
  isSubmenuOpen: boolean = false;
  scheduleDetails: any;
  showTrans: boolean = false;
  showAction: boolean = false;
  accountNum: string;
  createdDateJewish: string;
  uniqueTransactionId: any;
  checkClicked: number = 0;
  modalNo: number = 0;
  isOpen: boolean = false;
  skeletonitems: any = [{}, {}, {}];
  skeletoncolitems: any = [{}, {}, {}, {}, {}];
  checkState = [{ modalNo: 0, isOpen: false }];
  i: number = 0;
  modalsNumber: any = 0;
  changeLog: string;
  makeTransactionPermission: boolean = false;
  paymentType: string;
  note: string;
  paymentId: number;
  isDisableMenuOptionsPopup: boolean = true;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private cardService: CardService,
    private scheduleService: ScheduleService,
    private pledgeService: PledgeService
  ) {}

  @Input() set SchedulePaymentCardData(SchedulePaymentCardValue: any) {
    if (SchedulePaymentCardValue) {
      this.scheduleDetails = SchedulePaymentCardValue;
      this.LoadScheduleCard(SchedulePaymentCardValue);
    }
  }
  @Output() clickevent = new EventEmitter<string>();

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });
    this.uniqueTransactionId = Guid.create();
    this.makeTransactionPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Transaction")
      .map((x) => x.isActive)[0];
  }

  LoadScheduleCard(SchedulePaymentCardValue: any) {
    this.scheduleId = SchedulePaymentCardValue.scheduleId;
    this.accountNum = SchedulePaymentCardValue.accountNum;
    this.count = SchedulePaymentCardValue.remaining;
    this.scheduleNum = SchedulePaymentCardValue.scheduleNum;
    this.accountId = SchedulePaymentCardValue.accountId;
    this.scheduleStatus =
      SchedulePaymentCardValue.scheduleStatus != null
        ? SchedulePaymentCardValue.scheduleStatus.toUpperCase()
        : null;
    this.campaignName = SchedulePaymentCardValue.campaignName;
    this.reasonName = SchedulePaymentCardValue.reasonName;
    this.locationName = SchedulePaymentCardValue.locationName;
    this.collectorName = SchedulePaymentCardValue.collectorName;
    this.userName = SchedulePaymentCardValue.userName;
    this.scheduleAmount = SchedulePaymentCardValue.scheduleAmount;
    this.frequency = SchedulePaymentCardValue.frequency;
    this.frequencyId = SchedulePaymentCardValue.frequencyId;
    this.repeatTimes = SchedulePaymentCardValue.repeatTimes;
    this.createdDate = SchedulePaymentCardValue.createdDate;
    this.nextScheduleDt = SchedulePaymentCardValue.nextScheduleDt;
    this.nextScheduleDtJewish = SchedulePaymentCardValue.nextScheduleDtJewish;
    this.deviceName = SchedulePaymentCardValue.deviceName;
    this.pastSchedules = SchedulePaymentCardValue.pastSchedules;
    this.upcomingSchedules = this.getupcomingSchedules(
      SchedulePaymentCardValue.upcomingSchedules
    );
    this.upcomingCount =
      SchedulePaymentCardValue.upcomingSchedules == null
        ? null
        : SchedulePaymentCardValue.upcomingSchedules.length;

    if (this.isHaveRelatedPledgePayments()) {
      this.appliedToPledgeSchedules =
        SchedulePaymentCardValue &&
        SchedulePaymentCardValue.lstRelatedPledgePayments &&
        SchedulePaymentCardValue.lstRelatedPledgePayments;
      this.appliedToPledgeCount =
        SchedulePaymentCardValue &&
        SchedulePaymentCardValue.lstRelatedPledgePayments &&
        SchedulePaymentCardValue.lstRelatedPledgePayments.length;
    } else {
      this.appliedToPledgeSchedules = [];
      this.appliedToPledgeCount = 0;
    }
    this.note = SchedulePaymentCardValue.note;
    this.totalNotProcessed = SchedulePaymentCardValue.totalNotProcessed;
    this.originalTotal = SchedulePaymentCardValue.originalTotal;
    this.recentCount =
      SchedulePaymentCardValue.pastSchedules == null
        ? null
        : SchedulePaymentCardValue.pastSchedules.length;
    this.createdDateJewish = SchedulePaymentCardValue.createdDateJewish;
    this.accountName = SchedulePaymentCardValue.accountName;
    this.accountNameJewish = SchedulePaymentCardValue.accountNameJewish;
    this.walletDescription = SchedulePaymentCardValue.walletDescription;
    this.totalCanceled = SchedulePaymentCardValue.totalCanceled;
    this.totalFailed = SchedulePaymentCardValue.totalFailed;
    this.walletId = SchedulePaymentCardValue.walletId;
    this.locationId = SchedulePaymentCardValue.locationId;
    this.campaignId = SchedulePaymentCardValue.campaignId;
    this.collectorId = SchedulePaymentCardValue.collectorId;
    this.reasonId = SchedulePaymentCardValue.reasonId;
    this.latitude = SchedulePaymentCardValue.latitude;
    this.longitude = SchedulePaymentCardValue.longitude;
    this.changeLog = SchedulePaymentCardValue.changeLog;
    this.paymentId = SchedulePaymentCardValue.paymentId;

    this.ApplyStatusClass(SchedulePaymentCardValue.scheduleStatus);
    this.CalculateAmountDifference(this.upcomingSchedules);
    this.openAmount = 0; // make it 0 to clear all previously added existng value in openAmount
    this.paidCount = 0;
    this.CalculateOpenAmount(SchedulePaymentCardValue.upcomingSchedules);
    this.CalculatePaidAmount(SchedulePaymentCardValue.pastSchedules);
    this.totalCanceled == null || this.totalCanceled == 0
      ? (this.isCancelled = false)
      : (this.isCancelled = true);
    this.totalFailed == null || this.totalFailed == 0
      ? (this.isFailed = false)
      : (this.isFailed = true);
    this.totalAmount = Number(this.openAmount) + Number(this.paidAmount);
    this.paymentType = SchedulePaymentCardValue.paymentType;
    this.isPaymentCheck(this.paymentType);
    this.isloading = false;
  }

  CalculateOpenAmount(upcomingSchedulesArray) {
    if (upcomingSchedulesArray) {
      if (upcomingSchedulesArray.length > 0) {
        this.openAmount = 0;
        for (const item of upcomingSchedulesArray) {
          this.openAmount += item.scheduleAmount;
        }
      }
    }
  }

  CalculateAmountDifference(upcomingSchedules) {
    if (this.upcomingSchedules && this.upcomingSchedules.length > 0) {
      var amountAry = this.upcomingSchedules.map((x) => x.scheduleAmount);
      this.isAmountSame = !!amountAry.reduce(function (a, b) {
        return a === b ? a : NaN;
      });
    }
  }

  ApplyStatusClass(status) {
    this.status_class = this.getStatusClss(status);
  }

  getStatusClss(status): string {
    if (status == "Canceled") {
      return "schdl_canceled";
    } else if (status == "Completed") {
      return "schdl_completed";
    } else if (status == "Failed") {
      return "schdl_failed d-flex align-items-center";
    } else if (status == "Pending") {
      return "schdl_pending";
    } else if (status == "Scheduled") {
      return "schdl_scheduled";
    } else if (status == "Refunded") {
      return "schdl_refunded";
    } else if (status == "Paused") {
      return "schdl_paused";
    } else if (status == "Success") {
      return "paymnt_success";
    } else if (status == "Declined") {
      return "paymnt_declined";
    } else if (status == "Error") {
      return "paymnt_error";
    } else if (status == "Voided") {
      return "paymnt_voided";
    } else if (status == "Retrying") {
      return "paymnt_retrying";
    } else if (status == "Resolved") {
      return "schdl_resolved";
    }
  }

  showTransMenu() {
    if (this.showTrans == false) {
      this.showTrans = true;
      return;
    }
    this.showTrans = false;
  }

  showActionMenu() {
    if (this.showAction == false) {
      this.showAction = true;
      return;
    }
    this.showAction = false;
  }

  isHaveRelatedPledgePayments() {
    return (
      this.scheduleDetails &&
      this.scheduleDetails.lstRelatedPledgePayments &&
      this.scheduleDetails.lstRelatedPledgePayments.length !== 0
    );
  }

  onClickedOutside() {
    this.showAction = false;
  }

  onClickedOut() {
    this.showTrans = false;
  }

  getupcomingSchedules(upcomingSchedules) {
    if (upcomingSchedules != null) {
      upcomingSchedules.forEach((element) => {
        if (element.scheduleId == null || element.scheduleId == "") {
          element.scheduleId = this.scheduleId;
        }
      });
    }
    return upcomingSchedules;
  }

  canPause(): Boolean {
    return this.scheduleStatus === "SCHEDULED";
  }

  canResume(): Boolean {
    return this.scheduleStatus === "PAUSED";
  }

  canPauseIndividual(status): Boolean {
    return status === "Scheduled";
  }

  canResumeIndividual(status): Boolean {
    return status === "Paused";
  }

  openEditSchedulePopup() {
    if (this.isHaveRelatedPledgePayments()) {
      return;
    }

    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_schedule",
      // state:true
    };
    this.checkClicked += 1;

    this.modalNo += 1;
    //this.isOpen=true;
    this.checkState.push({ modalNo: this.modalNo, isOpen: true });
    this.i++;
    //this.commonMethodService.checkModalState(this.checkState);

    const modalRef = this.commonMethodService.openPopup(
      EditScheduleCardComponent,
      this.modalOptions
    );
    modalRef.componentInstance.editingFromPage = "schedulePayment";

    modalRef.componentInstance.ScheduleId = this.scheduleId;
    modalRef.componentInstance.ScheduleValue = {
      amount: this.openAmount,
      notProcessed: this.totalNotProcessed,
      reasonId: this.reasonId,
      campaignId: this.campaignId,
      collectorId: this.collectorId,
      locationId: this.locationId,
      frequencyId: this.frequencyId,
      count: this.count,
      nextScheduleDt: this.nextScheduleDt,
      accountId: this.accountId,
      isAmountSame: this.isAmountSame,
      amtPerPayment: this.scheduleAmount,
      note: this.note,
    };
    modalRef.componentInstance.emtEditSchedule.subscribe((res) => {
      this.isloading = true;

      if (res) {
        var objScheduleCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          scheduleId: this.scheduleId,
        };
        this.cardService
          .getScheduleCard(objScheduleCard)
          .subscribe((res: any) => {
            // hide loader
            this.isloading = false;
            {
              this.LoadScheduleCard(res);
              this.commonMethodService.sendPaymentSchdleTrans(true);
              this.sendUpdatedScheduleData(res);
            }
          });
      }
    });

    modalRef.componentInstance.emtScheduleEdit.subscribe((res: any) => {
      this.emtScheduleUpdate.emit(res);
      this.reloadCardData();
    });
  }

  ResolveStatus(scheduleId, scheduleDate) {
    var objscheduleData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      MainScheduleId: scheduleId,
      EditScheduleDate: scheduleDate,
      NewStatusId: 8,
    };
    this.isloading = true;
    this.scheduleService.updateSingleSchedule(objscheduleData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
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
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
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

  OpenWalletDetails() {
    // this.checkClicked=true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup wallet_list",
    };

    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getWalletByAccountId(eventGuId, this.accountId)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            WalletlistPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.WalletData = res;
          modalRef.componentInstance.AccountId = this.accountId;
          modalRef.componentInstance.ScheduleId = this.scheduleId;
          modalRef.componentInstance.SelectedWallet = this.walletId;
          var objScheduleCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            scheduleId: this.scheduleId,
          };

          modalRef.componentInstance.emtUpdateWallet.subscribe((res) => {
            this.isloading = true;
            if (res) {
              this.cardService
                .getScheduleCard(objScheduleCard)
                .subscribe((res: any) => {
                  // hide loader
                  this.isloading = false;
                  {
                    this.LoadScheduleCard(res);
                    this.commonMethodService.sendPaymentSchdleTrans(true);
                  }
                });
            }
          });
        } else {
          //Swal.fire('No data found','','error');
          const modalRef = this.commonMethodService.openPopup(
            WalletlistPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.AccountId = this.accountId;
          modalRef.componentInstance.ScheduleId = this.scheduleId;
        }
      });
  }

  makeTransactionPopup() {
    //this.checkClicked=true;
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };

    this.modalNo += 1;
    this.checkState.push({ modalNo: this.modalNo, isOpen: true });
    this.i++;
    //this.commonMethodService.checkModalState(this.checkState);

    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.donorDetails = {
      jewishname: this.accountNameJewish,
      fullname: this.accountName,
      accountId: this.accountId,
    };
  }

  AddReminderPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reminder_card donar-r-card ",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReminderPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.scheduleDetails = {
      details: this.scheduleDetails,
    };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe((res) => {
      this.isloading = true;
      let objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        scheduleId: this.scheduleId,
      };
      this.cardService
        .getScheduleCard(objScheduleCard)
        .subscribe((res: any) => {
          this.isloading = false;
          {
            this.LoadScheduleCard(res);
          }
        });
    });
  }

  PausePendingPayment(scheduleId, scheduleDate) {
    var objscheduleData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      MainScheduleId: scheduleId,
      EditScheduleDate: scheduleDate,
      NewStatusId: 6,
    };
    this.isloading = true;
    this.scheduleService.updateSingleSchedule(objscheduleData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
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
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
      }
    );
  }

  DismissPendingPayment(scheduleId, scheduleDate) {
    var objscheduleData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      MainScheduleId: scheduleId,
      EditScheduleDate: scheduleDate,
      NewStatusId: 3,
    };
    this.isloading = true;
    this.scheduleService.updateSingleSchedule(objscheduleData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
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
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
      }
    );
  }

  OpenEditAmountPopup(scheduleId, scheduleDate, isEditAmount) {
    //this.checkClicked=true;
    if (isEditAmount) {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup edit_amtdate edit_amount",
      };
    } else {
      //this.checkClicked=true;
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup edit_amtdate edit_date",
      };
    }
    const modalRef = this.commonMethodService.openPopup(
      EditAmountdataPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.EditAmount = {
      scheduleId: scheduleId,
      scheduleDate: scheduleDate,
      isEditAmount: isEditAmount,
      title: "Edit Scheduled Payment",
    };

    modalRef.componentInstance.emtEditAmtUpdate.subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        this.emtScheduleUpdate.emit(res);
        this.reloadCardData();
      }
    });
  }

  CalculatePaidAmount(pastSchedulesArray) {
    if (pastSchedulesArray) {
      if (pastSchedulesArray.length > 0) {
        this.paidAmount = 0;
        {
          for (const item of pastSchedulesArray) {
            if (
              item.paymentStatus == "Success" ||
              item.paymentStatus == "Pending" ||
              item.paymentStatus == "Deposited"
            ) {
              this.paidAmount += item.paidAmount;
              this.paidCount += 1;
              item.status_class = "paid";
            }
            //  else if(item.paymentStatus=="Failed")
            //  {
            //   this.isCancelled=true;
            //   this.cancelAmount+=item.paidAmount;
            //   this.cancelAmount+=1;
            //  }
          }
        }
      }
    }
  }
  closePopup(i) {
    this.activeModal.dismiss();
  }

  datesUpdated(event) {
    this.selectedDateRange = event;
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }

  OpenDismissPaymentPopup() {
    // this.checkClicked=true;
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup dismiss_payment",
    };
    this.commonMethodService.openPopup(
      DismissPaymentPopupComponent,
      this.modalOptions
    );
  }

  openPaymentCardPopup(paymentId) {
    //this.checkClicked=true;
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup payment_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentCardPopupComponent,
      this.modalOptions
    );
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: paymentId,
    };
    this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.PaymentCardData = res;
    });
  }

  reloadCardData() {
    // reload card data
    var objScheduleCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      scheduleId: this.scheduleId,
    };
    // this.isloading = true;
    this.cardService
      .getScheduleCard(objScheduleCard)
      .subscribe((respaused: any) => {
        // hide loader
        this.isloading = false;
        {
          this.LoadScheduleCard(respaused);
        }
      });
  }

  onPauseClick() {
    var objWalletData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ScheduleId: this.scheduleId,
      WalletId: null,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      Status: "PAUSED",
    };
    this.isloading = true;
    this.scheduleService.putScheduleUpdateWallet(objWalletData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
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
            this.reloadCardData();
            this.emtScheduleUpdate.emit(res);
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
        console.log(err);
      }
    );
  }

  onCancel() {
    var objWalletData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ScheduleId: this.scheduleId,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      StatusId: 3,
    };
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
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
      }
    );
  }

  checkForSubmenu() {
    if (this.upcomingSchedules && this.upcomingSchedules.length !== 0) {
      const nextScheduleObj = this.upcomingSchedules[0];

      let nextDt = moment(nextScheduleObj.scheduleDate);
      let today = moment(new Date());
      if (nextDt.diff(today, "days") < 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onSimpleResume() {
    if (this.upcomingSchedules && this.upcomingSchedules.length !== 0) {
      const nextScheduleObj = this.upcomingSchedules[0];
      let objWalletData = {
        EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        ScheduleId: this.scheduleId,
        WalletId: null,
        UpdatedBy: this.localstoragedataService.getLoginUserId(),
        NextScheduleDate: nextScheduleObj.scheduleDate,
        Status: "SCHEDULED",
      };
      this.isloading = true;
      this.scheduleService.putScheduleUpdateWallet(objWalletData).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
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
              this.emtScheduleUpdate.emit(res);
              this.reloadCardData();
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
          console.log(err);
        }
      );
    } else {
      Swal.fire({
        title: "No Upcoming schedules",
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
  }

  onLeaveClick() {
    if (this.upcomingSchedules && this.upcomingSchedules.length !== 0) {
      const nextScheduleObj = this.upcomingSchedules[0];
      let objWalletData = {
        EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        ScheduleId: this.scheduleId,
        WalletId: null,
        UpdatedBy: this.localstoragedataService.getLoginUserId(),
        Status: "SCHEDULED",
      };

      this.isloading = true;
      this.scheduleService
        .putScheduleUpdateWallet({
          ...objWalletData,
          NextScheduleDate: nextScheduleObj.scheduleDate,
        })
        .subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              Swal.fire({
                title: "Previous payments",
                text: "Will be processed in the next 24 hours",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.isSubmenuOpen = false;
                this.emtScheduleUpdate.emit(res);
                this.reloadCardData();
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
            console.log(err);
          }
        );
    } else {
      Swal.fire({
        title: "No Upcoming schedules",
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
  }

  onResumeClick() {
    if (this.upcomingSchedules && this.upcomingSchedules.length !== 0) {
      /*this.modalOptions = {
          centered: true,
          size: 'lg',
          backdrop : 'static',
          keyboard : false,
          windowClass: 'drag_popup next_schedule_date'
        };

        let objWalletData = {
          EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          ScheduleId:this.scheduleId,
          WalletId: null,
          UpdatedBy:this.localstoragedataService.getLoginUserId(),
          Status: "SCHEDULED"
        }

        const modalRef = this.commonMethodService.openPopup(NextScheduleDatePopupComponent, this.modalOptions);

        modalRef.componentInstance.emtOutputDate.subscribe(($e) => {
          this.isloading = true;
          this.scheduleService.putScheduleUpdateWallet({...objWalletData, NextScheduleDate: $e}).subscribe((res: any) => {
            this.isloading = false;
            if(res) {
              Swal.fire("Schedule Updated",'','success').then(()=>{
                this.emtScheduleUpdate.emit(res);
                this.reloadCardData()
              })
            }
            else {
              Swal.fire(this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),'','error');
            }
          }, err => {
            console.log(err);
          });
        });*/

      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup edit_schedule next_edit_schedule",
      };

      const modalRef = this.commonMethodService.openPopup(
        NextScheduleEditPopupComponent,
        this.modalOptions
      );

      modalRef.componentInstance.ScheduleCardData = {
        totalAmount: this.openAmount,
        repeatTimes: this.upcomingCount,
        frequencyId: this.frequencyId,
        frequency: this.frequency,
      };

      let objWalletData = {
        EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        ScheduleId: this.scheduleId,
        WalletId: null,
        UpdatedBy: this.localstoragedataService.getLoginUserId(),
        Status: "SCHEDULED",
      };

      modalRef.componentInstance.emtOutputDate.subscribe(($e) => {
        this.isloading = true;

        this.scheduleService
          .putScheduleUpdateWallet({ ...objWalletData, NextScheduleDate: $e })
          .subscribe(
            (res: any) => {
              this.isloading = false;
              if (res) {
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
                  this.emtScheduleUpdate.emit(res);
                  this.reloadCardData();
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
              console.log(err);
            }
          );
      });
    } else {
      Swal.fire({
        title: "No Upcoming schedules",
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
  }

  onIndividualResume(data) {
    this.isloading = true;
    let objWalletData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      MainScheduleId: this.scheduleId,
      WalletId: null,
      NewStatusId: 1,
      EditScheduleDate: data.scheduleDate,
      NewScheduleDate: data.newScheduleDate,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
    };

    this.scheduleService.updateSingleSchedule(objWalletData).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
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
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
      }
    );
  }

  isDisable() {
    if (this.selectedStartDate.startDate === null) {
      return true;
    }
    return false;
  }

  onResumeClickNew() {
    if (this.upcomingSchedules && this.upcomingSchedules.length !== 0) {
      this.nextDateEnable = true;
    } else {
      Swal.fire({
        title: "No Upcoming schedules",
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
  }

  resumeSaved() {
    let objWalletData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ScheduleId: this.scheduleId,
      WalletId: null,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      Status: "SCHEDULED",
      NextScheduleDate: this.selectedStartDate.startDate.format("YYYY-MM-DD"),
    };

    this.isloading = true;

    this.scheduleService.putScheduleUpdateWallet(objWalletData).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
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
            this.isSubmenuOpen = false;
            this.emtScheduleUpdate.emit(res);
            this.reloadCardData();
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
        console.log(err);
      }
    );
  }

  openSubmenu(event) {
    this.isSubmenuOpen = true;
  }
  executeSchedule(scheduleId) {
    var obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      modifiedBy: this.localstoragedataService.getLoginUserId(),
      scheduleId: scheduleId, //this.scheduleId,
      uniqueTransactionId: this.uniqueTransactionId.value,
    };
    this.isloading = true;
    this.scheduleService.executeSchedule(obj).subscribe(
      (res: any) => {
        //console.log(res);
        this.isloading = false;
        Swal.fire({
          title: res.responseTitle,
          text: res.errorResponse,
          icon: res.paymentStatus.toLowerCase(),
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      },
      (err) => {
        this.isloading = false;
        console.log(err);
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
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

  openMapCardPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reason_card payment_card_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      MapViewCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.MapViewCardData = {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
  CheckStatusShowHide(status) {
    if (status == "CANCELED") {
      return false;
    } else if (status == "COMPLETED") {
      return false;
    } else {
      return true;
    }
  }
  getStatusClass(status): string {
    if (status == "Canceled") {
      return "schdl_canceled";
    } else if (status == "Completed") {
      return "schdl_completed";
    } else if (status == "Failed") {
      return "schdl_failed";
    } else if (status == "Pending") {
      return "schdl_pending";
    } else if (status == "Scheduled") {
      return "schdl_scheduled";
    } else if (status == "Paused") {
      return "schdl_paused";
    } else if (status == "Success") {
      return "paymnt_success";
    } else if (status == "Declined") {
      return "paymnt_declined";
    } else if (status == "Error") {
      return "paymnt_error";
    } else if (status == "Voided") {
      return "paymnt_voided";
    } else if (status == "Retrying") {
      return "paymnt_retrying";
    }
  }
  isPaymentCheck(status) {
    if (status != "Check") {
      $(".card_info").css("display", "flex");
      $(".seprator").css("display", "flex");
    }
  }

  sendUpdatedScheduleData(res) {
    const scheduleValue = {
      totalOpen: this.openAmount,
      notProcessed: this.totalNotProcessed,
      reasonId: this.reasonId,
      campaignId: this.campaignId,
      collectorId: this.collectorId,
      locationId: this.locationId,
      frequencyId: this.frequencyId,
      count: this.count,
      nextScheduleDt: this.nextScheduleDt,
      accountId: this.accountId,
      isAmountSame: this.isAmountSame,
      amtPerPayment: this.scheduleAmount,
      scheduleId: res.scheduleId,
      firstScheduleId: res.scheduleId,
    };
    const obj = Object.assign({}, res, scheduleValue);
    this.commonMethodService.sendScheduleSingle(obj);
  }
  isReminderDisplay() {
    return this.accountNum == "DEFAULT" ? false : true;
  }
  openPledgeCardPopup(pledgeId) {
    if (pledgeId != null && pledgeId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup pledgeCard",
      };
      const modalRef = this.commonMethodService.openPopup(
        PledgeCardPopupComponent,
        this.modalOptions
      );
      let eventGuid = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuid, pledgeId)
        .subscribe((res: any) => {
          this.isloading = false;
          modalRef.componentInstance.PledgeCardData = res;
          modalRef.componentInstance.emtPledgeUpdate.subscribe(($e) => {});
        });
    }
  }
}
