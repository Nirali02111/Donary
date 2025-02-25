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
import {
  NgbDateParserFormatter,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CardService } from "src/app/services/card.service";
import { LocationService } from "src/app/services/location.sevice";
import { MessengerService } from "src/app/services/messenger.service";
import { PledgeService } from "src/app/services/pledge.service";
import { ReasonService } from "src/app/services/reason.service";
import { CampaignService } from "./../../../services/campaign.service";
import { CampaignCardDataResponse } from "./../../../models/campaign-model";

import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as _ from "lodash";
import { CommonMethodService } from "../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";
import { NotificationService } from "../../../commons/notification.service";
import { PledgeTransactionService } from "../../../services/pledge-transaction.service";
import { CollectorCardPopupComponent } from "../../cards/collector-card-popup/collector-card-popup.component";
import { CampaignCardPopupComponent } from "./../../cards/campaign-card-popup/campaign-card-popup.component";
import { DeviceCardPopupComponent } from "../../cards/device-card-popup/device-card-popup.component";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { EditPledgePopupComponent } from "../../cards/pledge-card-popup/edit-pledge-popup/edit-pledge-popup.component";
import { PledgeCardPopupComponent } from "../../cards/pledge-card-popup/pledge-card-popup.component";
import { ReasonCardPopupComponent } from "../../cards/reason-card-popup/reason-card-popup.component";
import { SchedulePledgecardPopupComponent } from "../../cards/schedule-card-popup/schedule-pledgecard-popup/schedule-pledgecard-popup.component";
import { EmailMissingPopupComponent } from "../email-missing-popup/email-missing-popup.component";
import { PledgeTransGridFilterPopupComponent } from "../pledge-transaction/pledge-trans-grid-filter-popup/pledge-trans-grid-filter-popup.component";
import { PrintReceiptPopupComponent } from "../receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { SendEmailreceiptPopupComponent } from "../receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { SendTextreceiptPopupComponent } from "../receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { SendReceiptPopupComponent } from "../send-receipt-popup/send-receipt-popup.component";
import { SupportPopupComponent } from "../support-popup/support-popup.component";
import { TransactionAdvancedFilterPopupComponent } from "../transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { CollectorService } from "./../../../services/collector.service";
import { LocationCardPopupComponent } from "./../../cards/location-card-popup/location-card-popup.component";
import { AddUpdatePledgeComponent } from "./add-update-pledge/add-update-pledge.component";
import { ImportPledgeComponent } from "./import-pledge/import-pledge.component";
import { Router } from "@angular/router";
import { BulkSMSReceiptComponent } from "../receipt-actions/bulk-smsreceipt/bulk-smsreceipt.component";
import { BulkEmailReceiptComponent } from "../receipt-actions/bulk-email-receipt/bulk-email-receipt.component";
import { BulkMailReceiptComponent } from "../receipt-actions/bulk-mail-receipt/bulk-mail-receipt.component";
import { forkJoin } from "rxjs";
import { AddressValidateService } from "src/app/services/address-validate.service";
import { AdvancereceiptActionPopupComponent } from "../advancereceipt-action-popup/advancereceipt-action-popup.component";
import { EditTransactionInfoComponent } from "../edit-transaction-info/edit-transaction-info.component";

import { AdvanceSMSActionService } from "src/app/services/helpers/advance-smsaction.service";
import { DeviceService } from "src/app/services/device.service";
import { Subscription } from "rxjs";
import { CustomeReportComponent } from "../custome-report/custome-report.component";
import { PrintSingleReceiptPopupComponent } from "../receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { LinkScriptService } from "src/app/services/linkscript.service";
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";

import { UIPageSettingService } from "src/app/services/uipagesetting.service";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
declare const easepick: any;
declare const JewishDate: any;

declare var $: any;

