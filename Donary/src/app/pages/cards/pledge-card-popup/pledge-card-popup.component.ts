import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import Swal from "sweetalert2";
import { PaymentCardPopupComponent } from "../payment-card-popup/payment-card-popup.component";
import { MessengerService } from "src/app/services/messenger.service";
import { SendEmailreceiptPopupComponent } from "../../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { SendTextreceiptPopupComponent } from "../../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { EditPledgePopupComponent } from "./edit-pledge-popup/edit-pledge-popup.component";
import { SendMailreceiptPopupComponent } from "../../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { MapViewCardPopupComponent } from "../map-view-card-popup/map-view-card-popup.component";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { PdfviewerPopupComponent } from "../payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { ReminderPopupComponent } from "../../notifications/reminder-popup/reminder-popup.component";
import { SeatsCardPopupComponent } from "../seats-card-popup/seats-card-popup.component";
import { SeatService } from "src/app/services/seat.service";
import { NotificationService as notification } from "src/app/services/notification.service";
import { NotificationSidebarPopupComponent } from "../../notifications/notification-sidebar-popup/notification-sidebar-popup.component";
import { DonorService } from "src/app/services/donor.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import { Pledge } from "src/app/models/pledge-payment-model";
declare var $: any;
@Component({
  selector: "app-pledge-card-popup",
  templateUrl: "./pledge-card-popup.component.html",
  styleUrls: ["./pledge-card-popup.component.scss"],
  standalone: false,
})
export class PledgeCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  isDisabled: boolean = false;
  pledgeNum: string;
  status: string;
  pledgeDate: string;
  pledgeJewishDate: string;
  donor: string;
  donorJewishName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  campaign: string;
  reason: string;
  location: string;
  collector: string;
  createdBy: string;
  deviceName: string;
  deviceId: string;
  source: string;
  refNum: string;
  createdDate: string;
  phoneNumber: string;
  email: string;
  note: string;
  ExternalNote: string;
  loglist: string;
  pledgeId: number;
  seatId: number;
  seatSaleId: number = 0;
  pledgePayments: any = [];
  phoneLabels: string;
  phoneNumbers: string;
  emails: string;
  emailLabels: any;
  status_class: string;
  accountId: number;
  address: string;
  accountNum: string;
  cityStateZip: string;
  latitude: string;
  longitude: string;
  lstRelatedReceiptLogs: any;
  lstRelatedNotifications: Array<any>;
  makeTransactionPermission: boolean = false;
  showTrans: boolean = false;
  showAction: boolean = false;
  isEditSeatPopupClicked: boolean = false;
  pledgeDetails: Pledge;
  skeletonitems: any = [{}, {}, {}];
  skeletoncolitems: any = [{}, {}, {}, {}, {}, {}];
  phoneLabelList = [];
  phoneNumberList = [];
  countryCodeIdsList = [];

  @Output() emtPledgeUpdate: EventEmitter<any> = new EventEmitter();
  @Input() set PledgeCardData(PledgeCardValue: any) {
    if (PledgeCardValue) {
      this.pledgeDetails = PledgeCardValue;
      if (PledgeCardValue.seatId != null) {
        this.isDisabled = true;
      }
      this.setValue(PledgeCardValue);
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private pledgeService: PledgeService,
    private messengerService: MessengerService,
    public seatService: SeatService,
    private notification: notification,
    public donorService: DonorService
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

  setValue(PledgeCardValue) {
    this.address = PledgeCardValue.address;
    this.accountNum = PledgeCardValue.accountNum;
    this.cityStateZip = PledgeCardValue.cityStateZip;
    this.pledgeNum = PledgeCardValue.pledgeNum;
    this.accountId = PledgeCardValue.accountId;
    this.pledgeId = PledgeCardValue.pledgeId;
    this.seatId = PledgeCardValue.seatId;
    this.seatSaleId = PledgeCardValue.seatSaleId;
    this.status = PledgeCardValue.status;
    this.pledgeDate = PledgeCardValue.pledgeDate;
    this.pledgeJewishDate = PledgeCardValue.pledgeJewishDate;
    this.donor = PledgeCardValue.donor;
    this.donorJewishName = PledgeCardValue.donorJewishName;
    this.totalAmount = PledgeCardValue.totalAmount;
    this.paidAmount = PledgeCardValue.paidAmount;
    this.balance = PledgeCardValue.balance;
    this.campaign = PledgeCardValue.campaign;
    this.reason = PledgeCardValue.reason;
    this.location = PledgeCardValue.location;
    this.collector = PledgeCardValue.collector;
    this.createdBy = PledgeCardValue.createdBy;
    this.deviceName = PledgeCardValue.deviceName;
    this.deviceId = PledgeCardValue.deviceId;
    this.source = PledgeCardValue.source;
    this.refNum = PledgeCardValue.refNum;
    this.pledgePayments = PledgeCardValue.pledgePayments;
    this.createdDate = PledgeCardValue.createdDate;
    this.note = PledgeCardValue.description;
    this.ExternalNote = PledgeCardValue.externalNote;
    this.loglist = PledgeCardValue.changeLog;
    this.latitude = PledgeCardValue.latitude;
    this.longitude = PledgeCardValue.longitude;
    this.lstRelatedReceiptLogs = PledgeCardValue.lstRelatedReceiptLogs;
    this.lstRelatedNotifications =
      PledgeCardValue.lstRelatedNotifications || [];
    this.ApplyStatusClass(this.status);

    if (PledgeCardValue.phoneLabels) {
      this.phoneLabels = PledgeCardValue.phoneLabels;
    }

    if (PledgeCardValue.phones && PledgeCardValue.phones.indexOf(",") > -1) {
      this.phoneNumbers = PledgeCardValue.phones.split(",");
    } else {
      this.phoneNumbers = PledgeCardValue.phones;
    }
    if (PledgeCardValue.emails && PledgeCardValue.emails.indexOf(",") > -1) {
      this.emails = PledgeCardValue.emails.split(",");
      this.emailLabels = PledgeCardValue.emailLabels.split(",");
    } else {
      this.emails = PledgeCardValue.emails;
      this.emailLabels = PledgeCardValue.emailLabels;
    }
    this.isloading = false;
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  ApplyStatusClass(status) {
    if (status == "Paid") {
      this.status_class = "pledge_paid";
    } else if (status == "Open") {
      this.status_class = "pledge_open";
    } else if (status == "Partially Paid") {
      this.status_class = "pledge_partial";
    } else if (status == "Voided") {
      this.status_class = "pledge_void";
    }
  }

  makeTransactionPopup() {
    this.showTrans = false;
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
    modalRef.componentInstance.donorDetails = {
      jewishname: this.donorJewishName,
      fullname: this.donor,
      accountId: this.accountId,
      isPledgeCard: true,
      balance: this.balance,
      pledgeId: this.pledgeId,
      amountToPay: this.balance,
    };
    modalRef.componentInstance.cardPledge = true;
  }

  openSeatsCardPopup(seatId, seatSaleId) {
    this.isloading = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup seat_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      SeatsCardPopupComponent,
      this.modalOptions
    );
    var objSeatCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      seatSaleId: seatSaleId,
    };
    this.seatService.getSeat(objSeatCard).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.SeatCardData = res;
        modalRef.componentInstance.seatIdData = seatId;

        modalRef.componentInstance.SeatValueItemFromPledgeCard = seatId;

        this.isEditSeatPopupClicked = true;
      },
      (error) => {
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error.errors.seatSaleId,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: { confirmButton: "btn_ok" },
        });
        modalRef.close();

        modalRef.componentInstance.SeatValueItemFromPledgeCard = seatId;

        this.isEditSeatPopupClicked = true;
      }
    );
  }

  AddReminderPopup() {
    this.showTrans = false;
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
    modalRef.componentInstance.pledgeDetails = { details: this.pledgeDetails };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe(() => {
      this.isloading = true;
      let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuId, this.pledgeId)
        .subscribe((res: any) => {
          this.isloading = false;
          this.PledgeCardData = res;
        });
    });
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

  openPaymentCardPopup(paymentId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup payment_card modal_responsive",
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
      if (res) {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.PaymentCardData = res;
      } else {
        Swal.fire({
          title: "",
          text: "No data found",
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

  openEditPledgePopup(pledgeId) {
    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup editpledge_card edit_payment modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      EditPledgePopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    modalRef.componentInstance.aliyaGroupId = this.pledgeDetails?.aliyaGroupId;

    this.pledgeService.GetPledge(pledgeId, eventGuId).subscribe((res: any) => {
      if (res) {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.EditPledgeData = res;
        modalRef.componentInstance.pledgePayments =
          this.pledgePayments && this.pledgePayments.length > 0 ? true : false;
        modalRef.componentInstance.emtEditPledge.subscribe(() => {
          this.isloading = true;
          var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

          this.pledgeService
            .GetPledgeCard(eventGuId, pledgeId)
            .subscribe((res: any) => {
              this.isloading = false;
              this.PledgeCardData = res;
            });
        });
      } else {
        this.isloading = false;
        Swal.fire({
          title: "",
          text: "No data found",
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

  SendEmailReceipt(pledgeId, emailList, phoneNumber) {
    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendEmailreceiptPopupComponent,
      this.modalOptions
    );

    this.emailLabels = this.emailLabels ? this.emailLabels : "";

    const labelType = typeof this.emailLabels;
    let stringEmailLabels =
      labelType === "string" ? this.emailLabels : this.emailLabels.join(",");
    let rowColumn = this.commonMethodService.getLabelArray(
      stringEmailLabels,
      emailList,
      null
    );
    modalRef.componentInstance.Info = {
      id: pledgeId,
      type: "Pledge",
      emailList: rowColumn,
      accountId: this.accountId,
      phoneNumber: phoneNumber,
    };
    modalRef.componentInstance.emtEditPledge.subscribe(() => {
      this.isloading = true;
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuId, pledgeId)
        .subscribe((res: any) => {
          this.isloading = false;
          this.PledgeCardData = res;
        });
    });
  }

  sendMailReceipt(pledgeId) {
    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_mailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendMailreceiptPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = {
      id: pledgeId,
      type: "Pledge",
      accountId: this.accountId,
      address: this.address,
      cityStateZip: this.cityStateZip,
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe(() => {
      this.isloading = true;
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuId, pledgeId)
        .subscribe((res: any) => {
          this.isloading = false;
          this.PledgeCardData = res;
        });
    });
  }

  isOnlyPledgePayment: boolean = false;
  printReceipt(pledgeId) {
    this.showAction = false;
    this.isloading = true;
    var objMailReceipt = {
      type: "Pledge",
      id: pledgeId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.PrintReceipt(objMailReceipt).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.modalOptions = {
            centered: true,
            size: "lg",
            backdrop: "static",
            keyboard: true,
            windowClass: "drag_popup print_receipt",
          };
          const modalRef = this.commonMethodService.openPopup(
            PrintSingleReceiptPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.fileDetails = {
            filename: res.receiptFileUrl,
            filetype: res.contentType,
          };
          modalRef.componentInstance.emtEditPledge.subscribe(() => {
            this.isloading = true;
            var eventGuId =
              this.localstoragedataService.getLoginUserEventGuId();

            this.pledgeService
              .GetPledgeCard(eventGuId, pledgeId)
              .subscribe((res: any) => {
                this.isloading = false;
                this.PledgeCardData = res;
              });
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.TRY_AGAIN"
            ),
            text: res.errorResponse,
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

  VoidPledge(pledgeId) {
    this.showAction = false;
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT"
      ),
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        var objVoidPledge = {
          pledgeId: pledgeId,
          statusId: 3,
          accountId: this.accountId,
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        };
        this.pledgeService.updatePledge(objVoidPledge).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.analytics.editedPledge();
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.SUCCESS_TITLE"
                ),
                text: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.emtPledgeUpdate.emit(res);
                this.isloading = true;
                var eventGuId =
                  this.localstoragedataService.getLoginUserEventGuId();
                this.pledgeService
                  .GetPledgeCard(eventGuId, pledgeId)
                  .subscribe((res: any) => {
                    this.isloading = false;
                    this.PledgeCardData = res;
                  });
              });
            } else {
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.TRY_AGAIN"
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: this.commonMethodService.getTranslate(
            "WARNING_SWAL.NO_ACTION_TAKEN"
          ),
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

  SendTextReceipt(paymentId, phoneNumber, accountId) {
    this.phoneLabelList = [];
    this.phoneNumberList = [];
    this.countryCodeIdsList = [];

    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_textreceipt send_emailreceipt",
    };

    const modalRef = this.commonMethodService.openPopup(
      SendTextreceiptPopupComponent,
      this.modalOptions
    );

    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorPhoneList(eventGuId, accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
          const phoneData = obj.list;
          // Convert arrays to comma-separated strings with null handling
          this.phoneLabelList = phoneData.map((item) =>
            item.phoneLabel != null ? item.phoneLabel : null
          );

          this.phoneNumberList = phoneData.map((item) =>
            item.phoneNumber != null ? item.phoneNumber : null
          );

          this.countryCodeIdsList = phoneData.map((item) =>
            item.countryCodeID != null ? item.countryCodeID : null
          );

          let rowColumn = this.commonMethodService.getNewLabelArray(
            this.phoneLabelList,
            this.phoneNumberList,
            this.countryCodeIdsList
          );

          modalRef.componentInstance.Info = {
            id: paymentId,
            type: "Pledge",
            phoneList: rowColumn,
            accountId: accountId,
          };
        }
      });
    modalRef.componentInstance.emtEditPledge.subscribe((res) => {
      this.isloading = true;
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuId, paymentId)
        .subscribe((res: any) => {
          this.isloading = false;
          this.PledgeCardData = res;
        });
    });
  }

  openMapCardPopup() {
    this.isloading = true;
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
  OpenPdf(documentPath) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document Preview";
    modalRef.componentInstance.filePath = documentPath;
  }

  openNotificationSidebarPopup(notificationId = 1) {
    if (notificationId != null && notificationId != 0) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card donor_card_payment",
      };
      const modalRef = this.commonMethodService.openPopup(
        NotificationSidebarPopupComponent,
        this.modalOptions
      );
      let eventGuId = this.localstoragedataService.getLoginUserEventGuId();

      this.notification
        .getNotificationById(notificationId, eventGuId)
        .subscribe((res: any) => {
          this.isloading = false;
          modalRef.componentInstance.Data = res;
        });
    }
  }

  isReminderDisplay() {
    return this.accountNum == "DEFAULT" ? false : true;
  }

  plagePaymentStatusCls(status) {
    let status_class = "";
    if (status == "Success") {
      status_class = "paymnt_success";
    } else if (status == "Declined") {
      status_class = "paymnt_declined";
    } else if (status == "Error") {
      status_class = "paymnt_error";
    } else if (status == "Voided") {
      status_class = "paymnt_voided";
    } else if (status == "Refunded") {
      status_class = "paymnt_refunded";
    } else if (status == "Deleted") {
      status_class = "paymnt_deleted";
    } else if (status == "Scheduled") {
      status_class = "schdl_scheduled";
    }
    return status_class;
  }
}
