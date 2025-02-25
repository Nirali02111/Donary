import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { EditTransactionInfoComponent } from "../edit-transaction-info/edit-transaction-info.component";
import Swal from "sweetalert2";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { BatchService } from "src/app/services/batch.service";
import { PaymentService } from "src/app/services/payment.service";
import { CustomeReportComponent } from "../custome-report/custome-report.component";
import * as moment from "moment";
import { PrintReceiptPopupComponent } from "../receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { AdvanceSMSActionService } from "src/app/services/helpers/advance-smsaction.service";
import { BulkSMSReceiptComponent } from "../receipt-actions/bulk-smsreceipt/bulk-smsreceipt.component";
import { BulkEmailReceiptComponent } from "../receipt-actions/bulk-email-receipt/bulk-email-receipt.component";
import * as _ from "lodash";
import { AddressValidateService } from "src/app/services/address-validate.service";
import { BulkMailReceiptComponent } from "../receipt-actions/bulk-mail-receipt/bulk-mail-receipt.component";
import { MessengerService } from "src/app/services/messenger.service";
import { forkJoin } from "rxjs";
import { AdvancereceiptActionPopupComponent } from "../advancereceipt-action-popup/advancereceipt-action-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-bulk-select-popup",
  templateUrl: "./bulk-select-popup.component.html",
  standalone: false,
  styleUrls: ["./bulk-select-popup.component.scss"],
})
export class BulkSelectPopupComponent implements OnInit {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  gridFilterData = [];
  paymentsSelectedCount: number = 0;
  paymentsSelectedAmount: number = 0;
  isBulkCheckbox: boolean = false;
  recordSelectedArray = [];
  retrySelectedArray = [];
  isSelected = false;
  isRetrySelected = false;
  modalOptions: NgbModalOptions;
  isPaymentTypeCheck: boolean = false;
  isloading: boolean;
  dropDownCustomReport: Array<{ label: string; value: string }> = [
    {
      label: "Sort By Eng Last, First Name",
      value: "NameEng",
    },
    {
      label: "Sort By Heb Last, First Name",
      value: "NameHeb",
    },
    {
      label: "Sort By Receipt Number",
      value: "ReceiptNum",
    },
  ];
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(6, "days"),
    endDate: moment(new Date()),
  };
  analytics = inject(AnalyticsService);
  @Input() set data(gridData: any) {
    if (gridData) {
      this.gridFilterData = gridData;
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private batchService: BatchService,
    private paymentService: PaymentService,
    private advanceSMSActionService: AdvanceSMSActionService,
    private addressValidateService: AddressValidateService,
    private messengerService: MessengerService
  ) {}

  ngOnInit() {}
  closePopup() {
    this.activeModal.dismiss();
  }
  selectRecord(event, type, paymentId, paymentStatus = null) {
    if (type == "selectAll") {
      this.isBulkCheckbox = true;
      if (event.target.checked) {
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.gridFilterData.map((element) => {
          if (
            element.paymentStatus == "Declined" ||
            element.paymentStatus == "Error"
          ) {
            this.isRetrySelected = true;
            this.retrySelectedArray.push(element.paymentId);
          }
          this.recordSelectedArray.push(element.paymentId);
        });
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = true;
        });
      } else {
        this.isSelected = false;
        this.isRetrySelected = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.retrySelectedArray = [];
      }
    } else {
      if (event.target.checked) {
        if (paymentStatus == "Declined" || paymentStatus == "Error") {
          if (!this.retrySelectedArray.includes(paymentId)) {
            this.retrySelectedArray.push(paymentId);
          }
          if (this.retrySelectedArray.length > 1) {
            this.isRetrySelected = true;
          }
        }
        if (!this.recordSelectedArray.includes(paymentId)) {
          this.recordSelectedArray.push(paymentId);
        }
        if (this.recordSelectedArray.length > 1) {
          this.isSelected = true;
        }
      } else {
        if (paymentStatus == "Declined" || paymentStatus == "Error") {
          if (this.retrySelectedArray.includes(paymentId)) {
            this.retrySelectedArray.forEach((element, index) => {
              if (element == paymentId)
                this.retrySelectedArray.splice(index, 1);
            });
            if (this.retrySelectedArray.length <= 1) {
              this.isRetrySelected = false;
            }
          }
        }
        if (this.recordSelectedArray.includes(paymentId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == paymentId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
        }
      }
    }
    this.paymentSelectedTotalCount();
  }
  paymentSelectedTotalCount() {
    this.paymentsSelectedAmount = 0;
    this.paymentsSelectedCount = this.recordSelectedArray.length;
    let resultArray = [];
    const resSel = this.recordSelectedArray.map((item) => {
      let donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
    });
    const resultAmount = resultArray.map((x) => {
      this.paymentsSelectedAmount += x.amount;
    });
  }
  editTransactionInfoPopup() {
    let resultArray = [];
    let selectedCheckTypeIDs = [];
    this.isPaymentTypeCheck = false;
    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
      if (donorDetails.paymentType == "Check") {
        selectedCheckTypeIDs.push(donorDetails.paymentId);
        this.isPaymentTypeCheck = true;
      }
    }
    let pledgePayment = resultArray.find((x) => x.pledgePayment != null);
    if (pledgePayment != null && !this.isPaymentTypeCheck) {
      Swal.fire({
        title: "",
        text: "Cannot edit transaction that has applied Pledges",
        icon: "warning",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
      });
    } else {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup edit_transaction",
      };

      const modalRef = this.commonMethodService.openPopup(
        EditTransactionInfoComponent,
        this.modalOptions
      );
      modalRef.componentInstance.types = "Payments";
      modalRef.componentInstance.transactionIds = this.recordSelectedArray;
      modalRef.componentInstance.checkTypeTransactionIds = selectedCheckTypeIDs;
      modalRef.componentInstance.data = {
        appliedPledges: pledgePayment != null,
        isPaymentTypeCheck: this.isPaymentTypeCheck,
      };
    }
  }
  editBatchPaymentPopup() {
    let selectedArray = this.recordSelectedArray;
    Swal.fire({
      title: "<b>Batch " + selectedArray.length + " payments</b>",
      html: '<h3>Add A Note</h3><textarea class="txt-batchnote" id="txtBatchNote" name="BatchNote" rows="5" cols="30"/>',
      showCancelButton: true,
      confirmButtonText: "Batch Payments",
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
      customClass: {
        confirmButton: "btn_batch",
        container: "batch_prnt",
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        let objBatch = {
          paymentIds: selectedArray,
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          batchNote: $("#txtBatchNote").val(),
          UpdatedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.batchService.saveBatch(objBatch).subscribe(
          (res) => {
            if (res) {
              this.isloading = false;
              Swal.fire({
                title: "<b>" + selectedArray.length + " payments batched</b>",
                text: "batch#" + res.batchNum,
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                  container: "batched_prnt",
                },
              }).then(() => {
                this.commonMethodService.sendPaymentTrans(true);
              });
            }
          },
          (error) => {
            Swal.fire(
              this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              error.error,
              "error"
            ).then(() => {
              this.commonMethodService.sendPaymentTrans(true);
            });
          }
        );
      } else {
      }
    });
  }
  AdvanceVoidPaymentAction() {
    let totalrecords = this.recordSelectedArray.length;
    let resultArray = [];
    let isBached = false;
    let isNotBached = false;
    let paymentIdsArray = [];
    for (const item of this.recordSelectedArray) {
      let paymentDetails = this.gridFilterData.find((x) => x.paymentId == item);
      if (paymentDetails) {
        let { paymentId, receiptNum, batchNum } = paymentDetails;

        const newDonotRcd = {
          paymentId: paymentId,
          receiptNum: receiptNum,
        };
        resultArray.push(newDonotRcd);
        paymentIdsArray.push(paymentId);
        if (batchNum) {
          isBached = true;
        } else {
          isBached = false;
          isNotBached = true;
        }
      }
    }
    if (isBached && !isNotBached) {
      Swal.fire({
        title: "Payment is batched!",
        text: "",
        showCancelButton: true,
        cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        confirmButtonText: "Void from portal",
        customClass: {
          cancelButton: "btn-Issue-refund",
          confirmButton: "btn-Void-from-portal",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          //Void from portal button clicked
          this.onDeletePyament(paymentIdsArray);
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
    } else {
      //old code logic
      let title = totalrecords + " Payments selected";
      Swal.fire({
        title: title,
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
          const formData = {
            LoginUserId: this.localstoragedataService.getLoginUserId(),
            MacAddress: this.localstoragedataService.getLoginUserGuid(),
            Payments: resultArray,
          };

          this.paymentService.BulkVoidPayment(formData).subscribe((res) => {
            if (res) {
              this.analytics.bulkVoidPayment();

              res.message = res.message
                ? res.message.replaceAll("<br/>", "")
                : res.message;
              this.isloading = false;
              Swal.fire({
                title: "",
                text: res.message,
                icon: res.status == "Error" ? "error" : "success",
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Ok",
                showConfirmButton: res.status == "Error" ? true : false,
                customClass: {
                  cancelButton: "btn_ok",
                },
              }).then((result) => {
                if (result.value) {
                  this.onDeletePyament(paymentIdsArray);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  this.commonMethodService.sendPaymentTrans(true);
                }
              });
            }
          });
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
    } //end old logic
  }
  onDeletePyament(paymentIdsArray) {
    paymentIdsArray = paymentIdsArray.map((element) => {
      element = element.replace("paymentIds=", "");
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
        }).then((result) => {
          this.commonMethodService.sendPaymentTrans(true);
        });
      },
      (err) => {
        this.isloading = false;
      }
    );
  }
  onPaymentCustomReport() {
    let id_filter = this.recordSelectedArray;
    let filtered = this.gridFilterData.filter(function (item) {
      return id_filter.indexOf(item.paymentId) !== -1;
    });
    const countResult = filtered.map((x) => x.accountId);
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      CustomeReportComponent,
      this.modalOptions
    );
    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
    modalRef.componentInstance.DropDownOptions = this.dropDownCustomReport;
    modalRef.componentInstance.selectedDate = this.selectedDateRange;
  }
  AdvancePrintReceipt() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_mail advanced_print",
    };
    const modalRef = this.commonMethodService.openPopup(
      PrintReceiptPopupComponent,
      this.modalOptions
    );
    let resultArray = [];
    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
    }
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Info = { type: "Payment" };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }
  AdvanceSMSReceiptAction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_sms",
    };
    const objRes =
      this.advanceSMSActionService.getAdvanceSMSReceiptActionListObj(
        this.recordSelectedArray,
        this.gridFilterData
      );
    const modalRef = this.commonMethodService.openPopup(
      BulkSMSReceiptComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = {
      type: "Payment",
      recordSelectedArray: this.recordSelectedArray,
    };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    modalRef.componentInstance.List = objRes.list;
  }
  AdvanceEmailReceiptAction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt bulk_email_send_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkEmailReceiptComponent,
      this.modalOptions
    );
    let resultArray = [];
    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      if (donorDetails) {
        let { phoneNumbers, emailAddresses, ...restdonorDetails } =
          donorDetails;

        const newDonotRcd = {
          ...restdonorDetails,
          emails:
            emailAddresses && emailAddresses.indexOf(",") > -1
              ? emailAddresses.split(",")
              : emailAddresses
              ? [emailAddresses]
              : [],
        };

        resultArray.push(newDonotRcd);
      }
    }

    modalRef.componentInstance.Info = {
      type: "Payment",
      recordSelectedArray: this.recordSelectedArray,
    };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.List = _(resultArray)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => ({
        ..._.head(props),

        paymentIds: _.map(props, (p) => p.paymentId),
        emails: _.uniq(_.flatMap(_.map(props, (p) => p.emails))),
        email: "",
      }))
      .value();
  }
  AdvanceMailReceiptAction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_mail",
    };

    let resultArray = [];

    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      if (donorDetails) {
        resultArray.push(donorDetails);
      }
    }

    let listMailData = _(resultArray)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => {
        return {
          ..._.head(props),
          paymentIds: _.map(props, (p) => p.paymentId),
        };
      })
      .value();

    const allValidationReq = _.chunk(listMailData, 5).map((grpChunk) => {
      const grpChunkxmlsList = grpChunk.map((o) => {
        let adressStr = this.addressValidateService.validateAddress(o.address);
        let cityStateZipObj =
          this.addressValidateService.validateCityStateAndZip(o.cityStateZip);

        return this.addressValidateService.getUniqAddressXMLNode(
          o.accountId,
          adressStr,
          cityStateZipObj.city,
          cityStateZipObj.state,
          cityStateZipObj.zip
        );
      });

      const formData =
        this.addressValidateService.getAddressValidateRequestPayload(
          grpChunkxmlsList.join("")
        );

      return this.messengerService.ValidateMultipleAddress(formData);
    });

    const modalRef = this.commonMethodService.openPopup(
      BulkMailReceiptComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = { type: "Payment" };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    forkJoin(allValidationReq).subscribe((results) => {
      const validationResults = _.flatten(results);

      const withValidation = listMailData.map((o) => {
        let findResponse = validationResults.find((x) => x.ID == o.accountId);
        if (findResponse) {
          return {
            ...o,
            validation: findResponse,
          };
        } else {
          return {
            ...o,
            validation: {
              ID: o.accountId,
              isValid: false,
              message: "Invalid",
            },
          };
        }
      });
      modalRef.componentInstance.List = withValidation;
    });
  }
  AdvanceReceiptAction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_action",
    };
    const modalRef = this.commonMethodService.openPopup(
      AdvancereceiptActionPopupComponent,
      this.modalOptions
    );
    var resultArray = [];
    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
    }
    resultArray.forEach((element) => {
      if (
        element.defaultAddress != null &&
        element.defaultAddress.indexOf(",") > -1
      ) {
        element.defaultAddress = element.defaultAddress.replaceAll(",", "");
      }
    });

    modalRef.componentInstance.Info = {
      type: "Payment",
      recordSelectedArray: this.recordSelectedArray,
    };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    // address validation
    let listMailData = _(resultArray)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => {
        return {
          ..._.head(props),
          paymentIds: _.map(props, (p) => p.paymentId),
        };
      })
      .value();

    const allValidationReq = _.chunk(listMailData, 5).map((grpChunk) => {
      const grpChunkxmlsList = grpChunk.map((o) => {
        let adressStr = this.addressValidateService.validateAddress(o.address);
        let cityStateZipObj =
          this.addressValidateService.validateCityStateAndZip(o.cityStateZip);

        return this.addressValidateService.getUniqAddressXMLNode(
          o.accountId,
          adressStr,
          cityStateZipObj.city,
          cityStateZipObj.state,
          cityStateZipObj.zip
        );
      });

      const formData =
        this.addressValidateService.getAddressValidateRequestPayload(
          grpChunkxmlsList.join("")
        );

      return this.messengerService.ValidateMultipleAddress(formData);
    });
    forkJoin(allValidationReq).subscribe((results) => {
      const validationResults = _.flatten(results);

      const withValidation = listMailData.map((o) => {
        let findResponse = validationResults.find((x) => x.ID == o.accountId);
        if (findResponse) {
          return {
            ...o,
            validation: findResponse,
          };
        } else {
          return {
            ...o,
            validation: {
              ID: o.accountId,
              isValid: false,
              message: "Invalid",
            },
          };
        }
      });
      modalRef.componentInstance.List = withValidation;
    });

    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }
}
