import {
  Component,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SendEmailreceiptPopupComponent } from "src/app/pages/transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "src/app/pages/transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { SendTextreceiptPopupComponent } from "src/app/pages/transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { PdfviewerPopupComponent } from "../../payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { DonorService } from "src/app/services/donor.service";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
declare var $: any;
import { Subscription } from "rxjs";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

@Component({
  selector: "app-export-statement-popup",
  templateUrl: "./export-statement-popup.component.html",
  styleUrls: ["./export-statement-popup.component.scss"],
  standalone: false,
})
export class ExportStatementPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  modalOptions: NgbModalOptions;
  selectedDateRange: any = {
    startDate: null,
    endDate: null,
  };
  startDate: any = null;
  endDate: any = null;
  isloading: boolean = false;
  totalPaymentRecords: any = null;
  selectedDonor: any = [];
  reasonCheckBox: boolean = false;
  collectorCheckBox: boolean = false;
  locationCheckBox: boolean = false;
  campaignCheckBox: boolean = false;
  accountId: number;
  paymentIdList: any = [];
  phoneNumberList: any;
  emailList: any;
  address: string;
  cityStateZip: string;
  isOnlyPledgePayment: boolean = true;
  uiPageSettingId: any = null;
  isinitialize: number = 0;
  statementType: any;
  statementTypeList: Array<{ id: string; itemName: string }> = [
    {
      id: "",
      itemName: "",
    },
  ];
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = true;
  PageName: string = "Bulk Statement";
  isOneDate: boolean = false;
  EngHebCalPlaceholder: string = "All Time";
  class_id: string = "";
  class_hid: string = "";
  private calendarSubscription: Subscription;
  popTitle: any;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;

  @Output() emitAddressUpdated: EventEmitter<any> = new EventEmitter();

  @Input() set DonorInfo(data: any) {
    if (data) {
      this.accountId = data.accountId;
      this.selectedDonor.push(data.accountId);
      this.phoneNumberList = data.phoneNumberList;
      this.emailList = data.emailList;
      this.address = data.address;
      this.cityStateZip = data.cityStateZip;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private messengerService: MessengerService,
    private uiPageSettingService: UIPageSettingService,
    private paymentTransactionService: PaymentTransactionService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_header",
        cursor: " grab",
      });
    });
    this.commonMethodService.localReasonList =
      this.commonMethodService.orgPaymentReasonList;
    this.commonMethodService.localCampaignList =
      this.commonMethodService.orgPaymentCampaignList;
    this.commonMethodService.localLocationList =
      this.commonMethodService.orgPaymentLocationList;
    this.commonMethodService.localCollectorList =
      this.commonMethodService.orgPaymentCollectorList;
    this.clearSelection();

    if (!this.commonMethodService.statementTypeList[0].id) {
      this.commonMethodService.getStatementTemplates();
    }

    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "bulkStatmentList",
    };

    if (!this.commonMethodService.statementType) {
      this.commonMethodService.getUiPageSetting(objLayout);
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  datesUpdated(event) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.startDate;
    this.endDate = this.selectedDateRange.endDate;
    if (event.startDate == null && event.startDate == null) {
      this.selectedDateRange = undefined;
    }
  }

  onItemSelect(item: any) {
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "bulkStatmentList",
      setting: !!item ? JSON.stringify(item) : null,
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {});
  }

  clearSelection() {
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedPaymentCollectors = [];
  }

  SendTextReceipt() {
    this.isloading = false;
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
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
      .getDonorPhoneList(eventGuId, this.accountId as any)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
          const phoneData: any[] = obj.list;
          let phoneLbls = [],
            phoneNumbers = [],
            countryCodeIds = [];

          phoneData.forEach((item) => {
            phoneLbls.push(item.phoneLabel || null);
            phoneNumbers.push(item.phoneNumber || null);
            countryCodeIds.push(item.countryCodeID || null);
          });

          let rowColumn = this.commonMethodService.getNewLabelArray(
            phoneLbls,
            phoneNumbers,
            countryCodeIds
          );

          modalRef.componentInstance.ExportInfo = {
            id: this.accountId,
            type: "Statement",
            phoneList: rowColumn,
            statementSpecificFilters: objAdvancedSearch,
            fromDate:
              this.startDate != null
                ? moment(this.startDate).format("YYYY-MM-DD")
                : null,
            toDate:
              this.endDate != null
                ? moment(this.endDate).format("YYYY-MM-DD")
                : null,
            accountId: this.accountId,
            isOnlyPledgePayment: this.isOnlyPledgePayment,
            statementType: this.commonMethodService.statementType,
            hidePaymentsList: this.hidePaymentsList,
            hide0BalancePledges: this.hide0BalancePledges,
          };
        }
      });
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  SendEmailReceipt() {
    this.isloading = false;
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_emailreceipt",
    };
    console.log(this.emailList);
    const modalRef = this.commonMethodService.openPopup(
      SendEmailreceiptPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.ExportInfo = {
      id: this.accountId,
      type: "Statement",
      emailList: this.emailList,
      statementSpecificFilters: objAdvancedSearch,
      fromDate:
        this.startDate != null
          ? moment(this.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null ? moment(this.endDate).format("YYYY-MM-DD") : null,
      accountId: this.accountId,
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      statementType: this.commonMethodService.statementType,
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };
  }

  sendMailReceipt() {
    this.isloading = false;
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
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
    modalRef.componentInstance.ExportInfo = {
      id: this.accountId,
      type: "Statement",
      statementSpecificFilters: objAdvancedSearch,
      fromDate:
        this.startDate != null
          ? moment(this.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null ? moment(this.endDate).format("YYYY-MM-DD") : null,
      address: this.address,
      cityStateZip: this.cityStateZip,
      statementType: !!this.commonMethodService.statementType
        ? ""
        : this.commonMethodService.statementType[0].id,
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe((obj) => {
      this.address = obj.address;
      this.cityStateZip = obj.cityStateZip;
      this.emitAddressUpdated.emit(obj);
    });
  }

  Preview() {
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
    modalRef.componentInstance.Title = "Document print";
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };

    var objPrintReceipt = {
      type: "Statement",
      id: this.accountId,
      fromDate:
        this.startDate != null
          ? moment(this.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null ? moment(this.endDate).format("YYYY-MM-DD") : null,
      statementSpecificFilters: objAdvancedSearch,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      statementType: !this.commonMethodService.statementType
        ? ""
        : this.commonMethodService.statementType[0].id,
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };
    this.messengerService.PrintReceipt(objPrintReceipt).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.filePath = res.receiptFileUrl;
          if (res.receiptFileUrl == null || res.receiptFileUrl == "") {
            Swal.fire({
              title: "Try Again!",
              text: "No receipt found",
              icon: "error",
              confirmButtonText: "Ok",
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        } else {
          Swal.fire({
            title: "Try Again!",
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

  onDeSelectAllItems() {
    this.commonMethodService.statementType = null;
    this.onItemSelect(null);
  }

  deSelectAll() {
    this.commonMethodService.statementType = null;
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.datesUpdated(this.selectedDateRange);
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items?.pageName == this.PageName &&
          this.commonMethodService.isCalendarClicked
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.datesUpdated(this.selectedDateRange);
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }
}
