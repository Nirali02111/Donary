import { CurrencyPipe, NgTemplateOutlet } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentService } from "src/app/services/payment.service";
import { PledgeService } from "src/app/services/pledge.service";
import Swal from "sweetalert2";
import { LegalReceiptCountryPopupComponent } from "../legal-receipt-country-popup/legal-receipt-country-popup.component";
import { LegalReceiptPopupComponent } from "../legal-receipt-popup/legal-receipt-popup.component";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { CreatePledgeTransactionPopupComponent } from "../create-pledge-transaction-popup/create-pledge-transaction-popup.component";
import { DonationTransactionPopupComponent } from "../donation-transaction-popup/donation-transaction-popup.component";
import { PayOffPledgeTransactionPopupComponent } from "../pay-off-pledge-transaction-popup/pay-off-pledge-transaction-popup.component";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { MessengerService } from "src/app/services/messenger.service";
import { SendTextreceiptPopupComponent } from "../../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { SendEmailreceiptPopupComponent } from "../../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { AfterOfTransactionItem } from "../transaction-control-provider.service";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-after-off-transaction",
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, NgTemplateOutlet],
  templateUrl: "./after-off-transaction.component.html",
  styleUrl: "./after-off-transaction.component.scss",
})
export class AfterOffTransactionComponent {
  isActionLoading = false;

  @Input({ required: true }) type: "Pledge" | "Transaction" | "Pay-of-pledge" =
    "Transaction";

  @Input({ required: true }) isError = false;

  @Input() paymentMethodId: number = 1;

  @Input({ required: true }) item: AfterOfTransactionItem = null;
  private analytics = inject(AnalyticsService);

  constructor(
    private activeModal: NgbActiveModal,
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private paymentService: PaymentService,
    private paymentTransactionService: PaymentTransactionService,
    private pledgeService: PledgeService,
    private messengerService: MessengerService
  ) { }

  closePopup() {
    this.activeModal.close();
  }

  printReceipt() {
    const objMailReceipt = {
      type: this.type === "Pledge" ? "Pledge" : "Payment",
      id: this.item.paymentId,
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.type === "Pay-of-pledge",
    };

    this.messengerService.PrintReceipt(objMailReceipt).subscribe((res: any) => {
      this.isActionLoading = false;
      if (res) {
        const modalRef = this.commonMethodService.openPopup(
          PrintSingleReceiptPopupComponent,
          {
            centered: true,
            size: "lg",
            backdrop: "static",
            keyboard: true,
            windowClass: "drag_popup print_receipt",
          }
        );

        modalRef.componentInstance.fileDetails = {
          filename: res.receiptFileUrl,
          filetype: res.contentType,
        };

        return;
      }
      this.tryAgainError(res.errorResponse);
    }),
      (error) => {
        this.isActionLoading = false;

        this.displayErrorPopup(error.error);
      };
  }

