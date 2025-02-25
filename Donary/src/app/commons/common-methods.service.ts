import { PaymentApiGatewayService } from "./../services/payment-api-gateway.service";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import * as moment from "moment";
import * as _ from "lodash";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import * as moment_tz from "moment-timezone";
import { BehaviorSubject, forkJoin, Observable, of, Subject } from "rxjs";
import { CommonAPIMethodService } from "../services/common-api-method.service";
import { DonorService } from "../services/donor.service";
import { LocalstoragedataService } from "./local-storage-data.service";
import { NotificationService } from "./notification.service";
import { AdvancedFieldService } from "../services/advancedfield.service";
import { filter, takeUntil } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { UpgradeSuccessPopupComponent } from "../pages/cards/upgrade-success-popup/upgrade-success-popup.component";
import { PlanService } from "../services/plan.service";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { SettingsService } from "../services/settings.service";
import { UIPageSettingService } from "../services/uipagesetting.service";
import { MessengerService } from "../services/messenger.service";
import { DonorSaveComponent } from "../pages/donor/donor-save/donor-save.component";
import { JoinAndUpperCasePipe } from "./text-transform.pipe";
declare var $: any;

interface PaymentGridObj {
  createdDate: string;
  paymentDateTime: string;
  amount: number;
}

interface chipType {
  paymentCount: number;
  paymentType: string;
  paymentTypeChipCSSClass: string;
  paymentTypeId: number;
  totalAmount: number;
}

@Injectable({
  providedIn: "root",
})
export class CommonMethodService {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  // common method related properties like donor list, payment type list
  initialDonorLoad = 0;
  initialDonorCard = 0;
  payPledgeCount = 0;
  pledgeRemainingAmountTotal = 0;
  pledgeList = [];
  isBackTranctionCliked = false;
  isAutoApplyDisabled = false;
  pledgeAmount = 0;
  recentEndDate: any;
  recentStartDate: any;
  pledgePaymentAmount = 0;
  pledgeOrgTotalAmount = 0;
  ClickedReportByDate: boolean = false;
  lastSyncedTime: Date;
  donorList = [];
  multiSelectFieldList = [];
  multiselectDonorFieldList = [];
  localDonorList = [];
  localLocationList = [];
  localCampaignList: any[] = [];

  localAssigneeList: any = [];
  localCountries: any = [];
  isScheduleCalendar: Boolean = false;
  isScheduleHebrewCalendar: Boolean = false;

  updateTotalPanelSource = new BehaviorSubject<boolean>(false);
  updateTotalPanel$ = this.updateTotalPanelSource.asObservable();

  localSeasonList: any = [];
  localSeatLocationList: any = [];
  localReasonList = [];
  localCollectorList = [];
  localDeviceTypeList = [];
  paymentTypeList = [];
  paymentReasonList = [];
  CampaignList = [];
  campaignMastersList = [];
  selectedFromCampaignList = [];
  paymentLocationList = [];
  paymentGlobalLocationList = [];
  paymentStatusList = [];
  pledgeStatusList = [];
  scheduleStatusList = [];
  cityStateZipList = [];
  amountTypeList = [];
  paymentCollectorList = [];
  advanceFieldList = [];
  reportAdvanceFieldList = [];
  reportTagList = [];
  reportdonorFieldList = [];
  locationTypeList = [];
  planTypeList = [];
  stateList = [];
  locationList = [];
  paymentDeviceList = [];
  deviceTypeList = [];
  orderDeviceStatusList = [];
  paymentApprovalsList = [];
  scheduleRepatTypeList = [];
  scheduleFailedCountList = [{ id: 1, itemName: "Failed Count" }];
  cityList = [];
  zipList = [];
  downloadExcelGuid: any = [
    "6655dd44-5f4b-4cf5-9f57-cb82a7e16671",
    "4a1a582d-dc69-448f-ab97-fd960a44709c",
    "f6f33114-71d2-4e87-a662-d280d28c7580",
    "f2d4dd3a-fa6d-48b0-a542-2cefb8f62d59",
    "56c374c4-b5c8-442a-925b-daaa4c0363ea",
    "07996881-11bb-41f5-afdb-129b5713072f",
    "6b0b2379-5699-4061-8a85-9376686e52eb",
    "8c1f8c90-c088-434a-88b5-7fa30459736a",
    "2e7c70aa-23ad-4f21-919b-d8a5a5c390b3",
  ];
  isAliyosSaved = new BehaviorSubject<boolean>(false);
  modalRef: NgbModalRef;
  calModalOptions: NgbModalOptions;

  isSendUpgradeSettings: boolean = true;
  setting = [];
  upgradeResponse = [
    {
      success: true,
    },
  ];
  featureName: string;
  totalRecentDateFilterSetting: any[] = [];
  isfeatureSetting: boolean = true;
  featureDisplayName: string;
  statementType: any;
  statementTypeList: Array<{ id: string; itemName: string }> = [
    {
      id: "",
      itemName: "",
    },
  ];

