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
import { NotificationService } from "src/app/commons/notification.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import { PaymentService } from "src/app/services/payment.service";
import Swal from "sweetalert2";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { SendEmailreceiptPopupComponent } from "../../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { SendTextreceiptPopupComponent } from "../../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { WalletlistPopupComponent } from "../schedule-card-popup/walletlist-popup/walletlist-popup.component";
import { CardService } from "./../../../services/card.service";
import { EditPaymentPopupComponent } from "./edit-payment-popup/edit-payment-popup.component";
import { PdfviewerPopupComponent } from "./pdfviewer-popup/pdfviewer-popup.component";
import { CheckDetailsPopupComponent } from "./check-details-popup/check-details-popup.component";
import { PledgeCardPopupComponent } from "../pledge-card-popup/pledge-card-popup.component";
import { CampaignCardPopupComponent } from "../campaign-card-popup/campaign-card-popup.component";
import { ReasonCardPopupComponent } from "../reason-card-popup/reason-card-popup.component";
import { MapViewCardPopupComponent } from "../map-view-card-popup/map-view-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { CampaignService } from "src/app/services/campaign.service";
import { ReasonService } from "src/app/services/reason.service";
import { SchedulePaymentCardPopupComponent } from "../schedule-card-popup/schedule-paymentcard-popup.component";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { ReminderPopupComponent } from "../../notifications/reminder-popup/reminder-popup.component";
import { NotificationSidebarPopupComponent } from "../../notifications/notification-sidebar-popup/notification-sidebar-popup.component";
import { NotificationService as notification } from "src/app/services/notification.service";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import { LegalReceiptCountryPopupComponent } from "../../make-transaction/legal-receipt-country-popup/legal-receipt-country-popup.component";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { LegalReceiptPopupComponent } from "../../make-transaction/legal-receipt-popup/legal-receipt-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-payment-card-popup",
  templateUrl: "./payment-card-popup.component.html",
  standalone: false,
  styleUrls: ["./payment-card-popup.component.scss"],
})
export class PaymentCardPopupComponent implements OnInit {
  fullName: string;
  fullNameJewish: string;
  receiptNum: string;
  amount: Int32Array;
  paymentId: Number;
  paymentDate: string;
  refNum: string;
  accountId: string;
  collector: string;
  locationName: string;
  objAdvancedSearch: any;
  gridData: Array<any>;
  @Input() gridFilterData: Array<any>;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  paymentType: string;
  gatewayName: string;
  schedulenum: string;
  scheduleId: number;
  declinedWalletId: number;
  campaignName: string;
  deviceName: string;
  reasonName: string;
  paymentDateJewish: string;
  lstRelatedPledgePayments: any;
  lstGatewayTransaction: any;
  status: string;
  deviceId: string;
  batchNum: string;
  totalPledgeAmount: number;
  lstRelatedReceiptLogs: any;
  createdBy: string;
  note: string;
  source: string;
  gatewayRefNum: string;
  approval: string;
  changeLog: any = [];
  createdDate: string;
  phoneLabels: string;
  countryCodeId: string;
  phoneNumbers: string;
  emails: string;
  emailLabels: string;
  cardHolderName: string;
  paymenttype_icn: string;
  status_class: string;
  loglist: string;
  walletId: number | null;
  address: string;
  accountNum: string;
  cityStateZip: string;
  latitude: string;
  longitude: string;
  isGlobal: boolean = false;
  tooltip: string;
  currencyAmount: string;
  currencyName: string;
  makeTransactionPermission: boolean = false;
  lstRelatedNotifications: Array<any>;
  paymentDetails: Array<any>;
  showTrans: boolean = false;
  showAction: boolean = false;
  globalId: number;
  tabRandNumber: number;
  ccIconCls: string;
  checkType: boolean = false;
  eventCurrency: string;
  paidAmountTotal: number;
  elementAmount: number;
  checkStatusId: any = [];
  paymentStatus: string;
  collectorId: number;
  campaignId: number;
  locationId: number;
  reasonId: number;
  isLegalReceiptNum: boolean = false;
  isDevEnv: boolean = false;
  TransColName: boolean = false;
  isLegalReceipt: any;
  donaryBatchNum: string;
  gatewayBatchNum: string;
  valueFromPopup: any;
  skeletonitems: any = [{}, {}, {}];
  skeletoncolitems: any = [{}, {}, {}, {}, {}, {}];
  receiptGenerated: boolean = false;
  isEventBatchEdit: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private paymentService: PaymentService,
    private donorService: DonorService,
    private messengerService: MessengerService,
    private localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService,
    private pledgeService: PledgeService,
    private campaignService: CampaignService,
    private reasonService: ReasonService,
    private notification: notification,
    private paymentApiGatewayService: PaymentApiGatewayService,
    private paymentTransactionService: PaymentTransactionService
  ) {}

  @Output() emtOutputDonorCardData: EventEmitter<any> = new EventEmitter();
  @Output() emtRetryPayment: EventEmitter<any> = new EventEmitter();
  @Input() set PaymentCardData(PaymentCardValue: any) {
    this.PaymentCardDataValue(PaymentCardValue);
  }

  @Input() set legalReceiptNum(legalReceiptNum) {
    if (legalReceiptNum == null) {
      this.isLegalReceiptNum = true;
    } else {
      this.isLegalReceipt = legalReceiptNum;
    }
  }

  @Input() set isOtherCountry(isOtherCountry) {
    this.isOtherCountry = isOtherCountry;
  }

  PaymentCardDataValue(PaymentCardValue: any) {
    if (PaymentCardValue) {
      if (PaymentCardValue.legalReceiptNum == null) {
        this.isLegalReceiptNum = true;
      } else {
        this.isLegalReceipt = PaymentCardValue.legalReceiptNum;
      }
      this.paymentDetails = PaymentCardValue;
      this.globalId = PaymentCardValue.globalId;
      if (PaymentCardValue.lstRelatedPledgePayments != null) {
        let isRelatedPP = [];
        isRelatedPP = PaymentCardValue.lstRelatedPledgePayments;
        let total = 0;
        isRelatedPP.forEach((x) => {
          total += x.paidAmount;
        });
        this.paidAmountTotal = total;
        this.elementAmount = PaymentCardValue.amount;
        let sum = this.elementAmount - this.paidAmountTotal;

        if (sum != 0) {
          var newObj: any = {};
          newObj = {
            campaignName: "No campaign",
            reasonName: "No Reason",
            paidAmount: sum,
          };
          PaymentCardValue.lstRelatedPledgePayments.push(newObj);
        }
      }
      this.setValue(PaymentCardValue);
    }
  }
  setValue(PaymentCardValue: any) {
    this.address = PaymentCardValue.address;
    this.accountNum = PaymentCardValue.accountNum;
    this.cityStateZip = PaymentCardValue.cityStateZip;
    this.fullName = PaymentCardValue.fullName;
    this.accountNum = PaymentCardValue.accountNum;
    this.reasonName = PaymentCardValue.reasonName;
    this.cardHolderName = PaymentCardValue.cardHolderName;
    this.fullNameJewish = PaymentCardValue.fullNameJewish;

    this.receiptNum = PaymentCardValue.receiptNum;
    this.amount = PaymentCardValue.amount;
    this.paymentId = PaymentCardValue.paymentId;

    this.paymentDate = PaymentCardValue.paymentDate;
    this.collector = PaymentCardValue.collector;
    this.refNum = PaymentCardValue.refNum;
    this.approval = PaymentCardValue.approval;
    this.gatewayRefNum = PaymentCardValue.gatewayRefNum;
    this.locationName = PaymentCardValue.locationName;
    this.accountId = PaymentCardValue.accountId;
    this.paymentType = PaymentCardValue.paymentType;
    this.gatewayName = PaymentCardValue.gatewayName;
    this.campaignName = PaymentCardValue.campaignName;
    this.deviceName = PaymentCardValue.deviceName;
    this.paymentDateJewish = PaymentCardValue.paymentDateJewish;
    this.lstRelatedPledgePayments =
      PaymentCardValue.lstRelatedPledgePayments &&
      PaymentCardValue.lstRelatedPledgePayments.filter(
        (x) => x.pledgeId != undefined
      );

    this.lstGatewayTransaction = PaymentCardValue.lstGatewayTransaction;
    this.status = PaymentCardValue.status;
    this.deviceId = PaymentCardValue.deviceId;

    this.batchNum = PaymentCardValue.batchNum;
    this.totalPledgeAmount = PaymentCardValue.totalPledgeAmount;
    this.emails = PaymentCardValue.emails;
    this.emailLabels = PaymentCardValue.emailLabels;
    this.walletId = PaymentCardValue.walletId;
    this.schedulenum = PaymentCardValue.scheduleNum;
    this.scheduleId = PaymentCardValue.scheduleId;

    this.lstRelatedReceiptLogs = PaymentCardValue.lstRelatedReceiptLogs;
    this.lstRelatedNotifications =
      PaymentCardValue.lstRelatedNotifications || [];
    this.createdBy = PaymentCardValue.createdBy;
    this.note = PaymentCardValue.note;
    this.source = PaymentCardValue.source;
    this.createdDate = PaymentCardValue.createdDate;
    this.loglist = PaymentCardValue.changeLog;
    this.latitude = PaymentCardValue.latitude;
    this.longitude = PaymentCardValue.longitude;
    this.isGlobal = PaymentCardValue.globalId == 688008 ? true : false;
    this.paymentStatus = PaymentCardValue.status;
    this.tooltip =
      this.isGlobal == true
        ? "To enable actions update payment to donor"
        : "Actions";
    this.currencyAmount = PaymentCardValue.currencyAmount;
    this.currencyName = PaymentCardValue.currencyName;
    this.eventCurrency = this.localstoragedataService.getLoginUserCurrency();
    this.setDonaryBatchNum();
    this.ApplyPaymentTypeIcon(this.paymentType);
    this.StatusColor(this.status);
    this.GetDeclinedWallet(this.lstGatewayTransaction);

    if (PaymentCardValue.phoneLabels) {
      this.phoneLabels = PaymentCardValue.phoneLabels;
    }
    if (PaymentCardValue.phoneCountryCodeIDs) {
      this.countryCodeId = PaymentCardValue.phoneCountryCodeIDs;
    }
    if (PaymentCardValue.phones && PaymentCardValue.phones.indexOf(",") > -1) {
      this.phoneNumbers = PaymentCardValue.phones.split(",");
    } else {
      this.phoneNumbers = PaymentCardValue.phones;
    }
    if (PaymentCardValue.emails && PaymentCardValue.emails.indexOf(",") > -1) {
      this.emails = PaymentCardValue.emails.split(",");
    } else {
      this.emails = PaymentCardValue.emails;
    }
    if (
      this.lstRelatedReceiptLogs != null &&
      this.lstRelatedReceiptLogs.length > 0
    ) {
      this.lstRelatedReceiptLogs.forEach((s) => {
        if (s.status == false) {
          s.status_class = "pymnt_failed";
        } else if (s.status == true) {
          s.status_class = "pymnt_success";
        }
      });
    }
    this.getCcIcon(this.paymentType);
    this.isloading = false;
  }

  ngOnInit() {
    this.getAllPaymentAPIGateway();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
        cursor: " grab",
      });
    });
    this.makeTransactionPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Transaction")
      .map((x) => x.isActive)[0];
    this.tabRandNumber = Math.floor(Math.random() * 200 + 1);
    if (
      this.localstoragedataService.getLoginUserEventGuId() ==
      "1acca970-da93-463f-896d-519db76f0b49"
    ) {
      this.isEventBatchEdit = true;
    }
  }
  getAllPaymentAPIGateway() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentApiGatewayService
      .getAllPaymentAPIGateway(eventGuId)
      .subscribe((res: any) => {
        res.forEach((item) => {
          if (!(item.countryCodeId == 1 || item.countryCodeId == null)) {
            this.TransColName = true;
          }
        });
      });
  }

  ApplyPaymentTypeIcon(paymenttype) {
    if (paymenttype == "Cash") {
      this.paymenttype_icn = "cash_icon";
    } else if (paymenttype == "Check") {
      this.paymenttype_icn = "check_icon";
    } else if (paymenttype == "OJC") {
      this.paymenttype_icn = "ojc_icon";
    } else if (paymenttype == "Credit Card") {
      this.paymenttype_icn = "creditcard_icon";
    } else if (paymenttype == "Other") {
      this.paymenttype_icn = "other_icon";
    }
  }
  StatusColor(status) {
    if (status == "Success") {
      this.status_class = "paymnt_success";
    } else if (status == "Error") {
      this.status_class = "paymnt_error";
    } else if (status == "Voided") {
      this.status_class = "paymnt_voided";
    } else if (status == "Refunded") {
      this.status_class = "paymnt_refunded";
    } else if (status == "Processing") {
      this.status_class = "paymnt_processing";
    } else if (status == "Pending") {
      this.status_class = "check-pending";
    } else if (status == "Deposited") {
      this.status_class = "check-deposited";
    } else if (status == "Declined") {
      this.status_class = "check-declined";
    }
  }

  GetDeclinedWallet(lstTransList) {
    if (lstTransList) {
      var walletId = lstTransList.find((x) => x.status.includes("Declined"));
      if (walletId) {
        this.declinedWalletId = walletId.walletId;
      }
    }
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  OpenScheduleCard(scheduleId) {
    if (scheduleId != null && scheduleId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup schedule_paymentcard payment-schedule-modal",
      };
      const modalRef = this.commonMethodService.openPopup(
        SchedulePaymentCardPopupComponent,
        this.modalOptions
      );
      var objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        scheduleId: scheduleId,
      };
      this.cardService.getScheduleCard(objScheduleCard).subscribe(
        (res: any) => {
          modalRef.componentInstance.SchedulePaymentCardData = res;
        },
        (err) => {
          modalRef.close();
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
  }

  editPaymentPopup(paymentId) {
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_payment payment_card modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      EditPaymentPopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentService
      .EditPayment(eventGuId, paymentId)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;

        res.isAppliedPledge =
          this.lstRelatedPledgePayments &&
          this.lstRelatedPledgePayments.length > 0
            ? true
            : false;
        modalRef.componentInstance.EditPaymentData = res;
        modalRef.componentInstance.statusEditPaymentData = this.status;
        modalRef.componentInstance.isBatchNumEditPaymentData = this.batchNum;
        modalRef.componentInstance.EditPaymentTypeRefNum = {
          paymentType: this.paymentType,
          refNum: this.refNum,
        };
        modalRef.componentInstance.emtEditPayment.subscribe(() => {
          this.isloading = true;
          let objDonorCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            paymentId: paymentId,
          };
          this.cardService
            .getPaymentCard(objDonorCard)
            .subscribe((res: any) => {
              this.isloading = false;
              this.setValue(res);
            });
        });
      });
  }

  sendMailReceipt(paymentId) {
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
      id: paymentId,
      type: "Payment",
      accountId: this.accountId,
      address: this.address,
      cityStateZip: this.cityStateZip,
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe(() => {
      this.isloading = true;
      let objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        paymentId: paymentId,
      };
      this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
        this.isloading = false;
        this.PaymentCardData = res;
      });
    });
  }

  makeTransactionPopup() {
    this.isloading = false;
    this.showTrans = false;
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
      jewishname: this.fullNameJewish,
      fullname: this.fullName,
      accountId: this.accountId,
      globalId: this.globalId,
      paymentDetails: this.paymentDetails,
      type: "PaymentCard",
    };
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
    modalRef.componentInstance.transactionDetails = {
      details: this.paymentDetails,
    };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe(() => {
      this.isloading = true;
      let objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        paymentId: this.paymentId,
      };
      this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
        this.isloading = false;
        this.PaymentCardData = res;
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

  VoidPayment(paymentId, status) {
    if (status == "batched" || status == "Declined" || status == "Error") {
      this.deletePayment(paymentId, status);
    } else {
      if (this.batchNum && paymentId) {
        //issue refund api call
        Swal.fire({
          title: "Payment is batched!",
          text: "",
          showCancelButton: true,
          cancelButtonText: "Issue refund",
          confirmButtonText: "Void from portal",
          showCloseButton: true,
          customClass: {
            cancelButton: "btn-Issue-refund",
            confirmButton: "btn-Void-from-portal",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            //Void from portal button clicked
            var paymentIdsArray = [];
            paymentIdsArray.push("paymentIds=" + paymentId);
            this.onDeletePyament(paymentIdsArray);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            var txtRefundAmout = "";

            Swal.fire({
              title: "Please enter refund amount",
              input: "number",
              confirmButtonText: "Issue refund",
              showCloseButton: true,
              inputAttributes: {
                step: "any",
              },
              customClass: {
                confirmButton: "btn_ok",
                validationMessage: "my-validation-message",
                input: "form-control txt-Refun-dAmout",
              },
              preConfirm: (value) => {
                if (!value) {
                  Swal.showValidationMessage(
                    '<i class="fa fa-info-circle"></i> Amount is required'
                  );
                }
                if (
                  parseFloat(value) > parseFloat(this.currencyAmount.toString())
                ) {
                  Swal.showValidationMessage(
                    '<i class="fa fa-info-circle"></i> Please check refund amount'
                  );
                }
                txtRefundAmout = value;
              },
            }).then((res) => {
              if (res.isConfirmed) {
                this.refundPayment(paymentId, txtRefundAmout);
              }
            });
          }
        });
      } else {
        Swal.fire({
          title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
          text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, void it!",
          cancelButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
          ),
        }).then((result) => {
          if (result.value) {
            var objVoidPayment = {
              paymentId: paymentId,
              loginUserId: this.localstoragedataService.getLoginUserId(),
              macAddress: this.localstoragedataService.getLoginUserGuid(),
              eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            };
            this.paymentService.VoidPayment(objVoidPayment).subscribe(
              (res: any) => {
                if (res) {
                  if (res.status == "Success") {
                    Swal.fire({
                      title: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.SUCCESS_TITLE"
                      ),
                      text: res.message,
                      icon: "success",
                      confirmButtonText: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.BUTTON.CONFIRM.OK"
                      ),
                      customClass: {
                        confirmButton: "btn_ok",
                      },
                    }).then(() => {
                      this.emtRetryPayment.emit(res);

                      this.isloading = true;
                      let objDonorCard = {
                        eventGuId:
                          this.localstoragedataService.getLoginUserEventGuId(),
                        paymentId: paymentId,
                      };
                      this.cardService
                        .getPaymentCard(objDonorCard)
                        .subscribe((res: any) => {
                          this.isloading = false;
                          this.PaymentCardData = res;
                        });
                    });
                    // this.activeModal.dismiss();
                  } else if (res.status == "Error") {
                    this.deletePayment(paymentId, res.message);
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
            this.isloading = false;
          }
        });
      }
    }
  }
  isOnlyPledgePayment: boolean = false;
  printReceipt(paymentId) {
    this.showAction = false;
    this.isloading = false;
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

    var objMailReceipt = {
      type: "Payment",
      id: paymentId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.PrintReceipt(objMailReceipt).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.fileDetails = {
            filename: res.receiptFileUrl,
            filetype: res.contentType,
          };
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

  SendTextReceipt(paymentId) {
    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_textreceipt send_emailreceipt",
    };
    let rowColumn = this.commonMethodService.getLabelArray(
      this.phoneLabels,
      this.phoneNumbers,
      this.countryCodeId
    );

    const modalRef = this.commonMethodService.openPopup(
      SendTextreceiptPopupComponent,
      this.modalOptions
    );
    modalRef.result.then((data) => {
      this.PaymentCardDataValue(data);
    });
    modalRef.componentInstance.Info = {
      id: paymentId,
      type: "Payment",
      phoneList: rowColumn,
      accountId: this.accountId,
      isDonorSelected: this.fullNameJewish ? true : false,
    };
  }

  SendEmailReceipt(paymentId, email, emailLabels) {
    this.showAction = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_emailreceipt",
    };

    let rowColumn = this.commonMethodService.getLabelArray(
      emailLabels,
      email,
      null
    );
    const modalRef = this.commonMethodService.openPopup(
      SendEmailreceiptPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = {
      id: paymentId,
      type: "Payment",
      emailList: rowColumn,
      accountId: this.accountId,
      isDonorSelected: this.fullNameJewish ? true : false,
      phoneNumber:
        this.phoneNumbers && this.phoneNumbers.length > 0
          ? this.phoneNumbers[0]
          : null,
      isPaymentByClicked: true,
      pledgePayment:
        this.lstRelatedPledgePayments && this.lstRelatedPledgePayments.length,
    };
  }

  OpenWalletDetails() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup wallet_list",
    };
    const modalRef = this.commonMethodService.openPopup(
      WalletlistPopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.donorService
      .getWalletByAccountId(eventGuId, Number(this.accountId))
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.WalletData = res;
          modalRef.componentInstance.AccountId = this.accountId;
          modalRef.componentInstance.PaymentId = this.paymentId;
          modalRef.componentInstance.SelectedWallet = this.walletId;
          modalRef.componentInstance.ProccessButton = true;
          modalRef.componentInstance.DeclinedWalletId = this.declinedWalletId;
          var objPaymentCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            paymentId: this.paymentId,
          };
          modalRef.componentInstance.emtUpdateWallet.subscribe((res) => {
            this.isloading = true;
            if (res) {
              this.cardService
                .getPaymentCard(objPaymentCard)
                .subscribe((res: any) => {
                  // hide loader
                  this.isloading = false;
                  {
                    this.PaymentCardData = res;
                    this.commonMethodService.sendPaymentTrans(true);
                  }
                });
            }
          });
        } else {
          modalRef.componentInstance.AccountId = this.accountId;
          modalRef.componentInstance.PaymentId = this.paymentId;
        }
      });
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

  RetryPayment(paymentId, walletId) {
    this.isloading = true;
    const objRetryPayment = {
      PaymentId: paymentId,
      WalletId: walletId,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
    };

    this.paymentService.RetryPayment(objRetryPayment).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res.paymentStatus === "Success") {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SUCCESS_TITLE"
            ),
            text: "Payment done successfully",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.emtRetryPayment.emit(res);
            this.isloading = true;
            let objDonorCard = {
              eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
              paymentId: paymentId,
            };
            this.cardService
              .getPaymentCard(objDonorCard)
              .subscribe((res: any) => {
                this.isloading = false;
                this.PaymentCardData = res;
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
        this.notificationService.showError(
          error.error,
          "Error while Sending data !!"
        );
      }
    );
  }

  reloadData() {
    this.isloading = true;
    let objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: this.paymentId,
    };
    this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
      this.isloading = false;
      this.PaymentCardData = res;
    });
  }

  OpenCheckDetails() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup check_number_details_popup",
    };

    const modalRef = this.commonMethodService.openPopup(
      CheckDetailsPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.RefNum = this.refNum;
    modalRef.componentInstance.PaymentId = this.paymentId;

    modalRef.componentInstance.emtPaymentCheckUpdate.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
      this.reloadData();
    });
  }

  openPledgeCardPopup(pledgeId) {
    if (pledgeId != undefined) {
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

  openCampaignCard(campaignId) {
    if (campaignId != undefined) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup collector_card payment_card_campaigns",
      };
      const modalRef = this.commonMethodService.openPopup(
        CampaignCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.CampaignID = campaignId;
      const obj = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        CampaignId: campaignId,
      };
      this.campaignService.getCampaignCard(obj).subscribe(
        (res: any) => {
          this.isloading = false;
          modalRef.componentInstance.CampaignCardData = res;
          modalRef.componentInstance.CampaignId = campaignId;
        },
        () => {
          this.isloading = false;
        }
      );
    }
  }

  openReasonCard(reasonId) {
    if (reasonId != undefined) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup reason_card payment_card_reason",
      };
      const modalRef = this.commonMethodService.openPopup(
        ReasonCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.ReasonId = reasonId;
      const obj = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        reasonId: reasonId,
      };
      this.reasonService.getReasonCard(obj).subscribe(
        (res: any) => {
          this.isloading = false;
          modalRef.componentInstance.ReasonCardData = res;
        },
        () => {
          this.isloading = false;
        }
      );
    }
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

  deletePayment(paymentId, status) {
    if (
      status.includes("CardKnox Void Failed") ||
      status.includes("refund") ||
      status.includes("credit") ||
      status.includes("Payment api key info not found") ||
      status.includes("Matbia Void Failed") ||
      status.includes("OneGiv could not be supported void")
    ) {
      Swal.fire({
        title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
        html:
          status +
          "<br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Delete",
        denyButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
        ),
        confirmButtonText: "Refund",
        showDenyButton: true,
        customClass: {
          confirmButton: "refund_btn",
          cancelButton: "delete_btn",
          denyButton: "keep_btn",
        },
      }).then((result) => {
        if (result.value) {
          var txtRefundAmout = "";

          Swal.fire({
            title: "Please enter refund amount",
            input: "number",
            confirmButtonText: "Issue refund",
            showCloseButton: true,
            inputAttributes: {
              step: "any",
            },
            customClass: {
              confirmButton: "btn_ok",
              validationMessage: "my-validation-message",
              input: "form-control txt-Refun-dAmout",
            },
            preConfirm: (value) => {
              if (!value) {
                Swal.showValidationMessage(
                  '<i class="fa fa-info-circle"></i> Amount is required'
                );
              }
              if (
                parseFloat(value) > parseFloat(this.currencyAmount.toString())
              ) {
                Swal.showValidationMessage(
                  '<i class="fa fa-info-circle"></i> Please check refund amount'
                );
              }
              txtRefundAmout = value;
            },
          }).then((res) => {
            if (res.isConfirmed) {
              this.refundPayment(paymentId, txtRefundAmout);
            }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          var paymentIdsArray = [];
          paymentIdsArray.push(paymentId); //added new
          paymentIdsArray = paymentIdsArray.map((element) => {
            return element;
          });
          this.paymentService.DeletePayment(paymentIdsArray).subscribe(
            (res: any) => {
              this.isloading = false;
              ///
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
                this.emtRetryPayment.emit(res);

                this.isloading = true;
                let objDonorCard = {
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                  paymentId: paymentId,
                };
                this.cardService
                  .getPaymentCard(objDonorCard)
                  .subscribe((res: any) => {
                    this.isloading = false;
                    this.PaymentCardData = res;
                  });
              });
              ///
            },
            () => {
              this.isloading = false;
            }
          );
        } else if (result.isDenied) {
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
    } else {
      Swal.fire({
        title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
        html:
          status +
          "<br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, void it!",
        cancelButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
        ),
      }).then((result) => {
        if (result.value) {
          var paymentIdsArray = [];
          paymentIdsArray.push(paymentId); //added new
          paymentIdsArray = paymentIdsArray.map((element) => {
            return element;
          });
          this.paymentService.DeletePayment(paymentIdsArray).subscribe(
            (res: any) => {
              this.isloading = false;
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
                this.emtRetryPayment.emit(res);

                this.isloading = true;
                let objDonorCard = {
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                  paymentId: paymentId,
                };
                this.cardService
                  .getPaymentCard(objDonorCard)
                  .subscribe((res: any) => {
                    this.isloading = false;
                    this.PaymentCardData = res;
                  });
              });
              ///
            },
            () => {
              this.isloading = false;
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
  }
  refundPayment(paymentId, amount) {
    var obj = {
      paymentId: paymentId,
      loginUserId: this.localstoragedataService.getLoginUserId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      amount: amount,
    };
    this.paymentService.RefundPayment(obj).subscribe((res: any) => {
      if (res) {
        Swal.fire({
          text: res.message,
          icon: res.status.toLowerCase(),
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        }).then(() => {
          let objDonorCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            paymentId: paymentId,
          };
          this.cardService
            .getPaymentCard(objDonorCard)
            .subscribe((res: any) => {
              this.isloading = false;
              this.PaymentCardData = res;
            });
        });
      }
    });
  }
  onDeletePyament(paymentIdsArray) {
    paymentIdsArray = paymentIdsArray.map((element) => {
      return element;
    });
    this.paymentService.DeletePayment(paymentIdsArray).subscribe(
      (res: any) => {
        this.isloading = false;
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
          this.commonMethodService.sendPaymentTrans(true);
        });
      },
      () => {
        this.isloading = false;
      }
    );
  }
  getCurrencyIcon(currencyName: string) {
    if (currencyName) {
      return "icon-" + currencyName.toLowerCase();
    }
  }

  checkCurrency() {
    return (
      this.currencyAmount &&
      parseFloat(this.currencyAmount) != parseFloat(this.amount.toString())
    );
  }
  getCcIcon(paymentType: string) {
    if (paymentType) {
      if (paymentType === "Check") {
        this.checkType = true;
      }
      this.ccIconCls = paymentType.replace(" ", "");
      this.ccIconCls =
        this.ccIconCls == "Matbia" ? "charitycard" : this.ccIconCls;
      return (this.ccIconCls = "cc-icon-" + this.ccIconCls.toLowerCase());
    }
  }
  isReminderDisplay() {
    return this.accountNum == "DEFAULT" ? false : true;
  }
  openNotificationSidebarPopup(notificationId = 1) {
    if (notificationId != null && notificationId != 0) {
      this.isloading = true;
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
  formatAmount(value, currency = "USD") {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  }

  checkStatus = true;
  statusDropdown() {
    this.checkStatus =
      this.status === "Declined" ? this.checkStatus : !this.checkStatus;
  }

  updatePayment() {
    let paymentArray = [];
    paymentArray[0] = this.paymentDetails;
    this.isloading = true;
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentService
      .EditPayment(eventGuId, Number(this.paymentId))
      .subscribe((res: any) => {
        if (res) {
          this.collectorId = res.collectorId;
          this.campaignId = res.campaignID;
          this.reasonId = res.paymentReasonID;
          this.locationId = res.locationID;
        }
        const pledges = this.lstRelatedPledgePayments
          ? this.lstRelatedPledgePayments.map((item) => {
              let x: any = {};
              x.PledgeID = item.pledgeId;
              x.PaidAmount = item.paidAmount;
              x.RemainingAmount =
                parseFloat(item.pledgeAmount) - parseFloat(item.paidAmount);
              return x;
            })
          : null;

        if (this.isDeclinedStatus && pledges != null) {
          pledges.forEach((element) => {
            element.PaidAmount = 0;
            element.RemainingAmount = 0;
          });
        }

        var objUpdatePaymentData: any = {};
        objUpdatePaymentData = {
          PaymentId: this.paymentId,
          MacAddress: this.localstoragedataService.getLoginUserGuid(),
          PaymentDate: moment(paymentArray[0].createdDate).format("YYYY-MM-DD"),
          AccountId: paymentArray[0].accountId,
          Amount: Number(paymentArray[0].amount),
          StatusId: this.checkStatusId,
          Note: this.note,
          UpdatedBy: this.localstoragedataService.getLoginUserId(),
          RefNum: this.refNum,
          cardHolderName: this.cardHolderName,
          CollectorId: this.collectorId,
          LocationId: this.locationId,
          CampaignId: this.campaignId,
          ReasonId: this.reasonId,
          Pledges: pledges
            ? pledges.filter((x) => {
                x.PaidAmount, x.PledgeID, x.RemainingAmount;
                return x;
              })
            : null,
        };
        this.paymentService.UpdatePayment(objUpdatePaymentData).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.analytics.editedPayment();
              Swal.fire({
                title: res,
                confirmButtonText: "Close",
                iconHtml: "<img src='/assets/dist/img/checked_icon.svg' />",
                showCloseButton: true,
                customClass: {
                  title: "edit_payment_success_title",
                  confirmButton: "btn_ok",
                  container: "payment-done",
                },
              });
              this.activeModal.dismiss();
              this.commonMethodService.sendPaymentTrans(true);
            }
          },
          (error) => {
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
            this.isloading = false;
          }
        );
      });
  }

  onStatusChange(selectedValue: number) {
    this.checkStatusId = selectedValue;
    this.checkStatus = true;
    if (this.checkStatusId == 9) {
      this.status_class = "check-pending";
      this.status = "Pending";
    }
    if (this.checkStatusId == 10) {
      this.status_class = "check-deposited";
      this.status = "Deposited";
    }
    if (this.checkStatusId == 3) {
      this.status_class = "check-declined";
      this.status = "Declined";
    }
    this.updatePayment();
  }
  get isCheckPaymentType() {
    return this.paymentType === "Check";
  }

  get isDeclinedStatus() {
    return this.status === "Declined";
  }

  setDonaryBatchNum() {
    if (this.lstGatewayTransaction && this.lstGatewayTransaction.length > 0) {
      let tempDonaryBatchNum: string[] = [];
      let tempGatewayBatchNum: string[] = [];
      this.lstGatewayTransaction.forEach((data) => {
        if (data.donaryBatchNum != null) {
          tempDonaryBatchNum.push(data.donaryBatchNum);
        }
        if (data.gatewayBatchNum != null) {
          tempGatewayBatchNum.push(data.gatewayBatchNum);
        }
      });
      this.donaryBatchNum = tempDonaryBatchNum.join(", ");
      this.gatewayBatchNum = tempGatewayBatchNum.join(", ");
    }
  }

  OpenLegalReceipt(paymentId, transactionData, paymentType) {
    let objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: paymentId,
    };
    if (
      paymentType == "Cash" ||
      paymentType == "Check" ||
      paymentType == "Other"
    ) {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "receipt_popup modal-generate-receipt",
      };
      const modalRef = this.commonMethodService.openPopup(
        LegalReceiptCountryPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.paymentId = paymentId;
      modalRef.componentInstance.transactionData = this.paymentDetails;

      modalRef.componentInstance.gridFilterData = this.gridFilterData;
      modalRef.componentInstance.recallPaymentCard?.subscribe((val) => {
        this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
          this.receiptGenerated = true;
          this.PaymentCardData = res;
        });
      });
    } else {
      var obj = {
        paymentId: paymentId,
      };
      this.paymentTransactionService
        .GenerateLegalReceipt(obj)
        .subscribe((res) => {
          if (res.legalReceiptNum != null) {
            this.modalOptions = {
              centered: true,
              size: "md",
              backdrop: "static",
              keyboard: true,
              windowClass: "receipt_popup",
            };
            const modalRef = this.commonMethodService.openPopup(
              LegalReceiptPopupComponent,
              this.modalOptions
            );
            modalRef.result.then((result) => {
              this.valueFromPopup = result;
              if (this.valueFromPopup == true) {
                this.commonMethodService.sendPaymentTrans(true);
              }
            });
            modalRef.componentInstance.legalReceiptNum = res.legalReceiptNum;
            modalRef.componentInstance.transactionData = this.paymentDetails;
            modalRef.componentInstance.gridFilterData = this.gridFilterData;

            this.cardService
              .getPaymentCard(objDonorCard)
              .subscribe((res: any) => {
                this.receiptGenerated = true;
                this.PaymentCardData = res;
              });
          } else {
            Swal.fire({
              title: "Error",
              text: "Not able to generate legal receipt",
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
}
