import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  AfterViewInit,
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
import { ReasonService } from "src/app/services/reason.service";
import * as XLSX from "xlsx";
import { ReasonCardPopupComponent } from "../../cards/reason-card-popup/reason-card-popup.component";
import { SaveReasonPopupComponent } from "../save-reason-popup/save-reason-popup.component";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import { ReasonFilterPopupComponent } from "../reason-filter-popup/reason-filter-popup.component";
import { CampaignService } from "src/app/services/campaign.service";
import { CampaignCardPopupComponent } from "./../../cards/campaign-card-popup/campaign-card-popup.component";
import Swal from "sweetalert2";
import { BulkReasonReportComponent } from "../bulk-reason-report/bulk-reason-report.component";
import { BulkEditreasonPopupComponent } from "../../cards/bulk-editreason-popup/bulk-editreason-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { Subject, Subscription, of } from "rxjs";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
import {
  CellClickEvent,
  ColumnDefinitionType,
} from "src/app/commons/modules/tabulator/interface";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { DataTable } from "src/app/commons/modules/data-table/DataTable";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

interface PanelRes {
  openPledges: number;
  payments: number;
  raised: number;
  scheduled: number;
  accountId: number;
  reasonId: number;
  campaignId: number;
  collectorId: number;
  deviceId: number;
  locationId: number;
  linkedCampaignID: number;
}

declare var $: any;

