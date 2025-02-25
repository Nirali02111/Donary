import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SeatService } from "src/app/services/seat.service";
import Swal from "sweetalert2";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { EmailAddressPopupComponent } from "../../make-transaction/email-address-popup/email-address-popup.component";
import { PhoneNumberPopupComponent } from "../../make-transaction/phone-number-popup/phone-number-popup.component";
import { EventService } from "src/app/services/event.service";
import { MessengerService } from "src/app/services/messenger.service";
import { environment } from "src/environments/environment";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;

@Component({
  selector: "app-save-seat-popup",
  templateUrl: "./save-seat-popup.component.html",
  standalone: false,
  styleUrls: ["./save-seat-popup.component.scss"],
})
export class SaveSeatPopupComponent implements OnInit {
  @Output() emtSeatSave: EventEmitter<any> = new EventEmitter();
  @Output() emtOpenSeatCard: EventEmitter<any> = new EventEmitter();
  modalOptions: NgbModalOptions;
  donor: string = "";
  notes: string;
  reservationStatus: any = [];
  //reservationDropdown:any=[];
  isloading: boolean = false;
  showBox: boolean = false;
  isGlobalList: boolean = true;
  displaySearchIcon = false;
  selectedDonorId: string;
  campaignId: string;
  campaignIdFromGetSeat: number = 0;
  seatId: number;
  price: string;
  priceValue: number = 0;
  seatSaleId: string;
  label: string;
  seatPopupTitle = "Reserve Seat";
  isAddSeat: boolean = false;
  isReservationstatus = false;
  selectCampingSeason: any;
  isSeasonrequired = false;
  paidStatus: string;
  oldSelectedDonorId: string;
  isDeletedDonorId: boolean = false;
  priceMsg: string = "";
  @Input() seatFromPledge: number;
  inactiveDonor: string = "InActive";
  isDevEnv: boolean;
  EmailCheckbox: boolean = false;
  notifyDonarEmail: any;
  notifyDonarEmailArray = [];
  notifyDonarPhoneArray = [];
  notifyDonarPhoneNumber: any = { phone: "Select Phone", label: "" };

  isDonorSelected: boolean = false;
  isOnlyPledgePayment: boolean = false;
  pledgeId: string;

  isDropDownOpen: boolean = false;
  isSmsDropDownOpen: boolean = false;

  //some options commented in reservationDropdown , add later if required
  reservationDropdown = [
    { id: "One Time Rental", itemName: "One Time Rental" },
    { id: "Reserved", itemName: "Reserved" },
  ];
  checkFieldVal: boolean = false;
  @Input() isPaymentFromEditSeat: boolean;
  @Input() amountFromSeatPaymentType: number;

  stickerName: string;
  PhoneCheckbox: boolean = false;
  toShowCancelSave: boolean = false;
  pledgePayments: any;
  @Input() set SeatTitle(title: string) {
    if (title) {
      this.seatPopupTitle = title;
    }
  }

