import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { ReportQueryService } from "src/app/services/reportquery.service";

declare var $: any;
@Component({
  selector: "app-report-filter-popup",
  templateUrl: "./report-filter-popup.component.html",
  styleUrls: ["./report-filter-popup.component.scss"],
  standalone: false,
})
export class ReportFilterPopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Output() emtOutputSearchFilterData: EventEmitter<any> = new EventEmitter();
  transactionType: number = 1;
  columnName: string;
  amountType: number = -1;
  popTitle: any;
  //selectedDateRange: any;
  selectedDateRange: any = {
    startDate: moment().subtract(29, "days"),
    endDate: moment(),
  };
  startDate: any = null;
  endDate: any = null;
  isPledge: boolean = false;
  isCompare: boolean = false;
  isPayment: boolean = true;
  isTotal: boolean = false;
  isSchedule: boolean = false;
  greaterThanValidate: boolean = false;
  PageName: any = "ReportFilter";
  isOneDate: any = false;
  greaterThanBalanceValidate: boolean = false;
  compareColumn1: string;
  compareColumn2: string;
  columnNameList: any = [];
  selectedBaseCol: string;
  buttonName: string = "Add";
  headerTitle: string = "Add Data Set";
  isIncludePaymentType: boolean;
  isIncludeAmountRange: boolean;
  isIncludeBalanceRange: boolean;
  isIncludeDate: boolean;
  isIncludeReason: boolean;
  isIncludeCollector: boolean;
  isIncludeLocation: boolean;
  isIncludeCampaign: boolean;
  isIncludePaymentStatus: boolean;
  isIncludeAmountType: boolean;
  totalDropdown: any = [];
  columnNo: number;
  reportQueryId: number;
  selectedTotalDropdown: any = [{ id: 4, itemName: "Total" }];

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  EngHebCalPlaceholder: string = "Last 7 Days";
  class_id: string;
  class_hid: string;
  modalOptions: NgbModalOptions;
  calendarSubscription: any;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public reportQueryService: ReportQueryService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  @Input() set SettingFilterData(data: any) {
    var selectedParameterSearchFilter = data.editParameterData;
    this.commonMethodService.selectedPaymentStatus = [
      { id: 1, itemName: "Success" },
    ];
    this.commonMethodService.selectedAmountType = [
      { id: -1, itemName: "Total Amount" },
    ];
    if (selectedParameterSearchFilter) {
      this.columnName = selectedParameterSearchFilter.columnName;
      this.reportQueryId = selectedParameterSearchFilter.reportQueryId;
      this.columnNo = selectedParameterSearchFilter.columnNo;
      this.amountType = selectedParameterSearchFilter.amountType;
      this.transactionType = selectedParameterSearchFilter.transactionType;
      this.commonMethodService.selectedPaymentTypes =
        selectedParameterSearchFilter.paymentTypes;
      this.commonMethodService.minValue =
        selectedParameterSearchFilter.minAmount;
      this.commonMethodService.maxValue =
        selectedParameterSearchFilter.maxAmount;
      this.commonMethodService.selectedPaymentReasons =
        selectedParameterSearchFilter.paymentReason;
      this.commonMethodService.selectedPaymentCollectors =
        selectedParameterSearchFilter.collectors;
      this.commonMethodService.selectedPaymentLocations =
        selectedParameterSearchFilter.locations;
      this.commonMethodService.selectedFromCampaignList =
        selectedParameterSearchFilter.campaigns;
      this.commonMethodService.selectedPaymentStatus =
        selectedParameterSearchFilter.paymentStatus;
      this.commonMethodService.selectedAmountType =
        selectedParameterSearchFilter.amountType;
      if (this.transactionType == 2 || this.transactionType == 3) {
        this.isPledge = true;
        this.isPayment = false;
        this.isSchedule = false;
        this.isTotal = false;
      }
      if (this.transactionType == 6) {
        this.selectedTotalDropdown =
          selectedParameterSearchFilter.totalDropdown;
        this.isPledge = false;
        this.isPayment = false;
        this.isSchedule = false;
        this.isTotal = true;
      }
      if (this.transactionType == 4 || this.transactionType == 5) {
        this.isSchedule = true;
        this.isPayment = false;
        this.isPledge = false;
        this.isTotal = false;
      } else {
        // for issue comments this
        // this.isPledge = false;
        // this.isSchedule = false;
        // this.isPayment = true;
        // this.isTotal=false;
      }
      0;
      if (
        selectedParameterSearchFilter.startDate != null &&
        selectedParameterSearchFilter.endDate != null
      ) {
        this.selectedDateRange = {
          startDate: moment(selectedParameterSearchFilter.startDate),
          endDate: moment(selectedParameterSearchFilter.endDate),
        };
      }
    }
    if (data.isButtonGenerate) {
      this.buttonName = "Update";
      //this.isPledge=false;
      this.headerTitle = "Update Data Set";
    } else {
      this.buttonName = "Add";
      this.clearFilter();
      this.commonMethodService.selectedPaymentStatus = [
        { id: 1, itemName: "Success" },
      ];
      this.commonMethodService.selectedAmountType = [
        { id: -1, itemName: "Total Amount" },
      ];
    }
  }
  @Input() set ColumnList(data: any) {
    if (data) {
      this.columnNameList = data;
    }
  }

  @Input() set baseColumn(data: any) {
    if (data) {
      this.selectedBaseCol = data;
    }
  }

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.bindData();
    this.totalDropdown = [
      { id: 1, itemName: "Payments" },
      { id: 2, itemName: "Open Pledges" },
      { id: 3, itemName: "Pending Schedules" },
      { id: 4, itemName: "Total" },
    ];
  }
  closePopup() {
    this.activeModal.dismiss();
  }
  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    );
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }
  DeSelectAllTotal(data) {
    this.selectedTotalDropdown = [{ id: 4, itemName: "Total" }];
  }
  DeSelectItem(data) {
    if (data && data.id == 4) {
      this.selectedTotalDropdown = [{ id: 4, itemName: "Total" }];
    }
  }
  datesUpdated(event) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.startDate;
    this.endDate = this.selectedDateRange.endDate;
  }

  transactionTypeChange(value) {
    if (value == "2" || value == "3") {
      this.isPledge = true;
      this.isTotal = false;
      this.isPayment = false;
      this.isCompare = false;
      this.isSchedule = false;
      this.compareColumn1 = "-1";
      this.compareColumn2 = "-1";
    }
    if (value == "4" || value == "5") {
      this.isSchedule = true;
      this.isPledge = false;
      this.isTotal = false;
      this.isPayment = false;
      this.isCompare = false;
      this.compareColumn1 = "-1";
      this.compareColumn2 = "-1";
    } else if (value == "0") {
      this.isCompare = true;
      this.isPledge = false;
      this.isTotal = false;
      this.isPayment = false;
      this.isSchedule = false;
    } else if (value == "1") {
      this.isPledge = false;
      this.isPayment = true;
      this.isTotal = false;
      this.isCompare = false;
      this.isSchedule = false;
      this.compareColumn1 = "-1";
      this.compareColumn2 = "-1";
    }
    if (value == "6") {
      this.isTotal = true;
      this.isPayment = false;
      this.isCompare = false;
      this.isSchedule = false;
      this.isPledge = false;
      this.compareColumn1 = "-1";
      this.compareColumn2 = "-1";
    }
  }
  searchReportData() {
    if (
      this.commonMethodService.minValue != null &&
      this.commonMethodService.maxValue != null &&
      this.commonMethodService.minValue > this.commonMethodService.maxValue
    ) {
      this.greaterThanValidate = true;
      return;
    }

    this.greaterThanValidate = false;
    if (
      this.isPledge &&
      this.commonMethodService.minBalanceValue != null &&
      this.commonMethodService.maxBalanceValue != null &&
      this.commonMethodService.minBalanceValue >
        this.commonMethodService.maxBalanceValue
    ) {
      this.greaterThanBalanceValidate = true;
      return;
    }

    this.greaterThanBalanceValidate = false;

    this.searchReport();
  }

  searchReport() {
    var objAdvancedSearch = {
      transactionType: this.transactionType,
      columnName: this.columnName,
      reportQueryId: this.reportQueryId,
      totalDropdown: this.selectedTotalDropdown,
      //"amountType" :this.amountType,
      paymentTypes:
        this.isIncludePaymentType == true ||
        this.isIncludePaymentType == undefined
          ? this.commonMethodService.selectedPaymentTypes
          : null,
      minAmount:
        this.isIncludeAmountRange == true ||
        this.isIncludeAmountRange == undefined
          ? this.commonMethodService.minValue
          : null,
      maxAmount:
        this.isIncludeAmountRange == true ||
        this.isIncludeAmountRange == undefined
          ? this.commonMethodService.maxValue
          : null,
      paymentReason:
        this.isIncludeReason == true || this.isIncludeReason == undefined
          ? this.commonMethodService.selectedPaymentReasons
          : null,
      collectors:
        this.isIncludeCollector == true || this.isIncludeCollector == undefined
          ? this.commonMethodService.selectedPaymentCollectors
          : null,
      locations:
        this.isIncludeLocation == true || this.isIncludeLocation == undefined
          ? this.commonMethodService.selectedPaymentLocations
          : null,
      campaigns:
        this.isIncludeCampaign == true || this.isIncludeCampaign == undefined
          ? this.commonMethodService.selectedFromCampaignList
          : null,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
      paymentStatus:
        this.isIncludePaymentStatus == true ||
        this.isIncludePaymentStatus == undefined
          ? this.commonMethodService.selectedPaymentStatus
          : null,
      scheduleStatus: this.commonMethodService.selectedScheduleStatus,
      amountType:
        this.isIncludeAmountType == true ||
        this.isIncludeAmountType == undefined
          ? this.commonMethodService.selectedAmountType
          : null,
      compareColumn1: this.compareColumn1,
      compareColumn2: this.compareColumn2,
      colNo: this.columnNo,
      selectedBaseCol: this.selectedBaseCol,
      minBalanceAmount:
        this.isIncludeBalanceRange == true ||
        this.isIncludeBalanceRange == undefined
          ? this.commonMethodService.minBalanceValue
          : null,
      maxBalanceAmount:
        this.isIncludeBalanceRange == true ||
        this.isIncludeBalanceRange == undefined
          ? this.commonMethodService.maxBalanceValue
          : null,
    };

    this.emtOutputSearchFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
  }

  OnCheckBoxChange(event, value) {
    if (event.target.checked) {
      if (value == "PaymentType") {
        this.isIncludePaymentType = true;
        $("#chckPaymentType").removeClass("exclude_chckbox");
      }
      if (value == "AmountRange") {
        this.isIncludeAmountRange = true;
        $("#chckAmtRange").removeClass("exclude_chckbox");
      }
      if (value == "BalanceRange") {
        this.isIncludeBalanceRange = true;
        $("#chckBalRange").removeClass("exclude_chckbox");
      }
      if (value == "Date") {
        this.isIncludeDate = true;
        $("#chckDate").removeClass("exclude_chckbox");
      }
      if (value == "Reason") {
        this.isIncludeReason = true;
        $("#chckReason").removeClass("exclude_chckbox");
      }
      if (value == "Collector") {
        this.isIncludeCollector = true;
        $("#chckCollector").removeClass("exclude_chckbox");
      }
      if (value == "Location") {
        this.isIncludeLocation = true;
        $("#chckLocation").removeClass("exclude_chckbox");
      }
      if (value == "Campaign") {
        this.isIncludeCampaign = true;
        $("#chckCampaign").removeClass("exclude_chckbox");
      }
      if (value == "PaymentStatus") {
        this.isIncludePaymentStatus = true;
        $("#chckPaymentStatus").removeClass("exclude_chckbox");
      }
      if (value == "AmountType") {
        this.isIncludeAmountType = true;
        $("#chckAmtType").removeClass("exclude_chckbox");
      }
    } else {
      if (value == "PaymentType") {
        this.isIncludePaymentType = false;
        $("#chckPaymentType").addClass("exclude_chckbox");
      }
      if (value == "AmountRange") {
        this.isIncludeAmountRange = false;
        $("#chckAmtRange").addClass("exclude_chckbox");
      }
      if (value == "BalanceRange") {
        this.isIncludeBalanceRange = false;
        $("#chckBalRange").addClass("exclude_chckbox");
      }
      if (value == "Date") {
        this.isIncludeDate = false;
        $("#chckDate").addClass("exclude_chckbox");
      }
      if (value == "Reason") {
        this.isIncludeReason = false;
        $("#chckReason").addClass("exclude_chckbox");
      }

      if (value == "Collector") {
        this.isIncludeCollector = false;
        $("#chckCollector").addClass("exclude_chckbox");
      }
      if (value == "Location") {
        this.isIncludeLocation = false;
        $("#chckLocation").addClass("exclude_chckbox");
      }
      if (value == "Campaign") {
        this.isIncludeCollector = false;
        $("#chckCampaign").addClass("exclude_chckbox");
      }
      if (value == "PaymentStatus") {
        this.isIncludePaymentType = false;
        $("#chckPaymentStatus").addClass("exclude_chckbox");
      }
      if (value == "AmountType") {
        this.isIncludeAmountType = false;
        $("#chckAmtType").addClass("exclude_chckbox");
      }
    }
  }

  clearFilter() {
    this.commonMethodService.resetCommonDropDownList();

    this.commonMethodService.minValue = null;
    this.commonMethodService.maxValue = null;
    this.columnName = null;
    this.compareColumn1 = "-1";
    this.compareColumn2 = "-1";
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;

    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "reportDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ReportFilter" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.startDate = this.selectedDateRange.startDate;
          this.endDate = this.selectedDateRange.endDate;
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
