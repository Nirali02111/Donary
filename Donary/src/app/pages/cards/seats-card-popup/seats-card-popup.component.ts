import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { PledgeService } from "src/app/services/pledge.service";
import { SeatService } from "src/app/services/seat.service";
import { TagService } from "src/app/services/tag.service";
import Swal from "sweetalert2";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";

import { DonorCardPopupComponent } from "../donor-card-popup/donor-card-popup.component";
import { PaymentCardPopupComponent } from "../payment-card-popup/payment-card-popup.component";
import { PledgeCardPopupComponent } from "../pledge-card-popup/pledge-card-popup.component";
import { SaveSeatPopupComponent } from "../save-seat-popup/save-seat-popup.component";
import { SchedulePaymentCardPopupComponent } from "../schedule-card-popup/schedule-paymentcard-popup.component";
declare var $: any;
@Component({
  selector: "app-seats-card-popup",
  templateUrl: "./seats-card-popup.component.html",
  styleUrls: ["./seats-card-popup.component.scss"],
  standalone: false,
})
export class SeatsCardPopupComponent implements OnInit {
  modalOptions: NgbModalOptions;
  window_class = "drag_popup donor_card father_card";
  initial = 0;
  navTabId = 0;
  price: number;
  rowNum: string;
  seatNote: string;
  seatNum: string;
  location: string;
  aisle: boolean;
  pledgePayments: any;
  ownerRenterHistory: any;
  section: string;
  accountNum: string;
  fullName: string;
  fullNameJewish: string;
  phoneNumber: string;
  careOf: string;
  houseNum: string;
  unit: string;
  streetName: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  campaignIdFromSeat: number = 0;
  createdBy: string;
  createdDate: string;
  jewishCreatedDate: string;
  seatReservedType: string;
  address: string;
  father: string;
  fatherInLaw: string;
  source: string;
  season: string;
  fatherId: Number;
  fatherInLawId: Number;
  seatId;
  SeatValueApi;
  SeatValueitem;
  isloading: boolean = true;
  paidStatus;
  @Input() isPaymentFromEditSeat: boolean;
  @Input() amountFromSeatPaymentType: number;
  @Output() emtOpenSeatCard: EventEmitter<any> = new EventEmitter();
  @Input() SeatValueItemFromPledgeCard: number;
  @Input() isNotifyDonarEmailShow: any;
  @Output() emtSeatSave: EventEmitter<any> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private localstoragedataService: LocalstoragedataService,
    public tagService: TagService,
    public seatService: SeatService,
    public pledgeService: PledgeService
  ) {}

  // @Input() set seatIdData(seatId_: any) {
  //   if (seatId_) {
  //     this.seatId = seatId_;
  //   }
  // }
  @Input() set SeatValueItem(item: any) {
    if (item) {
      this.SeatValueitem = item;
    }
  }
  @Input() set SeatCardData(SeatCardValue: any) {
    if (SeatCardValue) {
      this.SeatValueApi = SeatCardValue;
      this.setValue(SeatCardValue);
    }
  }
  setValue(SeatCardValue: any) {
    this.price = SeatCardValue.price;
    this.rowNum = SeatCardValue.rowNum;
    this.seatNote = SeatCardValue.seatNote;
    this.seatNum = SeatCardValue.seatNum;
    this.location = SeatCardValue.location;
    this.aisle = SeatCardValue.aisle;
    this.pledgePayments = SeatCardValue.pledgePayments;
    this.ownerRenterHistory = SeatCardValue.ownerRenterHistory;
    this.section = SeatCardValue.section;
    this.phoneNumber = SeatCardValue.phoneNumber;
    this.houseNum = SeatCardValue.houseNum ? SeatCardValue.houseNum : "";
    this.unit = SeatCardValue.unit ? SeatCardValue.unit : "";
    this.streetName = SeatCardValue.streetName ? SeatCardValue.streetName : "";
    this.city = SeatCardValue.city ? SeatCardValue.city : "";
    this.state = SeatCardValue.state ? SeatCardValue.state : "";
    this.zip = SeatCardValue.zip ? SeatCardValue.zip : "";
    this.country = SeatCardValue.country ? SeatCardValue.country : "";
    this.campaignIdFromSeat = SeatCardValue.campaignID
      ? SeatCardValue.campaignID
      : "";
    this.address =
      this.houseNum +
      " " +
      this.unit +
      " " +
      this.streetName +
      " " +
      this.city +
      " " +
      this.city +
      " " +
      this.state +
      " " +
      this.zip +
      " " +
      this.country;
    this.seatReservedType = SeatCardValue.seatReservedType;
    this.fullName = SeatCardValue.fullName;
    this.fullNameJewish = SeatCardValue.fullNameJewish;
    this.accountNum = SeatCardValue.accountNum;

    this.createdBy = SeatCardValue.createdBy;
    this.createdDate = SeatCardValue.createdDate;
    this.jewishCreatedDate = SeatCardValue.jewishCreatedDate;
    this.father = SeatCardValue.father;
    this.fatherInLaw = SeatCardValue.fatherInLaw;
    this.source = SeatCardValue.source;
    this.season = SeatCardValue.season;
    this.fatherId = SeatCardValue.fatherId;
    this.fatherInLawId = SeatCardValue.fatherInLawId;
    this.seatId = SeatCardValue.seatId;
    this.paidStatus = SeatCardValue.paidStatus;
    this.isloading = false;
  }
  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".diglog_header",
        cursor: "grab",
        cancel: ".donor_name,.sort_num",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  OpenDonorCard(accountID, SecondCardId) {
    if (accountID) {
      this.isloading = true;
      this.navTabId = SecondCardId;
      this.window_class =
        "drag_popup donor_card father_card" +
        "_" +
        this.commonMethodService.initialDonorCard;
      //  this.isloading = false;

      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: this.window_class,
      };
      this.commonMethodService.initialDonorCard += 1;

      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountID,
      };
      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            DonorCardPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.AccountId = accountID;
          this.isloading = false;
          modalRef.componentInstance.DonorCardData = res;
        } else {
          Swal.fire({
            title: "No data found",
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
      });
    }
  }
  EditSeatPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup save_seat",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveSeatPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.SeatData = this.SeatValueApi;
    modalRef.componentInstance.SeatValue = this.SeatValueitem;
    modalRef.componentInstance.isNotifyDonarEmailShow =
      this.isNotifyDonarEmailShow;
    modalRef.componentInstance.SeatTitle = "EDITSEAT";
    modalRef.componentInstance.isPaymentFromEditSeat =
      this.isPaymentFromEditSeat;
    modalRef.componentInstance.amountFromSeatPaymentType =
      this.amountFromSeatPaymentType;

    modalRef.componentInstance.seatFromPledge =
      this.SeatValueItemFromPledgeCard;
    modalRef.componentInstance.emtSeatSave.subscribe((res: any) => {
      if (res) {
        this.activeModal.close();
        this.emtSeatSave.emit(true);
      }
    });

    modalRef.componentInstance.emtOpenSeatCard.subscribe((res: any) => {
      if (res) {
        this.emtOpenSeatCard.emit(true);

        this.isloading = true;
      }
    });
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
      var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuid, pledgeId)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          modalRef.componentInstance.PledgeCardData = res;
        });
    }
  }

  openPaymentCardPopup(paymentId) {
    if (paymentId != null && paymentId != 0) {
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
  }

  openScheduleCardPopup(scheduleId) {
    if (scheduleId != null && scheduleId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: false,
        keyboard: true,
        windowClass: "drag_popup schedule_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        SchedulePaymentCardPopupComponent,
        this.modalOptions
      );
      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        scheduleId: scheduleId,
      };
      this.cardService.getScheduleCard(objDonorCard).subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.SchedulePaymentCardData = res;
      });
    }
  }

  openPopupByType(transationId, item) {
    if (item.type == "Pledge") {
      let pledgeId = transationId;
      this.openPledgeCardPopup(pledgeId);
    } else if (item.type == "Payment") {
      let paymentId = transationId;
      this.openPaymentCardPopup(paymentId);
    } else if (item.type == "Schedule") {
      let scheduleId = transationId;
      this.openScheduleCardPopup(scheduleId);
    } else {
    }
  }

  openDonorCardPopup(accountID) {
    if (accountID != null && accountID != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        DonorCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.AccountId = accountID;
      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountID,
      };

      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      });
    }
  }

  SaveSeatPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup save_seat",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveSeatPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.SeatData = this.SeatValueApi;
    modalRef.componentInstance.SeatValue = this.SeatValueitem;
    modalRef.componentInstance.SeatTitle = "Reserve Seat";
    modalRef.componentInstance.AddSeat = true;
  }
  makeTransactionPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const pledgeId = this.getPledgeIdArray();
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
    let seatparams = {
      label: this.SeatValueApi.label,
      seatReservedType: this.SeatValueitem.seatReservedType,
      isSeatPayNow: true,
      price: this.price,
      donorId: this.SeatValueitem.donorId,
      campaignId: this.campaignIdFromSeat,
      pledgeId: pledgeId,
    };
    modalRef.componentInstance.SeatData = seatparams;
    modalRef.componentInstance.pledgePaid = this.pledgePayments;
    modalRef.componentInstance.paidStatus = this.paidStatus;

    modalRef.componentInstance.emtPaymentTrans.subscribe((res: any) => {
      if (res) {
        this.isloading = true;
        this.emtOpenSeatCard.emit(true);
      }
    });
  }

  getPledgeIdArray() {
    if (this.pledgePayments && this.pledgePayments.length !== 0) {
      const result = this.pledgePayments.filter((x) => x.type === "Pledge");
      return result.map((x) => x.transactionId);
    }

    return [];
  }
  class_fatherId;
  class_fatherInLawId;
  contains_heb_fatherId(str, fatherId) {
    if (fatherId) {
      this.class_fatherId = "";
    } else {
      this.class_fatherId = "class-not-fatherId";
    }
    return /[\u0590-\u05FF]/.test(str);
  }
  contains_heb_fatherInLawId(str, fatherInLawId) {
    if (fatherInLawId) {
      this.class_fatherInLawId = "";
    } else {
      this.class_fatherInLawId = "class-not-fatherId";
    }
    return /[\u0590-\u05FF]/.test(str);
  }
  get isPartiallyPaid() {
    return this.paidStatus === "Partially Paid";
  }
}