  @Input() set SeatData(data: any) {
    if (data) {
      this.toShowCancelSave =
        data.seatReservedType === "Reserved" ||
        (data.seatReservedType === null && data.pledgePayments === null);
      this.pledgePayments = data.pledgePayments;
      this.campaignIdFromGetSeat = data.campaignID;
      this.notes = data.seatNote;
      this.priceValue = data.price;
      this.price = data.price;
      this.donor = data.fullNameJewish ? data.fullNameJewish : data.fullName;
      if (this.donor === "" || this.donor === null) {
        this.isDeletedDonorId = true;
        this.removeDonor = true;
      }
      this.isDonorSelected = true;
      this.stickerName = data.label;
      this.removeDonor = !data.fullName && !data.fullNameJewish ? true : false;

      if (data.seatReservedType !== null && data.seatReservedType !== "") {
        this.reservationDropdown.map((el) => {
          if (el.itemName === data.seatReservedType) {
            this.reservationStatus.push({ id: el.id, itemName: el.itemName });
          }
        });
      }

      this.reservationStatus
        ? this.onStatusSelect(this.reservationStatus[0])
        : undefined;
      this.selectCampingSeason =
        this.commonMethodService.localSeasonList.filter(
          (x) => x.itemName == data.season
        );
      this.paidStatus = data.paidStatus;
      if (data.season === null || data.season === "") {
        this.checkFieldVal = false;
      } else {
        this.checkFieldVal = true;
        this.commonMethodService.localCampaignList.map((el) => {
          if (data.season.toLowerCase() === el.itemName.toLowerCase()) {
            this.selectCampingSeason.push(el);
          }
        });
      }

      if (this.donor) {
        this.search(this.donor);
      }
      this.isloading = true;
      setTimeout(() => {
        this.commonMethodService.donorList =
          this.commonMethodService.donorList.filter(
            (s) => s.id == this.selectedDonorId
          );
        this.setEmailAndPhoneValues();
      }, 1000);
    }
  }
  @Input() isNotifyDonarEmailShow: any;
  @Input() set SeatValue(value: any) {
    if (value) {
      this.paidStatus = value.paidStatus;
      this.selectedDonorId = value.donorId;
      this.pledgeId = value.pledgeId;
      this.campaignId = value.campaignId;
      this.seatId = value.seatId;
      this.price = value.priceValue;
      this.seatSaleId = value.seatSaleId;
      this.label = value.label;
      this.oldSelectedDonorId = value.donorId;
    }
  }
  @Input() set AddSeat(value: boolean) {
    this.isAddSeat = value;
  }

