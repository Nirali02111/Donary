import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import * as _ from "lodash";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { LocationService } from "src/app/services/location.sevice";
import { ReasonService } from "src/app/services/reason.service";
import { CampaignService } from "./../../../services/campaign.service";
import { CampaignCardDataResponse } from "./../../../models/campaign-model";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { CollectorCardPopupComponent } from "../../cards/collector-card-popup/collector-card-popup.component";
import { DeviceCardPopupComponent } from "../../cards/device-card-popup/device-card-popup.component";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";
import { ReasonCardPopupComponent } from "../../cards/reason-card-popup/reason-card-popup.component";
import { CampaignCardPopupComponent } from "./../../cards/campaign-card-popup/campaign-card-popup.component";
import { SchedulePaymentCardPopupComponent } from "../../cards/schedule-card-popup/schedule-paymentcard-popup.component";
import { SupportPopupComponent } from "../support-popup/support-popup.component";
import { TransactionAdvancedFilterPopupComponent } from "../transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { ScheduleService } from "./../../../services/schedule.service";
import { ImportScheduleComponent } from "./import-schedule/import-schedule.component";
import { Router } from "@angular/router";
import { DeviceService } from "src/app/services/device.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { PageSyncService } from "src/app/commons/pagesync.service";
import { Subject, Subscription, of } from "rxjs";
import {
  CellClickEvent,
  ColumnDefinitionType,
} from "src/app/commons/modules/tabulator/interface";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
} from "rxjs/operators";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
import { environment } from "src/environments/environment";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;