  sendTextReceipt() {
    this.isActionLoading = false;

    const phoneArray: any = [];

    const rowColumn = this.commonMethodService.getLabelArray(
      "",
      phoneArray,
      ""
    );
    const modalRef = this.commonMethodService.openPopup(
      SendTextreceiptPopupComponent,
      {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_textreceipt send_emailreceipt",
      }
    );

    modalRef.componentInstance.Info = {
      id: this.item.paymentId,
      type: this.type === "Pledge" ? "Pledge" : "Payment",
      phoneList: rowColumn,
      accountId: this.item.accountId,
      isDonorSelected: "",
      globalId: "",
    };
  }
  sendMailReceipt() {
    this.isActionLoading = false;

    const modalRef = this.commonMethodService.openPopup(
      SendMailreceiptPopupComponent,
      {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_mailreceipt",
      }
    );

    modalRef.componentInstance.Info = {
      id: this.item.paymentId,
      type: this.type === "Pledge" ? "Pledge" : "Payment",
      accountId: this.item.accountId,
      accountNum: this.item.accountNum,
      address: "",
      cityStateZip: "",
      isGlobalId: "",
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe((obj) => { });
  }

  sendEmailReceipt() {
    this.isActionLoading = false;

    let elist: any = [];
    let emailArray: any = [];

    let rowColumn = this.commonMethodService.getLabelArray("", emailArray, "");

    const modalRef = this.commonMethodService.openPopup(
      SendEmailreceiptPopupComponent,
      {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_emailreceipt",
      }
    );

    modalRef.componentInstance.Info = {
      id: this.item.paymentId,
      type: this.type === "Pledge" ? "Pledge" : "Payment",
      emailList: rowColumn ? rowColumn : elist,
      accountId: this.item.accountId,
      isDonorSelected: "",
      globalId: "",
      phoneNumber: null,
    };
  }

  onVoidAction() {
    Swal.fire({
      title: this.commonMethodService.getTranslate('WARNING_SWAL.TITLE'),
      text: this.commonMethodService.getTranslate('WARNING_SWAL.TEXT'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT'),
      cancelButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT'),
    }).then((result) => {
      if (result.value) {
        if (this.type === "Pledge") {
          this.doVoidPledge(this.item.pledgeId);
          return;
        }
        this.doVoidPayment(this.item.paymentId);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.openNoActionMessage();
      }
    });
  }

  onDoAgain() {
    this.closePopup();
    if (this.type === "Pledge") {
      this.commonMethodService.openPopup(
        CreatePledgeTransactionPopupComponent,
        {
          centered: true,
          size: "xl",
          keyboard: true,
          backdropClass: "backdrop-show",
          windowClass: "modal-main modal-bill",
        }
      );
      return;
    }
    if (this.type === "Transaction") {
      this.commonMethodService.openPopup(DonationTransactionPopupComponent, {
        centered: true,
        size: "xl",
        keyboard: true,
        backdropClass: "backdrop-show",
        windowClass: "modal-main modal-donation",
      });

      return;
    }
    if (this.type === "Pay-of-pledge") {
      this.commonMethodService.openPopup(
        PayOffPledgeTransactionPopupComponent,
        {
          centered: true,
          size: "xl",
          keyboard: true,
          backdropClass: "backdrop-show",
          windowClass: "modal-main modal-pledge",
        }
      );

      return;
    }
  }

  private openNoActionMessage() {
    Swal.fire({
      title: this.commonMethodService.getTranslate('CANCELLED'),
      text: this.commonMethodService.getTranslate('WARNING_SWAL.NO_ACTION_TAKEN'),
      icon: "error",
      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
      customClass: {
        confirmButton: "btn_ok",
      },
    });
  }

  private doVoidPayment(paymentId: number) {
    var objVoidPayment = {
      paymentId: paymentId,
      loginUserId: this.localStorageDataService.getLoginUserId(),
      macAddress: this.localStorageDataService.getLoginUserGuid(),
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
    };
    this.paymentService.VoidPayment(objVoidPayment).subscribe(
      (res: any) => {
        this.isActionLoading = false;

        if (!res) {
          return;
        }

        if (res.status == "Success") {
          Swal.fire({
            title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
            text: res.message,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });

          this.commonMethodService.sendPaymentTrans(true);
          return;
        }
        if (res.status == "Error") {
          this.activeModal.dismiss();
          this.displayErrorPopup(res.message);
          return;
        }
        this.activeModal.dismiss();
        this.tryAgainError(res.errorResponse);
      },
      (error) => {
        this.activeModal.dismiss();
        this.displayErrorPopup(error.error);
      }
    );
  }

  private doVoidPledge(pledgeId: number) {
    this.isActionLoading = true;
    var objVoidPledge = {
      pledgeId: pledgeId,
      statusId: 3,
      accountId: this.item.accountId,
      macAddress: this.localStorageDataService.getLoginUserGuid(),
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
    };
    this.pledgeService.updatePledge(objVoidPledge).subscribe(
      (res: any) => {
        this.isActionLoading = false;

        if (res) {
          this.analytics.editedPledge();

          Swal.fire({
            title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.commonMethodService.sendPledgeTrans(true);
        } else {
          this.activeModal.dismiss();

          this.tryAgainError(res);
        }
      },
      (error) => {
        this.isActionLoading = false;
        this.activeModal.dismiss();
        this.displayErrorPopup(error.error);
      }
    );
  }

  private displayErrorPopup(error) {
    Swal.fire({
      title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
      text: error,
      icon: "error",
      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
      customClass: {
        confirmButton: "btn_ok",
      },
    });
  }

  private tryAgainError(text) {
    Swal.fire({
      title: this.commonMethodService.getTranslate('WARNING_SWAL.TRY_AGAIN'),
      text,
      icon: "error",
      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
      customClass: {
        confirmButton: "btn_ok",
      },
    });
  }

  OpenLegalReceipt() {
    if (this.paymentMethodId === 1 || this.paymentMethodId === 2) {
      this.generateForCashAndCheck();
      return;
    }

    const obj = {
      paymentId: this.item.paymentId,
    };

    this.paymentTransactionService
      .GenerateLegalReceipt(obj)
      .subscribe((res) => { });
    const modalRef = this.commonMethodService.openPopup(
      LegalReceiptPopupComponent,
      {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "receipt_popup",
      }
    );
    modalRef.result.then((result) => {
      if (result) {
        this.commonMethodService.sendPaymentTrans(true);
      }
    });

    // const transactionData = {
    //   paymentId: paymentId,
    //   globalId: this.globalId,
    //   emailList: this.emailList,
    //   "fullNameJewish ": this.isDonorSelected,
    //   phoneNumberList: phoneArray,
    //   pledgePayment: false,
    //   accountId: this.paymentAccountId,
    //   phoneCountryCodeID: this.countryCodeId,
    //   address: this.address || "",
    //   cityStateZip: this.cityStateZip || "",
    // };

    // const Data = {
    //   additionalPhoneLabels: this.additionalPhoneLabels,
    //   additionalPhones: this.additionalPhones,
    //   additionalEmail: this.additionalEmail,
    //   phones: this.phones,
    //   phone: this.phone,
    //   additionalEmailLabels: this.additionalEmailLabels,
    //   countryCodeId: this.countryCodeId,
    // };
    // modalRef.componentInstance.DataTrans = Data;
    // modalRef.componentInstance.transactionData = transactionData;
  }

  private generateForCashAndCheck() {
    const modalRef = this.commonMethodService.openPopup(
      LegalReceiptCountryPopupComponent,
      {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "receipt_popup modal-generate-receipt",
      }
    );
    modalRef.componentInstance.paymentId = this.item.paymentId;
    modalRef.componentInstance.transactionData = {};
  }
}
