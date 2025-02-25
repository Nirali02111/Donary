import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { _fixedSizeVirtualScrollStrategyFactory } from "@angular/cdk/scrolling";
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
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CollectorCardPopupComponent } from "src/app/pages/cards/collector-card-popup/collector-card-popup.component";
import { CampaignCardPopupComponent } from "./../../../cards/campaign-card-popup/campaign-card-popup.component";
import { DeviceCardPopupComponent } from "src/app/pages/cards/device-card-popup/device-card-popup.component";
import { DonorCardPopupComponent } from "src/app/pages/cards/donor-card-popup/donor-card-popup.component";
import { LocationCardPopupComponent } from "src/app/pages/cards/location-card-popup/location-card-popup.component";
import { ReasonCardPopupComponent } from "src/app/pages/cards/reason-card-popup/reason-card-popup.component";
import { SchedulePledgecardPopupComponent } from "src/app/pages/cards/schedule-card-popup/schedule-pledgecard-popup/schedule-pledgecard-popup.component";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { LocationService } from "src/app/services/location.sevice";
import { ReasonService } from "src/app/services/reason.service";
import { CampaignService } from "./../../../../services/campaign.service";
import { CampaignCardDataResponse } from "./../../../../models/campaign-model";

import { ScheduleService } from "src/app/services/schedule.service";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as _ from "lodash";
import { SupportPopupComponent } from "../../support-popup/support-popup.component";
import { TransactionAdvancedFilterPopupComponent } from "../../transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { ImportScheduleComponent } from "../import-schedule/import-schedule.component";
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
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
import { environment } from "src/environments/environment";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;
@Component({
  selector: "app-schedule-pledge-transaction",
  templateUrl: "./schedule-pledge-transaction.component.html",
  styleUrls: ["./schedule-pledge-transaction.component.scss"],
  standalone: false,
  providers: [DonaryDateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePledgeTransactionComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  @ViewChild(TabulatorTableComponent, { static: false })
  tabulatorComponent: TabulatorTableComponent;

  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  objAdvancedSearch: any;
  isloading: boolean;
  selectedDateRange: any = { startDate: null, endDate: null };
  selectedWeekSearchFilter: string;
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
  isFiltered: boolean = false;
  isinitialize: number = 0;

  uiPageSettingId = null;
  uiPageSetting: any;

  EngHebCalPlaceholder: string = "All Time";
  presetClickId: string;
  id: string = "id_Clear";
  hid: string = "id_Clear";
  presetOption: string;

  colFields: any = [
    {
      colName: "SCHEDULE#",
      isVisible: true,
      colId: "SPledgenoId",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      isVisible: true,
      colId: "SPledgedonorId",
      disabled: true,
    },
    {
      colName: "TOTALAMOUNT",
      isVisible: true,
      colId: "SPledgetotalamountId",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      isVisible: false,
      colId: "SPledgedatetimeId",
      disabled: false,
    },
    {
      colName: "SCHEDULEDAMOUNT",
      isVisible: true,
      colId: "SPledgescheduleamountId",
      disabled: false,
    },
    {
      colName: "Next Pledge Date",
      isVisible: true,
      colId: "SPledgenextdateId",
      disabled: false,
    },
    {
      colName: "Pledges Left",
      isVisible: true,
      colId: "SPledgeleftId",
      disabled: false,
    },
    {
      colName: "STATUS",
      isVisible: true,
      colId: "SPledgestatusId",
      disabled: false,
    },
    {
      colName: "FREQUENCY",
      isVisible: true,
      colId: "SPledgefrequencyId",
      disabled: false,
    },
    {
      colName: "NOTE",
      isVisible: false,
      colId: "SPledgeNoteId",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      isVisible: true,
      colId: "SPledgecampaignId",
      disabled: false,
    },
    {
      colName: "REASON",
      isVisible: false,
      colId: "SPledgereasonId",
      disabled: false,
    },
    {
      colName: "REASON#",
      isVisible: false,
      colId: "SPledgereasonNumberId",
      disabled: false,
    },
    {
      colName: "LOCATION",
      isVisible: false,
      colId: "SPledgelocationId",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      isVisible: true,
      colId: "SPledgecollectorId",
      disabled: false,
    },
    {
      colName: "SOURCE",
      isVisible: false,
      colId: "SPledgedeviceId",
      disabled: false,
    },
    {
      colName: "Account #",
      isVisible: false,
      colId: "SPledgeaccountnoId",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      isVisible: false,
      colId: "SPledgedonorNameId",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      isVisible: false,
      colId: "SPledgeaddressId",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      isVisible: false,
      colId: "SPledgecitystatezipId",
      disabled: false,
    },
    {
      colName: "Phone Number",
      isVisible: false,
      colId: "SPledgephoneId",
      disabled: false,
    },
    {
      colName: "EMAIL",
      isVisible: false,
      colId: "SPledgeemailId",
      disabled: false,
    },
    {
      colName: "Group",
      isVisible: false,
      colId: "SPledgegroupId",
      disabled: false,
    },
    {
      colName: "Class",
      isVisible: false,
      colId: "SPledgeclassId",
      disabled: false,
    },
    {
      colName: "FATHER",
      isVisible: false,
      colId: "SPledgefatherId",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      isVisible: false,
      colId: "SPledgefatherlawId",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      isVisible: false,
      colId: "SPledgetotalpaidId",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      isVisible: false,
      colId: "SPledgetotalopenId",
      disabled: false,
    },
    {
      colName: "NOTPROCESSED",
      isVisible: false,
      colId: "SPledgenotprocessedId",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      isVisible: false,
      colId: "SPledgeenglishtitleId",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      isVisible: false,
      colId: "SPledgefirstNameId",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      isVisible: false,
      colId: "SPledgelastNameId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      isVisible: false,
      colId: "SPledgetitleJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      isVisible: false,
      colId: "SPledgefirstNameJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      isVisible: false,
      colId: "SPledgeyiddishlastnameId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      isVisible: false,
      colId: "SPledgesuffixJewishId",
      disabled: false,
    },
  ];
  isSchdlePldgNoVisible: boolean = true;
  isSchdlePldgDateTimeVisible: boolean = false;
  isSchdlePldgDonorVisible: boolean = true;
  isSchdlePldgTotalAmountVisible: boolean = true;
  isSchdlePldgLeftVisible: boolean = true;
  isSchdlePldgNextDateVisible: boolean = true;
  isSchdlePldgScheduleAmountVisible: boolean = true;
  isSchdlePldgStatusVisible: boolean = true;
  isSchdlePldgCampaignVisible: boolean = true;
  isSchdlePldgFrequencyVisible: boolean = true;
  isSchdlePldgNoteVisible: boolean = false;
  isSchdlePldgLocationVisible: boolean = false;
  isSchdlePldgReasonVisible: boolean = false;
  isSchdlePldgReasonNumberVisible: boolean = false;
  isSchdlePldgCollectorVisible: boolean = true;
  isSchdlePldgPhoneVisible: boolean = false;
  isSchdlePldgDeviceVisible: boolean = false;
  isSchdlePldgAccountNoVisible: boolean = false;
  isSchdlePldgDonorEnglishVisible: boolean = false;
  isSchdlePldgAddressVisible: boolean = false;
  isSchdlePldgCityStateZipVisible: boolean = false;
  isSchdlePldgEmailVisible: boolean = false;
  isSchdlePldgGroupVisible: boolean = false;
  isSchdlePldgClassVisible: boolean = false;
  isSchdlePldgFatherVisible: boolean = false;
  isSchdlePldgFatherInLawVisible: boolean = false;
  isSchdlePldgTotalPaidVisible: boolean = false;
  isSchdlePldgToatlOpenVisible: boolean = false;
  isSchdlePldgNotProcessedVisible: boolean = false;
  popTitle: any;
  isSchdlePldgEnglishTitleColVisible: boolean = false;
  isSchdlePldgFirstNameColVisible: boolean = false;
  isSchdlePldgLastNameColVisible: boolean = false;
  isSchdlePldgTitleJewishColVisible: boolean = false;
  isSchdlePldgFirstNameJewishColVisible: boolean = false;
  isSchdlePldgLastNameJewishColVisible: boolean = false;
  isSchdlePldgSuffixJewishColVisible: boolean = false;
  PageName: any = "SchedulePledgeTransPage";
  isOneDate: any = false;
  sumByCampaignPayments = [];
  sumByDonorPayments = [];
  sumByReasonPayments = [];
  sumByLocationPayments = [];
  recordSelectedArray = [];
  sumBySourcePayments = [];
  sumByWeekPayments = [];
  sumByMonthPayments = [];
  sumByYearPayments = [];
  isSelected = false;

  headerList: any = [
    {
      colName: "SCHEDULE#",
      visibleCondition: this.isSchdlePldgNoVisible,
      sortName: "scheduleNum",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      visibleCondition: this.isSchdlePldgDonorVisible,
      sortName: "donorJewish",
      disabled: true,
    },
    {
      colName: "TOTALAMOUNT",
      visibleCondition: this.isSchdlePldgTotalAmountVisible,
      sortName: "totalAmount",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      visibleCondition: this.isSchdlePldgDateTimeVisible,
      sortName: "createdDate",
      disabled: false,
    },
    {
      colName: "SCHEDULEDAMOUNT",
      visibleCondition: this.isSchdlePldgScheduleAmountVisible,
      sortName: "scheduleAmount",
      disabled: false,
    },
    {
      colName: "Next Pledge Date",
      visibleCondition: this.isSchdlePldgNextDateVisible,
      sortName: "nextPaymentDate",
      disabled: false,
    },
    {
      colName: "Pledges Left",
      visibleCondition: this.isSchdlePldgLeftVisible,
      sortName: "paymentLeft",
      disabled: false,
    },
    {
      colName: "STATUS",
      visibleCondition: this.isSchdlePldgStatusVisible,
      sortName: "scheduleStatus",
      disabled: false,
    },
    {
      colName: "FREQUENCY",
      visibleCondition: this.isSchdlePldgFrequencyVisible,
      sortName: "frequency",
      disabled: false,
    },
    {
      colName: "NOTE",
      visibleCondition: this.isSchdlePldgNoteVisible,
      sortName: "note",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isSchdlePldgCampaignVisible,
      sortName: "campaign",
      disabled: false,
    },
    {
      colName: "REASON",
      visibleCondition: this.isSchdlePldgReasonVisible,
      sortName: "reasonName",
      disabled: false,
    },
    {
      colName: "REASON#",
      visibleCondition: this.isSchdlePldgReasonNumberVisible,
      sortName: "reasonNumber",
      disabled: false,
    },
    {
      colName: "LOCATION",
      visibleCondition: this.isSchdlePldgLocationVisible,
      sortName: "locationName",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isSchdlePldgCollectorVisible,
      sortName: "collector",
      disabled: false,
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isSchdlePldgDeviceVisible,
      sortName: "deviceName",
      disabled: false,
    },
    {
      colName: "Account #",
      visibleCondition: this.isSchdlePldgAccountNoVisible,
      sortName: "accountNum",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      visibleCondition: this.isSchdlePldgDonorEnglishVisible,
      sortName: "donor",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      visibleCondition: this.isSchdlePldgAddressVisible,
      sortName: "address",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      visibleCondition: this.isSchdlePldgCityStateZipVisible,
      sortName: "cityStateZip",
      disabled: false,
    },
    {
      colName: "Phone Number",
      visibleCondition: this.isSchdlePldgPhoneVisible,
      sortName: "phones",
      disabled: false,
    },
    {
      colName: "EMAIL",
      visibleCondition: this.isSchdlePldgEmailVisible,
      sortName: "emailAddress",
      disabled: false,
    },
    {
      colName: "Group",
      visibleCondition: this.isSchdlePldgGroupVisible,
      sortName: "group",
      disabled: false,
    },
    {
      colName: "Class",
      visibleCondition: this.isSchdlePldgClassVisible,
      sortName: "class",
      disabled: false,
    },
    {
      colName: "FATHER",
      visibleCondition: this.isSchdlePldgFatherVisible,
      sortName: "father",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      visibleCondition: this.isSchdlePldgFatherInLawVisible,
      sortName: "fatherInLaw",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      visibleCondition: this.isSchdlePldgTotalPaidVisible,
      sortName: "totalPaid",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      visibleCondition: this.isSchdlePldgToatlOpenVisible,
      sortName: "totalOpen",
      disabled: false,
    },
    {
      colName: "NOTPROCESSED",
      visibleCondition: this.isSchdlePldgNotProcessedVisible,
      sortName: "notProcessed",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      visibleCondition: this.isSchdlePldgEnglishTitleColVisible,
      sortName: "title",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      visibleCondition: this.isSchdlePldgFirstNameColVisible,
      sortName: "firstName",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      visibleCondition: this.isSchdlePldgLastNameColVisible,
      sortName: "lastName",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      visibleCondition: this.isSchdlePldgTitleJewishColVisible,
      sortName: "titleJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      visibleCondition: this.isSchdlePldgFirstNameJewishColVisible,
      sortName: "firstNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      visibleCondition: this.isSchdlePldgLastNameJewishColVisible,
      sortName: "lastNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      visibleCondition: this.isSchdlePldgSuffixJewishColVisible,
      sortName: "suffixJewish",
      disabled: false,
    },
  ];

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };
  schedulePledgeSubscription!: Subscription;
  private calendarSubscription: Subscription;

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
      frozen: true,
      cssClass: "tabulator-class",
    },
    {
      title: "Donor Jewish Name",
      field: "donorJewish",
      visible: true,
      frozen: true,
      cssClass: "tabulator-class",
    },
    {
      title: "TOTALAMOUNT",
      field: "totalAmount",
      visible: true,
      frozen: true,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
    },
    {
      title: "CREATEDDATETIME",
      field: "createdDate",
      visible: false,
      formatter: "customComponent",
      formatterParams: { type: "date_long" },
    },
    {
      title: "SCHEDULEDAMOUNT",
      visible: true,
      field: "scheduleAmount",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
    },
    {
      title: "Next Pledge Date",
      visible: true,
      field: "nextPaymentDate",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "date_short" },
    },
    {
      title: "Pledges Left",
      visible: true,
      field: "paymentLeft",
      frozen: false,
    },
    { title: "STATUS", visible: true, field: "scheduleStatus", frozen: false },
    { title: "FREQUENCY", visible: true, field: "frequency", frozen: false },
    { title: "NOTE", visible: false, field: "note", frozen: false },
    {
      title: "CAMPAIGN",
      visible: true,
      field: "campaign",
      frozen: false,
      cssClass: "tabulator-class",
    },
    {
      title: "REASON",
      visible: false,
      field: "reasonName",
      frozen: false,
      cssClass: "tabulator-class",
    },
    { title: "REASON#", visible: false, field: "reasonNumber", frozen: false },
    {
      title: "LOCATION",
      visible: false,
      field: "locationName",
      frozen: false,
      cssClass: "tabulator-class",
    },
    {
      title: "COLLECTOR",
      visible: true,
      field: "collector",
      frozen: false,
      cssClass: "tabulator-class",
    },
    {
      title: "SOURCE",
      visible: false,
      field: "deviceName",
      frozen: false,
      cssClass: "tabulator-class",
    },
    { title: "Account #", visible: false, field: "accountNum", frozen: false },
    {
      title: "Donor English Name",
      visible: false,
      field: "donor",
      frozen: false,
      cssClass: "tabulator-class",
    },
    {
      title: "ADDRESS",
      visible: false,
      field: "address",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "address" },
    },
    {
      title: "CITYSTATEZIP",
      visible: false,
      field: "cityStateZip",
      frozen: false,
    },
    { title: "Phone Number", visible: false, field: "phones", frozen: false },
    { title: "EMAIL", visible: false, field: "emailAddress", frozen: false },
    { title: "Group", visible: false, field: "group", frozen: false },
    { title: "Class", visible: false, field: "class", frozen: false },
    { title: "FATHER", visible: false, field: "father", frozen: false },
    {
      title: "FATHERINLAW",
      visible: false,
      field: "fatherInLaw",
      frozen: false,
    },
    {
      title: "TOTALPAID",
      visible: false,
      field: "totalPaid",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
    },
    {
      title: "TOTALOPEN",
      visible: false,
      field: "totalOpen",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
    },
    {
      title: "NOTPROCESSED",
      visible: false,
      field: "notProcessed",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
    },
    //added new
    { title: "ENGLISHTITLE", visible: false, field: "title", frozen: false },
    {
      title: "ENGLISHFIRSTNAME",
      visible: false,
      field: "firstName",
      frozen: false,
    },
    {
      title: "ENGLISHLASTNAME",
      visible: false,
      field: "lastName",
      frozen: false,
    },
    {
      title: "YIDDISHFIRSTTITLE",
      visible: false,
      field: "titleJewish",
      frozen: false,
    },
    {
      title: "YIDDISHFIRSTNAME",
      visible: false,
      field: "firstNameJewish",
      frozen: false,
    },
    {
      title: "YIDDISHLASTNAME",
      visible: false,
      field: "lastNameJewish",
      frozen: false,
    },
    {
      title: "YIDDISHLASTTITLE",
      visible: false,
      field: "suffixJewish",
      frozen: false,
    },
  ];
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  lastUpdatedColumns: any;
  columnsVisibilitySubject = new Subject<any>();
  toggledFields: ColumnDefinitionType[] = [];
  private analytics = inject(AnalyticsService);

  constructor(
    public pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private collectorService: CollectorService,
    private cdr: ChangeDetectorRef,
    private scheduleService: ScheduleService,
    private locationService: LocationService,
    private deviceService: DeviceService,
    private uiPageSettingService: UIPageSettingService,
    public router: Router,
    private datePipe: DonaryDateFormatPipe,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private xlsxService: XLSXService
  ) {
    if (
      this.router.getCurrentNavigation() &&
      this.router.getCurrentNavigation().extras &&
      this.router.getCurrentNavigation().extras.state &&
      this.router.getCurrentNavigation().extras.state
    ) {
      this.selectedDateRange = { startDate: null, endDate: null };
      this.selectedDateRange.startDate = moment(
        this.router.getCurrentNavigation().extras.state.recentStartDate
      );
      this.selectedDateRange.endDate = moment(
        this.router.getCurrentNavigation().extras.state.recentEndDate
      );
    }
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

  // Remove count for All card
  multiSelectCount(length) {
    let count = length - 1;
    return count > 0 ? count : 0;
  }

  ngOnInit() {
    this.analytics.visitedSchedulePledges();
    this.colfieldsValue = this.pageSyncService.schedulepledgeFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbySchedulePledge) {
      this.cardType = this.pageSyncService.sumbySchedulePledge;
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
    this.schedulePledgeSubscription = this.commonMethodService
      .getScheduleTransSync()
      .subscribe((res: any) => {
        if (res) {
          if (this.pageSyncService.schedulePledgeTransList == undefined) {
            this.searchScheduleTransactionsData();
          } else {
            this.gridFilterData = this.pageSyncService.schedulePledgeTransList;
            this.calculateAllSumByFields(this.gridFilterData);
            this.resGridDataModification(this.gridFilterData);
          }
        }
      });
    this.commonMethodService.getPledgeSchdleTrans().subscribe((res: any) => {
      if (res) {
        this.searchScheduleTransactionsData();
      }
    });
    if (
      !this.pageSyncService.scheduleFlag ||
      (this.pageSyncService.isScheduleTabClicked &&
        this.pageSyncService.schedulePledgeTransList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "transactions",
        screenName: "schedulepledges",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isSchdlePldgNoVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);
            if (
              this.uiPageSetting.schedulePldgStartDate == null &&
              this.uiPageSetting.schedulePldgEndDate == null
            ) {
              this.selectedDateRange.startDate = null;
              this.selectedDateRange.endDate = null;
              this.EngHebCalPlaceholder = "All Time";
            } else {
              this.getSelectedDateRange(
                this.uiPageSetting.schedulePldgStartDate,
                this.uiPageSetting.schedulePldgEndDate
              );
            }

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
              this.pageSyncService.schedulePledgeTransList == undefined)
          ) {
            // this.searchScheduleTransactionsData();
          }
        } else {
          this.searchScheduleTransactionsData();
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["schedulePledgeList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["schedulePledgeList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      if (
        this.pageSyncService.isScheduleTabClicked &&
        this.pageSyncService.schedulePledgeTransList != undefined
      ) {
        this.gridData = this.pageSyncService.schedulePledgeTransList;
        this.gridFilterData = this.pageSyncService.schedulePledgeTransList;
        this.calculateAllSumByFields(this.gridFilterData);
        this.resGridDataModification(this.gridFilterData);
      }
    }

    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localscheduleRepatTypeList.length == 0) {
      this.commonMethodService.getScheduleRepeatTypeList();
    }

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
    if (this.pageSyncService.schedulepledgeCalDate) {
      if (
        this.pageSyncService.schedulepledgeCalDate.startDate == null &&
        this.pageSyncService.schedulepledgeCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      } else {
        this.pageSyncService.schedulepledgeCalDate.startDate = moment(
          this.pageSyncService.schedulepledgeCalDate.startDate
        ).format("YYYY-MM-DD");
        this.pageSyncService.schedulepledgeCalDate.endDate = moment(
          this.pageSyncService.schedulepledgeCalDate.endDate
        ).format("YYYY-MM-DD");
        this.getSelectedDateRange(
          this.pageSyncService.schedulepledgeCalDate.startDate,
          this.pageSyncService.schedulepledgeCalDate.endDate
        );
      }
    }

    this.columnsVisibilitySubject
      .pipe(debounceTime(200))
      .subscribe((updatedOptions: any[]) => {
        this.lastUpdatedColumns = updatedOptions;
        this.changeDetectorRef.detectChanges();
        this.toggledFields = [];
      });
  }

  setUIPageSettings(uiPageSetting) {
    this.isSchdlePldgNoVisible = uiPageSetting.isSchdlePldgNoVisible;
    this.isSchdlePldgDonorVisible = uiPageSetting.isSchdlePldgDonorVisible;
    this.isSchdlePldgTotalAmountVisible =
      uiPageSetting.isSchdlePldgTotalAmountVisible;
    this.isSchdlePldgDateTimeVisible =
      uiPageSetting.isSchdlePldgDateTimeVisible;
    this.isSchdlePldgScheduleAmountVisible =
      uiPageSetting.isSchdlePldgScheduleAmountVisible;
    this.isSchdlePldgNextDateVisible =
      uiPageSetting.isSchdlePldgNextDateVisible;
    this.isSchdlePldgLeftVisible = uiPageSetting.isSchdlePldgLeftVisible;
    this.isSchdlePldgStatusVisible = uiPageSetting.isSchdlePldgStatusVisible;
    this.isSchdlePldgFrequencyVisible =
      uiPageSetting.isSchdlePldgFrequencyVisible;
    this.isSchdlePldgNoteVisible = uiPageSetting.isSchdlePldgNoteVisible;
    this.isSchdlePldgCampaignVisible =
      uiPageSetting.isSchdlePldgCampaignVisible;
    this.isSchdlePldgReasonVisible = uiPageSetting.isSchdlePldgReasonVisible;
    this.isSchdlePldgReasonNumberVisible =
      uiPageSetting.isSchdlePldgReasonNumberVisible;
    this.isSchdlePldgLocationVisible =
      uiPageSetting.isSchdlePldgLocationVisible;
    this.isSchdlePldgCollectorVisible =
      uiPageSetting.isSchdlePldgCollectorVisible;
    this.isSchdlePldgDeviceVisible = uiPageSetting.isSchdlePldgDeviceVisible;
    this.isSchdlePldgAccountNoVisible =
      uiPageSetting.isSchdlePldgAccountNoVisible;
    this.isSchdlePldgDonorEnglishVisible =
      uiPageSetting.isSchdlePldgDonorEnglishVisible;
    this.isSchdlePldgAddressVisible = uiPageSetting.isSchdlePldgAddressVisible;
    this.isSchdlePldgCityStateZipVisible =
      uiPageSetting.isSchdlePldgCityStateZipVisible;
    this.isSchdlePldgPhoneVisible = uiPageSetting.isSchdlePldgPhoneVisible;
    this.isSchdlePldgEmailVisible = uiPageSetting.isSchdlePldgEmailVisible;
    this.isSchdlePldgGroupVisible = uiPageSetting.isSchdlePldgGroupVisible;
    this.isSchdlePldgClassVisible = uiPageSetting.isSchdlePldgClassVisible;
    this.isSchdlePldgFatherVisible = uiPageSetting.isSchdlePldgFatherVisible;
    this.isSchdlePldgFatherInLawVisible =
      uiPageSetting.isSchdlePldgFatherInLawVisible;
    this.isSchdlePldgTotalPaidVisible =
      uiPageSetting.isSchdlePldgTotalPaidVisible;
    this.isSchdlePldgToatlOpenVisible =
      uiPageSetting.isSchdlePldgToatlOpenVisible;
    this.isSchdlePldgNotProcessedVisible =
      uiPageSetting.isSchdlePldgNotProcessedVisible;
    this.isSchdlePldgEnglishTitleColVisible =
      uiPageSetting.isSchdlePldgEnglishTitleColVisible;
    this.isSchdlePldgFirstNameColVisible =
      uiPageSetting.isSchdlePldgFirstNameColVisible;
    this.isSchdlePldgLastNameColVisible =
      uiPageSetting.isSchdlePldgLastNameColVisible;
    this.isSchdlePldgTitleJewishColVisible =
      uiPageSetting.isSchdlePldgTitleJewishColVisible;
    this.isSchdlePldgFirstNameJewishColVisible =
      uiPageSetting.isSchdlePldgFirstNameJewishColVisible;
    this.isSchdlePldgLastNameJewishColVisible =
      uiPageSetting.isSchdlePldgLastNameJewishColVisible;
    this.isSchdlePldgSuffixJewishColVisible =
      uiPageSetting.isSchdlePldgSuffixJewishColVisible;
    this.cardType = uiPageSetting.schedulePldgSumBy;
    this.objAdvancedSearch = uiPageSetting.schedulePldgSearchItem;

    this.pageSyncService.uiPageSettings["schedulePledgeList"] = uiPageSetting;
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }
  ngOnDestroy() {
    this.schedulePledgeSubscription.unsubscribe();
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
    if (this.pageSyncService.schedulepledgeEngCalPlaceholder) {
      this.EngHebCalPlaceholder =
        this.pageSyncService.schedulepledgeEngCalPlaceholder;
    }
  }

  RefreshList() {
    this.searchScheduleTransactionsData();
    //this.commonMethodService.sendPaymentSchdleTrans(true);
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
      isSchdlePldgNoVisible: this.isSchdlePldgNoVisible,
      isSchdlePldgDonorVisible: this.isSchdlePldgDonorVisible,
      isSchdlePldgTotalAmountVisible: this.isSchdlePldgTotalAmountVisible,
      isSchdlePldgDateTimeVisible: this.isSchdlePldgDateTimeVisible,
      isSchdlePldgScheduleAmountVisible: this.isSchdlePldgScheduleAmountVisible,
      isSchdlePldgNextDateVisible: this.isSchdlePldgNextDateVisible,
      isSchdlePldgLeftVisible: this.isSchdlePldgLeftVisible,
      isSchdlePldgStatusVisible: this.isSchdlePldgStatusVisible,
      isSchdlePldgFrequencyVisible: this.isSchdlePldgFrequencyVisible,
      isSchdlePldgNoteVisible: this.isSchdlePldgNoteVisible,
      isSchdlePldgCampaignVisible: this.isSchdlePldgCampaignVisible,
      isSchdlePldgReasonVisible: this.isSchdlePldgReasonVisible,
      isSchdlePldgReasonNumberVisible: this.isSchdlePldgReasonNumberVisible,
      isSchdlePldgLocationVisible: this.isSchdlePldgLocationVisible,
      isSchdlePldgCollectorVisible: this.isSchdlePldgCollectorVisible,
      isSchdlePldgDeviceVisible: this.isSchdlePldgDeviceVisible,
      isSchdlePldgAccountNoVisible: this.isSchdlePldgAccountNoVisible,
      isSchdlePldgDonorEnglishVisible: this.isSchdlePldgDonorEnglishVisible,
      isSchdlePldgAddressVisible: this.isSchdlePldgAddressVisible,
      isSchdlePldgCityStateZipVisible: this.isSchdlePldgCityStateZipVisible,
      isSchdlePldgPhoneVisible: this.isSchdlePldgPhoneVisible,
      isSchdlePldgEmailVisible: this.isSchdlePldgEmailVisible,
      isSchdlePldgGroupVisible: this.isSchdlePldgGroupVisible,
      isSchdlePldgClassVisible: this.isSchdlePldgClassVisible,
      isSchdlePldgFatherVisible: this.isSchdlePldgFatherVisible,
      isSchdlePldgFatherInLawVisible: this.isSchdlePldgFatherInLawVisible,
      isSchdlePldgTotalPaidVisible: this.isSchdlePldgTotalPaidVisible,
      isSchdlePldgToatlOpenVisible: this.isSchdlePldgToatlOpenVisible,
      isSchdlePldgNotProcessedVisible: this.isSchdlePldgNotProcessedVisible,
      isSchdlePldgEnglishTitleColVisible:
        this.isSchdlePldgEnglishTitleColVisible,
      isSchdlePldgFirstNameColVisible: this.isSchdlePldgFirstNameColVisible,
      isSchdlePldgLastNameColVisible: this.isSchdlePldgLastNameColVisible,
      isSchdlePldgTitleJewishColVisible: this.isSchdlePldgTitleJewishColVisible,
      isSchdlePldgFirstNameJewishColVisible:
        this.isSchdlePldgFirstNameJewishColVisible,
      isSchdlePldgLastNameJewishColVisible:
        this.isSchdlePldgLastNameJewishColVisible,
      isSchdlePldgSuffixJewishColVisible:
        this.isSchdlePldgSuffixJewishColVisible,
      schedulePldgStartDate: this.selectedDateRange.startDate,
      schedulePldgEndDate: this.selectedDateRange.endDate,
      schedulePldgSumBy: this.cardType,
      schedulePldgSearchItem: this.objAdvancedSearch,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "schedulepledges",
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
    var fieldsData = this.pageSyncService.schedulepledgeFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        this.isSchdlePldgNoVisible = isVisible;
        this.uiPageSetting.isSchdlePldgNoVisible = isVisible;
        break;
      case "createddatetime":
        this.isSchdlePldgDateTimeVisible = isVisible;
        this.uiPageSetting.isSchdlePldgDateTimeVisible = isVisible;
        break;
      case "donorjewishname":
        this.isSchdlePldgDonorVisible = isVisible;
        this.uiPageSetting.isSchdlePldgDonorVisible = isVisible;
        break;
      case "totalamount":
        this.isSchdlePldgTotalAmountVisible = isVisible;
        this.uiPageSetting.isSchdlePldgTotalAmountVisible = isVisible;
        break;
      case "pledgesleft":
        this.isSchdlePldgLeftVisible = isVisible;
        this.uiPageSetting.isSchdlePldgLeftVisible = isVisible;
        break;
      case "nextpledgedate":
        this.isSchdlePldgNextDateVisible = isVisible;
        this.uiPageSetting.isSchdlePldgNextDateVisible = isVisible;
        break;
      case "scheduledamount":
        this.isSchdlePldgScheduleAmountVisible = isVisible;
        this.uiPageSetting.isSchdlePldgScheduleAmountVisible = isVisible;
        break;
      case "status":
        this.isSchdlePldgStatusVisible = isVisible;
        this.uiPageSetting.isSchdlePldgStatusVisible = isVisible;
        break;
      case "campaign":
        this.isSchdlePldgCampaignVisible = isVisible;
        this.uiPageSetting.isSchdlePldgCampaignVisible = isVisible;
        break;
      case "frequency":
        this.isSchdlePldgFrequencyVisible = isVisible;
        this.uiPageSetting.isSchdlePldgFrequencyVisible = isVisible;
        break;
      case "note":
        this.isSchdlePldgNoteVisible = isVisible;
        this.uiPageSetting.isSchdlePldgNoteVisible = isVisible;
        break;
      case "location":
        this.isSchdlePldgLocationVisible = isVisible;
        this.uiPageSetting.isSchdlePldgLocationVisible = isVisible;
        break;
      case "reason":
        this.isSchdlePldgReasonVisible = isVisible;
        this.uiPageSetting.isSchdlePldgReasonVisible = isVisible;
        break;
      case "reason#":
        this.isSchdlePldgReasonNumberVisible = isVisible;
        this.uiPageSetting.isSchdlePldgReasonNumberVisible = isVisible;
        break;
      case "collector":
        this.isSchdlePldgCollectorVisible = isVisible;
        this.uiPageSetting.isSchdlePldgCollectorVisible = isVisible;
        break;
      case "phonenumber":
        this.isSchdlePldgPhoneVisible = isVisible;
        this.uiPageSetting.isSchdlePldgPhoneVisible = isVisible;
        break;
      case "source":
        this.isSchdlePldgDeviceVisible = isVisible;
        this.uiPageSetting.isSchdlePldgDeviceVisible = isVisible;
        break;
      case "account#":
        this.isSchdlePldgAccountNoVisible = isVisible;
        this.uiPageSetting.isSchdlePldgAccountNoVisible = isVisible;
        break;
      case "donorenglishname":
        this.isSchdlePldgDonorEnglishVisible = isVisible;
        this.uiPageSetting.isSchdlePldgDonorEnglishVisible = isVisible;
        break;
      case "address":
        this.isSchdlePldgAddressVisible = isVisible;
        this.uiPageSetting.isSchdlePldgAddressVisible = isVisible;
        break;
      case "citystatezip":
        this.isSchdlePldgCityStateZipVisible = isVisible;
        this.uiPageSetting.isSchdlePldgCityStateZipVisible = isVisible;
        break;
      case "email":
        this.isSchdlePldgEmailVisible = isVisible;
        this.uiPageSetting.isSchdlePldgEmailVisible = isVisible;
        break;
      case "group":
        this.isSchdlePldgGroupVisible = isVisible;
        this.uiPageSetting.isSchdlePldgGroupVisible = isVisible;
        break;
      case "class":
        this.isSchdlePldgClassVisible = isVisible;
        this.uiPageSetting.isSchdlePldgClassVisible = isVisible;
        break;
      case "father":
        this.isSchdlePldgFatherVisible = isVisible;
        this.uiPageSetting.isSchdlePldgFatherVisible = isVisible;
        break;
      case "fatherinlaw":
        this.isSchdlePldgFatherInLawVisible = isVisible;
        this.uiPageSetting.isSchdlePldgFatherInLawVisible = isVisible;
        break;
      case "totalpaid":
        this.isSchdlePldgTotalPaidVisible = isVisible;
        this.uiPageSetting.isSchdlePldgTotalPaidVisible = isVisible;
        break;
      case "totalopen":
        this.isSchdlePldgToatlOpenVisible = isVisible;
        this.uiPageSetting.isSchdlePldgToatlOpenVisible = isVisible;
        break;
      case "notprocessed":
        this.isSchdlePldgNotProcessedVisible = isVisible;
        this.uiPageSetting.isSchdlePldgNotProcessedVisible = isVisible;
        break;
      case "englishtitle":
        this.isSchdlePldgEnglishTitleColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgEnglishTitleColVisible = isVisible;
        break;
      case "englishfirstname":
        this.isSchdlePldgFirstNameColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgFirstNameColVisible = isVisible;
        break;
      case "englishlastname":
        this.isSchdlePldgLastNameColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgLastNameColVisible = isVisible;
        break;
      case "yiddishfirsttitle":
        this.isSchdlePldgTitleJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgTitleJewishColVisible = isVisible;
        break;
      case "yiddishfirstname":
        this.isSchdlePldgFirstNameJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgFirstNameJewishColVisible = isVisible;
        break;
      case "yiddishlastname":
        this.isSchdlePldgLastNameJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgLastNameJewishColVisible = isVisible;
        break;
      case "yiddishlasttitle":
        this.isSchdlePldgSuffixJewishColVisible = isVisible;
        this.uiPageSetting.isSchdlePldgSuffixJewishColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
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
        return this.isSchdlePldgNoVisible;
      case "createddatetime":
        return this.isSchdlePldgDateTimeVisible;
      case "donorjewishname":
        return this.isSchdlePldgDonorVisible;
      case "totalamount":
        return this.isSchdlePldgTotalAmountVisible;
      case "pledgesleft":
        return this.isSchdlePldgLeftVisible;
      case "nextpledgedate":
        return this.isSchdlePldgNextDateVisible;
      case "scheduledamount":
        return this.isSchdlePldgScheduleAmountVisible;
      case "status":
        return this.isSchdlePldgStatusVisible;
      case "campaign":
        return this.isSchdlePldgCampaignVisible;
      case "frequency":
        return this.isSchdlePldgFrequencyVisible;
      case "note":
        return this.isSchdlePldgNoteVisible;
      case "location":
        return this.isSchdlePldgLocationVisible;
      case "reason":
        return this.isSchdlePldgReasonVisible;
      case "reason#":
        return this.isSchdlePldgReasonNumberVisible;
      case "collector":
        return this.isSchdlePldgCollectorVisible;
      case "phonenumber":
        return this.isSchdlePldgPhoneVisible;
      case "source":
        return this.isSchdlePldgDeviceVisible;
      case "account#":
        return this.isSchdlePldgAccountNoVisible;
      case "donorenglishname":
        return this.isSchdlePldgDonorEnglishVisible;
      case "address":
        return this.isSchdlePldgAddressVisible;
      case "citystatezip":
        return this.isSchdlePldgCityStateZipVisible;
      case "email":
        return this.isSchdlePldgEmailVisible;
      case "group":
        return this.isSchdlePldgGroupVisible;
      case "class":
        return this.isSchdlePldgClassVisible;
      case "father":
        return this.isSchdlePldgFatherVisible;
      case "fatherinlaw":
        return this.isSchdlePldgFatherInLawVisible;
      case "totalpaid":
        return this.isSchdlePldgTotalPaidVisible;
      case "totalopen":
        return this.isSchdlePldgToatlOpenVisible;
      case "notprocessed":
        return this.isSchdlePldgNotProcessedVisible;
      case "englishtitle":
        return this.isSchdlePldgEnglishTitleColVisible;
      case "englishfirstname":
        return this.isSchdlePldgFirstNameColVisible;
      case "englishlastname":
        return this.isSchdlePldgLastNameColVisible;
      case "yiddishfirsttitle":
        return this.isSchdlePldgTitleJewishColVisible;
      case "yiddishfirstname":
        return this.isSchdlePldgFirstNameJewishColVisible;
      case "yiddishlastname":
        return this.isSchdlePldgLastNameJewishColVisible;
      case "yiddishlasttitle":
        return this.isSchdlePldgSuffixJewishColVisible;
    }
  }
  datesUpdated(event) {
    $("#schpldg_localsearch").val("");
    $("#schpldg_select_all").prop("checked", false);
    this.isSelected = false;
    this.recordSelectedArray = [];
    if (this.isinitialize >= 2) {
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

  openSchedulePledgeCardPopup(scheduleId) {
    if (scheduleId != null && scheduleId != 0) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup schedule_pledgecard",
      };
      const modalRef = this.commonMethodService.openPopup(
        SchedulePledgecardPopupComponent,
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
      modalRef.componentInstance.emtScheduleUpdate.subscribe((res: any) => {
        this.searchScheduleTransactionsData();
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

  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      // backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search",
    };
    const modalRef = this.commonMethodService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isScheduleTab = true;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.FeatureName =
      "Filter_Scheduled_payments_and_pledges";
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchScheduleTransactionsData();
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

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbySchedulePledge = cardType;
    $("#schpldg_select_all").prop("checked", false);
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
    $("#schpldg_localsearch").val("");
    $("#schpldg_select_all").prop("checked", false);
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
      scheduleTypeId: 2,
    };

    this.scheduleService.getScheduleList(objsearchScheduleTrans).subscribe(
      (res: any) => {
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
          this.pageSyncService.schedulePledgeTransList = this.gridFilterData;
          this.resGridDataModification(res.scheduleTransGridModel);
          this.pageSyncService.lastSyncScheduleTime = new Date();
          this.pageSyncService.calculateTimeDifference("schedule");
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
          this.paymentTypeChipData = null;
          this.recordSelectedArray = [];
          this.pageSyncService.schedulePledgeTransList = [];
        }

        this.isloading = false;
        this.detectChanges();
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

  search(keyword) {
    if (this.isTabulator) {
      this._search$.next(keyword);
      return;
    }

    $("#schpldg_select_all").prop("checked", false);
    this.isSelected = false;
    var record = this.gridData;
    var filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[()-]/g, "");
    this.recordSelectedArray = [];
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
            (obj.locatioName &&
              obj.locatioName.toString().toLowerCase().indexOf(searchValue) >
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
            (obj.note &&
              obj.note.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.paymentLeft &&
              obj.paymentLeft.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleStatus &&
              obj.scheduleStatus.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaign &&
              obj.campaign.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.frequency &&
              obj.frequency.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.donorJewish &&
              obj.donorJewish.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
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
    if (objPaymentTypeChip) {
      $("#schpldg_select_all").prop("checked", false);
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

  public downloadExcel() {
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    if (this.isTabulator) {
      this.downloadExcelNew();
      return;
    }

    this.isloading = true;
    let results = this.gridFilterData && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let ScheduleNo = item && item.scheduleNum;
        let DateTime = item && item.createdDate;
        let Donor = item && item.donor;
        let TotalAmount = item && item.totalAmount;
        let PaymentLeft = item && item.paymentLeft;
        let NextPaymentDate = item && item.nextPaymentDate;
        let ScheduledAmount = item && item.scheduleAmount;
        let ScheduleStatus = item && item.scheduleStatus;
        let Frequency = item && item.frequency;
        let Note = item && item.note;
        let Location = item && item.locationName;
        let Reason = item && item.reasonName;
        let ReasonNumber = item && item.reasonNumber;
        let Collector = item && item.collector;
        let PhoneNumber = item && item.phones;
        let Campaign = item && item.campaign;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;
        let Failed = item && item.failedcount;
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

        let row = {};
        if (this.isSchdlePldgNoVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULE#")
            : "Schedule #";
          row[ColName] = ScheduleNo;
        }
        if (this.isSchdlePldgDonorVisible) {
          row["Donor Jewish Name"] = Donor;
        }
        if (this.isSchdlePldgTotalAmountVisible) {
          // row['Total Amount']=this.commonMethodService.formatAmount(item.totalAmount);
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALAMOUNT")
            : "Total Amount";
          row[ColName] = Number(item.totalAmount);
        }
        if (this.isSchdlePldgDateTimeVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CREATEDDATETIME")
            : "Created Date & Time";
          row[ColName] = this.datePipe.transform(item.createdDate, "name-long");
        }
        if (this.isSchdlePldgScheduleAmountVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULEDAMOUNT")
            : "Scheduled Amount";
          row[ColName] = Number(item.scheduleAmount);
        }
        if (this.isSchdlePldgNextDateVisible) {
          row["Next Pledge Date"] = this.datePipe.transform(
            item.nextPaymentDate
          );
        }
        if (this.isSchdlePldgLeftVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PLEDGESLEFT")
            : "Pledges Left";
          row[ColName] = PaymentLeft;
        }
        if (this.isSchdlePldgStatusVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATUS")
            : "Status";
          row[ColName] = ScheduleStatus;
        }
        if (this.isSchdlePldgFrequencyVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FREQUENCY")
            : "Frequency";
          row[ColName] = Frequency;
        }
        if (this.isSchdlePldgNoteVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTE")
            : "Note";
          row[ColName] = Note;
        }
        if (this.isSchdlePldgCampaignVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CAMPAIGN")
            : "Campaign";
          row[ColName] = Campaign;
        }
        if (this.isSchdlePldgReasonVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON")
            : "Reason";
          row[ColName] = Reason;
        }
        if (this.isSchdlePldgReasonNumberVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON#")
            : "Reason #";
          row["Reason #"] = ReasonNumber;
        }
        if (this.isSchdlePldgLocationVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LOCATION")
            : "Location";
          row[ColName] = Location;
        }
        if (this.isSchdlePldgCollectorVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COLLECTOR")
            : "Collector";
          row[ColName] = Collector;
        }
        if (this.isSchdlePldgDeviceVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SOURCE")
            : "Source";
          row[ColName] = Device;
        }
        if (this.isSchdlePldgAccountNoVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACCOUNT#")
            : "Account #";
          row[ColName] = AccountNo;
        }
        if (this.isSchdlePldgDonorEnglishVisible) {
          row["Donor English Name"] = DonorEnglis;
        }
        if (this.isSchdlePldgAddressVisible) {
          row["House Num"] = item.defaultHouseNum;
          row["Street Name"] = item.defaultStreetName;
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("APT")
            : "Apt";
          row[ColName] = item.defaultUnit;
        }
        if (this.isSchdlePldgAddressVisible) {
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
        if (this.isSchdlePldgPhoneVisible) {
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
        if (this.isSchdlePldgEmailVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] = Email;
        }
        if (this.isSchdlePldgGroupVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("GROUP")
            : "Group";
          row[ColName] = Group;
        }
        if (this.isSchdlePldgClassVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CLASS")
            : "Class";
          row[ColName] = Class;
        }
        if (this.isSchdlePldgFatherVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHER")
            : "Father";
          row[ColName] = Father;
        }
        if (this.isSchdlePldgFatherInLawVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHERINLAW")
            : "Father in law";
          row[ColName] = FatherInLaw;
        }
        if (this.isSchdlePldgTotalPaidVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALPAID")
            : "Total Paid";
          row[ColName] = this.commonMethodService.formatAmount(item.totalPaid);
        }
        if (this.isSchdlePldgToatlOpenVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTALOPEN")
            : "Total Open";
          row[ColName] = this.commonMethodService.formatAmount(item.totalOpen);
        }
        if (this.isSchdlePldgNotProcessedVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTPROCESSED")
            : "Not Processed";
          row[ColName] = this.commonMethodService.formatAmount(
            item.notProcessed
          );
        }
        //added new
        if (this.isSchdlePldgEnglishTitleColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHTITLE")
            : "English Title";
          row[ColName] = Title;
        }
        if (this.isSchdlePldgFirstNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHFIRSTNAME")
            : "English First name";
          row[ColName] = FirstName;
        }
        if (this.isSchdlePldgLastNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHLASTNAME")
            : "English Last name";
          row[ColName] = LastName;
        }
        if (this.isSchdlePldgTitleJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTTITLE")
            : "Yiddish First Title";
          row[ColName] = TitleJewish;
        }
        if (this.isSchdlePldgFirstNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTNAME")
            : "Yiddish First name";
          row[ColName] = FirstNameJewish;
        }
        if (this.isSchdlePldgLastNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTNAME")
            : "Yiddish Last name";
          row[ColName] = LastNameJewish;
        }
        if (this.isSchdlePldgSuffixJewishColVisible) {
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

    const filename = this.xlsxService.getFilename("Schedule Pledge List");
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

        if (worksheet[cell_ref].v == "Next Pledge Date") {
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
          //worksheet[amount_cell_ref].t='s';
          //worksheet[amount_cell_ref].z=fmt;
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
      "schedulePledgeCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "SchedulePledgeTransPage" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.schedulepledgeCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.presetOption = this.EngHebCalPlaceholder;
          this.pageSyncService.schedulepledgeEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          this.class_id = this.hebrewEngishCalendarService.id;
          this.class_hid = this.hebrewEngishCalendarService.hid;
          this.searchScheduleTransactionsData();
        }
      });
  }

  onCellClick(clickEvent: CellClickEvent) {
    if (clickEvent.field === "scheduleNum") {
      this.openSchedulePledgeCardPopup(clickEvent.rowData.firstScheduleId);
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
    return `${val}_sch_pledge`;
  }

  setGridColVisibilityNew(objectField) {
    setTimeout(() => {
      this.toggledFields.push(objectField);
      this.columnsVisibilitySubject.next(this.toggledFields);
    }, 50);
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
    const filename = this.xlsxService.getFilename("Schedule Pledge List");

    this.tabulatorComponent.downLoadExcel(filename);
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
