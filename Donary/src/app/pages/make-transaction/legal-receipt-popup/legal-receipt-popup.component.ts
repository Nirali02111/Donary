import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { Component, OnInit, Input } from "@angular/core";

import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { SendTextreceiptPopupComponent } from "../../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { PaymentTransactionComponent } from "../../transaction/payment-transaction/payment-transaction.component";
import { SendEmailreceiptPopupComponent } from "../../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";

@Component({
  selector: "app-legal-receipt-popup",
  templateUrl: "./legal-receipt-popup.component.html",
  standalone: false,
  styleUrls: ["./legal-receipt-popup.component.scss"],
})
export class LegalReceiptPopupComponent implements OnInit {
  isOnlyPledgePayment: boolean = false;
  modalOptions: NgbModalOptions;
  paymentId: any;
  globalId: any;
  emailList: any;
  accountId: any;
  fullNameJewish: any;
  phoneNumberList: any;
  pledgePayment: any;
  phoneCountryCodeID: any;
  address: any;
  cityStateZip: any;
  additionalPhoneLabels: any;
  isNewTrans: boolean = false;
  rowColumn: any[];
  additionalPhones: any;
  additionalEmail: any;
  phones: any;
  phone: any;
  additionalEmailLabels: any;
  countryCodeId: any;

  @Input() set transactionData(transactionData) {
    if (transactionData) {
      this.paymentId = transactionData.paymentId;
      this.globalId = transactionData.globalId;
      this.emailList = transactionData.emailList;
      this.globalId = transactionData.globalId;
      this.fullNameJewish = transactionData.fullNameJewish;
      this.phoneNumberList = transactionData.phoneNumberList;
      this.pledgePayment = transactionData.pledgePayment;
      this.accountId = transactionData.accountId;
      this.phoneCountryCodeID = transactionData.phoneCountryCodeID;
      this.address = transactionData.address;
      this.cityStateZip = transactionData.cityStateZip;
    }
  }

  @Input() set DataTrans(data: any) {
    if (data) {
      this.isNewTrans = true;
      this.additionalPhoneLabels = data.additionalPhoneLabels;
      this.additionalPhones = data.additionalPhones;
      this.additionalEmail = data.additionalEmail;
      this.phones = data.phones;
      this.phone = data.phone;
      this.additionalEmailLabels = data.additionalEmailLabels;
      this.countryCodeId = data.countryCodeId;
    }
  }

  @Input() legalReceiptNum: any;
  @Input() gridFilterData: any;
  isClosed: boolean = true;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private messengerService: MessengerService
  ) {}
  ngOnInit() {}

  closePopup() {
    this.activeModal.close(this.isClosed);
  }

  printReceipt() {
    if (this.globalId != "688008") {
      // this.isloading = false;
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
        id: this.paymentId,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        isOnlyPledgePayment: this.isOnlyPledgePayment,
      };

      this.messengerService.PrintReceipt(objMailReceipt).subscribe(
        (res: any) => {
          // this.isloading = false;
          if (res) {
            this.gridFilterData?.forEach((element) => {
              if (element.paymentId == this.paymentId) {
                element.printSent = true;
              }
            });
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
          //  this.isloading = false;
          modalRef.close(PrintSingleReceiptPopupComponent);
          console.log(error);
          Swal.fire({
            title: "Error while fetching data !!",
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
  }

  SendTextReceipt() {
    if (this.globalId != "688008") {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_textreceipt send_emailreceipt",
      };
      if (this.isNewTrans == true) {
        let phoneArray: any = [];
        if (this.additionalPhones && this.additionalPhones.indexOf(",") > -1) {
          phoneArray = this.additionalPhones.split(", ");
        } else {
          phoneArray = this.additionalPhones;
        }
        this.rowColumn = this.commonMethodService.getLabelArray(
          this.additionalPhoneLabels,
          phoneArray,
          this.countryCodeId
        );
      } else {
        var donorDetails = this.gridFilterData?.find(
          (x) => x.paymentId == this.paymentId
        );
        if (donorDetails) {
          let { phoneNumberList, phoneLabels } = donorDetails;
          this.rowColumn = this.commonMethodService.getLabelArray(
            phoneLabels,
            phoneNumberList,
            this.phoneCountryCodeID
          );
        }
      }
      const modalRef = this.commonMethodService.openPopup(
        SendTextreceiptPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.Info = {
        id: this.paymentId,
        type: "Payment",
        phoneList: this.rowColumn,
        accountId: this.accountId,
        globalId: this.globalId,
        isDonorSelected: this.fullNameJewish ? true : false,
      };
    }
  }
  SendEmailReceipt() {
    if (this.globalId != "688008") {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_emailreceipt",
      };
      if (this.isNewTrans == true) {
        let elist: any = [];
        let emailArray: any = [];
        if (this.emailList) {
          for (let index = 0; index < this.emailList.length; index++) {
            const element = this.emailList[index].emailAddress;
            elist.push(element);
          }
        }
        if (this.additionalEmail && this.additionalEmail.indexOf(",") > -1) {
          emailArray = this.additionalEmail.split(", ");
        } else {
          emailArray = this.additionalEmail;
        }
        let rowColumn = this.commonMethodService.getLabelArray(
          this.additionalEmailLabels,
          emailArray,
          this.countryCodeId
        );

        const modalRef = this.commonMethodService.openPopup(
          SendEmailreceiptPopupComponent,
          this.modalOptions
        );

        modalRef.componentInstance.Info = {
          id: this.paymentId,
          type: "Payment",
          emailList: rowColumn ? rowColumn : elist,
          accountId: this.accountId,
          isDonorSelected: true,
          globalId: this.globalId,
          phoneNumber: this.phones == undefined ? this.phone : this.phones,
        };
      } else {
        var donorDetails = this.gridFilterData?.find(
          (x) => x.paymentId == this.paymentId
        );
        if (donorDetails) {
          let { emailList, emailLabels } = donorDetails;

          let rowColumn = this.commonMethodService.getLabelArray(
            emailLabels,
            emailList,
            null
          );
          const modalRef = this.commonMethodService.openPopup(
            SendEmailreceiptPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.Info = {
            id: this.paymentId,
            type: "Payment",
            emailList: rowColumn,
            accountId: this.accountId,
            globalId: this.globalId,
            isDonorSelected: this.fullNameJewish ? true : false,
            phoneNumber:
              this.phoneNumberList && this.phoneNumberList.length > 0
                ? this.phoneNumberList[0]
                : null,
            isPaymentByClicked: true,
            pledgePayment: this.pledgePayment,
          };
        }
      }
    }
  }

  SendMailReceipt() {
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
      id: this.paymentId,
      type: "Payment",
      accountId: this.accountId,
      address: this.address,
      cityStateZip: this.cityStateZip,
      globalId: this.globalId,
    };
    modalRef.componentInstance.emitAddressUpdated.subscribe(($e) => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }
}