  currencyList = [];
  localscheduleRepatTypeList = [];
  selectedDonors = [];
  selectedPaymentTypes = [];
  selectedCityTypes = [];
  selectedZipTypes = [];
  selectedPaymentStatus = [];
  selectedPledgeStatus = [];
  selectedScheduleStatus = [];
  selectedAmountType = [];
  selectedAdvanceField = [];
  selectedPaymentReasons = [];
  selectedPaymentLocations = [];
  selectedPaymentCollectors = [];
  selectedPaymentDevices = [];
  selectedPaymentDeviceTypes = [];
  selectedOrderDeviceStatus = [];
  selectedPaymentApprovals = [];
  selectedScheduleRepeatTypes = [];
  selectedScheduleFailedCount = [];
  selectedCityStateZipList = [];
  selectedCurrencyList = [];
  dateInterval: boolean = false;
  pageNumberObservable = new BehaviorSubject<any>({ pageNumber: 1 });
  pageSizeObservable = new BehaviorSubject<any>({ pageSize: 10 });
  columnArrayObservable = new BehaviorSubject<any>({ columnName: {} });
  private isDatasetLoadingObservable = new BehaviorSubject<boolean>(false);
  columnNameArrayObservable = new BehaviorSubject<any>({ columnNameList: [] });
  AccountIdArrayObservable = new BehaviorSubject<any>({ items: [] });
  CalendarObservable = new Subject<any>();
  DataSetArrayObservable = new BehaviorSubject<any>({ items: [] });
  UpdateDonorCardObservable = new BehaviorSubject<boolean>(false);
  DonorAccountIdObservable = new BehaviorSubject<number>(0);
  private closeAllPopupsSubject = new Subject<void>();
  closeAllPopups$ = this.closeAllPopupsSubject.asObservable();
  SearchAccountIdArrayObservable = new BehaviorSubject<any>({ items: [] });
  PaymentTransObservable = new BehaviorSubject<boolean>(false);
  BatchObservable = new BehaviorSubject<boolean>(false);
  ReportObservable = new BehaviorSubject<boolean>(false);
  PledgeTransObservable = new BehaviorSubject<boolean>(false);
  PledgeTransSyncObservable = new BehaviorSubject<boolean>(false);
  ScheduleTransSyncObservable = new BehaviorSubject<boolean>(false);
  PledgeSchdleTransObservable = new BehaviorSubject<boolean>(false);
  PaymentSchdleTransObservable = new BehaviorSubject<boolean>(false);
  DonorLstObservable = new BehaviorSubject<boolean>(false);
  ListSyncObservable = new BehaviorSubject<boolean>(false);
  DefaultLangObservable = new BehaviorSubject<boolean>(false);
  dataLoadedObservable = new BehaviorSubject<any>("");
  isGlobalLangObservable = new BehaviorSubject<boolean>(false);
  DonorSingleObservable = new BehaviorSubject<any>({ donarList: [] }); //added new
  PaymentTransactionObservable = new BehaviorSubject<any>({ paymentList: [] }); //added new
  PledgeTransactionObservable = new BehaviorSubject<any>({ pledgeList: [] });
  ScheduleSingleObservable = new BehaviorSubject<any>({ scheduleList: [] });
  CollectorLstObservable = new BehaviorSubject<boolean>(false);
  CampaignLstObservable = new BehaviorSubject<boolean>(false);
  LocationLstObservable = new BehaviorSubject<boolean>(false);
  ReasonLstObservable = new BehaviorSubject<boolean>(false);
  UserLstObservable = new BehaviorSubject<any>({ items: [] });
  SeatLstObservable = new BehaviorSubject<boolean>(false);
  LineHeightObservable = new BehaviorSubject<boolean>(true);
  LineTreeHeightObservable = new BehaviorSubject<boolean>(true);
  columClsObservable = new BehaviorSubject<any>({ columnCls: "" });
  columnNameObservable = new BehaviorSubject<any>({ columnName: "" });
  ReportQueryIdObservable = new BehaviorSubject<any>({ reportQueryId: "" });
  DonorListArrayObservable = new BehaviorSubject<any>({ items: [] });
  ColumnIdObservable = new BehaviorSubject<any>({ sortType: {} });
  PhonesArrayObservable = new BehaviorSubject<any>({ items: [] });
  isOpenSubject = new Subject<boolean>();
  isOpen$ = this.isOpenSubject.asObservable();
  private donorListSubject = new Subject<any[]>();
  public donorList$ = this.donorListSubject.asObservable();
  txtQuery: string; // bind this to input with ngModel
  txtQueryChanged: Subject<string> = new Subject<string>();
  loaderSearch: boolean;
  isCommonDropDownloading: boolean;
  isGlobalSearch: boolean = false;
  advancedAPIKey: string = "False";
  isDisableAutomaticPledgeReceiptEmail: string = "false";
  isACH: string = "False";
  ShulKioskBulletinImage: boolean = false;
  BulletinImageSettingId: any;
  auth2Local: any;
  // Date-range picker related properties
  open: string = "left";
  drop: string = "down";
  showClearButton: boolean = true;
  alwaysShowCalendars: boolean = true;
  showRangeLabelOnInput: boolean = true;
  placeholder: string = "All Time";
  showCustomRangeLabel: boolean = true;
  linkedCalendars: boolean = true;
  selectedAmount: number;
  isPayoffPledgeCheckBoxChecked: boolean = false;
  fileOutTaxExemptForm: any;
  permissionLst = [];
  isHebrew: boolean = false;
  allLabelsArray = [];
  currencyClass = "icon icon-dollar";
  currencyIcon = "$";
  isDonorListsPage: boolean = false;
  isFrequencyError: boolean = false;
  reasonCurrencyClass = "icon-content icon-dollar-content";
  locale: any = {
    customRangeLabel: "Custom range",
    applyLabel: "Apply",
    clearLabel: "Clear",
  };
  heblocale: any = {
    customRangeLabel: "מתואם אישית",
    applyLabel: "החל",
    clearLabel: "נקה",
  };
  ranges: any = {
    Today: [new Date(), new Date()],
    Yesterday: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    "This Week": [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "Last Week": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],

    "Last 7 Days": [moment(new Date()).subtract(6, "days"), moment(new Date())],
    "Last 30 Days": [
      moment(new Date()).subtract(29, "days"),
      moment(new Date()),
    ],
    "This Month": [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "Last Month": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    "This Year": [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "Last Year": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  hebranges: any = {
    היום: [new Date(), new Date()],
    אתמול: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    השבוע: [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "שבוע שעבר": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],

    " ז ימים האחרונים": [
      moment(new Date()).subtract(6, "days"),
      moment(new Date()),
    ],
    " ל ימים האחרונים": [
      moment(new Date()).subtract(29, "days"),
      moment(new Date()),
    ],
    החודש: [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "חודש שעבר": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    השנה: [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "שנה שעברה": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  upcomingranges: any = {
    Today: [moment(new Date()), moment(new Date())],
    Tommorrow: [
      moment(new Date()).add(1, "days"),
      moment(new Date()).add(1, "days"),
    ],

    "This Week": [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "Next Week": [
      moment(new Date()).add(1, "week").startOf("week"),
      moment(new Date()).add(1, "week").endOf("week"),
    ],

    "Next 7 Days": [moment(new Date()), moment(new Date()).add(6, "days")],
    "Next 31 Days": [moment(new Date()), moment(new Date()).add(30, "days")],
    "This Month": [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "Next Month": [
      moment(new Date()).add(1, "month").startOf("month"),
      moment(new Date()).add(1, "month").endOf("month"),
    ],
    "This Year": [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "Next Year": [
      moment(new Date()).add(1, "year").startOf("year"),
      moment(new Date()).add(1, "year").endOf("year"),
    ],
  };
  isRedirect: boolean = false;
  isCalendarClicked: boolean = false;
  ReportClicked: boolean = false;
  isReportdropdownOpen: boolean = false;
  hebrewJsontable: any;
  englishJsontable: any;
  notToShowLoader: boolean = false;
  hasNonUSD: boolean = false;
  notshowPaymentLoader: boolean = false;
  isDisableAutomaticPledge: boolean = false;
  isDisableAutomaticPayment: boolean = false;
  isglobalSearchApiCall: boolean = false;
  isglobalSearchApiCall2: boolean = false;
  searchLoader: Subject<boolean> = new Subject<boolean>();

  constructor(
    private modalService: NgbModal,
    private commonAPIMethodService: CommonAPIMethodService,
    private notificationService: NotificationService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private advanceFieldService: AdvancedFieldService,
    private planService: PlanService,
    public translate: TranslateService,
    public settingsService: SettingsService,
    public PaymentApiGatewayService: PaymentApiGatewayService,
    private uiPageSettingService: UIPageSettingService,
    private messengerService: MessengerService,
    private translatePipe: TranslatePipe,
    private transformPipe: JoinAndUpperCasePipe
  ) {}

  setDropDownSettings(
    placeholder: string,
    itemsShowLimit: number,
    multiple: boolean,
    singleSelection: boolean,
    enableSearch: boolean = false,
    enableCheckAll: boolean = false,
    position: string = "bottom",
    autoPosition: boolean = false,
    disabled: boolean = false,
    groupBy?: string
  ) {
    return {
      text: placeholder,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      classes: "myclass custom-class",
      labelKey: "itemName",
      noDataLabel: "No record found with search criteria",
      enableSearchFilter: enableSearch,
      enableCheckAll: enableCheckAll,
      autoPosition: autoPosition,
      enableFilterSelectAll: false,
      position: position,
      multiple: multiple,
      badgeShowLimit: itemsShowLimit,
      searchAutofocus: true,
      singleSelection: singleSelection,
      disabled: disabled,
      groupBy: groupBy,
    };
  }

  // Modal popup related properties

  modalOptions: NgbModalOptions = {
    centered: true,
    backdrop: "static",
    keyboard: true, //changed to true for escape button to work
    windowClass: "drag_popup",
    // state:true
  };

  formatAmount(value, currency = "USD") {
    if (value != null) {
      let defaultCurrency = this.localstoragedataService.getLoginUserCurrency();
      let payCurrency = this.localstoragedataService.getPayCurrency();
      if (currency != "USD") {
        defaultCurrency = currency;
      }
      if (payCurrency != "USD" || currency != "USD") {
        defaultCurrency = payCurrency;
      }
      //let defaultCurrency="ILS"
      defaultCurrency =
        defaultCurrency == null || defaultCurrency == "CAD"
          ? "USD"
          : defaultCurrency;
      if (
        defaultCurrency == null ||
        defaultCurrency == "USD" ||
        defaultCurrency == "CAD"
      ) {
        this.currencyClass = "icon icon-dollar";
        this.reasonCurrencyClass = "icon-content icon-dollar-content";
        this.currencyIcon = "$";
      } else if (defaultCurrency == "GBP") {
        this.currencyClass = "icon icon-gbp";
        this.reasonCurrencyClass = "icon-content icon-gbp-content";
        this.currencyIcon = "£";
      } else if (defaultCurrency == "EUR") {
        this.currencyClass = "icon icon-eur";
        this.reasonCurrencyClass = "icon-content icon-eur-content";
        this.currencyIcon = "€";
      } else if (defaultCurrency == "ILS") {
        this.currencyClass = "icon icon-ils";
        this.reasonCurrencyClass = "icon-content icon-ils-content";
        this.currencyIcon = "₪";
      }
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: defaultCurrency,
      }).format(value);
    }
  }

  openDropdown() {
    this.isOpenSubject.next(true);
  }

  closeDropdown() {
    this.isOpenSubject.next(false);
  }

  numberAndMinusOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 45) {
      // Allow only minus sign

      if (event.target.value && event.target.value.indexOf("-") >= 0)
        return false;
      else return true;
    }
    if (charCode == 46) {
      // Allow only 1 decimal point ('.')...

      if (event.target.value && event.target.value.indexOf(".") >= 0)
        return false;
      else return true;
    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    } else {
      return true;
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 46) {
      // Allow only 1 decimal point ('.')...

      if (event.target.value && event.target.value.indexOf(".") >= 0)
        return false;
      else return true;
    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    } else {
      return true;
    }
  }

  HebrewOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32) return true;
    if (
      charCode == 46 ||
      charCode == 38 ||
      charCode == 39 ||
      charCode == 44 ||
      charCode == 40 ||
      charCode == 41 ||
      charCode == 34
    )
      return true;
    if (1488 <= charCode && charCode <= 1522) {
      return true;
    } else {
      return false;
    }
  }

  SpecificSpecialCharOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32) {
      return true;
    }

    if (
      charCode == 46 ||
      charCode == 38 ||
      charCode == 39 ||
      charCode == 44 ||
      charCode == 40 ||
      charCode == 41 ||
      charCode == 34
    ) {
      return true;
    }

    if (1488 <= charCode && charCode <= 1522) {
      return true;
    }
    if (65 <= charCode && charCode <= 90) {
      return true;
    }

    if (97 <= charCode && charCode <= 122) {
      return true;
    }

    if (48 <= charCode && charCode <= 57) {
      return true;
    }

    return false;
  }

  EnglishOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32) return true;
    if (65 <= charCode && charCode <= 90) return true;
    if (97 <= charCode && charCode <= 122) return true;
    if (
      charCode == 46 ||
      charCode == 38 ||
      charCode == 39 ||
      charCode == 44 ||
      charCode == 40 ||
      charCode == 41 ||
      charCode == 34
    )
      return true;
    return false;
  }

  openPopup(component: any, specificModalOptions: any = null) {
    if (specificModalOptions) {
      return this.modalService.open(component, specificModalOptions);
    } else {
      return this.modalService.open(component, this.modalOptions);
    }
  }

  getDataLoaded() {
    return this.dataLoadedObservable;
  }

  sendDataLoaded(isreload) {
    this.dataLoadedObservable.next(isreload);
  }

  getGlobalLang() {
    return this.isGlobalLangObservable;
  }

  setGlobalLang(val: boolean) {
    this.isGlobalLangObservable.next(val);
  }

  getDefaultLang() {
    return this.DefaultLangObservable;
  }

  setDefaultLang(val: boolean) {
    this.DefaultLangObservable.next(val);
  }

  sendPageNumber(pageNumber: number) {
    this.pageNumberObservable.next(pageNumber);
    //this.pageSizeObservable.next(pageSize);
  }

  setIsDataSetLoading(val: boolean) {
    this.isDatasetLoadingObservable.next(val);
  }

  getIsDataSetLoading() {
    return this.isDatasetLoadingObservable;
  }

  setDataSetArray(items: any) {
    this.DataSetArrayObservable.next(items);
  }

  getDataSetArray() {
    return this.DataSetArrayObservable;
  }

  sendColumnArray(columnName: object) {
    this.columnArrayObservable.next(columnName);
  }

  sendAccountIdArray(items: any) {
    this.AccountIdArrayObservable.next(items);
  }

  sendCalendarArray(obj: object) {
    this.CalendarObservable.next(obj);
  }

  getCalendarArray(): Observable<any> {
    return this.CalendarObservable;
  }

  getCalendarOutput(name: string): Observable<any> {
    return this.getCalendarArray().pipe(
      filter((items) => {
        if (
          !items ||
          (items && !items.pageName) ||
          (items && items.pageName && items.pageName !== name)
        ) {
          return false;
        }

        if (!this.isCalendarClicked) {
          return false;
        }

        return true;
      })
    );
  }

  sendUpdateDonorCard(isUpdate: boolean) {
    this.UpdateDonorCardObservable.next(isUpdate);
  }

  getDonorAccountId(): Observable<any> {
    return this.DonorAccountIdObservable;
  }

  sendDonorAccountId(accountId: number) {
    this.DonorAccountIdObservable.next(accountId);
  }

  getPaymentTrans(): Observable<any> {
    return this.PaymentTransObservable;
  }
  sendReport(isreload: true) {
    this.ReportObservable.next(isreload);
  }

  getReport(): Observable<any> {
    return this.ReportObservable;
  }
  getpledgeTrans(): Observable<any> {
    return this.PledgeTransObservable;
  }

  sendPaymentTrans(isreload: true) {
    this.PaymentTransObservable.next(isreload);
  }

  getBatch(): Observable<any> {
    return this.BatchObservable;
  }
  sendBatch(isreload: true) {
    this.BatchObservable.next(isreload);
  }
  sendPledgeTrans(isreload: true) {
    this.PledgeTransObservable.next(isreload);
  }

  sendPledgeTransSync(isreload: true) {
    this.PledgeTransSyncObservable.next(isreload);
  }

  sendScheduleTransSync(isreload: true) {
    this.ScheduleTransSyncObservable.next(isreload);
  }

  getScheduleTransSync(): Observable<any> {
    return this.ScheduleTransSyncObservable;
  }

  getPledgeTrans(): Observable<any> {
    return this.PledgeTransObservable;
  }

  getPledgeTransSync(): Observable<any> {
    return this.PledgeTransSyncObservable;
  }

  sendPaymentSchdleTrans(isreload: true) {
    this.PaymentSchdleTransObservable.next(isreload);
  }

  getPaymentSchdleTrans(): Observable<any> {
    return this.PaymentSchdleTransObservable;
  }

  sendPledgeSchdleTrans(isreload: true) {
    this.PledgeSchdleTransObservable.next(isreload);
  }

  getPledgeSchdleTrans(): Observable<any> {
    return this.PledgeSchdleTransObservable;
  }

  sendListSync(isreload: boolean) {
    this.ListSyncObservable.next(isreload);
  }

  getListSync(): Observable<any> {
    return this.ListSyncObservable;
  }

  getDonorLst(): Observable<any> {
    return this.DonorLstObservable;
  }

  sendDonorLst(isreload: true) {
    this.DonorLstObservable.next(isreload);
  }
  // added new
  getDonorSingle(): Observable<any> {
    return this.DonorSingleObservable;
  }

  sendDonorSingle(isreload: any) {
    this.DonorSingleObservable.next(isreload);
  }
  //
  // added new
  getPaymentTransactionData(): Observable<any> {
    return this.PaymentTransactionObservable;
  }

  sendPaymentTransactionData(isreload: any) {
    this.PaymentTransactionObservable.next(isreload);
  }
  //
  getScheduleSingle(): Observable<any> {
    return this.ScheduleSingleObservable;
  }
  sendScheduleSingle(isreload: any) {
    this.ScheduleSingleObservable.next(isreload);
  }
  getCollectorLst(): Observable<any> {
    return this.CollectorLstObservable;
  }

  sendCollectorLst(isreload: true) {
    this.CollectorLstObservable.next(isreload);
  }

  getCampaignLst(): Observable<any> {
    return this.CampaignLstObservable;
  }

  sendCampaignLst(isreload: true) {
    this.CampaignLstObservable.next(isreload);
  }

  getLocationLst(): Observable<any> {
    return this.LocationLstObservable;
  }

  sendLocationLst(isreload: true) {
    this.LocationLstObservable.next(isreload);
  }

  getReasonLst(): Observable<any> {
    return this.ReasonLstObservable;
  }

  sendReasonLst(isreload: true) {
    this.ReasonLstObservable.next(isreload);
  }

  sendUserLst(items: any) {
    this.UserLstObservable.next(items);
  }
  
  getUserLst(): Observable<any> {
    return this.UserLstObservable;
  }

  sendSeatLst(isreload: true) {
    this.SeatLstObservable.next(isreload);
  }

  getSeatLst(): Observable<any> {
    return this.SeatLstObservable;
  }

  getLineHeight(): Observable<any> {
    return this.LineHeightObservable;
  }

  sendLineHeight(changeHeight) {
    this.LineHeightObservable.next(changeHeight);
  }
  //added new
  sendChildPhoneArray(phones) {
    this.PhonesArrayObservable.next(phones);
  }
  getChildPhoneArray() {
    return this.PhonesArrayObservable;
  }

  // end new
  getTreeLineHeight(): Observable<any> {
    return this.LineTreeHeightObservable;
  }

  sendTreeLineHeight(changeHeight) {
    this.LineTreeHeightObservable.next(changeHeight);
  }
  getColumCls(): Observable<any> {
    return this.columClsObservable;
  }

  sendColumCls(changeCls) {
    this.columClsObservable.next(changeCls);
  }
  getUpdateDonorCard(): Observable<any> {
    return this.UpdateDonorCardObservable;
  }

  getColumnNameArray(): Observable<any> {
    return this.columnNameArrayObservable;
  }
  sendColumnNameArray(columnNameList: []) {
    this.columnNameArrayObservable.next(columnNameList);
  }

  getAccountIdArray(): Observable<any> {
    return this.AccountIdArrayObservable;
  }
  sendDonorListArray(items: any) {
    this.DonorListArrayObservable.next(items);
  }

  sendSearchAccountIdArray(items: any) {
    this.SearchAccountIdArrayObservable.next(items);
  }

  getSearchAccountIdArray(): Observable<any> {
    return this.SearchAccountIdArrayObservable;
  }

  getDonorListArray(): Observable<any> {
    return this.DonorListArrayObservable;
  }

  sendColumnName(columnName: string) {
    this.columnNameObservable.next(columnName);
  }
  getColumnName(): Observable<any> {
    return this.columnNameObservable;
  }
  sendReportQuery(reportQueryId: string) {
    this.ReportQueryIdObservable.next(reportQueryId);
  }
  getReportQuery(): Observable<any> {
    return this.ReportQueryIdObservable;
  }

  sendColumnId(columnObj: object) {
    this.ColumnIdObservable.next(columnObj);
  }

  getColumnId(): Observable<any> {
    return this.ColumnIdObservable;
  }

  getColumnArray(): Observable<any> {
    return this.columnArrayObservable;
  }

  getPageNumberObservable(): Observable<any> {
    return this.pageNumberObservable;
  }

  getPageSizeObservable(): Observable<any> {
    return this.pageSizeObservable;
  }

  getStartAndEndDate(sDate) {
    const today = new Date();
    if (sDate == "Today") {
      return {
        startDate: moment(today),
        endDate: moment(today),
      };
    }
    if (sDate == "This Week") {
      return {
        startDate: moment(today).startOf("week"),
        endDate: moment(today).endOf("week"),
      };
    }
    if (sDate == "Last 7 Days") {
      return {
        startDate: moment(today).subtract(6, "days"),
        endDate: moment(today),
      };
    }
    if (sDate == "This Month") {
      return {
        startDate: moment(today).startOf("month"),
        endDate: moment(today).endOf("month"),
      };
    }
    if (sDate == "Next Month") {
      return {
        startDate: moment(today).add(1, "month").startOf("month"),
        endDate: moment(today).add(1, "month").endOf("month"),
      };
    }
    if (sDate == "Last Month") {
      return {
        startDate: moment(today).subtract(1, "month").startOf("month"),
        endDate: moment(today).subtract(1, "month").endOf("month"),
      };
    }
    if (sDate == "This Year") {
      return {
        startDate: moment(today).startOf("year"),
        endDate: moment(today).endOf("year"),
      };
    }
    if (sDate == "Last Year") {
      return {
        startDate: moment(today).subtract(1, "year").startOf("year"),
        endDate: moment(today).subtract(1, "year").endOf("year"),
      };
    }
    if (sDate == "Next Year") {
      return {
        startDate: moment(today).add(1, "year").startOf("year"),
        endDate: moment(today).add(1, "year").endOf("year"),
      };
    }
  }

  downloadFile(res: any, fileName: string) {
    const blob = new Blob([res], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  }
  isLoaderNewTrans: boolean = false;
  getDonorList() {
    var objsearchDonor = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    this.isLoaderNewTrans = true;
    this.donorService.getDonorList(objsearchDonor).subscribe((res: any) => {
      this.localDonorList = res || [];
      this.isLoaderNewTrans = false;
      this.donorListSubject.next(this.localDonorList);
    });
  }

  getCampaignList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getCampaigns("", "", "", eventGuid)
      .subscribe((res: any) => {
        this.bindCampaignListDropDown(res);
      });
  }

  getLocationList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentLocations(eventGuid)
      .subscribe((res: any) => {
        this.bindPaymentLocationListDropDown(res);
      });
  }

  getReasonList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentReasons(eventGuid)
      .subscribe((res: any) => {
        this.bindPaymentReasonListDropDown(res);
      });
  }

  getCityStateZipList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService.getDonorCityStateZip(eventGuid).subscribe((res: any) => {
      this.bindCityZipListDropDown(res);
    });
  }

  getCollectorList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentCollectors(eventGuid)
      .subscribe((res: any) => {
        this.bindPaymentCollectorListDropDown(res);
      });
  }

  getSourceList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getDeviceTypes(eventGuid)
      .subscribe((res: any) => {
        this.bindDeviceTypeListDropDown(res);
      });
  }

  getAdvanceFieldList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.advanceFieldService.getAll(eventGuid).subscribe((res: any) => {
      this.bindAdvanceFieldListDropDown(res);
    });
  }

  getList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentCollectors(eventGuid)
      .subscribe((res: any) => {
        this.bindPaymentCollectorListDropDown(res);
      });
  }

  getLocationTypeList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    this.commonAPIMethodService
      .getLocationType(eventGuid, macAddress)
      .subscribe((res: any) => {
        this.bindLocationTypeListDropDown(res);
      });
  }

  getPlanTypeList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPlanTypes(eventGuid)
      .subscribe((res: any) => {
        this.bindPlanTypeListDropDown(res);
      });
  }
  getStatesList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService.getStates(eventGuid).subscribe((res: any) => {
      this.bindStateListDropDown(res);
    });
  }

  getScheduleRepeatTypeList() {
    this.commonAPIMethodService
      .getScheduleRepeatTypes()
      .subscribe((res: any) => {
        this.bindScheduleRepeatTypeListDropDown(res);
      });
  }
  getCurrencyList() {
    this.commonAPIMethodService.getCurrencies().subscribe((res: any) => {
      this.bindCurrencyListDropDown(res);
    });
  }

  //  updated methods
  public requestDataFromMultipleSourcesCache(
    ngUnsubscribe: Subject<void>,
    isPaymentTypeRequired: boolean,
    isPaymentReasonRequired: boolean,
    isCampaignRequired: boolean,
    isPaymentLocationRequired: boolean,
    isPaymentCollectorRequired: boolean,
    isPaymentDeviceRequired: boolean,
    isDeviceTypeRequired: boolean,
    isOrderDeviceStatus: boolean,
    isPaymentApprovalRequired: boolean,
    isScheduleRepeatTypeRequired: boolean,
    isPaymentStatusRequired: boolean,
    isPledgeStatusRequired: boolean,
    isScheduleStatusRequired: boolean,
    isCityStateZipRequired: boolean,
    isCurrencyStatus: boolean
  ): Observable<any[]> {
    this.isCommonDropDownloading = true;
    let eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    if (eventGuid) {
      let resPaymentType =
        isPaymentTypeRequired && this.paymentTypeList.length == 0
          ? this.commonAPIMethodService
              .getPaymentTypes(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentReason =
        isPaymentReasonRequired && this.paymentReasonList.length == 0
          ? this.commonAPIMethodService
              .getPaymentReasons(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resCampaigns =
        isCampaignRequired && this.CampaignList.length == 0
          ? this.commonAPIMethodService
              .getCampaigns("", "", "", eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentLocation =
        isPaymentLocationRequired && this.paymentLocationList.length == 0
          ? this.commonAPIMethodService
              .getPaymentLocations(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentCollector =
        isPaymentCollectorRequired && this.paymentCollectorList.length == 0
          ? this.commonAPIMethodService
              .getPaymentCollectors(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentDevices =
        isPaymentDeviceRequired && this.paymentDeviceList.length == 0
          ? this.commonAPIMethodService
              .getPaymentDevices(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resDeviceTypes =
        isDeviceTypeRequired && this.deviceTypeList.length == 0
          ? this.commonAPIMethodService
              .getDeviceTypes(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resOrderDeviceStatuses =
        isOrderDeviceStatus && this.orderDeviceStatusList.length == 0
          ? this.commonAPIMethodService
              .getOrderDeviceStatuses(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentApprovals =
        isPaymentApprovalRequired && this.paymentApprovalsList.length == 0
          ? this.commonAPIMethodService
              .getPaymentApprovals(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resScheduleRepeatTypes =
        isScheduleRepeatTypeRequired && this.scheduleRepatTypeList.length == 0
          ? this.commonAPIMethodService
              .getScheduleRepeatTypes()
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPaymentStatus =
        isPaymentStatusRequired && this.paymentStatusList.length == 0
          ? this.commonAPIMethodService
              .getPaymentStatus(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resPledgeStatus =
        isPledgeStatusRequired && this.pledgeStatusList.length == 0
          ? this.commonAPIMethodService
              .getPledgeStatus(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      let resScheduleStatus =
        isScheduleStatusRequired && this.scheduleStatusList.length == 0
          ? this.commonAPIMethodService
              .getScheduleStatus(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);

      let resCityStateZip =
        isCityStateZipRequired && this.cityStateZipList.length == 0
          ? this.donorService
              .getDonorCityStateZip(eventGuid)
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);

      let resCurrencyStatuses =
        isCurrencyStatus && this.currencyList.length == 0
          ? this.commonAPIMethodService
              .getCurrencies()
              .pipe(takeUntil(ngUnsubscribe))
          : of(null);
      //Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
      return forkJoin([
        resPaymentType,
        resPaymentReason,
        resCampaigns,
        resPaymentLocation,
        resPaymentCollector,
        resPaymentDevices,
        resDeviceTypes,
        resOrderDeviceStatuses,
        resPaymentApprovals,
        resScheduleRepeatTypes,
        resPaymentStatus,
        resPledgeStatus,
        resScheduleStatus,
        resCityStateZip,
        resCurrencyStatuses,
      ]);
      //return forkJoin(arrRequest);
    }
  }

  // common fields dropdown with cached data
  bindCommonFieldDropDownsCache(
    ngUnsubscribe: Subject<void>,
    isPaymentTypeRequired: boolean,
    isPaymentReasonRequired: boolean,
    isCampaignRequired: boolean,
    isPaymentLocationRequired: boolean,
    isPaymentCollectorRequired: boolean,
    isPaymentDeviceRequired: boolean,
    isDeviceTypeRequired: boolean,
    isOrderDeviceStatus: boolean,
    isPaymentApprovalRequired: boolean,
    isScheduleRepeatTypeRequired: boolean,
    isPaymentStatusRequired: boolean,
    isPledgeStatusRequired: boolean,
    isScheduleStatusRequired: boolean,
    isCityStateZipRequired: boolean,
    isCurrencyStatus: boolean
  ) {
    this.requestDataFromMultipleSourcesCache(
      ngUnsubscribe,
      isPaymentTypeRequired,
      isPaymentReasonRequired,
      isCampaignRequired,
      isPaymentLocationRequired,
      isPaymentCollectorRequired,
      isPaymentDeviceRequired,
      isDeviceTypeRequired,
      isOrderDeviceStatus,
      isPaymentApprovalRequired,
      isScheduleRepeatTypeRequired,
      isPaymentStatusRequired,
      isPledgeStatusRequired,
      isScheduleStatusRequired,
      isCityStateZipRequired,
      isCurrencyStatus
    ).subscribe(
      (responseList) => {
        this.bindPaymentTypeListDropDown(responseList[0]);
        this.bindPaymentReasonListDropDown(responseList[1]);

        this.bindCampaignListDropDown(responseList[2]);
        this.bindPaymentLocationListDropDown(responseList[3]);
        this.bindPaymentCollectorListDropDown(responseList[4]);
        this.bindPaymentDeviceListDropDown(responseList[5]);
        this.bindDeviceTypeListDropDown(responseList[6]);
        this.bindOrderDeviceStatusListDropDown(responseList[7]);
        this.bindPaymentApprovalListDropDown(responseList[8]);
        this.bindScheduleRepeatTypeListDropDown(responseList[9]);
        this.bindPaymentStatusListDropDown(responseList[10]);
        this.bindPledgeStatusListDropDown(responseList[11]);
        this.bindScheduleStatusListDropDown(responseList[12]);
        this.bindCityZipListDropDown(responseList[13]);
        this.bindCurrencyListDropDown(responseList[14]);

        this.bindAmountTypeListDropDown();
        this.isCommonDropDownloading = false;
      },
      (error) => {
        this.isCommonDropDownloading = false;
        this.notificationService.showError(
          "Error while fetching data..",
          "Error !!"
        );
      }
    );
  }

  // common fields dropdown related api requests using fork join
  public requestDataFromMultipleSources(
    ngUnsubscribe: Subject<void>,
    isPaymentTypeRequired: boolean,
    isPaymentReasonRequired: boolean,
    isCampaignRequired: boolean,
    isPaymentLocationRequired: boolean,
    isPaymentCollectorRequired: boolean,
    isPaymentDeviceRequired: boolean,
    isDeviceTypeRequired: boolean,
    isOrderDeviceStatus: boolean,
    isPaymentApprovalRequired: boolean,
    isScheduleRepeatTypeRequired: boolean,
    isPaymentStatusRequired: boolean,
    isPledgeStatusRequired: boolean,
    isScheduleStatusRequired: boolean
  ): Observable<any[]> {
    this.isCommonDropDownloading = true;
    let eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    if (eventGuid) {
      let resPaymentType = isPaymentTypeRequired
        ? this.commonAPIMethodService
            .getPaymentTypes(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentReason = isPaymentReasonRequired
        ? this.commonAPIMethodService
            .getPaymentReasons(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resCampaigns = isCampaignRequired
        ? this.commonAPIMethodService
            .getCampaigns("", "", "", eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentLocation = isPaymentLocationRequired
        ? this.commonAPIMethodService
            .getPaymentLocations(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentCollector = isPaymentCollectorRequired
        ? this.commonAPIMethodService
            .getPaymentCollectors(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentDevices = isPaymentDeviceRequired
        ? this.commonAPIMethodService
            .getPaymentDevices(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resDeviceTypes = isDeviceTypeRequired
        ? this.commonAPIMethodService
            .getDeviceTypes(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resOrderDeviceStatuses = isOrderDeviceStatus
        ? this.commonAPIMethodService
            .getOrderDeviceStatuses(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentApprovals = isPaymentApprovalRequired
        ? this.commonAPIMethodService
            .getPaymentApprovals(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resScheduleRepeatTypes = isScheduleRepeatTypeRequired
        ? this.commonAPIMethodService
            .getScheduleRepeatTypes()
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPaymentStatus = isPaymentStatusRequired
        ? this.commonAPIMethodService
            .getPaymentStatus(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resPledgeStatus = isPledgeStatusRequired
        ? this.commonAPIMethodService
            .getPledgeStatus(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      let resScheduleStatus = isScheduleStatusRequired
        ? this.commonAPIMethodService
            .getScheduleStatus(eventGuid)
            .pipe(takeUntil(ngUnsubscribe))
        : of(null);
      //Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
      return forkJoin([
        resPaymentType,
        resPaymentReason,
        resCampaigns,
        resPaymentLocation,
        resPaymentCollector,
        resPaymentDevices,
        resDeviceTypes,
        resOrderDeviceStatuses,
        resPaymentApprovals,
        resScheduleRepeatTypes,
        resPaymentStatus,
        resPledgeStatus,
        resScheduleStatus,
      ]);
      //return forkJoin(arrRequest);
    }
  }

  bindCommonFieldDropDowns(
    ngUnsubscribe: Subject<void>,
    isPaymentTypeRequired: boolean,
    isPaymentReasonRequired: boolean,
    isCampaignRequired: boolean,
    isPaymentLocationRequired: boolean,
    isPaymentCollectorRequired: boolean,
    isPaymentDeviceRequired: boolean,
    isDeviceTypeRequired: boolean,
    isOrderDeviceStatus: boolean,
    isPaymentApprovalRequired: boolean,
    isScheduleRepeatTypeRequired: boolean,
    isPaymentStatusRequired: boolean,
    isPledgeStatusRequired: boolean,
    isScheduleStatusRequired: boolean
  ) {
    this.requestDataFromMultipleSources(
      ngUnsubscribe,
      isPaymentTypeRequired,
      isPaymentReasonRequired,
      isCampaignRequired,
      isPaymentLocationRequired,
      isPaymentCollectorRequired,
      isPaymentDeviceRequired,
      isDeviceTypeRequired,
      isOrderDeviceStatus,
      isPaymentApprovalRequired,
      isScheduleRepeatTypeRequired,
      isPaymentStatusRequired,
      isPledgeStatusRequired,
      isScheduleStatusRequired
    ).subscribe(
      (responseList) => {
        this.bindPaymentTypeListDropDown(responseList[0]);
        this.bindPaymentReasonListDropDown(responseList[1]);
        this.bindCampaignListDropDown(responseList[2]);
        this.bindPaymentLocationListDropDown(responseList[3]);
        this.bindPaymentCollectorListDropDown(responseList[4]);
        this.bindPaymentDeviceListDropDown(responseList[5]);
        this.bindDeviceTypeListDropDown(responseList[6]);
        this.bindOrderDeviceStatusListDropDown(responseList[7]);
        this.bindPaymentApprovalListDropDown(responseList[8]);
        this.bindScheduleRepeatTypeListDropDown(responseList[9]);
        this.bindPaymentStatusListDropDown(responseList[10]);
        this.bindPledgeStatusListDropDown(responseList[11]);
        this.bindScheduleStatusListDropDown(responseList[12]);
        this.bindAmountTypeListDropDown();
        this.isCommonDropDownloading = false;
      },
      (error) => {
        this.isCommonDropDownloading = false;
        this.notificationService.showError(
          "Error while fetching data..",
          "Error !!"
        );
      }
    );
  }

  bindPaymentTypeListDropDown(resPaymentType) {
    if (resPaymentType && resPaymentType.length > 0) {
      this.paymentTypeList = [];
      resPaymentType.forEach((s) => {
        let obj = {
          id: s.paymentTypeID,
          itemName: s.paymentType,
        };
        this.paymentTypeList.push(obj);
      });
      this.orgPaymentTypeList = this.paymentTypeList;
    }
  }

  bindPaymentReasonListDropDown(resReason) {
    if (resReason) {
      if (resReason && resReason.length > 0) {
        this.paymentReasonList = [];
        this.localReasonList = []; // Remove when Delete Reason and show only Active Reasons
        return resReason.map((element) => {
          let obj = {
            id: element.reasonId,
            itemName:
              element.reasonJewishName != ""
                ? element.reasonJewishName
                : element.paymentReason,
            reasonJewishName: element.reasonJewishName,
            num: element.number != null ? `"#"${element.number}` : "",
            status: element.status,
          };
          this.paymentReasonList.push(obj);
          this.localReasonList.push(obj);
          this.orgPaymentReasonList.push(obj);
        });
      }
    }
  }

  bindPaymentLocationListDropDown(resPaymentLocation) {
    if (resPaymentLocation) {
      if (resPaymentLocation && resPaymentLocation.length > 0) {
        this.paymentLocationList = [];

        resPaymentLocation.forEach((element) => {
          let obj = {
            id: element.locationID,
            itemName:
              element.locationJewishName != null
                ? element.locationJewishName
                : element.locationName,
            locationJewishName: element.locationJewishName,
            address: element.address,
          };
          this.paymentLocationList.push(obj);
          this.localLocationList.push(obj);
          this.orgPaymentLocationList.push(obj);
          this.paymentGlobalLocationList.push(obj);
        });
      }
    }
  }

  bindLocationListDropDown(resLocation) {
    if (resLocation) {
      if (resLocation && resLocation.length > 0) {
        this.paymentLocationList = [];
        resLocation.forEach((element) => {
          let obj = {
            id: element.locationID,
            itemName:
              element.locationNameJewish != null
                ? element.locationNameJewish
                : element.locationName,
            locationJewishName: element.locationNameJewish,
            address: element.address,
          };
          this.locationList.push(obj);
        });
      }
    }
  }

  bindPaymentCollectorListDropDown(resPaymentCollector) {
    if (resPaymentCollector) {
      if (resPaymentCollector && resPaymentCollector.length > 0) {
        this.paymentCollectorList = [];
        this.localCollectorList = []; //  Remove when Delete Collector and show only Active Collectors
        resPaymentCollector.forEach((element) => {
          let obj = {
            id: element.collectorId,
            // itemName: element.collectorJewishName!=""?element.collectorJewishName:element.collectorName,
            itemName:
              element.collectorJewishName != null
                ? element.collectorJewishName
                : element.collectorName,
          };
          this.paymentCollectorList.push(obj);
          this.localCollectorList.push(obj);
          this.orgPaymentCollectorList.push(obj);
        });
      }
    }
  }

  bindAdvanceFieldListDropDown(resAdvanceField) {
    if (resAdvanceField) {
      if (resAdvanceField && resAdvanceField.length > 0) {
        this.advanceFieldList = [];
        resAdvanceField.forEach((element) => {
          let obj = {
            id: element.advancedFieldId,
            itemName: element.fieldName,
          };
          this.advanceFieldList.push(obj);
          //this.localCollectorList.push(obj);
        });
      }
    }
  }

  bindLocationTypeListDropDown(resLocationType) {
    if (resLocationType) {
      if (resLocationType && resLocationType.length > 0) {
        this.locationTypeList = [];
        resLocationType.forEach((element) => {
          let obj = {
            id: element.locationTypeid,
            itemName: element.locationType,
          };
          this.locationTypeList.push(obj);
        });
      }
    }
  }

  bindPlanTypeListDropDown(resPlanType) {
    if (resPlanType) {
      if (resPlanType && resPlanType.length > 0) {
        this.planTypeList = [];
        resPlanType.forEach((element) => {
          let obj = {
            id: element.recordTypeId,
            itemName: element.recordType,
          };
          this.planTypeList.push(obj);
        });
      }
    }
  }

  bindStateListDropDown(resState) {
    if (resState) {
      if (resState && resState.length > 0) {
        this.stateList = [];
        resState.forEach((element) => {
          let obj = {
            id: element.abbreviations,
            itemName: element.name,
          };
          this.stateList.push(obj);
        });
      }
    }
  }

  bindPaymentDeviceListDropDown(resPaymentDevice) {
    if (resPaymentDevice) {
      if (resPaymentDevice && resPaymentDevice.length > 0) {
        this.paymentDeviceList = [];
        resPaymentDevice.forEach((element) => {
          let obj = {
            id: element.deviceId,
            itemName: element.deviceName,
          };
          this.paymentDeviceList.push(obj);
        });
      }
      this.orgpaymentDeviceList = this.paymentDeviceList;
    }
  }

  bindDeviceTypeListDropDown(resDeviceTypes) {
    if (resDeviceTypes) {
      if (resDeviceTypes && resDeviceTypes.length > 0) {
        this.deviceTypeList = [];
        this.localDeviceTypeList = [];
        resDeviceTypes.forEach((element) => {
          let obj = {
            id: element.deviceTypeID,
            itemName: element.deviceTypeName,
          };
          this.deviceTypeList.push(obj);
          this.localDeviceTypeList.push(obj);
        });
      }
      this.orgDeviceTypeList = this.deviceTypeList;
    }
  }

  bindOrderDeviceStatusListDropDown(resOrderDeviceStatus) {
    if (resOrderDeviceStatus) {
      if (resOrderDeviceStatus && resOrderDeviceStatus.length > 0) {
        this.orderDeviceStatusList = [];
        resOrderDeviceStatus.forEach((element) => {
          let obj = {
            id: element.orderDevicesStatusID,
            itemName: element.orderDevicesStatusName,
          };
          this.orderDeviceStatusList.push(obj);
        });
      }
      this.orgDeviceStatusList = this.orderDeviceStatusList;
    }
  }

  bindPaymentStatusListDropDown(resPaymentStatus) {
    if (resPaymentStatus) {
      if (resPaymentStatus && resPaymentStatus.length > 0) {
        this.paymentStatusList = [];
        resPaymentStatus.forEach((element) => {
          let obj = {
            id: element.paymentStatusId,
            itemName: element.paymentStatus,
          };
          this.paymentStatusList.push(obj);
        });
      }
      this.orgPaymentStatusList = this.paymentStatusList;
    }
  }

  bindPledgeStatusListDropDown(resPledgeStatus) {
    if (resPledgeStatus) {
      if (resPledgeStatus && resPledgeStatus.length > 0) {
        this.pledgeStatusList = [];
        resPledgeStatus.forEach((element) => {
          let obj = {
            id: element.pledgeStatusId,
            itemName: element.pledgeStatus,
          };
          this.pledgeStatusList.push(obj);
        });
      }
    }
  }

  bindScheduleStatusListDropDown(resScheduleStatus) {
    if (resScheduleStatus) {
      if (resScheduleStatus && resScheduleStatus.length > 0) {
        this.scheduleStatusList = [];
        resScheduleStatus.forEach((element) => {
          let obj = {
            id: element.statusId,
            itemName: element.status,
          };
          this.scheduleStatusList.push(obj);
        });
      }
    }
  }

  bindCityStateZipListDropDown(cityStateZipRes) {
    if (cityStateZipRes) {
      if (cityStateZipRes && cityStateZipRes.length > 0) {
        this.cityStateZipList = [];
        cityStateZipRes.forEach((element, i) => {
          let obj = {
            id: i,
            itemName: `${element.city || ""} ${element.state || ""} ${
              element.zip || ""
            }`,
            city: element.city,
            state: element.state,
            zip: element.zip,
          };
          this.cityStateZipList.push(obj);
        });
      }
    }
  }
  bindCityZipListDropDown(cityStateZipRes) {
    if (cityStateZipRes) {
      let citys = [];
      let zips = [];
      if (cityStateZipRes && cityStateZipRes.length > 0) {
        cityStateZipRes.forEach((element, i) => {
          let objCity = {
            id: i,
            itemName: `${element.city || ""} ${element.state || ""}`,
            city: element.city,
            state: element.state,
          };
          let objZip = {
            id: i,
            itemName: `${element.zip || ""}`,
            city: element.city,
            state: element.state,
          };
          if (objCity.itemName) {
            citys.push(objCity);
          }
          if (objZip.itemName) {
            zips.push(objZip);
          }
        });
      }
      this.cityList = citys.reduce((uniqueCitys, o) => {
        if (!uniqueCitys.some((obj) => obj.itemName === o.itemName)) {
          uniqueCitys.push(o);
        }
        return uniqueCitys;
      }, []);
      this.orgCityList = this.cityList;

      this.zipList = zips.reduce((uniqueZips, o) => {
        if (!uniqueZips.some((obj) => obj.itemName === o.itemName)) {
          uniqueZips.push(o);
        }
        return uniqueZips;
      }, []);
      this.orgZipList = this.zipList;
    }
  }
  bindCurrencyListDropDown(resCurrencyStatuses) {
    if (resCurrencyStatuses) {
      if (resCurrencyStatuses && resCurrencyStatuses.length > 0) {
        this.currencyList = [];

        resCurrencyStatuses.forEach((element) => {
          let obj = {
            id: element.currencyId,
            itemName: element.currencyName,
          };
          this.currencyList.push(obj);
        });
      }
      this.orgPaymentCurrencyList = this.currencyList;
    }
  }

  bindAmountTypeListDropDown() {
    var resAmountType = [
      { id: -1, itemName: "Total Amount" },
      { id: 1, itemName: "Paid" },
      { id: 2, itemName: "Balance" },
    ];
    if (resAmountType) {
      if (resAmountType && resAmountType.length > 0) {
        this.amountTypeList = [];

        resAmountType.forEach((element) => {
          let obj = {
            id: element.id,
            itemName: element.itemName,
          };
          this.amountTypeList.push(obj);
        });
      }
    }
  }

  bindScheduleRepeatTypeListDropDown(resScheduleRepeatType) {
    if (resScheduleRepeatType) {
      if (resScheduleRepeatType && resScheduleRepeatType.length > 0) {
        this.scheduleRepatTypeList = [];
        resScheduleRepeatType.forEach((element) => {
          let obj = {
            id: element.valueID,
            itemName: element.field,
          };
          this.scheduleRepatTypeList.push(obj);

          this.localscheduleRepatTypeList.push(obj);
        });
      }
    }
  }

  bindPaymentApprovalListDropDown(resPaymentApprovals) {
    if (resPaymentApprovals) {
      if (resPaymentApprovals && resPaymentApprovals.length > 0) {
        this.paymentApprovalsList = [];
        resPaymentApprovals.forEach((element) => {
          let obj = {
            id: element.approval,
            itemName: element.approval,
          };
          this.paymentApprovalsList.push(obj);
        });
      }
      this.orgPaymentApprovalList = this.paymentApprovalsList;
    }
  }

  // Campaign
  bindCampaignListDropDown(resCampaign) {
    if (resCampaign) {
      if (resCampaign && resCampaign.length > 0) {
        this.CampaignList = [];
        this.localCampaignList = []; // Remove when Delete Campaign and show only Active Campaign
        resCampaign = resCampaign.sort((a, b) => b.isActive - a.isActive);
        resCampaign.forEach((element) => {
          let obj = {
            id: element.campaignId,
            itemName: element.campaignFullHierarchy,
            num:
              element.campaignNumber != null
                ? "#" + element.campaignNumber
                : "",
            status: element.isActive == true ? "" : "InActive",
          };

          this.CampaignList.push(obj);
          this.localCampaignList.push(obj);

          this.orgPaymentCampaignList.push(obj);
        });
      }
    }
  }

  // Donor search drop down related methods
  onDonorLocationSearchFieldChange(query: string, isGlobal = false) {
    this.isGlobalSearch = isGlobal;
    if (query && query.length > 2) {
      this.paymentGlobalLocationList = [];
      //this.loaderSearch = true;
      let logInUserObj = this.localstoragedataService.getLoginUserData();
      let eventGuid = logInUserObj.eventGuid;
      this.commonAPIMethodService
        .getPaymentLocations(eventGuid, query, isGlobal)
        .subscribe(
          (res: Array<any>) => {
            this.paymentGlobalLocationList = [];
            res.forEach((element) => {
              let obj = {
                id: element.locationID,
                itemName:
                  element.locationJewishName != null
                    ? element.locationJewishName
                    : element.locationName,
                locationJewishName: element.locationJewishName,
                address: element.address,
              };
              // this.paymentGlobalLocationList.push(obj);
              this.paymentGlobalLocationList = [
                ...this.paymentGlobalLocationList,
                obj,
              ];
            });
            if (!isGlobal) {
              this.paymentGlobalLocationList =
                this.paymentGlobalLocationList.filter((x) =>
                  x.itemName.toLowerCase().includes(query.toLowerCase())
                );
            }
            //this.loaderSearch = false;
          },
          (error) => {
            this.loaderSearch = false;
            this.notificationService.showError(error.error, "Error !!");
          }
        );
    } else {
      this.paymentGlobalLocationList = [];
      this.paymentGlobalLocationList = this.localLocationList;

      if (!isGlobal && query.trim().length > 0) {
        this.paymentGlobalLocationList = this.paymentGlobalLocationList.filter(
          (x) => x.itemName.toLowerCase().includes(query.toLowerCase())
        );
      }
    }
  }

  // Donor search drop down related methods
  onDonorSearchFieldChange(query: string, isGlobal = false) {
    this.isGlobalSearch = isGlobal;
    if (query && query.length > 2) {
      this.donorList = [];

      //this.txtQueryChanged.next(query);
      this.isglobalSearchApiCall = true;
      this.isglobalSearchApiCall2 = true;
      this.loaderSearch = true;
      let logInUserObj = this.localstoragedataService.getLoginUserData();
      let eventGuid = logInUserObj.eventGuid;
      this.commonAPIMethodService
        .getDonors(eventGuid, query, 0, true, this.isGlobalSearch)
        .subscribe(
          (res: Array<any>) => {
            if (res && res.length > 0) {
              res.forEach((element) => {
                let index = this.donorList.findIndex(
                  (s) => s.id == element.accountId
                );
                if (index == -1) {
                  // remove duplicates
                  let obj = {
                    id: element.accountId,
                    accountId: element.accountId,
                    itemName: this.setDonorSearchDescription(element),
                    displayText: element.fullNameJewish
                      ? element.fullNameJewish
                      : element.fullName,
                    fullNameJewish: element.fullNameJewish,
                    fullName: element.fullName,
                    phoneNumber: this.setDonorPhoneNumber(element),
                    address: element.address,
                    cityStateZip: element.cityStateZip,
                    father: element.father,
                    fatherInLaw: element.fatherInLaw,
                    accountNum: element.accountNum,
                    defaultLocation: element.defaultLocation,
                    globalId: element.globalId,
                    emails: element.emails,
                    phoneLabels: element.phoneLabels,
                    phonenumbers: element.phonenumbers,
                    status: element.donorStatus,
                    displayJewish:
                      element.fullNameJewish == ""
                        ? element.fullName
                        : element.fullNameJewish,
                  };
                  // this.donorList.push(obj);
                  this.donorList = [...this.donorList, obj];
                }
              });
            }
            this.loaderSearch = false;
            this.isglobalSearchApiCall = false;
            this.isglobalSearchApiCall2 = false;
            this.searchLoader.next(false);
          },
          (error) => {
            this.loaderSearch = false;
            this.searchLoader.next(false);
            this.notificationService.showError(error.error, "Error !!");
          }
        );
    }
  }

  setDonorSearchDescription(donorObj) {
    let description: string = "";
    if (donorObj.accountNum) {
      description = donorObj.accountNum + " / ";
    }
    description += donorObj.fullNameJewish
      ? donorObj.fullNameJewish
      : donorObj.fullName;
    if (donorObj.address) {
      description += " / " + donorObj.address;
    }
    if (donorObj.phonenumbers) {
      description += " / " + donorObj.phonenumbers;
    }
    if (donorObj.emails) {
      description += " / " + donorObj.emails;
    }

    return description;
  }

  setDonorPhoneNumber(donorObj) {
    if (donorObj.phonenumbers && donorObj.phoneLabels) {
      if (donorObj.phoneLabels && donorObj.phoneLabels.indexOf(",") > -1) {
        var lblArray = donorObj.phoneLabels.split(",");
        var phoneNoArray = donorObj.phonenumbers.split(",");
        var phoneLblArray = [];
        for (var k = 0; k < lblArray.length; k++) {
          phoneLblArray.push(lblArray[k].trim().charAt(0));
        }

        //let maxList =  showmax &&  showmax < phoneLblArray.length ? showmax: phoneLblArray.length;

        for (var j = 0; j < phoneLblArray.length; j++) {
          if (donorObj.phoneLabels2)
            donorObj.phoneLabels2 =
              donorObj.phoneLabels2 +
              "<br/>" +
              '<span class="formt_lbl">' +
              phoneLblArray[j] +
              "</span>" +
              ": " +
              "<strong>" +
              this.formatPhoneNumber(phoneNoArray[j]) +
              "</strong>";
          else
            donorObj.phoneLabels2 =
              '<span class="formt_lbl">' +
              phoneLblArray[j] +
              "</span>" +
              ": " +
              "<strong>" +
              this.formatPhoneNumber(phoneNoArray[j]) +
              "</strong>";
        }
      } else {
        donorObj.phoneLabels2 =
          '<span class="formt_lbl">' +
          donorObj.phoneLabels.trim().charAt(0) +
          "</span>" +
          ": " +
          "<strong>" +
          this.formatPhoneNumber(donorObj.phonenumbers) +
          "</strong>";
      }
      return donorObj.phoneLabels2;
    }
    return "";
  }
  formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    let len = cleaned.length;

    if (cleaned && len === 10) {
      var match = cleaned.match(/^(\d{3})(\d{3})(\d{1,4})$/);
      if (match) {
        return "(" + match[1] + ") " + match[2] + "-" + match[3];
      }
      return null;
    }

    var match = cleaned.match(/^(\d{3})(\d{3})(\d+)$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return null;
  }

  resetCommonDropDownList() {
    // this.donorList = [];
    // this.paymentTypeList = [];
    // this.paymentReasonList = [];
    // this.paymentLocationList = [];
    // this.paymentCollectorList = [];
    // this.paymentDeviceList = [];
    // this.paymentApprovalsList = [];
    // this.scheduleRepatTypeList = [];
    this.selectedDonors = [];
    this.selectedPaymentTypes = [];
    this.selectedCityTypes = [];
    this.selectedZipTypes = [];
    this.selectedPaymentReasons = [];
    this.selectedPaymentLocations = [];
    this.selectedPaymentCollectors = [];
    this.selectedPaymentDevices = [];
    this.selectedPaymentDeviceTypes = [];
    this.selectedPaymentApprovals = [];
    this.selectedScheduleRepeatTypes = [];
    this.selectedScheduleFailedCount = [];
    this.selectedPaymentStatus = [];
    this.selectedPledgeStatus = [];
    this.selectedScheduleStatus = [];
    this.selectedOrderDeviceStatus = [];
    this.selectedAmountType = [];
    this.txtQuery = "";
    this.loaderSearch = false;
    this.selectedCurrencyList = [];
    //this.CampaignList = [];
    this.selectedFromCampaignList = [];
    //this.isCommonDropDownloading = false;
  }

  // Slider related properties
  minValue: number;
  maxValue: number;

  minBalanceValue: number;
  maxBalanceValue: number;
  options: Options = {
    floor: 0,
    ceil: 100000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "<b>Min price:</b> " + this.formatAmount(value);
        case LabelType.High:
          return "<b>Max price:</b> " + this.formatAmount(value);
        default:
          return this.formatAmount(value);
      }
    },
  };
  onDeSelectAll(filterName: any) {
    switch (filterName) {
      case "donorList":
        this.selectedDonors = [];
        break;
      case "paymentTypeList":
        this.selectedPaymentTypes = [];
        break;
      case "cityTypeList":
        this.selectedCityTypes = [];
        break;
      case "zipTypeList":
        this.selectedZipTypes = [];
        break;
      case "paymentReasonList":
        this.selectedPaymentReasons = [];
        break;
      case "paymentLocationList":
        this.selectedPaymentLocations = [];
        break;
      case "paymentCollectorList":
        this.selectedPaymentCollectors = [];
        break;
      case "orderDeviceStatus":
        this.selectedOrderDeviceStatus = [];
        break;
      case "paymentDeviceList":
        this.selectedPaymentDevices = [];
        break;
      case "deviceTypeList":
        this.selectedPaymentDeviceTypes = [];
        break;
      case "paymentApprovalsList":
        this.selectedPaymentApprovals = [];
        break;
      case "scheduleRepatTypeList":
        this.selectedScheduleRepeatTypes = [];
        break;
      case "scheduleFailedCountList":
        this.selectedScheduleFailedCount = [];
        break;
      case "CampaignList":
        this.selectedFromCampaignList = [];
        break;
      case "PaymentStatusList":
        this.selectedPaymentStatus = [];
        break;
      case "PledgeStatusList":
        this.selectedPledgeStatus = [];
        break;
      case "ScheduleStatusList":
        this.selectedScheduleStatus = [];
        break;
      case "AmountTypeList":
        this.selectedAmountType = [];
        break;
      case "AdvanceFieldList":
        this.selectedAmountType = [];
        break;
      case "cityStateZipList":
        this.selectedCityStateZipList = [];
        break;
      case "deviceType":
        this.deviceTypeList = [];
        break;
      case "currencyList":
        this.selectedCurrencyList = [];
        break;
    }
  }
  onSelectAll(filterName, event) {
    switch (filterName) {
      case "paymentDeviceList":
        this.selectedPaymentDevices = event;
        break;
      case "paymentReasonList":
        this.selectedPaymentReasons = event;
        break;
      case "paymentCollectorList":
        this.selectedPaymentCollectors = event;

        break;
      case "paymentLocationList":
        this.selectedPaymentLocations = event;
        break;
      case "CampaignList":
        this.selectedFromCampaignList = event;
        break;
      case "paymentTypeList":
        this.selectedPaymentTypes = event;
        break;
      case "deviceTypeList":
        this.selectedPaymentDeviceTypes = event;
        break;
      case "PaymentStatusList":
        this.selectedPaymentStatus = event;
        break;
      case "paymentApprovalsList":
        this.selectedPaymentApprovals = event;
        break;
      case "orderDeviceStatus":
        this.selectedOrderDeviceStatus = event;
        break;
    }
  }
  orgpaymentDeviceList = [];
  orgPaymentReasonList = [];
  orgPaymentCollectorList = [];
  orgPaymentLocationList = [];
  orgPaymentCampaignList = [];
  orgPaymentTypeList = [];
  orgDeviceTypeList = [];
  orgPaymentStatusList = [];
  orgDeviceStatusList = [];
  orgPaymentApprovalList = [];
  orgPaymentCurrencyList = [];
  orgCityList = [];
  orgZipList = [];

  onSearch(filterName, event) {
    switch (filterName) {
      case "paymentTypeList":
        if (event.target.value != "") {
          let paymentType = this.orgPaymentTypeList;
          this.paymentTypeList = paymentType.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.paymentTypeList = this.orgPaymentTypeList;
        }
        break;
      case "deviceTypeList":
        if (event.target.value != "") {
          let soureType = this.orgDeviceTypeList;
          this.deviceTypeList = soureType.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.deviceTypeList = this.orgDeviceTypeList;
        }
        break;
      case "paymentDeviceList":
        if (event.target.value != "") {
          let paymentDevice = this.orgpaymentDeviceList;
          this.paymentDeviceList = paymentDevice.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.paymentDeviceList = this.orgpaymentDeviceList;
        }
        break;
      case "paymentReasonList":
        const inputValue = event.target.value.trim().toLowerCase();
        if (event.target.value != "") {
          let paymentReason = this.orgPaymentReasonList;
          this.paymentReasonList = paymentReason.filter((obj) => {
            return (
              (obj.itemName &&
                obj.itemName
                  .toString()
                  .toLowerCase()
                  .indexOf(event.target.value.toString().toLowerCase()) > -1) ||
              obj.num.includes(inputValue)
            );
          });
        } else {
          this.paymentReasonList = this.orgPaymentReasonList;
        }
        break;
      case "paymentCollectorList":
        if (event.target.value != "") {
          let paymentCollector = this.orgPaymentCollectorList;
          let searchText = event.target.value;
          this.localCollectorList = paymentCollector.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(searchText.toString().toLowerCase()) > -1
          );
        } else {
          this.localCollectorList = this.orgPaymentCollectorList;
        }
        break;
      case "paymentLocationList":
        if (event.target.value != "") {
          let paymentLocation = this.orgPaymentLocationList;
          this.localLocationList = paymentLocation.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.localLocationList = this.orgPaymentLocationList;
        }
        break;
      case "CampaignList":
        if (event.target.value != "") {
          let paymentCampaign = this.orgPaymentCampaignList;
          let searchText = event.target.value;
          this.localCampaignList = paymentCampaign.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(searchText.toString().toLowerCase()) > -1
          );
        } else {
          this.localCampaignList = this.orgPaymentCampaignList;
        }
        break;
      case "PaymentStatusList":
        if (event.target.value != "") {
          let paymentStatus = this.orgPaymentStatusList;
          this.paymentStatusList = paymentStatus.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.paymentStatusList = this.orgPaymentStatusList;
        }
        break;
      case "orderDeviceStatus":
        if (event.target.value != "") {
          let deviceStatus = this.orgDeviceStatusList;
          this.orderDeviceStatusList = deviceStatus.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.orderDeviceStatusList = this.orgDeviceStatusList;
        }
        break;
      case "paymentApprovalsList":
        if (event.target.value != "") {
          let paymentApproval = this.orgPaymentApprovalList;
          this.paymentApprovalsList = paymentApproval.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.paymentApprovalsList = this.orgPaymentApprovalList;
        }
        break;
      case "currencyList":
        if (event.target.value != "") {
          let paymentCurrency = this.orgPaymentCurrencyList;
          this.currencyList = paymentCurrency.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.currencyList = this.orgPaymentCurrencyList;
        }
        break;
      case "cityList":
        if (event.target.value != "") {
          let cityData = this.orgCityList;
          this.cityList = cityData.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.cityList = this.orgCityList;
        }
        break;
      case "zipList":
        if (event.target.value != "") {
          let zipData = this.orgZipList;
          this.zipList = zipData.filter(
            (obj) =>
              obj.itemName &&
              obj.itemName
                .toString()
                .toLowerCase()
                .indexOf(event.target.value.toString().toLowerCase()) > -1
          );
        } else {
          this.zipList = this.orgZipList;
        }
        break;
    }
  }
  stickyHeader() {
    $("table").each(function () {
      if ($(this).find("thead").length > 0 && $(this).find("th").length > 0) {
        // Clone <thead>
        var $w = $(window),
          $t = $(this),
          $thead = $t.find("thead").clone(),
          $col = $t.find("thead, tbody").clone();

        // Add class, remove margins, reset width and wrap table
        $t.addClass("sticky-enabled")
          .css({
            margin: 0,
            width: "100%",
          })
          .wrap('<div class="sticky-wrap" />');

        if ($t.hasClass("overflow-y"))
          $t.removeClass("overflow-y").parent().addClass("overflow-y");

        // Create new sticky table head (basic)
        $t.after('<table class="sticky-thead" />');

        // If <tbody> contains <th>, then we create sticky column and intersect (advanced)
        if ($t.find("tbody th").length > 0) {
          $t.after(
            '<table class="sticky-col" /><table class="sticky-intersect" />'
          );
        }

        // Create shorthand for things
        var $stickyHead = $(this).siblings(".sticky-thead"),
          $stickyCol = $(this).siblings(".sticky-col"),
          $stickyInsct = $(this).siblings(".sticky-intersect"),
          $stickyWrap = $(this).parent(".sticky-wrap");
        $stickyHead.append($thead);

        $stickyCol
          .append($col)
          .find("thead th:gt(0)")
          .remove()
          .end()
          .find("tbody td")
          .remove();

        $stickyInsct.html(
          "<thead><tr><th>" +
            $t.find("thead th:first-child").html() +
            "</th></tr></thead>"
        );

        // Set widths
        var setWidths = function () {
            $t.find("thead th")
              .each(function (i) {
                $stickyHead.find("th").eq(i).width($(this).width());
              })
              .end()
              .find("tr")
              .each(function (i) {
                $stickyCol.find("tr").eq(i).height($(this).height());
              });

            // Set width of sticky table head
            $stickyHead.width($t.width());

            // Set width of sticky table col
            $stickyCol
              .find("th")
              .add($stickyInsct.find("th"))
              .width($t.find("thead th").width());
          },
          repositionStickyHead = function () {
            // Return value of calculated allowance
            var allowance = calcAllowance();

            // Check if wrapper parent is overflowing along the y-axis
            if ($t.height() > $stickyWrap.height()) {
              // If it is overflowing (advanced layout)
              // Position sticky header based on wrapper scrollTop()
              if ($stickyWrap.scrollTop() > 0) {
                // When top of wrapping parent is out of view
                $stickyHead.add($stickyInsct).css({
                  opacity: 1,
                  top: $stickyWrap.scrollTop(),
                });
              } else {
                // When top of wrapping parent is in view
                $stickyHead.add($stickyInsct).css({
                  opacity: 0,
                  top: 0,
                });
              }
            } else {
              // If it is not overflowing (basic layout)
              // Position sticky header based on viewport scrollTop
              if (
                $w.scrollTop() > $t.offset().top &&
                $w.scrollTop() < $t.offset().top + $t.outerHeight() - allowance
              ) {
                // When top of viewport is in the table itself
                $stickyHead.add($stickyInsct).css({
                  opacity: 1,
                  top: $w.scrollTop() - $t.offset().top,
                });
              } else {
                // When top of viewport is above or below table
                $stickyHead.add($stickyInsct).css({
                  opacity: 0,
                  top: 0,
                });
              }
            }
          },
          repositionStickyCol = function () {
            if ($stickyWrap.scrollLeft() > 0) {
              // When left of wrapping parent is out of view
              $stickyCol.add($stickyInsct).css({
                opacity: 1,
                left: $stickyWrap.scrollLeft(),
              });
            } else {
              // When left of wrapping parent is in view
              $stickyCol.css({ opacity: 0 }).add($stickyInsct).css({ left: 0 });
            }
          },
          calcAllowance = function () {
            var a = 0;
            // Calculate allowance
            $t.find("tbody tr:lt(3)").each(function () {
              a += $(this).height();
            });

            // Set fail safe limit (last three row might be too tall)
            // Set arbitrary limit at 0.25 of viewport height, or you can use an arbitrary pixel value
            if (a > $w.height() * 0.25) {
              a = $w.height() * 0.25;
            }

            // Add the height of sticky header
            a += $stickyHead.height();
            return a;
          };

        setWidths();

        $t.parent(".sticky-wrap").scroll(function () {
          repositionStickyHead();
          repositionStickyCol();
        });

        $w.load(setWidths)
          .resize(function () {
            setWidths();
            repositionStickyHead();
            repositionStickyCol();
          })
          .scroll(repositionStickyHead);
      }
    });
  }

  hasChipObj(sumOfArray: Array<chipType>, checkWith: string, amount: number) {
    return sumOfArray.map((o) => {
      if (o.paymentType == checkWith || o.paymentType == "ALL") {
        return {
          ...o,
          paymentCount: o.paymentCount + 1,
          totalAmount: o.totalAmount + amount,
        };
      }

      return o;
    });
  }

  addNewChipObj(
    sumOfArray: Array<chipType>,
    checkWith: string,
    amount: number,
    paymentTypeId?: number
  ) {
    sumOfArray.push({
      paymentCount: 1,
      paymentType: checkWith,
      paymentTypeChipCSSClass: "info-box bg-gradient-info",
      paymentTypeId: paymentTypeId ? paymentTypeId : sumOfArray.length + 1,
      totalAmount: amount,
    });
    return sumOfArray.map((o) => {
      if (o.paymentType == "ALL") {
        return {
          ...o,
          paymentCount: o.paymentCount + 1,
          totalAmount: o.totalAmount + amount,
        };
      }
      return o;
    });
  }

  getSumByWeekPayments(
    list: Array<PaymentGridObj>,
    dateKey: string,
    amountKey: string
  ) {
    return _.reduce(
      list,
      (sumOfArray: Array<chipType>, element: PaymentGridObj) => {
        const dateValue = element[dateKey];
        const amountValue = element[amountKey];
        if (dateValue) {
          const week = moment(dateValue).format("YYYY-WW");
          let haveChip = sumOfArray.find((o) => o.paymentType == week);
          if (haveChip) {
            sumOfArray = this.hasChipObj(sumOfArray, week, amountValue);
          } else {
            sumOfArray = this.addNewChipObj(sumOfArray, week, amountValue);
          }
        }
        return sumOfArray;
      },
      [
        {
          paymentCount: 0,
          paymentType: "ALL",
          paymentTypeChipCSSClass: "info-box bg-gradient-info",
          paymentTypeId: -2,
          totalAmount: 0,
        },
      ]
    );
  }

  getSumByMonthPayments(
    list: Array<PaymentGridObj>,
    dateKey: string,
    amountKey: string
  ) {
    return _.reduce(
      list,
      (sumOfArray: Array<chipType>, element: PaymentGridObj) => {
        const dateValue = element[dateKey];
        const amountValue = element[amountKey];
        if (dateValue) {
          const month = moment(dateValue).format("MMMM");
          const monthId = moment(dateValue).format("M");
          let haveChip = sumOfArray.find((o) => o.paymentType == month);
          if (haveChip) {
            sumOfArray = this.hasChipObj(sumOfArray, month, amountValue);
          } else {
            sumOfArray = this.addNewChipObj(
              sumOfArray,
              month,
              amountValue,
              +monthId
            );
          }
        }
        return sumOfArray;
      },
      [
        {
          paymentCount: 0,
          paymentType: "ALL",
          paymentTypeChipCSSClass: "info-box bg-gradient-info",
          paymentTypeId: -2,
          totalAmount: 0,
        },
      ]
    );
  }

  getSumByYearPayments(
    list: Array<PaymentGridObj>,
    dateKey: string,
    amountKey: string
  ) {
    return _.reduce(
      list,
      (sumOfArray: Array<chipType>, element: PaymentGridObj) => {
        const dateValue = element[dateKey];
        const amountValue = element[amountKey];
        if (dateValue) {
          const year = moment(dateValue).format("YYYY");
          let haveChip = sumOfArray.find((o) => o.paymentType == year);
          if (haveChip) {
            sumOfArray = sumOfArray = this.hasChipObj(
              sumOfArray,
              year,
              amountValue
            );
          } else {
            sumOfArray = this.addNewChipObj(sumOfArray, year, amountValue);
          }
        }

        return sumOfArray;
      },
      [
        {
          paymentCount: 0,
          paymentType: "ALL",
          paymentTypeChipCSSClass: "info-box bg-gradient-info",
          paymentTypeId: -2,
          totalAmount: 0,
        },
      ]
    );
  }

  getLabelArray(labels, list, countryCodeIds) {
    countryCodeIds = countryCodeIds ? countryCodeIds.replace(/\s+/g, "") : 1; //as countryCodeID should be default 1, if there is no value

    let rowColumn = [];
    if (labels) {
      if (labels.indexOf(",") > -1) {
        const phoneLabelArray = labels.split(", ");
        rowColumn = phoneLabelArray.map((v, index) => ({
          label: v,
          value: list[index],
          countryCodeIds:
            countryCodeIds.length > 1
              ? countryCodeIds.split(",")[index]
              : countryCodeIds,
        }));
      } else {
        rowColumn = [
          {
            label: labels,
            value: list,
            countryCodeIds: countryCodeIds,
          },
        ];
      }
    }
    return rowColumn;
  }

  getNewLabelArray(labels, list, countryCodeIds) {
    let rowColumn = [];
    if (labels) {
      if (labels.length > 0) {
        const phoneLabelArray = labels;
        rowColumn = phoneLabelArray.map((v, index) => ({
          label: v,
          value: list[index],
          countryCodeIds:
            countryCodeIds.length >= 1 && countryCodeIds[index] != null
              ? countryCodeIds[index]
              : this.getDefaultSelectedCountryCode(),
        }));
      } else {
        rowColumn = [
          {
            label: labels,
            value: list,
            countryCodeIds: countryCodeIds,
          },
        ];
      }
    }
    return rowColumn;
  }

  getLabelCountryArray(labels, list, countryCodeID) {
    let rowColumn = [];
    if (labels && countryCodeID) {
      if (labels.indexOf(",") > -1) {
        const phoneLabelArray = labels.split(", ");
        rowColumn = phoneLabelArray.map((v, index) => ({
          label: v,
          value: list[index].trim(),
          countryCodeID: countryCodeID[index],
        }));
      } else {
        rowColumn = [
          {
            label: labels,
            value: list,
            countryCodeID: countryCodeID,
          },
        ];
      }
    }
    return rowColumn;
  }

  getTagBackgroundColor(value) {
    if (!value) {
      return {
        "bg-danger": true,
      };
    }
    return {
      "bg-danger": value === "red",
      "bg-orange": value === "orange",
      "bg-purple": value === "purple",
      "bg-blue": value === "blue",
      "bg-green": value === "green",
    };
  }

  getTagTextColor(value) {
    if (!value) {
      return {
        "text-danger": true,
      };
    }
    return {
      "text-danger": value === "red",
      "text-orange": value === "orange",
      "text-purple": value === "purple",
      "text-blue": value === "blue",
      "text-green": value === "green",
    };
  }

  getPledgeAmount(selectedAmount) {
    this.selectedAmount = selectedAmount;
  }

  PayoffPledgeCheckBoxChange(event) {
    if (event.target.checked) {
      this.isPayoffPledgeCheckBoxChecked = true;
    } else {
      this.isPayoffPledgeCheckBoxChecked = false;
    }
  }

  getFileOutTaxExemptForm() {
    return (this.fileOutTaxExemptForm = localStorage.getItem(
      "fileOutTaxExemptForm"
    ));
  }
  incomingfile(event) {
    // if(event.target.files[0]!=undefined){
    // this.fileOutTaxExemptForm = event.target.files[0];
    // }

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      //this.fileOutTaxExemptForm=reader.result;
      localStorage.setItem("fileOutTaxExemptForm_Name", file.name.toString());
      localStorage.setItem("fileOutTaxExemptForm", reader.result.toString());
    };
  }
  childPArray: any = [];
  getChaldPArray() {
    return this.childPArray;
  }
  sendPledgeTransactionData(isreload: any) {
    this.PledgeTransactionObservable.next(isreload);
  }
  getPledgeTransactionData(): Observable<any> {
    return this.PledgeTransactionObservable;
  }

  triggerTotalPanelUpdate(value: boolean) {
    this.updateTotalPanelSource.next(value);
  }
  generateUniqueTransactionId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `TXN-${timestamp}-${random}`;
  }

  openCalendarPopup(
    classId: any,
    classHid: any,
    selectedDateRange: any,
    isOneDate: boolean,
    Postion?: string,
    customClass?: string,
    isEngCal: boolean = true
  ) {
    let upperCalendarClass = customClass ? customClass : "";
    let tPostion = Postion
      ? $(`#${Postion}`).offset()
      : $("#dynamicsCalender").offset();

    if (tPostion) {
      requestAnimationFrame(() => {
        $(".advance_search .modal-dialog").css("left", +tPostion.left);
        $(".advance_search .modal-dialog").css("top", +tPostion.top + 40);
      });
    }
  }

  commenSendUpgradeEmail(disaplayName: string) {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    const macAddress = this.localstoragedataService.getLoginUserGuid();
    const featureDisplayName = disaplayName;
    this.planService
      .sendUpgradeEmail({ eventGuid, macAddress, featureDisplayName })
      .subscribe(
        (res: any) => {
          if (res) {
            this.openUpgradeModal();
          }
        },
        (err) => {
          console.log("error", err);
        }
      );
  }

  openUpgradeModal() {
    this.modalOptions = {
      centered: true,
      backdrop: "static",
      keyboard: false,
      windowClass:
        "modal-archive-batch modal-batch-status modal-upgrade-status",
      size: "sm",
      scrollable: true,
    };
    const modalRef = this.openPopup(
      UpgradeSuccessPopupComponent,
      this.modalOptions
    );
  }

  getFeatureSettingValues() {
    if (this.setting == null) {
      this.totalRecentDateFilterSetting = [];
      return;
    }

    this.totalRecentDateFilterSetting = this.setting.filter(
      (item) => item.fetaureName === this.featureName
    );
    if (this.totalRecentDateFilterSetting.length > 0) {
      this.isfeatureSetting =
        this.totalRecentDateFilterSetting[0].featureSettingValue;
      this.featureDisplayName =
        this.totalRecentDateFilterSetting[0].featureDisplayName;
    } else {
      this.isfeatureSetting = true;
    }
  }
  getEngHebJsonData() {
    if (!(this.englishJsontable && this.hebrewJsontable)) {
      this.translate.getTranslation("heb").subscribe((translations: any) => {
        this.hebrewJsontable = translations;
      });

      this.translate.getTranslation("en").subscribe((translations: any) => {
        this.englishJsontable = translations;
      });
    }
  }

  getColName(colName: any) {
    if (this.isHebrew) {
      if (this.hebrewJsontable[colName]) {
        return this.hebrewJsontable[colName];
      }
      return colName;
    }

    if (this.englishJsontable[colName]) {
      return this.englishJsontable[colName];
    }

    return colName.toString();
  }

  idDownloadExcelEventGuid() {
    const eventGuid = this.localstoragedataService
      .getLoginUserEventGuId()
      .toLowerCase();
    return this.downloadExcelGuid.includes(eventGuid) ? true : false;
  }

  getDefaultSelectedCountryCode() {
    var countryCode = this.localstoragedataService.getUserEventCurrency();
    if (countryCode == "USD") {
      return 1;
    }
    if (countryCode == "CAD") {
      return 2;
    }
    if (countryCode == "EUR") {
      return 3;
    }
    if (countryCode == "GBP") {
      return 4;
    }
    if (countryCode == "ILS") {
      return 5;
    }
  }

  getDefaultDailingCode() {
    var countryCode = this.localstoragedataService.getUserEventCurrency();
    if (countryCode == "USD") {
      return "+1";
    }
    if (countryCode == "CAD") {
      return "+1";
    }
    if (countryCode == "EUR") {
      return "+32";
    }
    if (countryCode == "GBP") {
      return "+44";
    }
    if (countryCode == "ILS") {
      return "+972";
    }
  }

  getDefaultSelectedFlag() {
    var countryCode = this.localstoragedataService.getUserEventCurrency();
    if (countryCode == "USD") {
      return "flag flag-usa";
    }
    if (countryCode == "CAD") {
      return "flag flag-canada";
    }
    if (countryCode == "EUR") {
      return "flag flag-bleguim";
    }
    if (countryCode == "GBP") {
      return "flag flag-uk";
    }
    if (countryCode == "ILS") {
      return "flag flag-israel";
    }
  }

  getTimeZoneFromLoginCurrency() {
    var eventCurrency = this.localstoragedataService.getUserEventCurrency();
    if (eventCurrency == "USD") {
      return "America/New_York";
    }
    if (eventCurrency == "CAD") {
      return "America/Toronto";
    }
    if (eventCurrency == "EUR") {
      return "Europe/Paris";
    }
    if (eventCurrency == "GBP") {
      return "Europe/London";
    }
    if (eventCurrency == "ILS") {
      return "Asia/Jerusalem";
    }
  }

  convertUTCToTimezone(utcDt: moment.MomentInput, timezone: string) {
    return moment_tz.utc(utcDt).tz(timezone);
  }
  getSettings() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.settingsService.getSettings(eventGuId).subscribe((res) => {
      const Pledgesetting = res.find(
        (item) => item.settingName === "DisableAutomaticPledgeReceiptEmail"
      );
      const Paymentsetting = res.find(
        (item) => item.settingName === "DisableAutomaticPaymentReceiptEmail"
      );

      if (Pledgesetting) {
        this.isDisableAutomaticPledge =
          Pledgesetting.settingsValue.toLowerCase() == "true" ||
          Pledgesetting.settingsValue.toLowerCase() == "True"
            ? false
            : true;
        this.isDisableAutomaticPledgeReceiptEmail =
          Pledgesetting.settingsValue.toLowerCase() == "false"
            ? "false"
            : "true";
      }
      if (Paymentsetting) {
        this.getAllPaymentAPIGateway(Paymentsetting);
      }
    });
  }

  getAllPaymentAPIGateway(Paymentsetting) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.PaymentApiGatewayService.getAllPaymentAPIGateway(eventGuId).subscribe(
      (res: any) => {
        res.forEach((item) => {
          if (item.countryCodeId !== 1 && !!item.countryCodeId) {
            this.hasNonUSD = true;
          }
          this.isDisableAutomaticPayment =
            Paymentsetting.settingsValue.toLowerCase() == "false"
              ? true
              : false;
          if (this.hasNonUSD == true) {
            this.isDisableAutomaticPayment = false;
          }
        });
      }
    );
  }

  getCountryName(countryCodeId: any) {
    if (countryCodeId == 1) {
      return "USA";
    }
    if (countryCodeId == 2) {
      return "CA";
    }
    if (countryCodeId == 3) {
      return "BE";
    }
    if (countryCodeId == 4) {
      return "UK";
    }
    if (countryCodeId == 5) {
      return "IL";
    }
  }

  getUiPageSetting(objLayout) {
    if (objLayout) {
      this.uiPageSettingService.Get(objLayout).subscribe(
        (res: any) => {
          if (res && res.setting && res.setting !== "null") {
            const settingObj = JSON.parse(res.setting);
            this.statementType = [settingObj];
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  getStatementTemplates() {
    this.messengerService.getStatementTemplates().subscribe(
      (res: any) => {
        if (res) {
          this.statementTypeList = [];
          var result = res;
          const r = result.forEach((val) => {
            var obj = {
              id: val.name,
              itemName: val.displayName,
            };
            this.statementTypeList.push(obj);
            if (val.isDefault == true) {
              this.statementType = [obj];
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  AddNewDonor(donorNumber?: any): Promise<any> {
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup",
    };

    const modalRef = this.openPopup(DonorSaveComponent, this.modalOptions);
    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.donorNumberVal = donorNumber;

    return modalRef.result.then((result) => {
      if (result && result.accountId) {
        const found = this.localDonorList.find((o) => {
          return o.accountId == result.accountId;
        });
        if (!found) {
          this.localDonorList = [...this.localDonorList, result];
        }
        return result;
      }

      return result;
    });
  }

  closeAllPopups() {
    this.closeAllPopupsSubject.next();
  }

  removeNoOptions() {
    // Remove "~No Campaign~" option
    if (this.localCampaignList) {
      this.localCampaignList = this.localCampaignList.filter(
        (item) => item.id !== -1
      );
    }

    // Remove "~No Reason~" option
    if (this.localReasonList) {
      this.localReasonList = this.localReasonList.filter(
        (item) => item.id !== -1
      );
    }

    // Remove "~No Collector~" option
    if (this.localCollectorList) {
      this.localCollectorList = this.localCollectorList.filter(
        (item) => item.id !== -1
      );
    }

    // Remove "~No Location~" option
    if (this.localLocationList) {
      this.localLocationList = this.localLocationList.filter(
        (item) => item.id !== -1
      );
    }
  }

  getTranslate(val: string) {
    return this.translatePipe.transform(val);
  }

  // join and uppercase text
  transformText(val) {
    return this.transformPipe.transform(val);
  }

  onUpgrade() {
    this.commenSendUpgradeEmail(this.featureDisplayName);
  }

  getFeatureSetting(value: string) {
    this.featureName = value;
    this.getFeatureSettingValues();
  }
}
