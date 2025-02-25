import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { MessengerService } from "src/app/services/messenger.service";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { PaymentService } from "src/app/services/payment.service";
import { ReasonService } from "src/app/services/reason.service";
import { AddressValidateService } from "src/app/services/address-validate.service";

import { CampaignService } from "./../../../services/campaign.service";
import { CampaignCardDataResponse } from "./../../../models/campaign-model";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as _ from "lodash";
import { DeviceCardPopupComponent } from "../../cards/device-card-popup/device-card-popup.component";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";
import { EditPaymentPopupComponent } from "../../cards/payment-card-popup/edit-payment-popup/edit-payment-popup.component";
import { ReasonCardPopupComponent } from "../../cards/reason-card-popup/reason-card-popup.component";
import { SchedulePaymentCardPopupComponent } from "../../cards/schedule-card-popup/schedule-paymentcard-popup.component";
import { AdvancereceiptActionPopupComponent } from "../advancereceipt-action-popup/advancereceipt-action-popup.component";
import { EditTransactionInfoComponent } from "../edit-transaction-info/edit-transaction-info.component";
import { EmailMissingPopupComponent } from "../email-missing-popup/email-missing-popup.component";
import { PrintReceiptPopupComponent } from "../receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { SendEmailreceiptPopupComponent } from "../receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendTextreceiptPopupComponent } from "../receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { BulkEmailReceiptComponent } from "../receipt-actions/bulk-email-receipt/bulk-email-receipt.component";
import { BulkSMSReceiptComponent } from "../receipt-actions/bulk-smsreceipt/bulk-smsreceipt.component";
import { BulkMailReceiptComponent } from "../receipt-actions/bulk-mail-receipt/bulk-mail-receipt.component";
import { SendReceiptPopupComponent } from "../send-receipt-popup/send-receipt-popup.component";
import { SupportPopupComponent } from "../support-popup/support-popup.component";
import { TransactionAdvancedFilterPopupComponent } from "../transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { CollectorCardPopupComponent } from "./../../cards/collector-card-popup/collector-card-popup.component";
import { CampaignCardPopupComponent } from "./../../cards/campaign-card-popup/campaign-card-popup.component";
import { PaymentCardPopupComponent } from "./../../cards/payment-card-popup/payment-card-popup.component";
import { ImportPaymentComponent } from "./import-payment/import-payment.component";
import { PaymentTransGridFilterPopupComponent } from "./payment-trans-grid-filter-popup/payment-trans-grid-filter-popup/payment-trans-grid-filter-popup.component";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { SendMailreceiptPopupComponent } from "../receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { LocationService } from "src/app/services/location.sevice";
import { AdvanceSMSActionService } from "src/app/services/helpers/advance-smsaction.service";

import { forkJoin } from 'rxjs';
import { Router } from "@angular/router";
import { DeviceService } from "src/app/services/device.service";
import { BatchService } from "src/app/services/batch.service";
import { CustomeReportComponent } from "../custome-report/custome-report.component";
import { BulkStatementPopupComponent } from "../bulk-statement-popup/bulk-statement-popup.component";
import { PrintSingleReceiptPopupComponent } from "../receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { CalenderModalComponent } from "./calender-modal/calender-modal.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { ReminderPopupComponent } from "../../notifications/reminder-popup/reminder-popup.component";
import { BulkSelectPopupComponent } from "../bulk-select-popup/bulk-select-popup.component";
pdfMake.vfs = pdfFonts.pdfMake.vfs;


import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PageSyncService } from "src/app/commons/pagesync.service";
import { Observable, Subscription } from "rxjs";
import { LegalReceiptPopupComponent } from "../../make-transaction/legal-receipt-popup/legal-receipt-popup.component";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import { environment } from "src/environments/environment";
import { LegalReceiptCountryPopupComponent } from "../../make-transaction/legal-receipt-country-popup/legal-receipt-country-popup.component";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";


interface ColFieldObj {
  id: number,
  title?: string,
  class?: string,
  isTotalPanel: boolean,
  items: Array<{
    colId: string,
    colName: string,
    isVisible: boolean,
    sortName: string,
    disabled: boolean,
    isAdvancedField: boolean
  }>,
}


