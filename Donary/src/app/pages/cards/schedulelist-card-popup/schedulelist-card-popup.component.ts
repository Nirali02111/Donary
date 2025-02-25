import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
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
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { ScheduleService } from "src/app/services/schedule.service";
import Swal from "sweetalert2";
import { TransactionAdvancedFilterPopupComponent } from "../../transaction/transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { DonorCardPopupComponent } from "../donor-card-popup/donor-card-popup.component";
import { SchedulePaymentCardPopupComponent } from "../schedule-card-popup/schedule-paymentcard-popup.component";
import { SchedulePledgecardPopupComponent } from "../schedule-card-popup/schedule-pledgecard-popup/schedule-pledgecard-popup.component";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-schedulelist-card-popup",
  templateUrl: "./schedulelist-card-popup.component.html",
  styleUrls: ["./schedulelist-card-popup.component.scss"],
  standalone: false,
})
export class SchedulelistCardPopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerPaymentDirective: DaterangepickerDirective;
  // selectedPaymentDateRange: any = { startDate: null, endDate: null };
  @Input("selectedPaymentDateRange") selectedPaymentDateRange?: any;

  @ViewChild(DaterangepickerDirective, { static: false })
  pickerPledgeDirective: DaterangepickerDirective;
  // selectedPledgeDateRange: any = { startDate: null, endDate: null };

  @Input("selectedPledgeDateRange") selectedPledgeDateRange?: any;

  gridPaymentFilterData: any = [];
  gridPaymentData: any = [];
  gridPledgeFilterData: any = [];
  gridPledgeData: any = [];
  isloading = true;
  accountId: number;
  reasonId: number;
  collectorId: number;
  campaignId: number;
  locationId: number;
  deviceId: number;
  PageName: any = "ScheduleListCardPopup";
  PledgePageName: any = "ScheduleListCardPopupPledge";
  isOneDate: any = false;
  modalOptions: NgbModalOptions;
  window_class = "drag_popup donor_card father_card";
  isPaymentDateCreatedColVisible: boolean = true;
  isPaymentScheduleNumColVisible: boolean = true;
  isPaymentOpenAmtColVisible: boolean = true;
  isPaymentTotalAmountColVisible: boolean = true;
  isPaymentLeftColVisible: boolean = true;
  isPaymentNextColVisible: boolean = true;
  isPaymentStatusColVisible: boolean = true;
  skeletonitems = [{}, {}, {}, {}];
  skeletonitems2 = [{}, {}, {}, {}, {}, {}, {}];
  // Payment other fields
  isPaymentNameColVisible: boolean = true; //changes
  isPaymentReasonNameColVisible: boolean = true; //changes
  isPaymentCampaignColVisible: boolean = true; //changes
  isPaymentLocationNameColVisible: boolean = false;
  isPaymentCollectorColVisible: boolean = false;
  isPaymentSourceColVisible: boolean = false;

  isPledgeDateCreatedColVisible: boolean = true;
  isPledgeScheduleNumColVisible: boolean = true;
  isPledgeOpenAmtColVisible: boolean = true;
  isPledgeTotalAmountColVisible: boolean = true;
  isPledgeLeftColVisible: boolean = true;
  isPledgeNextColVisible: boolean = true;
  isPledgeStatusColVisible: boolean = true;
  popTitle: any;

  // Pledge other fields
  isPledgeNameColVisible: boolean = false;
  isPledgeReasonNameColVisible: boolean = false;
  isPledgeCampaignColVisible: boolean = false;
  isPledgeLocationNameColVisible: boolean = false;
  isPledgeCollectorColVisible: boolean = false;
  isPledgeSourceColVisible: boolean = false;

  // Date-range picker related properties
  open: string = "left";
  drop: string = "down";
  showClearButton: boolean = true;
  alwaysShowCalendars: boolean = true;
  placeholder: string = "All time";
  showCustomRangeLabel: boolean = true;
  linkedCalendars: boolean = true;
  objAdvancedSearch: any = {
    scheduleStatus: [{ id: 1, itemName: "Scheduled" }],
  };

  objPledgeAdvancedSearch: any = {
    scheduleStatus: [{ id: 1, itemName: "Scheduled" }],
  };

  isinitialize: number = 0;
  isPledgeinitialize: number = 0;
  paymentPage = 1;
  paymentPageSize = 5;
  pledgePage = 1;
  pledgePageSize = 5;
  showArrow = false;
  showPArrow = false;
  filtercount: number = 1;

  @Output() emtOutputScheduleListCardData: EventEmitter<any> =
    new EventEmitter();
  @Output() emtOutputScheduleCloseCard: EventEmitter<any> = new EventEmitter();
  private PaymentcalendarSubscription: Subscription;
  private PledgecalendarSubscription: Subscription;
  @Input() set ScheduleCardListData(ScheduleListCardValue: any) {
    if (ScheduleListCardValue) {
      this.setValue(ScheduleListCardValue);
    } else {
      this.gridPaymentData = null;
      this.gridPaymentFilterData = this.gridPaymentFilterData;
      this.gridPledgeData = null;
      this.gridPledgeFilterData = this.gridPledgeFilterData;
    }
    this.isloading = false;
  }
  @Input() set AccountId(accountId: number) {
    this.accountId = accountId;
    this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
      (o) => o.sortName !== "nameId"
    );
    this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
      (o) => o.sortName !== "nameId"
    );
  }
  @Input() set ReasonId(reasonId: any) {
    if (reasonId) {
      this.reasonId = reasonId;
      this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
        (o) => o.sortName !== "reasonId"
      );
      this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
        (o) => o.sortName !== "reasonId"
      );
    }
  }
  @Input() set CollectorId(collectorId: any) {
    if (collectorId) {
      this.collectorId = collectorId;
      this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
        (o) => o.sortName !== "collectorId"
      );
      this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
        (o) => o.sortName !== "collectorId"
      );
    }
  }

  @Input() set CampaignId(campaignId: any) {
    if (campaignId) {
      this.campaignId = campaignId;
      this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
        (o) => o.sortName !== "campaignId"
      );
      this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
        (o) => o.sortName !== "campaignId"
      );
    }
  }
  @Input() set LocationId(locationId: any) {
    if (locationId) {
      this.locationId = locationId;
      this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
        (o) => o.sortName !== "locationId"
      );
      this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
        (o) => o.sortName !== "locationId"
      );
    }
  }
  @Input() set DeviceId(deviceId: any) {
    if (deviceId) {
      this.deviceId = deviceId;
      this.colFieldsPaymentList = this.colFieldsPaymentList.filter(
        (o) => o.sortName !== "deviceId"
      );
      this.colFieldsPledgeList = this.colFieldsPledgeList.filter(
        (o) => o.sortName !== "deviceId"
      );
    }
  }

  colFieldsPaymentList: any = [
    {
      colName: "NAME",
      visibleCondition: this.isPaymentNameColVisible,
      sortName: "nameId",
      colId: "p8",
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isPaymentCampaignColVisible,
      sortName: "campaignIds",
      colId: "p10",
    },
    {
      colName: "REASON",
      visibleCondition: this.isPaymentReasonNameColVisible,
      sortName: "reasonId",
      colId: "p9",
    },
    {
      colName: "SCHEDULE#",
      visibleCondition: this.isPaymentScheduleNumColVisible,
      sortName: "scheduleNum",
      colId: "p1",
    },
    {
      colName: "DATECREATED",
      visibleCondition: this.isPaymentDateCreatedColVisible,
      sortName: "createdDate",
      colId: "p2",
    },
    {
      colName: "TOTALAMOUNT",
      visibleCondition: this.isPaymentTotalAmountColVisible,
      sortName: "totalAmount",
      colId: "p3",
    },
    {
      colName: "OPENAMOUNT",
      visibleCondition: this.isPaymentOpenAmtColVisible,
      sortName: "openAmount",
      colId: "p4",
    },
    {
      colName: "PAYMENTSLEFT",
      visibleCondition: this.isPaymentLeftColVisible,
      sortName: "paymentsLeft",
      colId: "p5",
    },
    {
      colName: "NEXTPAYMENT",
      visibleCondition: this.isPaymentNextColVisible,
      sortName: "nextScheduleDate",
      colId: "p6",
    },
    {
      colName: "STATUS",
      visibleCondition: this.isPaymentStatusColVisible,
      sortName: "scheduleStatus",
      colId: "p7",
    },

    {
      colName: "LOCATION",
      visibleCondition: this.isPaymentLocationNameColVisible,
      sortName: "locationId",
      colId: "p11",
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isPaymentCollectorColVisible,
      sortName: "collectorId",
      colId: "p12",
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isPaymentSourceColVisible,
      sortName: "deviceId",
      colId: "p13",
    },
  ];

  colFieldsPledgeList: any = [
    {
      colName: "SCHEDULE#",
      visibleCondition: this.isPledgeScheduleNumColVisible,
      sortName: "scheduleNum",
      colId: "pg1",
    },
    {
      colName: "DATECREATED",
      visibleCondition: this.isPledgeDateCreatedColVisible,
      sortName: "createdDate",
      colId: "pg2",
    },
    {
      colName: "TOTALAMOUNT",
      visibleCondition: this.isPledgeTotalAmountColVisible,
      sortName: "totalAmount",
      colId: "pg3",
    },
    {
      colName: "OPENAMOUNT",
      visibleCondition: this.isPledgeOpenAmtColVisible,
      sortName: "openAmount",
      colId: "pg4",
    },
    {
      colName: "PLEDGELEFT",
      visibleCondition: this.isPledgeLeftColVisible,
      sortName: "paymentsLeft",
      colId: "pg5",
    },
    {
      colName: "NEXTPLEDGE",
      visibleCondition: this.isPledgeNextColVisible,
      sortName: "nextScheduleDate",
      colId: "pg6",
    },
    {
      colName: "STATUS",
      visibleCondition: this.isPledgeStatusColVisible,
      sortName: "scheduleStatus",
      colId: "pg7",
    },

    {
      colName: "NAME",
      visibleCondition: this.isPledgeNameColVisible,
      sortName: "nameId",
      colId: "pg8",
    },
    {
      colName: "REASON",
      visibleCondition: this.isPledgeReasonNameColVisible,
      sortName: "reasonId",
      colId: "pg9",
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isPledgeCampaignColVisible,
      sortName: "campaignId",
      colId: "pg10",
    },
    {
      colName: "LOCATION",
      visibleCondition: this.isPledgeLocationNameColVisible,
      sortName: "locationId",
      colId: "pg11",
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isPledgeCollectorColVisible,
      sortName: "collectorId",
      colId: "pg12",
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isPledgeSourceColVisible,
      sortName: "deviceId",
      colId: "pg13",
    },
  ];

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  constructor(
    private localstoragedataService: LocalstoragedataService,
    public commonService: CommonMethodService,
    public activeModal: NgbActiveModal,
    private cardService: CardService,
    public commonMethodService: CommonMethodService,
    private collectorService: CollectorService,
    private scheduleService: ScheduleService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        start: (event, ui) => {
          // Find the parent modal element
          let parentModal = ui.helper.closest(".modal");
          // Remove 'modal-position' and add 'modal-position-drag'
          parentModal
            .removeClass("modal-position")
            .addClass("modal-position-drag");
        },
        handle: ".modal__custom_header",
      });
    });
  }

  setPaymentGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        this.isPaymentScheduleNumColVisible = isVisible;
        break;
      case "datecreated":
        this.isPaymentDateCreatedColVisible = isVisible;
        break;
      case "totalamount":
        this.isPaymentTotalAmountColVisible = isVisible;
        break;
      case "openamount":
        this.isPaymentOpenAmtColVisible = isVisible;
        break;
      case "paymentleft":
        this.isPaymentLeftColVisible = isVisible;
        break;
      case "nextpayment":
        this.isPaymentNextColVisible = isVisible;
        break;
      case "status":
        this.isPaymentStatusColVisible = isVisible;
        break;
      case "name":
        this.isPaymentNameColVisible = isVisible;
        break;
      case "reason":
        this.isPaymentReasonNameColVisible = isVisible;
        break;
      case "campaign":
        this.isPaymentCampaignColVisible = isVisible;
        break;
      case "location":
        this.isPaymentLocationNameColVisible = isVisible;
        break;
      case "collector":
        this.isPaymentCollectorColVisible = isVisible;
        break;
      case "source":
        this.isPaymentSourceColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkPaymentGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        return this.isPaymentScheduleNumColVisible;
      case "datecreated":
        return this.isPaymentDateCreatedColVisible;
      case "totalamount":
        return this.isPaymentTotalAmountColVisible;
      case "openamount":
        return this.isPaymentOpenAmtColVisible;
      case "paymentleft":
        return this.isPaymentLeftColVisible;
      case "nextpayment":
        return this.isPaymentNextColVisible;
      case "status":
        return this.isPaymentStatusColVisible;
      case "name":
        return this.isPaymentNameColVisible;
      case "reason":
        return this.isPaymentReasonNameColVisible;
      case "campaign":
        return this.isPaymentCampaignColVisible;
      case "location":
        return this.isPaymentLocationNameColVisible;
      case "collector":
        return this.isPaymentCollectorColVisible;
      case "source":
        return this.isPaymentSourceColVisible;
    }
  }

  setPledgeGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        this.isPledgeScheduleNumColVisible = isVisible;
        break;
      case "datecreated":
        this.isPledgeDateCreatedColVisible = isVisible;
        break;
      case "totalamount":
        this.isPledgeTotalAmountColVisible = isVisible;
        break;
      case "openamount":
        this.isPledgeOpenAmtColVisible = isVisible;
        break;
      case "pledgeleft":
        this.isPledgeLeftColVisible = isVisible;
        break;
      case "nextpledge":
        this.isPledgeNextColVisible = isVisible;
        break;
      case "status":
        this.isPledgeStatusColVisible = isVisible;
        break;
      case "name":
        this.isPledgeNameColVisible = isVisible;
        break;
      case "reason":
        this.isPledgeReasonNameColVisible = isVisible;
        break;
      case "campaign":
        this.isPledgeCampaignColVisible = isVisible;
        break;
      case "location":
        this.isPledgeLocationNameColVisible = isVisible;
        break;
      case "collector":
        this.isPledgeCollectorColVisible = isVisible;
        break;
      case "source":
        this.isPledgeSourceColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkPledgesGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "schedule#":
        return this.isPledgeScheduleNumColVisible;
      case "datecreated":
        return this.isPledgeDateCreatedColVisible;
      case "totalamount":
        return this.isPledgeTotalAmountColVisible;
      case "openamount":
        return this.isPledgeOpenAmtColVisible;
      case "pledgeleft":
        return this.isPledgeLeftColVisible;
      case "nextpledge":
        return this.isPledgeNextColVisible;
      case "status":
        return this.isPledgeStatusColVisible;
      case "name":
        return this.isPledgeNameColVisible;
      case "reason":
        return this.isPledgeReasonNameColVisible;
      case "campaign":
        return this.isPledgeCampaignColVisible;
      case "location":
        return this.isPledgeLocationNameColVisible;
      case "collector":
        return this.isPledgeCollectorColVisible;
      case "source":
        return this.isPledgeSourceColVisible;
    }
  }

  dropPaymentFields(event: CdkDragDrop<string[]>) {
    // var $table = $('table.redesign_table');
    moveItemInArray(
      this.colFieldsPaymentList,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.gridPaymentFilterData,
      event.previousIndex,
      event.currentIndex
    );
    // $table.floatThead('reflow');
  }

  dropPaymentColumn(event: CdkDragDrop<string[]>) {
    // var $table = $('table.redesign_table');
    moveItemInArray(
      this.colFieldsPaymentList,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.gridPaymentFilterData,
      event.previousIndex,
      event.currentIndex
    );

    //  $table.floatThead('reflow');
  }

  dropPledgeFields(event: CdkDragDrop<string[]>) {
    // var $table = $('table.redesign_table');

    moveItemInArray(
      this.colFieldsPledgeList,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.gridPledgeFilterData,
      event.previousIndex,
      event.currentIndex
    );
    // $table.floatThead('reflow');
  }

  dropPledgeColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.colFieldsPledgeList,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.gridPledgeFilterData,
      event.previousIndex,
      event.currentIndex
    );
    //  var $table = $('table.redesign_table');
    //  $table.floatThead('reflow');
  }

  datesPaymentUpdated(event) {
    this.selectedPaymentDateRange = event;
    if (this.isinitialize == 1) {
      this.searchPaymentListData();
    }
    this.isinitialize = 1;
  }
  CalendarPaymentFocus() {
    this.pickerPaymentDirective.open();
  }

  ChangePaymentPageSize(val, className) {
    $("#paypage_id5").removeClass("active");
    $("#paypage_id10").removeClass("active");
    $("#paypage_id15").removeClass("active");
    this.paymentPageSize = val;
    $("#" + className).addClass("active");
    if (this.gridPaymentFilterData.length / this.paymentPageSize <= 1) {
      this.showPArrow = false;
    } else {
      this.showPArrow = true;
    }
  }

  ChangePageSize(val, className) {
    $("#page_id5").removeClass("active");
    $("#page_id10").removeClass("active");
    $("#page_id15").removeClass("active");
    this.pledgePageSize = val;
    $("#" + className).addClass("active");
    if (this.gridPledgeFilterData.length / this.pledgePageSize <= 1) {
      this.showArrow = false;
    } else {
      this.showArrow = true;
    }
  }

  datesPledgeUpdated(event) {
    this.selectedPledgeDateRange = event;
    if (this.isPledgeinitialize == 1) {
      this.searchPledgeListData();
    }
    this.isPledgeinitialize = 1;
  }

  CalendarPledgeFocus() {
    this.pickerPledgeDirective.open();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.emtOutputScheduleCloseCard.emit(true);
  }
  setValue(data: any) {
    if (data) {
      data.forEach((s) => {
        if (s.scheduleStatus == "Canceled") {
          s.status_class = "schdl_canceled";
        } else if (s.scheduleStatus == "Completed") {
          s.status_class = "schdl_completed";
        } else if (s.scheduleStatus == "Failed") {
          s.status_class = "schdl_failed";
        } else if (s.scheduleStatus == "Pending") {
          s.status_class = "schdl_pending";
        } else if (s.scheduleStatus == "Scheduled") {
          s.status_class = "schdl_scheduled";
        } else if (s.scheduleStatus == "Running") {
          s.status_class = "schdl_running";
        }
      });
    }
    this.gridPaymentData = data.filter((x) => x.scheduleType == "Payment");
    this.gridPaymentFilterData = this.gridPaymentData.filter(
      (x) => x.scheduleStatus == "Scheduled"
    );
    this.gridPledgeData = data.filter((x) => x.scheduleType == "Pledge");
    this.gridPledgeFilterData = this.gridPledgeData.filter(
      (x) => x.scheduleStatus == "Scheduled"
    );
    this.showPArrow = this.gridPaymentFilterData.length <= 5 ? false : true;
    this.showArrow = this.gridPledgeFilterData.length <= 5 ? false : true;
    this.isloading = false;
  }

  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search payment-list-donar",
    };
    const modalRef = this.commonService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isScheduleTab = true;
    modalRef.componentInstance.isListPage = true;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;

    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;

        this.filtercount = 0;
        for (let key of Object.keys(this.objAdvancedSearch)) {
          let filtervalue = this.objAdvancedSearch[key];
          if (
            filtervalue == undefined ||
            filtervalue.length == 0 ||
            !filtervalue
          ) {
          } else {
            if (key == "isBatchClicked" || key == "batchNum") {
              if (
                (key == "isBatchClicked" && filtervalue) ||
                (key == "batchNum" && filtervalue)
              ) {
                this.filtercount += 1;
              }
            } else {
              this.filtercount += 1;
            }
          }
        }

        this.filterPaymentLocalData();
        //this.localSumCalCulation()
      }
    );
  }

  openPledgeAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search payment-list-donar",
    };
    const modalRef = this.commonService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isScheduleTab = true;
    modalRef.componentInstance.isListPage = true;
    modalRef.componentInstance.AdvancedFilterData =
      this.objPledgeAdvancedSearch;

    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objPledgeAdvancedSearch = objResponse;
        //this.selectedChipType = null;
        // this.isFiltered = false;
        this.filtercount = 0;
        for (let key of Object.keys(this.objPledgeAdvancedSearch)) {
          let filtervalue = this.objPledgeAdvancedSearch[key];
          if (filtervalue == undefined || filtervalue.length == 0) {
          } else {
            if (key == "isBatchClicked" || key == "batchNum") {
              if (
                (key == "isBatchClicked" && filtervalue) ||
                (key == "batchNum" && filtervalue)
              ) {
                this.filtercount += 1;
              }
            } else {
              this.filtercount += 1;
            }
          }
        }
        this.filterPledgeLocalData();

        //this.localSumCalCulation()
      }
    );
  }

  filterPaymentLocalData(data = this.gridPaymentData) {
    this.gridPaymentFilterData = data.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      return this.inAllFields(o);
    });
  }

  filterPledgeLocalData(data = this.gridPledgeData) {
    this.gridPledgeFilterData = data.filter((o) => {
      if (!this.objPledgeAdvancedSearch) {
        return true;
      }
      return this.inPledgeAllFields(o);
    });
  }

  inAllFields(o) {
    return this.inArray(
      this.objAdvancedSearch.scheduleStatus,
      o.scheduleStatus
    );
  }
  inPledgeAllFields(o) {
    return this.inArray(
      this.objPledgeAdvancedSearch.scheduleStatus,
      o.scheduleStatus
    );
  }
  inArray(filterKeyArray: Array<{ itemName: any }> | null, rowFieldValue: any) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const result = filterKeyArray.find((d) => d.itemName == rowFieldValue);
    if (result) {
      return true;
    }
    return false;
  }

  searchPaymentListData() {
    this.isloading = true;
    var objScheduleCard = {};
    if (this.collectorId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        collectorId: this.collectorId,
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.collectorService
        .getCollectorScheduleList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.campaignId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        CampaignIds: [this.campaignId],
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.locationId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locations: [this.locationId],
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.deviceId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        deviceIds: [this.deviceId],
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.reasonId == undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: this.accountId,
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };

      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        ReasonIds: [this.reasonId],
        dateFrom:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPaymentDateRange.startDate != null
            ? moment(this.selectedPaymentDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };

      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Payment"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    }
  }

  searchPledgeListData() {
    this.isloading = true;
    var objScheduleCard = {};
    if (this.collectorId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        collectorId: this.collectorId,
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.collectorService
        .getCollectorScheduleList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPledgeData = res.filter((x) => x.scheduleType == "Pledge");
            this.gridPledgeData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPledgeFilterData = this.gridPledgeData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.campaignId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        CampaignIds: [this.campaignId],
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Pledge"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.locationId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locations: [this.locationId],
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Pledge"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.deviceId != undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        deviceIds: [this.deviceId],
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPaymentData = res.filter(
              (x) => x.scheduleType == "Pledge"
            );
            this.gridPaymentData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPaymentFilterData = this.gridPaymentData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.reasonId == undefined) {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: this.accountId,
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPledgeData = res.filter((x) => x.scheduleType == "Pledge");
            this.gridPledgeData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPledgeFilterData = this.gridPledgeData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    } else {
      objScheduleCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        ReasonIds: [this.reasonId],
        dateFrom:
          this.selectedPledgeDateRange.startDate != null
            ? moment(this.selectedPledgeDateRange.startDate).format(
                "YYYY-MM-DD"
              )
            : null,
        dateTo:
          this.selectedPledgeDateRange.endDate != null
            ? moment(this.selectedPledgeDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };

      this.scheduleService
        .getSchedulePaymentPledgeList(objScheduleCard)
        .subscribe((res: any) => {
          if (res) {
            this.gridPledgeData = res.filter((x) => x.scheduleType == "Pledge");
            this.gridPledgeData.forEach((s) => {
              if (s.scheduleStatus == "Canceled") {
                s.status_class = "schdl_canceled";
              } else if (s.scheduleStatus == "Completed") {
                s.status_class = "schdl_completed";
              } else if (s.scheduleStatus == "Failed") {
                s.status_class = "schdl_failed";
              } else if (s.scheduleStatus == "Pending") {
                s.status_class = "schdl_pending";
              } else if (s.scheduleStatus == "Scheduled") {
                s.status_class = "schdl_scheduled";
              } else if (s.scheduleStatus == "Running") {
                s.status_class = "schdl_running";
              }
            });
            this.gridPledgeFilterData = this.gridPledgeData;
          } else {
            this.gridPaymentData = null;
            this.gridPaymentFilterData = null;
            this.gridPledgeData = null;
            this.gridPledgeFilterData = null;
          }
          this.isloading = false;
        });
    }
  }

  searchPayment(keyword) {
    this.isloading = true;
    var record = this.gridPaymentData;
    var filterdRecord;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.totalAmount &&
              obj.totalAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentsLeft &&
              obj.paymentsLeft.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleNum &&
              obj.scheduleNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.openAmount &&
              obj.openAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleStatus &&
              obj.scheduleStatus.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridPaymentFilterData = filterdRecord;
        record = this.gridPaymentFilterData;
        this.showPArrow = this.gridPaymentFilterData.length <= 5 ? false : true;
      }
    } else {
      this.gridPaymentFilterData = this.gridPaymentData;
    }
    this.isloading = false;
  }

  searchPledge(keyword) {
    this.isloading = true;
    var record = this.gridPledgeData;
    var filterdRecord;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.totalAmount &&
              obj.totalAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentsLeft &&
              obj.paymentsLeft.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleNum &&
              obj.scheduleNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.openAmount &&
              obj.openAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduleStatus &&
              obj.scheduleStatus.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridPledgeFilterData = filterdRecord;
        record = this.gridPledgeFilterData;
        this.showArrow = this.gridPledgeFilterData.length <= 5 ? false : true;
      }
    } else {
      this.gridPledgeFilterData = this.gridPledgeData;
    }
    this.isloading = false;
  }

  openSchedulePledgeCardPopup(scheduleId) {
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
  }

  openSchedulePaymentCardPopup(scheduleId) {
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
  }
  ChangeShowEntriesDwn() {
    $(".dropwond-page").toggleClass("no-open");
    $(".btn-show-entries").toggleClass("active");
  }
  OpenDonorCard(accountID) {
    this.isloading = true;
    // this.navTabId= SecondCardId;
    this.window_class =
      "drag_popup donor_card father_card" +
      "_" +
      this.commonService.initialDonorCard;
    //  this.isloading = false;

    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: this.window_class,
    };
    this.commonService.initialDonorCard += 1;

    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      if (res) {
        const modalRef = this.commonService.openPopup(
          DonorCardPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.AccountId = accountID;
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      } else {
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
  checkLenDonorName(donorJewish, donorName) {
    if (donorJewish) {
      return donorJewish.length > 10 ? true : false;
    } else if (donorName) {
      return donorName.length > 10 ? true : false;
    }
  }

  // openHebrewCalendarPopup(type) {
  //  this.commonMethodService.openCalendarPopup(this.class_id, this.class_hid, this.selectedPaymentDateRange,false,'scheduleListDynamicsCalender');
  //  this.commonMethodService.getCalendarArray().subscribe(items => {
  //   if(items &&  items.pageName=="ScheduleListCardPopup" && this.commonMethodService.isCalendarClicked == true){
  //     this.commonMethodService.isCalendarClicked = false
  //    if (this.popContent) {
  //      this.popContent.close();
  //    }
  //    this.EngHebCalPlaceholder = this.hebrewEngishCalendarService.EngHebCalPlaceholder
  //    if(type == "payment"){
  //      this.selectedPaymentDateRange = items.obj;
  //      this.searchPaymentListData();
  //      return
  //    }
  //    if(type == "pledge"){
  //      this.selectedPledgeDateRange = items.obj;
  //      this.searchPledgeListData();
  //      return
  //    }
  //   }
  //   });
  // }

  openPaymentHebrewCalendarPopup(p: any) {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedPaymentDateRange,
      false,
      "scheduleListDynamicsCalender"
    );
    this.PaymentcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ScheduleListCardPopup" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.PaymentcalendarSubscription.unsubscribe();
          p.close();
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.selectedPaymentDateRange = items.obj;
          this.searchPaymentListData();
          return;
        }
      });
  }

  openPledgeHebrewCalendarPopup(p: any) {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedPaymentDateRange,
      false,
      "scheduleListDynamicsCalender"
    );
    this.PledgecalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ScheduleListCardPopupPledge" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.PledgecalendarSubscription.unsubscribe();
          p.close();
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;

          this.selectedPledgeDateRange = items.obj;
          this.searchPledgeListData();
          return;
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
