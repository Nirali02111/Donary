import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  inject,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  ModalDismissReasons,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { forkJoin } from "rxjs";
import { PrintReceiptPopupComponent } from "../../transaction/receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import * as _ from "lodash";
import { log } from "console";
import { AnalyticsService } from "src/app/services/analytics.service";
interface SelectedDonorObj {
  accountId: number;
  paymentId?: number;
  email?: string;
  phoneNumber?: string;
  addressId?: string;
  address?: string;
  cityStateZip?: string;
  isPrint?: boolean;
  labelName?: string;
}
declare var $: any;
@Component({
  selector: "app-send-receipt-popup",
  templateUrl: "./send-receipt-popup.component.html",
  standalone: false,
  styleUrls: ["./send-receipt-popup.component.scss"],
})
export class SendReceiptPopupComponent implements OnInit {
  @Output() emtOutputPrint: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputCancel: EventEmitter<any> = new EventEmitter();

  isloading: boolean = false;

  selectedAccountList: Array<SelectedDonorObj> = [];

  isEmailSelected: boolean = false;
  isSMSSelected: boolean = false;
  isMailSelected: boolean = false;
  isPrintSelected: boolean = false;

  modalOptions: NgbModalOptions;

  otherInfo: any;
  dateRange: any;
  isOnlyPledgePayment = false;
  statementType: any;
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = false;
  statementSpecificFilters: any;
  analytics = inject(AnalyticsService);

  @Input() set List(datalist: Array<SelectedDonorObj>) {
    if (datalist) {
      this.selectedAccountList = datalist;
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
  @Input() set OnlyPledgePayment(isOnlyPledgePayment: boolean) {
    if (isOnlyPledgePayment) {
      this.isOnlyPledgePayment = isOnlyPledgePayment;
    }
  }
  @Input() set statementTypeV(statementType: any) {
    if (statementType) {
      this.statementType = statementType;
    }
  }
  @Input() set PaymentAndBalancePledges(item: any) {
    if (item) {
      this.hidePaymentsList = item.hidePaymentsList;
      this.hide0BalancePledges = item.hide0BalancePledges;
    }
  }
  @Input() set objAdvancedSearch(item: any) {
    if (item) {
      this.statementSpecificFilters = item;
    }
  }
  @Input() donorCount: number;
  constructor(
    private cdr: ChangeDetectorRef,
    public activeModal: NgbModal,
    public activeModal1: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private messengerService: MessengerService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService
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

  closePopup() {
    this.activeModal1.dismiss();
    this.emtOutputCancel.emit(true);
  }

  onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  getCoubtsOfDonors() {
    return this.donorCount;
  }

  getCoubtsOfEmail() {
    return this.selectedAccountList.filter((o) => !!o.email).length;
  }

  getCoubtsOfPhone() {
    return this.selectedAccountList.filter((o) => !!o.phoneNumber).length;
  }

  getCoubtsOfMail() {
    return this.selectedAccountList.filter((o) => !!o.address).length;
  }

  getCoubtsOfPrints() {
    return this.selectedAccountList.filter((o) => !!o.isPrint).length;
  }

  getCommonPostOObj() {
    return {
      Type: this.otherInfo.type,
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      FromDate:
        this.dateRange &&
        this.dateRange.startDate &&
        this.dateRange.startDate != null
          ? this.dateRange.startDate.toISOString()
          : null,
      ToDate:
        this.dateRange &&
        this.dateRange.endDate &&
        this.dateRange.endDate != null
          ? this.dateRange.endDate.toISOString()
          : null,
      statementType:
        this.statementType === undefined || this.statementType === null
          ? ""
          : this.statementType[0].id,
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
      statementSpecificFilters: this.statementSpecificFilters,
    };
  }

  getPostEmailObj() {
    const list = this.selectedAccountList.filter((o) => !!o.email);
    return list.map((o) => ({ Id: o.accountId, EmailAddresses: [o.email] }));
  }

  getPostSMSObj() {
    const list = this.selectedAccountList.filter((o) => !!o.phoneNumber);
    return list.map((o) => ({
      Id: o.accountId,
      PhoneNumbers: [o.phoneNumber],
    }));
  }

  getPostMailObj() {
    const list = this.selectedAccountList.filter((o) => !!o.address);
    return list.map((o) => o.accountId);
  }

  getPostPrintObj() {
    const list = this.selectedAccountList.filter((o) => !!o.isPrint);
    return list.map((o) => o.accountId);
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
        IsOnlyPledgePayment: this.isOnlyPledgePayment,
        receiptAddresses: this.getPostMailReceiptAddressesObj(),
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
        Type: "Statement",
        Ids: ids,
        ReceiverEmailAddress: this.localstoragedataService.getLoginUserEmail(),
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        statementType:
          this.statementType === undefined || this.statementType === null
            ? ""
            : this.statementType[0].id,
        isOnlyPledgePayment: this.isOnlyPledgePayment,
        hidePaymentsList: this.hidePaymentsList,
        hide0BalancePledges: this.hide0BalancePledges,
        statementSpecificFilters: this.statementSpecificFilters,
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
    forkJoin(allValidationReq).subscribe(
      (results: Array<any>) => {
        this.analytics.bulkStatementAdvancedDonor();

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
            popupContainer += `${element}`;
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
            text: popupContainer,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            // this.open(receiptFileUrl, contentType)
            if (receiptFileUrl == "" && contentType == "") {
              this.activeModal.dismissAll();
            }
          });
        } else {
          // this.open(receiptFileUrl, contentType)
        }
        if (receiptFileUrl) {
          this.openPrint(receiptFileUrl, contentType);
        }
        this.emtOutputPrint.emit(true);
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
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup print_receipt",
      };

      const modalRef = this.commonMethodService.openPopup(
        PrintReceiptPopupComponent,
        this.modalOptions
      );

      modalRef.componentInstance.fileDetails = {
        filename: receiptFileUrl,
        filetype: contentType,
      };
    }
  }
  openPrint(receiptFileUrl, contentType) {
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
  getPostMailReceiptAddressesObj() {
    let receiptAddresses = [];
    for (let index = 0; index < this.selectedAccountList.length; index++) {
      const element = this.selectedAccountList[index];
      let addressArr = element.address && element.address.split(",");
      if (addressArr) {
        let mailAddresses = [];
        let isLen = addressArr.length == 7;
        mailAddresses.push({
          addressId: element.addressId,
          accountId: element.accountId,
          houseNum: addressArr[0],
          street: addressArr[1],
          unit: isLen ? addressArr[2] : "",
          city: isLen ? addressArr[3] : addressArr[2],
          state: isLen ? addressArr[4] : addressArr[3],
          zip: isLen ? addressArr[5] : addressArr[4],
          country: isLen ? addressArr[6] : addressArr[5],
          addressLabel: element.labelName,
        });
        let obj = { id: element.accountId, mailAddresses: mailAddresses };
        receiptAddresses.push(obj);
      }
    }

    return receiptAddresses;
  }
}
