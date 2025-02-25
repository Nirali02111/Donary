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
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { LocationService } from "src/app/services/location.sevice";
import * as XLSX from "xlsx";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import { LocationFilterPopupComponent } from "../location-filter-popup/location-filter-popup.component";
import { BulkCustomReportComponent } from "../bulk-custom-report/bulk-custom-report.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { Subscription } from "rxjs";
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
  selector: "app-location-list",
  templateUrl: "./location-list.component.html",
  styleUrls: ["./location-list.component.scss"],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationListComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild("sv", { static: true }) svTable: DataTable;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;
  objAdvancedSearch: any;
  filtercount: number = 0;
  isloading: boolean;
  gridData: Array<any>;
  gridOrgData: Array<any>;
  PageName: any = "LocationList";
  isOneDate: any = false;
  gridShowPanelData: Array<any>;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridSelectedData: Array<any>;
  gridOrgTotalPanelData: Array<any>;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  selectedItem: any;
  popTitle: any;
  showAll: boolean = false;
  isDisable: boolean = false;
  disableTitle: string = "";
  isChipTypeSelected: Boolean = false;
  isFilterOpen: boolean = false;
  isSelected = false;
  recordSelectedArray = [];
  showTotalPanelPermission: boolean = this.localStorageDataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Locations")
    .map((x) => x.isActive)[0];

  colFields = [
    {
      id: 1,
      title: "",
      isTotalPanel: true,
      items: [
        {
          colName: "LOCATION",
          isVisible: true,
          colId: "LocationId",
          sortName: "locationName",
        },
        {
          colName: "NUSACH",
          isVisible: true,
          colId: "LocationnusachId",
          sortName: "nusach",
        },
        {
          colName: "ADDRESS",
          isVisible: true,
          colId: "LocationaddressId",
          sortName: "address",
        },
        {
          colName: "RABBI",
          isVisible: true,
          colId: "LocationrabbiId",
          sortName: "rabbi",
        },
        {
          colName: "PHONE",
          isVisible: true,
          colId: "LocationphoneId",
          sortName: "phone",
        },
        {
          colName: "SHORTNAME",
          isVisible: true,
          colId: "LocationshortnameId",
          sortName: "locationNameShort",
        },
        {
          colName: "TYPE",
          isVisible: true,
          colId: "LocationtypeId",
          sortName: "locationType",
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
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: false,
          colId: "reasonpaymentscountId",
          sortName: "paymentsCount",
        },
        {
          colName: "OPENPLEDGES",
          isVisible: true,
          colId: "reasonopenPledgesId",
          sortName: "openPledges",
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: false,
          colId: "reasonpledgescountId",
          sortName: "pledgesCount",
        },
        {
          colName: "SCHEDULED",
          isVisible: true,
          colId: "reasonscheduledId",
          sortName: "scheduled",
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: false,
          colId: "reasonschedulescountId",
          sortName: "schedulesCount",
        },
        {
          colName: "TOTAL",
          isVisible: true,
          colId: "reasonraisedId",
          sortName: "raised",
        },
      ],
    },
  ];

  isLocationNameColVisible: boolean = true;
  isLocationNusachColVisible: boolean = true;
  isLocationBusinessColVisible: boolean = true;
  isLocationPhoneColVisible: boolean = true;
  isLocationAddressColVisible: boolean = true;
  isLocationRabbiColVisible: boolean = true;
  isLocationShortNameColVisible: boolean = true;
  isLocationTypeColVisible: boolean = true;
  rowCount: number = 25;
  isClicked: boolean = false;
  isOpen: boolean = false;
  isSumCardOpen: boolean = false;

  // TotalPanelcheck
  isLocationOpenPledgesColVisible: boolean = false;
  isLocationPaymentsColVisible: boolean = false;
  isLocationRaisedColVisible: boolean = false;
  isLocationScheduledColVisible: boolean = false;
  isLocationPledgesCountColVisible: boolean = false;
  isLocationPaymentsCountColVisible: boolean = false;
  isLocationScheduledCountColVisible: boolean = false;

  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  isTotalPanelVisible: Boolean = false;
  isTotalPanelShowAll: Boolean = true;
  isinitialize = 0;
  gridTotalPanelData: Array<any>;
  paymentTypeChipData: Array<any>;
  gridSumByData: Array<any>;
  panelTitle: string = "SHOWTOTALPANEL";
  uiPageSettingId = null;
  uiPageSetting: any;
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
  isDisableExcel: boolean = false;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  isDateApply: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private totalPanelService: TotalPanelService,
    public locationService: LocationService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.analytics.visitedLocations();
    this.colfieldsValue = this.pageSyncService.locationFieldsCol;
    this.objAdvancedSearch = {
      status: "Active",
      donorId: [],
      campaignId: [],
      locationId: [],
      collectorId: [],
      sourceId: [],
      reasonId: [],
      linkedCampaignName: "",
    };
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyLocation) {
      this.cardType = this.pageSyncService.sumbyLocation;
    }
    this.pageSyncService.calculateTimeDifference("list");
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localStorageDataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localStorageDataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Locations")
          .map((x) => x.isActive)[0];
      }
    });
    this.listSyncSubscription = this.commonMethodService
      .getListSync()
      .subscribe((res: any) => {
        if (res) {
          this.searchLocationData();
          this.commonMethodService.ListSyncObservable.next(false);
        }
      });
    this.initMultiSelect();
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    this.commonMethodService.getLocationLst().subscribe((res: any) => {
      if (res) {
        $("#searchLocation").val("");
        this.searchLocationData();
        this.commonMethodService.getLocationList();
      }
    });
    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isLocationListClicked &&
        this.pageSyncService.locationList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localStorageDataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "locations",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isLocationNameColVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);

            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.locationSumBy;
              this.objAdvancedSearch = this.uiPageSetting.locationSearchitem;
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
              this.searchLocationData();
              this.getTotalPanel();
            } else {
              this.panelTitle = "Show Total Panel";
              this.searchLocationData();
            }
          } else {
            this.searchLocationData();
          }
        } else {
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.locationList == undefined
          ) {
            this.searchLocationData();
          } else {
            this.gridOrgData = this.pageSyncService.locationList;
            this.resListModification(this.gridOrgData);
            this.isloading = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["locationList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["locationList"];
        this.setUIPageSettings(this.uiPageSetting);
      }
      this.gridOrgData = this.pageSyncService.locationList;
      this.resListModification(this.gridOrgData);
      this.isloading = false;
      if (this.pageSyncService.locationlistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.locationlistTotalPanel);
      }
      this.changeDetectorRef.detectChanges();
    }
    if (this.pageSyncService.locationFilterData) {
      this.advancedFilterData(this.pageSyncService.locationFilterData, false);
    }
    if (this.pageSyncService.LocationCalDate) {
      if (
        this.pageSyncService.LocationCalDate.startDate == null &&
        this.pageSyncService.LocationCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.LocationCalDate.startDate),
        endDate: moment(this.pageSyncService.LocationCalDate.endDate),
      };
      this.EngHebCalPlaceholder =
        this.pageSyncService.LocationEngCalPlaceholder;
    }
  }

  setUIPageSettings(uiPageSetting) {
    this.isLocationNameColVisible = uiPageSetting.isLocationNameColVisible;
    this.isLocationNusachColVisible = uiPageSetting.isLocationNusachColVisible;
    this.isLocationBusinessColVisible =
      uiPageSetting.isLocationBusinessColVisible;
    this.isLocationPhoneColVisible = uiPageSetting.isLocationPhoneColVisible;
    this.isLocationAddressColVisible =
      uiPageSetting.isLocationAddressColVisible;
    this.isLocationRabbiColVisible = uiPageSetting.isLocationRabbiColVisible;
    this.isLocationShortNameColVisible =
      uiPageSetting.isLocationShortNameColVisible;
    this.isLocationTypeColVisible = uiPageSetting.isLocationTypeColVisible;
    this.isLocationPaymentsColVisible =
      uiPageSetting.isLocationPaymentsColVisible;
    this.isLocationOpenPledgesColVisible =
      uiPageSetting.isLocationOpenPledgesColVisible;
    this.isLocationScheduledColVisible =
      uiPageSetting.isLocationScheduledColVisible;
    this.isLocationRaisedColVisible = uiPageSetting.isLocationRaisedColVisible;
    this.isLocationPaymentsCountColVisible =
      uiPageSetting.isLocationPaymentsCountColVisible;
    this.isLocationPledgesCountColVisible =
      uiPageSetting.isLocationPledgesCountColVisible;
    this.isLocationScheduledCountColVisible =
      uiPageSetting.isLocationScheduledCountColVisible;
    this.isTotalPanelVisible = uiPageSetting.locationIsTotalPanelVisible;
    this.EngHebCalPlaceholder =
      this.pageSyncService.LocationEngCalPlaceholder ||
      uiPageSetting.EngHebCalPlaceholder ||
      this.EngHebCalPlaceholder;
    this.pageSyncService.LocationEngCalPlaceholder = this.EngHebCalPlaceholder;

    if (uiPageSetting?.locationCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.locationCalendarPlaceHolderId;

    if (
      uiPageSetting.locationStartDate == null &&
      uiPageSetting.locationEndDate == null
    )
      this.selectedDateRange = undefined;
    else
      this.selectedDateRange = {
        startDate: moment(uiPageSetting.locationStartDate),
        endDate: moment(uiPageSetting.locationEndDate),
      };

    this.pageSyncService.locationlistTotalPanel =
      !uiPageSetting.locationIsTotalPanelVisible;
    this.pageSyncService.uiPageSettings["locationList"] = uiPageSetting;
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
      .filter((s) => s.campaignId != null && s.locationId != null)
      .groupBy("campaignId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByReason = _(this.gridTotalPanelData)
      .filter((s) => s.reasonId != null && s.locationId != null)
      .groupBy("reasonId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByLocation = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null)
      .groupBy("locationId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByCollector = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null && s.locationId != null)
      .groupBy("collectorId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDevice = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null)
      .groupBy("deviceId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDonor = _(this.gridTotalPanelData)
      .filter((s) => s.accountId != null && s.locationId != null)
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

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  onArrowClick() {
    this.isClicked = true;
  }

  onTotalBtnClick() {
    this.isOpen = true;
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
      .groupBy("locationId")
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
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
        parentCampaignIds: _.map(props, (o) => {
          return o.deviceId;
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

  GetGroupList(groupByList) {
    var myArray = [];
    groupByList.forEach((element) => {
      myArray.push.apply(myArray, element);
    });

    return myArray;
  }

  showAllTotalData(data = this.gridData) {
    const groupedRes = this.getGroupValue();

    const merged = _.merge(
      _.keyBy(data, "locationID"),
      _.keyBy(groupedRes, "locationId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, this.gridData, (o, t) => {
      return o.locationId == t.locationId;
    });
    const values = _.values(inCommon);

    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
    //var $table = $('table.redesign_table');
    //$table.floatThead('reflow');
  }
  groupRes: any;
  showOnlyTotalData(data = this.gridData) {
    const dd = _.intersectionWith(
      this.gridData,
      this.gridTotalPanelData,
      (o, t) => {
        return o.locationID == t.locationId;
      }
    );
    const groupedRes = this.getGroupValue();

    this.groupRes = this.GetGroupList(
      this.groupBy(this.gridTotalPanelData, (s) => s.locationId)
    );
    const values = _.map(dd, (o) => {
      let found = _.find(groupedRes, (t) => {
        return o.locationID == t.locationId;
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

    // const groupedRes = this.getGroupValue();

    // const merged = _.merge(_.keyBy(data, 'locationID'), _.keyBy(groupedRes, 'locationId'));
    // const mergedValue = _.values(merged);
    // let inCommon = _.intersectionWith(mergedValue, groupedRes, (o, t) => { return o.locationID == t.locationId });
    // const values = _.values(inCommon);

    // this.totalRecord = values.length;

    // this.gridFilterData = values;
    // this.gridSumByData = this.gridFilterData;
    // this.cardTypeChange(this.cardType);
    //var $table = $('table.redesign_table');
    //$table.floatThead('reflow');
  }

  OnCheckboxTotalChange(event) {
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
    if (this.pageSyncService.LocationtotalPanel && !this.isDateApply) {
      this.Panel(this.pageSyncService.LocationtotalPanel);
    } else {
      this.isDateApply = false;
      this.totalPanelService.getTotals(objTotalPanel).subscribe(
        (res: Array<PanelRes>) => {
          this.pageSyncService.LocationtotalPanel = res;
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

      this.isLocationOpenPledgesColVisible = true;
      this.isLocationPaymentsColVisible = true;
      this.isLocationRaisedColVisible = true;
      this.isLocationScheduledColVisible = true;

      if (this.gridFilterData.length > 0) {
        this.initMultiSelect();
      } else {
        this.paymentTypeChipData = [];
        this.initMultiSelect();
      }
    } else {
      this.paymentTypeChipData = [];
      this.totalRecord = 0;
      //this.gridData = null;
      this.gridFilterData = [];
      this.gridSumByData = this.gridFilterData;
      this.initMultiSelect();
    }
    this.isinitialize = 1;
    this.isloading = false;
    this.isFiltered = false;
    this.detectChanges();
  }

  totalPanelfilterLocalData() {
    this.gridFilterData = this.gridOrgTotalPanelData.filter((o) => {
      if (!this.isFilterOpen) {
        this.objAdvancedSearch = null;
      }
    });
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var campaignLocationIds = this.GetCampaignLocation(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignLocationIds.indexOf(Number(s.locationId)) >= 0) ||
                s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.locationId == item.locationId
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonLocationIds = this.GetReasonLocation(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonLocationIds.indexOf(Number(s.locationId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var LocationIds = this.GetLocation(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                LocationIds.indexOf(Number(s.locationId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var collectorLocationIds = this.GetCollectorLocation(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.collectorIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                collectorLocationIds.indexOf(Number(s.locationId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var deviceLocationIds = this.GetDeviceLocation(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceLocationIds.indexOf(Number(s.locationId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
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
                .filter((s) => s.locationId == item.locationId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.locationId == item.locationId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var accountReasonIds = this.GetDonorLocation(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                accountReasonIds.indexOf(Number(s.locationId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.locationId == item.locationId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.locationId == item.locationId
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

  GetCampaignLocation(campaignId) {
    var campaignLocationIds = this.groupRes
      .filter((s) => s.campaignId == campaignId)
      .map((s) => s.locationId);
    campaignLocationIds = campaignLocationIds.filter(
      (n, i) => campaignLocationIds.indexOf(n) === i
    );
    return campaignLocationIds.filter((x) => x != null);
  }
  GetDeviceLocation(deviceId) {
    var deviceLocationIds = this.groupRes
      .filter((s) => s.deviceId == deviceId)
      .map((s) => s.locationId);
    deviceLocationIds = deviceLocationIds.filter(
      (n, i) => deviceLocationIds.indexOf(n) === i
    );
    return deviceLocationIds.filter((x) => x != null);
  }
  GetCollectorLocation(collectorId) {
    var collectorLocationIds = this.groupRes
      .filter((s) => s.collectorId == collectorId)
      .map((s) => s.locationId);
    collectorLocationIds = collectorLocationIds.filter(
      (n, i) => collectorLocationIds.indexOf(n) === i
    );
    return collectorLocationIds.filter((x) => x != null);
  }
  GetLocation(locationId) {
    var locationIds = this.groupRes
      .filter((s) => s.locationId == locationId)
      .map((s) => s.locationId);
    locationIds = locationIds.filter((n, i) => locationIds.indexOf(n) === i);
    return locationIds.filter((x) => x != null);
  }
  GetDonorLocation(accountId) {
    var donorLocationIds = this.groupRes
      .filter((s) => s.accountId == accountId)
      .map((s) => s.locationId);
    donorLocationIds = donorLocationIds.filter(
      (n, i) => donorLocationIds.indexOf(n) === i
    );
    return donorLocationIds.filter((x) => x != null);
  }
  GetReasonLocation(reasonId) {
    var reasonLocationIds = this.groupRes
      .filter((s) => s.reasonId == reasonId)
      .map((s) => s.locationId);
    reasonLocationIds = reasonLocationIds.filter(
      (n, i) => reasonLocationIds.indexOf(n) === i
    );
    return reasonLocationIds.filter((x) => x != null);
  }

  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbyLocation = this.cardType;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.campaignId != null && s.locationId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignLocation(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId &&
                    x.locationId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.locationId != null) ||
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
            .filter((s) => s.campaignId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.reasonId != null && s.locationId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReasonLocation(objs[0].reasonId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.reasonId == objs[0].reasonId && x.locationId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.reasonId == objs[0].reasonId && x.locationId != null
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
            .filter((s) => s.reasonId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.collectorId != null && s.locationId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetCollectorLocation(objs[0].collectorId).length,
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
            .filter((s) => s.collectorId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        var allCollectorLength = this.gridFilterData
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
          count: allCollectorLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCollectorTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.accountId != null && s.locationId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].donor,
          key: key,
          count: this.GetDonorLocation(objs[0].accountId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.accountId == objs[0].accountId && x.locationId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.accountId == objs[0].accountId && x.locationId != null
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
            .filter((s) => s.accountId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.locationId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: this.GetLocation(objs[0].locationId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.locationId == objs[0].locationId && x.locationId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.locationId == objs[0].locationId && x.locationId != null
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
            .filter((s) => s.locationId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLocationTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        this.gridFilterData = this.gridFilterData.filter(
          (s) => s.locationId != null
        );
        var allLocationLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.locationIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        //this.gridSumByData=this.gridFilterData;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Locations",
          key: -2,
          total: allTotal,
          count: allLocationLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -2,
          total: allLocationTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.deviceId != null && s.locationId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].device,
          key: key,
          count: this.GetDeviceLocation(objs[0].deviceId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.deviceId == objs[0].deviceId && x.locationId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.deviceId == objs[0].deviceId && x.locationId != null
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
            .filter((s) => s.deviceId != null && s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null && s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
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
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    this.changeSortType(this.sortType);
  }

  OpenSumCard(item) {
    if (this.isSumCardOpen) {
      this.isSumCardOpen = false;
    } else {
      this.selectedItem = false;
      this.isSumCardOpen = true;
    }
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

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "location_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      LocationFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse, true);
      }
    );
  }
  advancedFilterData(objResponse, value) {
    this.objAdvancedSearch = objResponse;
    this.isFilterOpen = true;
    if (this.isTotalPanelVisible) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      if (value == true) {
        this.showOnlyTotalData();
      }
    } else {
      if (value == true) {
        this.searchLocationData();
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  TogglePanel(isVisible) {
    this.pageSyncService.locationlistTotalPanel = isVisible;
    this.isSelected = false;
    this.recordSelectedArray = [];
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
    this.isLocationOpenPledgesColVisible = false;
    this.isLocationPaymentsColVisible = false;
    this.isLocationRaisedColVisible = false;
    this.isLocationScheduledColVisible = false;

    this.isLocationPledgesCountColVisible = false;
    this.isLocationPaymentsCountColVisible = false;
    this.isLocationScheduledCountColVisible = false;

    this.isinitialize = 0;
    this.isTotalPanelShowAll = true;
    this.gridTotalPanelData = null;
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
    //this.searchLocationData();
    this.gridData = this.gridShowPanelData;
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData?.length;
    if (this.objAdvancedSearch != null) {
      this.filterLocalData();
    }

    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }
  }

  openLocationCardPopup(locationId) {
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
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      locationId: locationId,
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
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
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
    this.locationService
      .getLocationCard(objCollectorCard)
      .subscribe((res: any) => {
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }
          modalRef.componentInstance.LocationCardData = res;
          modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
        }
      });
    this.changeDetectorRef.detectChanges();
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.locationFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    //var $table = $('table.redesign_table');
    switch (colName) {
      case "location":
        this.isLocationNameColVisible = isVisible;
        this.uiPageSetting.isLocationNameColVisible = isVisible;
        break;
      case "nusach":
        this.isLocationNusachColVisible = isVisible;
        this.uiPageSetting.isLocationNusachColVisible = isVisible;
        break;
      case "business":
        this.isLocationBusinessColVisible = isVisible;
        this.uiPageSetting.isLocationBusinessColVisible = isVisible;
        break;
      case "phone":
        this.isLocationPhoneColVisible = isVisible;
        this.uiPageSetting.isLocationPhoneColVisible = isVisible;
        break;
      case "address":
        this.isLocationAddressColVisible = isVisible;
        this.uiPageSetting.isLocationAddressColVisible = isVisible;
        break;
      case "rabbi":
        this.isLocationRabbiColVisible = isVisible;
        this.uiPageSetting.isLocationRabbiColVisible = isVisible;
        break;
      case "shortname":
        this.isLocationShortNameColVisible = isVisible;
        this.uiPageSetting.isLocationShortNameColVisible = isVisible;
        break;
      case "type":
        this.isLocationTypeColVisible = isVisible;
        this.uiPageSetting.isLocationTypeColVisible = isVisible;
        break;

      // Total Panel
      case "payments":
        this.isLocationPaymentsColVisible = isVisible;
        this.uiPageSetting.isLocationPaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isLocationOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isLocationOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isLocationScheduledColVisible = isVisible;
        this.uiPageSetting.isLocationScheduledColVisible = isVisible;
        break;
      case "total":
        this.isLocationRaisedColVisible = isVisible;
        this.uiPageSetting.isLocationRaisedColVisible = isVisible;
        break;
      case "countofpayments":
        this.isLocationPaymentsCountColVisible = isVisible;
        this.uiPageSetting.isLocationPaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isLocationPledgesCountColVisible = isVisible;
        this.uiPageSetting.isLocationPledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isLocationScheduledCountColVisible = isVisible;
        this.uiPageSetting.isLocationScheduledCountColVisible = isVisible;
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
      case "location":
        return this.isLocationNameColVisible;
      case "nusach":
        return this.isLocationNusachColVisible;
      case "business":
        return this.isLocationBusinessColVisible;
      case "phone":
        return this.isLocationPhoneColVisible;
      case "address":
        return this.isLocationAddressColVisible;
      case "rabbi":
        return this.isLocationRabbiColVisible;
      case "shortname":
        return this.isLocationShortNameColVisible;
      case "type":
        return this.isLocationTypeColVisible;
      case "payments":
        return this.isLocationPaymentsColVisible;
      case "openpledges":
        return this.isLocationOpenPledgesColVisible;
      case "scheduled":
        return this.isLocationScheduledColVisible;
      case "total":
        return this.isLocationRaisedColVisible;
      case "countofpayments":
        return this.isLocationPaymentsCountColVisible;
      case "countofpledges":
        return this.isLocationPledgesCountColVisible;
      case "countofschedules":
        return this.isLocationScheduledCountColVisible;
    }
  }

  SaveLayout() {
    let setting = {
      isLocationNameColVisible: this.isLocationNameColVisible,
      isLocationNusachColVisible: this.isLocationNusachColVisible,
      isLocationBusinessColVisible: this.isLocationBusinessColVisible,
      isLocationPhoneColVisible: this.isLocationPhoneColVisible,
      isLocationAddressColVisible: this.isLocationAddressColVisible,
      isLocationRabbiColVisible: this.isLocationRabbiColVisible,
      isLocationShortNameColVisible: this.isLocationShortNameColVisible,
      isLocationTypeColVisible: this.isLocationTypeColVisible,
      isLocationPaymentsColVisible: this.isLocationPaymentsColVisible,
      isLocationOpenPledgesColVisible: this.isLocationOpenPledgesColVisible,
      isLocationScheduledColVisible: this.isLocationScheduledColVisible,
      isLocationRaisedColVisible: this.isLocationRaisedColVisible,
      isLocationPaymentsCountColVisible: this.isLocationPaymentsCountColVisible,
      isLocationPledgesCountColVisible: this.isLocationPledgesCountColVisible,
      isLocationScheduledCountColVisible:
        this.isLocationScheduledCountColVisible,
      locationStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      locationEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      locationSumBy: this.cardType,
      locationSearchitem: this.objAdvancedSearch,
      locationIsTotalPanelVisible: this.isTotalPanelVisible,
      locationCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "locations",
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
        // var record = this.gridSumByData;
        // this.totalRecord = this.gridSumByData.length;
        // this.gridData = this.gridSumByData;
        var record = this.gridSearchFilterData;
        this.totalRecord = this.gridSearchFilterData.length;
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
            (obj.locationName &&
              obj.locationName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.locationNameJewish &&
              obj.locationNameJewish
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.nusach &&
              obj.nusach.toLowerCase().toString().indexOf(searchValue) > -1) ||
            (obj.phone &&
              obj.phone.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.city &&
              obj.city.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.state &&
              obj.state.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.country &&
              obj.country.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.zip &&
              obj.zip.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.rabbi &&
              obj.rabbi.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.locationNameShort &&
              obj.locationNameShort
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.locationType &&
              obj.locationType.toString().toLowerCase().indexOf(searchValue) >
                -1)
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
        this.gridFilterData = this.tempSearch;
        this.totalRecord = this.tempSearch.length;
      } else {
        this.filterLocalData();
        //this.gridFilterData = this.gridData;
        this.totalRecord = this.gridFilterData.length;
      }
    }
  }

  searchLocationData() {
    this.isloading = true;
    this.detectChanges();
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
    var objLocation = {
      eventGuid: this.localStorageDataService.getLoginUserEventGuId(),
      locationName:
        this.objAdvancedSearch && this.objAdvancedSearch.locationName,
      nusach: this.objAdvancedSearch && this.objAdvancedSearch.nusach,
      rabbi: this.objAdvancedSearch && this.objAdvancedSearch.rabbi,
      phone: this.objAdvancedSearch && this.objAdvancedSearch.phone,
      shortName: this.objAdvancedSearch && this.objAdvancedSearch.shortName,
      typeId:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.typeId &&
        this.objAdvancedSearch.typeId.length > 0
          ? this.objAdvancedSearch.typeId
          : null,
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
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
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
      isAll: this.showAll,
    };
    this.locationService.getLocationList(objLocation).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.objAdvancedSearch = objSearch;
          /*
        if (this.objAdvancedSearch && this.objAdvancedSearch.status) {
        } else {
          res = res.filter(x => x.status != "InActive");
        }
        */

          for (var i = 0; i < res.length; i++) {
            res[i].phone = this.formatPhoneNumber(res[i].phone);
            res[i].openPledges = 0;
            res[i].payments = 0;
            res[i].raised = 0;
            res[i].scheduled = 0;
          }
          this.gridOrgData = res;
          this.pageSyncService.locationList = this.gridOrgData;
          this.pageSyncService.isLocationListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(this.gridOrgData);
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.pageSyncService.locationList = [];
          this.gridFilterData = this.gridData;
        }
        if (this.gridFilterData == null || this.gridFilterData.length == 0) {
          this.isDisableExcel = true;
        } else {
          this.isDisableExcel = false;
        }
        this.isloading = false;
        this.commonMethodService.sendDataLoaded("location");
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
      this.totalRecord = res.length;
      this.gridData = res;
      this.gridFilterData = this.gridData;
      this.gridShowPanelData = res;
      // this.objAdvancedSearch = { status: "Active" }
      this.filterLocalData();
      this.gridData = this.gridFilterData;
    }
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.showAll = true;
      this.isDisable = true;
      this.disableTitle = "Turn off All Locations";
      this.searchLocationData();
    } else {
      this.showAll = false;
      this.isDisable = false;
      this.disableTitle = "";
      this.searchLocationData();
    }
  }

  // onResize(event) {
  // var innerWidth=event.target.innerWidth;
  // if(innerWidth==1366)
  //     this.rowCount=10;
  // if(innerWidth==2732)
  //     this.rowCount=18;
  // if(innerWidth==4098)
  //     this.rowCount=25;
  // if(innerWidth==5464)
  //     this.rowCount=35;
  // }

  downloadExcel() {
    this.isloading = true;
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let location = item && item.locationName;
        let locationJewish = item && item.locationNameJewish;
        let nusach = item && item.nusach;
        let phone = item && item.phone;
        let locationType = item && item.locationType;
        let address = item && item.address;
        let rabbi = item && item.rabbi;
        let locationNameShort = item && item.locationNameShort;

        let row = {};
        if (this.isLocationNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LOCATION")
            : "Location";
          row[ColName] = location;
        }
        if (this.isLocationNameColVisible) {
          row["Location Jewish"] = locationJewish;
        }
        if (this.isLocationNusachColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NUSACH")
            : "Nusach";
          row[ColName] = nusach;
        }
        if (this.isLocationAddressColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ADDRESS")
            : "Address";
          row[ColName] =
            item.address +
            "," +
            item.city +
            "," +
            item.state +
            "," +
            item.country +
            "," +
            item.zip;
        }
        if (this.isLocationRabbiColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("RABBI")
            : "Rabbi";
          row[ColName] = rabbi;
        }
        if (this.isLocationPhoneColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PHONE")
            : "Phone";
          row[ColName] = phone;
        }
        if (this.isLocationShortNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SHORTNAME")
            : "Short Name";
          row[ColName] = locationNameShort;
        }
        if (this.isLocationTypeColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TYPE")
            : "Type";
          row[ColName] = locationType;
        }
        // Total Panel
        if (this.isLocationPaymentsColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTS")
            : "Payments";
          row[ColName] = Number(item.payments);
        }
        if (this.isLocationPaymentsCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
            : "Count Of Payments";
          row[ColName] = item.paymentsCount;
        }
        if (this.isLocationOpenPledgesColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("OPENPLEDGES")
            : "Open Pledges";
          row[ColName] = Number(item.openPledges);
        }
        if (this.isLocationPledgesCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPLEDGES")
            : "Count Of Pledges";
          row[ColName] = item.pledgesCount;
        }
        if (this.isLocationScheduledColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULED")
            : "Scheduled";
          row[ColName] = Number(item.scheduled);
        }
        if (this.isLocationScheduledCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
            : "Count Of Schedules";
          row[ColName] = item.schedulesCount;
        }
        if (this.isLocationRaisedColVisible) {
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

    const filename = this.xlsxService.getFilename("Location List");
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
      if (this.objAdvancedSearch.reasonId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.reasonId.map((x) => x.id).includes(f.reasonId)
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
      this.isContain(o.locationName, this.objAdvancedSearch.locationName) &&
      this.isContain(o.nusach, this.objAdvancedSearch.nusach) &&
      this.isContain(o.phone, this.objAdvancedSearch.phone) &&
      this.isContain(o.rabbi, this.objAdvancedSearch.rabbi) &&
      this.isContain(o.rabbi, this.objAdvancedSearch.rabbi) &&
      this.isContain(o.locationNameShort, this.objAdvancedSearch.shortName) &&
      this.filterLocationType(o)
    );
  }

  filterLocationType(o) {
    if (
      !this.objAdvancedSearch.typeId ||
      this.objAdvancedSearch.typeId.length === 0
    ) {
      return true;
    }

    if (!o.locationTypeID) {
      return false;
    }
    const result = this.objAdvancedSearch.typeId.find(
      (t) => t.id == o.locationTypeID
    );
    if (result) {
      return true;
    }
  }
  onBulkCustomReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkCustomReportComponent,
      this.modalOptions
    );

    modalRef.componentInstance.SelectedDateRange = this.selectedDateRange;
    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
  }
  selectRecord(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.locationID);
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
        if (this.recordSelectedArray.length > 1) {
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == accountId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
        }
      }
    }
  }
  checkselectRecord(accountId): Boolean {
    return this.recordSelectedArray.includes(accountId);
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "locationDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "LocationList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.LocationCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.LocationEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (
            this.pageSyncService.uiPageSettings["locationList"] != undefined
          ) {
            this.pageSyncService.uiPageSettings[
              "locationList"
            ].locationCalendarPlaceHolderId =
              this.hebrewEngishCalendarService.id;
          }
          this.isDateApply = true;
          this.getTotalPanel();
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