@Component({
  selector: "app-reason-list",
  templateUrl: "./reason-list.component.html",
  standalone: false,
  styleUrls: ["./reason-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasonListComponent implements OnInit, AfterViewInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DataTable, { static: false }) svTable: DataTable;

  @ViewChild(TabulatorTableComponent, { static: false })
  tabulatorComponent: TabulatorTableComponent;

  paymt_cls: string;
  objAdvancedSearch: any = {
    status: "",
    donorId: [],
    campaignId: [],
    locationId: [],
    collectorId: [],
    sourceId: [],
    linkedCampaignName: "",
  };
  isloading: boolean;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridOrgData: Array<any>;
  filtercount: number = 0;
  gridSumByData: Array<any>;
  gridShowPanelData: Array<any>;
  gridTotalPanelData: Array<any>;
  gridSelectedData: Array<any>;
  gridOrgTotalPanelData: Array<any>;
  paymentTypeChipData: Array<any>;
  selectedItem: any;
  linkedCampaignList: Array<any> = [];
  PageName: any = "ReasonList";
  isOneDate: any = false;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  isinitialize = 0;
  isChipTypeSelected: boolean = false;
  isFilterOpen: boolean = false;
  isSumCardOpen: boolean = false;
  popTitle: any;
  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  isTotalPanelVisible: boolean = false;
  isTotalPanelShowAll: boolean = true;

  isReasonIdColVisible: boolean = true;
  isReasonSortNumberColVisible: boolean = true;
  isReasonNameColVisible: boolean = true;
  isReasonEmailColVisible: boolean = true;
  isReasonPhone1ColVisible: boolean = true;
  isReasonPhone2ColVisible: boolean = true;
  isReasonGoalColVisible: boolean = true;
  isReasonRaisedColVisible: boolean = true;
  isReasonPercentageColVisible: boolean = true;
  isReasonlinkedCampaignNameColVisible: boolean = false;
  isParentReasonNameColVisible: boolean = false;
  isDonatePageUrlColVisible: boolean = false;
  // TotalPanelcheck
  isReasonPaymentsColVisible: boolean = false;
  isReasonOpenPledgesColVisible: boolean = false;
  isReasonScheduledColVisible: boolean = false;
  isReasonRaisedTColVisible: boolean = false;
  isReasonPledgesCountColVisible: boolean = false;
  isReasonPaymentsCountColVisible: boolean = false;
  isReasonScheduledCountColVisible: boolean = false;
  showTotalPanelPermission: boolean = this.localStorageDataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Reasons")
    .map((x) => x.isActive)[0];

  panelTitle: string = "SHOWTOTALPANEL";
  changeText = "";
  uiPageSettingId = null;
  uiPageSetting: any;
  fileName: string = "";
  colFields = [
    {
      id: 1,
      title: "",
      isTotalPanel: true,
      items: [
        {
          colName: "REASONNAME",
          isVisible: true,
          colId: "reasonNameId",
          sortName: "reasonName",
          disabled: false,
        },
        {
          colName: "REASON#",
          isVisible: true,
          colId: "reasonUrlTagId",
          sortName: "urlTag",
          disabled: false,
        },
        {
          colName: "GOAL",
          isVisible: true,
          colId: "reasonGoalId",
          sortName: "goal",
          disabled: false,
        },
        {
          colName: "PERCENTAGE",
          isVisible: true,
          colId: "reasonPercentageId",
          sortName: "percentage",
          disabled: false,
        },
        {
          colName: "EMAIL",
          isVisible: true,
          colId: "reasonEmailId",
          sortName: "email",
          disabled: false,
        },
        {
          colName: "HOMEPHONE",
          isVisible: true,
          colId: "reasonPhone1Id",
          sortName: "phone1",
          disabled: false,
        },
        {
          colName: "CELL",
          isVisible: true,
          colId: "reasonPhone2Id",
          sortName: "phone2",
          disabled: false,
        },
        {
          colName: "LINKEDCAMPAIGN",
          isVisible: false,
          colId: "reasonCampaignName",
          sortName: "linkedCampaignName",
          disabled: false,
        },
        {
          colName: "DONATEPAGEURL",
          isVisible: false,
          colId: "donatePageUrl",
          sortName: "donatePageUrl",
          disabled: false,
        },
        {
          colName: "PARENTREASON",
          isVisible: false,
          colId: "parentReasonName",
          sortName: "parentReasonName",
          disabled: false,
        },
      ],
    },
    {
      id: 2,
      title: "TOTALPANEL",
      isTotalPanel: false,
      class: "total_pnl_lbl",
      items: [
        {
          colName: "PAYMENTS",
          isVisible: true,
          colId: "reasonpaymentsId",
          sortName: "payments",
          disabled: true,
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: false,
          colId: "reasonpaymentscountId",
          sortName: "paymentsCount",
          disabled: true,
        },
        {
          colName: "OPENPLEDGES",
          isVisible: true,
          colId: "reasonopenPledgesId",
          sortName: "openPledges",
          disabled: true,
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: false,
          colId: "reasonpledgescountId",
          sortName: "pledgesCount",
          disabled: true,
        },
        {
          colName: "SCHEDULED",
          isVisible: true,
          colId: "reasonscheduledId",
          sortName: "scheduled",
          disabled: true,
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: false,
          colId: "reasonschedulescountId",
          sortName: "schedulesCount",
          disabled: true,
        },
        {
          colName: "TOTAL",
          isVisible: true,
          colId: "reasonraisedId",
          sortName: "raised",
          disabled: true,
        },
      ],
    },
  ];

  isClicked: Boolean = false;
  isOpen: Boolean = false;
  listSyncSubscription!: Subscription;

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  private calendarSubscription: Subscription;

  /**
   * Tabulator Integration
   */

  isTabulator = false;

  private _search$ = new Subject<void>();
  searchVal = "";

  filterQuery = [];

  selectedRows = [];

  columnNames: Array<ColumnDefinitionType> = [
    {
      title: "",
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      headerSort: false,
      headerHozAlign: "center",
      hozAlign: "center",
      width: 100,
    },
    {
      title: "REASONNAME",
      visible: true,
      field: "reasonName",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
      cssClass: "tabulator-class reason-with-jewish-name",
    },
    {
      title: "REASON#",
      visible: true,
      field: "urlTag",
      frozen: false,
      headerHozAlign: "center",
    },
    {
      title: "GOAL",
      visible: true,
      field: "goal",
      frozen: false,
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      headerHozAlign: "center",
    },
    {
      title: "PERCENTAGE",
      visible: true,
      field: "percentage",
      frozen: false,
      headerHozAlign: "center",
    },
    {
      title: "EMAIL",
      visible: true,
      field: "email",
      frozen: false,
      headerHozAlign: "center",
    },
    {
      title: "HOMEPHONE",
      visible: true,
      field: "phone1",
      frozen: false,
      formatter: "html",
      headerHozAlign: "center",
    },
    {
      title: "CELL",
      visible: true,
      field: "phone2",
      frozen: false,
      formatter: "html",
      headerHozAlign: "center",
    },
    {
      title: "LINKEDCAMPAIGN",
      visible: false,
      field: "linkedCampaignName",
      frozen: false,
      headerHozAlign: "center",
      cssClass: "tabulator-class",
    },
    {
      title: "DONATEPAGEURL",
      visible: false,
      field: "donatePageUrl",
      frozen: false,
      headerHozAlign: "center",
    },
    {
      title: "PARENTREASON",
      visible: false,
      field: "parentReasonName",
      frozen: false,
      headerHozAlign: "center",
    },

    {
      title: "PAYMENTS",
      field: "payments",
      headerHozAlign: "center",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "COUNTOFPAYMENTS",
      field: "paymentsCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "OPENPLEDGES",
      field: "openPledges",
      headerHozAlign: "center",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "COUNTOFPLEDGES",
      field: "pledgesCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "SCHEDULED",
      field: "scheduled",
      headerHozAlign: "center",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "COUNTOFSCHEDULES",
      field: "schedulesCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
    {
      title: "TOTAL",
      field: "raised",
      headerHozAlign: "center",
      formatter: "customComponent",
      formatterParams: { type: "currency" },
      visible: false,
      frozen: false,
      isTotalPanel: true,
      cssClass: "total_panel_tbl_th",
    },
  ];
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  isDateApply: boolean = false;
  isSelectPopupShow: boolean = false;
  isBulkCheckbox: boolean = false;
  displayThisPageArray: any[] = [];
  displayThisPageCount: number = 0;
  lastUpdatedColumns: any;
  columnsVisibilitySubject = new Subject<any>();
  toggledFields: ColumnDefinitionType[] = [];
  selectRows: string = "";
  private analytics = inject(AnalyticsService);

  constructor(
    private reasonService: ReasonService,
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private campaignService: CampaignService,
    private uiPageSettingService: UIPageSettingService,
    private totalPanelService: TotalPanelService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private xlsxService: XLSXService
  ) {
    this.isTabulator =
      this.localStorageDataService.isTabulatorEvent() &&
      environment.baseUrl.includes("https://dev-api.donary.com/");
  }

  ngOnInit() {
    this.analytics.visitedReasons();
    this.colfieldsValue = this.pageSyncService.reasonFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyReason) {
      this.cardType = this.pageSyncService.sumbyReason;
    }
    this.isloading = true;
    this.colfieldsValue = this.pageSyncService.reasonFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyReason) {
      this.cardType = this.pageSyncService.sumbyReason;
    }
    $(document).ready(function () {
      console.log("loaded");

      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.pageSyncService.calculateTimeDifference("list");
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localStorageDataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localStorageDataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Reasons")
          .map((x) => x.isActive)[0];
      }
    });

    this.listSyncSubscription = this.commonMethodService
      .getListSync()
      .subscribe((res: any) => {
        if (res) {
          this.searchReasonData();
        }
      });
    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];

    this.objAdvancedSearch = [];
    this.commonMethodService.getReasonLst().subscribe((res: any) => {
      if (res) {
        this.isSelected = false;
        this.isBulkReasonSelected = false;
        this.recordSelectedArray = [];
        $("#searchReason").val("");
        this.searchReasonData();

        this.commonMethodService.getReasonList();
      }
    });
    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isListClicked &&
        this.pageSyncService.reasonList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localStorageDataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "reasons",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (
            this.uiPageSetting &&
            this.uiPageSetting.isReasonIdColVisible != undefined
          ) {
            this.setUIPageSettings(this.uiPageSetting);

            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.reasonSumBy;
              this.objAdvancedSearch = this.uiPageSetting.reasonSearchitem;
              if (
                this.uiPageSetting.reasonStartDate == null &&
                this.uiPageSetting.reasonEndDate == null
              ) {
                this.selectedDateRange = undefined;
              } else {
                this.selectedDateRange = {
                  startDate: moment(this.uiPageSetting.reasonStartDate),
                  endDate: moment(this.uiPageSetting.reasonEndDate),
                };
              }
            }

            this.colFields.forEach((element) => {
              if (element.id == 1) {
                element.items.forEach((item) => {
                  let colVisible = this.checkVisibility(item.colName);
                  if (item.isVisible != colVisible) {
                    let columnVisibility = { [item.colName]: colVisible };
                    this.colfieldsValue.push(columnVisibility);
                  }
                  item.isVisible = this.checkVisibility(item.colName);
                });
              }
            });
            if (this.isTotalPanelVisible) {
              this.panelTitle = "Hide Total Panel";
              this.searchReasonData();
              this.getTotalPanel();
            } else {
              this.panelTitle = "Show Total Panel";
              this.searchReasonData();
            }
          } else {
            this.searchReasonData();
          }
        } else {
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.reasonList == undefined
          ) {
            this.searchReasonData();
          } else {
            this.gridData = this.pageSyncService.reasonList;
            this.resListModification(this.gridData);
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["reasonList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["reasonList"];
        this.setUIPageSettings(this.uiPageSetting);
      }

      this.gridData = this.pageSyncService.reasonList;
      this.gridOrgData = this.pageSyncService.reasonList;
      this.gridShowPanelData = this.pageSyncService.reasonList;
      if (this.pageSyncService.reasonlistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.reasonlistTotalPanel);
      }
      this.resListModification(this.gridData);
      this.isloading = false;
      this.changeDetectorRef.detectChanges();
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

    if (this.pageSyncService.reasonFilterData) {
      this.advancedFilterData(this.pageSyncService.reasonFilterData);
    }
    if (this.pageSyncService.ReasonCalDate) {
      if (
        this.pageSyncService.ReasonCalDate.startDate == null &&
        this.pageSyncService.ReasonCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.ReasonCalDate.startDate),
        endDate: moment(this.pageSyncService.ReasonCalDate.endDate),
      };
      this.EngHebCalPlaceholder = this.pageSyncService.ReasonEngCalPlaceholder;
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
    this.isReasonIdColVisible = uiPageSetting.isReasonIdColVisible;
    this.isReasonNameColVisible = uiPageSetting.isReasonNameColVisible;
    this.isReasonGoalColVisible = uiPageSetting.isReasonGoalColVisible;
    this.isReasonRaisedColVisible = uiPageSetting.isReasonRaisedColVisible;
    this.isReasonPercentageColVisible =
      uiPageSetting.isReasonPercentageColVisible;
    this.isReasonEmailColVisible = uiPageSetting.isReasonEmailColVisible;
    this.isReasonPhone1ColVisible = uiPageSetting.isReasonPhone1ColVisible;
    this.isReasonPhone2ColVisible = uiPageSetting.isReasonPhone2ColVisible;
    this.isReasonlinkedCampaignNameColVisible =
      uiPageSetting.isReasonlinkedCampaignNameColVisible;
    this.isReasonPaymentsColVisible = uiPageSetting.isReasonPaymentsColVisible;
    this.isReasonOpenPledgesColVisible =
      uiPageSetting.isReasonOpenPledgesColVisible;
    this.isReasonScheduledColVisible =
      uiPageSetting.isReasonScheduledColVisible;
    this.isReasonRaisedTColVisible = uiPageSetting.isReasonRaisedTColVisible;
    this.isReasonPaymentsCountColVisible =
      uiPageSetting.isReasonPaymentsCountColVisible;
    this.isReasonPledgesCountColVisible =
      uiPageSetting.isReasonPledgesCountColVisible;
    this.isReasonScheduledCountColVisible =
      uiPageSetting.isReasonScheduledCountColVisible;
    this.isDonatePageUrlColVisible = uiPageSetting.isDonatePageUrlColVisible;
    this.isParentReasonNameColVisible =
      uiPageSetting.isParentReasonNameColVisible;
    this.isTotalPanelVisible = uiPageSetting.reasonIsTotalPanelVisible;
    this.pageSyncService.reasonlistTotalPanel =
      !uiPageSetting.reasonIsTotalPanelVisible;
    this.EngHebCalPlaceholder =
      this.pageSyncService.ReasonEngCalPlaceholder ||
      uiPageSetting.EngHebCalPlaceholder ||
      this.EngHebCalPlaceholder;
    this.pageSyncService.ReasonEngCalPlaceholder = this.EngHebCalPlaceholder;

    if (uiPageSetting?.reasonCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.reasonCalendarPlaceHolderId;

    this.pageSyncService.uiPageSettings["reasonList"] = uiPageSetting;
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }
  ngOnDestroy() {
    this.listSyncSubscription.unsubscribe();
  }

  initMultiSelect() {
    const sumByCampaign = _(this.gridTotalPanelData)
      .filter((s) => s.campaignId != null && s.reasonId != null)
      .groupBy("campaignId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByReason = _(this.gridTotalPanelData)
      .filter((s) => s.reasonId != null)
      .groupBy("reasonId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByLocation = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null && s.reasonId != null)
      .groupBy("locationId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByCollector = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null && s.reasonId != null)
      .groupBy("collectorId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDevice = _(this.gridTotalPanelData)
      .filter((s) => s.deviceId != null && s.reasonId != null)
      .groupBy("deviceId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDonor = _(this.gridTotalPanelData)
      .filter((s) => s.accountId != null && s.reasonId != null)
      .groupBy("accountId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    this.cardFilter = [
      { id: 1, itemName: "Campaign", counts: sumByCampaign.length },
      { id: 2, itemName: "Reason", counts: sumByReason.length },
      { id: 3, itemName: "Location", counts: sumByLocation.length },
      { id: 5, itemName: "Collector", counts: sumByCollector.length },
      { id: 7, itemName: "Device", counts: sumByDevice.length },
      { id: 6, itemName: "Donor", counts: sumByDonor.length },
    ];
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

  dropGroupItem(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  editBulkReasonPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_bulkeditreason",
    };

    const modalRef = this.commonMethodService.openPopup(
      BulkEditreasonPopupComponent,
      this.modalOptions
    );

    if (this.isTabulator) {
      modalRef.componentInstance.SelectedIds = this.getUniqueSelectionIId();
      return;
    }
    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
  }

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  onArrowClick() {
    this.isClicked = true;
  }

  onTotalBtnClick() {
    this.isOpen = true;
  }

  onPauseClick() {
    this.isClicked = false;
    this.isOpen = false;
  }

  ClosePanel(event) {
    if (event) {
      this.isClicked = false;
      this.isOpen = false;
    }
  }

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
      .groupBy("reasonId")
      .map((props, id: string) => ({
        ..._.head(props),
        reasonId: id,
        payments: _.map(props, (o) => {
          return o.payments;
        }).reduce((prev, next) => prev + next, 0),
        openPledges: _.map(props, (o) => {
          return o.openPledges;
        }).reduce((prev, next) => prev + next, 0),
        scheduled: _.map(props, (o) => {
          return o.scheduled;
        }).reduce((prev, next) => prev + next, 0),
        raised: _.map(props, (o) => {
          return o.raised;
        }).reduce((prev, next) => prev + next, 0),
        campaignIds: _.map(props, (o) => {
          return o.campaignId;
        }),
        reasonIds: _.map(props, (o) => {
          return o.reasonId;
        }),
        locationIds: _.map(props, (o) => {
          return o.locationId;
        }),
        collectorIds: _.map(props, (o) => {
          return o.collectorId;
        }),
        accountIds: _.map(props, (o) => {
          return o.accountId;
        }),
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
        parentCampaignIds: _.map(props, (o) => {
          return o.parentCampaignId;
        }),
      }))
      .value();
  }

  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  showAllTotalData() {
    const groupedRes = this.getGroupValue();
    const merged = _.merge(
      _.keyBy(this.gridData, "reasonId"),
      _.keyBy(groupedRes, "reasonId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, this.gridData, (o, t) => {
      return o.reasonId == t.reasonId;
    });
    const values = _.values(inCommon);

    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
  }

  groupRes: any;
  showOnlyTotalData(data = this.gridData) {
    const dd = _.intersectionWith(
      this.gridData,
      this.gridTotalPanelData,
      (o, t) => {
        return o.reasonId == t.reasonId;
      }
    );
    const groupedRes = this.getGroupValue();
    this.groupRes = this.GetGroupList(
      this.groupBy(this.gridTotalPanelData, (s) => s.reasonId)
    );
    const values = _.map(dd, (o) => {
      let found = _.find(groupedRes, (t) => {
        return o.reasonId == t.reasonId;
      });
      if (found) {
        return {
          ...o,
          ...found,
        };
      }
      return {
        ...o,
      };
    });
    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.isTotalPanelShowAll = true;
      this.showOnlyTotalData();
    } else {
      this.showAllTotalData();
      this.isTotalPanelShowAll = false;
    }

    this.initMultiSelect();
  }

  tempSearch: Array<any>;
  getTotalPanel() {
    this.isloading = true;
    var objTotalPanel = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
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
    if (this.pageSyncService.ReasontotalPanel && !this.isDateApply) {
      this.Panel(this.pageSyncService.ReasontotalPanel);
      this.isloading = false;
    } else {
      this.isDateApply = false;
      this.totalPanelService.getTotals(objTotalPanel).subscribe(
        (res: Array<PanelRes>) => {
          this.pageSyncService.ReasontotalPanel = res;
          this.Panel(res);
        },
        (error) => {
          this.isloading = false;
          this.changeDetectorRef.detectChanges();
          console.log(error);
        }
      );
    }
  }
  Panel(res: any) {
    if (res.length > 0) {
      this.gridTotalPanelData = res;
      this.gridOrgTotalPanelData = res;
      if (this.isTotalPanelShowAll) {
        this.totalPanelfilterLocalData();
        this.showOnlyTotalData();
        this.tempSearch = this.gridFilterData;
      } else {
        this.showAllTotalData();
      }

      this.isReasonPaymentsColVisible = true;
      this.isReasonOpenPledgesColVisible = true;
      this.isReasonScheduledColVisible = true;
      this.isReasonRaisedTColVisible = true;

      if (this.gridFilterData.length > 0) {
        this.initMultiSelect();
      } else {
        this.paymentTypeChipData = [];
        this.initMultiSelect();
      }
    } else {
      this.paymentTypeChipData = [];
      this.totalRecord = 0;
      this.gridFilterData = [];
      this.gridSumByData = this.gridFilterData;
      this.initMultiSelect();
    }

    this.isinitialize = 1;
    this.isloading = false;
    this.isFiltered = false;
    this.detectChanges();
  }
  OpenSumCard(item) {
    if (this.isSumCardOpen) {
      this.isSumCardOpen = false;
    } else {
      this.selectedItem = false;
      this.isSumCardOpen = true;
    }
  }

  datesUpdated(event) {
    if (this.isinitialize == 1) {
      if (!event.startDate) {
        this.selectedDateRange = undefined;
        this.isinitialize = 0;
      } else {
        this.selectedDateRange = event;
      }
      this.getTotalPanel();
    }
  }

  GetPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.itemName).toString()
          : null;
      this.gridFilterData = this.gridSumByData;
      this.objAdvancedSearch = {
        status: "",
        donorId: [],
        campaignId: [],
        locationId: [],
        collectorId: [],
        sourceId: [],
        reasonId: [],
        linkedCampaignName: "",
      };
      switch (cardTypeValue) {
        case "Campaign":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.campaignIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var campaignReasonIds = this.GetCampaignReason(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignReasonIds.indexOf(Number(s.reasonId)) >= 0) ||
                s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.campaignId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Reason":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.reasonIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonIds = this.GetReason(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonIds.indexOf(Number(s.reasonId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.reasonId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Location":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.locationIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var locationReasonIds = this.GetLocationReason(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                locationReasonIds.indexOf(Number(s.reasonId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.locationId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Collector":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.collectorIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var collectorReasonIds = this.GetCollectorReason(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.collectorIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                collectorReasonIds.indexOf(Number(s.reasonId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.collectorId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Device":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.deviceIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var deviceReasonIds = this.GetDeviceReason(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceReasonIds.indexOf(Number(s.reasonId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.sourceId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Donor":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.accountIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.reasonId == item.reasonId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.reasonId == item.reasonId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var accountReasonIds = this.GetDonorReason(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                accountReasonIds.indexOf(Number(s.reasonId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.reasonId == item.reasonId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.reasonId == item.reasonId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.donorId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
      }
    }
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.changeDetectorRef.detectChanges();
    this.modalOptions = {
      centered: true,
      size: "lg",
      windowClass: "reason_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReasonFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.data = this.gridData;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse);
      }
    );
  }
  advancedFilterData(objResponse) {
    this.objAdvancedSearch = objResponse;
    this.isFilterOpen = true;
    if (this.isTotalPanelVisible) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      this.showOnlyTotalData();
      //this.searchReasonData();
      //this.totalPanelfilterLocalData();
    } else {
      this.gridData = this.gridOrgData;
      this.filterLocalData();
    }
    this.changeDetectorRef.detectChanges();
  }
  GetGroupList(groupByList) {
    var myArray = [];
    groupByList.forEach((element) => {
      myArray.push.apply(myArray, element);
    });

    return myArray;
  }

  GetCampaignReason(campaignId) {
    var campaignReasonIds = this.groupRes
      .filter((s) => s.campaignId == campaignId)
      .map((s) => s.reasonId);
    campaignReasonIds = campaignReasonIds.filter(
      (n, i) => campaignReasonIds.indexOf(n) === i
    );
    return campaignReasonIds.filter((x) => x != null);
  }
  GetDeviceReason(deviceId) {
    var deviceReasonIds = this.groupRes
      .filter((s) => s.deviceId == deviceId)
      .map((s) => s.reasonId);
    deviceReasonIds = deviceReasonIds.filter(
      (n, i) => deviceReasonIds.indexOf(n) === i
    );
    return deviceReasonIds.filter((x) => x != null);
  }
  GetCollectorReason(collectorId) {
    var collectorReasonIds = this.groupRes
      .filter((s) => s.collectorId == collectorId)
      .map((s) => s.reasonId);
    collectorReasonIds = collectorReasonIds.filter(
      (n, i) => collectorReasonIds.indexOf(n) === i
    );
    return collectorReasonIds.filter((x) => x != null);
  }
  GetLocationReason(locationId) {
    var locationReasonIds = this.groupRes
      .filter((s) => s.locationId == locationId)
      .map((s) => s.reasonId);
    locationReasonIds = locationReasonIds.filter(
      (n, i) => locationReasonIds.indexOf(n) === i
    );
    return locationReasonIds.filter((x) => x != null);
  }
  GetDonorReason(accountId) {
    var donorReasonIds = this.groupRes
      .filter((s) => s.accountId == accountId)
      .map((s) => s.reasonId);
    donorReasonIds = donorReasonIds.filter(
      (n, i) => donorReasonIds.indexOf(n) === i
    );
    return donorReasonIds.filter((x) => x != null);
  }
  GetReason(reasonId) {
    var reasonIds = this.groupRes
      .filter((s) => s.reasonId == reasonId)
      .map((s) => s.reasonId);
    reasonIds = reasonIds.filter((n, i) => reasonIds.indexOf(n) === i);
    return reasonIds.filter((x) => x != null);
  }
  notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  cardTypeChange(cardType) {
    this.pageSyncService.sumbyReason = this.cardType;
    this.cardType = cardType;
    this.pageSyncService.sumbyReason = this.cardType;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.campaignId != null && s.reasonId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignReason(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId && x.reasonId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.reasonId != null) ||
                      x.parentCampaignId == objs[0].campaignId
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.campaignId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.campaignIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Campaigns",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.reasonId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReason(objs[0].reasonId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.reasonId == objs[0].reasonId && x.reasonId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.reasonId == objs[0].reasonId && x.reasonId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.reasonId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        this.gridFilterData = this.gridFilterData.filter(
          (s) => s.reasonId != null
        );
        var allReasonLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.reasonIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        //this.gridSumByData=this.gridFilterData;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Reasons",
          key: -2,
          total: allTotal,
          count: allReasonLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -2,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.collectorId != null && s.reasonId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetCollectorReason(objs[0].collectorId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.collectorId == objs[0].collectorId && x.reasonId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.collectorId == objs[0].collectorId && x.reasonId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.collectorId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.collectorIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Collectors",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.accountId != null && s.reasonId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetDonorReason(objs[0].accountId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.accountId == objs[0].accountId && x.reasonId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.accountId == objs[0].accountId && x.reasonId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.accountId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.accountIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Donors",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.locationId != null && s.reasonId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: this.GetLocationReason(objs[0].locationId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.locationId == objs[0].locationId && x.reasonId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.locationId == objs[0].locationId && x.reasonId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.locationId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.locationIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Locations",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.deviceId != null && s.reasonId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetDeviceReason(objs[0].deviceId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.deviceId == objs[0].deviceId && x.reasonId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.deviceId == objs[0].deviceId && x.reasonId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.deviceId != null && s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null && s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.deviceIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Devices",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    this.changeSortType(this.sortType);
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    var sortId = sortType.map((s) => s.id).toString();
    var allTypeCard = this.paymentTypeChipData.filter((x) => x.name == "ALL");
    var totalTypeCard = this.paymentTypeChipData.filter((x) =>
      x.name.includes("Total")
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.name != "ALL" && !x.name.includes("Total")
    );
    if (sortId == 1) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 2) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .reverse();
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 3) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) => (a.total > b.total ? 1 : b.total > a.total ? -1 : 0))
        .reverse();
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 4) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.total > b.total ? 1 : b.total > a.total ? -1 : 0
      );
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    }
  }

  TogglePanel(isVisible) {
    this.pageSyncService.reasonlistTotalPanel = isVisible;
    if (!isVisible) {
      this.openTotalPanel();
    } else {
      this.closeTotalPanel();
    }
  }

  openTotalPanel() {
    this.isTotalPanelVisible = true;
    this.panelTitle = "HIDETOTALPANEL";

    this.colFields = this.colFields.map((o) => {
      if (o.title === "TOTALPANEL") {
        const itemChil = o.items.map((io) => {
          if (io.colName === "Payments") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Open Pledges") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Scheduled") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Total") {
            return {
              ...io,
              isVisible: true,
            };
          }
          return io;
        });

        return {
          ...o,
          isTotalPanel: true,
          items: itemChil,
        };
      }

      return o;
    });

    this.getTotalPanel();
  }

  closeTotalPanel() {
    this.isTotalPanelVisible = false;
    this.panelTitle = "SHOWTOTALPANEL";
    this.isReasonPaymentsColVisible = false;
    this.isReasonOpenPledgesColVisible = false;
    this.isReasonScheduledColVisible = false;
    this.isReasonRaisedTColVisible = false;

    this.isReasonPledgesCountColVisible = false;
    this.isReasonPaymentsCountColVisible = false;
    this.isReasonScheduledCountColVisible = false;

    this.isinitialize = 0;
    this.isTotalPanelShowAll = true;
    this.isChipTypeSelected = false;
    this.colFields = this.colFields.map((o) => {
      if (o.title === "TOTALPANEL") {
        const itemChil = o.items.map((io) => {
          return {
            ...io,
            isVisible: false,
          };
        });

        return {
          ...o,
          items: itemChil,
          isTotalPanel: false,
        };
      }
      return o;
    });
    this.gridData = this.gridShowPanelData;
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData?.length || 0;
    console.log("GridData: ", this.gridData);
    if (this.objAdvancedSearch != null) {
      this.filterLocalData();
    }
    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }
  }

  openReasonCardPopup(reasonId) {
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
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      reasonId: reasonId,
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
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((x) => x.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.reasonService.getReasonCard(objReasonCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      this.changeDetectorRef.detectChanges();
      if (res) {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
        modalRef.componentInstance.ReasonCardData = res;
      }
    });
    this.changeDetectorRef.detectChanges();
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.reasonFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "reason#":
        this.isReasonIdColVisible = isVisible;
        this.uiPageSetting.isReasonIdColVisible = isVisible;
        break;
      case "reasonname":
        this.isReasonNameColVisible = isVisible;
        this.uiPageSetting.isReasonNameColVisible = isVisible;
        break;
      case "goal":
        this.isReasonGoalColVisible = isVisible;
        this.uiPageSetting.isReasonGoalColVisible = isVisible;
        break;
      case "raised":
        this.isReasonRaisedColVisible = isVisible;
        this.uiPageSetting.isReasonRaisedColVisible = isVisible;
        break;
      case "percentage":
        this.isReasonPercentageColVisible = isVisible;
        this.uiPageSetting.isReasonPercentageColVisible = isVisible;
        break;
      case "email":
        this.isReasonEmailColVisible = isVisible;
        this.uiPageSetting.isReasonEmailColVisible = isVisible;
        break;
      case "homephone":
        this.isReasonPhone1ColVisible = isVisible;
        this.uiPageSetting.isReasonPhone1ColVisible = isVisible;
        break;
      case "cell":
        this.isReasonPhone2ColVisible = isVisible;
        this.uiPageSetting.isReasonPhone2ColVisible = isVisible;
        break;
      case "linkedcampaign":
        this.isReasonlinkedCampaignNameColVisible = isVisible;
        this.uiPageSetting.isReasonlinkedCampaignNameColVisible = isVisible;
        break;
      case "donatepageurl":
        this.isDonatePageUrlColVisible = isVisible;
        this.uiPageSetting.isDonatePageUrlColVisible = isVisible;
        break;
      case "parentreason":
        this.isParentReasonNameColVisible = isVisible;
        this.uiPageSetting.isParentReasonNameColVisible = isVisible;
        break;
      // Total Panel
      case "payments":
        this.isReasonPaymentsColVisible = isVisible;
        this.uiPageSetting.isReasonPaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isReasonOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isReasonOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isReasonScheduledColVisible = isVisible;
        this.uiPageSetting.isReasonScheduledColVisible = isVisible;
        break;
      case "total":
        this.isReasonRaisedTColVisible = isVisible;
        this.uiPageSetting.isReasonRaisedTColVisible = isVisible;
        break;
      case "countofpayments":
        this.isReasonPaymentsCountColVisible = isVisible;
        this.uiPageSetting.isReasonPaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isReasonPledgesCountColVisible = isVisible;
        this.uiPageSetting.isReasonPledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isReasonScheduledCountColVisible = isVisible;
        this.uiPageSetting.isReasonScheduledCountColVisible = isVisible;
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
      case "reason#":
        return this.isReasonIdColVisible;
      case "reasonname":
        return this.isReasonNameColVisible;
      case "goal":
        return this.isReasonGoalColVisible;
      case "raised":
        return this.isReasonRaisedColVisible;
      case "percentage":
        return this.isReasonPercentageColVisible;
      case "email":
        return this.isReasonEmailColVisible;
      case "homephone":
        return this.isReasonPhone1ColVisible;
      case "cell":
        return this.isReasonPhone2ColVisible;
      case "linkedcampaign":
        return this.isReasonlinkedCampaignNameColVisible;

      case "payments":
        return this.isReasonPaymentsColVisible;
      case "openpledges":
        return this.isReasonOpenPledgesColVisible;
      case "scheduled":
        return this.isReasonScheduledColVisible;
      case "total":
        return this.isReasonRaisedTColVisible;
      case "countofpayments":
        return this.isReasonPaymentsCountColVisible;
      case "countofpledges":
        return this.isReasonPledgesCountColVisible;
      case "countofschedules":
        return this.isReasonScheduledCountColVisible;
      case "donatepageurl":
        return this.isDonatePageUrlColVisible;
      case "parentreason":
        return this.isParentReasonNameColVisible;
    }
  }

  SaveLayout() {
    let setting = {
      isReasonIdColVisible: this.isReasonIdColVisible,
      isReasonNameColVisible: this.isReasonNameColVisible,
      isReasonGoalColVisible: this.isReasonGoalColVisible,
      isReasonRaisedColVisible: this.isReasonRaisedColVisible,
      isReasonPercentageColVisible: this.isReasonPercentageColVisible,
      isReasonEmailColVisible: this.isReasonEmailColVisible,
      isReasonPhone1ColVisible: this.isReasonPhone1ColVisible,
      isReasonPhone2ColVisible: this.isReasonPhone2ColVisible,
      isReasonlinkedCampaignNameColVisible:
        this.isReasonlinkedCampaignNameColVisible,
      isReasonPaymentsColVisible: this.isReasonPaymentsColVisible,
      isReasonOpenPledgesColVisible: this.isReasonOpenPledgesColVisible,
      isReasonScheduledColVisible: this.isReasonScheduledColVisible,
      isReasonRaisedTColVisible: this.isReasonRaisedTColVisible,
      isReasonPaymentsCountColVisible: this.isReasonPaymentsCountColVisible,
      isReasonPledgesCountColVisible: this.isReasonPledgesCountColVisible,
      isReasonScheduledCountColVisible: this.isReasonScheduledCountColVisible,
      isDonatePageUrlColVisible: this.isDonatePageUrlColVisible,
      isParentReasonNameColVisible: this.isParentReasonNameColVisible,
      reasonStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      reasonEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      reasonSumBy: this.cardType,
      reasonSearchitem: this.objAdvancedSearch,
      reasonIsTotalPanelVisible: this.isTotalPanelVisible,
      reasonCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "reasons",
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

  search(keyword) {
    if (keyword == "") {
      this.filterLocalData();
    }
    if (this.isTotalPanelVisible) {
      if (this.isChipTypeSelected) {
        var record = this.gridSelectedData;
        this.gridData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else {
        var record = this.gridSearchFilterData; //this.gridFilterData;///issue added
        this.totalRecord = this.gridSearchFilterData.length; //this.gridFilterData.length;
      }
    } else {
      var record = this.gridData;
      this.totalRecord = this.gridData.length;
    }
    var filterdRecord;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.urlTag &&
              obj.urlTag.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.reasonNameJewish &&
              obj.reasonNameJewish
                .toLowerCase()
                .toString()
                .indexOf(searchValue) > -1) ||
            (obj.sortNumber &&
              obj.sortNumber.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.goal &&
              obj.goal.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.mainraised &&
              obj.mainraised.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.percentage &&
              obj.percentage.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.email &&
              obj.email.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phone1 &&
              obj.phone1.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phone2 &&
              obj.phone2.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.linkedCampaignName &&
              obj.linkedCampaignName
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1)
        );
        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
        record = this.gridFilterData;
      }
    } else {
      if (this.isChipTypeSelected) {
        this.gridFilterData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else if (this.isTotalPanelVisible) {
        this.gridFilterData = this.tempSearch;
        this.totalRecord = this.tempSearch.length;
      } else {
        this.filterLocalData();
        //this.gridFilterData = this.gridData;
        this.totalRecord = this.gridFilterData.length;
      }
    }
  }

  searchReasonData() {
    this.isloading = true;
    var objAdvancedSearchData: any = {};
    let objSearch = this.objAdvancedSearch;
    if (this.objAdvancedSearch) {
      if (!this.objAdvancedSearch.isTotalPanel) {
        objAdvancedSearchData = {
          // Get only Id values for multi select dropdown
          reasonName: this.objAdvancedSearch.reasonName,
          reasonNum: this.objAdvancedSearch.reasonNo,
          minGoal: this.objAdvancedSearch.minGoal,
          maxGoal: this.objAdvancedSearch.maxGoal,
          minPercentage: this.objAdvancedSearch.minPercentage,
          maxPercentage: this.objAdvancedSearch.maxPercentage,
          email: this.objAdvancedSearch.email,
          homePhone: this.objAdvancedSearch.homePhone,
          cell: this.objAdvancedSearch.cell,
          linkedCampaignName: this.objAdvancedSearch.linkedCampaignName,
          linkedCampaignID: this.objAdvancedSearch.linkedCampaignID,
        };
      } else {
        objAdvancedSearchData = {
          // Get only Id values for multi select dropdown
          collectorId: this.objAdvancedSearch.collectorId,
          locationId: this.objAdvancedSearch.locationId,
          campaignId: this.objAdvancedSearch.campaignId,
          sourceId: this.objAdvancedSearch.sourceId,
          donorId: this.objAdvancedSearch.donorId,
        };
      }

      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
    var objReason = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      reasonName: this.objAdvancedSearch && this.objAdvancedSearch.reasonName,
      reasonNum: this.objAdvancedSearch && this.objAdvancedSearch.reasonNum,
      minGoal: this.objAdvancedSearch && this.objAdvancedSearch.minGoal,
      maxGoal: this.objAdvancedSearch && this.objAdvancedSearch.maxGoal,
      minPercentage:
        this.objAdvancedSearch && this.objAdvancedSearch.minPercentage,
      maxPercentage:
        this.objAdvancedSearch && this.objAdvancedSearch.maxPercentage,
      email: this.objAdvancedSearch && this.objAdvancedSearch.email,
      homePhone: this.objAdvancedSearch && this.objAdvancedSearch.homePhone,
      cell: this.objAdvancedSearch && this.objAdvancedSearch.cell,
      status: this.objAdvancedSearch && this.objAdvancedSearch.status,
      linkedCampaignName:
        this.objAdvancedSearch && this.objAdvancedSearch.linkedCampaignName,

      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((s) => s.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.reasonService.getReasonList(objReason).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.objAdvancedSearch = objSearch;
          for (var i = 0; i < res.length; i++) {
            if (res[i].linkedCampaignName) {
              //remove duplicate valu from linkedCampaignList
              if (
                this.linkedCampaignList.find(
                  (obj) => obj.Name === res[i].linkedCampaignName
                ) === undefined
              ) {
                this.linkedCampaignList.push({
                  Name: res[i].linkedCampaignName,
                });
              }
            }

            res[i].phone1 = this.formatPhoneNumber(res[i].phone1);
            res[i].phone2 = this.formatPhoneNumber(res[i].phone2);
            res[i].campaignId = null;

            res[i].mainraised = res[i].raised;
            if (res[i].goal && res[i].goal != 0) {
              res[i].percentage =
                ((100 * res[i].mainraised) / res[i].goal).toFixed(2) + "%";
            }

            res[i].openPledges = 0;
            res[i].payments = 0;
            res[i].raised = 0;
            res[i].scheduled = 0;
            res[i].paymentsCount = 0;
            res[i].schedulesCount = 0;
            res[i].pledgesCount = 0;
          }

          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridOrgData = res;
          this.pageSyncService.reasonList = this.gridData;
          this.pageSyncService.isReasonListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(res);
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
          this.pageSyncService.reasonList = this.gridData;
        }

        this.isloading = false;
        this.detectChanges();
        this.commonMethodService.sendDataLoaded("reasons");
      },
      (error) => {
        this.isloading = false;
        this.changeDetectorRef.detectChanges();
        console.log(error);
      }
    );
  }

  resListModification(res) {
    if (this.gridTotalPanelData) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      if (this.isTotalPanelShowAll) {
        this.showOnlyTotalData();
      } else {
        this.showAllTotalData();
      }
      this.initMultiSelect();
    } else {
      this.totalRecord = res.length;
      this.gridData = res;
      this.gridFilterData = this.gridData;
      this.gridShowPanelData = res;
      this.objAdvancedSearch = { status: "Active" };
      this.filterLocalData();
      this.gridData = this.gridFilterData;
    }
    this.initMultiSelect();
  }

  formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{1,5})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return "";
  }

  openSaveReasonPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savereason_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveReasonPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    if (results) {
      Object.values(results).forEach((item: any) => {
        let urlTag = item && item.urlTag;
        let sortNumber = item && item.sortNumber;
        let reasonName = item && item.reasonName;
        let reasonNameJewish = item && item.reasonNameJewish;
        let goal = item && item.goal;
        let raised = item && item.raised;
        let percentage = item && item.percentage;
        let email = item && item.email;
        let phone2 = item && item.phone2;
        let phone1 = item && item.phone1;
        let donatePageUrl = item && item.donatePageUrl;
        let parentReasonName = item && item.parentReasonName;

        let row = {};
        if (this.isReasonNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASONNAME")
            : "Reason Name";
          row[ColName] = reasonName;
        }
        if (this.isReasonIdColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON#")
            : "Reason #";
          row[ColName] = urlTag;
        }
        if (this.isReasonNameColVisible) {
          row["Reason Name Jewish"] = reasonNameJewish;
        }
        if (this.isReasonGoalColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("GOAL")
            : "Goal";
          row[ColName] = goal;
        }
        if (this.isReasonPercentageColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PERCENTAGE")
            : "Percentage";
          row[ColName] = percentage;
        }
        if (this.isReasonEmailColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] = email;
        }
        if (this.isReasonPhone1ColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("HOMEPHONE")
            : "Home phone";
          row[ColName] = phone1;
        }

        if (this.isReasonlinkedCampaignNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CELL")
            : "cell";
          row[ColName] = phone2;
        }
        if (this.isDonatePageUrlColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("DONATEPAGEURL")
            : "Donate-page-url";
          row[ColName] = donatePageUrl;
        }
        if (this.isParentReasonNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PARENTREASON")
            : "Parent Reason";
          row[ColName] = parentReasonName;
        }
        // Total Panel
        if (this.isReasonPaymentsColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTS")
            : "Payments";
          row[ColName] = Number(item.payments);
        }
        if (this.isReasonPaymentsCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
            : "Count Of Payments";
          row[ColName] = item.paymentsCount;
        }
        if (this.isReasonOpenPledgesColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("OPENPLEDGES")
            : "Open Pledges";
          row[ColName] = Number(item.openPledges);
        }
        if (this.isReasonPledgesCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPLEDGES")
            : "Count Of Pledges";
          row[ColName] = item.pledgesCount;
        }
        if (this.isReasonScheduledColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULED")
            : "Scheduled";
          row[ColName] = Number(item.scheduled);
        }
        if (this.isReasonScheduledCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
            : "Count Of Schedules";
          row[ColName] = item.schedulesCount;
        }
        if (this.isReasonRaisedTColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTAL")
            : "Total";
          row[ColName] = Number(item.raised);
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Reason List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });

    if (this.isTotalPanelVisible) {
      var range = XLSX.utils.decode_range(worksheet["!ref"]);
      // Find Payment, Pledge, Schedule, And Total
      let paymentColumn = null;
      let pledgeColumn = null;
      let scheduleColumn = null;
      let totalColumn = null;
      for (var R = range.s.r; R < 1; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
          var cell_address = { c: C, r: R };

          var cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!worksheet[cell_ref]) continue;
          if (worksheet[cell_ref].v == "Payments") {
            paymentColumn = C;
          }

          if (worksheet[cell_ref].v == "Open Pledges") {
            pledgeColumn = C;
          }

          if (worksheet[cell_ref].v == "Scheduled") {
            scheduleColumn = C;
          }

          if (worksheet[cell_ref].v == "Total") {
            totalColumn = C;
          }
        }
      }

      let fmt = "$#,##0.00";
      for (var R = range.s.r; R <= range.e.r; ++R) {
        if (R == 0) continue;
        if (!!paymentColumn) {
          let payment_cell_address = { c: paymentColumn, r: R };
          let payment_cell_ref = XLSX.utils.encode_cell(payment_cell_address);
          if (worksheet[payment_cell_ref]) {
            worksheet[payment_cell_ref].t = "n";
            worksheet[payment_cell_ref].z = fmt;
          }
        }

        if (!!pledgeColumn) {
          let pledge_cell_address = { c: pledgeColumn, r: R };
          let pledge_cell_ref = XLSX.utils.encode_cell(pledge_cell_address);
          if (worksheet[pledge_cell_ref]) {
            worksheet[pledge_cell_ref].t = "n";
            worksheet[pledge_cell_ref].z = fmt;
          }
        }

        if (!!scheduleColumn) {
          let schedule_cell_address = { c: scheduleColumn, r: R };
          let schedule_cell_ref = XLSX.utils.encode_cell(schedule_cell_address);
          if (worksheet[schedule_cell_ref]) {
            worksheet[schedule_cell_ref].t = "n";
            worksheet[schedule_cell_ref].z = fmt;
          }
        }

        if (!!totalColumn) {
          let total_cell_address = { c: totalColumn, r: R };
          let total_cell_ref = XLSX.utils.encode_cell(total_cell_address);
          if (worksheet[total_cell_ref]) {
            worksheet[total_cell_ref].t = "n";
            worksheet[total_cell_ref].z = fmt;
          }
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

  FilterTotalPanelData(objAdSearch) {
    var filteredTotalPanel = this.gridOrgTotalPanelData;
    if (objAdSearch) {
      if (this.objAdvancedSearch.donorId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.donorId.map((x) => x.id).includes(f.accountId)
        );
      }
      if (this.objAdvancedSearch.campaignId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.campaignId
            .map((x) => x.id)
            .includes(f.campaignId)
        );
      }
      if (this.objAdvancedSearch.locationId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.locationId
            .map((x) => x.id)
            .includes(f.locationId)
        );
      }
      if (this.objAdvancedSearch.collectorId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.collectorId
            .map((x) => x.id)
            .includes(f.collectorId)
        );
      }
      if (this.objAdvancedSearch.sourceId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.sourceId.map((x) => x.id).includes(f.deviceId)
        );
      }
    }
    return filteredTotalPanel;
  }

  isContain(val: string, search: string) {
    if (!search) {
      return true;
    }
    return (
      val &&
      val.toString().toLowerCase().indexOf(search.toString().toLowerCase()) > -1
    );
  }

  filterLocalData() {
    this.gridFilterData = this.gridData.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.status &&
        this.objAdvancedSearch.status == "Active"
      ) {
        return o.status == "Active" && this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.status &&
        this.objAdvancedSearch.status == "InActive"
      ) {
        return o.status == "InActive" && this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.linkedCampaignName &&
        this.objAdvancedSearch.linkedCampaignName != ""
      ) {
        return this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        (!this.objAdvancedSearch.status || this.objAdvancedSearch.status == "")
      ) {
        return this.inAllFields(o);
      }
    });
    this.gridData = this.gridFilterData;
    this.totalRecord = this.gridFilterData.length;
    this.gridShowPanelData = this.gridFilterData;
  }

  inAllFields(o) {
    return (
      this.isContain(o.reasonName, this.objAdvancedSearch.reasonName) &&
      this.isContain(o.email, this.objAdvancedSearch.email) &&
      this.isContain(
        o.sortNumber ? o.sortNumber.toString() : "",
        this.objAdvancedSearch.reasonNum
      ) &&
      this.isContain(o.phone1, this.objAdvancedSearch.homePhone) &&
      this.isContain(o.phone2, this.objAdvancedSearch.cell) &&
      this.isContain(
        o.linkedCampaignName,
        this.objAdvancedSearch.linkedCampaignName
      ) &&
      this.FilterInGoal(o) &&
      this.filterPercentage(o)
    );
  }

  FilterInGoal(o) {
    if (!this.objAdvancedSearch.minGoal && !this.objAdvancedSearch.maxGoal) {
      return true;
    }

    if (!o.goal) {
      return false;
    }

    if (!this.objAdvancedSearch.minGoal && this.objAdvancedSearch.maxGoal) {
      return o.goal && o.goal <= this.objAdvancedSearch.maxGoal;
    }

    if (this.objAdvancedSearch.minGoal && !this.objAdvancedSearch.maxGoal) {
      return o.goal && o.goal >= this.objAdvancedSearch.minGoal;
    }

    if (this.objAdvancedSearch.minGoal && this.objAdvancedSearch.maxGoal) {
      return (
        o.goal &&
        o.goal >= this.objAdvancedSearch.minGoal &&
        o.goal <= this.objAdvancedSearch.maxGoal
      );
    }
  }

  filterPercentage(o) {
    if (
      !this.objAdvancedSearch.minPercentage &&
      !this.objAdvancedSearch.maxPercentage
    ) {
      return true;
    }

    if (!o.percentage) {
      return false;
    }

    let perVal = o.percentage.replace("%", "");
    perVal = perVal.trim();

    const finalPercent = Number(perVal);

    if (
      !this.objAdvancedSearch.minPercentage &&
      this.objAdvancedSearch.maxPercentage
    ) {
      return finalPercent <= this.objAdvancedSearch.maxPercentage;
    }

    if (
      this.objAdvancedSearch.minPercentage &&
      !this.objAdvancedSearch.maxPercentage
    ) {
      return finalPercent >= this.objAdvancedSearch.minPercentage;
    }

    if (
      this.objAdvancedSearch.minPercentage &&
      this.objAdvancedSearch.maxPercentage
    ) {
      return (
        finalPercent >= this.objAdvancedSearch.minPercentage &&
        finalPercent <= this.objAdvancedSearch.maxPercentage
      );
    }

    return true;
  }

  openCampaignCardPopup(linkedCampaignID) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup collector_card source_campaign",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = linkedCampaignID;
    const obj = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      CampaignId: linkedCampaignID,
    };
    this.campaignService.getCampaignCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.CampaignCardData = res;
        modalRef.componentInstance.CampaignId = linkedCampaignID;
      },
      (err) => {
        this.isloading = false;
      }
    );
  }

  //
  downloadExcelTemplate() {
    //this.isloading = true;
    this.reasonService.downloadReasonTemplate().subscribe(
      (res: any) => {
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        //window.open(url);
        const filename = this.xlsxService.getFilename("Template");
        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
      },
      (error) => {
        console.log(error);
        this.isloading = false;
      }
    );
  }
  arrayBuffer: any;
  file: File;
  incomingfile(event) {
    this.file = event.target.files[0];
    this.readyToUploadChangeText();
  }

  uploadExcelTemplate() {
    if (this.file !== undefined) {
      if (this.file != null) {
        this.isloading = true;
        $("#import-data").modal("hide");
        const fd = new FormData();
        fd.append(
          "EventGuid",
          this.localStorageDataService.getLoginUserEventGuId()
        );
        fd.append("UserId", this.localStorageDataService.getLoginUserId());
        fd.append("File", this.file);
        this.reasonService.uploadResonFile(fd).subscribe(
          (res) => {
            console.log(res);
            $("#reason_doc_file").val("");
            this.file = null;
            this.reseteFile();
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
            Swal.fire({
              title: "",
              text: "Reason was uploaded successfully",
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
                if (this.isTotalPanelVisible) {
                  this.getTotalPanel();
                } else {
                  this.searchReasonData();
                }
              } else if (result.isDenied) {
              }
            });
          },
          (err) => {
            this.isloading = false;
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
        this.isloading = false;
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
      this.isloading = false;
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
  //
  //

  readyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#reasonNotReadyToUpload").show();
      $("#reasonReadyToUpload").hide();
      this.fileName = "";
    } else {
      $("#reasonNotReadyToUpload").hide();
      $("#reasonReadyToUpload").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }

  reseteFile() {
    $("#reason_doc_file").val("");
    $("#reasonNotReadyToUpload").show();
    $("#reasonReadyToUpload").hide();
    this.changeText = "";
    this.file = null;
  }
  totalPanelfilterLocalData() {
    if (this.gridData !== undefined) {
      this.gridFilterData = this.gridData.filter((o) => {
        if (!this.isFilterOpen) {
          this.objAdvancedSearch = null;
        }
        if (!this.objAdvancedSearch) {
          return true;
        }
        if (this.objAdvancedSearch) {
          const result = this.objAdvancedSearch.campaignId.find((t) => {
            if (this.isContain(o.campaignId, t.id)) {
              return true;
            }
          });
          if (result) {
            return true;
          }

          //location
          const location = this.objAdvancedSearch.locationId.find((t) => {
            if (this.isContain(o.locationId, t.id)) {
              return true;
            }
          });
          if (location) {
            return true;
          }
          //collector
          const collector = this.objAdvancedSearch.collectorId.find((t) => {
            if (this.isContain(o.collectorId, t.id)) {
              return true;
            }
          });
          if (collector) {
            return true;
          }
          //source
          const source = this.objAdvancedSearch.sourceId.find((t) => {
            if (this.isContain(o.deviceId, t.id)) {
              return true;
            }
          });
          if (source) {
            return true;
          }
        }
        return false;
      });

      this.totalRecord = this.gridFilterData.length;
    }
  }

  //
  recordSelectedArray = [];
  isSelected = false;
  isBulkReasonSelected = false;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  selectRecord(event, type, reasonId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isBulkCheckbox = true;
        this.isSelected = true;
        this.isBulkReasonSelected = true;
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.reasonId);
        });
        let count = $("#reasonDonorList tr").length;
        this.displayThisPageCount =
          this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      } else {
        this.isSelected = false;
        this.isBulkReasonSelected = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.isSelected = false;
        this.isBulkReasonSelected = false;
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(reasonId)) {
          this.recordSelectedArray.push(reasonId);
        }
        if (this.recordSelectedArray.length > 0) {
          this.isSelected = true;
        }
        if (this.recordSelectedArray.length > 1) {
          this.isBulkReasonSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(Number(reasonId))) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == reasonId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 0) {
            this.isSelected = false;
          }
          if (this.recordSelectedArray.length <= 1) {
            this.isBulkReasonSelected = false;
          }
        }
        if (this.recordSelectedArray.includes(reasonId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == reasonId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 0) {
            this.isSelected = false;
          }
          if (this.recordSelectedArray.length <= 1) {
            this.isBulkReasonSelected = false;
          }
        }
      }
    }
  }
  checkselectRecord(reasonId): Boolean {
    var type = typeof reasonId;
    if (
      !this.displayThisPageArray.includes(reasonId) &&
      this.isSelectPopupShow
    ) {
      this.displayThisPageArray.push(reasonId);
    }
    if (type == "number") {
      return this.recordSelectedArray.indexOf(Number(reasonId)) > -1;
    } else {
      return this.recordSelectedArray.indexOf(reasonId) > -1;
    }
  }
  onBulkReasonReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkReasonReportComponent,
      this.modalOptions
    );

    if (this.isTabulator) {
      modalRef.componentInstance.SelectedIds = this.getUniqueSelectionIId();
      return;
    }

    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "reasonDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ReasonList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.ReasonCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.ReasonEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (this.pageSyncService.uiPageSettings["reasonList"] != undefined) {
            this.pageSyncService.uiPageSettings[
              "reasonList"
            ].reasonCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
          }
          this.isDateApply = true;
          this.getTotalPanel();
        }
      });
  }

  getUniqueSelectionIId() {
    const uniquIds = [];
    for (let index = 0; index < this.selectedRows.length; index++) {
      const element = this.selectedRows[index];
      if (uniquIds.indexOf(element.reasonId) === -1) {
        uniquIds.push(element.reasonId);
      }
    }

    return uniquIds;
  }

  onCellClick(clickEvent: CellClickEvent) {
    if (clickEvent.field === "reasonName") {
      this.openReasonCardPopup(clickEvent.rowData.reasonId);
      return;
    }

    if (clickEvent.field === "linkedCampaignName") {
      this.openCampaignCardPopup(clickEvent.rowData.linkedCampaignID);
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
    return `${val}_reason_lst`;
  }

  setGridColVisibilityNew(objectField) {
    setTimeout(() => {
      this.toggledFields.push(objectField);
      this.columnsVisibilitySubject.next(this.toggledFields);
    }, 50);
  }

  public downloadExcelNew() {
    const filename = this.xlsxService.getFilename(`Reason List`);
    this.tabulatorComponent.downLoadExcel(filename);
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  selectPopupClose() {
    this.isSelectPopupShow = false;
  }

  selectThisPage(event) {
    this.isBulkCheckbox = true;
    if (!event.target.checked) {
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
    this.isSelected = true;
    this.isBulkReasonSelected = true;
    this.recordSelectedArray = this.displayThisPageArray;
  }

  selectPopupOpen(event) {
    if (event.target.checked) {
      this.displayThisPageArray = [];
      this.isSelectPopupShow = true;
      event.target.checked = false;
      this.isBulkCheckbox = false;
      let count = $("#reasonDonorList tr").length;
      this.displayThisPageCount =
        this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      return;
    }
    this.isSelected = false;
    this.isSelectPopupShow = false;
    this.recordSelectedArray = [];
  }

  toggleSelectPopup(pageCount) {
    this.displayThisPageCount = pageCount[0];
    this.isSelectPopupShow = !this.isSelectPopupShow;
    this.selectRows = "";
  }
}
