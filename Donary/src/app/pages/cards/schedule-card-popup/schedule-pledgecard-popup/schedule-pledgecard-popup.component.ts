import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AddTransactionPopupComponent } from "src/app/pages/make-transaction/add-transaction-popup/add-transaction-popup.component";
import { CardService } from "src/app/services/card.service";
import { ScheduleService } from "./../../../../services/schedule.service";
import Swal from "sweetalert2";
import * as moment from "moment";

import { DismissPaymentPopupComponent } from "../dismiss-payment-popup/dismiss-payment-popup.component";
import { EditAmountdataPopupComponent } from "../edit-amountdata-popup/edit-amountdata-popup.component";
import { EditScheduleCardComponent } from "../edit-schedule-card/edit-schedule-card.component";

import { NextScheduleEditPopupComponent } from "./../next-schedule-edit-popup/next-schedule-edit-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { PledgeCardPopupComponent } from "../../pledge-card-popup/pledge-card-popup.component";
import { ReminderPopupComponent } from "src/app/pages/notifications/reminder-popup/reminder-popup.component";
import { WalletlistPopupComponent } from "../walletlist-popup/walletlist-popup.component";

declare var $: any;
@Component({
  selector: "app-schedule-pledgecard-popup",
  templateUrl: "./schedule-pledgecard-popup.component.html",
  styleUrls: ["./schedule-pledgecard-popup.component.scss"],
  standalone: false,
})
export class SchedulePledgecardPopupComponent implements OnInit {
  @Output() emtScheduleUpdate: EventEmitter<any> = new EventEmitter();
  skeletonitems: any = [{}, {}, {}];
  skeletoncolitems: any = [{}, {}, {}, {}, {}, {}];
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  scheduleId: number;
  note: string;
  accountNum: string;
  scheduleNum: number;
  scheduleStatus: string;
  frequency: string;
  frequencyId: number;
  totalNotProcessed: number = 0;
  reasonId: number;
  collectorId: number;
  repeatTimes: number;
  accountName: string;
  accountNameJewish: string;
  campaignName: string;
  reasonName: string;
  locationName: string;
  collectorName: string;
  userName: string;
  locationId: number;
  scheduleAmount: number;
  createdDate: string;
  nextScheduleDt: string;
  nextScheduleDtJewish: string;
  createdDateJewish: string;
  deviceName: string;
  pastSchedules: any;
  campaignId: number;
  count: number;
  upcomingSchedules: any;
  appliedToPledgeSchedules: Array<any> = [];
  upcomingCount: number = 0;
  appliedToPledgeCount: number = 0;
  isSubmenuOpen: boolean = false;
  selectedStartDate: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  recentCount: number = 0;
  totalAmount: number;
  paidAmount: number = 0;
  paidCount: number = 0;
  checkClicked: number = 0;
  modalNo: number = 0;
  openAmount: number = 0;
  pledgesLeft: string;
  status_class: string;
  walletId: number;
  checkState = [{ modalNo: 0, isOpen: false }];
  i: number = 0;
  accountId: number = 0;
  scheduleDetails: any;
  isAmountSame: boolean = false;
  makeTransactionPermission: boolean = false;
  showTrans: boolean = false;
  showAction: boolean = false;
  changeLog: string;
  recentAmount: number = 0;
  donorService: any;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private scheduleService: ScheduleService,
    private pledgeService: PledgeService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });

    this.makeTransactionPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Transaction")
      .map((x) => x.isActive)[0];
  }

  @Input() set SchedulePaymentCardData(SchedulePaymentCardValue: any) {
    if (SchedulePaymentCardValue) {
      this.scheduleDetails = SchedulePaymentCardValue;
      this.LoadScheduleCard(SchedulePaymentCardValue);
    }
  }

  LoadScheduleCard(SchedulePaymentCardValue: any) {
    this.scheduleId = SchedulePaymentCardValue.scheduleId;
    this.note = SchedulePaymentCardValue.note;
    this.accountNum = SchedulePaymentCardValue.accountNum;
    this.scheduleNum = SchedulePaymentCardValue.scheduleNum;
    this.accountId = SchedulePaymentCardValue.accountId;
    this.scheduleStatus = SchedulePaymentCardValue.scheduleStatus;
    this.campaignName = SchedulePaymentCardValue.campaignName;
    this.reasonName = SchedulePaymentCardValue.reasonName;
    this.locationName = SchedulePaymentCardValue.locationName;
    this.collectorName = SchedulePaymentCardValue.collectorName;
    this.scheduleAmount = SchedulePaymentCardValue.scheduleAmount;
    this.userName = SchedulePaymentCardValue.userName;
    this.frequency = SchedulePaymentCardValue.frequency;
    this.frequencyId = SchedulePaymentCardValue.frequencyId;
    this.repeatTimes = SchedulePaymentCardValue.repeatTimes;
    this.createdDate = SchedulePaymentCardValue.createdDate;
    this.nextScheduleDt = SchedulePaymentCardValue.nextScheduleDt;
    this.nextScheduleDtJewish = SchedulePaymentCardValue.nextScheduleDtJewish;
    this.createdDateJewish = SchedulePaymentCardValue.createdDateJewish;
    this.deviceName = SchedulePaymentCardValue.deviceName;
    this.pastSchedules = SchedulePaymentCardValue.pastSchedules;
    this.totalNotProcessed = SchedulePaymentCardValue.totalNotProcessed;
    this.reasonId = SchedulePaymentCardValue.reasonId;
    this.campaignId = SchedulePaymentCardValue.campaignId;
    this.locationId = SchedulePaymentCardValue.locationId;
    this.count = SchedulePaymentCardValue.remaining;
    this.collectorId = SchedulePaymentCardValue.collectorId;
    this.upcomingSchedules = this.getupcomingSchedules(
      SchedulePaymentCardValue.upcomingSchedules
    );
    this.upcomingCount =
      SchedulePaymentCardValue.upcomingSchedules == null
        ? null
        : SchedulePaymentCardValue.upcomingSchedules.length;
    this.recentAmount = SchedulePaymentCardValue.recentAmount;
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

    this.recentCount =
      SchedulePaymentCardValue.pastSchedules == null
        ? null
        : SchedulePaymentCardValue.pastSchedules.length;
    this.accountName = SchedulePaymentCardValue.accountName;
    this.accountNameJewish = SchedulePaymentCardValue.accountNameJewish;
    this.totalAmount = SchedulePaymentCardValue.totalAmount;
    this.pledgesLeft =
      (SchedulePaymentCardValue.remaining == null
        ? ""
        : SchedulePaymentCardValue.remaining) +
      "/" +
      (SchedulePaymentCardValue.repeatTimes == null
        ? ""
        : SchedulePaymentCardValue.repeatTimes);
    this.CalculateAmountDifference(SchedulePaymentCardValue.upcomingSchedules);
    this.CalculateOpenAmount(SchedulePaymentCardValue.upcomingSchedules);
    this.CalculatePaidAmount(SchedulePaymentCardValue.pastSchedules);
    this.ApplyStatus(SchedulePaymentCardValue.scheduleStatus);
    this.walletId = SchedulePaymentCardValue.walletId;
    this.paidAmount = SchedulePaymentCardValue.paidAmount; //added new
    this.isloading = false;
    this.changeLog = SchedulePaymentCardValue.changeLog;
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
    };
    this.checkClicked += 1;

    this.modalNo += 1;
    this.checkState.push({ modalNo: this.modalNo, isOpen: true });
    this.i++;

    const modalRef = this.commonMethodService.openPopup(
      EditScheduleCardComponent,
      this.modalOptions
    );
    modalRef.componentInstance.editingFromPage = "schedulePledge";
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
    modalRef.componentInstance.emtEditSchedule.subscribe((res: any) => {
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
              this.commonMethodService.sendPledgeSchdleTrans(true);
              this.sendUpdatedScheduleData(res);
            }
          });
      }
    });
  }
  CalculateAmountDifference(upcomingSchedules) {
    if (this.upcomingSchedules && this.upcomingSchedules.length > 0) {
      var amountAry = this.upcomingSchedules.map((x) => x.scheduleAmount);
      this.isAmountSame = !!amountAry.reduce(function (a, b) {
        return a === b ? a : NaN;
      });
    }
  }

  ApplyStatus(status) {
    this.status_class = this.getStatusClss(status);
  }

  getStatusClss(status): string {
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
    }
    if (status == "Success") {
      return "paymnt_success";
    } else if (status == "Declined") {
      return "paymnt_declined";
    } else if (status == "Error") {
      return "paymnt_error";
    } else if (status == "Voided") {
      return "paymnt_voided";
    } else if (status == "Paid") {
      //added new
      return "paymnt_success";
    }
  }

  canPause(): Boolean {
    return this.scheduleStatus === "Scheduled";
  }

  canResume(): Boolean {
    return this.scheduleStatus === "Paused";
  }

  isHaveRelatedPledgePayments() {
    return (
      this.scheduleDetails &&
      this.scheduleDetails.lstRelatedPledgePayments &&
      this.scheduleDetails.lstRelatedPledgePayments.length !== 0
    );
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

  closePopup() {
    this.activeModal.dismiss();
  }
  makeTransactionPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
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

  CalculatePaidAmount(pastSchedulesArray) {
    if (pastSchedulesArray) {
      if (pastSchedulesArray.length > 0) {
        this.paidAmount = 0;
        {
          for (const item of pastSchedulesArray) {
            if (item.paymentStatus == "Success") {
              this.paidAmount += item.paidAmount;
              this.paidCount += 1;
              item.status_class = "paid";
            }
          }
        }
      }
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

  onClickedOutside() {
    this.showAction = false;
  }

  onClickedOut() {
    this.showTrans = false;
  }

  OpenDismissPaymentPopup() {
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
                    this.commonMethodService.sendPledgeSchdleTrans(true);
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

  openPledgeCardPopup(pledgeId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup pledgeCard",
    };

    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    const modalRef = this.commonMethodService.openPopup(
      PledgeCardPopupComponent,
      this.modalOptions
    );

    this.pledgeService.GetPledgeCard(eventGuId, pledgeId).subscribe((res) => {
      this.isloading = false;

      modalRef.componentInstance.PledgeCardData = res;
    });
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

  PausePendingPledge(scheduleId, scheduleDate) {
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
            text: res,
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
  isDisable() {
    if (this.selectedStartDate.startDate === null) {
      return true;
    }
    return false;
  }

  DismissPendingPledge(scheduleId, scheduleDate) {
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

  OpenEditAmountPopup(scheduleId, scheduleDate, isEditAmount) {
    if (isEditAmount) {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup edit_amtdate edit_amount",
      };
    } else {
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
      title: "Edit Scheduled Pledge",
    };

    modalRef.componentInstance.emtEditAmtUpdate.subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        this.emtScheduleUpdate.emit(res);
        this.reloadCardData();
      }
    });
  }

  reloadCardData() {
    // reload card data
    var objScheduleCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      scheduleId: this.scheduleId,
    };
    this.isloading = true;
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

  onCancel() {
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
  CheckStatusShowHide(status) {
    if (status && status.toUpperCase() == "CANCELED") {
      return false;
    } else if (status && status.toUpperCase() == "COMPLETED") {
      return false;
    } else {
      return true;
    }
  }
  isReminderDisplay() {
    return this.accountNum == "DEFAULT" ? false : true;
  }
}