declare var $: any;
@Component({
  selector: "app-payment-transaction",
  templateUrl: "./payment-transaction.component.html",
  styleUrls: ["./payment-transaction.component.scss"],
  standalone: false,
  providers: [DonaryDateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentTransactionComponent implements OnInit {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  objAdvancedSearch: any = {
    AdvancedFields: [],
    donors: [],
    paymentTypes: [],
    minAmount: null,
    maxAmount: null,
    paymentReason: [],
    collectors: [],
    locations: [],
    campaigns: [],
    paymentDevices: [],
    deviceTypes: [],
    orderDeviceStatus: [],
    approvals: [],
    scheduleRepeatType: [],
    paymentStatus: [
      { id: 1, itemName: "Success" },
      { id: 9, itemName: "Pending" },
      { id: 10, itemName: "Deposited" },
    ],
    pledgeStatus: [],
    scheduleStatus: [],
    fullName: null,
    batchNum: null,
    city: null,
    state: null,
    zip: null,
    cityStateZip: [],
    cities: [],
    zips: [],
    street: null,
    defaultLocation: [],
    group: null,
    class: null,
    note: null,
    phone: null,
    email: null,
    minBalanceAmount: null,
    maxBalanceAmount: null,
    isScheduleRepeatTypeFilterVisible: false,
    isBatchClicked: false,
    createdDateRange: null,
    currencies: [],
  };
  isloading: boolean = true;
  isloadingModel: boolean;
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(6, "days"),
    endDate: moment(new Date()),
  };


  EngHebCalPlaceholder: string = "Last 7 Days";
  presetClickId: string;
  id: string = 'id_Last7days';
  hid: string = 'id_Last7days_h'
  popTitle: any;
  selectedWeekSearchFilter: string;
  selectedDueDate: any;
  cardType: any = [{ id: 2, itemName: "Reason" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  modalOptions: NgbModalOptions;
  gridData: Array<any>;
  otherGridData: Array<any>
  nocampaignWithSplitData: Array<any>;
  noReasonWithSplitData: Array<any>;
  gridFilterData: Array<any>;
  printData: Array<any> = [];
  printHeader = [];
  paymentTypeChipData: Array<any> = [];
  paymentTypeChipClassName: string = "info-box bg-gradient-info";
  selectedChipType: any;
  totalRecord: number = 0;
  PageName: any = "PaymentTransPage";
  isOneDate: any = false;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  isinitialize: number = 0;
  campaignlist: Array<any> = [];
  reasonlist: Array<any> = [];
  finalreminder: number;

  isPaymentReceiptNoColVisible: boolean = true;
  isPaymentDateTimeColVisible: boolean = true;
  isPaymentAmountColVisible: boolean = true;
  isPaymentTypeColVisible: boolean = true;
  isPaymentRefNoColVisible: boolean = true;
  isPaymentApprovalColVisible: boolean = false;
  isPaymentAddtnlAmountColVisible: boolean = false;
  isPaymentAccountNoColVisible: boolean = false;
  isPaymentFullNameColVisible: boolean = false;
  isPaymentFullNameJewishColVisible: boolean = true;
  isPaymentCreatedDateColVisible: boolean = false;
  isPaymentCollectorColVisible: boolean = true;
  isPaymentCampaignColVisible: boolean = false;
  isPaymentStatusColVisible: boolean = true;
  isPaymentReasonColVisible: boolean = false;
  isPaymentReasonNumColVisible: boolean = false;
  isPaymentDeviceColVisible: boolean = true;
  isPaymentLocationColVisible: boolean = true;
  isPaymentNoteColVisible: boolean = false;
  isPaymentPhoneNumberColVisible: boolean = false;
  isPaymentScheduleNoColVisible: boolean = true;
  isPaymentCardHolderColVisible: boolean = true;
  isPaymentScheduleInfoColVisible: boolean = false;
  isPaymentAddressColVisible: boolean = false;
  isPaymentCityStateZipColVisible: boolean = false;
  isPaymentEmailColVisible: boolean = false;
  isPaymentGroupColVisible: boolean = false;
  isPaymentClassColVisible: boolean = false;
  isPaymentFatherColVisible: boolean = false;
  isPaymentFatherInLawColVisible: boolean = false;
  isPaymentBatchNumColVisible: boolean = false;
  isPaymentJewishDateColVisible: boolean = false; ///added
  isPaymentEnglishTitleColVisible: boolean = false;
  isPaymentFirstNameColVisible: boolean = false;
  isPaymentLastNameColVisible: boolean = false;
  isPaymentTitleJewishColVisible: boolean = false;
  isPaymentFirstNameJewishColVisible: boolean = false;
  isPaymentLastNameJewishColVisible: boolean = false;
  isPaymentSuffixJewishColVisible: boolean = false;
  isPledgePaymentColVisible: boolean = false;
  isCurrencyAmountColVisible: boolean = false;
  isCurrencyTypeColVisible: boolean = false;
  isTagsColVisible: boolean = false;
  isGateWayBatchColVisible: boolean = false;
  isLegalRecieptColVisible: boolean = false;
  paymentMode: boolean = true;
  isSelectPopupShow: boolean = false;
  displayThisPageArray: any = [];
  isBulkCheckbox: boolean = false;
  isRetryClicked: boolean = false;
  fileName: string = "";
  colFields: Array<ColFieldObj> = [
    {
      id: 1,
      isTotalPanel: true,
      items: [
        {
          colId: "receiptNum",
          colName: "RECEIPT#",
          isVisible: true,
          sortName: "receiptNum",
          disabled: true,
          isAdvancedField: false,
        },
        {
          colId: "paymentDateTime",
          colName: "PAYMENTDATE",
          isVisible: true,
          sortName: "paymentDateTime",
          disabled: true,
          isAdvancedField: false,
        },
        {
          colId: "fullNameJewish",
          colName: "DONORJEWISHNAME",
          isVisible: true,
          sortName: "fullNameJewish",
          disabled: true,
          isAdvancedField: false,
        },
        {
          colId: "createdDate",
          colName: "CREATEDDATETIME",
          isVisible: false,
          sortName: "createdDate",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "amount",
          colName: "AMOUNT",
          isVisible: true,
          sortName: "currencyAmount",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "paymentType",
          colName: "PAYMENTTYPE",
          isVisible: true,
          sortName: "paymentType",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "legalReceipt",
          colName: "LEGALRECEIPT",
          isVisible: false,
          sortName: "legalReceipt",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "paymentJewishDate",
          colName: "HEBREWDATE",
          isVisible: false,
          sortName: "paymentJewishDate",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "approval",
          colName: "APPROVAL",
          isVisible: false,
          sortName: "approval",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "refNum",
          colName: "REF#",
          isVisible: true,
          sortName: "refNum",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "paymentStatus",
          colName: "STATUS",
          isVisible: true,
          sortName: "paymentStatus",
          disabled: false,
          isAdvancedField: false,
        },


        {
          colId: "scheduleNum",
          colName: "SCHEDULE#",
          isVisible: true,
          sortName: "scheduleNum",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "scheduleInfo",
          colName: "SCHEDULEINFO",
          isVisible: false,
          sortName: "scheduleInfo",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "cardHolderName",
          colName: "CARDHOLDERNAME",
          isVisible: true,
          sortName: "cardHolderName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "note",
          colName: "NOTE",
          isVisible: false,
          sortName: "note",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "campaignName",
          colName: "CAMPAIGN",
          isVisible: false,
          sortName: "campaignName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "reasonName",
          colName: "REASON",
          isVisible: false,
          sortName: "reasonName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "reasonNum",
          colName: "REASON#",
          isVisible: false,
          sortName: "reasonNum",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "locationName",
          colName: "LOCATION",
          isVisible: true,
          sortName: "locationName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "colectorName",
          colName: "COLLECTOR",
          isVisible: true,
          sortName: "colectorName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "device",
          colName: "SOURCE",
          isVisible: true,
          sortName: "device",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "accountNum",
          colName: "ACCOUNT#",
          isVisible: false,
          sortName: "accountNum",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "fullName",
          colName: "DONORENGLISHNAME",
          isVisible: false,
          sortName: "fullName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "address",
          colName: "ADDRESS",
          isVisible: false,
          sortName: "address",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "cityStateZip",
          colName: "CITYSTATEZIP",
          isVisible: false,
          sortName: "cityStateZip",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "phoneNumbers",
          colName: "PHONENUMBER",
          isVisible: false,
          sortName: "phoneNumbers",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "emailLabels",
          colName: "EMAIL",
          isVisible: false,
          sortName: "emailLabels",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "batchNum",
          colName: "BATCH#",
          isVisible: false,
          sortName: "batchNum",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "group",
          colName: "GROUP",
          isVisible: false,
          sortName: "group",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "class",
          colName: "CLASS",
          isVisible: false,
          sortName: "class",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "father",
          colName: "FATHER",
          isVisible: false,
          sortName: "father",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "fatherInLaw",
          colName: "FATHERINLAW",
          isVisible: false,
          sortName: "fatherInLaw",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "title",
          colName: "ENGLISHTITLE",
          isVisible: false,
          sortName: "title",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "firstName",
          colName: "ENGLISHFIRSTNAME",
          isVisible: false,
          sortName: "firstName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "lastName",
          colName: "ENGLISHLASTNAME",
          isVisible: false,
          sortName: "lastName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "titleJewish",
          colName: "YIDDISHFIRSTTITLE",
          isVisible: false,
          sortName: "titleJewish",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "firstNameJewish",
          colName: "YIDDISHFIRSTNAME",
          isVisible: false,
          sortName: "firstNameJewish",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "lastNameJewish",
          colName: "YIDDISHLASTNAME",
          isVisible: false,
          sortName: "lastNameJewish",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "suffixJewish",
          colName: "YIDDISHLASTTITLE",
          isVisible: false,
          sortName: "suffixJewish",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "pledgePayment",
          colName: "AMOUNTAPPLIED",
          isVisible: false,
          sortName: "pledgePayment",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "currencyAmount",
          colName: "CONVERTEDAMOUNT",
          isVisible: false,
          sortName: "amount",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "currencyName",
          colName: "CURRENCYTYPE",
          isVisible: false,
          sortName: "currencyName",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "TagId",
          colName: "TAGS",
          isVisible: false,
          sortName: "tagNames",
          disabled: false,
          isAdvancedField: false,
        },
        {
          colId: "gatewayBatchNum",
          colName: "GATEWAYBATCH#",
          isVisible: false,
          sortName: "gatewayBatchNum",
          disabled: false,
          isAdvancedField: false,
        },
      ],
    },
    {
      id: 2,
      title: "ADVANCEDFIELDS",
      class: "total_pnl_lbl",
      isTotalPanel: true,
      items: [],
    },
  ];

  filtercount: number = 1;
  cardFilter = [];
  sortFilter = [];
  recordSelectedArray = [];
  retrySelectedArray = [];
  isSelected = false;
  isRetrySelected = false;

  sumByCampaignPayments = [];
  sumByCollectorPayments = [];
  sumByReasonPayments = [];
  sumByLocationPayments = [];
  sumByPaymentTypePayments = [];
  sumByPaymentStatusPayments = [];
  sumBySourcePayments = [];
  sumByWeekPayments = [];
  sumByMonthPayments = [];
  sumByYearPayments = [];
  sumByCurrencyPayments = [];

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };
  paymentsSelectedCount: number = 0;
  paymentsSelectedAmount: number = 0;
  paymentActionVisible: boolean = false;
  uiPageSettingId = null;
  uiPageSetting: any;
  isPaymentTypeCheck: boolean = false;
  presetOption: string;
  paymentId: number;
  displayThisPageCount = 0;
  @Input("selectedDateRange") emtOutputDateRange?: any;
  @Input("paymentMode") emtOutputradioVal?: any;


  isMobile: Observable<BreakpointState>;
  isOpen: boolean = false;
  private calendarSubscription: Subscription;
  legalReceiptNum: any;
  valueFromPopup: boolean = false;
  isdownloadExcelGuid: boolean = false;
  isLegalReceiptNumPresent: boolean;
  TransColName: boolean = false;
  colfieldsValue: any;
  isDevEnv: boolean = false;
  paymentTransSubscription: Subscription;
  isCashCreditPaymentType: boolean = false;
  isdateChanged: boolean = false;
  isEventBatchEdit: boolean = false;
  private analytics = inject(AnalyticsService);


  constructor(
    public pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private cardService: CardService,
    private collectorService: CollectorService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private paymentService: PaymentService,
    private addressValidateService: AddressValidateService,
    private paymentTransactionService: PaymentTransactionService,
    private localstoragedataService: LocalstoragedataService,
    private datePipe: DonaryDateFormatPipe,
    private locationService: LocationService,
    private messengerService: MessengerService,
    private router: Router,
    private deviceService: DeviceService,
    private advanceSMSActionService: AdvanceSMSActionService,
    private batchService: BatchService,
    private advancedFieldService: AdvancedFieldService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private cdr: ChangeDetectorRef,
    public breakpointObserver: BreakpointObserver,
    public paymentApiGatewayService: PaymentApiGatewayService,
    private xlsxService: XLSXService
  ) {

    // this.isMobile = this.breakpointObserver.observe(['(max-width: 767px)']);

  }

  initMultiSelect() {
    this.cardFilter = [
      {
        id: 2,
        itemName: "Reason",
        counts: this.multiSelectCount(
          this.sumByReasonPayments.filter(
            (x) => x.paymentType != "" && x.paymentType != null
          ).length
        ),
      },
      {
        id: 1,
        itemName: "Campaign",
        counts: this.multiSelectCount(
          this.sumByCampaignPayments.filter(
            (x) => x.paymentType != "" && x.paymentType != null
          ).length
        ),
      },
      {
        id: 3,
        itemName: "Location",
        counts: this.multiSelectCount(this.sumByLocationPayments.length),
      },
      {
        id: 5,
        itemName: "Collector",
        counts: this.multiSelectCount(
          this.sumByCollectorPayments.filter(
            (x) => x.paymentType != "" && x.paymentType != null
          ).length
        ),
      },
      {
        id: 8,
        itemName: "Source",
        counts: this.multiSelectCount(this.sumBySourcePayments.length),
      },
      {
        id: 7,
        itemName: "Payment Type",
        counts: this.multiSelectCount(this.sumByPaymentTypePayments.length),
      },
      {
        id: 6,
        itemName: "Payment Status",
        counts: this.multiSelectCount(this.sumByPaymentStatusPayments.length),
      },

      {
        id: 9,
        itemName: "Week",
        counts: this.multiSelectCount(this.sumByWeekPayments.length),
      },
      {
        id: 10,
        itemName: "Month",
        counts: this.multiSelectCount(this.sumByMonthPayments.length),
      },
      {
        id: 11,
        itemName: "Year",
        counts: this.multiSelectCount(this.sumByYearPayments.length),
      },
      {
        id: 12,
        itemName: "Currency",
        counts: this.multiSelectCount(this.sumByCurrencyPayments.length),
      },
    ];
  }

  formatAmount(value, currency) {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency != null ? currency : "USD",
    }).format(value); ''
  }
  // Remove count for All card
  multiSelectCount(length) {
    let count = length - 1;
    return count > 0 ? count : 0;
  }
  ngOnInit() {
    this.analytics.visitedPayment();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    if (!this.isDevEnv) {
      this.colFields[0].items = this.colFields[0].items.filter(item => !(item.colName === "LEGALRECEIPT"));
    }
    this.colfieldsValue = this.pageSyncService.paymentFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value
    })
    if (this.pageSyncService.sumbyPayment) {
      this.cardType = this.pageSyncService.sumbyPayment;
    }
    this.getAllPaymentAPIGateway();
    this.getFeatureSettingValues()
    this.commonMethodService.getEngHebJsonData();
    this.isMobile = this.breakpointObserver.observe(['(max-width: 767px)']);
    this.cdr.detectChanges();
    this.pageSyncService.calculateTimeDifference("payment");
    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    $("body").addClass("sticky_table_list");

    this.paymentTransSubscription = this.commonMethodService.getPaymentTrans().subscribe((res: any) => {
      if (res) {
        this.searchPaymentTransactionsData();
        this.commonMethodService.PaymentTransObservable.next(false);
      }
    });
    if (!this.pageSyncService.paymentFlag || (!this.pageSyncService.isPaymentTabClicked && this.pageSyncService.paymentTransList == undefined)) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "transactions",
        screenName: "payments",
      };
      this.isloading = true;
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isPaymentReceiptNoColVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);
            if (this.uiPageSetting.advancedFields && this.uiPageSetting.advancedFields.items.length > 0) {
              this.colFields[1] = this.uiPageSetting.advancedFields
            }

            this.getRedirectData();

            this.colFields.forEach(element => {
              if (element.id == 1) {
                element.items.forEach(item => {
                  let colVisible = this.checkVisibility(item.colName)
                  if (item.isVisible != colVisible) {
                    let columnVisibility = { [item.colName]: colVisible }
                    this.colfieldsValue.push(columnVisibility)
                  }
                  item.isVisible = this.checkVisibility(item.colName);
                });
              }
            });

          }
          this.getAFVColumns(true);
          if (!this.pageSyncService.paymentFlag || this.pageSyncService.paymentTransList == undefined) {
            this.searchPaymentTransactionsData();
          }
          else {
            this.gridData = this.pageSyncService.paymentTransList;
            this.resGridDataModification();
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
          }
        } else {
          if (this.pageSyncService.paymentTransList == undefined) {
            this.getRedirectData()
            this.searchPaymentTransactionsData();
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    }

    else {
      if (this.pageSyncService.uiPageSettings['paymentList']) {
        this.uiPageSetting = this.pageSyncService?.uiPageSettings?.['paymentList'];
        this.setUIPageSettings(this.uiPageSetting);
      }

      this.getRedirectData()
      this.gridData = this.pageSyncService.paymentTransList;
      this.resGridDataModification();
      this.isloading = false;
      this.changeDetectorRef.detectChanges();
    }
    if (this.pageSyncService.paymentFilterData) {
      this.advancedSearchData(this.pageSyncService.paymentFilterData)
    }
    if (this.pageSyncService.paymentCalDate) {
      if (
        this.pageSyncService.paymentCalDate.startDate == null &&
        this.pageSyncService.paymentCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      } else {
        this.pageSyncService.paymentCalDate.startDate = moment(this.pageSyncService.paymentCalDate.startDate).format("YYYY-MM-DD");
        this.pageSyncService.paymentCalDate.endDate = moment(this.pageSyncService.paymentCalDate.endDate).format("YYYY-MM-DD");
        this.getSelectedDateRange(this.pageSyncService.paymentCalDate.startDate, this.pageSyncService.paymentCalDate.endDate);
      }
    }

    if (this.localstoragedataService.getLoginUserEventGuId() == "1acca970-da93-463f-896d-519db76f0b49") {
      this.isEventBatchEdit = true;
    }
  }

  setUIPageSettings(uiPageSetting) {
    this.isPaymentReceiptNoColVisible =
      this.uiPageSetting.isPaymentReceiptNoColVisible;
    this.isPaymentDateTimeColVisible =
      this.uiPageSetting.isPaymentDateTimeColVisible;
    this.isPaymentAmountColVisible =
      this.uiPageSetting.isPaymentAmountColVisible;
    this.isPaymentTypeColVisible =
      this.uiPageSetting.isPaymentTypeColVisible;
    this.isPaymentRefNoColVisible =
      this.uiPageSetting.isPaymentRefNoColVisible;
    this.isPaymentApprovalColVisible =
      this.uiPageSetting.isPaymentApprovalColVisible;
    this.isPaymentAddtnlAmountColVisible =
      this.uiPageSetting.isPaymentAddtnlAmountColVisible;
    this.isPaymentAccountNoColVisible =
      this.uiPageSetting.isPaymentAccountNoColVisible;
    this.isPaymentFullNameColVisible =
      this.uiPageSetting.isPaymentFullNameColVisible;
    this.isPaymentFullNameJewishColVisible =
      this.uiPageSetting.isPaymentFullNameJewishColVisible;
    this.isPaymentCreatedDateColVisible =
      this.uiPageSetting.isPaymentCreatedDateColVisible;
    this.isPaymentCollectorColVisible =
      this.uiPageSetting.isPaymentCollectorColVisible;
    this.isPaymentCampaignColVisible =
      this.uiPageSetting.isPaymentCampaignColVisible;
    this.isPaymentStatusColVisible =
      this.uiPageSetting.isPaymentStatusColVisible;
    this.isPaymentReasonColVisible =
      this.uiPageSetting.isPaymentReasonColVisible;
    this.isPaymentReasonNumColVisible =
      this.uiPageSetting.isPaymentReasonNumColVisible;
    this.isPaymentDeviceColVisible =
      this.uiPageSetting.isPaymentDeviceColVisible;
    this.isPaymentLocationColVisible =
      this.uiPageSetting.isPaymentLocationColVisible;
    this.isPaymentNoteColVisible =
      this.uiPageSetting.isPaymentNoteColVisible;
    this.isPaymentPhoneNumberColVisible =
      this.uiPageSetting.isPaymentPhoneNumberColVisible;
    this.isPaymentScheduleNoColVisible =
      this.uiPageSetting.isPaymentScheduleNoColVisible;
    this.isPaymentCardHolderColVisible =
      this.uiPageSetting.isPaymentCardHolderColVisible;
    this.isPaymentScheduleInfoColVisible =
      this.uiPageSetting.isPaymentScheduleInfoColVisible;
    this.isPaymentAddressColVisible =
      this.uiPageSetting.isPaymentAddressColVisible;
    this.isPaymentCityStateZipColVisible =
      this.uiPageSetting.isPaymentCityStateZipColVisible;
    this.isPaymentEmailColVisible =
      this.uiPageSetting.isPaymentEmailColVisible;
    this.isPaymentGroupColVisible =
      this.uiPageSetting.isPaymentGroupColVisible;
    this.isPaymentClassColVisible =
      this.uiPageSetting.isPaymentClassColVisible;
    this.isPaymentFatherColVisible =
      this.uiPageSetting.isPaymentFatherColVisible;
    this.isPaymentFatherInLawColVisible =
      this.uiPageSetting.isPaymentFatherInLawColVisible;
    this.isPaymentBatchNumColVisible =
      this.uiPageSetting.isPaymentBatchNumColVisible;
    this.isPaymentJewishDateColVisible =
      this.uiPageSetting.isPaymentJewishDateColVisible; ///added
    this.isPaymentEnglishTitleColVisible =
      this.uiPageSetting.isPaymentEnglishTitleColVisible;
    this.isPaymentFirstNameColVisible =
      this.uiPageSetting.isPaymentFirstNameColVisible;
    this.isPaymentLastNameColVisible =
      this.uiPageSetting.isPaymentLastNameColVisible;
    this.isPaymentTitleJewishColVisible =
      this.uiPageSetting.isPaymentTitleJewishColVisible;
    this.isPaymentFirstNameJewishColVisible =
      this.uiPageSetting.isPaymentFirstNameJewishColVisible;
    this.isPaymentLastNameJewishColVisible =
      this.uiPageSetting.isPaymentLastNameJewishColVisible;
    this.isPaymentSuffixJewishColVisible =
      this.uiPageSetting.isPaymentSuffixJewishColVisible;
    this.isPledgePaymentColVisible =
      this.uiPageSetting.isPledgePaymentColVisible;
    this.isCurrencyAmountColVisible =
      this.uiPageSetting.isCurrencyAmountColVisible;
    this.isCurrencyTypeColVisible =
      this.uiPageSetting.isCurrencyTypeColVisible;
    this.isTagsColVisible = this.uiPageSetting.isTagsColVisible;
    this.isGateWayBatchColVisible = this.uiPageSetting.isGateWayBatchColVisible;
    this.isLegalRecieptColVisible = this.uiPageSetting.isLegalRecieptColVisible;
    this.cardType = this.uiPageSetting.sumBy;
    this.objAdvancedSearch = this.uiPageSetting.searchitem;
    const paymentFilterArray = [this.uiPageSetting.searchitem];
    if (!this.pageSyncService.paymentFilterData) {
      this.pageSyncService.paymentFilterData = paymentFilterArray[0];
    }
    this.EngHebCalPlaceholder = this.pageSyncService.PaymentEngCalPlaceholder || uiPageSetting.EngHebCalPlaceholder || this.EngHebCalPlaceholder;
    this.pageSyncService.PaymentEngCalPlaceholder = this.EngHebCalPlaceholder;

    if (uiPageSetting?.paymentCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id = uiPageSetting?.paymentCalendarPlaceHolderId;

    if (
      this.uiPageSetting.startDate == null &&
      this.uiPageSetting.endDate == null
    ) {
      this.selectedDateRange.startDate = null;
      this.selectedDateRange.endDate = null;
      this.EngHebCalPlaceholder = "All Time";
    }
    else
      this.getSelectedDateRange(this.uiPageSetting.startDate, this.uiPageSetting.endDate);

    this.pageSyncService.uiPageSettings['paymentList'] = uiPageSetting;

  }

  getAllPaymentAPIGateway() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentApiGatewayService.getAllPaymentAPIGateway(eventGuId).subscribe((res: any) => {
      res.forEach(item => {
        if (!(item.countryCodeId == 1 || item.countryCodeId == null)) {
          this.TransColName = true;
          this.changeDetectorRef.detectChanges();
        }

      });
      if (this.TransColName == false) {
        this.colFields[0].items = this.colFields[0].items.filter(item => !(item.colName === "LEGALRECEIPT"));
        this.isLegalRecieptColVisible = false
      }

    })
  }
  detectChanges() {
    if (!this.changeDetectorRef['destroyed']) {
      this.changeDetectorRef.detectChanges();
    }
  }
  class_id: string
  class_hid: string


  getRedirectData() {
    if (this.commonMethodService.recentStartDate && this.commonMethodService.isRedirect == true) {
      this.commonMethodService.isRedirect = false;
      if (
        this.commonMethodService.recentStartDate == null &&
        this.commonMethodService.recentEndDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      else {
        this.getSelectedDateRange(this.commonMethodService.recentStartDate, this.commonMethodService.recentEndDate);
        if (this.pageSyncService.isPaymentTabClicked) {
          this.searchPaymentTransactionsData()
        }
      }
    }
  }



  isCheckedFieldsLabel(element: string = "", index: number = 0) {
    let result = this.colFields[index].items.filter(x => x.sortName == element.trim());
    return result && result.length > 0 ? result[0].isVisible : false;
  }
  onDateChange(sDate, eDate, preset) {
    const today = new Date();
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    const ftoday = this.datePipe.transform(today, 'dd/MM/yyyy');
    const fstartDate = this.datePipe.transform(startDate, 'dd/MM/yyyy');
    const fendDate = this.datePipe.transform(endDate, 'dd/MM/yyyy');
    if (preset == "PresetOption") {
      if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate.getDate() === today.getDate() &&
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_today"
        this.class_hid = "id_today_h"
        this.EngHebCalPlaceholder = 'Today';
        this.presetOption = 'Today';
      } else if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) &&
        fendDate <= ftoday
      ) {
        this.class_id = "id_Last7days"
        this.class_hid = "id_Last7days_h"
        this.EngHebCalPlaceholder = 'Last 7 Days';
        this.presetOption = 'Last 7 Days';
      }
      else if (
        startDate <= today &&
        endDate >= today &&
        startDate <= today &&
        endDate <= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)
      ) {
        this.class_id = "id_thisweek"
        this.class_hid = "id_thisweek_h"
        this.EngHebCalPlaceholder = 'This Week';
        this.presetOption = 'This Week';
      } else if (
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_ThisMonth"
        this.class_hid = "id_ThisMonth_h"
        this.EngHebCalPlaceholder = 'This Month';
        this.presetOption = 'This Month';
      } else if (
        startDate.getMonth() === today.getMonth() - 1 &&
        startDate.getFullYear() === today.getFullYear() && startDate.getMonth() != today.getMonth() && endDate.getMonth() !== today.getMonth() + 1
      ) {
        this.class_id = "id_LastMonth"
        this.class_hid = "id_LastMonth_h"
        this.EngHebCalPlaceholder = 'Last Month';
        this.presetOption = 'Last Month';
      } else if (
        startDate.getMonth() === today.getMonth() + 1 &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_NextMonth"
        this.class_hid = "id_NextMonth_h"
        this.EngHebCalPlaceholder = 'Next Month';
        this.presetOption = 'Next Month';
      } else if (startDate.getFullYear() === today.getFullYear()) {
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const formattedStartDate = this.datePipe.transform(thisYearStart, 'dd/MM/yyyy');

        const thisYearEnd = new Date(today.getFullYear(), 11, 31);
        const formattedEndDate = this.datePipe.transform(thisYearEnd, 'dd/MM/yyyy');

        if (fstartDate == formattedStartDate && fendDate == formattedEndDate) {
          this.EngHebCalPlaceholder = 'This Year';
          this.presetOption = 'This Year';
          this.class_id = "id_ThisYear"
          this.class_hid = "id_ThisYear_h"
        } else {
          this.class_id = "id_CustomRange"
          this.class_hid = "id_CustomRange_h"
          this.EngHebCalPlaceholder = fstartDate + " - " + fendDate;
        }
      } else if (startDate.getFullYear() === today.getFullYear() - 1) {
        this.class_id = "id_LastYear"
        this.class_hid = "id_LastYear_h"
        this.EngHebCalPlaceholder = 'Last Year';
        this.presetOption = 'Last Year';
      } else if (startDate.getFullYear() === today.getFullYear() + 1) {
        this.class_id = "id_NextYear"
        this.class_hid = "id_NextYear_h"
        this.EngHebCalPlaceholder = 'Next Year';
        this.presetOption = 'Next Year';
      }
    }
    if (preset == "CustomRange") {
      this.class_id = "id_CustomRange"
      this.class_hid = "id_CustomRange_h"
      this.EngHebCalPlaceholder = sDate + " - " + eDate;
    }
    if (this.pageSyncService.PaymentEngCalPlaceholder && this.isdateChanged) {
      this.EngHebCalPlaceholder = this.pageSyncService.PaymentEngCalPlaceholder;
      this.isdateChanged = false;
    }
  }

  getAFVColumns(isInit = false) {
    if (isInit) {
      this.isloading = true;
    }
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.advancedFieldService.getAll(eventGuId).subscribe((res) => {

      if (res) {
        const itemArr = [];
        for (let index = 0; index < res.length; index++) {
          const element = res[index];
          if (element.fieldName) {
            let trimValue = this.advancedFieldService.formatFieldName(element.fieldName);
            itemArr.push({
              "colName": trimValue,
              "isVisible": false,
              "colId": element.advancedFieldId,
              "sortName": trimValue,
              "isAdvancedField": true
            })
          }
        }

        //get visible adv. columns
        var selectedColumns = [];
        var AdvFields = this.colFields.filter((obj) => {
          if (obj.title && obj.title.indexOf("ADVANCEDFIELDS") > -1) {
            for (let index = 0; index < obj.items.length; index++) {
              if (obj.items[index].isVisible) {
                selectedColumns.push(obj.items[index]);
              }
            }
          }
        });

        //bind selected column
        itemArr.map(function (x) {
          var result = selectedColumns.filter(a1 => a1.colName == x.colName);
          if (result.length > 0) {
            x.isVisible = result[0].isVisible;
          }
          return x
        });

        this.colFields = this.colFields.map((o) => {
          if (o.id !== 2) {
            return o
          }
          return {
            ...o,
            items: itemArr
          }
        })
      }
    }, err => {
      if (isInit) {
        this.isloading = false;
      }
    })
  }

  getSelectedDateRange(sDate, eDate) {
    const today = new Date();
    if (sDate != null && eDate == null) {
      const dates = this.commonMethodService.getStartAndEndDate(sDate);
      this.selectedDateRange.startDate = dates.startDate;
      this.selectedDateRange.endDate = dates.endDate;
      this.onDateChange(this.selectedDateRange.startDate, this.selectedDateRange.endDate, "PresetOption")
    }
    else if (sDate != null && eDate != null) {
      this.selectedDateRange.startDate = moment(sDate);
      this.selectedDateRange.endDate = moment(eDate);
      this.onDateChange(sDate, eDate, "CustomRange");
    }


  }


  paymentActions(id) {
    this.gridFilterData.forEach(element => {
      element.isPaymentActionsVisible = false;
      if (element.paymentId == id) {
        element.isPaymentActionsVisible = true;
      }
    });
  }


  closePaymentPop(id) {
    this.gridFilterData.forEach(element => {
      element.isPaymentActionsVisible = false;
      if (element.paymentId == id) {
        element.isPaymentActionsVisible = false;
      }
    });
  }

  AddReminderPopup(item) {
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
      details: item,
    };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe((res) => {
      this.isloading = false;
    });
  }

  OpenBulkSelectPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk-popup ",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkSelectPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.data = this.gridFilterData;
  }

  RefreshList() {
    this.searchPaymentTransactionsData();
  }



  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.paymentFieldsCol;
    var obj = (fieldsData.find((data) => Object.keys(data)[0] === colName))
    obj ? obj[colName] = isVisible : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "receipt#":
        this.isPaymentReceiptNoColVisible = isVisible;
        this.uiPageSetting.isPaymentReceiptNoColVisible = isVisible;
        break;
      case "paymentdate":
        this.isPaymentDateTimeColVisible = isVisible;
        this.uiPageSetting.isPaymentDateTimeColVisible = isVisible;
        break;
      case "amount":
        this.isPaymentAmountColVisible = isVisible;
        this.uiPageSetting.isPaymentAmountColVisible = isVisible;
        break;
      case "paymenttype":
        this.isPaymentTypeColVisible = isVisible;
        this.uiPageSetting.isPaymentTypeColVisible = isVisible;
        break;
      case "hebrewdate":
        this.isPaymentJewishDateColVisible = isVisible;
        this.uiPageSetting.isPaymentJewishDateColVisible = isVisible;
        break;
      case "ref#":
        this.isPaymentRefNoColVisible = isVisible;
        this.uiPageSetting.isPaymentRefNoColVisible = isVisible;
        break;
      case "approval":
        this.isPaymentApprovalColVisible = isVisible;
        this.uiPageSetting.isPaymentApprovalColVisible = isVisible;
        break;
      case "account#":
        this.isPaymentAccountNoColVisible = isVisible;
        this.uiPageSetting.isPaymentAccountNoColVisible = isVisible;
        break;
      case "donorenglishname":
        this.isPaymentFullNameColVisible = isVisible;
        this.uiPageSetting.isPaymentFullNameColVisible = isVisible;
        break;
      case "donorjewishname":
        this.isPaymentFullNameJewishColVisible = isVisible;
        this.uiPageSetting.isPaymentFullNameJewishColVisible = isVisible;
        break;
      case "createddatetime":
        this.isPaymentCreatedDateColVisible = isVisible;
        this.uiPageSetting.isPaymentCreatedDateColVisible = isVisible;
        break;
      case "collector":
        this.isPaymentCollectorColVisible = isVisible;
        this.uiPageSetting.isPaymentCollectorColVisible = isVisible;
        break;
      case "campaign":
        this.isPaymentCampaignColVisible = isVisible;
        this.uiPageSetting.isPaymentCampaignColVisible = isVisible;
        break;
      case "status":
        this.isPaymentStatusColVisible = isVisible;
        this.uiPageSetting.isPaymentStatusColVisible = isVisible;
        break;
      case "reason":
        this.isPaymentReasonColVisible = isVisible;
        this.uiPageSetting.isPaymentReasonColVisible = isVisible;
        break;
      case "reason#":
        this.isPaymentReasonNumColVisible = isVisible;
        this.uiPageSetting.isPaymentReasonNumColVisible = isVisible;
        break;
      case "source":
        this.isPaymentDeviceColVisible = isVisible;
        this.uiPageSetting.isPaymentDeviceColVisible = isVisible;
        break;
      case "location":
        this.isPaymentLocationColVisible = isVisible;
        this.uiPageSetting.isPaymentLocationColVisible = isVisible;
        break;
      case "note":
        this.isPaymentNoteColVisible = isVisible;
        this.uiPageSetting.isPaymentNoteColVisible = isVisible;
        break;
      case "phonenumber":
        this.isPaymentPhoneNumberColVisible = isVisible;
        this.uiPageSetting.isPaymentPhoneNumberColVisible = isVisible;
        break;
      case "schedule#":
        this.isPaymentScheduleNoColVisible = isVisible;
        this.uiPageSetting.isPaymentScheduleNoColVisible = isVisible;
        break;
      case "scheduleinfo":
        this.isPaymentScheduleInfoColVisible = isVisible;
        this.uiPageSetting.isPaymentScheduleInfoColVisible = isVisible;
        break;
      case "cardholdername":
        this.isPaymentCardHolderColVisible = isVisible;
        this.uiPageSetting.isPaymentCardHolderColVisible = isVisible;
        break;
      case "address":
        this.isPaymentAddressColVisible = isVisible;
        this.uiPageSetting.isPaymentAddressColVisible = isVisible;
        break;
      case "citystatezip":
        this.isPaymentCityStateZipColVisible = isVisible;
        this.uiPageSetting.isPaymentCityStateZipColVisible = isVisible;
        break;
      case "email":
        this.isPaymentEmailColVisible = isVisible;
        this.uiPageSetting.isPaymentEmailColVisible = isVisible;
        break;
      case "batch#":
        this.isPaymentBatchNumColVisible = isVisible;
        this.uiPageSetting.isPaymentBatchNumColVisible = isVisible;
        break;
      case "group":
        this.isPaymentGroupColVisible = isVisible;
        this.uiPageSetting.isPaymentGroupColVisible = isVisible;
        break;
      case "father":
        this.isPaymentFatherColVisible = isVisible;
        this.uiPageSetting.isPaymentFatherColVisible = isVisible;
        break;
      case "fatherinlaw":
        this.isPaymentFatherInLawColVisible = isVisible;
        this.uiPageSetting.isPaymentFatherInLawColVisible = isVisible;
        break;
      case "class":
        this.isPaymentClassColVisible = isVisible;
        this.uiPageSetting.isPaymentClassColVisible = isVisible;
        break;
      case "englishtitle":
        this.isPaymentEnglishTitleColVisible = isVisible;
        this.uiPageSetting.isPaymentEnglishTitleColVisible = isVisible;
        break;
      case "englishfirstname":
        this.isPaymentFirstNameColVisible = isVisible;
        this.uiPageSetting.isPaymentFirstNameColVisible = isVisible;
        break;
      case "englishlastname":
        this.isPaymentLastNameColVisible = isVisible;
        this.uiPageSetting.isPaymentLastNameColVisible = isVisible;
        break;
      case "yiddishfirsttitle":
        this.isPaymentTitleJewishColVisible = isVisible;
        this.uiPageSetting.isPaymentTitleJewishColVisible = isVisible;
        break;
      case "yiddishfirstname":
        this.isPaymentFirstNameJewishColVisible = isVisible;
        this.uiPageSetting.isPaymentFirstNameJewishColVisible = isVisible;
        break;
      case "yiddishlastname":
        this.isPaymentLastNameJewishColVisible = isVisible;
        this.uiPageSetting.isPaymentLastNameJewishColVisible = isVisible;
        break;
      case "yiddishlasttitle":
        this.isPaymentSuffixJewishColVisible = isVisible;
        this.uiPageSetting.isPaymentSuffixJewishColVisible = isVisible;
        break;
      case "amountapplied":
        this.isPledgePaymentColVisible = isVisible;
        this.uiPageSetting.isPledgePaymentColVisible = isVisible;
        break;
      case "convertedamount":
        this.isCurrencyAmountColVisible = isVisible;
        this.uiPageSetting.isCurrencyAmountColVisible = isVisible;
        break;
      case "currencytype":
        this.isCurrencyTypeColVisible = isVisible;
        this.uiPageSetting.isCurrencyTypeColVisible = isVisible;
        break;
      case "tags":
        this.isTagsColVisible = isVisible;
        this.uiPageSetting.isTagsColVisible = isVisible;
        break;
      case "gatewaybatch#":
        this.isGateWayBatchColVisible = isVisible;
        this.uiPageSetting.isGateWayBatchColVisible = isVisible;
        break;
      case "legalreceipt":
        this.isLegalRecieptColVisible = isVisible;
        this.uiPageSetting.isLegalRecieptColVisible = isVisible;
        break;
    }


    $event.stopPropagation();
  }
  checkColVisibility(colName) {
    let col = this.colfieldsValue.find((data) => Object.keys(data)[0] == colName)
    return col ? col[colName] : false
  }

  checkVisibility(colName) {
    let col = this.colfieldsValue.find((data) => Object.keys(data)[0] == colName);
    if (col) {
      return col[colName];
    } else {
      return this.checkGridColVisibility(colName);
    }
  }
  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "receipt#":
        return this.isPaymentReceiptNoColVisible;
      case "paymentdate":
        return this.isPaymentDateTimeColVisible;
      case "amount":
        return this.isPaymentAmountColVisible;
      case "paymenttype":
        return this.isPaymentTypeColVisible;
      case "hebrewdate":
        return this.isPaymentJewishDateColVisible;
      case "ref#":
        return this.isPaymentRefNoColVisible;
      case "approval":
        return this.isPaymentApprovalColVisible;
      case "account#":
        return this.isPaymentAccountNoColVisible;
      case "donorenglishname":
        return this.isPaymentFullNameColVisible;
      case "donorjewishname":
        return this.isPaymentFullNameJewishColVisible;
      case "createddatetime":
        return this.isPaymentCreatedDateColVisible;
      case "collector":
        return this.isPaymentCollectorColVisible;
      case "campaign":
        return this.isPaymentCampaignColVisible;
      case "status":
        return this.isPaymentStatusColVisible;
      case "reason":
        return this.isPaymentReasonColVisible;
      case "reason#":
        return this.isPaymentReasonNumColVisible;
      case "source":
        return this.isPaymentDeviceColVisible;
      case "location":
        return this.isPaymentLocationColVisible;
      case "note":
        return this.isPaymentNoteColVisible;
      case "phonenumber":
        return this.isPaymentPhoneNumberColVisible;
      case "schedule#":
        return this.isPaymentScheduleNoColVisible;
      case "scheduleinfo":
        return this.isPaymentScheduleInfoColVisible;
      case "cardholdername":
        return this.isPaymentCardHolderColVisible;
      case "address":
        return this.isPaymentAddressColVisible;
      case "citystatezip":
        return this.isPaymentCityStateZipColVisible;
      case "email":
        return this.isPaymentEmailColVisible;
      case "batch#":
        return this.isPaymentBatchNumColVisible;
      case "group":
        return this.isPaymentGroupColVisible;
      case "father":
        return this.isPaymentFatherColVisible;
      case "fatherinlaw":
        return this.isPaymentFatherInLawColVisible;
      case "class":
        return this.isPaymentClassColVisible;
      case "englishtitle":
        return this.isPaymentEnglishTitleColVisible;
      case "englishfirstname":
        return this.isPaymentFirstNameColVisible;
      case "englishlastname":
        return this.isPaymentLastNameColVisible;
      case "yiddishfirsttitle":
        return this.isPaymentTitleJewishColVisible;
      case "yiddishfirstname":
        return this.isPaymentFirstNameJewishColVisible;
      case "yiddishlastname":
        return this.isPaymentLastNameJewishColVisible;
      case "yiddishlasttitle":
        return this.isPaymentSuffixJewishColVisible;
      case "amountapplied":
        return this.isPledgePaymentColVisible;
      case "convertedamount":
        return this.isCurrencyAmountColVisible;
      case "currencytype":
        return this.isCurrencyTypeColVisible;
      case "tags":
        return this.isTagsColVisible;
      case "gatewaybatch#":
        return this.isGateWayBatchColVisible;
      case "legalreceipt":
        return this.isLegalRecieptColVisible;
      default:
        let result = this.colFields[0].items.filter(x => x.colName.toLowerCase() == colName);

        return result && result.length > 0 ? result[0].isVisible : false;
    }
  }

  openSchedulePaymentCardPopup(scheduleNum) {
    if (scheduleNum != null && scheduleNum != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup schedule_paymentcard",
      };
      const modalRef = this.commonMethodService.openPopup(
        SchedulePaymentCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.isOtherCountry = true;
      var objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        scheduleId: scheduleNum,
      };

      this.cardService.getScheduleCard(objScheduleCard).subscribe(
        (res: any) => {
          modalRef.componentInstance.SchedulePaymentCardData = res;
        },
        (err) => {
          modalRef.close();
          Swal.fire({
            title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
            text: err.error,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      );
      modalRef.componentInstance.emtScheduleUpdate.subscribe((res: any) => {
        this.searchPaymentTransactionsData();
      });
    }
  }

  totalSelectedShow(): number {
    return this.recordSelectedArray.length;
  }

  getTableTdClassName(objHeader) {
    if (
      objHeader.colName === "Payments" ||
      objHeader.colName === "Open Pledges" ||
      objHeader.colName === "Scheduled" ||
      objHeader.colName === "Total" ||
      objHeader.colName === "Count of Payments" ||
      objHeader.colName === "Count of Pledges" ||
      objHeader.colName === "Count of Schedules"
    ) {
      return "total_panel_tbl_th";
    }
  }

  datesUpdated(event) {
    $("#localsearch").val("");
    $("#select_all").prop("checked", false);
    let empVal = 0;
    this.isSelected = false;
    this.isRetrySelected = false;
    if (this.isinitialize == 1) {
      this.selectedDateRange = event;
      this.searchPaymentTransactionsData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
        empVal = 1;
      }
    }

    this.isinitialize = 1 + empVal;
  }

  CalendarFocus() { }
  // popup
  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      keyboard: true,
      windowClass: "advance_search",
    };
    const modalRef = this.commonMethodService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isPaymentTab = true;
    modalRef.componentInstance.isSearchTitle = "Payment";
    modalRef.componentInstance.dateRange = this.selectedDateRange;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.FeatureName = "Filter_Payments";


    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedSearchData(objResponse)
      }
    );
  }
  advancedSearchData(objResponse) {
    this.objAdvancedSearch = objResponse;
    //this.searchPaymentTransactionsData(); //for issue comments
    this.selectedChipType = null;
    this.isFiltered = false;
    this.filtercount = 0;
    for (let key of Object.keys(this.objAdvancedSearch)) {
      let filtervalue = this.objAdvancedSearch[key];
      if (filtervalue == undefined || filtervalue.length == 0) {
      } else {
        if (
          key == "isBatchClicked" ||
          key == "batchNum" ||
          key == "isReasonNoOptionSelected" ||
          key == "isCampaignNoOptionSelected" ||
          key == "isLocationNoOptionSelected" ||
          key == "isCollectorNoOptionSelected"
        ) {
          if (
            (key == "isBatchClicked" && filtervalue) ||
            (key == "batchNum" && filtervalue) ||
            (key == "isReasonNoOptionSelected" && filtervalue) ||
            (key == "isCampaignNoOptionSelected" && filtervalue) ||
            (key == "isLocationNoOptionSelected" && filtervalue) ||
            key == "isCollectorNoOptionSelected"
          ) {
            this.filtercount += 1;
          }
        } else {
          this.filtercount += 1;
        }
      }
    }
    this.filterLocalData();
    this.localSumCalCulation();
  }
  openSearchFilterPopup() {
    const modalRef = this.commonMethodService.openPopup(
      PaymentTransGridFilterPopupComponent
    );
    modalRef.componentInstance.setDueDate = this.selectedDueDate;
    modalRef.componentInstance.emtOutputSearchFilterData.subscribe(
      (objResponse) => {
        this.setPaymentDue("customWeek", objResponse.selectedDueDate);
      }
    );
  }

  OpenHelpPage() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    this.commonMethodService.openPopup(
      SupportPopupComponent,
      this.modalOptions
    );
  }

  calenderModal() {
    this.isinitialize = 0;
    let empVal = 0;
    this.modalOptions = {
      size: "lg",

      keyboard: true,
      windowClass: "calenderModal",
    };
    const modalRef = this.commonMethodService.openPopup(
      CalenderModalComponent,
      this.modalOptions
    );
    modalRef.componentInstance.calenderData = this.selectedDateRange;

    modalRef.componentInstance.emtOutputDateRange.subscribe((objResponse) => {
      $("#localsearch").val("");
      $("#select_all").prop("checked", false);

      this.isSelected = false;
      this.isRetrySelected = false;
      if (this.isinitialize == 1) {
        this.isinitialize = 0;
        empVal = 1;
        this.selectedDateRange = objResponse;
        this.searchPaymentTransactionsData();
        if (objResponse.startDate == null && objResponse.endDate == null) {
          this.selectedDateRange = undefined;
          empVal = 1;
        }
      }
      this.isinitialize = 1 + empVal;
    });
    modalRef.componentInstance.emtOutputradioVal.subscribe(
      (objRadioResponse) => {
        this.paymentMode = objRadioResponse;
      }
    );
  }
  OpenLegalReceipt(paymentId, transactionData, paymentType) {

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
    modalRef.componentInstance.transactionData = transactionData;
    modalRef.componentInstance.gridFilterData = this.gridFilterData;





  }


  BulkLegalTransaction() {
    var paymentIds = [];
    var paymentType = []
    var legalReceiptNums = [];
    for (const item of this.recordSelectedArray) {
      var legalReceiptPaymentId = this.gridFilterData.find((x) => x.paymentId == item);
      if (legalReceiptPaymentId) {
        paymentIds.push(legalReceiptPaymentId.paymentId)
        paymentType.push(legalReceiptPaymentId.paymentType)
        legalReceiptNums.push(legalReceiptPaymentId.legalReceiptNum)
        this.isLegalReceiptNumPresent = legalReceiptNums.some((num) => num !== null);

      }
    }
    //this.isCashCreditPaymentType = paymentType.some((paymentType) => paymentType== "Cash" || paymentType== "Check")

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
    var commaSeparatedPaymentIds = paymentIds.join(',');
    modalRef.componentInstance.paymentId = commaSeparatedPaymentIds;
    modalRef.componentInstance.isBlukTransaction = true;
    modalRef.componentInstance.isLegalReceiptNumPresent = this.isLegalReceiptNumPresent



  }
  editBatchPaymentPopup() {
    this.commonMethodService.featureName = 'close_batch'
    this.commonMethodService.getFeatureSettingValues();
    let btnTxt = this.commonMethodService.isfeatureSetting ? 'Batch Payments' : 'Upgrade to save';
    let btnClass = this.commonMethodService.isfeatureSetting ? 'btn_batch' : 'btn_batch btn-core';
    var selectedArray = this.recordSelectedArray;
    Swal.fire({
      title: "<b>Batch " + selectedArray.length + " payments</b>",
      html: '<h3>Add A Note</h3><textarea class="txt-batchnote" id="txtBatchNote" name="BatchNote" rows="5" cols="30"/>',
      //icon: "warning",
      showCancelButton: true,
      confirmButtonText: btnTxt,
      cancelButtonText: this.commonMethodService.getTranslate('CANCEL'),
      customClass: {
        confirmButton: btnClass,
        container: "batch_prnt",
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        if (!this.commonMethodService.isfeatureSetting) {
          this.onUpgrade()
          this.isloading = false;
          return
        }
        var objBatch = {
          paymentIds: selectedArray,
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          batchNote: $("#txtBatchNote").val(),
          UpdatedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.batchService.saveBatchV1(objBatch).subscribe(
          (res) => {
            if (res) {
              this.isloading = false;
              Swal.fire({
                title: "<b>" + selectedArray.length + " payments batched</b>",
                text: "batch#" + res.batchNum,
                confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
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
            Swal.fire(this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'), error.error, "error").then(
              () => {
                this.commonMethodService.sendPaymentTrans(true);
              }
            );
          }
        );
      } else {
      }
    });
  }

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbyPayment = cardType;
    $("#select_all").prop("checked", false);
    this.isSelected = false;
    this.isRetrySelected = false;
    this.recordSelectedArray = [];
    if (cardType) {
      if (cardType[0].itemName == "Campaign") {
        this.paymentTypeChipData = this.sumByCampaignPayments.filter(
          (x) => x.paymentType != "" && x.paymentType != null
        );
      }
      if (cardType[0].itemName == "Reason") {
        this.paymentTypeChipData = this.sumByReasonPayments.filter(
          (x) => x.paymentType != "" && x.paymentType != null
        );
      }
      if (cardType[0].itemName == "Collector") {
        this.paymentTypeChipData = this.sumByCollectorPayments.filter(
          (x) => x.paymentType != "" && x.paymentType != null
        );
      }
      if (cardType[0].itemName == "Location") {
        this.paymentTypeChipData = this.sumByLocationPayments;
      }
      if (cardType[0].itemName == "Payment Type") {
        this.paymentTypeChipData = this.sumByPaymentTypePayments;
      }
      if (cardType[0].itemName == "Payment Status") {
        this.paymentTypeChipData = this.sumByPaymentStatusPayments;
      }
      if (cardType[0].itemName == "Source") {
        this.paymentTypeChipData = this.sumBySourcePayments;
      }
      if (cardType[0].itemName == "Week") {
        this.paymentTypeChipData = this.sumByWeekPayments;
      }
      if (cardType[0].itemName == "Month") {
        this.paymentTypeChipData = this.sumByMonthPayments;
      }
      if (cardType[0].itemName == "Year") {
        this.paymentTypeChipData = this.sumByYearPayments;
      }
      if (cardType[0].itemName == "Currency") {
        this.paymentTypeChipData = this.sumByCurrencyPayments;
      }
    }
    this.changeSortType(this.sortType);
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    var sortId = sortType.map((s) => s.id).toString();
    var allTypeCard = this.paymentTypeChipData.filter(
      (x) => x.paymentType == "ALL" || x.paymentTypeId == -1
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.paymentType != "ALL"
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.paymentTypeId != -1
    );
    var cardTypeValue =
      this.cardType.length > 0
        ? this.cardType.map((s) => s.id).toString()
        : null;

    if (sortId == 1) {
      if (cardTypeValue == "10") {
        this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
          a.paymentTypeId > b.paymentTypeId
            ? 1
            : b.paymentTypeId > a.paymentTypeId
              ? -1
              : 0
        );
        if (allTypeCard[1] != undefined) {
          this.paymentTypeChipData.unshift(allTypeCard[1]);
        }
        this.paymentTypeChipData.unshift(allTypeCard[0]);
      } else {
        this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
          a.paymentType > b.paymentType
            ? 1
            : b.paymentType > a.paymentType
              ? -1
              : 0
        );
        if (allTypeCard[1] != undefined) {
          this.paymentTypeChipData.unshift(allTypeCard[1]);
        }
        this.paymentTypeChipData.unshift(allTypeCard[0]);
      }
    } else if (sortId == 2) {
      if (cardTypeValue == "10") {
        this.paymentTypeChipData = this.paymentTypeChipData
          .sort((a, b) =>
            a.paymentTypeId > b.paymentTypeId
              ? 1
              : b.paymentTypeId > a.paymentTypeId
                ? -1
                : 0
          )
          .reverse();
        if (allTypeCard[1] != undefined) {
          this.paymentTypeChipData.unshift(allTypeCard[1]);
        }
        this.paymentTypeChipData.unshift(allTypeCard[0]);
      } else {
        this.paymentTypeChipData = this.paymentTypeChipData
          .sort((a, b) =>
            a.paymentType > b.paymentType
              ? 1
              : b.paymentType > a.paymentType
                ? -1
                : 0
          )
          .reverse();
        if (allTypeCard[1] != undefined) {
          this.paymentTypeChipData.unshift(allTypeCard[1]);
        }
        this.paymentTypeChipData.unshift(allTypeCard[0]);
      }
    } else if (sortId == 3) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) =>
          a.totalAmount > b.totalAmount
            ? 1
            : b.totalAmount > a.totalAmount
              ? -1
              : 0
        )
        .reverse();
      if (allTypeCard[1] != undefined) {
        this.paymentTypeChipData.unshift(allTypeCard[1]);
      }
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 4) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.totalAmount > b.totalAmount
          ? 1
          : b.totalAmount > a.totalAmount
            ? -1
            : 0
      );
      if (allTypeCard[1] != undefined) {
        this.paymentTypeChipData.unshift(allTypeCard[1]);
      }
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    }
  }

  editTransactionInfoPopup() {
    let resultArray = [];
    let selectedCheckTypeIDs = [];
    let selectedLocations = [];
    let selectedCollectors = [];
    this.isPaymentTypeCheck = false;
    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
      if (donorDetails.paymentType == "Check") {
        selectedCheckTypeIDs.push(donorDetails.paymentId);
        selectedLocations.push({ locationId: donorDetails.locationId, locationName: donorDetails.locationName });
        selectedCollectors.push({ collectorId: donorDetails.collectorId, collectorName: donorDetails.colectorName })
        this.isPaymentTypeCheck = true;
      }
    }
    let pledgePayment = resultArray.find((x) => x.pledgePayment != null);
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
    modalRef.componentInstance.locations = selectedLocations;
    modalRef.componentInstance.collectors = selectedCollectors;

  }

  calculatesumBy(list: Array<any>, byKey: string, typeName: string) {
    return _(list)
      .groupBy(byKey)
      .map((props, id) => {
        const el = _.head(props);
        return {
          paymentCount: props.length,
          paymentType: el[typeName],
          paymentTypeChipCSSClass: "info-box bg-gradient-info",
          paymentTypeId: id,
          paymenttypeName: typeName,
          totalAmount: _.sumBy(props, "amount"),
        };
      })
      .value();
  }

  calculateAllSumByFields(list) {
    const totalAmount = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.amount;
        return sumOfArray;
      },
      0
    );
    const byLocation = this.calculatesumBy(list, "locationId", "locationName");
    const byCollector = this.calculatesumBy(
      list,
      "collectorId",
      "colectorName"
    );
    const bySource = this.calculatesumBy(list, "deviceId", "device");
    const byPaymentType = this.calculatesumBy(
      list,
      "paymentTypeId",
      "paymentType"
    );
    const byPaymentStatus = this.calculatesumBy(
      list,
      "paymentStatusId",
      "paymentStatus"
    );
    const byCurrency = this.calculatesumBy(
      list,
      "currencyName",
      "currencyName"
    );
    this.reasonlist = this.splitReasonChipCard(list);
    this.campaignlist = this.splitCampaignChipCard(list);

    let reminder = this.finalreminder;
    const allKeyObj = {
      paymentCount: list.length,
      paymentType: "ALL",
      paymentTypeChipCSSClass: "info-box bg-gradient-info",
      paymentTypeId: -2,
      totalAmount: totalAmount,
    };

    let byReason = this.calculatesumBy(
      this.reasonlist,
      "reasonId",
      "reasonName"
    );
    let byCampaign = this.calculatesumBy(
      this.campaignlist,
      "campaignId",
      "campaignName"
    );
    let nullPaymentReasonTypeId = byReason.filter((x) => x.paymentTypeId == "null");

    byReason.forEach(function (element, i) {
      if (element.paymentTypeId == "null") {
        element.paymentType = "No reason";
        element.paymentTypeId = -1;
        element.totalAmount = element.totalAmount;
        element.paymentCount
      }
      if (element.paymentTypeId !== "null") {
        list.find((val) => {
          if (element.paymentType === val.reasonName) {
            element.paymentType
            element.paymentTypeId = element.paymentTypeId;
            element.totalAmount = val.reasonAmounts ? val.reasonAmounts : element.totalAmount;
            element.paymentCount
          }
        });
      }
    });

    if (reminder > 0 && nullPaymentReasonTypeId.length == 0) {
      byReason.push({
        paymentCount: 0,
        paymentType: "No reason",
        paymentTypeId: -1,
        paymentTypeChipCSSClass: "info-box bg-gradient-info",
        totalAmount: reminder,
        paymenttypeName: "reasonName"
      })
    }

    let noSplitReasonMany = this.noReasonCardCalculation(this.gridFilterData);
    let noSplitReasonOne = this.gridFilterData.filter(x => x.noReasonSplit == true);
    let splitReasonCount = noSplitReasonMany.length + noSplitReasonOne.length;

    if (splitReasonCount > 0) {
      byReason.forEach(function (element, i) {
        if (
          element.paymentType == "No reason"
        ) {
          element.paymentCount += splitReasonCount;
        }
      });
    }
    byReason = byReason.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.paymentTypeId === value.paymentTypeId &&
            t.paymenttypeName != "parentReasonNames"
        )
    );


    let nullPaymentTypeId = byCampaign.filter((x) => x.paymentTypeId == "null");

    byCampaign.forEach(function (element, i) {
      if (element.paymentTypeId == "null") {
        element.paymentType = "No campaign";
        element.paymentTypeId = -1;
        element.totalAmount = element.totalAmount + reminder;
        element.paymentCount
      }
      if (element.paymentTypeId == "null") {
        list.find((val) => {
          if (element.paymentType === val.campaignName) {
            element.paymentType
            element.paymentTypeId = element.paymentTypeId;
            element.totalAmount = val.campaignAmounts ? val.campaignAmounts : element.totalAmount + reminder;
            element.paymentCount
          }
        });
      }
    });

    if (reminder > 0.01 && nullPaymentTypeId.length == 0) {
      byCampaign.push({
        paymentCount: 0,
        paymentType: "No campaign",
        paymentTypeId: -1,
        paymentTypeChipCSSClass: "info-box bg-gradient-info",
        totalAmount: reminder,
        paymenttypeName: "campaignName"
      })
    }

    let noSplitCampaignMany = this.noCampaignCardCalculation(this.gridFilterData);
    let noSplitCampaignOne = this.gridFilterData.filter(x => x.noCampaignSplit == true);
    let splitCampaignCount = noSplitCampaignOne.length + noSplitCampaignMany.length;

    if (splitCampaignCount > 0) {
      byCampaign.forEach(function (element, i) {
        if (
          element.paymentType == "No campaign"
        ) {
          element.paymentCount += splitCampaignCount;
        }
      });
    }

    byCampaign = byCampaign.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.paymentTypeId === value.paymentTypeId &&
            t.paymenttypeName != "parentCampaignNames"
        )
    );


    byLocation.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No location";
        element.paymentTypeId = -1;
      }
    });
    byCollector.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No collector";
        element.paymentTypeId = -1;
      }
    });
    bySource.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No source";
        element.paymentTypeId = -1;
      }
    });
    byPaymentType.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No payment type";
        element.paymentTypeId = -1;
      }
    });
    byPaymentStatus.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No payment status";
        element.paymentTypeId = -1;
      }
    });
    byCurrency.forEach(function (element, i) {
      if (element.paymentType == null) {
        element.paymentType = "No currency";
        element.paymentTypeId = -1;
      }
    });

    this.sumByReasonPayments = [allKeyObj, ...byReason];
    this.sumByCampaignPayments = [allKeyObj, ...byCampaign];
    this.sumByLocationPayments = [allKeyObj, ...byLocation];
    this.sumByCollectorPayments = [allKeyObj, ...byCollector];
    this.sumBySourcePayments = [allKeyObj, ...bySource];
    this.sumByPaymentTypePayments = [allKeyObj, ...byPaymentType];
    this.sumByPaymentStatusPayments = [allKeyObj, ...byPaymentStatus];
    this.sumByCurrencyPayments = [allKeyObj, ...byCurrency];
    list = list.filter((x) => x.split == false);
  }

  SaveLayout() {
    if (this.presetOption == "Today" || this.presetOption == "This Week" || this.presetOption == "This Month" || this.presetOption == "This Year" || this.presetOption == "Last Month"
      || this.presetOption == "Next Month" || this.presetOption == "Last Year" || this.presetOption == "Next Year" || this.presetOption == "Last 7 Days") {
      this.selectedDateRange.startDate = this.presetOption;
      this.selectedDateRange.endDate = null;
    }
    else {
      this.selectedDateRange.startDate = this.selectedDateRange != undefined && this.selectedDateRange.startDate != null ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD") : null;
      this.selectedDateRange.endDate = this.selectedDateRange != undefined && this.selectedDateRange.endDate != null ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD") : null;
    }
    let setting = {
      isPaymentReceiptNoColVisible: this.isPaymentReceiptNoColVisible,
      isPaymentDateTimeColVisible: this.isPaymentDateTimeColVisible,
      isPaymentAmountColVisible: this.isPaymentAmountColVisible,
      isPaymentTypeColVisible: this.isPaymentTypeColVisible,
      isPaymentRefNoColVisible: this.isPaymentRefNoColVisible,
      isPaymentApprovalColVisible: this.isPaymentApprovalColVisible,
      isPaymentAddtnlAmountColVisible: this.isPaymentAddtnlAmountColVisible,
      isPaymentAccountNoColVisible: this.isPaymentAccountNoColVisible,
      isPaymentFullNameColVisible: this.isPaymentFullNameColVisible,
      isPaymentFullNameJewishColVisible: this.isPaymentFullNameJewishColVisible,
      isPaymentCreatedDateColVisible: this.isPaymentCreatedDateColVisible,
      isPaymentCollectorColVisible: this.isPaymentCollectorColVisible,
      isPaymentCampaignColVisible: this.isPaymentCampaignColVisible,
      isPaymentStatusColVisible: this.isPaymentStatusColVisible,
      isPaymentReasonColVisible: this.isPaymentReasonColVisible,
      isPaymentReasonNumColVisible: this.isPaymentReasonNumColVisible,
      isPaymentDeviceColVisible: this.isPaymentDeviceColVisible,
      isPaymentLocationColVisible: this.isPaymentLocationColVisible,
      isPaymentNoteColVisible: this.isPaymentNoteColVisible,
      isPaymentPhoneNumberColVisible: this.isPaymentPhoneNumberColVisible,
      isPaymentScheduleNoColVisible: this.isPaymentScheduleNoColVisible,
      isPaymentCardHolderColVisible: this.isPaymentCardHolderColVisible,
      isPaymentScheduleInfoColVisible: this.isPaymentScheduleInfoColVisible,
      isPaymentAddressColVisible: this.isPaymentAddressColVisible,
      isPaymentCityStateZipColVisible: this.isPaymentCityStateZipColVisible,
      isPaymentEmailColVisible: this.isPaymentEmailColVisible,
      isPaymentGroupColVisible: this.isPaymentGroupColVisible,
      isPaymentClassColVisible: this.isPaymentClassColVisible,
      isPaymentFatherColVisible: this.isPaymentFatherColVisible,
      isPaymentFatherInLawColVisible: this.isPaymentFatherInLawColVisible,
      isPaymentBatchNumColVisible: this.isPaymentBatchNumColVisible,
      isPaymentJewishDateColVisible: this.isPaymentJewishDateColVisible,
      isPaymentEnglishTitleColVisible: this.isPaymentEnglishTitleColVisible,
      isPaymentFirstNameColVisible: this.isPaymentFirstNameColVisible,
      isPaymentLastNameColVisible: this.isPaymentLastNameColVisible,
      isPaymentTitleJewishColVisible: this.isPaymentTitleJewishColVisible,
      isPaymentFirstNameJewishColVisible:
        this.isPaymentFirstNameJewishColVisible,
      isPaymentLastNameJewishColVisible: this.isPaymentLastNameJewishColVisible,
      isPaymentSuffixJewishColVisible: this.isPaymentSuffixJewishColVisible,
      isPledgePaymentColVisible: this.isPledgePaymentColVisible,
      isCurrencyAmountColVisible: this.isCurrencyAmountColVisible,
      isCurrencyTypeColVisible: this.isCurrencyTypeColVisible,
      isTagsColVisible: this.isTagsColVisible,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
      isGateWayBatchColVisible: this.isGateWayBatchColVisible,
      isLegalRecieptColVisible: this.isLegalRecieptColVisible,
      sumBy: this.cardType,
      searchitem: this.objAdvancedSearch,
      advancedFields: this.colFields[1],
      paymentCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "payments",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK').commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }

  splitReasonChipCard(list) {
    let newList = [];
    let sumofreminder: number = 0;
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (
        element.reasonIds &&
        element.reasonIds.indexOf(",") > -1 &&
        (element.split == undefined || element.split == false)
      ) {
        var reasonIdArray = element.reasonIds.split(",");
        var reasonNameArray = element.reasons.split(",");
        var reasonAmount = element.amount;
        var amount = element.amount;
        var sumOfreasonAmount = 0;

        // Calculation the sum using forEach
        sumOfreasonAmount += parseFloat(reasonAmount);
        sumOfreasonAmount = Math.round(sumOfreasonAmount * 100) / 100;
        var reminder = [];
        if (amount >= sumOfreasonAmount) {
          reminder.push(amount - sumOfreasonAmount);
          element.reminder = amount - sumOfreasonAmount;
        } else {
          element.reminder = 0;
        }

        reminder.forEach((x) => {
          sumofreminder += parseFloat(x);
        });

        for (var j = 0; j < reasonIdArray.length; j++) {
          var newObj: any = {};
          newObj = {
            ...element,
            reasonId: reasonIdArray[j].trim(),
            reasonName: reasonNameArray[j]?.trim(),
            amount: Number(reasonAmount),
            reasonIds: element.reasonIds,
            amountt: amount,
            split: true,
          };
          newList.push({ ...newObj });
        }
      } else {
        if (element.split != true) {
          if (element.amount != null && element.amount > Number(element.amount)) {
            sumofreminder += element.amount - Number(element.amount);
            element.amountt = element.amount
            element.noReasonSplit = true
            element.amount = Number(element.amount);

          }
          element.split = false;
        }
        newList.push({ ...element });
      }
    }
    this.finalreminder = sumofreminder;

    return newList;
  }

  splitCampaignChipCard(list) {
    let newList = [];
    let sumofreminder: number = 0;
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (
        element.campaignIds &&
        element.campaignIds.indexOf(",") > -1 &&
        (element.split == undefined || element.split == false)
      ) {
        var campaignIdArray = element.campaignIds.split(",");
        var campaignNameArray = element.campaigns.split(",");
        var campaignAmountArray = element.campaignAmounts.split(",");
        var amount = element.amount;
        var sumOfcampaignAmount = 0;

        // Calculation the sum using forEach
        campaignAmountArray.forEach((x) => {
          sumOfcampaignAmount += parseFloat(x);
        });

        sumOfcampaignAmount = Math.round(sumOfcampaignAmount * 100) / 100;

        var reminder = [];
        if (amount >= sumOfcampaignAmount) {
          reminder.push(amount - sumOfcampaignAmount);
          element.reminder = amount - sumOfcampaignAmount;
        } else {
          element.reminder = 0;
        }

        reminder.forEach((x) => {
          sumofreminder += parseFloat(x);
        });
        for (var j = 0; j < campaignIdArray.length; j++) {
          var newObj: any = {};
          newObj = {
            ...element,
            campaignId: campaignIdArray[j].trim(),
            campaignName: campaignNameArray[j].trim(),
            amount: Number(campaignAmountArray[j]),
            campaignIds: element.campaignIds,
            amountt: amount,
            split: true,
          };
          newList.push({ ...newObj });
        }
        //}
      } else {
        if (element.split != true) {
          if (element.campaignAmounts != null && element.amount > Number(element.campaignAmounts)) {
            sumofreminder += element.amount - Number(element.campaignAmounts);
            element.amountt = element.amount
            element.noCampaignSplit = true
            element.amount = Number(element.campaignAmounts);

          }
          element.split = false;
        }
        newList.push({ ...element });
      }
    }
    this.finalreminder = sumofreminder;

    return newList;
  }

  searchPaymentTransactionsData() {
    $("#localsearch").val("");
    $("#select_all").prop("checked", false);
    this.isSelected = false;
    this.isRetrySelected = false;
    //  Excludes loader when adding a phone number for sending text receipt
    if (this.commonMethodService.notToShowLoader == false && this.commonMethodService.notshowPaymentLoader == false) {
      this.isloading = true
    } else {
      this.commonMethodService.notToShowLoader = false;
      this.commonMethodService.notshowPaymentLoader = false;
    }
    this.detectChanges()

    var objsearchPaymentTrans;
    if (this.paymentMode == true) {
      objsearchPaymentTrans = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        fromDate:
          this.selectedDateRange && this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange && this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
    } else {
      objsearchPaymentTrans = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        from:
          this.selectedDateRange && this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        to:
          this.selectedDateRange && this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
    }

    let startReq = Date.now();

    this.paymentTransactionService
      .getPaymentTransactions(objsearchPaymentTrans)
      .subscribe(
        (res: any) => {

          let endReq = Date.now();
          this.isFiltered = false;
          if (res.paymentTransGridModel.length !== 0) {
            let innerStart = Date.now();
            this.gridData = res.paymentTransGridModel;
            //  this.legalReceiptNum = res.paymentTransGridModel.legalReceiptNum;
            this.otherGridData = res.paymentTransGridModel;
            this.pageSyncService.paymentTransList = this.gridData
            this.pageSyncService.isPaymentTabClicked = true;
            var timezone = this.commonMethodService.getTimeZoneFromLoginCurrency()
            this.pageSyncService.lastSyncPaymentTime = this.commonMethodService.convertUTCToTimezone(new Date(), timezone);
            this.pageSyncService.calculateTimeDifference("payment");
            this.resGridDataModification();
            this.commonMethodService.sendPaymentTransactionData(this.gridFilterData);
            let innerend = Date.now();
          } else {
            this.gridData = [];
            this.gridFilterData = this.gridData;
            this.paymentTypeChipData = null;
            this.recordSelectedArray = [];
          }

          if (this.gridData.length !== 0) {
            this.bindAdvanceFields();
          }
          this.isloading = false;
          setTimeout(() => {
            this.tableRowFocued();
          }, 10);
          this.detectChanges()
        },
        (error) => {
          this.totalRecord = 0;
          this.isloading = false;
          console.log(error);
          this.notificationService.showError(
            error.error,
            "Error while fetching data !!"
          );
        }
      );
  }

  resGridDataModification() {
    this.nocampaignWithSplitData = this.noCampaignCardCalculation(
      this.gridData
    );

    this.noReasonWithSplitData = this.noReasonCardCalculation(
      this.gridData
    );

    this.filterLocalData();
    this.localSumCalCulation();
  }

  // Function to check if the string contains Hebrew characters
  containsHebrewCharacters(input: string): boolean {
    const hebrewRegex = /[\u0590-\u05FF]/; // Range of Hebrew Unicode characters
    return hebrewRegex.test(input);
  }


  uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  openDeviceCardPopup(deviceId) {
    if (deviceId != null && deviceId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup device_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        DeviceCardPopupComponent,
        this.modalOptions
      );
      var objDeviceCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        deviceId: deviceId,
        fromDate:
          this.selectedDateRange != undefined
            ? this.selectedDateRange.startDate != null
              ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
              : null
            : null,
        toDate:
          this.selectedDateRange != undefined
            ? this.selectedDateRange.endDate != null
              ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
              : null
            : null,
      };
      this.deviceService.getDeviceCard(objDeviceCard).subscribe((res: any) => {
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.DeviceCardData = res;
        }
      });
    }
  }

  openLocationCardPopup(locationId) {
    if (locationId != null && locationId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup location_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        LocationCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.LocationId = locationId;
      var objCollectorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locationId: locationId,
      };
      this.locationService
        .getLocationCard(objCollectorCard)
        .subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.LocationCardData = res;
          }
        });
    }
  }
  noReasonCardCalculation(gridData) {
    let newGridFilterData = [];
    const newData = gridData.map(element => {
      if (
        element.reasonIds &&
        element.reasonIds.indexOf(",") > -1 &&
        (element.split == undefined || element.split == false)
      ) {
        var reasonAmount = element.amount;
        if (element.amountt > element.amount) {
          var amount = element.amountt;
        } else if (element.amountt < element.amount) {
          var amount = element.amount;
        } else if (element.amountt == element.amount) {
          var amount = element.amountt;
        }
        else {
          var amount = element.amount;
        }
        var sumOfreasonAmount = 0;

        sumOfreasonAmount += parseFloat(reasonAmount);
        sumOfreasonAmount = Math.round(sumOfreasonAmount * 100) / 100;
        let reminder: number = 0;
        var newElement = [];
        if (amount >= sumOfreasonAmount) {
          reminder = amount - sumOfreasonAmount;
        }
        if (element.amount != undefined && reminder > 0) {
          newElement.push(element);
        }
        newElement.forEach((x) => newGridFilterData.push(x));
      }
    })
    return newGridFilterData;
  }

  noCampaignCardCalculation(gridData) {
    let newGridFilterData = [];
    const newData = gridData.map(element => {
      if (
        element.campaignIds &&
        element.campaignIds.indexOf(",") > -1 &&
        (element.split == undefined || element.split == false)
      ) {
        var campaignAmountArray = element.campaignAmounts.split(",");
        if (element.amountt > element.amount) {
          var amount = element.amountt;
        } else if (element.amountt < element.amount) {
          var amount = element.amount;
        } else if (element.amountt == element.amount) {
          var amount = element.amountt;
        }
        else {
          var amount = element.amount;
        }
        //var amount = element.amount;
        var sumOfcampaignAmount = 0;

        campaignAmountArray.forEach((x) => {
          sumOfcampaignAmount += parseFloat(x);
        });
        sumOfcampaignAmount = Math.round(sumOfcampaignAmount * 100) / 100;
        let reminder: number = 0;
        var newElement = [];
        if (amount >= sumOfcampaignAmount) {
          reminder = amount - sumOfcampaignAmount;
        }
        // element.amount = reminder;
        if (element.amount != undefined && reminder > 0) {
          newElement.push(element);
        }
        newElement.forEach((x) => newGridFilterData.push(x));
      }
    })
    return newGridFilterData;
  }
  getUniqueListByKey(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  GetPaymentTransByPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      $("#select_all").prop("checked", false);
      this.isSelected = false;
      this.isRetrySelected = false;
      this.recordSelectedArray = [];
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null;

      this.selectedChipType = objPaymentTypeChip;
      switch (cardTypeValue) {
        case "1": //Campaign
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.campaignlist.forEach((campaign) => {
              campaign.amount = campaign.amountt != undefined ? campaign.amountt : campaign.amount;
            })
            this.gridFilterData = this.campaignlist;
            this.filterLocalData(this.gridFilterData);
            this.gridFilterData = this.getUniqueListByKey(this.gridFilterData, "receiptNum")
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            //For showing no campaign rows & count after clicking on "No campaign" chipcard
            let newGridFilter = [];
            let newGridFilterData = this.nocampaignWithSplitData;
            newGridFilter = this.gridData.filter((s) => s.campaignId == null || (s.campaignAmounts < s.amount && s.campaignAmounts != null && s.noCampaignSplit == true));
            this.gridFilterData = newGridFilterData.concat(newGridFilter);
            this.filterLocalData(this.gridFilterData);
            this.gridFilterData.forEach((campaign) => {
              campaign.amount = campaign.amountt != undefined ? campaign.amountt : campaign.amount;
            })
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            objPaymentTypeChip.paymentCount = this.gridFilterData.length;
          } else {

            this.campaignlist.forEach((campaign) => {
              campaign.amount =
                campaign.amountt != undefined
                  ? campaign.amountt
                  : campaign.amount;
            });

            this.gridFilterData = this.campaignlist.filter(
              (s) =>
                s.campaignId && s.campaignId == objPaymentTypeChip.paymentTypeId

            );
            //code for adding campaignAmounts total amount in amount field
            this.gridFilterData.map((s) => {
              if (s.campaignAmounts != null) {
                var campaignAmountArray = s.campaignAmounts.split(",");
                var sumOfcampaignAmount = 0;
                campaignAmountArray.forEach((x) => {
                  sumOfcampaignAmount += parseFloat(x);
                });
              }
            });


            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "2": //Reason
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.reasonlist.forEach((reason) => {
              reason.amount = reason.amountt != undefined ? reason.amountt : reason.amount;
            })
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.gridFilterData = this.getUniqueListByKey(this.gridFilterData, "receiptNum")
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            let newGridFilter = [];
            let newGridFilterData = this.noReasonWithSplitData;
            newGridFilter = this.gridData.filter((s) => s.reasonId == null || (s.amount < s.amount && s.amount != null));
            this.gridFilterData = newGridFilterData.concat(newGridFilter);
            this.filterLocalData(this.gridFilterData);
            this.gridFilterData.forEach((reason) => {
              reason.amount = reason.amountt != undefined ? reason.amountt : reason.amount;
            })
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            objPaymentTypeChip.paymentCount = this.gridFilterData.length;
          } else {
            this.reasonlist.forEach((reason) => {
              reason.amount =
                reason.amountt != undefined
                  ? reason.amountt
                  : reason.amount;
            });
            this.gridFilterData = this.reasonlist.filter(
              (s) =>
                s.reasonId &&
                s.reasonId.toString().includes(objPaymentTypeChip.paymentTypeId.toString())
            );
            this.gridFilterData.map((s) => {
              if (s.amount != null) {
                var reasonAmountArray = s.amount;
                var sumOfreasonAmount = 0;
                sumOfreasonAmount += parseFloat(reasonAmountArray);
              }
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "3": //Location
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            this.gridFilterData = this.gridData.filter(
              (s) => s.locationId == null
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.locationId && s.locationId == objPaymentTypeChip.paymentTypeId
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "5": //Collector
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            this.gridFilterData = this.gridData.filter(
              (s) => s.collectorId == null
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.collectorId &&
                s.collectorId == objPaymentTypeChip.paymentTypeId
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "6": //PaymentStatus
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            this.gridFilterData = this.gridData.filter(
              (s) => s.paymentStatusId == "0"
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.paymentStatusId &&
                s.paymentStatusId == objPaymentTypeChip.paymentTypeId
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "7": //PaymentType
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            this.gridFilterData = this.gridData.filter(
              (s) => s.paymentTypeId == "0"
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.paymentTypeId == objPaymentTypeChip.paymentTypeId
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "8": //Source
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            this.gridFilterData = this.gridData.filter(
              (s) => s.deviceId == "0"
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.deviceId == objPaymentTypeChip.paymentTypeId
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "9": //Week
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.paymentDateTime).format("YYYY-WW").toString() ==
                objPaymentTypeChip.paymentType
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "10": //Month
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.paymentDateTime).format("MMMM").toString() ==
                objPaymentTypeChip.paymentType
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "11": //Year
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.paymentDateTime).format("YYYY").toString() ==
                objPaymentTypeChip.paymentType
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "12": //Currency
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else if (objPaymentTypeChip.paymentTypeId == "-1") {
            // no curr
            this.gridFilterData = this.gridData.filter(
              (s) => s.currencyName == null
            );
            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.currencyName == objPaymentTypeChip.paymentType
            );

            this.filterLocalData(this.gridFilterData);
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
      }

      this.paymentTypeChipData.forEach(
        (ele) => (ele.paymentTypeChipCSSClass = "info-box bg-gradient-info")
      );
      objPaymentTypeChip.paymentTypeChipCSSClass =
        "info-box bg-gradient-success";
    }
  }

  setPaymentDue(selectedWeek: string, selectedDueDate: any) {
    if (selectedWeek == "currentWeek") {
      this.selectedWeekSearchFilter = "currentWeek";
    } else if (selectedWeek == "nextWeek") {
      this.selectedWeekSearchFilter = "nextWeek";
    } else {
      this.selectedWeekSearchFilter = "customWeek";
      this.selectedDueDate = selectedDueDate.startDate;
    }
    this.searchPaymentTransactionsData();
  }
  openImportPledgePopup() {
    const modalRef = this.commonMethodService.openPopup(ImportPaymentComponent);
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
        res.isNotificationSidebar = true;
        modalRef.componentInstance.DonorCardData = res;
      });
      modalRef.componentInstance.emtEditDonorUpdated.subscribe((val) => {
        if (val) {
          this.searchPaymentTransactionsData();
        }
      });
    }
  }

  search(keyword, event) {
    this.isloading = true;
    $("#select_all").prop("checked", false);
    this.isSelected = false;
    this.isRetrySelected = false;
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
    this.recordSelectedArray = [];
    var filterdRecord;
    this.gridFilterData = this.gridData;
    this.filterLocalData(this.gridData);
    var record = this.gridFilterData;
    this.totalRecord = this.gridFilterData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.amount &&
              obj.amount.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.receiptNum &&
              obj.receiptNum.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.paymentType &&
              obj.paymentType.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.refNum &&
              obj.refNum.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.approval &&
              obj.approval.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.paymentJewishDate &&
              obj.paymentJewishDate
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.approval &&
              obj.approval.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.colectorName &&
              obj.colectorName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.device &&
              obj.device.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.locationName &&
              obj.locationName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.note &&
              obj.note.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fatherInLaw &&
              obj.fatherInLaw.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.batchNum &&
              obj.batchNum.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.father &&
              obj.father.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.emailAddresses &&
              obj.emailAddresses.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.cardHolderName &&
              obj.cardHolderName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.scheduleNum &&
              obj.scheduleNum.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.scheduleInfo &&
              obj.scheduleInfo.toString().toLowerCase().indexOf(searchValue) >
              -1) ||
            (obj.phoneNumbers &&
              obj.phoneNumbers.toString().toLowerCase().indexOf(searchValue) >
              -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      if (!this.selectedChipType) {
        this.gridFilterData = this.gridData;
        this.filterLocalData(this.gridFilterData);
        this.totalRecord = this.gridFilterData.length;
      } else {
        this.gridFilterData = this.gridData;
        this.filterLocalData(this.gridFilterData);
        this.totalRecord = this.gridFilterData.length;
        this.GetPaymentTransByPaymentChipType(this.selectedChipType);
      }
    }
    this.isloading = false;
  }

  openPaymentCardPopup(paymentId, globalId, legalReceiptNum = undefined) {
    if (paymentId != null && paymentId != 0) {
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
        // hide loader

        this.isloading = false;
        res.globalId = globalId;
        modalRef.componentInstance.PaymentCardData = res;
        modalRef.componentInstance.legalReceiptNum = legalReceiptNum;
        modalRef.componentInstance.gridFilterData = this.gridFilterData
      });
      modalRef.componentInstance.emtRetryPayment.subscribe(($e) => {
        this.searchPaymentTransactionsData();
      });
    }
  }

  openCollectorCardPopup(collectorId) {
    if (collectorId != null && collectorId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup collector_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        CollectorCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.CollectorId = collectorId;
      var objCollectorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        collectorId: collectorId,
      };

      this.collectorService
        .getCollectorCard(objCollectorCard)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.CollectorCardData = res;
          }
        });
    }
  }

  openCampaignCardPopup(campaignId) {
    if (campaignId != null && campaignId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup collector_card",
      };

      const modalRef = this.commonMethodService.openPopup(
        CampaignCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.CampaignID = campaignId;

      var objCampaignCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        CampaignId: campaignId,
      };

      this.campaignService
        .getCampaignCard(objCampaignCard)
        .subscribe((res: CampaignCardDataResponse) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.CampaignCardData = res;
            modalRef.componentInstance.CampaignId = campaignId;
          } else {
            Swal.fire({
              title: "",
              text: "No data found",
              icon: "info",
              confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        });
    }
  }

  openReasonCardPopup(reasonId) {
    if (reasonId != null && reasonId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup reason_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        ReasonCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.ReasonId = reasonId;
      var objReasonCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        reasonId: reasonId,
      };

      this.reasonService.getReasonCard(objReasonCard).subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.ReasonCardData = res;
        }
      });
    }
  }

  openEmailMissingPopup() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup email_missing",
    };
    const modalRef = this.commonMethodService.openPopup(
      EmailMissingPopupComponent,
      this.modalOptions
    );
  }

  SendTextReceipt(
    paymentId,
    phoneNumberList,
    accountId,
    globalId,
    fullNameJewish,
    phoneCountryCodeID
  ) {
    if (globalId != "688008") {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_textreceipt send_emailreceipt",
      };

      var donorDetails = this.gridFilterData.find(
        (x) => x.paymentId == paymentId
      );
      if (donorDetails) {
        let { phoneNumberList, phoneLabels } = donorDetails;
        let rowColumn = this.commonMethodService.getLabelArray(phoneLabels, phoneNumberList, phoneCountryCodeID);
        const modalRef = this.commonMethodService.openPopup(
          SendTextreceiptPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.Info = {
          id: paymentId,
          type: "Payment",
          phoneList: rowColumn,
          accountId: accountId,
          globalId: globalId,
          isDonorSelected: fullNameJewish ? true : false,
        };
      }
    }
  }

  SendEmailReceipt(
    paymentId,
    emailList,
    accountId,
    globalId,
    fullNameJewish,
    phoneNumberList,
    pledgePayment
  ) {

    if (globalId != "688008") {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup send_emailreceipt",
      };
      var donorDetails = this.gridFilterData.find(
        (x) => x.paymentId == paymentId
      );
      if (donorDetails) {

        let { emailList, emailLabels } = donorDetails;

        let rowColumn = this.commonMethodService.getLabelArray(emailLabels, emailList, null);
        const modalRef = this.commonMethodService.openPopup(
          SendEmailreceiptPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.Info = {
          id: paymentId,
          type: "Payment",
          emailList: rowColumn,
          accountId: accountId,
          globalId: globalId,
          isDonorSelected: fullNameJewish ? true : false,
          phoneNumber:
            phoneNumberList && phoneNumberList.length > 0
              ? phoneNumberList[0]
              : null,
          isPaymentByClicked: true,
          pledgePayment: pledgePayment
        };
      }
    }
  }

  SendMailReceipt(paymentId, accountId, address, cityStateZip, globalId) {
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
      accountId: accountId,
      address: address,
      cityStateZip: cityStateZip,
      globalId: globalId,
    };
    modalRef.componentInstance.emitAddressUpdated.subscribe(($e) => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }
  isOnlyPledgePayment: boolean = false;
  printReceipt(paymentId, globalId) {
    if (globalId != "688008") {
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
            this.gridFilterData.forEach((element) => {
              if (element.paymentId == paymentId) {
                element.printSent = true;
              }
            });
            modalRef.componentInstance.fileDetails = {
              filename: res.receiptFileUrl,
              filetype: res.contentType,
            };
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate('WARNING_SWAL.TRY_AGAIN'),
              text: res.errorResponse,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        },
        (error) => {
          this.isloading = false;
          modalRef.close(PrintSingleReceiptPopupComponent);
          console.log(error);
          Swal.fire({
            title: "Error while fetching data !!",
            text: error.error,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      );
    }
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
    var resultArray = [];
    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
    }
    modalRef.componentInstance.Info = { type: "Payment" };
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }

  sendReceipt() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendReceiptPopupComponent,
      this.modalOptions
    );
  }


  AdvanceMailReceiptAction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_mail",
    };

    var resultArray = [];

    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridFilterData.find((x) => x.paymentId == item);
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
    modalRef.componentInstance.Info = { type: "Payment", recordSelectedArray: this.recordSelectedArray };
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
    var resultArray = [];

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

    // modalRef.componentInstance.List = resultArray;

    modalRef.componentInstance.Info = { type: "Payment", recordSelectedArray: this.recordSelectedArray };
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

  moveArrayValue(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
  txtRefundAmout;
  AdvanceVoidPaymentAction() {
    var totalrecords = this.recordSelectedArray.length;
    var resultArray = [];
    var isBached = false;
    var isNotBached = false;
    var paymentIdsArray = [];
    for (const item of this.recordSelectedArray) {
      var paymentDetails = this.gridFilterData.find((x) => x.paymentId == item);
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
        cancelButtonText: this.commonMethodService.getTranslate('CANCEL'),
        confirmButtonText: "Void from portal",
        customClass: {
          cancelButton: "btn-Issue-refund",
          confirmButton: "btn-Void-from-portal",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.onDeletePyament(paymentIdsArray);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
      });
    } else {
      this.commonMethodService.featureName = 'preset_amounts'
      this.commonMethodService.getFeatureSettingValues();
      let btnTxt = this.commonMethodService.isfeatureSetting ? 'Confirm' : 'Upgrade to save';
      let btnClass = this.commonMethodService.isfeatureSetting ? 'modal-are-you-sure' : 'modal-are-you-sure btn-core';
      //old code logic
      Swal.fire({
        icon: "warning",
        input: "number",
        showClass: {
          popup: `
              swal2-modal-primary
            `
        },
        html: `<div>
                   <h2>Edit ${totalrecords} transactions?</h2>
                   <p>You're editing multiple transactions.</p>
                   <span>To continue, type the amount of transactions you selected. </span>
               </div>`,
        showCloseButton: true,
        confirmButtonText: btnTxt,
        confirmButtonColor: '#7b5bc4',
        customClass: { confirmButton: btnClass, },

        onOpen: function () {
        },
        didOpen: () => {
          $(".swal2-actions").on('click', () => $("#swal2-content + .swal2-input").focus());
        },
        inputValidator: (value: any) => {
          if (value != totalrecords) {
            return 'Count entered does not match selected count"!';
          } else {
          }
        },

      }).then((result) => {
        if (result.value) {
          this.isloading = true;
          if (!this.commonMethodService.isfeatureSetting) {
            this.onUpgrade();
            this.isloading = false;
            return
          }
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
            title: this.commonMethodService.getTranslate('CANCELLED'),
            text: this.commonMethodService.getTranslate('WARNING_SWAL.NO_ACTION_TAKEN'),
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      });
    }
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
    modalRef.componentInstance.Info = { type: "Payment", recordSelectedArray: this.recordSelectedArray };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    modalRef.componentInstance.List = objRes.list;
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
    resultArray.forEach(element => {
      if (element.defaultAddress != null && element.defaultAddress.indexOf(',') > -1) {
        element.defaultAddress = element.defaultAddress.replaceAll(',', '');
      }
    });

    modalRef.componentInstance.Info = { type: "Payment", recordSelectedArray: this.recordSelectedArray };
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
    modalRef.componentInstance.List = listMailData;
    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }

  AdvanceRetryPaymentAction() {
    var resultArray = [];
    var totalrecords = this.retrySelectedArray.length;
    for (const item of this.retrySelectedArray) {
      var paymentDetails = this.gridFilterData.find((x) => x.paymentId == item);
      if (paymentDetails) {
        let { paymentId, scheduleNum } = paymentDetails;
        if (scheduleNum == null) {
          Swal.fire({
            title: "This function can only be used on payments from schedule",
            icon: "info",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          return false;
        } else {
          resultArray.push(paymentId);
        }
      }
    }
    if (resultArray.length > 1) {
      var title = totalrecords + " Payments selected";
      Swal.fire({
        title: title,
        text: this.commonMethodService.getTranslate('WARNING_SWAL.TEXT'),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, retry it!",
        cancelButtonText: this.commonMethodService.getTranslate('CANCEL'),
        customClass: {
          confirmButton: "btn_retry",
        },
      }).then((result) => {
        if (result.value) {
          this.isloading = true;
          const formData = {
            PaymentId: null,
            UpdatedBy: this.localstoragedataService.getLoginUserId(),
            WalletId: null,
            PaymentIds: resultArray,
          };

          this.paymentService.RetryPayment(formData).subscribe((res) => {
            if (res) {
              this.isloading = false;
              Swal.fire({
                title: "",
                html: res.errorMessage,
                icon: res.isSucceed == false ? "error" : "success",
                confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.retrySelectedArray = [];
              this.recordSelectedArray = [];
              this.isSelected = false;
              if (res.isSucceed) {
                this.commonMethodService.sendPaymentTrans(true);
              }
            }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
      });
    }
  }

  selectRecord(event, type, paymentId, paymentStatus = null) {
    if (type == "selectAll") {
      this.isBulkCheckbox = true;
      this.isSelectPopupShow = false;
      if (event.target.checked) {
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.gridFilterData.map(element => {
          if (
            element.paymentStatus == "Declined" ||
            element.paymentStatus == "Error"
          ) {
            this.isRetrySelected = true;
            this.retrySelectedArray.push(element.paymentId);
          }
          this.recordSelectedArray.push(element.paymentId);
        })
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
  checkselectRecord(paymentId): Boolean {
    if (
      !this.displayThisPageArray.includes(paymentId) &&
      this.isSelectPopupShow
    ) {
      this.displayThisPageArray.push(paymentId);
    }
    return this.recordSelectedArray.includes(paymentId);
  }

  VoidPayment(paymentId, status, currencyAmount = 0, paymentType) {
    if (status == "batched" || status == "Declined" || status == "Error") {
      this.deletePayment(paymentId, status);
    } else {
      var paymentDetails = this.gridFilterData.filter(
        (x) => x.paymentId == paymentId
      );
      if (paymentDetails && paymentDetails[0].batchNum) {
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
                if (parseFloat(value) > parseFloat(currencyAmount.toString())) {
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
          title: this.commonMethodService.getTranslate('WARNING_SWAL.TITLE'),
          text: this.commonMethodService.getTranslate('WARNING_SWAL.TEXT'),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT'),
          cancelButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT'),
        }).then((result) => {
          if (result.value) {
            this.isloading = true;
            var objVoidPayment = {
              paymentId: paymentId,
              loginUserId: this.localstoragedataService.getLoginUserId(),
              macAddress: this.localstoragedataService.getLoginUserGuid(),
              eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            };
            this.paymentService.VoidPayment(objVoidPayment).subscribe(
              (res: any) => {
                this.isloading = false;
                if (res) {
                  res.message = res.message
                    ? res.message.replaceAll("<br/>", "")
                    : res.message;
                  if (res.status == "Success") {
                    let transformedText = this.getTransformedText(res.message);
                    Swal.fire({
                      title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                      text: paymentType == 'Cash' ? this.commonMethodService.getTranslate(transformedText) : res.message,
                      icon: "success",
                      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                      customClass: {
                        confirmButton: "btn_ok",
                      },
                    });
                    this.commonMethodService.sendPaymentTrans(true);
                  } else if (res.status == "Error") {
                    this.deletePayment(paymentId, res.message, currencyAmount);
                  } else {
                    Swal.fire({
                      title: this.commonMethodService.getTranslate('WARNING_SWAL.TRY_AGAIN'),
                      text: res.errorResponse,
                      icon: "error",
                      confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
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
                  title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
                  text: error.error,
                  icon: "error",
                  confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
              }
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
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
        });
      }
    }
  }

  getTransformedText(value) {
    return this.commonMethodService.transformText(value);
  }

  editPaymentPopup(paymentId, paymentType, refNum) {

    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_payment",
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
        modalRef.componentInstance.EditPaymentData = res;
        modalRef.componentInstance.EditPaymentTypeRefNum = {
          paymentType: paymentType,
          refNum: refNum,
        };
      });
  }

  public getPaymentTransactionExcelData() {
    this.isloading = true;

    var objsearchPaymentTrans;
    if (this.paymentMode == true) {
      objsearchPaymentTrans = {
        paymentId: this.paymentId,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        fromDate:
          this.selectedDateRange && this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange && this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
    } else {
      objsearchPaymentTrans = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        from:
          this.selectedDateRange && this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        to:
          this.selectedDateRange && this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
    }
    this.paymentTransactionService
      .getTransactionData(objsearchPaymentTrans)
      .subscribe(
        (res: any) => {
          let results = res && res.paymentTransGridModel;
          const fiterResults = results.filter((o) => {
            if (!this.objAdvancedSearch) {
              return true;
            }
            return this.inAllFields(o);
          });

          this.downloadExcel(this.gridFilterData);
        });
  }

  downloadExcel(results) {
    let data = [];
    this.isdownloadExcelGuid = this.commonMethodService.idDownloadExcelEventGuid();
    let addressValue: { houseNumber: string, streetName: string, apartment: string };
    if (results) {
      Object.values(results).forEach((item: any, i) => {
        let cityStateZipArr = [];
        if (item && item.cityStateZip) {
          cityStateZipArr = this.getCityStateZip(item.cityStateZip);
          if (cityStateZipArr && cityStateZipArr.length === 2) cityStateZipArr.splice(1, 0, '');
        }

        addressValue = this.getAddress(item.address);

        let ReceiptNo = item && item.receiptNum;
        let DateTime = item && item.paymentDateTime;
        let Amount = item && this.commonMethodService.formatAmount(item.amount);
        let PaymentType = item && item.paymentType;
        let RefNum = item && item.refNum;
        let Approval = item && item.approval;
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let AdditionalAmount = item && item.addionalAmount;
        let AccountNum = item && item.accountNum;
        let Collector = item && item.colectorName;
        let CreatedDate = item && item.createdDate;
        let Campaign = item && item.campaignName;
        let PaymentStatus = item && item.paymentStatus;
        let Reason = item && item.reasonName;
        let ReasonNum = item && item.reasonNum;
        let PhoneNumber = item && item.phoneNumbers;
        let Device = item && item.device;
        let Location = item && item.locationName;
        let Note = item && item.note;
        let ScheduleNo = item && item.scheduleNum;
        let ScheduleInfo = item && item.scheduleInfo;
        let CardHolderName = item && item.cardHolderName;
        let Address = item && item.address;
        let City = cityStateZipArr && cityStateZipArr[0];
        let State = cityStateZipArr && cityStateZipArr[1];
        let Zip = cityStateZipArr && cityStateZipArr[2];
        let Country = item && item.defaultCountry;
        let Email = item && item.emailAddresses;
        let Class = item && item.class;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;
        let BatchNum = item && item.batchNum;
        let Group = item && item.group;
        let Title = item && item.title;
        let FirstName = item && item.firstName;
        let LastName = item && item.lastName;
        let TitleJewish = item && item.titleJewish;
        let FirstNameJewish = item && item.firstNameJewish;
        let LastNameJewish = item && item.lastNameJewish;
        let SuffixJewish = item && item.suffixJewish;
        let PledgePayment =
          item && this.commonMethodService.formatAmount(item.pledgePayment);
        let CurrencyAmount =
          item && this.formatAmount(item.currencyAmount, item.currencyName);
        let CurrencyName = item && item.currencyName;
        let GatewayBatchNum = item && item.gatewayBatchNum;
        let PaymentJewishDate = item && item.paymentJewishDate;
        let legalReceipt = item && item.legalReceiptNum

        let row = {};
        let identifier = 0;

        if (this.isPaymentReceiptNoColVisible) {
          row["Reciept #"] = ReceiptNo;
          identifier += 1;
        }
        if (this.isPaymentDateTimeColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('PAYMENTDATE') : "Payment Date";
          if (this.isdownloadExcelGuid) {
            row[ColName] = {
              v: this.datePipe.transform(item.paymentDateTime, "name"),
              t: 'd' // 'd' indicates the cell should be treated as a date type in Excel
            };
          } else {
            row[ColName] = this.datePipe.transform(item.paymentDateTime, "name");
          }
          identifier += 1;
        }
        if (this.isPaymentFullNameJewishColVisible) {
          row["Donor Jewish Name"] = FullNameJewish;
          identifier += 1;
        }
        if (this.isPaymentCreatedDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('CREATEDDATETIME') : "Created Date & Time";
          if (this.isdownloadExcelGuid) {
            row[ColName] = {
              v: this.datePipe.transform(item.createdDate, "name-long"),
              t: 'd'
            };
          } else {

            row[ColName] = this.datePipe.transform(item.createdDate, "name-long");
          }
          identifier += 1;
        }
        if (this.isPaymentAmountColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('AMOUNT') : "Amount";
          row[ColName] = Number(item.currencyAmount)
          identifier += 1;
        }
        if (this.isPaymentTypeColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('PAYMENTTYPE') : "Payment Type";
          row[ColName] = PaymentType;
          identifier += 1;
        }
        if (this.isLegalRecieptColVisible) {
          row["Legal Receipt"] = legalReceipt;
          identifier += 1;
        }
        if (this.isPaymentApprovalColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('APPROVAL') : "Approval";
          row[ColName] = Approval;
          identifier += 1;
        }
        if (this.isPaymentRefNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('REF#') : "Ref #";
          row[ColName] = RefNum;
          identifier += 1;
        }
        if (this.isPaymentStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('STATUS') : "Status";
          row[ColName] = PaymentStatus;
        }
        if (this.isPaymentScheduleNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('SCHEDULE#') : "Schedule #";
          row[ColName] = ScheduleNo;
        }
        if (this.isPaymentScheduleInfoColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('SCHEDULEINFO') : "Schedule Info";
          row[ColName] = ScheduleInfo;
        }
        if (this.isPaymentCardHolderColVisible) {
          row["Card Holder Name"] = CardHolderName;
        }
        if (this.isPaymentNoteColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('NOTE') : "Note";
          row[ColName] = Note;
        }
        if (this.isPaymentCampaignColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('CAMPAIGN') : "Campaign";
          row[ColName] = Campaign;
        }
        if (this.isPaymentReasonColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('REASON') : "Reason";
          row[ColName] = Reason;
        }
        if (this.isPaymentReasonNumColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('REASON#') : "Reason#";
          row[ColName] = ReasonNum;
        }
        if (this.isPaymentLocationColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('LOCATION') : "Location";
          row[ColName] = Location;
        }

        if (this.isPaymentCollectorColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('COLLECTOR') : "Collector";
          row[ColName] = Collector;
        }
        if (this.isPaymentDeviceColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('SOURCE') : "Source";
          row[ColName] = Device;
        }

        if (this.isPaymentAccountNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('ACCOUNT#') : "Account #";
          row[ColName] = AccountNum;
        }

        if (this.isPaymentFullNameColVisible) {
          row["Donor English Name"] = FullName;
        }
        if (this.isPaymentAddressColVisible) {
          row["House Num"] = addressValue && addressValue.houseNumber || '';
          row["Street Name"] = addressValue && addressValue.streetName || '';
          row["Apt"] = addressValue && addressValue.apartment || '';
        }
        if (this.isPaymentCityStateZipColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('CITY') : "City";
          row[ColName] = City;
          let ColName2: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('STATE') : "State";
          row[ColName2] = State;
          let ColName3: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('ZIP') : "Zip";
          row[ColName3] = Zip;
          let ColName4: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('COUNTRY') : "Country";
          row[ColName4] = Country;
        }
        if (this.isPaymentPhoneNumberColVisible) {
          const string = item.phoneLabels && item.phoneLabels.trim();
          const substring = ",";
          if (string != null && string.includes(substring)) {
            var res = string.split(",");
            const sub1 = PhoneNumber.trim();

            for (let index = 0; index < res.length; index++) {
              const element = res[index];
              row[element.trim()] = sub1.includes(substring)
                ? sub1.split(",")[index]
                : "";
            }
          } else {
            row[item.phoneLabels] = PhoneNumber;
          }
        }
        if (this.isPaymentEmailColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('EMAIL') : "Email";
          row[ColName] = Email;
        }
        if (this.isPaymentBatchNumColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('BATCH#') : "Batch #";
          row[ColName] = BatchNum;
        }
        if (this.isPaymentGroupColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('GROUP') : "Group";
          row[ColName] = Group;
        }
        if (this.isPaymentClassColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('CLASS') : "Class";
          row[ColName] = Class;
        }
        if (this.isPaymentFatherColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('FATHER') : "Father";
          row[ColName] = Father;
        }
        if (this.isPaymentFatherInLawColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('FATHERINLAW') : "Father in law";
          row[ColName] = FatherInLaw;
        }
        //added new
        if (this.isPaymentEnglishTitleColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('ENGLISHTITLE') : "English Title";
          row[ColName] = Title;
        }
        if (this.isPaymentFirstNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('ENGLISHFIRSTNAME') : "English First name";
          row[ColName] = FirstName;
        }
        if (this.isPaymentLastNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('ENGLISHLASTNAME') : "English Last name";
          row[ColName] = LastName;
        }
        if (this.isPaymentTitleJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('YIDDISHFIRSTTITLE') : "Yiddish First Title";
          row[ColName] = TitleJewish;
        }
        if (this.isPaymentFirstNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('YIDDISHFIRSTNAME') : "Yiddish First name";
          row[ColName] = FirstNameJewish;
        }
        if (this.isPaymentLastNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('YIDDISHLASTNAME') : "Yiddish Last name";
          row[ColName] = LastNameJewish;
        }
        if (this.isPaymentSuffixJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('YIDDISHLASTTITLE') : "Yiddish Last Title";
          row[ColName] = SuffixJewish;
        }
        if (this.isPledgePaymentColVisible) {
          row["Amount applied"] = PledgePayment;
        }
        if (this.isCurrencyAmountColVisible) {
          row["Converted Amount"] = Amount;

        }
        if (this.isCurrencyTypeColVisible) {
          row["Currency Type"] = CurrencyName;
        }
        if (this.isTagsColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('TAGS') : "Tags";
          row[ColName] = item.tagNames;
        }
        if (this.isGateWayBatchColVisible) {

          row["Gateway batch#"] = GatewayBatchNum;
        }
        if (this.isPaymentJewishDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid ? this.commonMethodService.getColName('HEBREWDATE') : "Hebrew Date";
          row[ColName] = PaymentJewishDate;
        }
        if (
          item.advancedFieldNameAndValue &&
          item.advancedFieldNameAndValue.length > 0
        ) {
          for (
            let index = 0;
            index < item.advancedFieldNameAndValue.length;
            index++
          ) {
            const element = item.advancedFieldNameAndValue[index];
            if (this.isCheckedFieldsLabel(element.fieldname, 1)) {
              if (element.fieldValue && element.fieldValue != 'null') {
                row[element.fieldname] = element.fieldValue;
              }
            }
          }
        }
        data.push(row);
      });

      const filename = this.xlsxService.getFilename("Transaction Payment List");

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
        cellStyles: true,
        cellDates: true,
      });

      var range = XLSX.utils.decode_range(worksheet["!ref"]);

      // Find Amount, payment Date and Payment Created column
      let amountColumn = null;
      let paymentDateColumn = null;
      let paymentCreatedAndTimeColumn = null;
      let currencyAmountColumn = null;
      for (var R = range.s.r; R < 1; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
          var cell_address = { c: C, r: R };
          var cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!worksheet[cell_ref]) continue;
          if (worksheet[cell_ref].v == "Amount") {
            amountColumn = C;
          }

          if (worksheet[cell_ref].v == "Payment Date") {
            paymentDateColumn = C;
          }

          if (worksheet[cell_ref].v == "Created Date & Time") {
            paymentCreatedAndTimeColumn = C;
          }

          if (worksheet[cell_ref].v == "Converted Amount") {
            currencyAmountColumn = C;
          }
        }
      }

      let fmt = '"$"#,##0.00_);\\("$"#,##0.00\\)';
      let _currencyFormat = '$#,##0.00';
      for (var R = range.s.r; R <= range.e.r; ++R) {
        if (R == 0) continue;
        if (!!amountColumn) {
          let amount_cell_address = { c: amountColumn, r: R };
          let amount_cell_ref = XLSX.utils.encode_cell(amount_cell_address);
          if (worksheet[amount_cell_ref]) {
            worksheet[amount_cell_ref].t = "n";
            //worksheet[amount_cell_ref].z = fmt;
            worksheet[amount_cell_ref].z = _currencyFormat;

          }
        }

        if (!!paymentDateColumn) {
          let payment_date_cell_address = { c: paymentDateColumn, r: R };
          let payment_date_cell_ref = XLSX.utils.encode_cell(
            payment_date_cell_address
          );
          if (worksheet[payment_date_cell_ref]) {
            worksheet[payment_date_cell_ref].t = "d";
          }
        }

        if (!!paymentCreatedAndTimeColumn) {
          let payment_create_date_cell_address = {
            c: paymentCreatedAndTimeColumn,
            r: R,
          };
          let payment_create_date_cell_ref = XLSX.utils.encode_cell(
            payment_create_date_cell_address
          );
          if (worksheet[payment_create_date_cell_ref]) {
            worksheet[payment_create_date_cell_ref].t = "d";
          }
        }
        if (!!currencyAmountColumn) {
          let currencyAmount_cell_address = { c: currencyAmountColumn, r: R };
          let currencyAmount_cell_ref = XLSX.utils.encode_cell(
            currencyAmount_cell_address
          );

          if (worksheet[currencyAmount_cell_ref]) {
            // worksheet[currencyAmount_cell_ref].t = "n";
            worksheet[currencyAmount_cell_ref].t = "s";
            worksheet[currencyAmount_cell_ref].z = fmt;
          }
        }
      }

      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ["data"],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
      });


      const excelData: Blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      FileSaver.saveAs(excelData, filename);
      this.isloading = false;
      this.cdr.detectChanges();
    } else {
      return;
    }
  }

  RetryPayment(paymentId, walletId) {
    this.isRetryClicked = true
    this.isloading = true;
    const objRetryPayment = {
      PaymentId: paymentId,
      WalletId: walletId,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      uniqueTransactionId: this.commonMethodService.generateUniqueTransactionId()
    };

    this.paymentService.RetryPayment(objRetryPayment).subscribe(
      (res: any) => {
        this.isRetryClicked = false
        this.isloading = false;
        if (res.paymentStatus === "Success") {
          Swal.fire({
            title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
            text: "Payment done successfully",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.searchPaymentTransactionsData();
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate('WARNING_SWAL.TRY_AGAIN'),
            text: res.errorResponse,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
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

  getCityStateZip(cityStateZip: string) {

    let CSZLength: number = cityStateZip.split(" ").length;
    let CSZArr: string[] = [];
    if (CSZLength > 3) {
      const input = cityStateZip;
      CSZArr = input.match(/.*?,.*?\s*,|\b\d{5}\b|[A-Za-z\s]+[A-Za-z]{2}/g);
      return CSZArr
    }

    else if (/^\d+$/.test(cityStateZip)) {
      CSZArr[2] = cityStateZip
      return CSZArr;
    }
    else return cityStateZip.split(" ")

  }

  getAddress(address: string) {
    const regex = /^(?<houseNumber>-?\s*\d+(?:(\s|\-)+\d+)*)\s+(?<streetName>[A-Za-z0-9]+.*?)\s*(?<apartment>[A-Za-z0-9]*[^\s]*)?$/;
    const match = address?.match(regex);

    if (match) {
      return {
        houseNumber: match.groups.houseNumber ? match.groups.houseNumber.trim() : null,
        streetName: match.groups.streetName ? match.groups.streetName.trim() : null,
        apartment: match.groups.apartment ? match.groups.apartment.trim() : null
      };
    } else {
      return null;
    }
  }

  removeProperty() {
    var results = this.gridFilterData;

    if (this.isPaymentReceiptNoColVisible) {
      this.printHeader.push("Reciept #");
    }
    if (this.isPaymentDateTimeColVisible) {
      this.printHeader.push("Payment Date");
    }
    if (this.isPaymentCreatedDateColVisible) {
      this.printHeader.push("Created Date & Time");
    }
    if (this.isPaymentFullNameJewishColVisible) {
      this.printHeader.push("Donor Jewish Name");
    }
    if (this.isPaymentAmountColVisible) {
      this.printHeader.push("Amount");
    }
    if (this.isPaymentTypeColVisible) {
      this.printHeader.push("Payment Type");
    }
    if (this.isPaymentApprovalColVisible) {
      this.printHeader.push("Approval");
    }
    if (this.isPaymentRefNoColVisible) {
      this.printHeader.push("Ref #");
    }
    if (this.isPaymentStatusColVisible) {
      this.printHeader.push("Status");
    }
    if (this.isPaymentScheduleNoColVisible) {
      this.printHeader.push("Schedule #");
    }
    if (this.isPaymentScheduleInfoColVisible) {
      this.printHeader.push("Schedule Info");
    }
    if (this.isPaymentCardHolderColVisible) {
      this.printHeader.push("Card Holder Name");
    }
    if (this.isPaymentNoteColVisible) {
      this.printHeader.push("Note");
    }
    if (this.isPaymentCampaignColVisible) {
      this.printHeader.push("Campaign");
    }
    if (this.isPaymentReasonColVisible) {
      this.printHeader.push("Reason");
    }
    if (this.isPaymentReasonNumColVisible) {
      this.printHeader.push("Reason #");
    }
    if (this.isPaymentLocationColVisible) {
      this.printHeader.push("Location");
    }

    if (this.isPaymentCollectorColVisible) {
      this.printHeader.push("Collector");
    }
    if (this.isPaymentDeviceColVisible) {
      this.printHeader.push("Device");
    }

    if (this.isPaymentAccountNoColVisible) {
      this.printHeader.push("Account #");
    }

    if (this.isPaymentFullNameColVisible) {
      this.printHeader.push("Donor English Name");
    }
    if (this.isPaymentAddressColVisible) {
      this.printHeader.push("Address");
    }
    if (this.isPaymentCityStateZipColVisible) {
      this.printHeader.push("City State Zip");
    }
    if (this.isPaymentPhoneNumberColVisible) {
      this.printHeader.push("Phone Number");
    }

    if (this.isPaymentEmailColVisible) {
      this.printHeader.push("Email");
    }
    if (this.isPaymentBatchNumColVisible) {
      this.printHeader.push("Batch #");
    }
    if (this.isPaymentGroupColVisible) {
      this.printHeader.push("Group");
    }
    if (this.isPaymentClassColVisible) {
      this.printHeader.push("Class");
    }
    if (this.isPaymentFatherColVisible) {
      this.printHeader.push("Father");
    }
    if (this.isPaymentFatherInLawColVisible) {
      this.printHeader.push("Father in law");
    }

    if (results) {
      Object.values(results).forEach((item: any) => {
        let ReceiptNo = item && item.receiptNum;
        let DateTime = item && item.paymentDateTime;
        let Amount = item && item.amount;
        let PaymentType = item && item.paymentType;
        let RefNum = item && item.refNum;
        let Approval = item && item.approval;
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let AdditionalAmount = item && item.addionalAmount;
        let AccountNum = item && item.accountNum;
        let Collector = item && item.colectorName;
        let CreatedDate = item && item.createdDate;
        let Campaign = item && item.campaignName;
        let PaymentStatus = item && item.paymentStatus;
        let Reason = item && item.reasonName;
        let ReasonNum = item && item.reasonNum;
        let PhoneNumber = item && item.phoneNumbers;
        let Device = item && item.device;
        let Location = item && item.locationName;
        let Note = item && item.note;
        let ScheduleNo = item && item.scheduleNum;
        let ScheduleInfo =
          item && this.commonMethodService.formatAmount(item.amount);
        let CardHolderName = item && item.cardHolderName;
        let Address = item && item.address;
        let City = item && item.defaultCity;
        let State = item && item.defaultState;
        let Zip = item && item.defaultZip;
        let Country = item && item.defaultCountry;
        let Email = item && item.emailAddresses;
        let BatchNum = item && item.batchNum;
        let Class = item && item.class;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;
        let Group = item && item.group;

        let row = {};
        if (this.isPaymentReceiptNoColVisible) {
          row["Reciept #"] = ReceiptNo;
        }
        if (this.isPaymentDateTimeColVisible) {
          row["Payment Date"] = this.datePipe.transform(
            item.paymentDateTime,
            "name"
          );
        }
        if (this.isPaymentCreatedDateColVisible) {
          row["Created Date & Time"] = this.datePipe.transform(
            item.createdDate,
            "name-long"
          );
        }
        if (this.isPaymentFullNameJewishColVisible) {
          row["Donor Jewish Name"] = FullNameJewish;
        }
        if (this.isPaymentAmountColVisible) {
          row["Amount"] = this.commonMethodService.formatAmount(item.currencyAmount);
        }
        if (this.isPaymentTypeColVisible) {
          row["Payment Type"] = PaymentType;
        }
        if (this.isPaymentApprovalColVisible) {
          row["Approval"] = Approval;
        }
        if (this.isPaymentRefNoColVisible) {
          row["Ref #"] = RefNum;
        }
        if (this.isPaymentStatusColVisible) {
          row["Status"] = PaymentStatus;
        }
        if (this.isPaymentScheduleNoColVisible) {
          row["Schedule #"] = ScheduleNo;
        }
        if (this.isPaymentScheduleInfoColVisible) {
          row["Schedule Info"] = ScheduleInfo;
        }
        if (this.isPaymentCardHolderColVisible) {
          row["Card Holder Name"] = CardHolderName;
        }
        if (this.isPaymentNoteColVisible) {
          row["Note"] = Note;
        }
        if (this.isPaymentCampaignColVisible) {
          row["Campaign"] = Campaign;
        }
        if (this.isPaymentReasonColVisible) {
          row["Reason"] = Reason;
        }

        if (this.isPaymentReasonNumColVisible) {
          row["Reason #"] = ReasonNum;
        }
        if (this.isPaymentLocationColVisible) {
          row["Location"] = Location;
        }

        if (this.isPaymentCollectorColVisible) {
          row["Collector"] = Collector;
        }
        if (this.isPaymentDeviceColVisible) {
          row["Device"] = Device;
        }

        if (this.isPaymentAccountNoColVisible) {
          row["Account #"] = AccountNum;
        }

        if (this.isPaymentFullNameColVisible) {
          row["Donor English Name"] = FullName;
        }
        if (this.isPaymentAddressColVisible) {
          row["Address"] = Address;
        }
        if (this.isPaymentCityStateZipColVisible) {
          row["City"] = City;
          row["State"] = State;
          row["Zip"] = Zip;
          row["Country"] = Country;
        }
        if (this.isPaymentPhoneNumberColVisible) {
          row["Phone Number"] = PhoneNumber;
        }

        if (this.isPaymentEmailColVisible) {
          row["Email"] = Email;
        }
        if (this.isPaymentBatchNumColVisible) {
          row["Batch #"] = BatchNum;
        }
        if (this.isPaymentGroupColVisible) {
          row["Group"] = Group;
        }
        if (this.isPaymentClassColVisible) {
          row["Class"] = Class;
        }
        if (this.isPaymentFatherColVisible) {
          row["Father"] = Father;
        }
        if (this.isPaymentFatherInLawColVisible) {
          row["Father in law"] = FatherInLaw;
        }
        this.printData.push(row);
      });
    }
  }

  buildTableBody(data, columns) {
    var body = [];

    body.push(columns);

    data.forEach(function (row) {
      var dataRow = [];

      columns.forEach(function (column) {
        dataRow.push(row[column]);
      });

      body.push(dataRow);
    });

    return body;
  }

  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        body: this.buildTableBody(data, columns),
      },
    };
  }

  PrintPdf() {
    this.removeProperty();
    var docDefinition = {
      content: [
        {
          text: "Payment Transaction",
          style: "header",
          layout: "lightHorizontalLines",
        },
        this.table(this.printData, this.printHeader),
      ],
    };

    pdfMake.tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) {
          if (i === 0 || i === node.table.body.length) {
            return 0;
          }
          return i === node.table.headerRows ? 2 : 1;
        },
        vLineWidth: function (i) {
          return 0;
        },
        hLineColor: function (i) {
          return i === 1 ? "black" : "#aaa";
        },
        paddingLeft: function (i) {
          return i === 0 ? 0 : 4;
        },
        paddingRight: function (i, node) {
          return i === node.table.widths.length - 1 ? 0 : 4;
        },
      },
    };

    pdfMake.createPdf(docDefinition).print();
  }

  // local filter
  isContain(val: string, search: string) {
    if (!search) {
      return true;
    }
    return (
      val &&
      val.toString().toLowerCase().indexOf(search.toString().toLowerCase()) > -1
    );
  }

  filterLocalData(data = this.gridData) {
    this.gridFilterData = data.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      return this.inAllFields(o);
    });
  }

  localSumCalCulation(data = this.gridFilterData) {
    this.calculateAllSumByFields(data);
    this.sumByWeekPayments = this.commonMethodService.getSumByWeekPayments(
      data,
      "paymentDateTime",
      "amount"
    );
    this.sumByMonthPayments = this.commonMethodService.getSumByMonthPayments(
      data,
      "paymentDateTime",
      "amount"
    );
    this.sumByYearPayments = this.commonMethodService.getSumByYearPayments(
      data,
      "paymentDateTime",
      "amount"
    );
    data.forEach((campaign) => {
      campaign.amount = campaign.amountt != undefined ? campaign.amountt : campaign.amount;
    })
    this.cardTypeChange(this.cardType);
    this.changeSortType(this.sortType);
    this.recordSelectedArray = [];
    this.initMultiSelect();
    this.totalRecord = data.length;
  }

  inAllFields(o) {
    return (
      this.isContain(o.fullName, this.objAdvancedSearch.fullName) &&
      this.isContain(o.street, this.objAdvancedSearch.street) &&
      this.isContain(o.group, this.objAdvancedSearch.group) &&
      this.isContain(o.class, this.objAdvancedSearch.class) &&
      this.isContain(o.note, this.objAdvancedSearch.note) &&
      this.isContain(o.phoneNumbers, this.objAdvancedSearch.phone) &&
      this.isContain(o.emailAddresses, this.objAdvancedSearch.email) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.city) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.state) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.zip) &&
      this.inArrayValue(this.objAdvancedSearch.cities, o.cityStateZip) &&
      this.inArrayValue(this.objAdvancedSearch.zips, o.cityStateZip) &&
      this.inMinAmount(o) &&
      this.inMaxAmount(o) &&
      this.inMinDate(o) &&
      this.inMaxDate(o) &&
      this.inBatch(o) &&
      this.inArray(this.objAdvancedSearch.donors, o.accountId) &&
      this.inArrayNew(this.objAdvancedSearch.collectors, o.collectorId, o, 'collector') &&
      this.inArrayCampaign(this.objAdvancedSearch.campaigns, o.campaignId, o) &&
      this.inArray(this.objAdvancedSearch.paymentTypes, o.paymentTypeId) &&
      this.inArrayReason(this.objAdvancedSearch.paymentReason, o.reasonId, o) &&
      this.inArray(this.objAdvancedSearch.paymentDevices, o.deviceId) &&
      this.inArray(this.objAdvancedSearch.paymentStatus, o.paymentStatusId) &&
      this.inArrayNew(this.objAdvancedSearch.locations, o.locationId, o, 'location') &&
      this.inArrayValue(this.objAdvancedSearch.approvals, o.approval) &&
      this.inAdavcedFieldArrayNew(
        this.objAdvancedSearch.AdvancedFields,
        o.advancedFieldArray
      ) &&
      this.inArray(this.objAdvancedSearch.deviceTypes, o.sourceTypeId) &&
      this.inArrayValue(this.objAdvancedSearch.currencies, o.currencyName)
    );
  }

  inMinAmount(o) {
    if (!this.objAdvancedSearch.minAmount) {
      return true;
    }

    return o.amount >= this.objAdvancedSearch.minAmount;
  }

  inMaxAmount(o) {
    if (!this.objAdvancedSearch.maxAmount) {
      return true;
    }

    return o.amount <= this.objAdvancedSearch.maxAmount;
  }

  inMinDate(o) {
    if (!this.objAdvancedSearch.createdDate) {
      return true;
    }

    return (
      moment(o.createdDate).format("YYYY-MM-DD") >=
      moment(this.objAdvancedSearch.createdDate.startDate).format("YYYY-MM-DD")
    );
  }

  inMaxDate(o) {
    if (!this.objAdvancedSearch.createdDate) {
      return true;
    }

    return (
      moment(o.createdDate).format("YYYY-MM-DD") <=
      moment(this.objAdvancedSearch.createdDate.endDate).format("YYYY-MM-DD")
    );
  }

  inArray(filterKeyArray: Array<{ id: number }> | null, rowFieldValue: any) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const result = filterKeyArray.find((d) => d.id == rowFieldValue);

    if (result) {
      return true;
    }
    return false;
  }
  inArrayNew(filterKeyArray: Array<{ id: number }> | null, rowFieldValue: any, o, type: string) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const found = filterKeyArray.some(el => {
      if (type == "collector") {
        if (el.id === -1) {
          return o.collectorId === null;
        }
      }
      if (type == "location") {
        if (el.id === -1) {
          return o.locationId === null;
        }
      }
      if (el.id == rowFieldValue) {
        return true;
      }
      return false;
    });
    return found;
  }

  inArrayValue(
    filterKeyArray: Array<{ itemName: string }> | null,
    rowFieldValue: string | null
  ) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }

    const result = filterKeyArray.find((d) =>
      this.isContain(rowFieldValue, d.itemName)
    );
    if (result) {
      return true;
    }
    return false;
  }

  inArrayKey(
    filterKeyArray: Array<{ id: string | null }> | null,
    rowFieldValue: string | null
  ) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const result = filterKeyArray.find((d) =>
      this.isContain(rowFieldValue, d.id)
    );
    if (result) {
      return true;
    }
    return false;
  }

  inAdavcedFieldArray(
    filterKeyArray: Array<{ value: string | null }> | null,
    rowFieldValue: string | null
  ) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }

    const result = filterKeyArray.find((d) =>
      this.isContain(rowFieldValue, d.value)
    );
    if (result) {
      return true;
    }
    return false;
  }

  inAdavcedFieldArrayNew(
    filterKeyArray: Array<{ value: string | null; name: string | null }> | null,
    rowFieldArray: Array<{ fieldName: string; fieldValue: string }>
  ) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }

    if (!rowFieldArray || rowFieldArray.length === 0) {
      return false;
    }

    const myArrayFiltered = rowFieldArray.filter((el) => {
      return filterKeyArray.some((f) => {
        return (
          this.isContain(el.fieldName, f.name) &&
          this.isContain(el.fieldValue, f.value)
        );
      });
    });

    if (myArrayFiltered.length !== 0) {
      return true;
    }

    return false;

  }

  inBatch(o) {
    if (!this.objAdvancedSearch) {
      return true;
    }

    if (this.objAdvancedSearch.batchNum) {
      return o.batchNum === this.objAdvancedSearch.batchNum;
    }

    if (this.objAdvancedSearch && this.objAdvancedSearch.isBatchClicked) {
      return !o.batchNum;
    }

    return true;
  }
  //Generate Payment Report
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

  onPaymentCustomReport() {
    var id_filter = this.recordSelectedArray;
    var filtered = this.gridFilterData.filter(function (item) {
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
    modalRef.componentInstance.SelectedIds = this.recordSelectedArray; //countResult;
    modalRef.componentInstance.DropDownOptions = this.dropDownCustomReport;
    modalRef.componentInstance.selectedDate = this.selectedDateRange;
  }
  //
  onBulkStatement() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_statement_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkStatementPopupComponent,
      this.modalOptions
    );
    var resultArray = [];
    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridData.find((x) => x.paymentId == item);
      var te = donorDetails.accountId;
      resultArray.push(te);
    }
    modalRef.componentInstance.SelectedId = resultArray; //this.recordSelectedArray;
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Info = { type: "Statement" };
    modalRef.componentInstance.Duration = this.selectedDateRange;
  }
  deletePayment(paymentId, status, amount = 0) {
    if (
      status.includes("CardKnox Void Failed") ||
      status.includes("refund") ||
      status.includes("credit") ||
      status.includes("Payment api key info not found") ||
      status.includes("Matbia Void Failed") ||
      status.includes("OneGiv could not be supported void")
    ) {
      Swal.fire({
        title: this.commonMethodService.getTranslate('WARNING_SWAL.TITLE'),
        html:
          status +
          "<br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Delete",
        denyButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT'),
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
              if (parseFloat(value) > parseFloat(amount.toString())) {
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
                title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                text: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.commonMethodService.sendPaymentTrans(true)
              });
              ///
            },
            (err) => {
              this.isloading = false;
            }
          );
        } else if (result.isDenied) {
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
      });
    } else {
      Swal.fire({
        title: this.commonMethodService.getTranslate('WARNING_SWAL.TITLE'),
        html:
          status +
          "</br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT'),
        cancelButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT'),
      }).then((result) => {
        if (result.value) {
          var paymentIdsArray = [];
          paymentIdsArray.push(paymentId); //added new
          paymentIdsArray = paymentIdsArray.map((element) => {
            return element;
          });
          //let paymentIds=paymentIdsArray.join('&');
          this.paymentService.DeletePayment(paymentIdsArray).subscribe(
            (res: any) => {
              this.isloading = false;
              ///
              Swal.fire({
                title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                text: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                var objVoidPayment = {
                  paymentId: paymentId,
                  loginUserId: this.localstoragedataService.getLoginUserId(),
                  macAddress: this.localstoragedataService.getLoginUserGuid(),
                  eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
                  IsSkipGateway: true,
                };
                this.paymentService
                  .VoidPayment(objVoidPayment)
                  .subscribe((res: any) => {
                    if (res) {
                      res.message = res.message
                        ? res.message.replaceAll("<br/>", "")
                        : res.message;
                      if (res.status == "Success") {
                        Swal.fire({
                          title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                          text: res.message,
                          icon: "success",
                          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                          customClass: {
                            confirmButton: "btn_ok",
                          },
                        }).then(() => {
                          this.commonMethodService.sendPaymentTrans(true);
                        });
                      } else if (res.status == "Error") {
                        Swal.fire({
                          title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
                          text: res.message,
                          icon: "error",
                          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                          customClass: {
                            confirmButton: "btn_ok",
                          },
                        });
                      }
                    }
                  });
              });
              ///
            },
            (err) => {
              this.isloading = false;
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
      });
    }
  }

  onDeletePyament(paymentIdsArray) {
    paymentIdsArray = paymentIdsArray.map((element) => {
      element = element.replace("paymentIds=", "");
      return element;
    });
    // let paymentIds=paymentIdsArray.join('&');
    this.paymentService.DeletePayment(paymentIdsArray).subscribe(
      (res: any) => {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
          text: res,
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
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
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
          customClass: {
            confirmButton: "btn_ok",
          },
        }).then((result) => {
          this.commonMethodService.sendPaymentTrans(true);
        });
      }
    });
  }
  checkRefundAmount() {
  }
  // import
  changeText = "";
  file: File;
  reseteFile() {
    $("#doc_file").val("");
    $("#NotReadyToUpload").show();
    $("#readyToUpload").hide();
    this.changeText = "";
    this.file = null;
  }
  incomingfile(event) {
    this.file = event.target.files[0];
    this.readyToUploadChangeText();
  }
  readyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#NotReadyToUpload").show();
      $("#readyToUpload").hide();
      this.fileName = "";
    } else {
      $("#NotReadyToUpload").hide();
      $("#readyToUpload").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }
  downloadExcelTemplate(event) {
    this.paymentService.downloadPaymentTemplate().subscribe(
      (res: any) => {
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        let filename = "Payment_Template";
        var link = document.createElement("a");
        link.href = url;
        link.download = filename + ".xlsx";
        link.click();
      },
      (error) => {
        console.log(error);
        this.isloadingModel = false;
      }
    );
    event.preventDefault();
  }
  uploadExcelTemplate() {
    if (this.file !== undefined) {
      if (this.file != null) {
        this.isloadingModel = true;
        $("#import-data-donar").modal("hide");
        const fd = new FormData();
        fd.append("RequestId", "");
        fd.append("File", this.file);
        fd.append(
          "EventGuid",
          this.localstoragedataService.getLoginUserEventGuId()
        );
        fd.append("CreatedBy", this.localstoragedataService.getLoginUserId());
        this.paymentService.importPayments(fd).subscribe(
          (res) => {
            $("#doc_file").val("");
            this.file = null;
            this.reseteFile();
            this.isloadingModel = false;
            $("#localsearch").val("");
            Swal.fire({
              title: "",
              text: res + " see import updates in users email",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                this.searchPaymentTransactionsData();
              } else if (result.isDenied) {
              }
            });
          },
          (err) => {
            this.isloadingModel = false;
            Swal.fire({
              title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
              text: err.error,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        );
      } else {
        this.isloadingModel = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
          text: "No file chosen",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    } else {
      this.isloadingModel = false;
      Swal.fire({
        title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
        text: "No file chosen",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }
  //
  bindAdvanceFields() {
    const itemArr = [];

    this.gridData.map((x) => {

      const advancedFieldNames = x.advancedFieldNames
        ? x.advancedFieldNames.split(",")
        : null;


      if (advancedFieldNames) {
        for (let index = 0; index < advancedFieldNames.length; index++) {
          const element = advancedFieldNames[index];
          if (element) {
            let trimValue = this.advancedFieldService.formatFieldName(element);
            const foundIndex = itemArr.findIndex((x) => x.colName == trimValue);
            if (foundIndex == -1) {
              itemArr.push({
                colName: trimValue,
                isVisible: false,
                colId: trimValue.toLowerCase().replace(/\s/g, "") + "Id",
                sortName: trimValue,
                isAdvancedField: true
              });
            }
          }
        }
      }
    });

    //get visible adv. columns
    let selectedColumns = [];
    let AdvFields = this.colFields.filter((obj) => {
      if (obj.title && obj.title.indexOf("ADVANCEDFIELDS") > -1) {
        for (let index = 0; index < obj.items.length; index++) {
          if (obj.items[index].isVisible) {
            selectedColumns.push(obj.items[index]);
          }
        }
      }
    });


    //bind selected column
    itemArr.map(function (x) {
      let result = selectedColumns.filter((a1) => a1.colName == x.colName);
      if (result.length > 0) {
        x.isVisible = result[0].isVisible;

      }
      return x;
    });
    if (this.colFields[1].items.length == 0) {
      this.colFields = this.colFields.map((o) => {
        if (o.id !== 2) {
          return {
            ...o,
            items: o.items.map((oi) => {
              const isAdvancedField = itemArr.find((inObj) => { return inObj.colId === oi.colId })
              return {
                ...oi,
                isAdvancedField: isAdvancedField ? true : false
              }
            }),
          };
        }
        return {
          ...o,
          items: itemArr,
        };
      });
    }
    else {
      this.colFields = this.colFields.map((o) => {
        if (o.id !== 2) {
          return {
            ...o,
            items: o.items.map((oi) => {
              const isAdvancedField = itemArr.find((inObj) => { return inObj.colId === oi.colId })
              return {
                ...oi,
                isAdvancedField: isAdvancedField ? true : false
              }
            }),
          };
        }
        return {
          ...o,
          items: o.items.map((oi) => {
            const isAdvancedField = itemArr.find((inObj) => { return inObj.colName === oi.colName })
            return {
              ...oi,
              isAdvancedField: isAdvancedField ? true : false
            }
          }),
        };
      });

    }
    this.colFields.map((o) => {
      if (o.id == 2) {
        o.items = o.items.filter((obj) => obj.isAdvancedField == true)
      }
    })
  }

  dropGroupItem(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

  }


  checkGridAdvancedColVisibilityIfMove(id) {
    const advGroup = this.colFields.find((o) => {
      return o.id === 1;
    });
    if (!advGroup || !advGroup.items) {
      return false;
    }
    const as = advGroup.items.find((v) => {
      return v.colId === id && v.isVisible;
    });
    if (as) {
      return true;
    }

    return false;
  }

  checkGridAdvancedColVisibility(id) {
    const advGroup = this.colFields.find((o) => {
      return o.id === 2;
    });
    if (!advGroup || !advGroup.items) {
      return false;
    }
    const as = advGroup.items.find((v) => {
      return v.colId === id && v.isVisible;
    });
    if (as) {
      return true;
    }

    return false;
  }

  setGridAdvancedColVisibility(id) {
    const targetObject = this.colFields.find(o => o.id === 2);
    if (targetObject) {
      const targetItem = targetObject.items.find(v => v.colId === id);
      if (targetItem) {
        targetItem.isVisible = targetItem.isVisible;
      }
    }
  }


  viewOfAdvanceFieldValue(name, item) {
    if (!item) {
      return null;
    }

    if (!item.advancedFieldNameAndValue) {
      return null;
    }
    const field = item.advancedFieldNameAndValue.find((a) => {
      return a.fieldname === name;
    });

    if (field && field.fieldValue) {
      return field.fieldValue;
    }
  }

  checkIsAdvanceFieldColId(value) {
    return typeof value === 'number'
  }
  dropGroupItemAdavance(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {

      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
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

  tableRowFocued() {
    $("#paymentTypePayment tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("paymentTypePayment").scrollTop = 0;
        }
        $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
        idx++;
        $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("paymentTypePayment").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("paymentTypePayment").scrollLeft += 30;
      }
    };
  }
  selectPopupOpen(event) {
    if (event.target.checked) {
      this.displayThisPageArray = [];
      this.isSelectPopupShow = true;
      event.target.checked = false;
      this.isBulkCheckbox = false;
      let count = $('#paymentTypePayment tr').length;
      this.displayThisPageCount = this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      return;
    }
    this.isSelected = false;
    this.isRetrySelected = false;
    this.isSelectPopupShow = false;
    this.recordSelectedArray = [];
  }
  selectThisPage(event) {
    this.isBulkCheckbox = true;
    if (!event.target.checked) {
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
    this.isSelected = true;
    this.recordSelectedArray = this.displayThisPageArray;
    this.retrySelectedArray = [];
    this.gridFilterData.map(element => {
      if (
        element.paymentStatus == "Declined" ||
        element.paymentStatus == "Error"
      ) {
        if (this.recordSelectedArray.includes(element.paymentId)) {
          this.isRetrySelected = true;
          this.retrySelectedArray.push(element.paymentId);
        }
      }
    })
    this.isSelectPopupShow = false;
    this.paymentSelectedTotalCount();
  }
  selectPopupClose() {
    this.isSelectPopupShow = false;
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest('.popover')) {
      p1.close();
    } else {
    }
  }
  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null
    this.isOpen = true;
    this.commonMethodService.openCalendarPopup(this.class_id, this.class_hid, this.selectedDateRange, false, "paymentTransactionsCalender");
    this.calendarSubscription = this.commonMethodService.getCalendarArray().subscribe((items) => {
      if (items && items.pageName == "PaymentTransPage" && this.commonMethodService.isCalendarClicked == true) {
        this.commonMethodService.isCalendarClicked = false;
        this.calendarSubscription.unsubscribe();
        if (this.popContent) {
          this.popContent.close();
        }
        this.selectedDateRange = items.obj;
        this.pageSyncService.paymentCalDate = items.obj;
        this.EngHebCalPlaceholder = this.hebrewEngishCalendarService.EngHebCalPlaceholder
        this.presetOption = this.EngHebCalPlaceholder;
        this.EngHebCalPlaceholder = this.hebrewEngishCalendarService.EngHebCalPlaceholder;
        this.isdateChanged = true;
        this.pageSyncService.PaymentEngCalPlaceholder = this.EngHebCalPlaceholder;
        if (this.pageSyncService.uiPageSettings['paymentList'] != undefined) {
          this.pageSyncService.uiPageSettings['paymentList'].paymentCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
        }
        this.class_id = this.hebrewEngishCalendarService.id;
        this.class_hid = this.hebrewEngishCalendarService.hid;
        if (this.objAdvancedSearch.createdDate != undefined) {
          this.objAdvancedSearch.createdDate.startDate = moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          this.objAdvancedSearch.createdDate.endDate = moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
        }
        this.searchPaymentTransactionsData();
      }
    });
  }
  hideShowActionButton(item) {
    if (item == "Voided") {
      return false;
    }
    if (item == "Declined") {
      return false;
    }
    if (item == "Error") {
      return false;
    }
    return true;
  }
  inArrayCampaign(filterKeyArray: Array<{ id: number, itemName: string }> | null, rowFieldValue: any, o) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const found = filterKeyArray.some(el => {
      // If the filterKey is -1, return true for all campaigns with campaignId as null
      if (el.id === -1) {
        return o.campaignId === null;
      }
      if (!el.id && o.campaignAmounts < o.amount && o.campaignAmounts != null) {
        return true;
      }

      let filterValue = el.itemName.split(',').map(str => str.trim());
      let oValue = o.campaignName.split(',').map(str => str.trim());
      let result = this.containsContents(oValue, filterValue);

      if (el.id == rowFieldValue || result) {
        return true;
      }
      if (o.campaignId && o.campaignId.includes(',')) {
        let camsplit = o.campaignId.split(',');
        let campAmts = o.campaignAmounts.split(',');
        let campAmtNum = campAmts.map(Number);
        let campAmtSum = campAmtNum.reduce(function (a, b) { return a + b; });
        let equalTest = () => campAmtSum < o.amount;
        camsplit = camsplit.map(s => s.trim());
        const res = camsplit.some(equalTest);
        if (res && !camsplit.map(x => x == el.id).every(val => val === false)) {
          return true;
        }
      }
      if (el.id == o.campaignId) {
        return true;
      }
      return false;
    });
    return found;
  }
  inArrayReason(filterKeyArray: Array<{ id: number, itemName: string }> | null, rowFieldValue: any, o) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const found = filterKeyArray.some(el => {
      if (el.id === -1) {
        return o.reasonId === null;
      }
      if (!el.id && o.reasonAmounts < o.amount && o.reasonAmounts != null) {
        return true;
      }
      if (el.id == rowFieldValue) {
        return true;
      }
      if (o.reasonId && o.reasonId.includes(',')) {
        let reasonIDsplit = o.reasonId.split(',');
        let reasonAmts = o.reasonAmounts.split(',');
        let reasonAmtNum = reasonAmts.map(Number);
        let reasonAmtSum = reasonAmtNum.reduce(function (a, b) { return a + b; });
        let equalTest = () => reasonAmtSum < o.amount;
        reasonIDsplit = reasonIDsplit.map(s => s.trim());
        const res = reasonIDsplit.some(equalTest);
        if (res) {
          return true;
        }
      }
      if (el.id == o.reasonId) {
        return true;
      }
      return false;
    });
    return found;
  }
  hideActionVoided(item) {
    if (item == "Declined") {
      return true;
    }
    if (item == "Error") {
      return true;
    }
    if (item == "Voided") {
      return false;
    }
    return false;
  }
  isGlobalId(item) {
    return item.globalId === 688008
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = 'Import_Payments'
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    this.reseteFile();
    this.commonMethodService.commenSendUpgradeEmail(this.commonMethodService.featureDisplayName);
  }

  ngOnDestroy() {
    this.paymentTransSubscription.unsubscribe();
    this.commonMethodService.removeNoOptions()
  }
  generateUniqueTransactionId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  }

  containsContents(aArray: string[], bArray: string[]): boolean {
    for (let elementA of aArray) {
      if (bArray.includes(elementA)) {
        return true;
      }
    }
    return false;
  }
}
function listToArray(yourString: any, arg1: string) {
  throw new Error("Function not implemented.");
}