  removeDonor: boolean = true;
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private seatService: SeatService,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private eventService: EventService,
    private messengerService: MessengerService
  ) {}

  ngOnInit() {
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
        cursor: "grab",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  SaveSeat() {
    this.onSelectCampingSeason();
    this.requiredReservationStatus();
    this.requiredDonor();
    if (this.isDonorRequired) {
      return true;
    }
    if (this.isRequiredReservationStatusDpn) {
      return true;
    }
    if (this.isSeasonrequired || !this.campaignId) {
      return true;
    }

    this.isloading = true;
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();

    var saveSeatSale = {
      DonorId: this.selectedDonorId,
      Note: this.notes,
      SeatSaleId: this.seatSaleId,
      CampaignId:
        this.selectCampingSeason.length > 0
          ? this.selectCampingSeason[0].id
          : null, //this.campaignId,
      seatId: this.seatId !== undefined ? this.seatId : this.seatFromPledge,
      Label: this.stickerName,
      price: this.priceValue,
      createdBy: this.localstoragedataService.getLoginUserId(),
      SeatReservedType:
        this.reservationStatus && this.reservationStatus.length > 0
          ? this.reservationStatus.map((s) => s.id).toString()
          : null,
      EventGuid: eventGuid,
    };

    this.seatService.saveSeatSale(saveSeatSale).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedSeats();
          this.activeModal.dismiss();
          this.emtSeatSave.emit(true); //added new
          if (this.isChekedNotifyDonarEmail && this.EmailCheckbox) {
            this.sendEmailRecieptApi(this.pledgeId);
          }
          if (this.isChekedNotifyDonarPhone && this.PhoneCheckbox) {
            this.sendPhoneRecieptApi(this.pledgeId);
          }
          Swal.fire({
            title: "",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
        this.commonMethodService.sendSeatLst(true);
      },
      (error) => {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
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
    this.requiredDonor();
  }

  search(keyword) {
    var record = this.commonMethodService.localDonorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            ((obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
              (obj.fullName &&
                obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.fullNameJewish &&
                obj.fullNameJewish
                  .toLowerCase()
                  .toString()
                  .indexOf(searchValue) > -1) ||
              (obj.address &&
                obj.address.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
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
                obj.emails.toString().toLowerCase().indexOf(searchValue) >
                  -1)) &&
            obj.donorStatus !== this.inactiveDonor
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

  RemoveDonor() {
    let HtlmVal =
      this.paidStatus == "Open"
        ? "<h5>Are you sure you want to change ownership of this seat?</h5><p>The current owners pledge will be deleted.</p>"
        : this.paidStatus == "Paid" || "Partially Paid"
        ? "<h5>Are you sure you want to change ownership of this seat?</h5><p>The current owners payment on this pledge will be unapplied and pledge will be deleted.</p>"
        : null;
    if (
      (this.paidStatus == "Open" && this.pledgePayments != null) ||
      (this.paidStatus == "Paid" && this.pledgePayments != null)
    ) {
      if (HtlmVal) {
        Swal.fire({
          html: HtlmVal,
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
          cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
          confirmButtonColor: "#7b5bc4",
          customClass: {
            container: "swal-confirm",
          },
        }).then((result) => {
          if (result.value) {
            this.isDonorSelected = false;
            this.deleteDonor();
          }
        });
        return;
      }
    }
    this.deleteDonor();
  }

  SearchGlobalDonor() {
    this.isGlobalList = true;
    var text = $("#donorText").val();
    this.showBox = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  OnGlobalCheckboxChange(event) {
    if (event.target.checked) {
      this.displaySearchIcon = true;
    } else {
      this.displaySearchIcon = false;
    }
  }

  onClickedOutside() {
    this.showBox = false;
  }

  SelectDonor(accountId) {
    this.removeDonor = false;
    this.showBox = false;
    this.displaySearchIcon = false;
    this.selectedDonorId = accountId;
    this.isDonorSelected = true;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.donor =
      this.commonMethodService.donorList[0].fullNameJewish != null
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
    this.stickerName =
      this.commonMethodService.donorList[0].fullNameJewish != null
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = false;
    this.requiredDonor();

    this.setEmailAndPhoneValues();
  }

  makeTransactionPopup() {
    this.onSelectCampingSeason();
    this.requiredReservationStatus();
    this.requiredDonor();
    if (this.isDonorRequired) {
      return true;
    }
    if (this.isSeasonrequired || !this.campaignId) {
      return true;
    }
    if (this.isRequiredReservationStatusDpn) {
      return true;
    }
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
    let seatparams = {
      seatId: this.seatId,
      label: this.stickerName,
      seatReservedType:
        this.reservationStatus && this.reservationStatus.length > 0
          ? this.reservationStatus.map((s) => s.id).toString()
          : null,
      isSeatPayNow: true,
      price: this.priceValue,
      donorId: this.selectedDonorId,
      campaignId: this.campaignIdFromGetSeat,
      Email: this.notifyDonarEmail,
      Phone: this.notifyDonarPhoneNumber,
    };
    if (this.isChekedNotifyDonarEmail && this.EmailCheckbox) {
      this.sendEmailRecieptApi(this.pledgeId);
    }
    if (this.isChekedNotifyDonarPhone && this.PhoneCheckbox) {
      this.sendPhoneRecieptApi(this.pledgeId);
    }
    modalRef.componentInstance.SeatData = seatparams;
    modalRef.componentInstance.emtPaymentTrans.subscribe((res: any) => {
      if (res) {
        this.closePopup();
      }
    });
    modalRef.componentInstance.emtPaymentTransSeatList.subscribe((res: any) => {
      if (res) {
        this.emtOpenSeatCard.emit(true);
      }
    });
  }
  onStatusSelect(item: any) {
    if (item && item.id == "Reserved") {
      this.isReservationstatus = true;
      this.isDeletedDonorId = false;
      this.toShowCancelSave = true;
    } else {
      this.isReservationstatus = false;
      this.toShowCancelSave = false;
      if (
        this.donor != "" &&
        this.donor != null &&
        this.pledgePayments != null
      ) {
        this.isDeletedDonorId = false;
      } else {
        this.isDeletedDonorId = true;
      }
    }
    this.requiredReservationStatus();
  }
  onDeSelectCampingSeason() {
    if (this.selectCampingSeason && this.selectCampingSeason.length > 0) {
      this.isSeasonrequired = false;
      this.campaignId = this.selectCampingSeason[0].id;
    } else {
      // this.isSeasonrequired=true;
      this.campaignId = undefined;
    }
  }
  onSelectCampingSeason() {
    if (this.selectCampingSeason && this.selectCampingSeason.length > 0) {
      this.isSeasonrequired = false;
      this.campaignId = this.selectCampingSeason[0].id;

      return;
    }
    this.isSeasonrequired = true;
    this.campaignId = undefined;
  }
  isRequiredReservationStatusDpn = false;
  requiredReservationStatus() {
    if (this.reservationStatus && this.reservationStatus.length > 0) {
      this.isRequiredReservationStatusDpn = false;
    } else {
      this.isRequiredReservationStatusDpn = true;
    }
  }
  onDeSelectStatus() {
    this.reservationStatus = [];
    // this.requiredReservationStatus();
  }
  isDonorRequired = false;
  requiredDonor() {
    if (this.selectedDonorId) {
      this.isDonorRequired = false;
    } else {
      this.isDonorRequired = true;
    }
  }
  onUpdateSeatSale() {
    this.onSelectCampingSeason();
    this.requiredReservationStatus();
    this.requiredDonor();
    if (this.isDonorRequired) {
      return true;
    }
    if (this.isRequiredReservationStatusDpn) {
      return true;
    }
    if (this.isSeasonrequired || !this.campaignId) {
      return true;
    }

    this.isloading = true;
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    let saveSeatSale = {};

    saveSeatSale = {
      eventGuId: eventGuid,
      seatId: this.seatId !== undefined ? this.seatId : this.seatFromPledge,

      donorId: this.selectedDonorId,
      price: this.priceValue,
      updatedBy: this.localstoragedataService.getLoginUserId(),
      seatReservedType:
        this.reservationStatus && this.reservationStatus.length > 0
          ? this.reservationStatus.map((s) => s.id).toString()
          : null,
      campaignId:
        this.selectCampingSeason.length > 0
          ? this.selectCampingSeason[0].id
          : null,
      label: this.stickerName,
    };
    if (this.paidStatus == "Paid" || this.paidStatus == "Open") {
      saveSeatSale = {
        eventGuId: eventGuid,
        seatId: this.seatId !== undefined ? this.seatId : this.seatFromPledge,
        donorId: this.selectedDonorId,
        price: this.priceValue,
        updatedBy: this.localstoragedataService.getLoginUserId(),
        seatReservedType:
          this.reservationStatus && this.reservationStatus.length > 0
            ? this.reservationStatus.map((s) => s.id).toString()
            : null,
        campaignId:
          this.selectCampingSeason.length > 0
            ? this.selectCampingSeason[0].id
            : null,
        isVoidPayment: false,
        label: this.stickerName,
      };
    }
    this.seatService.updateSeatSale(saveSeatSale).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedSeats();
          this.activeModal.dismiss();
          this.emtSeatSave.emit(true); //added new
          Swal.fire({
            title: "",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
        this.commonMethodService.sendSeatLst(true);
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
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
  onUpdateSeatSaleDonar() {
    if (this.paidStatus == "N/A") {
      this.reservationStatus = [{ id: "Reserved", itemName: "Reserved" }];
      this.SaveSeat();
      return;
    }
    this.onSelectCampingSeason();
    this.requiredReservationStatus();
    this.requiredDonor();
    if (
      this.priceValue < this.amountFromSeatPaymentType &&
      this.isPaymentFromEditSeat
    ) {
      this.priceMsg =
        "This seat has a payment applied already, please unapply the payment to change the price";
      Swal.fire({
        title: this.commonMethodService.getTranslate(
          "WARNING_SWAL.SOMETHING_WENT_WRONG"
        ),
        text: this.priceMsg,
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
      return;
    }
    if (this.isDonorRequired) {
      return true;
    }
    if (this.isRequiredReservationStatusDpn) {
      return true;
    }
    if (this.isSeasonrequired || !this.campaignId) {
      return true;
    }
    if (this.isChekedNotifyDonarEmail && this.EmailCheckbox) {
      this.sendEmailRecieptApi(this.pledgeId);
    }
    if (this.isChekedNotifyDonarPhone && this.PhoneCheckbox) {
      this.sendPhoneRecieptApi(this.pledgeId);
    }
    if (
      this.paidStatus == "Open" &&
      this.selectedDonorId != this.oldSelectedDonorId &&
      this.pledgePayments != null
    ) {
      Swal.fire({
        html: "<h5>Are you sure you want to change ownership of this seat?</h5><p>The current owners pledge will be deleted.</p>",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
        cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        confirmButtonColor: "#7b5bc4",
        customClass: {
          container: "swal-confirm",
        },
      }).then((result) => {
        if (result.value) {
          this.onUpdateSeatSale();
        }
      });
    } else if (
      this.paidStatus == "Paid" &&
      this.selectedDonorId != this.oldSelectedDonorId &&
      this.pledgePayments != null
    ) {
      Swal.fire({
        html: "<h5>Are you sure you want to change ownership of this seat?</h5><p>The current owners payment on this pledge will be unapplied and pledge will be deleted.</p>",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
        cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        confirmButtonColor: "#7b5bc4",
        customClass: {
          container: "swal-confirm",
        },
      }).then((result) => {
        if (result.value) {
          this.onUpdateSeatSale();
        }
      });
    } else {
      this.onUpdateSeatSale();
    }
  }
  isPaidOrPartiallypaid() {
    if (
      (!this.isReservationstatus && this.paidStatus == "Paid") ||
      (!this.isReservationstatus && this.paidStatus == "Partially Paid")
    ) {
      return true;
    }
    return false;
  }
  get isRunning() {
    return this.paidStatus === "Running" && !this.isReservationstatus;
  }
  deleteDonor() {
    this.isloading = true;
    this.removeDonor = true;
    this.donor = null;
    this.selectedDonorId = null;
    this.stickerName = null;
    let saveSeatSale = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      seatId: this.seatId !== undefined ? this.seatId : this.seatFromPledge,

      donorId: "-1",
      price: this.priceValue,
      updatedBy: this.localstoragedataService.getLoginUserId(),
      seatReservedType: "-1",
      campaignId:
        this.selectCampingSeason.length > 0
          ? this.selectCampingSeason[0].id
          : null,
      isVoidPayment: false,
    };

    this.seatService.updateSeatSale(saveSeatSale).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedSeats();
          this.isDeletedDonorId = true;
          this.emtSeatSave.emit(true);
          Swal.fire({
            title: "",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
        this.commonMethodService.sendSeatLst(true);
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
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

  get isChekedNotifyDonarEmail() {
    return (
      this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email"
    );
  }

  get isChekedNotifyDonarPhone() {
    return (
      this.notifyDonarPhoneNumber &&
      this.notifyDonarPhoneNumber.phone != "Select Phone"
    );
  }

  get getEmailSelected() {
    if (this.notifyDonarEmail) {
      return this.notifyDonarEmail.email != "Select Email"
        ? `${this.notifyDonarEmail.email} (${this.notifyDonarEmail.label})`
        : this.notifyDonarEmail.email;
    }
    return "Select Email";
  }

  get getPhoneSelected() {
    if (this.notifyDonarPhoneNumber) {
      return this.notifyDonarPhoneNumber.phone != "Select Phone"
        ? `${this.notifyDonarPhoneNumber.phone} (${this.notifyDonarPhoneNumber.label})`
        : this.notifyDonarPhoneNumber.phone;
    }
    return "";
  }

  openEmailAddressPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      EmailAddressPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.selectedDonorId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        let result = res;
        let obj = {
          email: result.emailAddress,
          label: result.emailLabel,
        };
        this.notifyDonarEmail = obj;
        this.notifyDonarEmailArray.push(obj);
      }
    });
  }

  openPhoneNumberPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PhoneNumberPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.selectedDonorId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        const result = res;
        const obj = {
          phone: result.phoneNumber,
          label: result.phoneLabel,
        };
        this.notifyDonarPhoneNumber = obj;
        this.notifyDonarPhoneArray.push(obj);
      }
    });
  }

  donarNotifyDwnHideShow(cls) {
    if (!this.isDonorSelected) {
      return false;
    }
    this.isDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }

  donarSmsNotifyDwnHideShow(cls) {
    if (!this.isDonorSelected) {
      return false;
    }
    this.isSmsDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }

  margeKeyValue(keys = [], values = [], item = "") {
    const resultArray = [];
    for (let index = 0; index < keys.length; index++) {
      let obj =
        item == "email"
          ? { email: keys[index], label: values[index] }
          : { phone: keys[index], label: values[index] };
      resultArray.push(obj);
    }
    return resultArray;
  }

  selectNotifyDonarEmail(item) {
    this.notifyDonarEmail = item;
    this.EmailCheckbox = true;
  }

  selectNotifyDonarPhone(item) {
    this.notifyDonarPhoneNumber = item;
    this.PhoneCheckbox = true;
  }

  sendEmailRecieptApi(id) {
    if (this.notifyDonarEmail.email == "Select Email") {
      return false;
    }
    const objEmailReceipt = {
      type: "Pledge",
      id: id,
      emailAddress: this.notifyDonarEmail.email,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    this.messengerService
      .SendEmailReceipt(objEmailReceipt)
      .subscribe((res) => {});
  }

  sendPhoneRecieptApi(id) {
    if (this.notifyDonarPhoneNumber.phone == "Select Phone") {
      return false;
    }
    const objTextReceipt = {
      type: "Pledge",
      id: id,
      phoneNumber: this.notifyDonarPhoneNumber.phone,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.SendSMSReceipt(objTextReceipt).subscribe((res) => {});
  }

  setEmailAndPhoneValues() {
    let donarDetails = this.commonMethodService.donorList.map((item) => {
      const emails = item.emails ? item.emails.split(",") : [];
      const emailLabels = item.emailLabels ? item.emailLabels.split(",") : [];
      const emailResult = this.margeKeyValue(emails, emailLabels, "email");
      const phoneNumber = item.additionalPhoneNumbers
        ? item.additionalPhoneNumbers.split(",")
        : [];
      const phoneLabels = item.additionalPhoneLabels
        ? item.additionalPhoneLabels.split(",")
        : [];
      const phoneResult = this.margeKeyValue(phoneNumber, phoneLabels, "phone");
      return { email: emailResult, phone: phoneResult };
    });

    this.notifyDonarEmailArray =
      donarDetails && donarDetails.length > 0 ? donarDetails[0].email : [];
    this.notifyDonarEmail =
      this.notifyDonarEmailArray && this.notifyDonarEmailArray.length > 0
        ? this.notifyDonarEmailArray[0]
        : "";
    this.EmailCheckbox =
      this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email";

    if (this.commonMethodService.isDisableAutomaticPledge == false) {
      this.EmailCheckbox = false;
      this.notifyDonarEmail = { email: "Select Email", label: "" };
    }
    if (!this.isNotifyDonarEmailShow) {
      this.notifyDonarEmail = {
        email: "Select Email",
        label: "",
      };
    }
    this.notifyDonarPhoneArray =
      donarDetails && donarDetails.length > 0 ? donarDetails[0].phone : [];
    this.PhoneCheckbox =
      this.notifyDonarPhoneNumber &&
      this.notifyDonarPhoneNumber.phone != "Select Phone";
    this.isloading = false;
  }

  //if clicked outside close dropdown for email and sms code started
  closeSaveSeatEmailDropdown(event: any) {
    if (this.isDropDownOpen) {
      this.isDropDownOpen = false;
      let cls = "notify-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }

  closeSaveSeatSmsDropdown(event: any) {
    if (this.isSmsDropDownOpen) {
      this.isSmsDropDownOpen = false;
      let cls = "notify-sms-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }
  //if clicked outside close dropdown for email and sms code ended
}