@Component({
  selector: "app-schedule-payment-transaction",
  templateUrl: "./schedule-payment-transaction.component.html",
  styleUrls: ["./schedule-payment-transaction.component.scss"],
  standalone: false,
  providers: [DonaryDateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePaymentTransactionComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  @ViewChild(TabulatorTableComponent, { static: false })
  tabulatorComponent: TabulatorTableComponent;

  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  objAdvancedSearch: any;
  isloading: boolean;
  selectedDateRange: any = {
    startDate: null,
    endDate: null,
  };
  selectedWeekSearchFilter: string;
  popTitle: any;
  selectedDueDate: any;
  cardType: any = [{ id: 2, itemName: "Reason" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  modalOptions: NgbModalOptions;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  paymentTypeChipData: Array<any>;
  filtercount: number = 1;
  paymentTypeChipClassName: string = "info-box bg-gradient-info";
  cardFilter = [];
  sortFilter = [];
  totalRecord: number = 0;
  filterRecord: number = 0;
  isinitialize: number = 0;
  isFiltered: boolean = false;
  colFields: any = [
    {
      colName: "SCHEDULE#",
      isVisible: true,
      colId: "SPaymentnoId",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      isVisible: true,
      colId: "SPaymentdonorjewishId",
      disabled: true,
    },
    {
      colName: "TOTALAMOUNT",
      isVisible: true,
      colId: "SPaymenttotalamtId",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      isVisible: false,
      colId: "SPaymentdatetimeId",
      disabled: false,
    },
    {
      colName: "SCHEDULEDAMOUNT",
      isVisible: true,
      colId: "SPaymentscheduleamtId",
      disabled: false,
    },
    {
      colName: "NEXTPAYMENTDATE",
      isVisible: true,
      colId: "SPaymentnextdateId",
      disabled: false,
    },
    {
      colName: "PAYMENTSLEFT",
      isVisible: true,
      colId: "SPaymentleftId",
      disabled: false,
    },
    {
      colName: "HEBREWDATE",
      isVisible: false,
      colId: "SPaymentJewishDateId",
      disabled: false,
    },
    {
      colName: "STATUS",
      isVisible: true,
      colId: "SPaymentstatusId",
      disabled: false,
    },
    {
      colName: "FREQUENCY",
      isVisible: true,
      colId: "SPaymentfrequencyId",
      disabled: false,
    },
    {
      colName: "PAYMENTTYPE",
      isVisible: true,
      colId: "SPaymenttypeId",
      disabled: false,
    },
    {
      colName: "FAILEDCOUNT",
      isVisible: false,
      colId: "SPaymentFailedId",
      disabled: false,
    },
    {
      colName: "NOTE",
      isVisible: false,
      colId: "SPaymentNoteId",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      isVisible: true,
      colId: "SPaymentcampaignId",
      disabled: false,
    },
    {
      colName: "REASON",
      isVisible: false,
      colId: "SPaymentreasonId",
      disabled: false,
    },
    {
      colName: "REASON#",
      isVisible: false,
      colId: "SPaymentreasonNumberId",
      disabled: false,
    },
    {
      colName: "LOCATION",
      isVisible: false,
      colId: "SPaymentlocationId",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      isVisible: true,
      colId: "SPaymentcollectorId",
      disabled: false,
    },
    {
      colName: "SOURCE",
      isVisible: false,
      colId: "SPaymentdeviceId",
      disabled: false,
    },
    {
      colName: "Account #",
      isVisible: false,
      colId: "SPaymentaccountnoId",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      isVisible: false,
      colId: "SPaymentdonorNameId",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      isVisible: false,
      colId: "SPaymentaddressId",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      isVisible: false,
      colId: "SPaymentcitystatezipId",
      disabled: false,
    },
    {
      colName: "Phone Number",
      isVisible: false,
      colId: "SPaymentphoneId",
      disabled: false,
    },
    {
      colName: "EMAIL",
      isVisible: false,
      colId: "SPaymentemailId",
      disabled: false,
    },
    {
      colName: "Group",
      isVisible: false,
      colId: "SPaymentgroupId",
      disabled: false,
    },
    {
      colName: "Class",
      isVisible: false,
      colId: "SPaymentclassId",
      disabled: false,
    },
    {
      colName: "FATHER",
      isVisible: false,
      colId: "SPaymentfatherId",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      isVisible: false,
      colId: "SPaymentfatherlawId",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      isVisible: false,
      colId: "SPaymenttotalpaidId",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      isVisible: false,
      colId: "SPaymenttotalopenId",
      disabled: false,
    },
    {
      colName: "NOTPROCESSED",
      isVisible: false,
      colId: "SPaymentnotprocessedId",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      isVisible: false,
      colId: "SPaymentenglishtitleId",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      isVisible: false,
      colId: "SPaymentfirstNameId",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      isVisible: false,
      colId: "SPaymentlastNameId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      isVisible: false,
      colId: "SPaymenttitleJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      isVisible: false,
      colId: "SPaymentfirstNameJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      isVisible: false,
      colId: "SPaymentyiddishlastnameId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      isVisible: false,
      colId: "SPaymentsuffixJewishId",
      disabled: false,
    },
  ];
  isSchdlePymntNoVisible: boolean = true;
  isSchdlePymntDateTimeVisible: boolean = false;
  isSchdlePymntDonorVisible: boolean = true;
  isSchdlePymntTotalAmountVisible: boolean = true;
  isSchdlePymntTypeVisible: boolean = true;
  isSchdlePymntLeftVisible: boolean = true;
  isSchdlePymntNextDateVisible: boolean = true;
  PageName: any = "SchedulePaymentTransPage";
  isOneDate: any = false;
  isSchdlePymntScheduleAmountVisible: boolean = true;
  isSchdlePymntStatusVisible: boolean = true;
  isSchdlePymntCampaignVisible: boolean = true;
  isSchdlePymntFrequencyVisible: boolean = true;
  isSchdlePymntLocationVisible: boolean = false;
  isSchdlePymntPhoneVisible: boolean = false;
  isSchdlePymntReasonVisible: boolean = false;
  isSchdlePymntReasonNumberVisible: boolean = false;
  isSchdlePymntFailedCountVisible: boolean = false;
  isSchdlePymntNoteVisible: boolean = false;
  isSchdlePymntCollectorVisible: boolean = true;
  isSchdlePymntDeviceVisible: boolean = false;
  isSchdlePymntAccountNoVisible: boolean = false;
  isSchdlePymntDonorEnglishVisible: boolean = false;
  isSchdlePymntAddressVisible: boolean = false;
  isSchdlePymntCityStateZipVisible: boolean = false;
  isSchdlePymntEmailVisible: boolean = false;
  isSchdlePymntGroupVisible: boolean = false;
  isSchdlePymntClassVisible: boolean = false;
  isSchdlePymntFatherVisible: boolean = false;
  isSchdlePymntFatherInLawVisible: boolean = false;
  isSchdlePaymentJewishDateColVisible: boolean = false;
  isSchdlePymntTotalPaidVisible: boolean = false;
  isSchdlePymntTotalOpenVisible: boolean = false;
  isSchdlePymntNotProcessedVisible: boolean = false;
  isSchdlePymntEnglishTitleColVisible: boolean = false;
  isSchdlePymntFirstNameColVisible: boolean = false;
  isSchdlePymntLastNameColVisible: boolean = false;
  isSchdlePymntTitleJewishColVisible: boolean = false;
  isSchdlePymntFirstNameJewishColVisible: boolean = false;
  isSchdlePymntLastNameJewishColVisible: boolean = false;
  isSchdlePymntSuffixJewishColVisible: boolean = false;

  sumByCampaignPayments = [];
  sumByDonorPayments = [];
  sumByReasonPayments = [];
  sumByLocationPayments = [];
  sumBySourcePayments = [];
  sumByWeekPayments = [];
  sumByMonthPayments = [];
  sumByYearPayments = [];
  recordSelectedArray = [];
  isSelected = false;
  paymentActionVisible = false;
  EngHebCalPlaceholder: string = "All Time";
  presetClickId: string;
  id: string = "id_Clear";
  hid: string = "id_Clear";
  presetOption: string;

  headerList: any = [
    {
      colName: "SCHEDULE#",
      visibleCondition: this.isSchdlePymntNoVisible,
      sortName: "scheduleNum",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      visibleCondition: this.isSchdlePymntDonorVisible,
      sortName: "donorJewish",
      disabled: true,
    },
    {
      colName: "TOTALAMOUNT",
      visibleCondition: this.isSchdlePymntTotalAmountVisible,
      sortName: "totalAmount",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      visibleCondition: this.isSchdlePymntDateTimeVisible,
      sortName: "createdDate",
      disabled: false,
    },
    {
      colName: "SCHEDULEDAMOUNT",
      visibleCondition: this.isSchdlePymntScheduleAmountVisible,
      sortName: "scheduleAmount",
      disabled: false,
    },
    {
      colName: "NEXTPAYMENTDATE",
      visibleCondition: this.isSchdlePymntNextDateVisible,
      sortName: "nextPaymentDate",
      disabled: false,
    },
    {
      colName: "PAYMENTSLEFT",
      visibleCondition: this.isSchdlePymntLeftVisible,
      sortName: "paymentLeft",
      disabled: false,
    },
    {
      colName: "HEBREWDATE",
      visibleCondition: this.isSchdlePaymentJewishDateColVisible,
      sortName: "scheduleJewishDate",
      disabled: false,
    }, //aded
    {
      colName: "STATUS",
      visibleCondition: this.isSchdlePymntStatusVisible,
      sortName: "scheduleStatus",
      disabled: false,
    },
    {
      colName: "FREQUENCY",
      visibleCondition: this.isSchdlePymntFrequencyVisible,
      sortName: "frequency",
      disabled: false,
    },
    {
      colName: "PAYMENTTYPE",
      visibleCondition: this.isSchdlePymntTypeVisible,
      sortName: "paymentType",
      disabled: false,
    },
    {
      colName: "FAILEDCOUNT",
      visibleCondition: this.isSchdlePymntFailedCountVisible,
      sortName: "failed",
      disabled: false,
    },
    {
      colName: "NOTE",
      visibleCondition: this.isSchdlePymntNoteVisible,
      sortName: "note",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isSchdlePymntCampaignVisible,
      sortName: "campaign",
      disabled: false,
    },
    {
      colName: "REASON",
      visibleCondition: this.isSchdlePymntReasonVisible,
      sortName: "reasonName",
      disabled: false,
    },
    {
      colName: "REASON#",
      visibleCondition: this.isSchdlePymntReasonNumberVisible,
      sortName: "reasonNumber",
      disabled: false,
    },
    {
      colName: "LOCATION",
      visibleCondition: this.isSchdlePymntLocationVisible,
      sortName: "locationName",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isSchdlePymntCollectorVisible,
      sortName: "collector",
      disabled: false,
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isSchdlePymntDeviceVisible,
      sortName: "deviceName",
      disabled: false,
    },
    {
      colName: "Account #",
      visibleCondition: this.isSchdlePymntAccountNoVisible,
      sortName: "accountNum",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      visibleCondition: this.isSchdlePymntDonorEnglishVisible,
      sortName: "donor",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      visibleCondition: this.isSchdlePymntAddressVisible,
      sortName: "address",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      visibleCondition: this.isSchdlePymntCityStateZipVisible,
      sortName: "cityStateZip",
      disabled: false,
    },
    {
      colName: "Phone Number",
      visibleCondition: this.isSchdlePymntPhoneVisible,
      sortName: "phones",
      disabled: false,
    },
    {
      colName: "EMAIL",
      visibleCondition: this.isSchdlePymntEmailVisible,
      sortName: "emailAddress",
      disabled: false,
    },
    {
      colName: "Group",
      visibleCondition: this.isSchdlePymntGroupVisible,
      sortName: "group",
      disabled: false,
    },
    {
      colName: "Class",
      visibleCondition: this.isSchdlePymntClassVisible,
      sortName: "class",
      disabled: false,
    },
    {
      colName: "FATHER",
      visibleCondition: this.isSchdlePymntFatherVisible,
      sortName: "father",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      visibleCondition: this.isSchdlePymntFatherInLawVisible,
      sortName: "fatherInLaw",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      visibleCondition: this.isSchdlePymntTotalPaidVisible,
      sortName: "totalPaid",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      visibleCondition: this.isSchdlePymntTotalOpenVisible,
      sortName: "totalOpen",
      disabled: false,
    },
    {
      colName: "NOTPROCESSED",
      visibleCondition: this.isSchdlePymntNotProcessedVisible,
      sortName: "notProcessed",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      visibleCondition: this.isSchdlePymntEnglishTitleColVisible,
      sortName: "title",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      visibleCondition: this.isSchdlePymntFirstNameColVisible,
      sortName: "firstName",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      visibleCondition: this.isSchdlePymntLastNameColVisible,
      sortName: "lastName",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      visibleCondition: this.isSchdlePymntTitleJewishColVisible,
      sortName: "titleJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      visibleCondition: this.isSchdlePymntFirstNameJewishColVisible,
      sortName: "firstNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      visibleCondition: this.isSchdlePymntLastNameJewishColVisible,
      sortName: "lastNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      visibleCondition: this.isSchdlePymntSuffixJewishColVisible,
      sortName: "suffixJewish",
      disabled: false,
    },
  ];
  uiPageSettingId = null;
  uiPageSetting: any;

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };
  schedulePaymentSubscription!: Subscription;

  /**
   * Tabulator Integration
   */

  isTabulator = false;

  private _search$ = new Subject<void>();
  searchVal = "";

  filterQuery = [];
  columnNames: Array<ColumnDefinitionType> = [
    {
      title: "",
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      headerSort: false,
      frozen: true,
      width: 100,
    },
    {
      title: "SCHEDULE#",
      field: "scheduleNum",
      visible: true,
      cssClass: "tabulator-class",
      maxWidth: 200,
      frozen: true,
    },
    {
      title: "Donor Jewish Name",
      field: "donorJewish",
      visible: true,
      cssClass: "tabulator-class",
      frozen: true,
    },
    {
      title: "TOTALAMOUNT",
      field: "totalAmount",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: true,
      frozen: true,
    },
    {
      title: "CREATEDDATETIME",
      field: "createdDate",
      formatter: "customComponent",
      formatterParams: { type: "date_long" },
      visible: true,
      frozen: false,
    },
    {
      title: "SCHEDULEDAMOUNT",
      field: "scheduleAmount",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: true,
      frozen: false,
    },
    {
      title: "NEXTPAYMENTDATE",
      field: "nextPaymentDate",
      formatter: "customComponent",
      formatterParams: { type: "date_short" },
      visible: true,
      frozen: false,
    },
    {
      title: "PAYMENTSLEFT",
      field: "paymentLeft",
      visible: true,
      frozen: false,
    },
    {
      title: "HEBREWDATE",
      field: "scheduleJewishDate",
      visible: true,
      frozen: false,
    }, //aded
    { title: "STATUS", field: "scheduleStatus", visible: true, frozen: false },
    { title: "FREQUENCY", field: "frequency", visible: true, frozen: false },
    {
      title: "PAYMENTTYPE",
      field: "paymentType",
      visible: true,
      frozen: false,
    },
    { title: "FAILEDCOUNT", field: "failed", visible: false, frozen: false },
    { title: "NOTE", field: "note", visible: false, frozen: false },
    {
      title: "CAMPAIGN",
      field: "campaign",
      visible: true,
      frozen: false,
      cssClass: "cell_class tabulator-class",
    },

    {
      title: "REASON",
      field: "reasonName",
      visible: false,
      frozen: false,
      cssClass: "cell_class tabulator-class",
    },
    { title: "REASON#", field: "reasonNumber", visible: false, frozen: false },
    {
      title: "LOCATION",
      field: "locationName",
      visible: false,
      frozen: false,
      cssClass: "tabulator-class",
    },
    {
      title: "COLLECTOR",
      field: "collector",
      visible: true,
      frozen: false,
      cssClass: "cell_class tabulator-class",
    },
    {
      title: "SOURCE",
      field: "deviceName",
      visible: false,
      frozen: false,
      cssClass: "tabulator-class",
    },
    { title: "Account #", field: "accountNum", visible: false, frozen: false },
    {
      title: "Donor English Name",
      field: "donor",
      visible: false,
      frozen: false,
      cssClass: "cell_class tabulator-class",
    },
    {
      title: "ADDRESS",
      field: "address",
      formatter: "customComponent",
      formatterParams: { type: "address" },
      visible: true,
      frozen: false,
    },
    {
      title: "CITYSTATEZIP",
      field: "cityStateZip",
      visible: false,
      frozen: false,
    },
    {
      title: "Phone Number",
      field: "phoneNo",
      visible: false,
      frozen: false,
      formatter: "html",
    },
    { title: "EMAIL", field: "emailAddress", visible: false, frozen: false },
    { title: "Group", field: "group", visible: false, frozen: false },
    { title: "Class", field: "class", visible: false, frozen: false },
    { title: "FATHER", field: "father", visible: false, frozen: false },
    {
      title: "FATHERINLAW",
      field: "fatherInLaw",
      visible: false,
      frozen: false,
    },
    {
      title: "TOTALPAID",
      field: "totalPaid",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: true,
      frozen: false,
    },
    {
      title: "TOTALOPEN",
      field: "totalOpen",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: true,
      frozen: false,
    },
    {
      title: "NOTPROCESSED",
      field: "notProcessed",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: true,
      frozen: false,
    },
    //added new
    { title: "ENGLISHTITLE", field: "title", visible: false, frozen: false },
    {
      title: "ENGLISHFIRSTNAME",
      field: "firstName",
      visible: false,
      frozen: false,
    },
    {
      title: "ENGLISHLASTNAME",
      field: "lastName",
      visible: false,
      frozen: false,
    },
    {
      title: "YIDDISHFIRSTTITLE",
      field: "titleJewish",
      visible: false,
      frozen: false,
    },
    {
      title: "YIDDISHFIRSTNAME",
      field: "firstNameJewish",
      visible: false,
      frozen: false,
    },
    {
      title: "YIDDISHLASTNAME",
      field: "lastNameJewish",
      visible: false,
      frozen: false,
    },
    {
      title: "YIDDISHLASTTITLE",
      field: "suffixJewish",
      visible: false,
      frozen: false,
    },
  ];
  pageClicked: boolean = false;

  private calendarSubscription: Subscription;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  lastUpdatedColumns: any;
  columnsVisibilitySubject = new Subject<any>();
  toggledFields: ColumnDefinitionType[] = [];
  private analytics = inject(AnalyticsService);

  constructor(
    private notificationService: NotificationService,
    public pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private localstoragedataService: LocalstoragedataService,
    // private readonly changeDetectorRef: ChangeDetectorRef,
    private scheduleService: ScheduleService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private collectorService: CollectorService,
    private locationService: LocationService,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private deviceService: DeviceService,
    public router: Router,
    private uiPageSettingService: UIPageSettingService,
    private datePipe: DonaryDateFormatPipe,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private xlsxService: XLSXService
  ) {
    this.isTabulator =
      this.localstoragedataService.isTabulatorEvent() &&
      environment.baseUrl.includes("https://dev-api.donary.com/");
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
        id: 4,
        itemName: "Donor",
        counts: this.multiSelectCount(this.sumByDonorPayments.length),
      },
      {
        id: 5,
        itemName: "Source",
        counts: this.multiSelectCount(this.sumBySourcePayments.length),
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
    ];
  }

  ngOnInit() {
    this.analytics.visitedSchedulePayment();
    this.colfieldsValue = this.pageSyncService.schedulepaymentFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbySchedulePayment) {
      this.cardType = this.pageSyncService.sumbySchedulePayment;
    }
    if (!this.pageSyncService.isScheduleTabClicked) {
      this.pageSyncService.isScheduleTabClicked = true;
    }
    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    this.pageSyncService.calculateTimeDifference("schedule");
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    this.schedulePaymentSubscription = this.commonMethodService
      .getScheduleTransSync()
      .subscribe((res: any) => {
        if (res) {
          if (this.pageSyncService.schedulePaymentTransList == undefined) {
            this.searchScheduleTransactionsData();
          } else {
            this.gridFilterData = this.pageSyncService.schedulePaymentTransList;

            this.calculateAllSumByFields(this.gridFilterData);
            this.resGridDataModification(this.gridFilterData);
          }
        }
      });
    this.commonMethodService.getPaymentSchdleTrans().subscribe((res: any) => {
      if (res) {
        this.searchScheduleTransactionsData();
      }
    });
    if (
      !this.pageSyncService.scheduleFlag ||
      (this.pageSyncService.isScheduleTabClicked &&
        this.pageSyncService.schedulePaymentTransList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "transactions",
        screenName: "schedulepayments",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isSchdlePymntNoVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);

            this.getRedirectData();
            this.colFields.forEach((item) => {
              let colVisible = this.checkVisibility(item.colName);
              if (item.isVisible != colVisible) {
                let columnVisibility = { [item.colName]: colVisible };
                this.colfieldsValue.push(columnVisibility);
              }
              item.isVisible = this.checkVisibility(item.colName);
            });
          }
          if (
            !this.pageSyncService.scheduleFlag ||
            (this.pageSyncService.isScheduleTabClicked &&
              this.pageSyncService.schedulePaymentTransList == undefined)
          ) {
            if (this.pageSyncService.schedulepaymentFilterData) {
              this.objAdvancedSearch =
                this.pageSyncService.schedulepaymentFilterData;
            }
            this.searchScheduleTransactionsData();
          }
        } else {
          if (this.pageSyncService.schedulepaymentFilterData) {
            this.objAdvancedSearch =
              this.pageSyncService.schedulepaymentFilterData;
          }
          this.getRedirectData();
          this.searchScheduleTransactionsData();
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["schedulePaymentList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["schedulePaymentList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      if (this.pageSyncService.pledgeFilterData) {
        this.advancedSearchData(
          this.pageSyncService.schedulepaymentFilterData,
          false
        );
      }
      if (
        this.pageSyncService.isScheduleTabClicked &&
        this.pageSyncService.schedulePaymentTransList != undefined
      ) {
        this.gridData = this.pageSyncService.schedulePaymentTransList;
        this.gridFilterData = this.pageSyncService.schedulePaymentTransList;
        this.calculateAllSumByFields(this.gridFilterData);
        this.resGridDataModification(this.gridFilterData);
        this.getRedirectData();
      }
      if (this.pageSyncService.schedulepaymentCalDate) {
        if (
          this.pageSyncService.schedulepaymentCalDate.startDate == null &&
          this.pageSyncService.schedulepaymentCalDate.endDate == null
        ) {
          this.selectedDateRange.startDate = null;
          this.selectedDateRange.endDate = null;
          this.EngHebCalPlaceholder = "All Time";
        } else {
          this.pageSyncService.schedulepaymentCalDate.startDate = moment(
            this.pageSyncService.schedulepaymentCalDate.startDate
          ).format("YYYY-MM-DD");
          this.pageSyncService.schedulepaymentCalDate.endDate = moment(
            this.pageSyncService.schedulepaymentCalDate.endDate
          ).format("YYYY-MM-DD");
          this.getSelectedDateRange(
            this.pageSyncService.schedulepaymentCalDate.startDate,
            this.pageSyncService.schedulepaymentCalDate.endDate
          );
        }
      }
    }

    this.commonMethodService.getScheduleSingle().subscribe((res: any) => {
      if (res && res.scheduleId) {
        const objVal = this.gridFilterData.map((x) => {
          if (x.firstScheduleId == res.firstScheduleId) {
            (x.totalOpen = res.openAmount),
              (x.notProcessed = res.totalNotProcessed),
              (x.reasonId = res.reasonId),
              (x.reasonName = res.reasonName),
              (x.campaignId = res.campaignId),
              (x.campaign = res.campaignName),
              (x.collectorId = res.collectorId),
              (x.collector = res.collectorName),
              (x.locationId = res.locationId),
              (x.locationName = res.locationName),
              (x.frequencyId = res.frequencyId),
              (x.frequency = res.frequency),
              (x.nextScheduleDt = res.nextScheduleDt),
              (x.isAmountSame = res.isAmountSame),
              (x.amtPerPayment = res.amtPerPayment),
              (x.donor = res.accountName),
              (x.donorJewish = res.accountNameJewish);
            (x.totalAmount = res.totalAmount),
              (x.totalPaid = res.paidAmount),
              (x.paymentType = res.paymentType),
              (x.failed = res.totalFailed);
            const data = this.gridData.map((u) =>
              u.firstScheduleId !== x.firstScheduleId ? u : x
            );
          }
        });
      }
    });

    this._search$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((val) => {
          return of(val);
        })
      )
      .subscribe((val: any) => {
        this.searchVal = val;
        this.changeDetectorRef.detectChanges();
        return;
      });

    if (this.pageSyncService.schedulepaymentCalDate) {
      if (
        this.pageSyncService.schedulepaymentCalDate.startDate == null &&
        this.pageSyncService.schedulepaymentCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      } else {
        this.pageSyncService.schedulepaymentCalDate.startDate = moment(
          this.pageSyncService.schedulepaymentCalDate.startDate
        ).format("YYYY-MM-DD");
        this.pageSyncService.schedulepaymentCalDate.endDate = moment(
          this.pageSyncService.schedulepaymentCalDate.endDate
        ).format("YYYY-MM-DD");
        this.getSelectedDateRange(
          this.pageSyncService.schedulepaymentCalDate.startDate,
          this.pageSyncService.schedulepaymentCalDate.endDate
        );
      }
    }

    this.columnsVisibilitySubject
      .pipe(debounceTime(500))
      .subscribe((updatedOptions: any[]) => {
        this.lastUpdatedColumns = updatedOptions;
        this.changeDetectorRef.detectChanges();
        this.toggledFields = [];
      });
  }

  setUIPageSettings(uiPageSetting) {
    this.isSchdlePymntNoVisible = uiPageSetting.isSchdlePymntNoVisible;
    this.isSchdlePymntDonorVisible = uiPageSetting.isSchdlePymntDonorVisible;
    this.isSchdlePymntTotalAmountVisible =
      uiPageSetting.isSchdlePymntTotalAmountVisible;
    this.isSchdlePymntDateTimeVisible =
      uiPageSetting.isSchdlePymntDateTimeVisible;
    this.isSchdlePymntScheduleAmountVisible =
      uiPageSetting.isSchdlePymntScheduleAmountVisible;
    this.isSchdlePymntNextDateVisible =
      uiPageSetting.isSchdlePymntNextDateVisible;
    this.isSchdlePymntLeftVisible = uiPageSetting.isSchdlePymntLeftVisible;
    this.isSchdlePaymentJewishDateColVisible =
      uiPageSetting.isSchdlePaymentJewishDateColVisible;
    this.isSchdlePymntStatusVisible = uiPageSetting.isSchdlePymntStatusVisible;
    this.isSchdlePymntFrequencyVisible =
      uiPageSetting.isSchdlePymntFrequencyVisible;
    this.isSchdlePymntTypeVisible = uiPageSetting.isSchdlePymntTypeVisible;
    this.isSchdlePymntFailedCountVisible =
      uiPageSetting.isSchdlePymntFailedCountVisible;
    this.isSchdlePymntNoteVisible = uiPageSetting.isSchdlePymntNoteVisible;
    this.isSchdlePymntCampaignVisible =
      uiPageSetting.isSchdlePymntCampaignVisible;
    this.isSchdlePymntReasonVisible = uiPageSetting.isSchdlePymntReasonVisible;
    this.isSchdlePymntReasonNumberVisible =
      uiPageSetting.isSchdlePymntReasonNumberVisible;
    this.isSchdlePymntLocationVisible =
      uiPageSetting.isSchdlePymntLocationVisible;
    this.isSchdlePymntCollectorVisible =
      uiPageSetting.isSchdlePymntCollectorVisible;
    this.isSchdlePymntDeviceVisible = uiPageSetting.isSchdlePymntDeviceVisible;
    this.isSchdlePymntAccountNoVisible =
      uiPageSetting.isSchdlePymntAccountNoVisible;
    this.isSchdlePymntDonorEnglishVisible =
      uiPageSetting.isSchdlePymntDonorEnglishVisible;
    this.isSchdlePymntAddressVisible =
      uiPageSetting.isSchdlePymntAddressVisible;
    this.isSchdlePymntCityStateZipVisible =
      uiPageSetting.isSchdlePymntCityStateZipVisible;
    this.isSchdlePymntPhoneVisible = uiPageSetting.isSchdlePymntPhoneVisible;
    this.isSchdlePymntEmailVisible = uiPageSetting.isSchdlePymntEmailVisible;
    this.isSchdlePymntGroupVisible = uiPageSetting.isSchdlePymntGroupVisible;
    this.isSchdlePymntClassVisible = uiPageSetting.isSchdlePymntClassVisible;
    this.isSchdlePymntFatherVisible = uiPageSetting.isSchdlePymntFatherVisible;
    this.isSchdlePymntFatherInLawVisible =
      uiPageSetting.isSchdlePymntFatherInLawVisible;
    this.isSchdlePymntTotalPaidVisible =
      uiPageSetting.isSchdlePymntTotalPaidVisible;
    this.isSchdlePymntNotProcessedVisible =
      uiPageSetting.isSchdlePymntNotProcessedVisible;
    this.isSchdlePymntEnglishTitleColVisible =
      uiPageSetting.isSchdlePymntEnglishTitleColVisible;
    this.isSchdlePymntFirstNameColVisible =
      uiPageSetting.isSchdlePymntFirstNameColVisible;
    this.isSchdlePymntLastNameColVisible =
      uiPageSetting.isSchdlePymntLastNameColVisible;
    this.isSchdlePymntTitleJewishColVisible =
      uiPageSetting.isSchdlePymntTitleJewishColVisible;
    this.isSchdlePymntFirstNameJewishColVisible =
      uiPageSetting.isSchdlePymntFirstNameJewishColVisible;
    this.isSchdlePymntLastNameJewishColVisible =
      uiPageSetting.isSchdlePymntLastNameJewishColVisible;
    this.isSchdlePymntSuffixJewishColVisible =
      uiPageSetting.isSchdlePymntSuffixJewishColVisible;
    this.cardType = uiPageSetting.schedulePaymentSumBy;
    this.objAdvancedSearch = uiPageSetting.schedulePaymentSearchItem;
    /* if (
      uiPageSetting.schedulePaymentStartDate == null &&
      uiPageSetting.schedulePaymentEndDate == null
    ) {
      this.selectedDateRange.startDate = null;
      this.selectedDateRange.endDate = null;
      this.EngHebCalPlaceholder="All Time";
    }
    else{
      this.getSelectedDateRange(uiPageSetting.schedulePaymentStartDate, uiPageSetting.schedulePaymentEndDate);
    } */
    this.pageSyncService.uiPageSettings["schedulePaymentList"] = uiPageSetting;
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy() {
    this.schedulePaymentSubscription.unsubscribe();
  }

  class_id: string = "id_Clear";
  class_hid: string = "id_Clear";

  onDateChange(sDate, eDate, preset) {
    const today = new Date();
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    const ftoday = this.datePipe.transform(today, "dd/MM/yyyy");
    const fstartDate = this.datePipe.transform(startDate, "dd/MM/yyyy");
    const fendDate = this.datePipe.transform(endDate, "dd/MM/yyyy");
    if (preset == "PresetOption") {
      if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate.getDate() === today.getDate() &&
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_today";
        this.class_hid = "id_today_h";
        this.EngHebCalPlaceholder = "Today";
        this.presetOption = "Today";
      } else if (
        startDate <= today &&
        endDate >= today &&
        startDate <= today &&
        endDate <=
          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)
      ) {
        this.class_id = "id_thisweek";
        this.class_hid = "id_thisweek_h";
        this.EngHebCalPlaceholder = "This Week";
        this.presetOption = "This Week";
      } else if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate >=
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 6
          ) &&
        fendDate <= ftoday
      ) {
        this.class_id = "id_Last7days";
        this.class_hid = "id_Last7days_h";
        this.EngHebCalPlaceholder = "Last 7 Days";
        this.presetOption = "Last 7 Days";
      } else if (
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_ThisMonth";
        this.class_hid = "id_ThisMonth_h";
        this.EngHebCalPlaceholder = "This Month";
        this.presetOption = "This Month";
      } else if (
        startDate.getMonth() === today.getMonth() - 1 &&
        startDate.getFullYear() === today.getFullYear() &&
        startDate.getMonth() != today.getMonth() &&
        endDate.getMonth() !== today.getMonth() + 1
      ) {
        this.class_id = "id_LastMonth";
        this.class_hid = "id_LastMonth_h";
        this.EngHebCalPlaceholder = "Last Month";
        this.presetOption = "Last Month";
      } else if (
        startDate.getMonth() === today.getMonth() + 1 &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_NextMonth";
        this.class_hid = "id_NextMonth_h";
        this.EngHebCalPlaceholder = "Next Month";
        this.presetOption = "Next Month";
      } else if (startDate.getFullYear() === today.getFullYear()) {
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const formattedStartDate = this.datePipe.transform(
          thisYearStart,
          "dd/MM/yyyy"
        );

        const thisYearEnd = new Date(today.getFullYear(), 11, 31);
        const formattedEndDate = this.datePipe.transform(
          thisYearEnd,
          "dd/MM/yyyy"
        );

        if (fstartDate == formattedStartDate && fendDate == formattedEndDate) {
          this.EngHebCalPlaceholder = "This Year";
          this.presetOption = "This Year";
          this.class_id = "id_ThisYear";
          this.class_hid = "id_ThisYear_h";
        } else {
          this.class_id = "id_CustomRange";
          this.class_hid = "id_CustomRange_h";
          this.EngHebCalPlaceholder = fstartDate + " - " + fendDate;
        }
      } else if (startDate.getFullYear() === today.getFullYear() - 1) {
        this.class_id = "id_LastYear";
        this.class_hid = "id_LastYear_h";
        this.EngHebCalPlaceholder = "Last Year";
        this.presetOption = "Last Year";
      } else if (startDate.getFullYear() === today.getFullYear() + 1) {
        this.class_id = "id_NextYear";
        this.class_hid = "id_NextYear_h";
        this.EngHebCalPlaceholder = "Next Year";
        this.presetOption = "Next Year";
      }
    }
    if (preset == "CustomRange") {
      this.class_id = "id_CustomRange";
      this.class_hid = "id_CustomRange_h";
      this.EngHebCalPlaceholder = sDate + " - " + eDate;
    }
    if (this.pageSyncService.schedulepaymentEngCalPlaceholder) {
      this.EngHebCalPlaceholder =
        this.pageSyncService.schedulepaymentEngCalPlaceholder;
    }
  }
  getRedirectData() {
    if (
      this.commonMethodService.recentStartDate &&
      this.commonMethodService.isRedirect == true
    ) {
      this.commonMethodService.isRedirect = false;
      if (
        this.commonMethodService.recentStartDate == null &&
        this.commonMethodService.recentEndDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      } else {
        this.getSelectedDateRange(
          this.commonMethodService.recentStartDate,
          this.commonMethodService.recentEndDate
        );
        if (this.pageSyncService.pageClicked == true) {
          this.searchScheduleTransactionsData();
        }
      }
    }
  }
  getSelectedDateRange(sDate, eDate) {
    const today = new Date();
    if (sDate != null && eDate == null) {
      const dates = this.commonMethodService.getStartAndEndDate(sDate);
      this.selectedDateRange.startDate = dates.startDate;
      this.selectedDateRange.endDate = dates.endDate;
      this.onDateChange(
        this.selectedDateRange.startDate,
        this.selectedDateRange.endDate,
        "PresetOption"
      );
    } else if (sDate != null && eDate != null) {
      this.selectedDateRange.startDate = moment(sDate);
      this.selectedDateRange.endDate = moment(eDate);
      this.onDateChange(sDate, eDate, "CustomRange");
    }
  }

  SaveLayout() {
    if (
      this.presetOption == "Today" ||
      this.presetOption == "This Week" ||
      this.presetOption == "This Month" ||
      this.presetOption == "This Year" ||
      this.presetOption == "Last Month" ||
      this.presetOption == "Next Month" ||
      this.presetOption == "Last Year" ||
      this.presetOption == "Next Year" ||
      this.presetOption == "Last 7 Days"
    ) {
      this.selectedDateRange.startDate = this.presetOption;
      this.selectedDateRange.endDate = null;
    } else {
      this.selectedDateRange.startDate =
        this.selectedDateRange != undefined &&
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null;
      this.selectedDateRange.endDate =
        this.selectedDateRange != undefined &&
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null;
    }
    let setting = {
      isSchdlePymntNoVisible: this.isSchdlePymntNoVisible,
      isSchdlePymntDonorVisible: this.isSchdlePymntDonorVisible,
      isSchdlePymntTotalAmountVisible: this.isSchdlePymntTotalAmountVisible,
      isSchdlePymntDateTimeVisible: this.isSchdlePymntDateTimeVisible,
      isSchdlePymntScheduleAmountVisible:
        this.isSchdlePymntScheduleAmountVisible,
      isSchdlePymntNextDateVisible: this.isSchdlePymntNextDateVisible,
      isSchdlePymntLeftVisible: this.isSchdlePymntLeftVisible,
      isSchdlePaymentJewishDateColVisible:
        this.isSchdlePaymentJewishDateColVisible,
      isSchdlePymntStatusVisible: this.isSchdlePymntStatusVisible,
      isSchdlePymntFrequencyVisible: this.isSchdlePymntFrequencyVisible,
      isSchdlePymntTypeVisible: this.isSchdlePymntTypeVisible,
      isSchdlePymntFailedCountVisible: this.isSchdlePymntFailedCountVisible,
      isSchdlePymntNoteVisible: this.isSchdlePymntNoteVisible,
      isSchdlePymntCampaignVisible: this.isSchdlePymntCampaignVisible,
      isSchdlePymntReasonVisible: this.isSchdlePymntReasonVisible,
      isSchdlePymntReasonNumberVisible: this.isSchdlePymntReasonNumberVisible,
      isSchdlePymntLocationVisible: this.isSchdlePymntLocationVisible,
      isSchdlePymntCollectorVisible: this.isSchdlePymntCollectorVisible,
      isSchdlePymntDeviceVisible: this.isSchdlePymntDeviceVisible,
      isSchdlePymntAccountNoVisible: this.isSchdlePymntAccountNoVisible,
      isSchdlePymntDonorEnglishVisible: this.isSchdlePymntDonorEnglishVisible,
      isSchdlePymntAddressVisible: this.isSchdlePymntAddressVisible,
      isSchdlePymntCityStateZipVisible: this.isSchdlePymntCityStateZipVisible,
      isSchdlePymntPhoneVisible: this.isSchdlePymntPhoneVisible,
      isSchdlePymntEmailVisible: this.isSchdlePymntEmailVisible,
      isSchdlePymntGroupVisible: this.isSchdlePymntGroupVisible,
      isSchdlePymntClassVisible: this.isSchdlePymntClassVisible,
      isSchdlePymntFatherVisible: this.isSchdlePymntFatherVisible,
      isSchdlePymntFatherInLawVisible: this.isSchdlePymntFatherInLawVisible,
      isSchdlePymntTotalPaidVisible: this.isSchdlePymntTotalPaidVisible,
      isSchdlePymntTotalOpenVisible: this.isSchdlePymntTotalOpenVisible,
      isSchdlePymntNotProcessedVisible: this.isSchdlePymntNotProcessedVisible,
      isSchdlePymntEnglishTitleColVisible:
        this.isSchdlePymntEnglishTitleColVisible,
      isSchdlePymntFirstNameColVisible: this.isSchdlePymntFirstNameColVisible,
      isSchdlePymntLastNameColVisible: this.isSchdlePymntLastNameColVisible,
      isSchdlePymntTitleJewishColVisible:
        this.isSchdlePymntTitleJewishColVisible,
      isSchdlePymntFirstNameJewishColVisible:
        this.isSchdlePymntFirstNameJewishColVisible,
      isSchdlePymntLastNameJewishColVisible:
        this.isSchdlePymntLastNameJewishColVisible,
      isSchdlePymntSuffixJewishColVisible:
        this.isSchdlePymntSuffixJewishColVisible,
      schedulePaymentStartDate: this.selectedDateRange.startDate,
      schedulePaymentEndDate: this.selectedDateRange.endDate,
      schedulePaymentSumBy: this.cardType,
      schedulePaymentSearchItem: this.objAdvancedSearch,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "schedulepayments",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
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

  // Remove count for All card
  multiSelectCount(length) {
    let count = length - 1;
    return count > 0 ? count : 0;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.schedulepaymentFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        this.isSchdlePymntNoVisible = isVisible;
        this.uiPageSetting.isSchdlePymntNoVisible = isVisible;
        break;
      case "createddatetime":
        this.isSchdlePymntDateTimeVisible = isVisible;
        this.uiPageSetting.isSchdlePymntDateTimeVisible = isVisible;
        break;
      case "donorjewishname":
        this.isSchdlePymntDonorVisible = isVisible;
        this.uiPageSetting.isSchdlePymntDonorVisible = isVisible;
        break;
      case "hebrewdate": // added
        this.isSchdlePaymentJewishDateColVisible = isVisible;
        this.uiPageSetting.isSchdlePaymentJewishDateColVisible = isVisible;
        break;
      case "totalamount":
        this.isSchdlePymntTotalAmountVisible = isVisible;
        this.uiPageSetting.isSchdlePymntTotalAmountVisible = isVisible;
        break;
      case "paymenttype":
        this.isSchdlePymntTypeVisible = isVisible;
        this.uiPageSetting.isSchdlePymntTypeVisible = isVisible;
        break;
      case "paymentsleft":
        this.isSchdlePymntLeftVisible = isVisible;
        this.uiPageSetting.isSchdlePymntLeftVisible = isVisible;
        break;
      case "nextpaymentdate":
        this.isSchdlePymntNextDateVisible = isVisible;
        this.uiPageSetting.isSchdlePymntNextDateVisible = isVisible;
        break;
      case "scheduledamount":
        this.isSchdlePymntScheduleAmountVisible = isVisible;
        this.uiPageSetting.isSchdlePymntScheduleAmountVisible = isVisible;
        break;
      case "status":
        this.isSchdlePymntStatusVisible = isVisible;
        this.uiPageSetting.isSchdlePymntStatusVisible = isVisible;
        break;
      case "campaign":
        this.isSchdlePymntCampaignVisible = isVisible;
        this.uiPageSetting.isSchdlePymntCampaignVisible = isVisible;
        break;
      case "frequency":
        this.isSchdlePymntFrequencyVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFrequencyVisible = isVisible;
        break;
      case "location":
        this.isSchdlePymntLocationVisible = isVisible;
        this.uiPageSetting.isSchdlePymntLocationVisible = isVisible;
        break;
      case "reason":
        this.isSchdlePymntReasonVisible = isVisible;
        this.uiPageSetting.isSchdlePymntReasonVisible = isVisible;
        break;
      case "reason#":
        this.isSchdlePymntReasonNumberVisible = isVisible;
        this.uiPageSetting.isSchdlePymntReasonNumberVisible = isVisible;
        break;
      case "collector":
        this.isSchdlePymntCollectorVisible = isVisible;
        this.uiPageSetting.isSchdlePymntCollectorVisible = isVisible;
        break;
      case "phonenumber":
        this.isSchdlePymntPhoneVisible = isVisible;
        this.uiPageSetting.isSchdlePymntPhoneVisible = isVisible;
        break;
      case "failedcount":
        this.isSchdlePymntFailedCountVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFailedCountVisible = isVisible;
        break;
      case "note":
        this.isSchdlePymntNoteVisible = isVisible;
        this.uiPageSetting.isSchdlePymntNoteVisible = isVisible;
        break;
      case "source":
        this.isSchdlePymntDeviceVisible = isVisible;
        this.uiPageSetting.isSchdlePymntDeviceVisible = isVisible;
        break;
      case "account#":
        this.isSchdlePymntAccountNoVisible = isVisible;
        this.uiPageSetting.isSchdlePymntAccountNoVisible = isVisible;
        break;
      case "donorenglishname":
        this.isSchdlePymntDonorEnglishVisible = isVisible;
        this.uiPageSetting.isSchdlePymntDonorEnglishVisible = isVisible;
        break;
      case "address":
        this.isSchdlePymntAddressVisible = isVisible;
        this.uiPageSetting.isSchdlePymntAddressVisible = isVisible;
        break;
      case "citystatezip":
        this.isSchdlePymntCityStateZipVisible = isVisible;
        this.uiPageSetting.isSchdlePymntCityStateZipVisible = isVisible;
        break;
      case "email":
        this.isSchdlePymntEmailVisible = isVisible;
        this.uiPageSetting.isSchdlePymntEmailVisible = isVisible;
        break;
      case "group":
        this.isSchdlePymntGroupVisible = isVisible;
        this.uiPageSetting.isSchdlePymntGroupVisible = isVisible;
        break;
      case "class":
        this.isSchdlePymntClassVisible = isVisible;
        this.uiPageSetting.isSchdlePymntClassVisible = isVisible;
        break;
      case "father":
        this.isSchdlePymntFatherVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFatherVisible = isVisible;
        break;
      case "fatherinlaw":
        this.isSchdlePymntFatherInLawVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFatherInLawVisible = isVisible;
        break;
      case "totalpaid":
        this.isSchdlePymntTotalPaidVisible = isVisible;
        this.uiPageSetting.isSchdlePymntTotalPaidVisible = isVisible;
        break;
      case "totalopen":
        this.isSchdlePymntTotalOpenVisible = isVisible;
        this.uiPageSetting.isSchdlePymntTotalOpenVisible = isVisible;
        break;
      case "notprocessed":
        this.isSchdlePymntNotProcessedVisible = isVisible;
        this.uiPageSetting.isSchdlePymntNotProcessedVisible = isVisible;
        break;
      case "englishtitle":
        this.isSchdlePymntEnglishTitleColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntEnglishTitleColVisible = isVisible;
        break;
      case "englishfirstname":
        this.isSchdlePymntFirstNameColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFirstNameColVisible = isVisible;
        break;
      case "englishlastname":
        this.isSchdlePymntLastNameColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntLastNameColVisible = isVisible;
        break;
      case "yiddishfirsttitle":
        this.isSchdlePymntTitleJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntTitleJewishColVisible = isVisible;
        break;
      case "yiddishfirstname":
        this.isSchdlePymntFirstNameJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntFirstNameJewishColVisible = isVisible;
        break;
      case "yiddishlastname":
        this.isSchdlePymntLastNameJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntLastNameJewishColVisible = isVisible;
        break;
      case "yiddishlasttitle":
        this.isSchdlePymntSuffixJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePymntSuffixJewishColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }
  checkColVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    return col ? col[colName] : false;
  }

  checkVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    if (col) {
      return col[colName];
    } else {
      return this.checkGridColVisibility(colName);
    }
  }
  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        return this.isSchdlePymntNoVisible;
      case "createddatetime":
        return this.isSchdlePymntDateTimeVisible;
      case "donorjewishname":
        return this.isSchdlePymntDonorVisible;
      case "totalamount":
        return this.isSchdlePymntTotalAmountVisible;
      case "paymenttype":
        return this.isSchdlePymntTypeVisible;
      case "paymentsleft":
        return this.isSchdlePymntLeftVisible;
      case "nextpaymentdate":
        return this.isSchdlePymntNextDateVisible;
      case "scheduledamount":
        return this.isSchdlePymntScheduleAmountVisible;
      case "hebrewdate": //added
        return this.isSchdlePaymentJewishDateColVisible;
      case "status":
        return this.isSchdlePymntStatusVisible;
      case "campaign":
        return this.isSchdlePymntCampaignVisible;
      case "frequency":
        return this.isSchdlePymntFrequencyVisible;
      case "location":
        return this.isSchdlePymntLocationVisible;
      case "reason":
        return this.isSchdlePymntReasonVisible;
      case "reason#":
        return this.isSchdlePymntReasonNumberVisible;
      case "collector":
        return this.isSchdlePymntCollectorVisible;
      case "phonenumber":
        return this.isSchdlePymntPhoneVisible;
      case "failedcount":
        return this.isSchdlePymntFailedCountVisible;
      case "note":
        return this.isSchdlePymntNoteVisible;
      case "source":
        return this.isSchdlePymntDeviceVisible;
      case "account#":
        return this.isSchdlePymntAccountNoVisible;
      case "donorenglishname":
        return this.isSchdlePymntDonorEnglishVisible;
      case "address":
        return this.isSchdlePymntAddressVisible;
      case "citystatezip":
        return this.isSchdlePymntCityStateZipVisible;
      case "email":
        return this.isSchdlePymntEmailVisible;
      case "group":
        return this.isSchdlePymntGroupVisible;
      case "class":
        return this.isSchdlePymntClassVisible;
      case "father":
        return this.isSchdlePymntFatherVisible;
      case "fatherinlaw":
        return this.isSchdlePymntFatherInLawVisible;
      case "totalpaid":
        return this.isSchdlePymntTotalPaidVisible;
      case "totalopen":
        return this.isSchdlePymntTotalOpenVisible;
      case "notprocessed":
        return this.isSchdlePymntNotProcessedVisible;
      case "englishtitle":
        return this.isSchdlePymntEnglishTitleColVisible;
      case "englishfirstname":
        return this.isSchdlePymntFirstNameColVisible;
      case "englishlastname":
        return this.isSchdlePymntLastNameColVisible;
      case "yiddishfirsttitle":
        return this.isSchdlePymntTitleJewishColVisible;
      case "yiddishfirstname":
        return this.isSchdlePymntFirstNameJewishColVisible;
      case "yiddishlastname":
        return this.isSchdlePymntLastNameJewishColVisible;
      case "yiddishlasttitle":
        return this.isSchdlePymntSuffixJewishColVisible;
    }
  }
  datesUpdated(event) {
    $("#schpymt_localsearch").val("");
    $("#schpymt_select_all").prop("checked", false);
    this.isSelected = false;
    this.recordSelectedArray = [];
    if (this.isinitialize == 2) {
      this.selectedDateRange = event;
      this.searchScheduleTransactionsData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
        this.isinitialize = 1;
      }
    } else {
      this.isinitialize += 1;
    }
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }

  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search",
    };
    const modalRef = this.commonMethodService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isScheduleTab = true;
    modalRef.componentInstance.AdvancedFilterData = this.pageSyncService
      .schedulepaymentFilterData
      ? this.pageSyncService.schedulepaymentFilterData
      : this.objAdvancedSearch;
    modalRef.componentInstance.isSearchTitle = "SchedulePayment";
    modalRef.componentInstance.FeatureName =
      "Filter_Scheduled_payments_and_pledges";
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedSearchData(objResponse, true);
      }
    );
  }

  advancedSearchData(objResponse, value) {
    this.objAdvancedSearch = objResponse;
    if (value) {
      this.searchScheduleTransactionsData();
    }
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

  selectRecord(event, type, firstScheduleId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isSelected = true;

        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.firstScheduleId);
        });
      } else {
        this.isSelected = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.isSelected = false;
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(firstScheduleId)) {
          this.recordSelectedArray.push(firstScheduleId);
        }
        if (this.recordSelectedArray.length > 1) {
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(firstScheduleId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == firstScheduleId)
              this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
        }
      }
    }
  }

  checkselectRecord(scheduleId): Boolean {
    return this.recordSelectedArray.includes(scheduleId);
  }

  totalSelectedShow(): number {
    return this.recordSelectedArray.length;
  }

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbySchedulePayment = cardType;
    $("#schpymt_select_all").prop("checked", false);
    this.isSelected = false;
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
      if (cardType[0].itemName == "Donor") {
        this.paymentTypeChipData = this.sumByDonorPayments;
      }

      if (cardType[0].itemName == "Location") {
        this.paymentTypeChipData = this.sumByLocationPayments;
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
    }
    this.changeSortType(this.sortType);
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    var sortId = sortType.map((s) => s.id).toString();
    var allTypeCard = this.paymentTypeChipData.filter(
      (x) => x.paymentType == "ALL"
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.paymentType != "ALL"
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
        this.paymentTypeChipData.unshift(allTypeCard[0]);
      } else {
        this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
          a.paymentType > b.paymentType
            ? 1
            : b.paymentType > a.paymentType
            ? -1
            : 0
        );
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
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 4) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.totalAmount > b.totalAmount
          ? 1
          : b.totalAmount > a.totalAmount
          ? -1
          : 0
      );
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    }
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
          totalAmount: _.sumBy(props, "totalSumCardAmount"),
          pending: _.sumBy(props, "totalOpen"),
          recent: _.sumBy(props, "totalPaid"),
          notProcessedValue: _.sumBy(props, "notProcessed"),
          notProcessed:
            "Not processed " +
            this.commonMethodService.formatAmount(
              _.sumBy(props, "notProcessed")
            ),
        };
      })
      .value();
  }

  calculateAllSumByFields(list) {
    list.forEach((element) => {
      element.totalSumCardAmount =
        element.totalOpen + element.totalPaid + element.notProcessed;
    });
    const totalAmount = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.totalSumCardAmount;
        return sumOfArray;
      },
      0
    );

    const pending = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.totalOpen;
        return sumOfArray;
      },
      0
    );

    const recent = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.totalPaid;
        return sumOfArray;
      },
      0
    );

    const notProcessed = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.notProcessed;
        return sumOfArray;
      },
      0
    );
    const allKeyObj = {
      paymentCount: list.length,
      paymentType: "ALL",
      paymentTypeChipCSSClass: "info-box bg-gradient-info",
      paymentTypeId: -2,
      totalAmount: totalAmount,
      pending: pending,
      recent: recent,
      notProcessedValue: notProcessed,
      notProcessed:
        "Not proccessed " + this.commonMethodService.formatAmount(notProcessed),
    };
    const byReason = this.calculatesumBy(list, "reasonId", "reasonName");
    const byCampaign = this.calculatesumBy(list, "campaignId", "campaign");
    const byLocation = this.calculatesumBy(list, "locationId", "locationName");
    const byCollector = this.calculatesumBy(list, "collectorId", "collector");
    const bySource = this.calculatesumBy(list, "deviceId", "deviceName");

    this.sumByReasonPayments = [allKeyObj, ...byReason];
    this.sumByCampaignPayments = [allKeyObj, ...byCampaign];
    this.sumByLocationPayments = [allKeyObj, ...byLocation];
    this.sumByDonorPayments = [allKeyObj, ...byCollector];
    this.sumBySourcePayments = [allKeyObj, ...bySource];
  }

  searchScheduleTransactionsData() {
    this.isloading = true;
    this.changeDetectorRef.detectChanges();
    $("#schpymt_localsearch").val("");
    $("#schpymt_select_all").prop("checked", false);
    this.isSelected = false;
    var objAdvancedSearchData: any = {};
    if (this.objAdvancedSearch) {
      // Get only Id values for multi select dropdown
      objAdvancedSearchData = {
        AdvancedFields:
          this.objAdvancedSearch.AdvancedFields &&
          this.objAdvancedSearch.AdvancedFields.length > 0
            ? this.objAdvancedSearch.AdvancedFields.map((o) => ({
                name: o.name,
                value: o.value,
              }))
            : null,
        donors:
          this.objAdvancedSearch.donors.length > 0
            ? this.objAdvancedSearch.donors.map((s) => s.id)
            : null,
        paymentTypes:
          this.objAdvancedSearch.paymentTypes.length > 0
            ? this.objAdvancedSearch.paymentTypes.map((s) => s.id)
            : null,
        minAmount: this.objAdvancedSearch.minAmount,
        maxAmount: this.objAdvancedSearch.maxAmount,
        paymentReason:
          this.objAdvancedSearch.paymentReason.length > 0
            ? this.objAdvancedSearch.paymentReason
                .map((s) => s.id)
                .toString() != ""
              ? this.objAdvancedSearch.paymentReason
                  .map((s) => s.id)
                  .filter((x) => x != null)
              : []
            : null,
        collectors:
          this.objAdvancedSearch.collectors.length > 0
            ? this.objAdvancedSearch.collectors.map((s) => s.id).toString() !=
              ""
              ? this.objAdvancedSearch.collectors
                  .map((s) => s.id)
                  .filter((x) => x != null)
              : null
            : null,
        locations:
          this.objAdvancedSearch.locations.length > 0
            ? this.objAdvancedSearch.locations.map((s) => s.id).toString() != ""
              ? this.objAdvancedSearch.locations
                  .map((s) => s.id)
                  .filter((x) => x != null)
              : null
            : null,
        campaignIds:
          this.objAdvancedSearch.campaigns.length > 0
            ? this.objAdvancedSearch.campaigns.map((s) => s.id).toString() != ""
              ? this.objAdvancedSearch.campaigns
                  .map((s) => s.id)
                  .filter((x) => x != null)
              : null
            : null,
        deviceTypes:
          this.objAdvancedSearch.deviceTypes.length > 0
            ? this.objAdvancedSearch.deviceTypes.map((s) => s.id)
            : null,
        orderDeviceStatusIds:
          this.objAdvancedSearch.orderDeviceStatus.length > 0
            ? this.objAdvancedSearch.orderDeviceStatus.map((s) => s.id)
            : null,
        paymentDevices:
          this.objAdvancedSearch.paymentDevices.length > 0
            ? this.objAdvancedSearch.paymentDevices.map((s) => s.id)
            : null,
        approvals:
          this.objAdvancedSearch.approvals.length > 0
            ? this.objAdvancedSearch.approvals.map((s) => s.id)
            : null,
        scheduleRepeatType:
          this.objAdvancedSearch.scheduleRepeatType.length > 0
            ? this.objAdvancedSearch.scheduleRepeatType.map((s) => s.id)
            : null,

        paymentStatusIds:
          this.objAdvancedSearch.paymentStatus.length > 0
            ? this.objAdvancedSearch.paymentStatus.map((s) => s.id)
            : null,
        scheduleStatusIds:
          this.objAdvancedSearch.scheduleStatus.length > 0
            ? this.objAdvancedSearch.scheduleStatus.map((s) => s.id)
            : null,
        fullName: this.objAdvancedSearch.fullName,
        city: this.objAdvancedSearch.city,
        state: this.objAdvancedSearch.state,
        zip: this.objAdvancedSearch.zip,
        street: this.objAdvancedSearch.street,
        cityStateZip:
          this.objAdvancedSearch.cityStateZip &&
          this.objAdvancedSearch.cityStateZip.length > 0
            ? this.objAdvancedSearch.cityStateZip.map((a) => ({
                city: a.city,
                state: a.state,
                zip: a.zip,
              }))
            : null,
        // "cityStateZip": this.objAdvancedSearch.cityStateZip.length > 0 ? this.objAdvancedSearch.cityStateZip.map(s => s.itemName) : null,
        defaultLocation:
          this.objAdvancedSearch.defaultLocation.length > 0
            ? this.objAdvancedSearch.defaultLocation.map((s) => s.id)
            : null,
        group: this.objAdvancedSearch.group,
        class: this.objAdvancedSearch.class,
        note: this.objAdvancedSearch.note,
        phone: this.objAdvancedSearch.phone,
        email: this.objAdvancedSearch.email,
        isReasonNoOptionSelected:
          this.objAdvancedSearch.isReasonNoOptionSelected,
        isCampaignNoOptionSelected:
          this.objAdvancedSearch.isCampaignNoOptionSelected,
        isLocationNoOptionSelected:
          this.objAdvancedSearch.isLocationNoOptionSelected,
        isCollectorNoOptionSelected:
          this.objAdvancedSearch.isCollectorNoOptionSelected,
        isShowOnlyFailed: this.objAdvancedSearch.isShowOnlyFailed,
      };

      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (filtervalue == undefined || filtervalue.length == 0) {
        } else {
          let valNoOption = false;
          let val = false;
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
              valNoOption = true;
            }
          } else {
            val = true;
          }

          if (valNoOption === false && val === true) {
            this.filtercount += 1;
          }

          if (valNoOption === true && val == true) {
            this.filtercount -= 2;
          }

          valNoOption = false;
          val = false;
        }
      }
    } else {
      objAdvancedSearchData = {
        scheduleStatusIds: [1],
      };
    }
    var objsearchScheduleTrans = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      objAdvancedSearchFilter: objAdvancedSearchData,
      dueDateWeekSearchFilter: this.selectedWeekSearchFilter,
      dueDate: this.selectedDueDate,
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
      cardType:
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null,
      scheduleTypeId: 1,
    };

    this.scheduleService.getScheduleList(objsearchScheduleTrans).subscribe(
      (res: any) => {
        // hide loader
        if (res) {
          this.calculateAllSumByFields(res.scheduleTransGridModel);

          for (var i = 0; i < res.scheduleTransGridModel.length; i++) {
            if (
              res.scheduleTransGridModel[i].phones &&
              res.scheduleTransGridModel[i].phones.indexOf(",") > -1
            ) {
              var phoneNoArray =
                res.scheduleTransGridModel[i].phones.split(",");
              res.scheduleTransGridModel[i].phoneNumberList = phoneNoArray;
              phoneNoArray = phoneNoArray.slice(0, 2);
              for (var j = 0; j < phoneNoArray.length; j++) {
                if (res.scheduleTransGridModel[i].phoneNo)
                  res.scheduleTransGridModel[i].phoneNo =
                    res.scheduleTransGridModel[i].phoneNo +
                    "<br>" +
                    this.formatPhoneNumber(phoneNoArray[j]);
                else
                  res.scheduleTransGridModel[i].phoneNo =
                    this.formatPhoneNumber(phoneNoArray[j]);
              }
            } else {
              res.scheduleTransGridModel[i].phoneNo = this.formatPhoneNumber(
                res.scheduleTransGridModel[i].phones
              );
              res.scheduleTransGridModel[i].phoneNumberList =
                res.scheduleTransGridModel[i].phones;
            }
            if (
              res.scheduleTransGridModel[i].emailAddress &&
              res.scheduleTransGridModel[i].emailAddress.indexOf(",") > -1
            ) {
              var emailArray =
                res.scheduleTransGridModel[i].emailAddress.split(",");
              res.scheduleTransGridModel[i].emailList = emailArray;
              emailArray = emailArray.slice(0, 2);
              for (var j = 0; j < emailArray.length; j++) {
                if (res.scheduleTransGridModel[i].emailLabels2)
                  res.scheduleTransGridModel[i].emailLabels2 =
                    res.scheduleTransGridModel[i].emailLabels2 +
                    "<br>" +
                    emailArray[j];
                else res.scheduleTransGridModel[i].emailLabels2 = emailArray[j];
              }
            } else {
              res.scheduleTransGridModel[i].emailLabels2 =
                res.scheduleTransGridModel[i].emailAddress;
              res.scheduleTransGridModel[i].emailList =
                res.scheduleTransGridModel[i].emailAddress;
            }
            res.scheduleTransGridModel[i].scheduleStatus =
              res.scheduleTransGridModel[i].scheduleStatus != null
                ? res.scheduleTransGridModel[i].scheduleStatus.toUpperCase()
                : null;
            if (res.scheduleTransGridModel[i].donorJewish == null) {
              res.scheduleTransGridModel[i].donorJewish =
                res.scheduleTransGridModel[i].donor;
            }
          }
          if (res.scheduleTransGridModel) {
            res.scheduleTransGridModel.forEach((s) => {
              if (s.scheduleStatus == "CANCELED") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "COMPLETED") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "FAILED") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "PENDING") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "SCHEDULED") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "PAUSED") {
                s.status_class = "schdl_paused";
              }
            });
          }
          this.gridData = res.scheduleTransGridModel;
          this.gridFilterData = this.gridData;
          this.pageSyncService.schedulePaymentTransList = this.gridFilterData;
          var timezone =
            this.commonMethodService.getTimeZoneFromLoginCurrency();
          this.pageSyncService.lastSyncScheduleTime =
            this.commonMethodService.convertUTCToTimezone(new Date(), timezone);
          this.pageSyncService.calculateTimeDifference("schedule");
          this.resGridDataModification(res.scheduleTransGridModel);
          this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
          this.pageSyncService.schedulePaymentTransList = [];
          this.paymentTypeChipData = null;
          this.recordSelectedArray = [];
          this.pageSyncService.schedulePaymentTransList = [];
          this.isloading = false;
        }
        this.changeDetectorRef.detectChanges();
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

  resGridDataModification(scheduleTransGridModel) {
    this.totalRecord = scheduleTransGridModel.length;
    this.sumByWeekPayments = this.commonMethodService.getSumByWeekPayments(
      scheduleTransGridModel,
      "nextPaymentDate",
      "totalAmount"
    );
    this.sumByMonthPayments = this.commonMethodService.getSumByMonthPayments(
      scheduleTransGridModel,
      "nextPaymentDate",
      "totalAmount"
    );
    this.sumByYearPayments = this.commonMethodService.getSumByYearPayments(
      scheduleTransGridModel,
      "nextPaymentDate",
      "totalAmount"
    );
    this.recordSelectedArray = [];
    this.cardTypeChange(this.cardType);
    this.changeSortType(this.sortType);
    this.initMultiSelect();
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  RefreshList() {
    this.searchScheduleTransactionsData();
    // this.commonMethodService.sendPledgeSchdleTrans(true);
  }

  search(keyword) {
    if (this.isTabulator) {
      this._search$.next(keyword);
      return;
    }

    $("#schpymt_select_all").prop("checked", false);
    this.isSelected = false;
    this.recordSelectedArray = [];
    var record = this.gridData;
    var filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[()-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.donor &&
              obj.donor.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.scheduleNum &&
              obj.scheduleNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.note &&
              obj.note.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.locationName &&
              obj.locationName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phones &&
              obj.phones.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.collector &&
              obj.collector.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalAmount &&
              obj.totalAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentType &&
              obj.paymentType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentLeft &&
              obj.paymentLeft.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleStatus &&
              obj.scheduleStatus.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.donorJewish &&
              obj.donorJewish.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.failed &&
              obj.failed.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.deviceName &&
              obj.deviceName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailAddress &&
              obj.emailAddress.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.father &&
              obj.father.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fatherInLaw &&
              obj.fatherInLaw.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaign &&
              obj.campaign.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.frequency &&
              obj.frequency.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalPaid &&
              obj.totalPaid.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalOpen &&
              obj.totalOpen.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.notProcessed &&
              obj.notProcessed.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
  }

  GetScheduleTransByPaymentChipType(objPaymentTypeChip) {
    if (this.isTabulator) {
      this.GetScheduleTransByPaymentChipTypeNew(objPaymentTypeChip);
      return;
    }

    if (objPaymentTypeChip) {
      $("#schpymt_select_all").prop("checked", false);
      this.isSelected = false;
      this.recordSelectedArray = [];
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null;
      this.isFiltered = false;
      switch (cardTypeValue) {
        case "1": //Pledge
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.campaignId == objPaymentTypeChip.paymentTypeId
            );
            this.isFiltered = true;
            this.filterRecord = this.gridFilterData.length;
          }
          break;
        case "2": //Reason
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.reasonId == objPaymentTypeChip.paymentTypeId
            );
            this.isFiltered = true;
            this.filterRecord = this.gridFilterData.length;
          }
          break;
        case "3": //Location
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.locationId == objPaymentTypeChip.paymentTypeId
            );
            this.isFiltered = true;
            this.filterRecord = this.gridFilterData.length;
          }
          break;
        case "4": //Donor
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.accountId == objPaymentTypeChip.paymentTypeId
            );
            this.isFiltered = true;
            this.filterRecord = this.gridFilterData.length;
          }
          break;
        case "5": //Source
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.deviceId == objPaymentTypeChip.paymentTypeId
            );
            this.isFiltered = true;
            this.filterRecord = this.gridFilterData.length;
          }
          break;
        case "9": //Week
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.nextPaymentDate).format("YYYY-WW").toString() ==
                objPaymentTypeChip.paymentType
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "10": //Month
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.nextPaymentDate).format("MMMM").toString() ==
                objPaymentTypeChip.paymentType
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "11": //Year
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                moment(s.nextPaymentDate).format("YYYY").toString() ==
                objPaymentTypeChip.paymentType
            );
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
    this.searchScheduleTransactionsData();
  }
  openImportPledgePopup() {
    const modalRef = this.commonMethodService.openPopup(
      ImportScheduleComponent
    );
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

  openSchedulePaymentCardPopup(scheduleNum) {
    if (scheduleNum != null && scheduleNum != 0) {
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
        scheduleId: scheduleNum,
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
      modalRef.componentInstance.emtScheduleUpdate.subscribe((res: any) => {
        this.searchScheduleTransactionsData();
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

  openCollectorCardPopup(collectorId) {
    if (collectorId != null && collectorId != 0) {
      this.isloading = true;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup collector_card",
      };
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
            const modalRef = this.commonMethodService.openPopup(
              CollectorCardPopupComponent,
              this.modalOptions
            );
            modalRef.componentInstance.CollectorCardData = res;
            modalRef.componentInstance.CollectorId = collectorId;
          } else {
            Swal.fire({
              title: "",
              text: "No data found",
              icon: "info",
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
              confirmButtonText: this.commonMethodService
                .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
                .commonMethodService.getTranslate(
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
        modalRef.componentInstance.DonorCardData = res;
      });
    }
  }

  public downloadExcel() {
    if (this.isTabulator) {
      this.downloadExcelNew();
      return;
    }

    this.isloading = true;
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let results = this.gridFilterData && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let ScheduleNo = item && item.scheduleNum;
        let DateTime = item && item.createdDate;
        let Donor = item && item.donorJewish;
        let TotalAmount = item && item.totalAmount;
        let PaymentType = item && item.paymentType;
        let PaymentLeft = item && item.paymentLeft;
        let NextPaymentDate = item && item.nextPaymentDate;
        let ScheduledAmount = item && item.scheduleAmount;
        let ScheduleStatus = item && item.scheduleStatus;
        let Frequency = item && item.frequency;
        let Location = item && item.locationName;
        let Reason = item && item.reasonName;
        let ReasonNumber = item && item.reasonNumber;
        let Collector = item && item.collector;
        let PhoneNumber = item && item.phones;
        let Campaign = item && item.campaign;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;
        let Failed = item && item.failed;
        let Note = item && item.note;
        let Device = item && item.devicename;
        let AccountNo = item && item.accountNum;
        let DonorEnglis = item && item.donor;
        let Address = item && item.address;
        let CityStateZip = item && item.cityStateZip;
        let Email = item && item.emailAddress;
        let Group = item && item.group;
        let Class = item && item.class;
        let TotalPaid = item && item.totalPaid;
        let TotalOpen = item && item.totalOpen;
        let NotProcessed = item && item.notProcessed;
        let Title = item && item.title;
        let FirstName = item && item.firstName;
        let LastName = item && item.lastName;
        let TitleJewish = item && item.titleJewish;
        let FirstNameJewish = item && item.firstNameJewish;
        let LastNameJewish = item && item.lastNameJewish;
        let SuffixJewish = item && item.suffixJewish;
        let ScheduleJewishDate = item && item.scheduleJewishDate;

        let row = {};
        if (this.isSchdlePymntNoVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULE#")
            : "Schedule #";
          row[ColName] = ScheduleNo;
        }
        if (this.isSchdlePymntDonorVisible) {
          row["Donor Jewish Name"] = Donor;
        }
        if (this.isSchdlePaymentJewishDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("HEBREWDATE")
            : "Hebrew Date";
          row[ColName] = ScheduleJewishDate;
        }
        if (this.isSchdlePymntTotalAmountVisible) {
          // row['Total Amount']=this.commonMethodService.formatAmount(item.totalAmount);
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALAMOUNT")
            : "Total Amount";
          row[ColName] = Number(item.totalAmount);
        }
        if (this.isSchdlePymntDateTimeVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CREATEDDATETIME")
            : "Created Date & Time";
          row[ColName] = this.datePipe.transform(item.createdDate, "name-long");
        }
        if (this.isSchdlePymntScheduleAmountVisible) {
          // row['Scheduled Amount']=this.commonMethodService.formatAmount(item.scheduleAmount);
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULEDAMOUNT")
            : "Scheduled Amount";
          row[ColName] = Number(item.scheduleAmount);
        }
        if (this.isSchdlePymntNextDateVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NEXTPAYMENTDATE")
            : "Next Payment Date";
          row[ColName] = this.datePipe.transform(item.nextPaymentDate);
        }
        if (this.isSchdlePymntLeftVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTSLEFT")
            : "Payments Left";
          row[ColName] = PaymentLeft;
        }
        if (this.isSchdlePymntStatusVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATUS")
            : "Status";
          row[ColName] = ScheduleStatus;
        }
        if (this.isSchdlePymntFrequencyVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FREQUENCY")
            : "Frequency";
          row[ColName] = Frequency;
        }
        if (this.isSchdlePymntTypeVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTTYPE")
            : "Payment Type";
          row[ColName] = PaymentType;
        }
        if (this.isSchdlePymntFailedCountVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FAILEDCOUNT")
            : "Failed Count";
          row[ColName] = Failed;
        }
        if (this.isSchdlePymntNoteVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTE")
            : "Note";
          row[ColName] = Note;
        }
        if (this.isSchdlePymntCampaignVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CAMPAIGN")
            : "Campaign";
          row[ColName] = Campaign;
        }
        if (this.isSchdlePymntReasonVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON")
            : "Reason";
          row[ColName] = Reason;
        }

        if (this.isSchdlePymntReasonNumberVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON#")
            : "Reason #";
          row[ColName] = ReasonNumber;
        }

        if (this.isSchdlePymntLocationVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LOCATION")
            : "Location";
          row[ColName] = Location;
        }

        if (this.isSchdlePymntCollectorVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COLLECTOR")
            : "Collector";
          row[ColName] = Collector;
        }
        if (this.isSchdlePymntDeviceVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SOURCE")
            : "Source";
          row[ColName] = Device;
        }
        if (this.isSchdlePymntAccountNoVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACCOUNT#")
            : "Account #";
          row[ColName] = AccountNo;
        }
        if (this.isSchdlePymntDonorEnglishVisible) {
          row["Donor English Name"] = DonorEnglis;
        }
        if (this.isSchdlePymntAddressVisible) {
          row["House Num"] = item.defaultHouseNum;
          row["Street Name"] = item.defaultStreetName;
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("APT")
            : "Apt";
          row[ColName] = item.defaultUnit;
        }
        if (this.isSchdlePymntCityStateZipVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CITY")
            : "City";
          row[ColName] = item.defaultCity;
          let ColName2: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATE")
            : "State";
          row[ColName2] = item.defaultState;
          let ColName3: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ZIP")
            : "Zip";
          row[ColName3] = item.defaultZip;
        }
        if (this.isSchdlePymntPhoneVisible) {
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
        if (this.isSchdlePymntEmailVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] = Email;
        }
        if (this.isSchdlePymntGroupVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("GROUP")
            : "Group";
          row[ColName] = Group;
        }
        if (this.isSchdlePymntClassVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CLASS")
            : "Class";
          row[ColName] = Class;
        }
        if (this.isSchdlePymntFatherVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHER")
            : "Father";
          row[ColName] = Father;
        }
        if (this.isSchdlePymntFatherInLawVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHERINLAW")
            : "Father in law";
          row[ColName] = FatherInLaw;
        }
        if (this.isSchdlePymntTotalPaidVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALPAID")
            : "Total Paid";
          row[ColName] = this.commonMethodService.formatAmount(item.totalPaid);
        }
        if (this.isSchdlePymntTotalOpenVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALOPEN")
            : "Total Open";
          row[ColName] = this.commonMethodService.formatAmount(item.totalOpen);
        }
        if (this.isSchdlePymntNotProcessedVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTPROCESSED")
            : "Not Processed";
          row[ColName] = this.commonMethodService.formatAmount(
            item.notProcessed
          );
        }
        //added new
        if (this.isSchdlePymntEnglishTitleColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHTITLE")
            : "English Title";
          row[ColName] = Title;
        }
        if (this.isSchdlePymntFirstNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHFIRSTNAME")
            : "English First name";
          row[ColName] = FirstName;
        }
        if (this.isSchdlePymntLastNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHLASTNAME")
            : "English Last name";
          row[ColName] = LastName;
        }
        if (this.isSchdlePymntTitleJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTTITLE")
            : "Yiddish First Title";
          row[ColName] = TitleJewish;
        }
        if (this.isSchdlePymntFirstNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTNAME")
            : "Yiddish First name";
          row[ColName] = FirstNameJewish;
        }
        if (this.isSchdlePymntLastNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTNAME")
            : "Yiddish Last name";
          row[ColName] = LastNameJewish;
        }
        if (this.isSchdlePymntSuffixJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTTITLE")
            : "Yiddish Last Title";
          row[ColName] = SuffixJewish;
        }
        data.push(row);
      });
    } else {
      this.isloading = false;
      return;
    }

    const filename = this.xlsxService.getFilename("Schedule Payment List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Find Total amount, Scheduled Amount, Schedule Created, Schedule next column
    let totalAmountColumn = null;
    let scheduleAmountColumn = null;
    let scheduleCreatedDateColumn = null;
    let scheduleNextColumn = null;
    for (var R = range.s.r; R < 1; ++R) {
      for (var C = range.s.c; C <= range.e.c; ++C) {
        var cell_address = { c: C, r: R };
        var cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!worksheet[cell_ref]) continue;
        if (worksheet[cell_ref].v == "Total Amount") {
          totalAmountColumn = C;
        }

        if (worksheet[cell_ref].v == "Scheduled Amount") {
          scheduleAmountColumn = C;
        }

        if (worksheet[cell_ref].v == "Created Date & Time") {
          scheduleCreatedDateColumn = C;
        }

        if (worksheet[cell_ref].v == "Next Payment Date") {
          scheduleNextColumn = C;
        }
      }
    }

    let fmt = '"$"#,##0.00_);\\("$"#,##0.00\\)';
    let _currencyFormat = "$#,##0.00";
    for (var R = range.s.r; R <= range.e.r; ++R) {
      if (R == 0) continue;
      if (!!totalAmountColumn) {
        let amount_cell_address = { c: totalAmountColumn, r: R };
        let amount_cell_ref = XLSX.utils.encode_cell(amount_cell_address);
        if (worksheet[amount_cell_ref]) {
          worksheet[amount_cell_ref].t = "n";
          // worksheet[amount_cell_ref].t='s';
          // worksheet[amount_cell_ref].z=fmt;
          worksheet[amount_cell_ref].z = _currencyFormat;
        }
      }

      if (!!scheduleAmountColumn) {
        let schedule_amount_cell_address = { c: scheduleAmountColumn, r: R };
        let schedule_amount_cell_ref = XLSX.utils.encode_cell(
          schedule_amount_cell_address
        );
        if (worksheet[schedule_amount_cell_ref]) {
          worksheet[schedule_amount_cell_ref].t = "n";
          //worksheet[schedule_amount_cell_ref].t='s';
          // worksheet[schedule_amount_cell_ref].z=fmt;
          worksheet[schedule_amount_cell_ref].z = _currencyFormat;
        }
      }

      if (!!scheduleCreatedDateColumn) {
        let schedule_date_cell_address = { c: scheduleCreatedDateColumn, r: R };
        let schedule_date_cell_ref = XLSX.utils.encode_cell(
          schedule_date_cell_address
        );
        if (worksheet[schedule_date_cell_ref]) {
          worksheet[schedule_date_cell_ref].t = "d";
        }
      }

      if (!!scheduleNextColumn) {
        let schedule_next_date_cell_address = { c: scheduleNextColumn, r: R };
        let schedule_next_date_cell_ref = XLSX.utils.encode_cell(
          schedule_next_date_cell_address
        );
        if (worksheet[schedule_next_date_cell_ref]) {
          worksheet[schedule_next_date_cell_ref].t = "d";
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
  }

  AdvancePrintReceipt() {}
  AdvanceSMSReceiptAction() {}
  AdvanceEmailReceiptAction() {}
  AdvanceMailReceiptAction() {}
  AdvanceReceiptAction() {}
  editTransactionInfoPopup() {}
  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "schedulePaymentCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .pipe(take(1))
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "SchedulePaymentTransPage" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.schedulepaymentCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.presetOption = this.EngHebCalPlaceholder;
          this.pageSyncService.schedulepaymentEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          this.class_id = this.hebrewEngishCalendarService.id;
          this.class_hid = this.hebrewEngishCalendarService.hid;
          this.searchScheduleTransactionsData();
        }
      });
  }

  onCellClick(clickEvent: CellClickEvent) {
    if (clickEvent.field === "scheduleNum") {
      this.openSchedulePaymentCardPopup(clickEvent.rowData.firstScheduleId);
      return;
    }

    if (clickEvent.field === "donorJewish") {
      this.openDonorCardPopup(clickEvent.rowData.accountId);
      return;
    }

    if (clickEvent.field === "campaign") {
      this.openCampaignCardPopup(clickEvent.rowData.campaignId);
      return;
    }

    if (clickEvent.field === "reasonName") {
      this.openReasonCardPopup(clickEvent.rowData.reasonId);
      return;
    }

    if (clickEvent.field === "locationName") {
      this.openLocationCardPopup(clickEvent.rowData.locationId);
      return;
    }

    if (clickEvent.field === "collector") {
      this.openCollectorCardPopup(clickEvent.rowData.collectorId);
      return;
    }

    if (clickEvent.field === "deviceName") {
      this.openDeviceCardPopup(clickEvent.rowData.deviceId);
      return;
    }

    if (clickEvent.field === "donor") {
      this.openDonorCardPopup(clickEvent.rowData.accountId);
      return;
    }
  }

  dropNew(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnNames, event.previousIndex, event.currentIndex);

    this.columnNames = this.columnNames.map((o) => {
      return {
        ...o,
      };
    });

    this.changeDetectorRef.detectChanges();
  }

  getIdForDropDownColumn(val: string) {
    return `${val}_test`;
  }

  setGridColVisibilityNew(objectField) {
    this.toggledFields.push(objectField);
    this.columnsVisibilitySubject.next(this.toggledFields);
  }

  GetScheduleTransByPaymentChipTypeNew(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      $("#schpymt_select_all").prop("checked", false);
      this.isSelected = false;
      this.recordSelectedArray = [];
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null;

      if (cardTypeValue === "1") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "campaignId",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);

        return;
      }

      if (cardTypeValue === "2") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "reasonId",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);

        return;
      }

      if (cardTypeValue === "3") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "locationId",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);

        return;
      }

      if (cardTypeValue === "4") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "accountId",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);
        return;
      }

      if (cardTypeValue === "5") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "deviceId",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);
        return;
      }

      if (cardTypeValue === "9") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "nextPaymentDate",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);
        return;
      }

      if (cardTypeValue === "10") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "nextPaymentDate",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);
        return;
      }

      if (cardTypeValue === "11") {
        if (objPaymentTypeChip.paymentTypeId == "-2") {
          this.filterQuery = [];
          this.afterChipChange(objPaymentTypeChip);
          return;
        }

        this.filterQuery = [
          {
            isCustomFilter: true,
            dataKey: "nextPaymentDate",
            filterValue: objPaymentTypeChip.paymentTypeId,
          },
        ];

        this.afterChipChange(objPaymentTypeChip);
        return;
      }
    }
  }

  afterChipChange(objPaymentTypeChip) {
    this.paymentTypeChipData.forEach(
      (ele) => (ele.paymentTypeChipCSSClass = "info-box bg-gradient-info")
    );
    objPaymentTypeChip.paymentTypeChipCSSClass = "info-box bg-gradient-success";
    this.changeDetectorRef.detectChanges();
  }

  public downloadExcelNew() {
    const filename = this.xlsxService.getFilename("Schedule Payment List");
    this.tabulatorComponent.downLoadExcel(filename);
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
