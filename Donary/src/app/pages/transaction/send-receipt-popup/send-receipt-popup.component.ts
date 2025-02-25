import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  Output,
  EventEmitter,
  OnDestroy,
  inject,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";

import { forkJoin } from "rxjs";
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { PrintSingleReceiptPopupComponent } from "../receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";

interface SelectedDonorObj {
  accountId: number;
  paymentId?: number;
  email?: string;
  phoneNumber?: string;
  address?: string;
  cityStateZip?: string;
  isPrint?: boolean;
}

declare var $: any;
@Component({
  selector: "app-send-receipt-popup",
  templateUrl: "./send-receipt-popup.component.html",
  styleUrls: ["./send-receipt-popup.component.scss"],
  standalone: false,
})
export class SendReceiptPopupComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Output() emtOutputPrint: EventEmitter<any> = new EventEmitter();
  isloading: boolean = false;

  selectedAccountList: Array<SelectedDonorObj> = [];

  isEmailSelected: boolean = false;
  isSMSSelected: boolean = false;
  isMailSelected: boolean = false;
  isPrintSelected: boolean = false;

  modalOptions: NgbModalOptions;

  allRequestSubscription: Subscription;

  otherInfo: any;
  dateRange: any;
  analytics = inject(AnalyticsService);

  @Input() set List(datalist: Array<SelectedDonorObj>) {
    if (datalist) {
      this.selectedAccountList = datalist;
      console.log(
        this.selectedAccountList,
        "this.selectedAccountList in send receipt"
      );

      this.isEmailSelected = this.getCoubtsOfEmail() !== 0 ? true : false;
      this.isSMSSelected = this.getCoubtsOfPhone() !== 0 ? true : false;
      this.isMailSelected = this.getCoubtsOfMail() !== 0 ? true : false;
      this.isPrintSelected = this.getCoubtsOfPrints() !== 0 ? true : false;
    }
  }

  @Input() set Duration(dateRange: boolean) {
    if (dateRange) {
      this.dateRange = dateRange;
    }
  }

  @Input() set Info(Info: boolean) {
    if (Info) {
      this.otherInfo = Info;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private messengerService: MessengerService,
    private localstoragedataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_content",
      });
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy(): void {
    this.cancelRequest();
  }

  closePopup() {
    if (this.isloading) {
      this.cancelRequest();
      return;
    }
    this.activeModal.dismiss();
  }

  cancelRequest() {
    if (this.allRequestSubscription) {
      this.isloading = false;
      this.allRequestSubscription.unsubscribe();
    }
  }

  getCoubtsOfDonors() {
    const donorCount = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.paymentId)
      .map((props) => ({
        ..._.head(props),
      }))
      .value();
    return donorCount.length;
  }

  getCoubtsOfEmail() {
    return this.selectedAccountList.filter((o) => !!o.email).length;
  }

  getCoubtsOfPhone() {
    return this.selectedAccountList.filter((o) => !!o.phoneNumber).length;
  }

  getCoubtsOfMail() {
    return this.selectedAccountList.filter((o) => !!o.address).length; //address
  }

  getCoubtsOfPrints() {
    return this.selectedAccountList.filter((o) => !!o.isPrint).length;
  }

  getCommonPostOObj() {
    return {
      Type: this.otherInfo.type,
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      FromDate:
        this.dateRange && this.dateRange.startDate != null
          ? this.dateRange.startDate.toISOString()
          : null,
      ToDate:
        this.dateRange && this.dateRange.endDate != null
          ? this.dateRange.endDate.toISOString()
          : null,
    };
  }

  getPostEmailObj() {
    const list = this.selectedAccountList.filter((o) => !!o.email);
    return list.map((o) => ({ Id: o.paymentId, EmailAddresses: [o.email] }));
  }

  getPostSMSObj() {
    const list = this.selectedAccountList.filter((o) => !!o.phoneNumber);
    return list.map((o) => ({
      Id: o.paymentId,
      PhoneNumbers: [o.phoneNumber],
    }));
  }

  getPostMailObj() {
    const list = this.selectedAccountList.filter((o) => !!o.address); //address
    return list.map((o) => o.paymentId);
  }

  getPostPrintObj() {
    const list = this.selectedAccountList.filter((o) => !!o.isPrint);
    return list.map((o) => o.paymentId);
  }

  sendMail() {
    this.isloading = true;

    let showPrintPopup = false;

    const allValidationReq = [];

    const postObj = this.getCommonPostOObj();

    if (this.isSMSSelected) {
      let smsformData = {
        ...postObj,
        BulkEmailReceiptIds: this.getPostSMSObj(),
      };

      let smsReq = this.messengerService.BulkSMSReceipt(smsformData);
      allValidationReq.push(smsReq);
    }

    if (this.isEmailSelected) {
      let emailformData = {
        ...postObj,
        BulkEmailReceiptIds: this.getPostEmailObj(),
      };

      let emailReq = this.messengerService.BulkEmailReceipt(emailformData);
      allValidationReq.push(emailReq);
    }

    if (this.isMailSelected) {
      let mailformData = {
        ...postObj,
        Ids: this.getPostMailObj(),
      };

      let mailReq = this.messengerService.BulkMailReceipt(mailformData);
      allValidationReq.push(mailReq);
    }

    if (this.isPrintSelected) {
      let ids = this.getPostPrintObj();
      if (ids.length > 50) {
        showPrintPopup = true;
      }
      let printFormData = {
        ...postObj,
        Ids: ids,
        ReceiverEmailAddress: this.localstoragedataService.getLoginUserEmail(),
      };

      let printReq = this.messengerService.BulkPrintReceipt(printFormData);
      allValidationReq.push(printReq);
    }

    if (this.isPrintSelected && showPrintPopup) {
      Swal.fire({
        title: "Print Receipt",
        text: `Receipts will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Process",
        confirmButtonColor: "#7b5bc4",
        cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
      }).then((result) => {
        // On Confirm
        if (result.isConfirmed) {
          this.processAllReq(allValidationReq);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.isloading = false;
        }
      });
    } else {
      this.processAllReq(allValidationReq);
    }
  }

  processAllReq(allValidationReq) {
    this.allRequestSubscription = forkJoin(allValidationReq).subscribe(
      (results: Array<any>) => {
        if (this.otherInfo.type == "Payment")
          this.analytics.bulkAdvancedPayment();
        if (this.otherInfo.type == "Pledge")
          this.analytics.bulkAdvancedPledge();

        this.isloading = false;
        let popupContainer = "";

        let receiptFileUrl: string = "";
        let contentType: string = "";

        for (let index = 0; index < results.length; index++) {
          const element = results[index];
          if (
            element &&
            !element.receiptFileUrl &&
            typeof element === "string"
          ) {
            popupContainer += `<p>${element}<p>`;
          }
          if (
            element &&
            element.receiptFileUrl &&
            typeof element !== "string"
          ) {
            receiptFileUrl = element.receiptFileUrl || "";
            contentType = element.contentType || "";
          }
        }

        if (popupContainer) {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SUCCESS_TITLE"
            ),
            html: popupContainer,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              this.cancelRequest();
              this.closePopup();
              this.emtOutputPrint.emit(true);
            }
            this.open(receiptFileUrl, contentType);
          });
        } else {
          this.open(receiptFileUrl, contentType);
        }
      },
      (err) => {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: "Try Again",
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

  stopProccessing() {
    this.isloading = false;
  }

  open(receiptFileUrl, contentType) {
    if (receiptFileUrl) {
      this.emtOutputPrint.emit(true);
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
        filename: receiptFileUrl,
        filetype: contentType,
      };
    }
  }
}