import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { DonorService } from "src/app/services/donor.service";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-pledge-transaction",
  templateUrl: "./pledge-transaction.component.html",
  styleUrls: ["./pledge-transaction.component.scss"],
  providers: [DonaryDateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PledgeTransactionComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;

  moment = moment;
  pageClicked: boolean = false;
  private calendarSubscription: Subscription;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  isdisableVoidPledge: boolean = false;
  dateformat(date: Date) {
    //console.log(date);
    return moment(date).format("ddd,DD/MM/YYYY");
  }

  phoneLbls = [];
  phoneNumbers = [];
  countryCodeIds = [];

  selectedDateRange: any = {
    startDate: null,
    endDate: null,
  };

  EngHebCalPlaceholder: string = "All Time";
  presetClickId: string;
  id: string = "id_Clear";
  hid: string = "id_Clear";
  popTitle: any;
  PageName: any = "PledgeTransPage";
  isOneDate: any = false;
  selectedWeekSearchFilter: string;
  selectedDueDate: any;
  modalOptions: NgbModalOptions;
  objAdvancedSearch: any;
  isloading: boolean;
  cardType: any = [{ id: 2, itemName: "Reason" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  gridData: Array<any>;
  gridFilterData: Array<any>;
  paymentTypeChipData: Array<any>;
  paymentTypeChipClassName: string = "info-box bg-gradient-info";
  isSelectPopupShow: boolean = false;
  isBulkCheckbox: boolean = false;
  displayThisPageArray: any = [];
  fileName: string = "";
  colFields: any = [
    {
      colName: "Pledge #",
      isVisible: true,
      colId: "PledgeNoId",
      disabled: true,
    },
    {
      colName: "Pledge Date",
      isVisible: true,
      colId: "PledgedateId",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      isVisible: true,
      colId: "PledgefullnamejewishId",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      isVisible: false,
      colId: "PledgecreateddateId",
      disabled: false,
    },
    {
      colName: "AMOUNT",
      isVisible: true,
      colId: "PledgeamountId",
      disabled: false,
    },
    {
      colName: "HEBREWDATE",
      isVisible: false,
      colId: "PledgeJewishDateId",
      disabled: false,
    }, //added
    {
      colName: "PAIDAMOUNT",
      isVisible: true,
      colId: "PledgepaidamountId",
      disabled: false,
    },
    {
      colName: "BALANCE",
      isVisible: true,
      colId: "PledgebalanceId",
      disabled: false,
    },
    {
      colName: "STATUS",
      isVisible: true,
      colId: "PledgstatusId",
      disabled: false,
    },
    {
      colName: "SCHEDULE#",
      isVisible: true,
      colId: "PledgscheduleId",
      disabled: false,
    },
    {
      colName: "SCHEDULEINFO",
      isVisible: false,
      colId: "PledgscheduleinfoId",
      disabled: false,
    },
    {
      colName: "NOTE",
      isVisible: false,
      colId: "PledgenoteId",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      isVisible: true,
      colId: "PledgecampaignId",
      disabled: false,
    },
    {
      colName: "REASON",
      isVisible: false,
      colId: "PledgereasonId",
      disabled: false,
    },
    {
      colName: "REASON#",
      isVisible: false,
      colId: "PledgereasonNumberId",
      disabled: false,
    },
    {
      colName: "LOCATION",
      isVisible: true,
      colId: "PledgelocationId",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      isVisible: true,
      colId: "PledgecollectorId",
      disabled: false,
    },
    {
      colName: "SOURCE",
      isVisible: true,
      colId: "PledgedeviceId",
      disabled: false,
    },
    {
      colName: "Account #",
      isVisible: false,
      colId: "PledgeaccountNum",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      isVisible: false,
      colId: "PledgefullnameId",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      isVisible: false,
      colId: "PledgeaddressId",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      isVisible: false,
      colId: "PledgecitystateId",
      disabled: false,
    },
    {
      colName: "Phone Number",
      isVisible: false,
      colId: "PledgephonenumberId",
      disabled: false,
    },
    {
      colName: "EMAIL",
      isVisible: false,
      colId: "PledgeemailId",
      disabled: false,
    },
    {
      colName: "Group",
      isVisible: false,
      colId: "PledgegroupId",
      disabled: false,
    },
    {
      colName: "Class",
      isVisible: false,
      colId: "PledgeclassId",
      disabled: false,
    },
    {
      colName: "FATHER",
      isVisible: false,
      colId: "PledgefatherId",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      isVisible: false,
      colId: "PledgefatherinlawId",
      disabled: false,
    },
    {
      colName: "EXTERNALNOTE",
      isVisible: false,
      colId: "externalNote",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      isVisible: false,
      colId: "PledgeenglishtitleId",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      isVisible: false,
      colId: "PledgefirstNameId",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      isVisible: false,
      colId: "PledgelastNameId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      isVisible: false,
      colId: "PledgetitleJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      isVisible: false,
      colId: "PledgefirstNameJewishId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      isVisible: false,
      colId: "PledgeyiddishlastnameId",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      isVisible: false,
      colId: "PledgesuffixJewishId",
      disabled: false,
    },
  ];

  isPledgenumberColVisible: boolean = true;
  isPledgeCampaignColVisible: boolean = true;
  isPledgeNoteColVisible: boolean = false;
  isPledgeDateColVisible: boolean = true;
  isPledgeAmountColVisible: boolean = true;
  isPledgePaidAmountColVisible: boolean = true;
  isPledgeBalanceColVisible: boolean = true;
  isPledgeStatusColVisible: boolean = true;
  isPledgeFullNameColVisible: boolean = false;
  isPledgeFullNameJewishColVisible: boolean = true;
  isPledgeReasonColVisible: boolean = false;
  isPledgeReasonNumberColVisible: boolean = false;
  isPledgeLocationColVisible: boolean = true;
  isPledgeRecurringColVisible: boolean = false;
  isPledgeRecurrenceColVisible: boolean = false;
  isPledgeIsVoidColVisible: boolean = false;
  isPledgeDeviceColVisible: boolean = true;
  isPledgeCollectorColVisible: boolean = true;

  isPledgeCreatedDateColVisible: boolean = false;
  isPledgeScheduleNoColVisible: boolean = true;
  isPledgeScheduleInfoColVisible: boolean = false;
  isPledgeAccountNoColVisible: boolean = false;
  isPledgeAddressColVisible: boolean = false;
  isPledgeCityStateZipColVisible: boolean = false;
  isPledgeGroupColVisible: boolean = false;
  isPledgeClassColVisible: boolean = false;
  isPledgeFatherColVisible: boolean = false;
  isPledgePhoneColVisible: boolean = false;
  isPledgeEmailColVisible: boolean = false;
  isPledgeFatherInLawColVisible: boolean = false;
  isPaymentJewishDateColVisible: boolean = false; ///added
  isExternalNoteColVisible: boolean = false; ///added
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  filtercount: number = 1;
  cardFilter = [];
  sortFilter = [];
  isinitialize: number = 0;
  ishebinitialize: number = 0;
  sumByCampaignPayments = [];
  sumByCollectorPayments = [];
  sumByReasonPayments = [];
  sumByLocationPayments = [];
  sumBySourcePayments = [];
  sumByWeekPayments = [];
  sumByMonthPayments = [];
  sumByYearPayments = [];
  recordSelectedArray = [];
  isSelected = false;
  isJewishCalendar: boolean = true;
  picker: any;
  isPledgeEnglishTitleColVisible: boolean = false;
  isPledgeFirstNameColVisible: boolean = false;
  isPledgeLastNameColVisible: boolean = false;
  isPledgeTitleJewishColVisible: boolean = false;
  isPledgeFirstNameJewishColVisible: boolean = false;
  isPledgeLastNameJewishColVisible: boolean = false;
  isPledgeSuffixJewishColVisible: boolean = false;
  isHebrew = true;
  uiPageSettingId = null;
  uiPageSetting: any;
  presetOption: string;
  isPledgeObservableCalled: boolean = false;
  pledgeTransSubscription!: Subscription;

  headerList: any = [
    {
      colName: "Pledge #",
      visibleCondition: this.isPledgenumberColVisible,
      sortName: "pledgeNum",
      disabled: true,
    },
    {
      colName: "Pledge Date",
      visibleCondition: this.isPledgeDateColVisible,
      sortName: "pledgeDate",
      disabled: true,
    },
    {
      colName: "Donor Jewish Name",
      visibleCondition: this.isPledgeFullNameJewishColVisible,
      sortName: "fullNameJewish",
      disabled: true,
    },
    {
      colName: "CREATEDDATETIME",
      visibleCondition: this.isPledgeCreatedDateColVisible,
      sortName: "createdDate",
      disabled: false,
    },
    {
      colName: "AMOUNT",
      visibleCondition: this.isPledgeAmountColVisible,
      sortName: "pledgeAmount",
      disabled: false,
    },
    {
      colName: "HEBREWDATE",
      visibleCondition: this.isPaymentJewishDateColVisible,
      sortName: "pledgeJewishDate",
      disabled: false,
    }, //added
    {
      colName: "PAIDAMOUNT",
      visibleCondition: this.isPledgePaidAmountColVisible,
      sortName: "pledgePaidAmount",
      disabled: false,
    },
    {
      colName: "BALANCE",
      visibleCondition: this.isPledgeBalanceColVisible,
      sortName: "balance",
      disabled: false,
    },
    {
      colName: "STATUS",
      visibleCondition: this.isPledgeStatusColVisible,
      sortName: "status",
      disabled: false,
    },
    {
      colName: "SCHEDULE#",
      isVisible: this.isPledgeScheduleNoColVisible,
      sortName: "scheduleNum",
      disabled: false,
    },
    {
      colName: "SCHEDULEINFO",
      isVisible: this.isPledgeScheduleInfoColVisible,
      sortName: "scheduleInfo",
      disabled: false,
    },
    {
      colName: "NOTE",
      visibleCondition: this.isPledgeNoteColVisible,
      sortName: "note",
      disabled: false,
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isPledgeCampaignColVisible,
      sortName: "campaignName",
      disabled: false,
    },
    {
      colName: "REASON",
      visibleCondition: this.isPledgeReasonColVisible,
      sortName: "reasonName",
      disabled: false,
    },
    {
      colName: "REASON#",
      visibleCondition: this.isPledgeReasonNumberColVisible,
      sortName: "reasonNumber",
      disabled: false,
    },
    {
      colName: "LOCATION",
      visibleCondition: this.isPledgeLocationColVisible,
      sortName: "locationName",
      disabled: false,
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isPledgeCollectorColVisible,
      sortName: "colectorName",
      disabled: false,
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isPledgeDeviceColVisible,
      sortName: "device",
      disabled: false,
    },
    {
      colName: "Account #",
      visibleCondition: this.isPledgeAccountNoColVisible,
      sortName: "accountNum",
      disabled: false,
    },
    {
      colName: "Donor English Name",
      visibleCondition: this.isPledgeFullNameColVisible,
      sortName: "fullName",
      disabled: false,
    },
    {
      colName: "ADDRESS",
      visibleCondition: this.isPledgeAddressColVisible,
      sortName: "address",
      disabled: false,
    },
    {
      colName: "Phone Number",
      visibleCondition: this.isPledgePhoneColVisible,
      sortName: "phones",
      disabled: false,
    },
    {
      colName: "EMAIL",
      visibleCondition: this.isPledgeEmailColVisible,
      sortName: "emails",
      disabled: false,
    },
    {
      colName: "CITYSTATEZIP",
      visibleCondition: this.isPledgeCityStateZipColVisible,
      sortName: "cityStateZip",
      disabled: false,
    },
    {
      colName: "Group",
      visibleCondition: this.isPledgeGroupColVisible,
      sortName: "group",
      disabled: false,
    },
    {
      colName: "Class",
      visibleCondition: this.isPledgeClassColVisible,
      sortName: "class",
      disabled: false,
    },
    {
      colName: "FATHER",
      visibleCondition: this.isPledgeFatherColVisible,
      sortName: "father",
      disabled: false,
    },
    {
      colName: "FATHERINLAW",
      visibleCondition: this.isPledgeFatherInLawColVisible,
      sortName: "fatherInLaw",
      disabled: false,
    },
    {
      colName: "EXTERNALNOTE",
      visibleCondition: this.isExternalNoteColVisible,
      sortName: "externalNote",
      disabled: false,
    },
    //added new
    {
      colName: "ENGLISHTITLE",
      visibleCondition: this.isPledgeEnglishTitleColVisible,
      sortName: "title",
      disabled: false,
    },
    {
      colName: "ENGLISHFIRSTNAME",
      visibleCondition: this.isPledgeFirstNameColVisible,
      sortName: "firstName",
      disabled: false,
    },
    {
      colName: "ENGLISHLASTNAME",
      visibleCondition: this.isPledgeLastNameColVisible,
      sortName: "lastName",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTTITLE",
      visibleCondition: this.isPledgeTitleJewishColVisible,
      sortName: "titleJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHFIRSTNAME",
      visibleCondition: this.isPledgeFirstNameJewishColVisible,
      sortName: "firstNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTNAME",
      visibleCondition: this.isPledgeLastNameJewishColVisible,
      sortName: "lastNameJewish",
      disabled: false,
    },
    {
      colName: "YIDDISHLASTTITLE",
      visibleCondition: this.isPledgeSuffixJewishColVisible,
      sortName: "suffixJewish",
      disabled: false,
    },
  ];

  isMobile: Observable<BreakpointState>;
  displayThisPageCount = 0;
  private analytics = inject(AnalyticsService);

  constructor(
    public pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private pledgeTransactionService: PledgeTransactionService,
    private collectorService: CollectorService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private cardService: CardService,
    private pledgeService: PledgeService,
    private locationService: LocationService,
    private addressValidateService: AddressValidateService,
    private localstoragedataService: LocalstoragedataService,
    private datePipe: DonaryDateFormatPipe,
    public router: Router,
    private linkscript: LinkScriptService,
    private deviceService: DeviceService,
    private messengerService: MessengerService,
    private advanceSMSActionService: AdvanceSMSActionService,
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public formatter: NgbDateParserFormatter,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private cdr: ChangeDetectorRef,
    public breakpointObserver: BreakpointObserver,
    public donorService: DonorService,
    private xlsxService: XLSXService
  ) {
    // this.isMobile = this.breakpointObserver.observe(['(max-width: 767px)']);

    this.dayTemplateData = this.dayTemplateData.bind(this);
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), "d", 10);
  }

  ngOnInit() {
    this.analytics.visitedPledges();
    this.colfieldsValue = this.pageSyncService.pledgeFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyPledge) {
      this.cardType = this.pageSyncService.sumbyPledge;
    }
    if (!this.pageSyncService.isPledgeTabClicked) {
      this.pageSyncService.isPledgeTabClicked = true;
    } else {
      this.pageClicked = true;
    }
    this.isMobile = this.breakpointObserver.observe(["(max-width: 767px)"]);
    this.cdr.detectChanges();
    this.pageSyncService.calculateTimeDifference("pledge");
    this.initMultiSelect();
    if (this.localstoragedataService.getLoginUserEventGuId() == "abc123") {
      this.linkscript.loadLink().then(() => {
        this.picker = new easepick.create({
          element: document.getElementById("datepicker"),
          css: [
            "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css",
            "assets/dist/css/datepicker.css",
          ],
          zIndex: 1000,
          locale: {
            cancel: "X",
            apply: "Apply",
          },
          firstDay: 0,
          autoApply: false,
          format: "MM/DD/YYYY",
          calendars: 2,
          grid: 2,
          plugins: ["RangePlugin", "PresetPlugin", "AmpPlugin"],
          RangePlugin: {
            tooltip: true,
          },
          AmpPlugin: {
            locale: {
              resetButton: "Clear Filters",
            },
            dropdown: {
              years: true,
            },
            resetButton: true,
          },
          PresetPlugin: {
            position: "left",
          },
          setup(picker) {
            var isHebrew = true;
            var btncount = 0;
            picker.on("view", (evt) => {
              const { view, date, target } = evt.detail;
              const d = date ? date.format("YYYY-MM-DD") : null;
              var monthDateTime = new Date(d);
              if (view === "CalendarHeader") {
                if (isHebrew) {
                  let jewishDate = JewishDate.getDate(d);
                  if (!jewishDate) {
                    return;
                  }
                  let getMonth = new Date(date.setMonth(date.getMonth() + 1));
                  let lastDayOfMonth = moment(
                    getMonth.setDate(getMonth.getDate() - 1)
                  ).format("YYYY-MM-DD");

                  let lastDayOfMonthJewish = JewishDate.getDate(lastDayOfMonth);

                  const monthName = target.querySelector(".month-name");
                  const span =
                    monthName.querySelector(".jd-month") ||
                    document.createElement("span");
                  span.className = "jd-month";

                  let monthHtml = jewishDate.Month;
                  if (jewishDate.Month != lastDayOfMonthJewish.Month)
                    monthHtml += " " + lastDayOfMonthJewish.Month + " - ";

                  monthHtml +=
                    '<span style="font-weight:600;" class="jewish_year">' +
                    lastDayOfMonthJewish.Year +
                    "</span>";
                  monthHtml +=
                    '<span style="font-weight:normal;">' +
                    moment(monthDateTime).format("MMM") +
                    "</span>";
                  span.innerHTML = monthHtml;

                  monthName.innerHTML = span.outerHTML;
                }
              } else if (view === "CalendarDayName") {
                if (isHebrew) {
                  let jewishWeekday = JewishDate.getWeekday(target.title);
                  target.innerHTML = jewishWeekday;
                }
              } else if (view === "CalendarDay") {
                if (isHebrew) {
                  let jewishDate = JewishDate.getDate(d);
                  if (!jewishDate) return;

                  const span =
                    target.querySelector(".jd-weekday") ||
                    document.createElement("span");
                  span.className = "jd-weekday";
                  span.innerHTML =
                    '<span style="font-weight:600; class="jewish_mnth"">' +
                    jewishDate.MDay +
                    "</span>";
                  target.append(span);
                }
              } else if (view === "Footer") {
                if (isHebrew) {
                  let count = 0;
                  count += 1;
                  let customStartDate = "";
                  let customHebStartDate = "";
                  let customEndDate = "";
                  let customHebEndDate = "";
                  let start = "";
                  let end = "";
                  let jStartDate;
                  let jEndDate;
                  if (evt.detail.start && evt.detail.end) {
                    start = evt.detail.start.format("YYYY-MM-DD");
                    end = evt.detail.end.format("YYYY-MM-DD");
                    jStartDate = JewishDate.getDate(start);
                    jEndDate = JewishDate.getDate(end);

                    customStartDate = start;
                    customHebStartDate = jStartDate.toFullDateString();
                    customEndDate = end;
                    customHebEndDate = jEndDate.toFullDateString();
                  }
                  const toggle =
                    target.querySelector(".footer") ||
                    document.createElement("label");
                  toggle.className = "switch";
                  toggle.innerHTML =
                    ' <input checked="true" type="checkbox"> <span class="slider round"><span class="item-1">Cal</span><span class="item-2">לוּחַ</span></span>';
                  if (count == 1) {
                    target.append(toggle);
                  }
                  const span =
                    target.querySelector(".footer") ||
                    document.createElement("div");
                  span.className = "footertext initial_textbox";

                  span.innerHTML =
                    '<div class="start-date-item"><label>Start Date</label><span class="date-eng">' +
                    start +
                    '</span><span class="date-hebrew">' +
                    customHebStartDate +
                    "</span></div>";
                  span.innerHTML +=
                    '<div class="end-date-item"><label>End Date</label><span class="date-eng">' +
                    end +
                    '</span><span class="date-hebrew">' +
                    customHebEndDate +
                    "</span></div>";

                  if (count == 1) {
                    target.append(span);
                  }
                } else {
                  var count = 0;
                  count += 1;
                  const toggle =
                    target.querySelector(".footer") ||
                    document.createElement("label");
                  toggle.className = "switch";
                  toggle.innerHTML =
                    ' <input  type="checkbox"> <span class="slider round"><span class="item-1">Cal</span><span class="item-2">לוּחַ</span></span>';

                  if (count == 1) {
                    target.append(toggle);
                  }
                }
              }
              if (view === "PresetPluginContainer") {
                if (isHebrew) {
                  let add_container =
                    target.querySelector(".preset-plugin-container") ||
                    document.createElement("span");
                  add_container.class = "heb_lbl";
                  add_container.innerHTML =
                    '<button class="preset-button unit" data-start="1665599400000" data-end="1665599400000">היום</button>' +
                    '<button class="preset-button unit" data-start="1665513000000" data-end="1665513000000">אתמול</button>' +
                    '<button class="preset-button unit" data-start="1665081000000" data-end="1665599400000">ז ימים האחרונים</button>' +
                    '<button class="preset-button unit" data-start="1663093800000" data-end="1665599400000">ל ימים האחרונים</button>' +
                    '<button class="preset-button unit" data-start="1664562600000" data-end="1667154600000">החודש</button>' +
                    '<button class="preset-button unit" data-start="1661970600000" data-end="1664476200000">בחודש שעבר</button>' +
                    '<button class="preset-button unit" data-start="1669833000000" data-end="1672425000000">חודש הבא</button>' +
                    '<button class="preset-button unit" data-start="1609439400000" data-end="1640889000000">שנה שעברה</button>' +
                    '<button class="preset-button unit" data-start="1640975400000" data-end="1672425000000">השנה</button>' +
                    '<button class="preset-button unit" data-start="1672511400000" data-end="1703961000000">שנה הבאה</button>';
                  target.append(add_container);
                } else {
                  let add_container =
                    target.querySelector(".preset-plugin-container") ||
                    document.createElement("span");
                  add_container.innerHTML =
                    '<button class="preset-button unit" data-start="1665599400000" data-end="1665599400000">Today</button>' +
                    '<button class="preset-button unit" data-start="1665513000000" data-end="1665513000000">Yesterday</button>' +
                    '<button class="preset-button unit" data-start="1665081000000" data-end="1665599400000">Last 7 days </button>' +
                    '<button class="preset-button unit" data-start="1663093800000" data-end="1665599400000">Last 30 days</button>' +
                    '<button class="preset-button unit" data-start="1664562600000" data-end="1667154600000">This Month</button>' +
                    '<button class="preset-button unit" data-start="1661970600000" data-end="1664476200000">Last Month</button>' +
                    '<button class="preset-button unit" data-start="1669833000000" data-end="1672425000000">Next Month</button>' +
                    '<button class="preset-button unit" data-start="1609439400000" data-end="1640889000000">Last Year</button>' +
                    '<button class="preset-button unit" data-start="1640975400000" data-end="1672425000000">This Year</button>' +
                    '<button class="preset-button unit" data-start="1672511400000" data-end="1703961000000">Next Year</button>';

                  target.append(add_container);
                }
              }
              if (view === "PresetPluginButton") {
                if (btncount <= 6) {
                  let container = target.querySelector(".preset-button unit");
                  target.remove(container);
                }
              }
            });
            picker.on("select", (e) => {
              let startDate = picker.getStartDate().format("YYYY-MM-DD");
              let endDate = picker.getEndDate().format("YYYY-MM-DD");

              let jStartDate = JewishDate.getDate(startDate);
              let jEndDate = JewishDate.getDate(endDate);

              let msg = "from jewish date: " + jStartDate.toFullDateString();
            });
            picker.on("preselect", (e: any) => {
              let customStartDate = "";
              let customHebStartDate = "";
              let customEndDate = "";
              let customHebEndDate = "";
              let count = 0;

              if (e.detail.start && e.detail.end) {
                let start = e.detail.start.format("YYYY-MM-DD");
                let end = e.detail.end.format("YYYY-MM-DD");
                let jStartDate = JewishDate.getDate(start);
                let jEndDate = JewishDate.getDate(end);

                customStartDate = start;
                customHebStartDate = jStartDate.toFullDateString();
                customEndDate = end;
                customHebEndDate = jEndDate.toFullDateString();
                picker.on("view", (e: any) => {
                  let { view, date, target } = e.detail;
                  if (view === "Footer") {
                    count += 1;
                    target.children[2].outerHTML = "";
                    const span =
                      target.querySelector(".footer") ||
                      document.createElement("div");
                    span.className = "footertext";
                    span.innerHTML =
                      '<div class="start-date-item"><label>Start Date</label><span class="date-eng">' +
                      start +
                      '</span><span class="date-hebrew">' +
                      customHebStartDate +
                      "</span></div>";
                    span.innerHTML +=
                      '<div class="end-date-item"><label>End Date</label><span class="date-eng">' +
                      end +
                      '</span><span class="date-hebrew">' +
                      customHebEndDate +
                      "</span></div>";

                    if (count == 1) {
                      target.append(span);
                    }
                  }
                });
              }
            });
            picker.on("change", (e) => {
              if (!e.target.checked) {
                isHebrew = false;
                picker.renderAll();
              } else {
                isHebrew = true;
                picker.renderAll();
              }
            });
          },
        });
      });
    }
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    this.pledgeTransSubscription = this.commonMethodService
      .getPledgeTransSync()
      .subscribe((res: any) => {
        if (res) {
          if (this.pageSyncService.pledgeTransList == undefined) {
            this.searchPledgeTransactionsData();
          } else {
            this.gridFilterData = this.pageSyncService.pledgeTransList;
            this.calculateAllSumByFields(this.gridFilterData);
            this.resGridDataModification(this.gridFilterData);
          }
        }
        if (this.pageSyncService.pledgeCalDate) {
          if (
            this.pageSyncService.pledgeCalDate.startDate == null &&
            this.pageSyncService.pledgeCalDate.endDate == null
          ) {
            this.selectedDateRange.startDate = null;
            this.selectedDateRange.endDate = null;
            this.EngHebCalPlaceholder = "All Time";
          } else {
            this.pageSyncService.pledgeCalDate.startDate = moment(
              this.pageSyncService.pledgeCalDate.startDate
            ).format("YYYY-MM-DD");
            this.pageSyncService.pledgeCalDate.endDate = moment(
              this.pageSyncService.pledgeCalDate.endDate
            ).format("YYYY-MM-DD");
            this.getSelectedDateRange(
              this.pageSyncService.pledgeCalDate.startDate,
              this.pageSyncService.pledgeCalDate.endDate
            );
          }
        }
      });

    this.commonMethodService.getPledgeTrans().subscribe((res: any) => {
      if (res) {
        this.searchPledgeTransactionsData();
      }
    });
    if (
      !this.pageSyncService.pledgeFlag ||
      (this.pageSyncService.isPledgeTabClicked &&
        this.pageSyncService.pledgeTransList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "transactions",
        screenName: "pledges",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isPledgenumberColVisible != undefined) {
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
            !this.pageSyncService.pledgeFlag ||
            (this.pageSyncService.isPledgeTabClicked &&
              this.pageSyncService.pledgeTransList == undefined)
          ) {
            this.objAdvancedSearch = this.pageSyncService.pledgeFilterData;
            this.searchPledgeTransactionsData();
          }
        } else {
          this.objAdvancedSearch = this.pageSyncService.pledgeFilterData;
          this.getRedirectData();
          this.searchPledgeTransactionsData();
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["pledgeList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["pledgeList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      if (
        this.pageSyncService.isPledgeTabClicked &&
        this.pageSyncService.pledgeTransList != undefined
      ) {
        this.getRedirectData();
        this.gridData = this.pageSyncService.pledgeTransList;
        this.gridFilterData = this.pageSyncService.pledgeTransList;
        this.calculateAllSumByFields(this.gridFilterData);
        this.resGridDataModification(this.gridFilterData);
      }
      if (this.pageSyncService.pledgeFilterData) {
        this.advancedSearchData(this.pageSyncService.pledgeFilterData, false);
      }
    }
    if (this.pageSyncService.pledgeCalDate) {
      if (
        this.pageSyncService.pledgeCalDate.startDate == null &&
        this.pageSyncService.pledgeCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      } else {
        this.pageSyncService.pledgeCalDate.startDate = moment(
          this.pageSyncService.pledgeCalDate.startDate
        ).format("YYYY-MM-DD");
        this.pageSyncService.pledgeCalDate.endDate = moment(
          this.pageSyncService.pledgeCalDate.endDate
        ).format("YYYY-MM-DD");
        this.getSelectedDateRange(
          this.pageSyncService.pledgeCalDate.startDate,
          this.pageSyncService.pledgeCalDate.endDate
        );
      }
    }
    if (this.pageSyncService.pledgeFilterData) {
      this.advancedSearchData(this.pageSyncService.pledgeFilterData, false);
    }
  }

  setUIPageSettings(uiPageSetting) {
    this.isPledgenumberColVisible = uiPageSetting.isPledgenumberColVisible;
    this.isPledgeDateColVisible = uiPageSetting.isPledgeDateColVisible;
    this.isPledgeFullNameJewishColVisible =
      uiPageSetting.isPledgeFullNameJewishColVisible;
    this.isPledgeCreatedDateColVisible =
      uiPageSetting.isPledgeCreatedDateColVisible;
    this.isPledgeAmountColVisible = uiPageSetting.isPledgeAmountColVisible;
    this.isPaymentJewishDateColVisible =
      uiPageSetting.isPaymentJewishDateColVisible;
    this.isPledgePaidAmountColVisible =
      uiPageSetting.isPledgePaidAmountColVisible;
    this.isPledgeBalanceColVisible = uiPageSetting.isPledgeBalanceColVisible;
    this.isPledgeStatusColVisible = uiPageSetting.isPledgeStatusColVisible;
    this.isPledgeScheduleNoColVisible =
      uiPageSetting.isPledgeScheduleNoColVisible;
    this.isPledgeScheduleInfoColVisible =
      uiPageSetting.isPledgeScheduleInfoColVisible;
    this.isPledgeNoteColVisible = uiPageSetting.isPledgeNoteColVisible;
    this.isPledgeCampaignColVisible = uiPageSetting.isPledgeCampaignColVisible;
    this.isPledgeReasonNumberColVisible =
      uiPageSetting.isPledgeReasonNumberColVisible;
    this.isPledgeReasonColVisible = uiPageSetting.isPledgeReasonColVisible;
    this.isPledgeLocationColVisible = uiPageSetting.isPledgeLocationColVisible;
    this.isPledgeCollectorColVisible =
      uiPageSetting.isPledgeCollectorColVisible;
    this.isPledgeDeviceColVisible = uiPageSetting.isPledgeDeviceColVisible;
    this.isPledgeAccountNoColVisible =
      uiPageSetting.isPledgeAccountNoColVisible;
    this.isPledgeFullNameColVisible = uiPageSetting.isPledgeFullNameColVisible;
    this.isPledgeAddressColVisible = uiPageSetting.isPledgeAddressColVisible;
    this.isPledgePhoneColVisible = uiPageSetting.isPledgePhoneColVisible;
    this.isPledgeEmailColVisible = uiPageSetting.isPledgeEmailColVisible;
    this.isPledgeCityStateZipColVisible =
      uiPageSetting.isPledgeCityStateZipColVisible;
    this.isPledgeGroupColVisible = uiPageSetting.isPledgeGroupColVisible;
    this.isPledgeClassColVisible = uiPageSetting.isPledgeClassColVisible;
    this.isPledgeFatherColVisible = uiPageSetting.isPledgeFatherColVisible;
    this.isPledgeFatherInLawColVisible =
      uiPageSetting.isPledgeFatherInLawColVisible;
    this.isExternalNoteColVisible = uiPageSetting.isExternalNoteColVisible;
    this.isPledgeEnglishTitleColVisible =
      uiPageSetting.isPledgeEnglishTitleColVisible;
    this.isPledgeFirstNameColVisible =
      uiPageSetting.isPledgeFirstNameColVisible;
    this.isPledgeLastNameColVisible = uiPageSetting.isPledgeLastNameColVisible;
    this.isPledgeTitleJewishColVisible =
      uiPageSetting.isPledgeTitleJewishColVisible;
    this.isPledgeFirstNameJewishColVisible =
      uiPageSetting.isPledgeFirstNameJewishColVisible;
    this.isPledgeLastNameJewishColVisible =
      uiPageSetting.isPledgeLastNameJewishColVisible;
    this.isPledgeSuffixJewishColVisible =
      uiPageSetting.isPledgeSuffixJewishColVisible;
    this.cardType = uiPageSetting.pledgeSumBy;
    this.objAdvancedSearch = uiPageSetting.pledgeSearchItem;

    if (uiPageSetting?.pledgeCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.pledgeCalendarPlaceHolderId;

    if (
      uiPageSetting.pledgeStartDate == null &&
      uiPageSetting.pledgeEndDate == null
    ) {
      this.selectedDateRange.startDate = null;
      this.selectedDateRange.endDate = null;
      this.EngHebCalPlaceholder = "All Time";
    } else {
      this.getSelectedDateRange(
        uiPageSetting.pledgeStartDate,
        uiPageSetting.pledgeEndDate
      );
    }

    this.pageSyncService.uiPageSettings["pledgeList"] = uiPageSetting;
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }
  class_id: string;
  class_hid: string;

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
    if (this.pageSyncService.pledgeEngCalPlaceholder) {
      this.EngHebCalPlaceholder = this.pageSyncService.pledgeEngCalPlaceholder;
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
        if (this.pageClicked == true) {
          this.searchPledgeTransactionsData();
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

  RefreshList() {
    this.searchPledgeTransactionsData();
  }

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };

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
        id: 6,
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

  selectRecord(event, type, pledgeID, item = this.gridFilterData) {
    this.isSelectPopupShow = false;
    if (type == "selectAll") {
      this.isBulkCheckbox = true;
      if (event.target.checked) {
        const allPledgeIds = this.gridFilterData.map((item) => item.pledgeID);
        this.checkAllAliyasGroupId(allPledgeIds);
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.pledgeID);
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
        if (!this.recordSelectedArray.includes(pledgeID)) {
          this.recordSelectedArray.push(pledgeID);
        }
        if (this.recordSelectedArray.length > 1) {
          this.checkAllAliyasGroupId(this.recordSelectedArray);
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(pledgeID)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == pledgeID) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
        }
      }
    }
  }

  checkselectRecord(pledgeId): Boolean {
    if (
      !this.displayThisPageArray.includes(pledgeId) &&
      this.isSelectPopupShow
    ) {
      this.displayThisPageArray.push(pledgeId);
    }
    return this.recordSelectedArray.includes(pledgeId);
  }

  search(keyword) {
    $("#pldg_select_all").prop("checked", false);
    this.isSelected = false;
    var record = this.gridData;
    this.totalRecord = this.gridData.length;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    this.isFiltered = false;
    this.recordSelectedArray = [];
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      var filterdRecord;
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.pledgeNum &&
              obj.pledgeNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.pledgeAmount &&
              obj.pledgeAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.pledgePaidAmount &&
              obj.pledgePaidAmount
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.locationName &&
              obj.locationName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleType &&
              obj.scheduleType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.balance &&
              obj.balance.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.status &&
              obj.status.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.device &&
              obj.device.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phones &&
              obj.phones.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.father &&
              obj.father.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fatherInLaw &&
              obj.fatherInLaw.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.colectorName &&
              obj.colectorName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.description &&
              obj.description.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.externalNote &&
              obj.externalNote.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
        record = this.gridFilterData;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
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
    var fieldsData = this.pageSyncService.pledgeFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "pledge#":
        this.isPledgenumberColVisible = isVisible;
        this.uiPageSetting.isPledgenumberColVisible = isVisible;
        break;
      case "campaign":
        this.isPledgeCampaignColVisible = isVisible;
        this.uiPageSetting.isPledgeCampaignColVisible = isVisible;
        break;
      case "note":
        this.isPledgeNoteColVisible = isVisible;
        this.uiPageSetting.isPledgeNoteColVisible = isVisible;
        break;
      case "amount":
        this.isPledgeAmountColVisible = isVisible;
        this.uiPageSetting.isPledgeAmountColVisible = isVisible;
        break;
      case "hebrewdate":
        this.isPaymentJewishDateColVisible = isVisible;
        this.uiPageSetting.isPaymentJewishDateColVisible = isVisible;
        break;
      case "paidamount":
        this.isPledgePaidAmountColVisible = isVisible;
        this.uiPageSetting.isPledgePaidAmountColVisible = isVisible;
        break;
      case "pledgedate":
        this.isPledgeDateColVisible = isVisible;
        this.uiPageSetting.isPledgeDateColVisible = isVisible;
        break;
      case "donorenglishname":
        this.isPledgeFullNameColVisible = isVisible;
        this.uiPageSetting.isPledgeFullNameColVisible = isVisible;
        break;
      case "donorjewishname":
        this.isPledgeFullNameJewishColVisible = isVisible;
        this.uiPageSetting.isPledgeFullNameJewishColVisible = isVisible;
        break;
      case "reason":
        this.isPledgeReasonColVisible = isVisible;
        this.uiPageSetting.isPledgeReasonColVisible = isVisible;
        break;
      case "reason#":
        this.isPledgeReasonNumberColVisible = isVisible;
        this.uiPageSetting.isPledgeReasonNumberColVisible = isVisible;
        break;
      case "location":
        this.isPledgeLocationColVisible = isVisible;
        this.uiPageSetting.isPledgeLocationColVisible = isVisible;
        break;
      case "source":
        this.isPledgeDeviceColVisible = isVisible;
        this.uiPageSetting.isPledgeDeviceColVisible = isVisible;
        break;
      case "collector":
        this.isPledgeCollectorColVisible = isVisible;
        this.uiPageSetting.isPledgeCollectorColVisible = isVisible;
        break;
      case "balance":
        this.isPledgeBalanceColVisible = isVisible;
        this.uiPageSetting.isPledgeBalanceColVisible = isVisible;
        break;
      case "status":
        this.isPledgeStatusColVisible = isVisible;
        this.uiPageSetting.isPledgeStatusColVisible = isVisible;
        break;
      case "createddatetime":
        this.isPledgeCreatedDateColVisible = isVisible;
        this.uiPageSetting.isPledgeCreatedDateColVisible = isVisible;
        break;
      case "schedule#":
        this.isPledgeScheduleNoColVisible = isVisible;
        this.uiPageSetting.isPledgeScheduleNoColVisible = isVisible;
        break;
      case "scheduleinfo":
        this.isPledgeScheduleInfoColVisible = isVisible;
        this.uiPageSetting.isPledgeScheduleInfoColVisible = isVisible;
        break;
      case "account#":
        this.isPledgeAccountNoColVisible = isVisible;
        this.uiPageSetting.isPledgeAccountNoColVisible = isVisible;
        break;
      case "address":
        this.isPledgeAddressColVisible = isVisible;
        this.uiPageSetting.isPledgeAddressColVisible = isVisible;
        break;
      case "citystatezip":
        this.isPledgeCityStateZipColVisible = isVisible;
        this.uiPageSetting.isPledgeCityStateZipColVisible = isVisible;
        break;
      case "group":
        this.isPledgeGroupColVisible = isVisible;
        this.uiPageSetting.isPledgeGroupColVisible = isVisible;
        break;
      case "class":
        this.isPledgeClassColVisible = isVisible;
        this.uiPageSetting.isPledgeClassColVisible = isVisible;
        break;
      case "father":
        this.isPledgeFatherColVisible = isVisible;
        this.uiPageSetting.isPledgeFatherColVisible = isVisible;
        break;
      case "fatherinlaw":
        this.isPledgeFatherInLawColVisible = isVisible;
        this.uiPageSetting.isPledgeFatherInLawColVisible = isVisible;
        break;
      case "phonenumber":
        this.isPledgePhoneColVisible = isVisible;
        this.uiPageSetting.isPledgePhoneColVisible = isVisible;
        break;
      case "email":
        this.isPledgeEmailColVisible = isVisible;
        this.uiPageSetting.isPledgeEmailColVisible = isVisible;
        break;
      case "externalnote":
        this.isExternalNoteColVisible = isVisible;
        this.uiPageSetting.isExternalNoteColVisible = isVisible;
        break;
      case "englishtitle":
        this.isPledgeEnglishTitleColVisible = isVisible;
        this.uiPageSetting.isPledgeEnglishTitleColVisible = isVisible;
        break;
      case "englishfirstname":
        this.isPledgeFirstNameColVisible = isVisible;
        this.uiPageSetting.isPledgeFirstNameColVisible = isVisible;
        break;
      case "englishlastname":
        this.isPledgeLastNameColVisible = isVisible;
        this.uiPageSetting.isPledgeLastNameColVisible = isVisible;
        break;
      case "yiddishfirsttitle":
        this.isPledgeTitleJewishColVisible = isVisible;
        this.uiPageSetting.isPledgeTitleJewishColVisible = isVisible;
        break;
      case "yiddishfirstname":
        this.isPledgeFirstNameJewishColVisible = isVisible;
        this.uiPageSetting.isPledgeFirstNameJewishColVisible = isVisible;
        break;
      case "yiddishlastname":
        this.isPledgeLastNameJewishColVisible = isVisible;
        this.uiPageSetting.isPledgeLastNameJewishColVisible = isVisible;
        break;
      case "yiddishlasttitle":
        this.isPledgeSuffixJewishColVisible = isVisible;
        this.uiPageSetting.isPledgeSuffixJewishColVisible = isVisible;
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
      case "pledge#":
        return this.isPledgenumberColVisible;
      case "campaign":
        return this.isPledgeCampaignColVisible;
      case "note":
        return this.isPledgeNoteColVisible;
      case "amount":
        return this.isPledgeAmountColVisible;
      case "hebrewdate": //added
        return this.isPaymentJewishDateColVisible;
      case "paidamount":
        return this.isPledgePaidAmountColVisible;
      case "pledgedate":
        return this.isPledgeDateColVisible;
      case "donorenglishname":
        return this.isPledgeFullNameColVisible;
      case "donorjewishname":
        return this.isPledgeFullNameJewishColVisible;
      case "reason":
        return this.isPledgeReasonColVisible;
      case "reason#":
        return this.isPledgeReasonNumberColVisible;
      case "location":
        return this.isPledgeLocationColVisible;
      case "source":
        return this.isPledgeDeviceColVisible;
      case "collector":
        return this.isPledgeCollectorColVisible;
      case "balance":
        return this.isPledgeBalanceColVisible;
      case "status":
        return this.isPledgeStatusColVisible;
      case "status":
        return this.isPledgeStatusColVisible;
      case "createddatetime":
        return this.isPledgeCreatedDateColVisible;
      case "schedule#":
        return this.isPledgeScheduleNoColVisible;
      case "scheduleinfo":
        return this.isPledgeScheduleInfoColVisible;
      case "account#":
        return this.isPledgeAccountNoColVisible;
      case "address":
        return this.isPledgeAddressColVisible;
      case "citystatezip":
        return this.isPledgeCityStateZipColVisible;
      case "group":
        return this.isPledgeGroupColVisible;
      case "class":
        return this.isPledgeClassColVisible;
      case "father":
        return this.isPledgeFatherColVisible;
      case "fatherinlaw":
        return this.isPledgeFatherInLawColVisible;
      case "note":
        return this.isPledgeNoteColVisible;
      case "phonenumber":
        return this.isPledgePhoneColVisible;
      case "email":
        return this.isPledgeEmailColVisible;
      case "externalnote":
        return this.isExternalNoteColVisible;
      case "englishtitle":
        return this.isPledgeEnglishTitleColVisible;
      case "englishfirstname":
        return this.isPledgeFirstNameColVisible;
      case "englishlastname":
        return this.isPledgeLastNameColVisible;
      case "yiddishfirsttitle":
        return this.isPledgeTitleJewishColVisible;
      case "yiddishfirstname":
        return this.isPledgeFirstNameJewishColVisible;
      case "yiddishlastname":
        return this.isPledgeLastNameJewishColVisible;
      case "yiddishlasttitle":
        return this.isPledgeSuffixJewishColVisible;
    }
  }

  datesUpdated(event) {
    $("#pldg_localsearch").val("");
    $("#pldg_select_all").prop("checked", false);
    this.isSelected = false;
    this.recordSelectedArray = [];
    if (this.isinitialize == 2) {
      this.selectedDateRange = event;
      this.searchPledgeTransactionsData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
        this.isinitialize = 1;
      }
    } else {
      this.isinitialize += 1;
    }
  }

  hebDateUpdated(event: any) {
    this.picker.on("select", (e: any) => {
      if (
        this.selectedDateRange.startDate != e.detail.start ||
        this.selectedDateRange.endDate != e.detail.end
      ) {
        this.selectedDateRange.startDate = e.detail.start;
        this.selectedDateRange.endDate = e.detail.end;
        if (this.selectedDateRange.startDate != null) {
          this.searchPledgeTransactionsData();
        }
      }
    });
  }

  GetPledgeTransByPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      $("#pldg_select_all").prop("checked", false);
      this.isSelected = false;
      this.recordSelectedArray = [];
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null;
      switch (cardTypeValue) {
        case "1": //Pledge
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.campaignID && s.campaignID == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "2": //Reason
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.reasonID && s.reasonID == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "3": //Location
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.locationID && s.locationID == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "5": //Collector
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.collectorID &&
                s.collectorID == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
        case "6": //Source
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) =>
                s.deviceId && s.deviceId == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
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
                moment(s.pledgeDate).format("YYYY-WW").toString() ==
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
                moment(s.pledgeDate).format("MMMM").toString() ==
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
                moment(s.pledgeDate).format("YYYY").toString() ==
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

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbyPledge = cardType;
    $("#pldg_select_all").prop("checked", false);
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
      if (cardType[0].itemName == "Collector") {
        this.paymentTypeChipData = this.sumByCollectorPayments.filter(
          (x) => x.paymentType != "" && x.paymentType != null
        );
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
        this.searchPledgeTransactionsData();
      });
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
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
          totalAmount: _.sumBy(props, "pledgeAmount"),
          paid: _.sumBy(props, "pledgePaidAmount"),
          open: _.sumBy(props, "balance"),
        };
      })
      .value();
  }

  calculateAllSumByFields(list) {
    const totalAmount = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.pledgeAmount;
        return sumOfArray;
      },
      0
    );
    const totalPaid = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.pledgePaidAmount;
        return sumOfArray;
      },
      0
    );
    const totalBalance = _.reduce(
      list,
      (sumOfArray, element) => {
        sumOfArray = sumOfArray + element.balance;
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
      paid: totalPaid,
      open: totalBalance,
    };
    const byReason = this.calculatesumBy(list, "reasonID", "reasonName");
    const byCampaign = this.calculatesumBy(list, "campaignID", "campaignName");
    const byLocation = this.calculatesumBy(list, "locationID", "locationName");
    const byCollector = this.calculatesumBy(
      list,
      "collectorID",
      "colectorName"
    );
    const bySource = this.calculatesumBy(list, "deviceId", "device");

    this.sumByReasonPayments = [allKeyObj, ...byReason];
    this.sumByCampaignPayments = [allKeyObj, ...byCampaign];
    this.sumByLocationPayments = [allKeyObj, ...byLocation];
    this.sumByCollectorPayments = [allKeyObj, ...byCollector];
    this.sumBySourcePayments = [allKeyObj, ...bySource];
  }

  searchPledgeTransactionsData() {
    this.isloading = true;
    this.detectChanges();
    $("#pldg_localsearch").val("");
    $("#pldg_select_all").prop("checked", false);
    this.recordSelectedArray = [];
    this.isSelected = false;
    let objAdvancedSearchData: any = {};
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
        fullName: this.objAdvancedSearch.fullName,
        city: this.objAdvancedSearch.city,
        state: this.objAdvancedSearch.state,
        zip: this.objAdvancedSearch.zip,
        street: this.objAdvancedSearch.street,
        cityStateZip: this.objAdvancedSearch.cityStateZip
          ? this.objAdvancedSearch.cityStateZip.map((a) => ({
              city: a.city,
              state: a.state,
              zip: a.itemName,
            }))
          : null,

        defaultLocation:
          this.objAdvancedSearch.defaultLocation.length > 0
            ? this.objAdvancedSearch.defaultLocation.map((s) => s.id)
            : null,
        group: this.objAdvancedSearch.group,
        class: this.objAdvancedSearch.class,
        note: this.objAdvancedSearch.note,
        phone: this.objAdvancedSearch.phone,
        email: this.objAdvancedSearch.email,
        pledgeStatusIds:
          this.objAdvancedSearch.pledgeStatus.length > 0
            ? this.objAdvancedSearch.pledgeStatus.map((s) => s.id)
            : null,

        minBalanceAmount: this.objAdvancedSearch.minBalanceAmount,
        maxBalanceAmount: this.objAdvancedSearch.maxBalanceAmount,
        isReasonNoOptionSelected:
          this.objAdvancedSearch.isReasonNoOptionSelected,
        isCampaignNoOptionSelected:
          this.objAdvancedSearch.isCampaignNoOptionSelected,
        isLocationNoOptionSelected:
          this.objAdvancedSearch.isLocationNoOptionSelected,
        isCollectorNoOptionSelected:
          this.objAdvancedSearch.isCollectorNoOptionSelected,
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
        pledgeStatusIds: [1, 2],
      };
    }
    let objsearchPledgeTrans = {
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
    };

    this.pledgeTransactionService
      .getPledgeTransactions(objsearchPledgeTrans)
      .subscribe(
        (res: any) => {
          // hide loader
          if (!res) {
            this.totalRecord = 0;
            this.gridData = [];
            this.gridFilterData = this.gridData;
            this.pageSyncService.pledgeTransList = this.gridFilterData;
            this.paymentTypeChipData = null;
            this.recordSelectedArray = [];
            this.pageSyncService.pledgeTransList = this.gridFilterData;
            this.isloading = false;
            this.cdr.detectChanges();
            return false;
          }
          this.isFiltered = false;
          if (res) {
            // min & max balance filter

            if (
              this.objAdvancedSearch &&
              (this.objAdvancedSearch.minBalanceAmount ||
                this.objAdvancedSearch.maxBalanceAmount)
            ) {
              if (
                this.objAdvancedSearch.minBalanceAmount &&
                this.objAdvancedSearch.maxBalanceAmount
              ) {
                res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                  (x) =>
                    x.balance >= this.objAdvancedSearch.minBalanceAmount &&
                    x.balance <= this.objAdvancedSearch.maxBalanceAmount
                );
              } else if (
                !this.objAdvancedSearch.minBalanceAmount &&
                this.objAdvancedSearch.maxBalanceAmount
              ) {
                res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                  (x) => x.balance <= this.objAdvancedSearch.maxBalanceAmount
                );
              } else if (
                this.objAdvancedSearch.minBalanceAmount &&
                !this.objAdvancedSearch.maxBalanceAmount
              ) {
                res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                  (x) => x.balance >= this.objAdvancedSearch.minBalanceAmount
                );
              }
            }

            res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
              (x) => x.pledgeAmount > 0.0
            );

            this.calculateAllSumByFields(res.pledgeTransGridModel);

            for (let i = 0; i < res.pledgeTransGridModel.length; i++) {
              if (res.pledgeTransGridModel[i].isRecurring == true) {
                res.pledgeTransGridModel[i].strRecurring = "Yes";
              } else {
                res.pledgeTransGridModel[i].strRecurring = "No";
              }
            }
            for (let i = 0; i < res.pledgeTransGridModel.length; i++) {
              if (
                res.pledgeTransGridModel[i].phones &&
                res.pledgeTransGridModel[i].phones.indexOf(",") > -1
              ) {
                let phoneNoArray =
                  res.pledgeTransGridModel[i].phones.split(",");
                res.pledgeTransGridModel[i].phoneNumberList = phoneNoArray;
                phoneNoArray = phoneNoArray.slice(0, 2);
                for (let j = 0; j < phoneNoArray.length; j++) {
                  if (res.pledgeTransGridModel[i].phoneNo2)
                    res.pledgeTransGridModel[i].phoneNo2 =
                      res.pledgeTransGridModel[i].phoneNo2 +
                      "<br>" +
                      this.formatPhoneNumber(phoneNoArray[j]);
                  else
                    res.pledgeTransGridModel[i].phoneNo2 =
                      this.formatPhoneNumber(phoneNoArray[j]);
                }
              } else {
                res.pledgeTransGridModel[i].phoneNo2 = this.formatPhoneNumber(
                  res.pledgeTransGridModel[i].phones
                );
                res.pledgeTransGridModel[i].phoneNumberList =
                  res.pledgeTransGridModel[i].phones;
              }

              if (
                res.pledgeTransGridModel[i].emails &&
                res.pledgeTransGridModel[i].emails.indexOf(",") > -1
              ) {
                let emailArray = res.pledgeTransGridModel[i].emails.split(",");
                res.pledgeTransGridModel[i].emailList = emailArray;
                emailArray = emailArray.slice(0, 2);
                for (let j = 0; j < emailArray.length; j++) {
                  if (res.pledgeTransGridModel[i].emailLabels2)
                    res.pledgeTransGridModel[i].emailLabels2 =
                      res.pledgeTransGridModel[i].emailLabels2 +
                      "<br>" +
                      emailArray[j];
                  else res.pledgeTransGridModel[i].emailLabels2 = emailArray[j];
                }
              } else {
                res.pledgeTransGridModel[i].emailList =
                  res.pledgeTransGridModel[i].emails;
                res.pledgeTransGridModel[i].emailLabels2 =
                  res.pledgeTransGridModel[i].emails;
              }
            }
            if (res.pledgeTransGridModel) {
              res.pledgeTransGridModel.forEach((s) => {
                if (s.status == "Paid") {
                  s.status_class = "pledge_paid";
                } else if (s.status == "Open") {
                  s.status_class = "pledge_open";
                } else if (s.status == "Partially Paid") {
                  s.status_class = "pledge_partial";
                } else if (s.status == "Voided") {
                  s.status_class = "pledge_void";
                } else if (s.status == "Running") {
                  s.status_class = "pledge_running";
                }
              });
            }
            this.resGridDataModification(res.pledgeTransGridModel);
            var timezone =
              this.commonMethodService.getTimeZoneFromLoginCurrency();
            this.pageSyncService.lastSyncPledgeTime =
              this.commonMethodService.convertUTCToTimezone(
                new Date(),
                timezone
              );
            this.pageSyncService.calculateTimeDifference("pledge");
            this.gridData = res.pledgeTransGridModel;
            this.gridFilterData = this.gridData;
            this.pageSyncService.pledgeTransList = this.gridFilterData;
          } else {
            this.totalRecord = 0;
            this.gridData = null;
            this.gridFilterData = this.gridData;
            this.paymentTypeChipData = null;
            this.recordSelectedArray = [];
          }
          this.commonMethodService.sendPledgeTransactionData(
            this.gridFilterData
          );
          this.isloading = false;
          this.detectChanges();
        },
        (error) => {
          this.isloading = false;
          console.log(error);
          this.notificationService.showError(
            error.error,
            "Error while fetching data !!"
          );
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  resGridDataModification(pledgeTransGridModel) {
    this.sumByWeekPayments = this.commonMethodService.getSumByWeekPayments(
      pledgeTransGridModel,
      "pledgeDate",
      "pledgeAmount"
    );
    this.sumByMonthPayments = this.commonMethodService.getSumByMonthPayments(
      pledgeTransGridModel,
      "pledgeDate",
      "pledgeAmount"
    );
    this.sumByYearPayments = this.commonMethodService.getSumByYearPayments(
      pledgeTransGridModel,
      "pledgeDate",
      "pledgeAmount"
    );
    this.totalRecord = pledgeTransGridModel.length;
    this.recordSelectedArray = [];
    this.cardTypeChange(this.cardType);
    this.changeSortType(this.sortType);
    this.initMultiSelect();
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
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
    this.searchPledgeTransactionsData();
  }

  totalSelectedShow(): number {
    return this.recordSelectedArray.length;
  }

  // popup
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
    modalRef.componentInstance.isPledgeTab = true;
    modalRef.componentInstance.AdvancedFilterData = this.pageSyncService
      .pledgeFilterData
      ? this.pageSyncService.pledgeFilterData
      : this.objAdvancedSearch;
    modalRef.componentInstance.isSearchTitle = "Pledge";
    modalRef.componentInstance.FeatureName = "Filter_pledges";

    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedSearchData(objResponse, true);
      }
    );
  }
  advancedSearchData(objResponse, value) {
    this.objAdvancedSearch = objResponse;
    if (value) {
      this.searchPledgeTransactionsData();
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
          modalRef.componentInstance.CollectorCardData = res;
        });
    }
  }

  openSearchFilterPopup() {
    const modalRef = this.commonMethodService.openPopup(
      PledgeTransGridFilterPopupComponent
    );
    modalRef.componentInstance.setDueDate = this.selectedDueDate;
    modalRef.componentInstance.emtOutputSearchFilterData.subscribe(
      (objResponse) => {
        this.setPaymentDue("customWeek", objResponse.selectedDueDate);
      }
    );
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

  openImportPledgePopup() {
    const modalRef = this.commonMethodService.openPopup(ImportPledgeComponent);
  }

  openAddPledgePopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    this.commonMethodService.openPopup(
      AddUpdatePledgeComponent,
      this.modalOptions
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

  OpenDonorCardPage() {
    this.commonMethodService.openPopup(DonorCardPopupComponent);
  }

  public downloadExcel() {
    this.isloading = true;
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let PledgeNum = item && item.pledgeNum;
        let CampaignName = item && item.campaignName;
        let CreatedDate = item && item.createdDate;
        let Balance =
          item && this.commonMethodService.formatAmount(item.balance);
        let Status = item && item.status;
        let PledgDate = item && item.pledgeDate;
        let PledgeAmount =
          item && this.commonMethodService.formatAmount(item.pledgeAmount);
        let PledgePaidAmount =
          item && this.commonMethodService.formatAmount(item.pledgePaidAmount);
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let Reason = item && item.reasonName;
        let ReasonNumber = item && item.reasonNumber;
        let Location = item && item.locationName;
        let Device = item && item.device;
        let Collector = item && item.colectorName;
        let ScheduleNo = item && item.scheduleNum;
        let ScheduleInfo =
          item && this.commonMethodService.formatAmount(item.pledgeAmount);
        let AccountNo = item && item.accountNum;
        let Address = item && item.address;
        let CityStateZip = item && item.cityStateZip;
        let Email = item && item.emailAddresses;
        let Class = item && item.class;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;
        let Group = item && item.group;
        let Note = item && item.note;
        let PhoneNumber = item && item.phones;
        let Title = item && item.title;
        let FirstName = item && item.firstName;
        let LastName = item && item.lastName;
        let TitleJewish = item && item.titleJewish;
        let FirstNameJewish = item && item.firstNameJewish;
        let LastNameJewish = item && item.lastNameJewish;
        let SuffixJewish = item && item.suffixJewish;
        let ExternalNote = item && item.externalNote;
        let PledgeJewishDate = item && item.pledgeJewishDate;

        let row = {};
        if (this.isPledgenumberColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PLEDGE#")
            : "Pledge #";
          row[ColName] = PledgeNum;
        }
        if (this.isPledgeDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PLEDGEDATE")
            : "Pledge Date";
          row[ColName] = this.datePipe.transform(item.pledgeDate, "name-long");
        }
        if (this.isPledgeFullNameJewishColVisible) {
          row["Donor Jewish Name"] = FullNameJewish;
        }
        if (this.isPledgeCreatedDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CREATEDDATETIME")
            : "Created Date & Time";
          row[ColName] = this.datePipe.transform(item.createdDate, "name-long");
        }
        if (this.isPledgeAmountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("AMOUNT")
            : "Amount";
          row[ColName] = Number(item.pledgeAmount);
        }
        if (this.isPledgePaidAmountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAID")
            : "Paid";
          row[ColName] = Number(item.pledgePaidAmount);
        }
        if (this.isPledgeBalanceColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("BALANCE")
            : "Balance";
          row[ColName] = Number(item.balance);
        }
        if (this.isPledgeStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATUS")
            : "Status";
          row[ColName] = Status;
        }
        if (this.isPledgeScheduleNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULE#")
            : "Schedule #";
          row[ColName] = ScheduleNo;
        }
        if (this.isPledgeScheduleInfoColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULEINFO")
            : "Schedule Info";
          row[ColName] = ScheduleInfo;
        }
        if (this.isPledgeNoteColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTE")
            : "Note";
          row[ColName] = Note;
        }
        if (this.isPledgeCampaignColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CAMPAIGN")
            : "Campaign";
          row[ColName] = CampaignName;
        }
        if (this.isPledgeReasonColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON")
            : "Reason";
          row[ColName] = Reason;
        }

        if (this.isPledgeReasonNumberColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON#")
            : "Reason #";
          row[ColName] = ReasonNumber;
        }

        if (this.isPledgeLocationColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LOCATION")
            : "Location";
          row[ColName] = Location;
        }
        if (this.isPledgeCollectorColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COLLECTOR")
            : "Collector";
          row[ColName] = Collector;
        }
        if (this.isPledgeDeviceColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SOURCE")
            : "Source";
          row[ColName] = Device;
        }
        if (this.isPledgeAccountNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACCOUNT#")
            : "Account #";
          row[ColName] = AccountNo;
        }
        if (this.isPledgeFullNameColVisible) {
          row["Donor English Name"] = FullName;
        }

        if (this.isPledgeAddressColVisible) {
          row["House Num"] = item.defaultHouseNum;
          row["Street Name"] = item.defaultStreetName;
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("APT")
            : "Apt";
          row[ColName] = item.defaultUnit;
        }
        if (this.isPledgeCityStateZipColVisible) {
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

        if (this.isPledgePhoneColVisible) {
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
        if (this.isPledgeEmailColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] = Email;
        }
        if (this.isPledgeGroupColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("GROUP")
            : "Group";
          row[ColName] = Group;
        }
        if (this.isPledgeClassColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CLASS")
            : "Class";
          row[ColName] = Class;
        }
        if (this.isPledgeFatherColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHER")
            : "Father";
          row[ColName] = Father;
        }
        if (this.isPledgeFatherInLawColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHERINLAW")
            : "Father in law";
          row[ColName] = FatherInLaw;
        }
        //added new
        if (this.isPledgeEnglishTitleColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHTITLE")
            : "English Title";
          row[ColName] = Title;
        }
        if (this.isPledgeFirstNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHFIRSTNAME")
            : "English First name";
          row[ColName] = FirstName;
        }
        if (this.isExternalNoteColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EXTERNALNOTE")
            : "External Note";
          row[ColName] = ExternalNote;
        }
        if (this.isPledgeLastNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHLASTNAME")
            : "English Last name";
          row[ColName] = LastName;
        }
        if (this.isPledgeTitleJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTTITLE")
            : "Yiddish First Title";
          row[ColName] = TitleJewish;
        }
        if (this.isPledgeFirstNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTNAME")
            : "Yiddish First name";
          row[ColName] = FirstNameJewish;
        }
        if (this.isPledgeLastNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTNAME")
            : "Yiddish Last name";
          row[ColName] = LastNameJewish;
        }
        if (this.isPledgeSuffixJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTTITLE")
            : "Yiddish Last Title";
          row[ColName] = SuffixJewish;
        }
        if (this.isPaymentJewishDateColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("HEBREWDATE")
            : "Hebrew Date";
          row[ColName] = PledgeJewishDate;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Transaction Pledge List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Find Amount, Paid, Balance, Pledge Date and Pledge Created column
    let amountColumn = null;
    let paidColumn = null;
    let balanceColumn = null;
    let pledgeDateColumn = null;
    let pledgeCreatedDateColumn = null;
    for (var R = range.s.r; R < 1; ++R) {
      for (var C = range.s.c; C <= range.e.c; ++C) {
        var cell_address = { c: C, r: R };
        var cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!worksheet[cell_ref]) continue;
        if (worksheet[cell_ref].v == "Amount") {
          amountColumn = C;
        }
        if (worksheet[cell_ref].v == "Paid") {
          paidColumn = C;
        }

        if (worksheet[cell_ref].v == "Balance") {
          balanceColumn = C;
        }

        if (worksheet[cell_ref].v == "Pledge Date") {
          pledgeDateColumn = C;
        }

        if (worksheet[cell_ref].v == "Created Date & Time") {
          pledgeCreatedDateColumn = C;
        }
      }
    }

    let fmt = '"$"#,##0.00_);\\("$"#,##0.00\\)';
    let _currencyFormat = "$#,##0.00";
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

      if (!!paidColumn) {
        let paid_cell_address = { c: paidColumn, r: R };
        let paid_cell_ref = XLSX.utils.encode_cell(paid_cell_address);
        if (worksheet[paid_cell_ref]) {
          worksheet[paid_cell_ref].t = "n";
          //worksheet[paid_cell_ref].t = "s";
          worksheet[paid_cell_ref].z = _currencyFormat;
        }
      }

      if (!!balanceColumn) {
        let balance_cell_address = { c: balanceColumn, r: R };
        let balance_cell_ref = XLSX.utils.encode_cell(balance_cell_address);
        if (worksheet[balance_cell_ref]) {
          worksheet[balance_cell_ref].t = "n";
          // worksheet[balance_cell_ref].t = "s";
          worksheet[balance_cell_ref].z = _currencyFormat;
        }
      }

      if (!!pledgeDateColumn) {
        let pledge_date_cell_address = { c: pledgeDateColumn, r: R };
        let pledge_date_cell_ref = XLSX.utils.encode_cell(
          pledge_date_cell_address
        );
        if (worksheet[pledge_date_cell_ref]) {
          worksheet[pledge_date_cell_ref].t = "d";
        }
      }

      if (!!pledgeCreatedDateColumn) {
        let pledge_created_date_cell_address = {
          c: pledgeCreatedDateColumn,
          r: R,
        };
        let pledge_created_date_cell_ref = XLSX.utils.encode_cell(
          pledge_created_date_cell_address
        );
        if (worksheet[pledge_created_date_cell_ref]) {
          worksheet[pledge_created_date_cell_ref].t = "d";
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
      isPledgenumberColVisible: this.isPledgenumberColVisible,
      isPledgeDateColVisible: this.isPledgeDateColVisible,
      isPledgeFullNameJewishColVisible: this.isPledgeFullNameJewishColVisible,
      isPledgeCreatedDateColVisible: this.isPledgeCreatedDateColVisible,
      isPledgeAmountColVisible: this.isPledgeAmountColVisible,
      isPaymentJewishDateColVisible: this.isPaymentJewishDateColVisible,
      isPledgePaidAmountColVisible: this.isPledgePaidAmountColVisible,
      isPledgeBalanceColVisible: this.isPledgeBalanceColVisible,
      isPledgeStatusColVisible: this.isPledgeStatusColVisible,
      isPledgeScheduleNoColVisible: this.isPledgeScheduleNoColVisible,
      isPledgeScheduleInfoColVisible: this.isPledgeScheduleInfoColVisible,
      isPledgeNoteColVisible: this.isPledgeNoteColVisible,
      isPledgeCampaignColVisible: this.isPledgeCampaignColVisible,
      isPledgeReasonNumberColVisible: this.isPledgeReasonNumberColVisible,
      isPledgeReasonColVisible: this.isPledgeReasonColVisible,
      isPledgeLocationColVisible: this.isPledgeLocationColVisible,
      isPledgeCollectorColVisible: this.isPledgeCollectorColVisible,
      isPledgeDeviceColVisible: this.isPledgeDeviceColVisible,
      isPledgeAccountNoColVisible: this.isPledgeAccountNoColVisible,
      isPledgeFullNameColVisible: this.isPledgeFullNameColVisible,
      isPledgeAddressColVisible: this.isPledgeAddressColVisible,
      isPledgePhoneColVisible: this.isPledgePhoneColVisible,
      isPledgeEmailColVisible: this.isPledgeEmailColVisible,
      isPledgeCityStateZipColVisible: this.isPledgeCityStateZipColVisible,
      isPledgeGroupColVisible: this.isPledgeGroupColVisible,
      isPledgeClassColVisible: this.isPledgeClassColVisible,
      isPledgeFatherColVisible: this.isPledgeFatherColVisible,
      isPledgeFatherInLawColVisible: this.isPledgeFatherInLawColVisible,
      isExternalNoteColVisible: this.isExternalNoteColVisible,
      isPledgeEnglishTitleColVisible: this.isPledgeEnglishTitleColVisible,
      isPledgeFirstNameColVisible: this.isPledgeFirstNameColVisible,
      isPledgeLastNameColVisible: this.isPledgeLastNameColVisible,
      isPledgeTitleJewishColVisible: this.isPledgeTitleJewishColVisible,
      isPledgeFirstNameJewishColVisible: this.isPledgeFirstNameJewishColVisible,
      isPledgeLastNameJewishColVisible: this.isPledgeLastNameJewishColVisible,
      isPledgeSuffixJewishColVisible: this.isPledgeSuffixJewishColVisible,
      pledgeStartDate: this.selectedDateRange.startDate,
      pledgeEndDate: this.selectedDateRange.endDate,
      pledgeSumBy: this.cardType,
      pledgeSearchItem: this.objAdvancedSearch,
      pledgeCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "pledges",
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

  openPledgeCardPopup(pledgeId) {
    if (pledgeId != null && pledgeId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup pledgeCard modal_responsive",
      };
      const modalRef = this.commonMethodService.openPopup(
        PledgeCardPopupComponent,
        this.modalOptions
      );
      var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuid, pledgeId)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          modalRef.componentInstance.PledgeCardData = res;
          modalRef.componentInstance.emtPledgeUpdate.subscribe(($e) => {
            this.searchPledgeTransactionsData();
          });
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
      let objDeviceCard = {
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
      let objReasonCard = {
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
  containsHebrewCharacters(input: string): boolean {
    const hebrewRegex = /[\u0590-\u05FF]/; // Range of Hebrew Unicode characters
    return hebrewRegex.test(input);
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

  SendTextReceipt(pledgeId, phoneNumberList, accountId) {
    this.phoneLbls = [];
    this.phoneNumbers = [];
    this.countryCodeIds = [];

    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_textreceipt send_emailreceipt",
    };

    var donorDetails = this.gridFilterData.find((x) => x.pledgeID == pledgeId);
    if (donorDetails) {
      const modalRef = this.commonMethodService.openPopup(
        SendTextreceiptPopupComponent,
        this.modalOptions
      );

      let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.donorService
        .getDonorPhoneList(eventGuId, accountId)
        .subscribe((res: any) => {
          var obj: any = {};
          if (res != null) {
            obj.list = res;
            const phoneData = obj.list;
            // Convert arrays to comma-separated strings with null handling
            this.phoneLbls = phoneData.map((item) =>
              item.phoneLabel != null ? item.phoneLabel : null
            );

            this.phoneNumbers = phoneData.map((item) =>
              item.phoneNumber != null ? item.phoneNumber : null
            );

            this.countryCodeIds = phoneData.map((item) =>
              item.countryCodeID != null ? item.countryCodeID : null
            );

            let rowColumn = this.commonMethodService.getNewLabelArray(
              this.phoneLbls,
              this.phoneNumbers,
              this.countryCodeIds
            );
            modalRef.componentInstance.Info = {
              id: pledgeId,
              type: "Pledge",
              phoneList: rowColumn,
              accountId: accountId,
            };
          }
        });
    }
  }

  SendEmailReceipt(pledgeId, emailList, accountId, phoneNumberList) {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_emailreceipt",
    };
    var donorDetails = this.gridFilterData.find((x) => x.pledgeID == pledgeId);
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
        id: pledgeId,
        type: "Pledge",
        emailList: rowColumn,
        accountId: accountId,
        phoneNumber:
          phoneNumberList && phoneNumberList.length > 0
            ? phoneNumberList[0]
            : null,
      };
    }
  }

  sendMailReceipt(pledgeId, accountId, address, cityStateZip) {
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
      id: pledgeId,
      type: "Pledge",
      accountId: accountId,
      address: address,
      cityStateZip: cityStateZip,
    };
    modalRef.componentInstance.emitAddressUpdated.subscribe(($e) => {
      this.commonMethodService.sendPledgeTrans(true);
    });
  }
  isOnlyPledgePayment: boolean = false;
  printReceipt(pledgeId) {
    this.isloading = true;
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
      type: "Pledge",
      id: pledgeId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.PrintReceipt(objMailReceipt).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
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
        this.isloading = false;
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

  VoidPledge(pledgeId, accountID) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
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
        var objVoidPledge = {
          pledgeId: pledgeId,
          statusId: 3,
          accountId: accountID,
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        };
        this.pledgeService.updatePledge(objVoidPledge).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.analytics.editedPledge();

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
              });
              this.commonMethodService.sendPledgeTrans(true);
            } else {
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.TRY_AGAIN"
                ),
                text: res,
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
            console.log(error);
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
  }

  openEditPledgePopup(pledgeId, aliyaGroupId) {
    //this.isloading = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup editpledge_card edit_payment modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      EditPledgePopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    modalRef.componentInstance.aliyaGroupId = aliyaGroupId;
    this.pledgeService.GetPledge(pledgeId, eventGuId).subscribe((res: any) => {
      if (res) {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.EditPledgeData = res;
      } else {
        this.isloading = false;
        Swal.fire({
          title: "No data found",
          text: "",
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
  }

  printDiv(): void {
    let printContents, popupWin;
    printContents = document.getElementById("transaction_pledge").innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
        <title>Print tab</title>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" media="print"/>
        <style>
        //........Customized style.......
        </style>
      </head>
  <body onload="window.print();">${printContents}</body>
    </html>`);
    popupWin.document.close();
  }

  AdvancePrintReceipt() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
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
      var donorDetails = this.gridFilterData.find((x) => x.pledgeID == item);
      resultArray.push(donorDetails);
    }
    modalRef.componentInstance.Info = { type: "Pledge" };
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Duration = this.selectedDateRange;
  }

  AdvancePrintReceiptt() {
    const pledgeIds = this.recordSelectedArray.map((x) => x);

    let objMailReceipt = {
      type: "Pledge",
      Ids: pledgeIds,
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      ReceiverEmailAddress: this.localstoragedataService.getLoginUserEmail(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };

    if (pledgeIds.length < 50) {
      const modalRef = this.commonMethodService.openPopup(
        PrintReceiptPopupComponent,
        this.modalOptions
      );
      this.messengerService.BulkPrintReceipt(objMailReceipt).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res.receiptFileUrl) {
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
            modalRef.close(PrintReceiptPopupComponent);
          }
        },
        (error) => {
          this.isloading = false;
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
    } else {
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
          this.isloading = true;
          this.messengerService.BulkPrintReceipt(objMailReceipt).subscribe(
            (res: any) => {
              this.isloading = false;
              if (res) {
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
                });
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
              this.isloading = false;
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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

    let newGridlist = this.gridFilterData.map((o) => ({
      ...o,
      paymentId: o.pledgeID,
      accountId: o.accountID,
      phoneNumbers: o.phones,
    }));
    newGridlist.forEach(function (itm) {
      itm.receiptNum = itm.pledgeNum;
    });
    const objRes =
      this.advanceSMSActionService.getAdvanceSMSReceiptActionListObj(
        this.recordSelectedArray,
        newGridlist
      );
    const modalRef = this.commonMethodService.openPopup(
      BulkSMSReceiptComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = {
      type: "Pledge",
      recordSelectedArray: this.recordSelectedArray,
    };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.TableColumns = objRes.columns;
    modalRef.componentInstance.List = objRes.list;
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

  AdvanceVoidPledgeAction() {
    var totalrecords = this.recordSelectedArray.length;
    var resultArray = [];
    for (const item of this.recordSelectedArray) {
      const newDonotRcd = {
        pledgeId: item,
        statusId: 3,
      };
      resultArray.push(newDonotRcd);
    }
    Swal.fire({
      icon: "warning",
      input: "number",
      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                <h2>Edit ${totalrecords} transactions?</h2>
                <p>You're editing multiple transactions.</p>
                <span>To continue, type the amount of transactions you selected. </span>
            </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: { confirmButton: "modal-are-you-sure" },

      onOpen: function () {},
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
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
        const formData = {
          UpdatedBy: this.localstoragedataService.getLoginUserId(),
          MacAddress: this.localstoragedataService.getLoginUserGuid(),
          PledgeBulkUpdates: resultArray,
        };

        this.pledgeService
          .BulkUpdatePledgeTransactions(formData)
          .subscribe((res) => {
            if (res) {
              this.analytics.bulkVoidPledge();

              this.isloading = false;
              Swal.fire({
                title: "",
                text: res,
                icon: "info",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.commonMethodService.sendPledgeTrans(true);
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
      var donorDetails = this.gridFilterData.find((x) => x.pledgeID == item);
      if (donorDetails) {
        let { phoneNumbers, emails, ...restdonorDetails } = donorDetails;

        const newDonotRcd = {
          ...restdonorDetails,
          emails:
            emails && emails.indexOf(",") > -1
              ? emails.split(",")
              : emails
              ? [emails]
              : [],
          accountId: donorDetails.accountID,
          emailSentList: donorDetails.emailSent,
        };

        resultArray.push(newDonotRcd);
      }
    }

    modalRef.componentInstance.Info = { type: "Pledge" };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.List = _(resultArray)
      .chain()
      .groupBy((p) => p.pledgeID)
      .map((props) => ({
        ..._.head(props),
        paymentIds: _.map(props, (p) => p.pledgeID),
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

    var resultArray = [];

    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridFilterData.find((x) => x.pledgeID == item);
      if (donorDetails) {
        resultArray.push({
          ...donorDetails,
          accountId: donorDetails.accountID,
        });
      }
    }

    let listMailData = _(resultArray)
      .chain()
      .groupBy((p) => p.pledgeID)
      .map((props) => {
        return {
          ..._.head(props),
          paymentIds: _.map(props, (p) => p.pledgeID),
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
    modalRef.componentInstance.Info = { type: "Pledge" };
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
      var donorDetails = this.gridData.find((x) => x.pledgeID == item);
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
    // change rename accountID to accountId
    resultArray = resultArray.map((x) => {
      if (x.accountID) {
        x.accountId = x.accountID;
        x.phoneNumbers = x.phones;
        x.emailAddresses = x.emails;
        x.paymentId = x.pledgeID;
        x.receiptNum = x.pledgeNum;
      }
      return x;
    });

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
    modalRef.componentInstance.Info = {
      type: "Pledge",
      recordSelectedArray: this.recordSelectedArray,
    };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    modalRef.componentInstance.List = listMailData;

    // address validation

    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPledgeTrans(true);
    });
  }

  editTransactionInfoPopup() {
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
    modalRef.componentInstance.types = "Pledges";
    modalRef.componentInstance.transactionIds = this.recordSelectedArray;
  }
  //Generate Pledge  Report
  dropDownCustomReport: Array<{ label: string; value: string }> = [
    {
      label: "Generate Pledge Report",
      value: "Generate Pledge Report",
    },
  ];

  onPledgeCustomReport() {
    var id_filter = this.recordSelectedArray;
    var filtered = this.gridFilterData.filter(function (item) {
      return id_filter.indexOf(item.pledgeID) !== -1;
    });
    const countResult = filtered.map((x) => x.accountID);
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
  // import
  changeText = "";
  isloadingModel: boolean;
  file: File;
  reseteFile() {
    $("#doc_filePledge").val("");
    $("#NotReadyToUploadPledge").show();
    $("#readyToUploadPledge").hide();
    this.changeText = "";
    this.file = null;
  }
  incomingfile(event) {
    this.file = event.target.files[0];
    this.readyToUploadChangeText();
  }
  readyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#NotReadyToUploadPledge").show();
      $("#readyToUploadPledge").hide();
      this.fileName = "";
    } else {
      $("#NotReadyToUploadPledge").hide();
      $("#readyToUploadPledge").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }
  downloadExcelTemplate(event) {
    this.isloadingModel = true;
    this.pledgeService.downloadPledgeTemplate().subscribe(
      (res: any) => {
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        let filename = "Pledge_Template";
        var link = document.createElement("a");
        link.href = url;
        link.download = filename + ".xlsx";
        link.click();
        this.isloadingModel = false;
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
        const fd = new FormData();
        fd.append("RequestId", "");
        fd.append("File", this.file);
        fd.append(
          "EventGuid",
          this.localstoragedataService.getLoginUserEventGuId()
        );
        fd.append("CreatedBy", this.localstoragedataService.getLoginUserId());
        this.pledgeService.importPledge(fd).subscribe(
          (res) => {
            $("#doc_filePledge").val("");
            this.file = null;
            this.reseteFile();
            this.isloadingModel = false;
            $("#pldg_localsearch").val("");
            Swal.fire({
              title: "",
              text: res + " see import updates in users email",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                $("#import-data-pledge").modal("hide");
                this.searchPledgeTransactionsData();
              } else if (result.isDenied) {
              }
            });
          },
          (err) => {
            this.isloadingModel = false;
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
      } else {
        this.isloadingModel = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: "No file chosen",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    } else {
      this.isloadingModel = false;
      Swal.fire({
        title: this.commonMethodService.getTranslate(
          "WARNING_SWAL.SOMETHING_WENT_WRONG"
        ),
        text: "No file chosen",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }
  //jewish calender
  model: NgbDateStruct;
  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }

  selectToday() {
    this.model = this.calendar.getToday();
  }
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  dateConvert(date) {
    if (date) {
      return date.day + "/" + date.month + "/" + date.year;
    }
  }
  selectedHebEngDateRange: any;
  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "pledgeTransactionCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "PledgeTransPage" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.pledgeCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.presetOption = this.EngHebCalPlaceholder;
          this.pageSyncService.pledgeEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (this.pageSyncService.uiPageSettings["pledgeList"] != undefined) {
            this.pageSyncService.uiPageSettings[
              "pledgeList"
            ].pledgeCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
          }
          this.class_id = this.hebrewEngishCalendarService.id;
          this.class_hid = this.hebrewEngishCalendarService.hid;
          this.searchPledgeTransactionsData();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  // end jewish calender
  selectPopupOpen(event) {
    if (event.target.checked) {
      this.displayThisPageArray = [];
      this.isSelectPopupShow = true;
      event.target.checked = false;
      this.isBulkCheckbox = false;
      let count = $("#pledgeTypePayment tr").length;
      this.displayThisPageCount =
        this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      return;
    }
    this.isSelected = false;
    this.isSelectPopupShow = false;
    this.recordSelectedArray = [];
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
  }
  selectThisPage(event) {
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = false;
    });
    this.isSelected = true;
    this.recordSelectedArray = this.displayThisPageArray;
    this.checkAllAliyasGroupId(this.recordSelectedArray);
    this.isSelectPopupShow = false;
    this.isBulkCheckbox = true;
  }
  selectPopupClose() {
    this.isSelectPopupShow = false;
  }

  ngOnDestroy() {
    this.pledgeTransSubscription.unsubscribe();
  }

  checkAllAliyasGroupId(items) {
    const hasAliyasGroupId = this.gridFilterData.some(
      (item) => items.includes(item.pledgeId) && item.aliyasGroupId
    );
    if (hasAliyasGroupId) {
      this.isdisableVoidPledge = true;
    }
  }
}
