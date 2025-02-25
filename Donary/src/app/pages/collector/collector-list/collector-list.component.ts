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
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CollectorService } from "src/app/services/collector.service";
import * as XLSX from "xlsx";
import { CollectorCardPopupComponent } from "../../cards/collector-card-popup/collector-card-popup.component";
import { CollectorFilterPopupComponent } from "./../collector-filter-popup/collector-filter-popup.component";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import { BuikCollectorReportComponent } from "../buik-collector-report/buik-collector-report.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { Subject, Subscription, of } from "rxjs";
import { environment } from "./../../../../environments/environment";
import {
  CellClickEvent,
  ColumnDefinitionType,
} from "src/app/commons/modules/tabulator/interface";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
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
}
declare var $: any;
@Component({
  selector: "app-collector-list",
  templateUrl: "./collector-list.component.html",
  styleUrls: ["./collector-list.component.scss"],
  standalone:false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectorListComponent implements OnInit {
  @ViewChild(DataTable, { static: false }) svTable: DataTable;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;

  @ViewChild(TabulatorTableComponent, { static: false })
  tabulatorComponent: TabulatorTableComponent;

  selectedDateRange: any;
  popTitle: any;
  objAdvancedSearch: any = { status: "0" };
  isloading: boolean;
  gridData: Array<any>;
  gridShowPanelData: Array<any>;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridOrgData: Array<any>;
  gridSelectedData: Array<any>;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  filtercount: number = 0;
  selectedItem: any;
  isSelected = false;
  isSumCardOpen: boolean = false;
  uiPageSettingId = null;
  uiPageSetting: any;
  isDevEnv: boolean;
  PageName: any = "CollectorList";
  isOneDate: any = false;
  showTotalPanelPermission: boolean = this.localStorageDataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Collectors")
    .map((x) => x.isActive)[0];
  colFields = [
    {
      id: 1,
      title: "",
      isTotalPanel: true,
      items: [
        {
          colName: "ACCT#",
          isVisible: true,
          colId: "collectorAccountId",
          sortName: "accountNum",
        },
        {
          colName: "FULLNAME",
          isVisible: true,
          colId: "collectorFullNameId",
          sortName: "fullName",
        },
        {
          colName: "ADDRESS",
          isVisible: true,
          colId: "collectorAddressId",
          sortName: "address",
        },
        {
          colName: "GROUP",
          isVisible: true,
          colId: "collectorGroupId",
          sortName: "group",
        },
        {
          colName: "CLASS",
          isVisible: true,
          colId: "collectorClassId",
          sortName: "class",
        },
        {
          colName: "PHONE/EMAIL",
          isVisible: true,
          colId: "collectorPhoneEmailId",
          sortName: "phoneLabels",
        },
        {
          colName: "STATUS",
          isVisible: true,
          colId: "collectorStatusId",
          sortName: "status",
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
          colId: "collectorpaymentsId",
          sortName: "payments",
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: false,
          colId: "collectorpaymentscountId",
          sortName: "paymentsCount",
        },
        {
          colName: "OPENPLEDGES",
          isVisible: true,
          colId: "collectoropenPledgesId",
          sortName: "openPledges",
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: false,
          colId: "collectorpledgescountId",
          sortName: "pledgesCount",
        },
        {
          colName: "SCHEDULED",
          isVisible: true,
          colId: "collectorscheduledId",
          sortName: "scheduled",
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: false,
          colId: "collectorschedulescountId",
          sortName: "schedulesCount",
        },
        {
          colName: "TOTAL",
          isVisible: true,
          colId: "collectorraisedId",
          sortName: "raised",
        },
      ],
    },
  ];

  isCollectorAccntNoColVisible: boolean = true;
  isCollectorFullNameColVisible: boolean = true;
  isCollectorAddressColVisible: boolean = true;
  isCollectorGroupColVisible: boolean = true;
  isCollectorClassColVisible: boolean = true;
  isCollectorPhoneLabelColVisible: boolean = true;
  isCollectorStatusColVisible: boolean = true;
  isClicked: boolean = false;
  isOpen: boolean = false;
  // TotalPanelcheck
  isCollectorOpenPledgesColVisible: boolean = false;
  isCollectorPaymentsColVisible: boolean = false;
  isCollectorRaisedColVisible: boolean = false;
  isCollectorScheduledColVisible: boolean = false;
  isCollectorPledgesCountColVisible: boolean = false;
  isCollectorPaymentsCountColVisible: boolean = false;
  isCollectorScheduledCountColVisible: boolean = false;

  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }]; // [{ "id": 5, "itemName": "Collector" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  isTotalPanelVisible: boolean = false;
  isTotalPanelShowAll: boolean = true;
  isinitialize = 0;
  gridTotalPanelData: Array<any>;
  gridOrgTotalPanelData: Array<any>;
  paymentTypeChipData: Array<any>;
  gridSumByData: Array<any>;
  panelTitle: string = "SHOWTOTALPANEL";
  isChipTypeSelected: boolean = false;
  isFilterOpen: boolean = false;
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
      title: "ACCT#",
      visible: true,
      field: "accountNum",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "FULLNAME",
      visible: true,
      field: "fullName",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
      cssClass: "tabulator-class",
    },
    {
      title: "ADDRESS",
      visible: true,
      field: "address",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "GROUP",
      visible: true,
      field: "group",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "CLASS",
      visible: true,
      field: "class",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "PHONE/EMAIL",
      visible: true,
      field: "phoneLabels",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "STATUS",
      visible: true,
      field: "status",
      frozen: false,
      formatter: "customComponent",
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
  isDisableExcel: boolean = false;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  isDateApply: boolean = false;
  gridDatafiltered: boolean = false;
  lastUpdatedColumns: any;
  columnsVisibilitySubject = new Subject<any>();
  toggledFields: ColumnDefinitionType[] = [];
  private analytics = inject(AnalyticsService);

  constructor(
    private collectorService: CollectorService,
    private localStorageDataService: LocalstoragedataService,
    private totalPanelService: TotalPanelService,
    private uiPageSettingService: UIPageSettingService,
    public commonMethodService: CommonMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private xlsxService: XLSXService
  ) {
    this.isTabulator =
      this.localStorageDataService.isTabulatorEvent() && this.isDevEnv;
  }

  ngOnInit() {
    this.analytics.visitedCollectors();
    this.colfieldsValue = this.pageSyncService.collectorFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyCollector) {
      this.cardType = this.pageSyncService.sumbyCollector;
    }
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localStorageDataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localStorageDataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Collectors")
          .map((x) => x.isActive)[0];
      }
    });
    this.pageSyncService.calculateTimeDifference("list");
    this.listSyncSubscription = this.commonMethodService
      .getListSync()
      .subscribe((res: any) => {
        if (res) {
          this.searchCollectorData();
        }
      });

    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    this.commonMethodService.getCollectorLst().subscribe((res: any) => {
      if (res) {
        $("#searchCollector").val("");
        this.searchCollectorData();
        this.commonMethodService.getCollectorList();
      }
    });

    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isCollectorListClicked &&
        this.pageSyncService.collectorList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localStorageDataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "collectors",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isCollectorAccntNoColVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);
            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.collectorSumBy;
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
              this.searchCollectorData();
              this.getTotalPanel();
            } else {
              this.gridDatafiltered = true;
              this.panelTitle = "Show Total Panel";
              this.searchCollectorData();
            }
          } else {
            this.searchCollectorData();
          }
        } else {
          this.gridDatafiltered = true;
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.collectorList == undefined
          ) {
            this.searchCollectorData();
          } else {
            this.gridData = this.pageSyncService.collectorList;
            this.resListModification(this.gridData);
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    } else {
      this.gridDatafiltered = true;
      if (this.pageSyncService.uiPageSettings["collectorList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["collectorList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      this.gridData = this.pageSyncService.collectorList;
      this.resListModification(this.gridData);
      this.isloading = false;
      if (this.pageSyncService.collectorlistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.collectorlistTotalPanel);
      }
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

    if (this.pageSyncService.collectorFilterData) {
      this.advancedFilterData(this.pageSyncService.collectorFilterData, false);
    }
    if (this.pageSyncService.CollectorCalDate) {
      if (
        this.pageSyncService.CollectorCalDate.startDate == null &&
        this.pageSyncService.CollectorCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.CollectorCalDate.startDate),
        endDate: moment(this.pageSyncService.CollectorCalDate.endDate),
      };
      this.EngHebCalPlaceholder =
        this.pageSyncService.CollectorEngCalPlaceholder;
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
    this.isCollectorAccntNoColVisible =
      uiPageSetting.isCollectorAccntNoColVisible;
    this.isCollectorFullNameColVisible =
      uiPageSetting.isCollectorFullNameColVisible;
    this.isCollectorAddressColVisible =
      uiPageSetting.isCollectorAddressColVisible;
    this.isCollectorGroupColVisible = uiPageSetting.isCollectorGroupColVisible;
    this.isCollectorClassColVisible = uiPageSetting.isCollectorClassColVisible;
    this.isCollectorPhoneLabelColVisible =
      uiPageSetting.isCollectorPhoneLabelColVisible;
    this.isCollectorStatusColVisible =
      uiPageSetting.isCollectorStatusColVisible;
    this.isCollectorPaymentsColVisible =
      uiPageSetting.isCollectorPaymentsColVisible;
    this.isCollectorOpenPledgesColVisible =
      uiPageSetting.isCollectorOpenPledgesColVisible;
    this.isCollectorScheduledColVisible =
      uiPageSetting.isCollectorScheduledColVisible;
    this.isCollectorRaisedColVisible =
      uiPageSetting.isCollectorRaisedColVisible;
    this.isCollectorPaymentsCountColVisible =
      uiPageSetting.isCollectorPaymentsCountColVisible;
    this.isCollectorPledgesCountColVisible =
      uiPageSetting.isCollectorPledgesCountColVisible;
    this.isCollectorScheduledCountColVisible =
      uiPageSetting.isCollectorScheduledCountColVisible;
    this.isTotalPanelVisible = uiPageSetting.collectorIsTotalPanelVisible;
    this.pageSyncService.collectorlistTotalPanel =
      !uiPageSetting.collectorIsTotalPanelVisible;
    this.objAdvancedSearch = uiPageSetting.collectorSearchitem;
    this.EngHebCalPlaceholder =
      this.pageSyncService.CollectorEngCalPlaceholder ||
      uiPageSetting.EngHebCalPlaceholder ||
      this.EngHebCalPlaceholder;
    this.pageSyncService.CollectorEngCalPlaceholder = this.EngHebCalPlaceholder;

    if (uiPageSetting?.collectorCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.collectorCalendarPlaceHolderId;

    if (
      uiPageSetting.collectorStartDate == null &&
      uiPageSetting.collectorEndDate == null
    )
      this.selectedDateRange = undefined;
    else
      this.selectedDateRange = {
        startDate: moment(uiPageSetting.collectorStartDate),
        endDate: moment(uiPageSetting.collectorEndDate),
      };

    this.pageSyncService.collectorlistTotalPanel =
      !uiPageSetting.collectorIsTotalPanelVisible;
    this.pageSyncService.uiPageSettings["collectorList"] = uiPageSetting;
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.listSyncSubscription.unsubscribe();
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }
  initMultiSelect() {
    const sumByCampaign = _(this.gridTotalPanelData)
      .filter((s) => s.campaignId != null && s.collectorId != null)
      .groupBy("campaignId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByReason = _(this.gridTotalPanelData)
      .filter((s) => s.reasonId != null && s.collectorId != null)
      .groupBy("reasonId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByLocation = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null && s.collectorId != null)
      .groupBy("locationId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByCollector = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null)
      .groupBy("collectorId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDevice = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null && s.deviceId != null)
      .groupBy("deviceId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDonor = _(this.gridTotalPanelData)
      .filter((s) => s.accountId != null && s.collectorId != null)
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

  CalendarFocus() {
    this.pickerDirective.open();
  }

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
      .groupBy("collectorId")
      .map((props, id: string) => ({
        ..._.head(props),
        locationId: id,
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
        parentCampaignIds: _.map(props, (o) => {
          return o.parentCampaignId;
        }),
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
      }))
      .value();
  }

  showAllTotalData() {
    const groupedRes = this.getGroupValue();

    const merged = _.merge(
      _.keyBy(this.gridData, "collectorId"),
      _.keyBy(groupedRes, "collectorId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, this.gridData, (o, t) => {
      return o.collectorId == t.collectorId;
    });
    const values = _.values(inCommon);

    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
    this.gridDatafiltered = true;
    //var $table = $('table.redesign_table');
    //$table.floatThead('reflow');
  }

  groupRes: any;
  showOnlyTotalData(data = this.gridData) {
    // new changed on 26-09
    const dd = _.intersectionWith(
      this.gridData,
      this.gridTotalPanelData,
      (o, t) => {
        return o.collectorId == t.collectorId;
      }
    );

    const groupedRes = this.getGroupValue();
    this.groupRes = this.GetGroupList(
      this.groupBy(this.gridTotalPanelData, (s) => s.collectorId)
    );
    const values = _.map(dd, (o) => {
      let found = _.find(groupedRes, (t) => {
        return o.collectorId == t.collectorId;
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
    this.gridDatafiltered = true;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
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

  GetGroupList(groupByList) {
    var myArray = [];
    groupByList.forEach((element) => {
      myArray.push.apply(myArray, element);
    });

    return myArray;
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
    if (this.pageSyncService.CollectortotalPanel && !this.isDateApply) {
      this.Panel(this.pageSyncService.CollectortotalPanel);
    } else {
      this.isDateApply = false;
      this.totalPanelService.getTotals(objTotalPanel).subscribe(
        (res: Array<PanelRes>) => {
          this.pageSyncService.CollectortotalPanel = res;
          this.Panel(res);
        },
        (error) => {
          this.isloading = false;
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

      this.isCollectorOpenPledgesColVisible = true;
      this.isCollectorPaymentsColVisible = true;
      this.isCollectorRaisedColVisible = true;
      this.isCollectorScheduledColVisible = true;

      if (this.gridFilterData.length > 0) {
        this.initMultiSelect();
      } else {
        this.paymentTypeChipData = [];
        this.initMultiSelect();
      }
    } else {
      this.paymentTypeChipData = [];
      this.totalRecord = 0;
      // this.gridData = null;
      this.gridFilterData = [];
      this.gridSumByData = this.gridFilterData;
      this.initMultiSelect();
    }
    this.isinitialize = 1;
    this.gridDatafiltered = true;
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

  totalPanelfilterLocalData() {
    this.gridFilterData = (this.gridData || []).filter((o) => {
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
        // const collector = this.objAdvancedSearch.collectorId.find((t)=>
        // {
        //   if (this.isContain(o.collectorId, t.id)) {
        //         return true
        //       }
        // });
        // if (collector) {
        //   return true
        // }
        //source
        const source = this.objAdvancedSearch.sourceId.find((t) => {
          if (this.isContain(o.deviceId, t.id)) {
            return true;
          }
        });
        if (source) {
          return true;
        }
        //reason
        const reason = this.objAdvancedSearch.reasonId.find((t) => {
          if (this.isContain(o.reasonId, t.id)) {
            return true;
          }
        });
        if (reason) {
          return true;
        }
      }
      return false;
    });

    this.totalRecord = this.gridFilterData.length;
  }

  datesUpdated(event) {
    if (this.isinitialize == 1) {
      if (!event.startDate) {
        this.selectedDateRange = undefined;
        this.isinitialize = 0;
      } else {
        this.selectedDateRange = event;
      }
      //this.selectedDateRange=event;
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var campaignCollectorIds = this.GetCampaignCollector(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignCollectorIds.indexOf(Number(s.collectorId)) >= 0) ||
                s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.collectorId == item.collectorId
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonCollectorIds = this.GetReasonCollector(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonCollectorIds.indexOf(Number(s.collectorId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var LocationIds = this.GetLocationCollector(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                LocationIds.indexOf(Number(s.collectorId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var collectorIDs = this.GetCollector(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.collectorIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                collectorIDs.indexOf(Number(s.collectorId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var deviceCollectorIds = this.GetDeviceCollector(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceCollectorIds.indexOf(Number(s.collectorId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
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
                .filter((s) => s.collectorId == item.collectorId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.collectorId == item.collectorId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var accountCollectorIds = this.GetDonorCollector(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                accountCollectorIds.indexOf(Number(s.collectorId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.collectorId == item.collectorId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.collectorId == item.collectorId
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

  GetCampaignCollector(campaignId) {
    var campaignCollectorIds = this.groupRes
      .filter((s) => s.campaignId == campaignId)
      .map((s) => s.collectorId);
    campaignCollectorIds = campaignCollectorIds.filter(
      (n, i) => campaignCollectorIds.indexOf(n) === i
    );
    return campaignCollectorIds.filter((x) => x != null);
  }
  GetDeviceCollector(deviceId) {
    var deviceCollectorIds = this.groupRes
      .filter((s) => s.deviceId == deviceId)
      .map((s) => s.collectorId);
    deviceCollectorIds = deviceCollectorIds.filter(
      (n, i) => deviceCollectorIds.indexOf(n) === i
    );
    return deviceCollectorIds.filter((x) => x != null);
  }
  GetCollector(collectorId) {
    var collectorCollectorIds = this.groupRes
      .filter((s) => s.collectorId == collectorId)
      .map((s) => s.collectorId);
    collectorCollectorIds = collectorCollectorIds.filter(
      (n, i) => collectorCollectorIds.indexOf(n) === i
    );
    return collectorCollectorIds.filter((x) => x != null);
  }
  GetLocationCollector(locationId) {
    var CollectorIds = this.groupRes
      .filter((s) => s.locationId == locationId)
      .map((s) => s.collectorId);
    CollectorIds = CollectorIds.filter((n, i) => CollectorIds.indexOf(n) === i);
    return CollectorIds.filter((x) => x != null);
  }
  GetDonorCollector(accountId) {
    var donorCollectorIds = this.groupRes
      .filter((s) => s.accountId == accountId)
      .map((s) => s.collectorId);
    donorCollectorIds = donorCollectorIds.filter(
      (n, i) => donorCollectorIds.indexOf(n) === i
    );
    return donorCollectorIds.filter((x) => x != null);
  }
  GetReasonCollector(reasonId) {
    var reasonCollectorIds = this.groupRes
      .filter((s) => s.reasonId == reasonId)
      .map((s) => s.collectorId);
    reasonCollectorIds = reasonCollectorIds.filter(
      (n, i) => reasonCollectorIds.indexOf(n) === i
    );
    return reasonCollectorIds.filter((x) => x != null);
  }

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbyCollector = cardType;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.campaignId != null && s.collectorId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignCollector(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId &&
                    x.collectorId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.collectorId != null) ||
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
            .filter((s) => s.campaignId != null && s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
          total: allCampaignTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.reasonId != null && s.collectorId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReasonCollector(objs[0].reasonId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.reasonId == objs[0].reasonId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.reasonId == objs[0].reasonId && x.collectorId != null
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
            .filter((s) => s.reasonId != null && s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.reasonIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Reasons",
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
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.collectorId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetCollector(objs[0].collectorId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.collectorId == objs[0].collectorId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.collectorId == objs[0].collectorId &&
                      x.collectorId != null
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
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
        this.gridFilterData = this.gridFilterData.filter(
          (s) => s.collectorId != null
        );
        var allCollectorLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.collectorIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        //this.gridSumByData=this.gridFilterData;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Collectors",
          key: -2,
          total: allTotal,
          count: allCollectorLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -2,
          total: allCollectorTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.accountId != null && s.collectorId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].donor,
          key: key,
          count: this.GetDonorCollector(objs[0].accountId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.accountId == objs[0].accountId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.accountId == objs[0].accountId && x.collectorId != null
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
            .filter((s) => s.accountId != null && s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.locationId != null && s.collectorId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: this.GetLocationCollector(objs[0].locationId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.locationId == objs[0].locationId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.locationId == objs[0].locationId &&
                      x.collectorId != null
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
            .filter((s) => s.locationId != null && s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.deviceId != null && s.collectorId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].device,
          key: key,
          count: this.GetDeviceCollector(objs[0].deviceId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.deviceId == objs[0].deviceId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.deviceId == objs[0].deviceId && x.collectorId != null
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
            .filter((s) => s.deviceId != null && s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null && s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
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
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
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
    this.pageSyncService.collectorlistTotalPanel = isVisible;
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
    this.isCollectorOpenPledgesColVisible = false;
    this.isCollectorPaymentsColVisible = false;
    this.isCollectorRaisedColVisible = false;
    this.isCollectorScheduledColVisible = false;
    this.isCollectorPledgesCountColVisible = false;
    this.isCollectorPaymentsCountColVisible = false;
    this.isCollectorScheduledCountColVisible = false;
    this.isinitialize = 0;
    this.isTotalPanelShowAll = true;
    this.isChipTypeSelected = false;
    this.objAdvancedSearch = null;

    this.colFields = this.colFields.map((o) => {
      if (o.title === "Total Panel") {
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
    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }
    // this.searchCollectorData();
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData.length;
    if (this.objAdvancedSearch != null) {
      this.filterLocalData();
    }
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

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  drop(event: CdkDragDrop<string[]>) {
    //var $table = $('table.redesign_table');
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    // $table.floatThead('reflow');
  }

  openCollectorCardPopup(collectorId) {
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
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      collectorId: collectorId,
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
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.collectorService
      .getCollectorCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }
          modalRef.componentInstance.CollectorCardData = res;
          modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
        }
      });
  }
  searchCollectorData() {
    this.isloading = true;
    this.detectChanges();
    var objAdvancedSearchData: any = {};
    let objSearch = this.objAdvancedSearch;
    //this.objAdvancedSearch= {status:"Active"};
    if (this.objAdvancedSearch) {
      if (!this.objAdvancedSearch.isTotalPanel) {
        objAdvancedSearchData = {
          eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
          accountNo: this.objAdvancedSearch && this.objAdvancedSearch.accountNo,
          fullNameJewish:
            this.objAdvancedSearch && this.objAdvancedSearch.fullNameJewish,
          fullName: this.objAdvancedSearch && this.objAdvancedSearch.fullName,
          city: this.objAdvancedSearch && this.objAdvancedSearch.city,
          state: this.objAdvancedSearch && this.objAdvancedSearch.state,
          zip: this.objAdvancedSearch && this.objAdvancedSearch.zip,
          defaultLocations:
            this.objAdvancedSearch &&
            this.objAdvancedSearch.defaultLocation &&
            this.objAdvancedSearch.defaultLocation.length > 0
              ? parseInt(
                  this.objAdvancedSearch.defaultLocation.map((s) => s.id)
                )
              : null,
          group: this.objAdvancedSearch && this.objAdvancedSearch.group,
          class: this.objAdvancedSearch && this.objAdvancedSearch.class,
          address: this.objAdvancedSearch && this.objAdvancedSearch.address,
          phone: this.objAdvancedSearch && this.objAdvancedSearch.phone,
          email: this.objAdvancedSearch && this.objAdvancedSearch.email,
          father: this.objAdvancedSearch && this.objAdvancedSearch.father,
          fatherInLaw:
            this.objAdvancedSearch && this.objAdvancedSearch.fatherInLaw,
          status: this.objAdvancedSearch && this.objAdvancedSearch.status,
        };
      } else {
        objAdvancedSearchData = {
          // Get only Id values for multi select dropdown
          donors: this.objAdvancedSearch && this.objAdvancedSearch.donorId,
          locationId: this.objAdvancedSearch.locationId,
          campaignId: this.objAdvancedSearch.campaignId,
          reasonId: this.objAdvancedSearch.reasonId,
        };
      }

      this.filtercount = 1;
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
    var objsearchCollector = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      accountNo: this.objAdvancedSearch && this.objAdvancedSearch.accountNo,
      fullNameJewish:
        this.objAdvancedSearch && this.objAdvancedSearch.fullNameJewish,
      fullName: this.objAdvancedSearch && this.objAdvancedSearch.fullName,
      city: this.objAdvancedSearch && this.objAdvancedSearch.city,
      state: this.objAdvancedSearch && this.objAdvancedSearch.state,
      zip: this.objAdvancedSearch && this.objAdvancedSearch.zip,
      defaultLocations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.defaultLocation &&
        this.objAdvancedSearch.defaultLocation.length > 0
          ? parseInt(this.objAdvancedSearch.defaultLocation.map((s) => s.id))
          : null,
      group: this.objAdvancedSearch && this.objAdvancedSearch.group,
      class: this.objAdvancedSearch && this.objAdvancedSearch.class,
      address: this.objAdvancedSearch && this.objAdvancedSearch.address,
      phone: this.objAdvancedSearch && this.objAdvancedSearch.phone,
      email: this.objAdvancedSearch && this.objAdvancedSearch.email,
      father: this.objAdvancedSearch && this.objAdvancedSearch.father,
      fatherInLaw: this.objAdvancedSearch && this.objAdvancedSearch.fatherInLaw,
      status: this.objAdvancedSearch && this.objAdvancedSearch.status,
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
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.collectorService.getCollectorList(objsearchCollector).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.objAdvancedSearch = objSearch;
          /*if (this.objAdvancedSearch && this.objAdvancedSearch.status) {

        } else {
          res = res.filter(x => x.status != "InActive");
        }*/
          //this.objAdvancedSearch= {status:"Active"};

          this.totalRecord = res.length;
          for (var i = 0; i < res.length; i++) {
            res[i].openPledges = 0;
            res[i].payments = 0;
            res[i].raised = 0;
            res[i].scheduled = 0;

            if (res[i].phoneLabels && res[i].phoneLabels.indexOf(",") > -1) {
              var phoneLblArray = res[i].phoneLabels.split(",").slice(0, 2);
              var phoneNoArray = res[i].phonenumbers.split(",").slice(0, 2);

              for (var j = 0; j < phoneLblArray.length; j++) {
                if (res[i].phoneLabels2)
                  res[i].phoneLabels2 =
                    res[i].phoneLabels2 +
                    "<br>" +
                    phoneLblArray[j] +
                    ": " +
                    this.formatPhoneNumber(phoneNoArray[j]);
                else
                  res[i].phoneLabels2 =
                    phoneLblArray[j] +
                    ": " +
                    this.formatPhoneNumber(phoneNoArray[j]);
              }
            } else {
              res[i].phoneLabels2 =
                res[i].phoneLabels +
                ": " +
                this.formatPhoneNumber(res[i].phonenumbers);
            }
            if (res[i].emailLabels && res[i].emailLabels.indexOf(",") > -1) {
              var emailLblArray = res[i].emailLabels.split(",").slice(0, 2);
              var emailaddressArray = res[i].emails.split(",").slice(0, 2);

              for (var j = 0; j < emailLblArray.length; j++) {
                if (res[i].emailLabels2)
                  res[i].emailLabels2 =
                    res[i].emailLabels2 +
                    "<br>" +
                    emailLblArray[j] +
                    ": " +
                    emailaddressArray[j];
                else
                  res[i].emailLabels2 =
                    emailLblArray[j] + ": " + emailaddressArray[j];
              }
            } else {
              res[i].emailLabels2 = res[i].emailLabels + ": " + res[i].emails;
            }
          }
          this.gridOrgData = res;
          this.pageSyncService.collectorList = this.gridOrgData;
          this.pageSyncService.isCollectorListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(res);
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
          this.pageSyncService.collectorList = [];
        }
        if (this.gridFilterData == null || this.gridFilterData.length == 0) {
          this.isDisableExcel = true;
        } else {
          this.isDisableExcel = false;
        }
        this.isloading = false;
        this.commonMethodService.sendDataLoaded("collectors");
        this.detectChanges();
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
  }

  resListModification(res) {
    if (this.gridTotalPanelData && this.isTotalPanelVisible) {
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
      this.gridData = res;
      this.gridFilterData = this.gridData;
      this.gridShowPanelData = res;
      // this.objAdvancedSearch = { status: "0" }
      this.filterLocalData();
      this.gridData = this.gridFilterData;
    }
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.collectorFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    //var $table = $('table.redesign_table');
    switch (colName) {
      case "acct#":
        this.isCollectorAccntNoColVisible = isVisible;
        this.uiPageSetting.isCollectorAccntNoColVisible = isVisible;
        break;
      case "fullname":
        this.isCollectorFullNameColVisible = isVisible;
        this.uiPageSetting.isCollectorFullNameColVisible = isVisible;
        break;
      case "address":
        this.isCollectorAddressColVisible = isVisible;
        this.uiPageSetting.isCollectorAddressColVisible = isVisible;
        break;
      case "group":
        this.isCollectorGroupColVisible = isVisible;
        this.uiPageSetting.isCollectorGroupColVisible = isVisible;
        break;
      case "class":
        this.isCollectorClassColVisible = isVisible;
        this.uiPageSetting.isCollectorClassColVisible = isVisible;
        break;
      case "phone/email":
        this.isCollectorPhoneLabelColVisible = isVisible;
        this.uiPageSetting.isCollectorPhoneLabelColVisible = isVisible;
        break;
      case "status":
        this.isCollectorStatusColVisible = isVisible;
        this.uiPageSetting.isCollectorStatusColVisible = isVisible;
        break;

      // Total Panel
      case "payments":
        this.isCollectorPaymentsColVisible = isVisible;
        this.uiPageSetting.isCollectorPaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isCollectorOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isCollectorOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isCollectorScheduledColVisible = isVisible;
        this.uiPageSetting.isCollectorScheduledColVisible = isVisible;
        break;
      case "total":
        this.isCollectorRaisedColVisible = isVisible;
        this.uiPageSetting.isCollectorRaisedColVisible = isVisible;
        break;
      case "countofpayments":
        this.isCollectorPaymentsCountColVisible = isVisible;
        this.uiPageSetting.isCollectorPaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isCollectorPledgesCountColVisible = isVisible;
        this.uiPageSetting.isCollectorPledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isCollectorScheduledCountColVisible = isVisible;
        this.uiPageSetting.isCollectorScheduledCountColVisible = isVisible;
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
      case "acct#":
        return this.isCollectorAccntNoColVisible;
      case "fullname":
        return this.isCollectorFullNameColVisible;
      case "address":
        return this.isCollectorAddressColVisible;
      case "group":
        return this.isCollectorGroupColVisible;
      case "class":
        return this.isCollectorClassColVisible;
      case "phone/email":
        return this.isCollectorPhoneLabelColVisible;
      case "status":
        return this.isCollectorStatusColVisible;
      case "payments":
        return this.isCollectorPaymentsColVisible;
      case "openpledges":
        return this.isCollectorOpenPledgesColVisible;
      case "scheduled":
        return this.isCollectorScheduledColVisible;
      case "total":
        return this.isCollectorRaisedColVisible;
      case "countofpayments":
        return this.isCollectorPaymentsCountColVisible;
      case "countofpledges":
        return this.isCollectorPledgesCountColVisible;
      case "countofschedules":
        return this.isCollectorScheduledCountColVisible;
    }
  }

  SaveLayout() {
    const d = JSON.stringify(
      { columnNames: this.columnNames },
      function (key, value) {
        if (typeof value === "function") {
          return value.toString();
        } else {
          return value;
        }
      }
    );

    let setting = {
      isCollectorAccntNoColVisible: this.isCollectorAccntNoColVisible,
      isCollectorFullNameColVisible: this.isCollectorFullNameColVisible,
      isCollectorAddressColVisible: this.isCollectorAddressColVisible,
      isCollectorGroupColVisible: this.isCollectorGroupColVisible,
      isCollectorClassColVisible: this.isCollectorClassColVisible,
      isCollectorPhoneLabelColVisible: this.isCollectorPhoneLabelColVisible,
      isCollectorStatusColVisible: this.isCollectorStatusColVisible,
      isCollectorPaymentsColVisible: this.isCollectorPaymentsColVisible,
      isCollectorOpenPledgesColVisible: this.isCollectorOpenPledgesColVisible,
      isCollectorScheduledColVisible: this.isCollectorScheduledColVisible,
      isCollectorRaisedColVisible: this.isCollectorRaisedColVisible,
      isCollectorPaymentsCountColVisible:
        this.isCollectorPaymentsCountColVisible,
      isCollectorPledgesCountColVisible: this.isCollectorPledgesCountColVisible,
      isCollectorScheduledCountColVisible:
        this.isCollectorScheduledCountColVisible,
      collectorStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      collectorEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      collectorSumBy: this.cardType,
      collectorSearchitem: this.objAdvancedSearch,
      collectorIsTotalPanelVisible: this.isTotalPanelVisible,
      collectorCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "collectors",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "collector_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      CollectorFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.emtOutputCollectorFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse, true);
      }
    );
  }
  advancedFilterData(objResponse, value) {
    this.objAdvancedSearch = objResponse;
    if (this.isTotalPanelVisible) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      if (value == true) {
        this.showOnlyTotalData();
        this.searchCollectorData();
      }
    } else {
      if (value == true) {
        this.searchCollectorData();
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  search(keyword) {
    if (this.isTabulator) {
      this._search$.next(keyword);
      return;
    }

    if (keyword == "") {
      this.filterLocalData();
    }
    if (this.isTotalPanelVisible) {
      if (this.isChipTypeSelected) {
        var record = this.gridSelectedData;
        this.gridData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else {
        // var record = this.gridSumByData;
        // this.totalRecord = this.gridSumByData.length;
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
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.status &&
              obj.status.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phoneLabels &&
              obj.phoneLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phonenumbers &&
              obj.phonenumbers.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailLabels &&
              obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      if (this.isChipTypeSelected) {
        this.gridFilterData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else if (this.isTotalPanelVisible) {
        this.gridFilterData = this.gridSearchFilterData;
        this.totalRecord = this.gridSearchFilterData.length;
      } else {
        this.filterLocalData();
        //this.gridFilterData = this.gridData;
        this.totalRecord = this.gridFilterData.length;
      }
    }
  }

  public downloadExcel() {
    if (this.isTabulator) {
      this.downloadExcelNew();
      return;
    }
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let AccountNo = item && item.accountNum;
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let Address = item && item.address;
        let Group = item && item.group;
        let Class = item && item.class;
        let PhoneLabel = item && item.phonelabel;
        let Status = item && item.status;
        let row = {};
        if (this.isCollectorAccntNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACCOUNT#")
            : "Account #";
          row[ColName] = AccountNo;
        }
        if (this.isCollectorFullNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FULLNAME")
            : "Full Name";
          row[ColName] = FullName;
        }
        if (this.isCollectorFullNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FULLNAMEJEWISH")
            : "Full Name Jewish";
          row[ColName] = FullNameJewish;
        }
        if (this.isCollectorAddressColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ADDRESS")
            : "Address";
          row[ColName] = item.address + "," + item.cityStateZip;
        }
        if (this.isCollectorGroupColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("GROUP")
            : "Group";
          row[ColName] = Group;
        }
        if (this.isCollectorClassColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CLASS")
            : "Class";
          row[ColName] = Class;
        }
        if (this.isCollectorPhoneLabelColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PHONE")
            : "Phone";
          row[ColName] = item.phoneLabels + " - " + item.phonenumbers;
        }
        if (this.isCollectorPhoneLabelColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] =
            item.emailLabels != null
              ? item.emailLabels + " - " + item.emails
              : "";
        }
        // Total Panel
        if (this.isCollectorPaymentsColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTS")
            : "Payments";
          row[ColName] = Number(item.payments);
        }
        if (this.isCollectorPaymentsCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
            : "Count Of Payments";
          row[ColName] = item.paymentsCount;
        }
        if (this.isCollectorOpenPledgesColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("OPENPLEDGES")
            : "Open Pledges";
          row[ColName] = Number(item.openPledges);
        }
        if (this.isCollectorPledgesCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPLEDGES")
            : "Count Of Pledges";
          row[ColName] = item.pledgesCount;
        }
        if (this.isCollectorScheduledColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULED")
            : "Scheduled";
          row[ColName] = Number(item.scheduled);
        }
        if (this.isCollectorScheduledCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
            : "Count Of Schedules";
          row[ColName] = item.schedulesCount;
        }
        if (this.isCollectorRaisedColVisible) {
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

    const filename = this.xlsxService.getFilename("Collector List");
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
  }

  emtOutputPageChange(data) {
    this.svTable.setPage(data.activePage, data.rowsOnPage);
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
      if (this.objAdvancedSearch.reasonId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.reasonId.map((x) => x.id).includes(f.reasonId)
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
        this.objAdvancedSearch.status == "0"
      ) {
        return o.status == "Active" && this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.status &&
        this.objAdvancedSearch.status == "-1"
      ) {
        return o.status == "InActive" && this.inAllFields(o);
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
      this.isContain(o.accountNum, this.objAdvancedSearch.accountNo) &&
      this.isContain(o.address, this.objAdvancedSearch.address) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.city) &&
      this.isContain(o.class, this.objAdvancedSearch.class) &&
      this.isContain(o.emails, this.objAdvancedSearch.email) &&
      this.isContain(o.father, this.objAdvancedSearch.father) &&
      this.isContain(o.fatherInLaw, this.objAdvancedSearch.fatherInLaw) &&
      this.isContain(o.fullName, this.objAdvancedSearch.fullName) &&
      this.isContain(o.fullNameJewish, this.objAdvancedSearch.fullNameJewish) &&
      this.isContain(o.group, this.objAdvancedSearch.group) &&
      this.isContain(o.phonenumbers, this.objAdvancedSearch.phone) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.state) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.zip) &&
      this.filterDefaultLocationType(o)
    );
  }

  filterDefaultLocationType(o) {
    if (
      !this.objAdvancedSearch.defaultLocation ||
      this.objAdvancedSearch.defaultLocation.length === 0
    ) {
      return true;
    }

    if (!o.defaultLocationId) {
      return false;
    }
    const result = this.objAdvancedSearch.typeId.find(
      (t) => t.id == o.defaultLocationId
    );
    if (result) {
      return true;
    }
  }
  // check box report
  recordSelectedArray = [];

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  selectRecord(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isSelected = true;
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.collectorId);
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
        if (!this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.push(accountId);
        }
        if (this.recordSelectedArray.length > 0) {
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == accountId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 0) {
            this.isSelected = false;
          }
        }
        if (this.recordSelectedArray.includes(Number(accountId))) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == accountId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 0) {
            this.isSelected = false;
          }
        }
      }
    }
  }
  checkselectRecord(accountId): Boolean {
    var type = typeof accountId;
    //return this.recordSelectedArray.includes(accountId);
    if (type == "number") {
      return this.recordSelectedArray.indexOf(Number(accountId)) > -1;
    } else {
      return this.recordSelectedArray.indexOf(accountId) > -1;
    }
  }
  onBulkCollectorReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BuikCollectorReportComponent,
      this.modalOptions
    );
    if (
      this.selectedDateRange != undefined &&
      this.selectedDateRange.startDate != null
    ) {
      modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
    }

    if (this.isTabulator) {
      modalRef.componentInstance.SelectedIds = this.getUniqueSelectionIId();
      return;
    }

    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
  }
  isHebrew_lng(s) {
    var c,
      whietlist =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    // if whitelist string doesn't include the character, break
    for (c in s) // character in string
      if (!whietlist.includes(s[c])) {
        if (s[c] != " ") {
          return true;
        }
      }
    return false;
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "collectoDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "CollectorList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.CollectorCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.CollectorEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (
            this.pageSyncService.uiPageSettings["collectorList"] != undefined
          ) {
            this.pageSyncService.uiPageSettings[
              "collectorList"
            ].collectorCalendarPlaceHolderId =
              this.hebrewEngishCalendarService.id;
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
      if (uniquIds.indexOf(element.collectorId) === -1) {
        uniquIds.push(element.collectorId);
      }
    }

    return uniquIds;
  }

  onCellClick(clickEvent: CellClickEvent) {
    if (clickEvent.field === "fullName") {
      this.openCollectorCardPopup(clickEvent.rowData.collectorId);
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
    return `${val}_colector_lst`;
  }

  setGridColVisibilityNew(objectField) {
    setTimeout(() => {
      this.toggledFields.push(objectField);
      this.columnsVisibilitySubject.next(this.toggledFields);
    }, 50);
  }
  public downloadExcelNew() {
    const filename = this.xlsxService.getFilename("Collector List");
    this.tabulatorComponent.downLoadExcel(filename);
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
