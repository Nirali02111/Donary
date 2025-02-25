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
import * as _ from "lodash";
import * as moment from "moment";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Subject, Subscription, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { FilterDataPipe } from "src/app/commons/modules/doanry-directive.module/filter-data.pipe";
import {
  CellClickEvent,
  ColumnDefinitionType,
} from "src/app/commons/modules/tabulator/interface";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { CampaignService } from "src/app/services/campaign.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { CampaignCardPopupComponent } from "../../cards/campaign-card-popup/campaign-card-popup.component";
import { BulkCampaignReportComponent } from "../bulk-campaign-report/bulk-campaign-report.component";
import { CampaignFilterPopupComponent } from "../campaign-filter-popup/campaign-filter-popup.component";
import { SaveChargetranPopupComponent } from "../save-chargetran-popup/save-chargetran-popup.component";
import { DataTable } from "src/app/commons/modules/data-table/DataTable";
import {
  CampaignCardDataResponse,
  CampaignData,
} from "./../../../models/campaign-model";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;

const getSingularCampaign = (mem) => {
  const member = { ...mem }; // copy
  delete member.children;

  if (!mem.children || !mem.children.length) {
    return member;
  }

  return [member, _.flatMapDeep(mem.children, getSingularCampaign)];
};

@Component({
  selector: "app-campaign-list",
  templateUrl: "./campaign-list.component.html",
  standalone: false,
  styleUrls: ["./campaign-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignListComponent implements OnInit {
  private calendarSubscription: Subscription;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;
  @ViewChild(DataTable, { static: false }) svTable: DataTable;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;

  @ViewChild(TabulatorTableComponent, { static: false })
  tabulatorComponent: TabulatorTableComponent;

  popTitle: any;
  objAdvancedSearch: any;
  filtercount: number = 0;
  isloading: boolean;
  gridData: Array<CampaignData>;
  responseData: Array<CampaignData>;
  gridFilterData: Array<CampaignData>;
  gridOrgTotalPanelData: Array<CampaignData>;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  PageName: any = "CampaignList";
  isOneDate: any = false;
  totalCount: number = 0;
  mainRecord: Array<CampaignData>;
  selectedItem: any;
  gridSelectedData: Array<any>;
  isFilterOpen: boolean = false;

  isCampaignIdColVisible: boolean = true;
  isCampaignNameColVisible: boolean = true;
  isCampaignNumberColVisible: boolean = true;
  isCampaignFriendlyNameColVisible: boolean = true;
  isCampaignCreatedDateCollVisible: boolean = false;
  // TotalPanelcheck
  isCampaignOpenPledgesColVisible: Boolean = false;
  isCampaignPaymentsColVisible: Boolean = false;
  isCampaignRaisedColVisible: Boolean = false;
  isCampaignScheduledColVisible: Boolean = false;
  isCampaignPledgesCountColVisible: Boolean = false;
  isCampaignPaymentsCountColVisible: Boolean = false;
  isCampaignScheduledCountColVisible: Boolean = false;
  isChipTypeSelected: Boolean = false;
  isSelected = false;
  tempSearch: Array<any>;
  fileName: string = "";
  colFields = [
    {
      id: 1,
      title: "",
      isTotalPanel: true,
      class: "",
      items: [
        {
          colName: "CAMPAIGNNAME",
          isVisible: this.isCampaignNameColVisible,
          colId: "campaignNameId",
          sortName: "campaign",
          width: "18%",
        },
        {
          colName: "CAMPAIGNNUMBER",
          isVisible: this.isCampaignNumberColVisible,
          colId: "campaignNumberId",
          sortName: "campaignNumber",
          width: "10%",
        },
        {
          colName: "FRIENDLYNAME",
          isVisible: this.isCampaignFriendlyNameColVisible,
          colId: "campaignFriendlyNameId",
          sortName: "friendlyName",
          width: "20%",
        },
        {
          colName: "DATECREATED",
          isVisible: this.isCampaignCreatedDateCollVisible,
          colId: "campaignCreatedDateId",
          sortName: "createdDate",
          width: "20%",
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
          isVisible: this.isCampaignPaymentsColVisible,
          colId: "CampaignpaymentsId",
          sortName: "payments",
          width: "10%",
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: this.isCampaignPaymentsCountColVisible,
          colId: "campaignpaymentscountId",
          sortName: "paymentsCount",
          width: "10%",
        },
        {
          colName: "OPENPLEDGES",
          isVisible: this.isCampaignOpenPledgesColVisible,
          colId: "CampaignopenPledgesId",
          sortName: "openPledges",
          width: "10%",
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: this.isCampaignPledgesCountColVisible,
          colId: "campaignpledgescountId",
          sortName: "pledgesCount",
          width: "10%",
        },
        {
          colName: "SCHEDULED",
          isVisible: this.isCampaignScheduledColVisible,
          colId: "CampaignscheduledId",
          sortName: "scheduled",
          width: "10%",
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: this.isCampaignScheduledCountColVisible,
          colId: "campaignschedulescountId",
          sortName: "schedulesCount",
          width: "10%",
        },
        {
          colName: "TOTAL",
          isVisible: this.isCampaignRaisedColVisible,
          colId: "CampaignraisedId",
          sortName: "raised",
          width: "10%",
        },
      ],
    },
  ];

  isOpenLevel1: boolean = false;
  isOpenLevel2: boolean = false;
  isOpenLevel3: boolean = false;
  isOpenLevel4: boolean = false;

  grandTotalInfoChip: number = 0;
  paidInfoChip: number = 0;
  pendingInfoChip: number = 0;
  balanceInfoChip: number = 0;
  isClicked: Boolean = false;
  isOpen: Boolean = false;

  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 2, itemName: "Reason" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  isTotalPanelVisible: Boolean = false;
  isTotalPanelShowAll: Boolean = false;
  isActiveCampaign: boolean = true;
  isinitialize = 0;
  gridTotalPanelData: Array<any>;
  paymentTypeChipData: Array<any>;
  gridShowPanelData: Array<any>;
  gridSumByData: Array<any>;
  panelTitle: string = "SHOWTOTALPANEL";
  showTotalPanelPermission: boolean = this.localStorageDataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Campaigns")
    .map((x) => x.isActive)[0];

  campaignCardPayments = [];
  campaignMasters = [];
  collectorCardPayments = [];
  deviceCardPayments = [];
  donorCardPayments = [];
  locationCardPayments = [];
  reasonCardPayments = [];
  eventId: string;
  uiPageSettingId = null;
  uiPageSetting: any;
  file: File;
  changeText = "";
  isCampaignUpload: boolean = false;
  searchArrowIcon: boolean = false;
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
  campValue: boolean = false;

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
      title: "CAMPAIGNNAME",
      visible: true,
      field: "campaign",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
      cssClass: "tabulator-class tabulator-campaign-name",
    },
    {
      title: "CAMPAIGNNUMBER",
      visible: true,
      field: "campaignNumber",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "FRIENDLYNAME",
      visible: true,
      field: "friendlyName",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
    },
    {
      title: "DATECREATED",
      visible: true,
      field: "createdDate",
      frozen: false,
      formatter: "customComponent",
      headerHozAlign: "center",
      widthGrow: 1,
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
    },
    {
      title: "COUNTOFPAYMENTS",
      field: "paymentsCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
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
    },
    {
      title: "COUNTOFPLEDGES",
      field: "pledgesCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
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
    },
    {
      title: "COUNTOFSCHEDULES",
      field: "schedulesCount",
      headerHozAlign: "center",
      visible: false,
      frozen: false,
      isTotalPanel: true,
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
    },
  ];
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  lastUpdatedColumns: any;
  columnsVisibilitySubject = new Subject<any>();
  toggledFields: ColumnDefinitionType[] = [];
  private analytics = inject(AnalyticsService);

  constructor(
    private campaignService: CampaignService,
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private filterPipe: FilterDataPipe,
    private uiPageSettingService: UIPageSettingService,
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
    this.analytics.visitedCampaigns();
    this.colfieldsValue = this.pageSyncService.campaignFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyCampaign) {
      this.cardType = this.pageSyncService.sumbyCampaign;
    }
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });

    this.pageSyncService.calculateTimeDifference("list");
    this.eventId = this.localStorageDataService.getLoginUserEventGuId();
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localStorageDataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localStorageDataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Campaigns")
          .map((x) => x.isActive)[0];
      }
    });
    this.listSyncSubscription = this.commonMethodService
      .getListSync()
      .subscribe((res: any) => {
        if (res) {
          this.searchCampaignList();
        }
      });
    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    this.commonMethodService.getCampaignLst().subscribe((res: any) => {
      if (res) {
        $("#searchCampaign").val("");
        this.searchCampaignList();
        this.commonMethodService.getCampaignList();
      }
    });
    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isCampaignListClicked &&
        this.pageSyncService.campaignList == null)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localStorageDataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "campaigns",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isCampaignIdColVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);
            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.campaignSumBy;
              this.objAdvancedSearch = this.uiPageSetting.campaignSearchitem;
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
              this.searchCampaignList();
              this.getTotalPanel();
            } else {
              this.panelTitle = "Show Total Panel";
              this.searchCampaignList();
            }
          } else {
            this.searchCampaignList();
          }
        } else {
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.campaignList == null
          ) {
            this.searchCampaignList();
          } else {
            let campData = this.pageSyncService.campaignList;
            this.resListModification(campData);
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["campaignList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["campaignList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      let campData = this.pageSyncService.campaignList;
      this.resListModification(campData);
      this.campValue = true;
      if (this.pageSyncService.campaignlistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.campaignlistTotalPanel);
      }
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

    if (this.pageSyncService.campaignFilterData) {
      this.advancedFilterData(this.pageSyncService.campaignFilterData);
    }
    if (this.pageSyncService.CampaignCalDate) {
      if (
        this.pageSyncService.CampaignCalDate.startDate == null &&
        this.pageSyncService.CampaignCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.CampaignCalDate.startDate),
        endDate: moment(this.pageSyncService.CampaignCalDate.endDate),
      };
      this.EngHebCalPlaceholder =
        this.pageSyncService.CampaignEngCalPlaceholder;
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
    (this.isCampaignIdColVisible = uiPageSetting.isCampaignIdColVisible),
      (this.isCampaignNumberColVisible =
        uiPageSetting.isCampaignNumberColVisible),
      (this.isCampaignNameColVisible = uiPageSetting.isCampaignNameColVisible),
      (this.isCampaignFriendlyNameColVisible =
        uiPageSetting.isCampaignFriendlyNameColVisible),
      (this.isCampaignCreatedDateCollVisible =
        uiPageSetting.isCampaignCreatedDateCollVisible),
      (this.isCampaignPaymentsColVisible =
        uiPageSetting.isCampaignPaymentsColVisible),
      (this.isCampaignOpenPledgesColVisible =
        uiPageSetting.isCampaignOpenPledgesColVisible),
      (this.isCampaignScheduledColVisible =
        uiPageSetting.isCampaignScheduledColVisible),
      (this.isCampaignRaisedColVisible =
        uiPageSetting.isCampaignRaisedColVisible),
      (this.isCampaignPaymentsCountColVisible =
        uiPageSetting.isCampaignPaymentsCountColVisible),
      (this.isCampaignPledgesCountColVisible =
        uiPageSetting.isCampaignPledgesCountColVisible),
      (this.isCampaignScheduledCountColVisible =
        uiPageSetting.isCampaignScheduledCountColVisible),
      (this.isTotalPanelVisible = uiPageSetting.campaignIsTotalPanelVisible);
    this.pageSyncService.campaignlistTotalPanel =
      !uiPageSetting.campaignIsTotalPanelVisible;
    this.EngHebCalPlaceholder =
      this.pageSyncService.CampaignEngCalPlaceholder ||
      uiPageSetting.EngHebCalPlaceholder ||
      this.EngHebCalPlaceholder;
    this.pageSyncService.CampaignEngCalPlaceholder = this.EngHebCalPlaceholder;

    if (uiPageSetting?.campaignCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.campaignCalendarPlaceHolderId;

    if (
      uiPageSetting.campaignStartDate == null &&
      uiPageSetting.campaignEndDate == null
    )
      this.selectedDateRange = undefined;
    else
      this.selectedDateRange = {
        startDate: moment(uiPageSetting.campaignStartDate),
        endDate: moment(uiPageSetting.campaignEndDate),
      };

    this.pageSyncService.uiPageSettings["campaignList"] = uiPageSetting;
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }
  initMultiSelect() {
    this.cardFilter = [
      { id: 2, itemName: "Reason", counts: this.reasonCardPayments.length - 1 },
      {
        id: 3,
        itemName: "Location",
        counts: this.locationCardPayments.length - 1,
      },
      {
        id: 5,
        itemName: "Collector",
        counts: this.collectorCardPayments.length - 1,
      },
      { id: 7, itemName: "Device", counts: this.deviceCardPayments.length - 1 },
      { id: 6, itemName: "Donor", counts: this.donorCardPayments.length - 1 },
    ];
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.changeDetectorRef.detectChanges();
    this.modalOptions = {
      centered: true,
      size: "lg",
      windowClass: "campaign_filter",
    };

    const modalRef = this.commonMethodService.openPopup(
      CampaignFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
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
    } else {
      this.filterLocalData();
    }
    this.changeDetectorRef.detectChanges();
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

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
      .groupBy("campaignId")
      .map((props, id: string) => ({
        ..._.head(props),
        campaignId: id,
        payments: _.sumBy(props, "payments"),
        openPledges: _.sumBy(props, "openPledges"),
        scheduled: _.sumBy(props, "scheduled"),
        raised: _.sumBy(props, "raised"),
      }))
      .value();
  }

  showAllTotalData() {
    const groupedRes = this.getGroupValue();

    const merged = _.merge(
      _.keyBy(this.gridData, "campaignId"),
      _.keyBy(groupedRes, "campaignId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, this.gridData, (o, t) => {
      return o.campaignId == t.campaignId;
    });
    const values = _.values(inCommon);

    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
    // $table.floatThead('reflow');
  }

  showOnlyTotalData() {
    const groupedRes = this.getGroupValue();
    const merged = _.merge(
      _.keyBy(this.gridData, "campaignId"),
      _.keyBy(groupedRes, "campaignId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, groupedRes, (o, t) => {
      return o.campaignId == t.campaignId;
    });
    const values = _.values(inCommon);
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData.filter((x) => x.raised != 0);
    this.totalRecord = this.gridSumByData.length;
    this.cardTypeChange(this.cardType);
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.isActiveCampaign = true;
      this.showOnlyTotalData();
    } else {
      this.isActiveCampaign = false;
      this.showAllTotalData();
    }
    this.initMultiSelect();
  }

  getTotalPanel() {
    this.isloading = false;
    this.isCampaignOpenPledgesColVisible = true;
    this.isCampaignPaymentsColVisible = true;
    this.isCampaignRaisedColVisible = true;
    this.isCampaignScheduledColVisible = true;
    if (this.isActiveCampaign) {
      this.totalPanelfilterLocalData();
      this.showOnlyTotalData();
    } else {
      this.showAllTotalData();
    }
    if (this.gridFilterData.length > 0) {
      // added for zero remove
      let resultArray = [];
      const result = this.reasonCardPayments.map((value) => {
        if (value.payments > 0) {
          resultArray.push(value);
        }
      });
      this.paymentTypeChipData = resultArray;
      this.changeSortType(this.sortType);
      this.initMultiSelect();
      this.changeDetectorRef.detectChanges();
    }
  }

  totalPanelfilterLocalData() {
    if (this.gridData !== undefined) {
      this.gridFilterData = this.gridData.filter(() => {
        if (!this.isFilterOpen) {
          this.objAdvancedSearch = null;
        }
        if (!this.objAdvancedSearch) {
          return true;
        }
      });
      this.totalRecord = this.gridFilterData.length;
    }
  }

  SaveChargeTransaction(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup save_chargetran",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveChargetranPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.campaignId = campaignId;
  }

  GetPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.itemName).toString()
          : null;
      this.gridFilterData = this.gridSumByData;
      switch (cardTypeValue) {
        case "Campaign":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Reason":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Location":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Collector":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Device":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Donor":
          if (objPaymentTypeChip.id == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            this.gridFilterData = this.gridFilterData.filter((obj) =>
              this.deepTotalFilter(obj, objPaymentTypeChip.id, 1)
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
      }
    }
  }

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbyCampaign = this.cardType;
    // this.gridData=this.gridData;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = this.campaignCardPayments;
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = this.reasonCardPayments;
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = this.collectorCardPayments;
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = this.donorCardPayments;
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = this.locationCardPayments;
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = this.deviceCardPayments;
    }
    this.changeSortType(this.sortType);
  }

  TogglePanel(isVisible) {
    this.pageSyncService.campaignlistTotalPanel = isVisible;
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
    this.isTotalPanelShowAll = true;
    if (this.pageSyncService.totalPanelcampaignList) {
      this.resListModification(this.pageSyncService.totalPanelcampaignList);
    } else {
      if (this.campValue == false) {
        this.searchCampaignList();
      } else {
        this.campValue = false;
      }
    }
  }

  closeTotalPanel() {
    this.isTotalPanelVisible = false;
    this.panelTitle = "SHOWTOTALPANEL";
    this.isCampaignOpenPledgesColVisible = false;
    this.isCampaignPaymentsColVisible = false;
    this.isCampaignRaisedColVisible = false;
    this.isCampaignScheduledColVisible = false;

    this.isCampaignPledgesCountColVisible = false;
    this.isCampaignPaymentsCountColVisible = false;
    this.isCampaignScheduledCountColVisible = false;

    this.isinitialize = 0;
    this.isTotalPanelShowAll = false;
    this.isChipTypeSelected = false;
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
    this.gridData = this.gridShowPanelData;
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData.length;
    this.resListModification(this.pageSyncService.campaignList);
    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    // $table.floatThead('reflow');
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    //  $table.floatThead('reflow');
  }

  expandLevel1(id) {
    $("#" + id).show();
    $("#colarrow_" + id).addClass("expand_arrow");
    $("#parent_div_" + id).addClass("active");
  }

  collapseLevel1(id) {
    $("#" + id).hide();
    $("#colarrow_" + id).removeClass("expand_arrow");
    $("#parent_div_" + id).removeClass("active");
  }

  OpenLevel1(id) {
    if (!$("#colarrow_" + id).hasClass("expand_arrow")) {
      this.expandLevel1(id);
    } else {
      this.collapseLevel1(id);
    }
  }

  expandLevel2(id) {
    $("#" + id).show();
    $("#colarrow_" + id).addClass("expand_arrow");
    $("#level1_div_" + id).addClass("active");
  }

  collapseLevel2(id) {
    $("#" + id).hide();
    $("#colarrow_" + id).removeClass("expand_arrow");
    $("#level1_div_" + id).removeClass("active");
  }

  OpenLevel2(id) {
    if (!$("#colarrow_" + id).hasClass("expand_arrow")) {
      this.expandLevel2(id);
    } else {
      this.collapseLevel2(id);
    }
  }

  expandLevel3(id) {
    $("#" + id).show();
    $("#colarrow_" + id).addClass("expand_arrow");
    $("#level2_div_" + id).addClass("active");
  }

  collapseLevel3(id) {
    $("#" + id).hide();
    $("#colarrow_" + id).removeClass("expand_arrow");
    $("#level2_div_" + id).removeClass("active");
  }

  OpenLevel3(id) {
    if (!$("#colarrow_" + id).hasClass("expand_arrow")) {
      this.expandLevel3(id);
    } else {
      this.collapseLevel3(id);
    }
  }

  expandLevel4(id) {
    //this.isOpenLevel4=true;
    $("#" + id).show();
    $("#colarrow_" + id).addClass("expand_arrow");
    $("#level3_div_" + id).addClass("active");
  }

  collapseLevel4(id) {
    //this.isOpenLevel4=false;
    $("#" + id).hide();
    $("#colarrow_" + id).removeClass("expand_arrow");
    $("#level3_div_" + id).removeClass("active");
  }

  OpenLevel4(id) {
    if (!$("#colarrow_" + id).hasClass("expand_arrow")) {
      this.expandLevel4(id);
    } else {
      this.collapseLevel4(id);
    }
  }

  expandLevel5(id) {
    $("#" + id).show();
    $("#colarrow_" + id).addClass("expand_arrow");
    $("#level4_div_" + id).addClass("active");
  }

  collapseLevel5(id) {
    $("#" + id).hide();
    $("#colarrow_" + id).removeClass("expand_arrow");
    $("#level4_div_" + id).removeClass("active");
  }
  OpenLevel5(id) {
    if (!$("#colarrow_" + id).hasClass("expand_arrow")) {
      this.expandLevel5(id);
    } else {
      this.collapseLevel5(id);
    }
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.campaignFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "campaign#":
        this.isCampaignIdColVisible = isVisible;
        this.uiPageSetting.isCampaignIdColVisible = isVisible;
        break;
      case "campaignnumber":
        this.isCampaignNumberColVisible = isVisible;
        this.uiPageSetting.isCampaignNumberColVisible = isVisible;
        break;
      case "campaignname":
        this.isCampaignNameColVisible = isVisible;
        this.uiPageSetting.isCampaignNameColVisible = isVisible;
        break;
      case "friendlyname":
        this.isCampaignFriendlyNameColVisible = isVisible;
        this.uiPageSetting.isCampaignFriendlyNameColVisible = isVisible;
        break;
      case "datecreated":
        this.isCampaignCreatedDateCollVisible = isVisible;
        this.uiPageSetting.isCampaignCreatedDateCollVisible = isVisible;
        break;
      // Total Panel
      case "payments":
        this.isCampaignPaymentsColVisible = isVisible;
        this.uiPageSetting.isCampaignPaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isCampaignOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isCampaignOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isCampaignScheduledColVisible = isVisible;
        this.uiPageSetting.isCampaignScheduledColVisible = isVisible;
        break;
      case "total":
        this.isCampaignRaisedColVisible = isVisible;
        this.uiPageSetting.isCampaignRaisedColVisible = isVisible;
        break;
      case "countofpayments":
        this.isCampaignPaymentsCountColVisible = isVisible;
        this.uiPageSetting.isCampaignPaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isCampaignPledgesCountColVisible = isVisible;
        this.uiPageSetting.isCampaignPledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isCampaignScheduledCountColVisible = isVisible;
        this.uiPageSetting.isCampaignScheduledCountColVisible = isVisible;
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
      case "campaign#":
        return this.isCampaignIdColVisible;
      case "campaignnumber":
        return this.isCampaignNumberColVisible;
      case "campaignname":
        return this.isCampaignNameColVisible;
      case "friendlyname":
        return this.isCampaignFriendlyNameColVisible;
      case "datecreated":
        return this.isCampaignCreatedDateCollVisible;
      case "payments":
        return this.isCampaignPaymentsColVisible;
      case "openpledges":
        return this.isCampaignOpenPledgesColVisible;
      case "scheduled":
        return this.isCampaignScheduledColVisible;
      case "total":
        return this.isCampaignRaisedColVisible;
      case "countofpayments":
        return this.isCampaignPaymentsCountColVisible;
      case "countofpledges":
        return this.isCampaignPledgesCountColVisible;
      case "countofschedules":
        return this.isCampaignScheduledCountColVisible;
    }
  }

  SaveLayout() {
    let setting = {
      isCampaignIdColVisible: this.isCampaignIdColVisible,
      isCampaignNumberColVisible: this.isCampaignNumberColVisible,
      isCampaignNameColVisible: this.isCampaignNameColVisible,
      isCampaignFriendlyNameColVisible: this.isCampaignFriendlyNameColVisible,
      isCampaignCreatedDateCollVisible: this.isCampaignCreatedDateCollVisible,
      isCampaignPaymentsColVisible: this.isCampaignPaymentsColVisible,
      isCampaignOpenPledgesColVisible: this.isCampaignOpenPledgesColVisible,
      isCampaignScheduledColVisible: this.isCampaignScheduledColVisible,
      isCampaignRaisedColVisible: this.isCampaignRaisedColVisible,
      isCampaignPaymentsCountColVisible: this.isCampaignPaymentsCountColVisible,
      isCampaignPledgesCountColVisible: this.isCampaignPledgesCountColVisible,
      isCampaignScheduledCountColVisible:
        this.isCampaignScheduledCountColVisible,
      campaignStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      campaignEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      campaignSumBy: this.cardType,
      campaignSearchitem: this.objAdvancedSearch,
      campaignIsTotalPanelVisible: this.isTotalPanelVisible,
      campaignCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "campaigns",
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

  checkContent(obj: CampaignData, keyword: string): Boolean {
    return (
      (obj.campaignId &&
        obj.campaignId.toString().toLowerCase().indexOf(keyword) > -1) ||
      (obj.campaign &&
        obj.campaign.toString().toLowerCase().indexOf(keyword) > -1) ||
      (obj.friendlyName &&
        obj.friendlyName.toLowerCase().toString().indexOf(keyword) > -1) ||
      (obj.campaignNumber &&
        obj.campaignNumber
          .toString()
          .toLowerCase()
          .toString()
          .indexOf(keyword) > -1)
    );
  }

  deepFilter(
    element: CampaignData,
    keyword: string,
    level: number
  ): CampaignData | null {
    if (this.checkContent(element, keyword)) {
      return element;
    } else if (element.children != null) {
      let i;
      let result = null;

      for (i = 0; result == null && i < element.children.length; i++) {
        if (level === 1) {
          this.expandLevel2(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 2);
        }

        if (level === 2) {
          this.expandLevel3(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 3);
        }

        if (level === 3) {
          this.expandLevel4(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 4);
        }
      }
      return result;
    }
    return null;
  }

  checkTotalFilterContent(obj: CampaignData, keyword: string): Boolean {
    keyword = keyword.toString();
    return (
      (obj.campaignId &&
        obj.campaignId.toString().toLowerCase().indexOf(keyword) > -1) ||
      (obj.reasonId && obj.reasonId.includes(keyword)) ||
      (obj.accountId && obj.accountId.includes(keyword)) ||
      (obj.locationId && obj.locationId.includes(keyword)) ||
      (obj.collectorId && obj.collectorId.includes(keyword)) ||
      (obj.deviceId && obj.deviceId.includes(keyword))
    );
  }

  deepTotalFilter(
    element: CampaignData,
    keyword: string,
    level: number
  ): CampaignData | null {
    if (this.checkTotalFilterContent(element, keyword)) {
      return element;
    } else if (element.children != null) {
      let i;
      let result = null;

      for (i = 0; result == null && i < element.children.length; i++) {
        if (level === 1) {
          this.expandLevel2(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 2);
        }

        if (level === 2) {
          this.expandLevel3(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 3);
        }

        if (level === 3) {
          this.expandLevel4(element.campaignId);
          result = this.deepFilter(element.children[i], keyword, 4);
        }
      }
      return result;
    }
    return null;
  }

  searchFull(keyword: string) {
    this.searchArrowIcon = true;
    if (keyword == "") {
      this.filterLocalData();
    }
    if (this.isTotalPanelVisible) {
      if (this.isChipTypeSelected) {
        var record = this.gridSelectedData;
        this.gridData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else {
        record = this.gridSumByData;
        this.totalRecord = this.gridSumByData.length;
      }
    } else {
      record = this.gridData;
      this.totalRecord = this.gridData.length;
    }

    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        const SingleList = _.flatMapDeep(record, getSingularCampaign);

        let filteredRecord = this.filterPipe.transform(SingleList, searchValue);

        this.gridFilterData = filteredRecord;
        this.filterRecord = filteredRecord.length;
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
      }
    }
  }

  sequentialXLSXData(
    item: CampaignData,
    data: Array<Object>,
    parentName: string
  ) {
    if (item) {
      let campaignName = item && item.campaign;
      let campaignNumber = item && item.campaignNumber;
      let friendlyName = item && item.friendlyName;
      let children = item && item.children;

      let row = {};
      this.isdownloadExcelGuid =
        this.commonMethodService.idDownloadExcelEventGuid();
      if (this.isCampaignNumberColVisible) {
        row["Number"] = campaignNumber;
      }

      if (this.isCampaignNameColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("NAME")
          : "Name";
        row[ColName] = campaignName;
      }
      if (this.isCampaignFriendlyNameColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("FRIENDLYNAME")
          : "Friendly Name";
        row[ColName] = friendlyName;
      }
      // Total Panel
      if (this.isCampaignPaymentsColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("PAYMENTS")
          : "Payments";
        row[ColName] = Number(item.payments);
      }
      if (this.isCampaignPaymentsCountColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
          : "Count Of Payments";
        row[ColName] = item.paymentsCount;
      }
      if (this.isCampaignOpenPledgesColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("OPENPLEDGES")
          : "Open Pledges";
        row[ColName] = Number(item.openPledges);
      }
      if (this.isCampaignPledgesCountColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("COUNTOFPLEDGES")
          : "Count Of Pledges";
        row[ColName] = item.pledgesCount;
      }
      if (this.isCampaignScheduledColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("SCHEDULED")
          : "Scheduled";
        row[ColName] = Number(item.scheduled);
      }
      if (this.isCampaignScheduledCountColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
          : "Count Of Schedules";
        row[ColName] = item.schedulesCount;
      }
      if (this.isCampaignRaisedColVisible) {
        let ColName: any = this.isdownloadExcelGuid
          ? this.commonMethodService.getColName("TOTAL")
          : "Total";
        row[ColName] = Number(item.raised);
      }
      row["Parent"] = parentName;

      data.push(row);

      if (children) {
        Object.values(children).forEach((itemc: CampaignData) => {
          this.sequentialXLSXData(itemc, data, campaignName);
        });
      }
    } else {
      return;
    }
  }

  downloadExcel() {
    if (this.isTabulator) {
      this.downloadExcelNew();
      return;
    }

    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data: Array<Object> = [];
    if (results) {
      Object.values(results).forEach((item: CampaignData) => {
        this.sequentialXLSXData(item, data, "");
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Campaign List");

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
    this.changeDetectorRef.detectChanges();
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    var sortId = sortType.map((s) => s.id).toString();
    var allTypeCard = this.paymentTypeChipData.filter((x) => x.type == "ALL");
    this.selectedItem = allTypeCard[0];
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.type != "ALL"
    );
    if (sortId == 1) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.type > b.type ? 1 : b.type > a.type ? -1 : 0
      );
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 2) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) => (a.type > b.type ? 1 : b.type > a.type ? -1 : 0))
        .reverse();
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 3) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) =>
          a.raised > b.raised ? 1 : b.raised > a.raised ? -1 : 0
        )
        .reverse();
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 4) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.raised > b.raised ? 1 : b.raised > a.raised ? -1 : 0
      );
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    }
  }

  filterActive(list) {
    return _.filter(list, (item) => {
      if (item.children) item.children = this.filterActive(item.children);
      return item.status != "InActive";
    });
  }

  searchCampaignList() {
    let objSearch = this.objAdvancedSearch;
    if (this.objAdvancedSearch) {
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
    const formdata = {
      EventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      IsTotalRequired: this.isTotalPanelShowAll,
      FromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      ToDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      campaignName:
        this.objAdvancedSearch && this.objAdvancedSearch.campaignName,
      friendlyName:
        this.objAdvancedSearch && this.objAdvancedSearch.friendlyName,
      status: this.objAdvancedSearch && this.objAdvancedSearch.status,
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
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
    this.isloading = true;
    this.detectChanges();
    this.campaignService.getCampaignList(formdata).subscribe(
      (res) => {
        this.isloading = false;

        if (res) {
          this.objAdvancedSearch = objSearch;
          this.isFiltered = false;
          this.gridData = res.campaignMasters;
          this.gridFilterData = this.gridData;
          if (!this.isTotalPanelShowAll) {
            this.pageSyncService.campaignList = res;
          } else {
            this.pageSyncService.totalPanelcampaignList = res;
          }
          this.pageSyncService.isCampaignListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(res);
        } else {
          this.gridFilterData = null;
          this.paymentTypeChipData = [];
          this.initMultiSelect();
        }

        this.commonMethodService.sendDataLoaded("campaigns");
        this.detectChanges();
      },
      (err) => {
        this.isloading = false;
        console.log(err);
      }
    );
  }

  resListModification(res) {
    this.responseData = res.campaignMasters;
    this.commonMethodService.campaignMastersList = this.gridData;
    this.mainRecord = res.campaignMasters;
    this.gridOrgTotalPanelData = res.campaignMasters;
    this.gridShowPanelData = res.campaignMasters;
    this.campaignCardPayments = res.campaignCardPayments;
    this.campaignMasters = res.campaignMasters;
    this.collectorCardPayments = res.collectorCardPayments;
    this.deviceCardPayments = res.deviceCardPayments;
    this.donorCardPayments = res.donorCardPayments;
    this.locationCardPayments = res.locationCardPayments;
    this.reasonCardPayments = res.reasonCardPayments;

    this.grandTotalInfoChip = res.grandTotal;
    this.paidInfoChip = res.paid;
    this.pendingInfoChip = res.pending;
    this.balanceInfoChip = res.balance;
    this.gridTotalPanelData = res.campaignMasters;
    // for local filter end
    if (this.isTotalPanelShowAll) {
      if (this.objAdvancedSearch) {
        this.gridTotalPanelData = this.FilterTotalPanelData(
          this.objAdvancedSearch
        );
        if (this.objAdvancedSearch.donorId) {
          this.donorCardPayments = res.donorCardPayments.filter((x) =>
            this.objAdvancedSearch.donorId.includes(x.id).toString()
          );
        }
        if (this.objAdvancedSearch.collectorId) {
          this.collectorCardPayments = res.collectorCardPayments.filter((x) =>
            this.objAdvancedSearch.collectorId.includes(x.id).toString()
          );
        }
        if (this.objAdvancedSearch.sourceId) {
          this.deviceCardPayments = res.deviceCardPayments.filter((x) =>
            this.objAdvancedSearch.sourceId.includes(x.id).toString()
          );
        }
        if (this.objAdvancedSearch.locationId) {
          this.locationCardPayments = res.locationCardPayments.filter((x) =>
            this.objAdvancedSearch.locationId.includes(x.id).toString()
          );
        }
        if (this.objAdvancedSearch.reasonId) {
          this.reasonCardPayments = res.reasonCardPayments.filter(
            (x) =>
              x.id == Number(this.objAdvancedSearch.reasonId.map((x) => x.id))
          );
        }
      }
      this.getTotalPanel();
      this.isinitialize = 1;
      this.initMultiSelect();
      this.objAdvancedSearch = { status: "Active" };
      this.filterLocalData();
    } else {
      this.gridFilterData = this.getGroupValue();
      this.initMultiSelect();
      this.objAdvancedSearch = { status: "Active" };
      this.filterLocalData();
      this.gridData = this.gridFilterData;
      this.totalCount = this.gridFilterData.length;
      this.totalRecord = this.gridFilterData.length;
    }
  }

  OpenCampaignCard(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup campaign_card",
    };
    var objCampaignCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      CampaignId: campaignId,
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
            ? this.objAdvancedSearch.donorId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
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
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    this.campaignService
      .getCampaignCard(objCampaignCard)
      .subscribe((res: CampaignCardDataResponse) => {
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }
          modalRef.componentInstance.CampaignCardData = res;
          modalRef.componentInstance.CampaignId = campaignId;
          modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
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

  FilterTotalPanelData(objAdSearch) {
    var filteredTotalPanel = this.gridOrgTotalPanelData;
    if (objAdSearch) {
      if (objAdSearch.status) {
        filteredTotalPanel = filteredTotalPanel.filter(
          (f) => f.status === objAdSearch.status
        );
      }
      if (objAdSearch.donorId && objAdSearch.accountId) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          f.accountId.includes(
            objAdSearch.accountId.map((x) => x.id).toString()
          )
        );
      }
      if (objAdSearch.reasonId && objAdSearch.reasonId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          f.reasonId.includes(objAdSearch.reasonId.map((x) => x.id).toString())
        );
      }
      if (objAdSearch.locationId && objAdSearch.locationId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          f.locationId.includes(
            objAdSearch.locationId.map((x) => x.id).toString()
          )
        );
      }
      if (objAdSearch.collectorId && objAdSearch.collectorId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          f.collectorId.includes(
            objAdSearch.collectorId.map((x) => x.id).toString()
          )
        );
      }
      if (objAdSearch.sourceId && objAdSearch.sourceId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          f.deviceId.includes(objAdSearch.sourceId.map((x) => x.id).toString())
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
    let parentList = this.responseData.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      if (o.children) {
        const inchildren = this.inDownLevel(o.children);

        return this.inAllFields(o) || (inchildren && inchildren.length !== 0);
      }

      return this.inAllFields(o);
    });

    this.gridFilterData = parentList.map((o) => {
      if (o.children) {
        const inchildren = this.inDownLevel(o.children);
        return {
          ...o,
          children: inchildren,
        };
      }
      return o;
    });
    this.gridData = this.gridFilterData;
    this.totalRecord = this.gridFilterData.length;
    this.gridShowPanelData = this.gridFilterData;
  }

  inDownLevel(list) {
    return _.filter(list, (item) => {
      if (item.children) item.children = this.inDownLevel(item.children);
      return this.inAllFields(item);
    });
  }

  inAllFields(o) {
    if (
      this.objAdvancedSearch &&
      this.objAdvancedSearch.status &&
      this.objAdvancedSearch.status == "Active"
    ) {
      return (
        o.status == "Active" &&
        this.isContain(o.campaign, this.objAdvancedSearch.campaignName) &&
        this.isContain(o.friendlyName, this.objAdvancedSearch.friendlyName)
      );
    }

    if (
      this.objAdvancedSearch &&
      this.objAdvancedSearch.status &&
      this.objAdvancedSearch.status == "InActive"
    ) {
      return (
        o.status == "InActive" &&
        this.isContain(o.campaign, this.objAdvancedSearch.campaignName) &&
        this.isContain(o.friendlyName, this.objAdvancedSearch.friendlyName)
      );
    }

    const cname = this.isContain(
      o.campaign,
      this.objAdvancedSearch && this.objAdvancedSearch.campaignName
    );
    const fname = this.isContain(
      o.friendlyName,
      this.objAdvancedSearch && this.objAdvancedSearch.friendlyName
    );

    if (cname && fname) {
      return true;
    }
    return false;
  }
  // check box report
  recordSelectedArray = [];
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  selectRecord(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isSelected = true;
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.campaignId);
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
    if (type == "number") {
      return this.recordSelectedArray.indexOf(Number(accountId)) > -1;
    } else {
      return this.recordSelectedArray.indexOf(accountId) > -1;
    }
  }
  onBulkCampaignReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkCampaignReportComponent,
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
  //

  reseteFile() {
    $("#campaign_doc_file").val("");
    $("#campaignNotReadyToUpload").show();
    $("#campaignReadyToUpload").hide();
    this.changeText = "";
    this.file = null;
  }

  readyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#campaignNotReadyToUpload").show();
      $("#campaignReadyToUpload").hide();
      this.fileName = "";
    } else {
      $("#campaignNotReadyToUpload").hide();
      $("#campaignReadyToUpload").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }

  incomingfile(event) {
    this.file = event.target.files[0];
    this.readyToUploadChangeText();
  }

  uploadExcelTemplate() {
    if (this.file !== undefined) {
      if (this.file != null) {
        this.isloading = true;
        this.isCampaignUpload = true;
        const fd = new FormData();
        fd.append("RequestId", "");
        fd.append("File", this.file);
        fd.append(
          "EventGuid",
          this.localStorageDataService.getLoginUserEventGuId()
        );
        fd.append("CreatedBy", this.localStorageDataService.getLoginUserId());
        this.campaignService.uploadResonFile(fd).subscribe(() => {
          $("#campaign_doc_file").val("");
          this.file = null;
          this.reseteFile();
          this.isCampaignUpload = false;
          Swal.fire({
            title: "",
            text: "Campaigns  file enqueued successfully see import updates in users email",
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
                this.searchCampaignList();
                $("#import-campaign-data").modal("hide");
              }
            } else if (result.isDenied) {
            }
          });
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

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "campaignDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "CampaignList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.selectedDateRange = items.obj;
          this.pageSyncService.CampaignCalDate = items.obj;
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.CampaignEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (
            this.pageSyncService.uiPageSettings["campaignList"] != undefined
          ) {
            this.pageSyncService.uiPageSettings[
              "campaignList"
            ].campaignCalendarPlaceHolderId =
              this.hebrewEngishCalendarService.id;
          }
          this.searchCampaignList();
        }
      });
  }

  ngOnDestroy() {
    this.listSyncSubscription.unsubscribe();
  }

  getUniqueSelectionIId() {
    const uniquIds = [];
    for (let index = 0; index < this.selectedRows.length; index++) {
      const element = this.selectedRows[index];
      if (uniquIds.indexOf(element.campaignId) === -1) {
        uniquIds.push(element.campaignId);
      }
    }

    return uniquIds;
  }

  onCellClick(clickEvent: CellClickEvent) {
    if (clickEvent.field === "campaign") {
      this.OpenCampaignCard(clickEvent.rowData.campaignId);
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
    return `${val}_campaign_lst`;
  }

  setGridColVisibilityNew(objectField) {
    setTimeout(() => {
      this.toggledFields.push(objectField);
      this.columnsVisibilitySubject.next(this.toggledFields);
    }, 50);
  }

  public downloadExcelNew() {
    const filename = this.xlsxService.getFilename("Campaign List");

    this.tabulatorComponent.downLoadExcel(filename);
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }
}
